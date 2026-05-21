# Preview Container Image - Unified Build
# Supports production, local baked, and local mount modes.
#
# Build Args:
#   BUILD_MODE=production (default)      - Agent cloned at BUILD TIME from GitLab
#   BUILD_MODE=local                     - Agent copied from .build-context/
#   BUILD_MODE=local-mount               - Agent mounted at RUNTIME (only pip deps installed)
#   GITLAB_LPS_AGENT_API_TOKEN (required for production) - Token to clone agent repo
#   LPS_AGENT_BRANCH (default: main)     - Branch to clone from agent repo
#
# Usage:
#   Production:    docker build --build-arg GITLAB_LPS_AGENT_API_TOKEN=$TOKEN -t preview:latest .
#   Local (baked): docker build --build-arg BUILD_MODE=local -t preview:local .
#                  (run 'make build-local' which handles copying agent files)
#   Local (mount): docker build --build-arg BUILD_MODE=local-mount -t preview:local .
#                  (run 'make build-local' — agent dir mounted at runtime via Docker bind mount)
#
# NOTE: For local-mount mode, agent code is NOT in the image. It is bind-mounted
# from the host at /opt/agent_daemon when the container is started.
# CI/CD triggers ensure image is rebuilt when agent code changes.
# Cache bust: 2026-02-11-force-agent-rebuild
FROM node:22-alpine

# Build mode: production (runtime clone) or local (build-time copy)
ARG BUILD_MODE=production

# Use faster Alpine mirror and install required packages (Alpine 3.21 - latest stable)
# Python 3.13 is available in Alpine 3.21+
# rclone is used for uploading static builds to GCS (container-based publish)
RUN echo "https://mirror.leaseweb.com/alpine/v3.21/main" > /etc/apk/repositories && \
    echo "https://mirror.leaseweb.com/alpine/v3.21/community" >> /etc/apk/repositories && \
    apk add --no-cache git curl python3 py3-pip supervisor sudo rclone || \
    (sleep 5 && apk add --no-cache git curl python3 py3-pip supervisor sudo rclone)

# Use npm bundled with Node 22 (10.x) — avoid `npm@latest` which can
# pull broken releases and break CI (e.g. missing promise-retry module).
# npm 10.x supports everything we need (npm ci, workspaces, etc.).

# Pin setuptools <81 to prevent supervisor pkg_resources deprecation warning
RUN pip3 install --break-system-packages --no-cache-dir 'setuptools<81'

# Create workspace directory
WORKDIR /workspace

# Copy package files first (for layer caching)
# IMPORTANT: Both files needed for reproducible installs with npm ci
COPY package.json package-lock.json ./

# Install Node.js dependencies with exact versions from lock file
# Using npm ci for reproducible builds (requires package-lock.json)
RUN npm ci && npm cache clean --force

# Extract all valid lucide-react icon names for agent validation
# This runs once at build time and is cached unless package.json changes
RUN LUCIDE_VERSION=$(node -p "require('lucide-react/package.json').version") && \
    mkdir -p /workspace/.cache && \
    node -e "console.log(Object.keys(require('lucide-react')).filter(k => k[0] === k[0].toUpperCase() && typeof require('lucide-react')[k] === 'object').sort().join('\n'))" \
    > /workspace/.cache/lucide-icons-v${LUCIDE_VERSION}.txt && \
    ln -sf lucide-icons-v${LUCIDE_VERSION}.txt /workspace/.cache/lucide-icons.txt && \
    echo "Generated icon list for lucide-react v${LUCIDE_VERSION} ($(wc -l < /workspace/.cache/lucide-icons.txt) icons)"

# Copy .build-context for local builds (contains agent requirements.txt)
# This step is a no-op if .build-context doesn't exist (production builds)
COPY .build-context* .build-context/

# Install Python packages for agent daemon
# CACHING OPTIMIZATION: Fetch and install requirements BEFORE cloning full agent code
# This allows pip layer to be cached unless requirements.txt actually changes
# - Local builds: Uses .build-context/agent_daemon/requirements.txt (copied by Makefile)
# - Production builds: Fetches from GitLab API (requires GITLAB_LPS_AGENT_API_TOKEN build arg)
ARG GITLAB_LPS_AGENT_API_TOKEN
ARG LPS_AGENT_BRANCH=main
ARG LPS_AGENT_COMMIT_SHA
RUN --mount=type=cache,target=/root/.cache/pip \
    if ([ "$BUILD_MODE" = "local" ] || [ "$BUILD_MODE" = "local-mount" ]) && [ -f ".build-context/agent_daemon/requirements.txt" ]; then \
        echo "📦 [LOCAL] Installing Python packages from .build-context/agent_daemon/requirements.txt..."; \
        cat .build-context/agent_daemon/requirements.txt; \
        pip3 install --break-system-packages -r .build-context/agent_daemon/requirements.txt; \
    elif [ -n "$GITLAB_LPS_AGENT_API_TOKEN" ]; then \
        echo "📦 [PRODUCTION] Fetching requirements.txt from GitLab..."; \
        AGENT_REPO_URL="https://gitlab.com/api/v4/projects/LinkLabs%2Flanding-page-studio%2Flanding-page-studio-agent/repository/files/requirements.txt/raw"; \
        BRANCH_TO_USE="${LPS_AGENT_BRANCH}"; \
        echo "   Trying branch: ${BRANCH_TO_USE}"; \
        if ! curl -sSf --header "PRIVATE-TOKEN: ${GITLAB_LPS_AGENT_API_TOKEN}" \
            "${AGENT_REPO_URL}?ref=${BRANCH_TO_USE}" \
            -o /tmp/agent-requirements.txt 2>/dev/null; then \
            echo "   ⚠️  Branch '${BRANCH_TO_USE}' not found in agent repo, falling back to 'main'"; \
            BRANCH_TO_USE="main"; \
            curl -sSf --header "PRIVATE-TOKEN: ${GITLAB_LPS_AGENT_API_TOKEN}" \
                "${AGENT_REPO_URL}?ref=${BRANCH_TO_USE}" \
                -o /tmp/agent-requirements.txt || \
                { echo "❌ Failed to fetch requirements.txt from GitLab"; exit 1; }; \
        fi; \
        echo "   ✅ Using requirements from branch: ${BRANCH_TO_USE}"; \
        echo "📋 Requirements to install:"; \
        cat /tmp/agent-requirements.txt; \
        pip3 install --break-system-packages -r /tmp/agent-requirements.txt; \
        rm /tmp/agent-requirements.txt; \
        echo "✅ Python packages installed from GitLab"; \
    else \
        echo "❌ ERROR: No source for Python requirements!"; \
        echo "   For local builds: Run 'make build-local' (copies agent to .build-context/)"; \
        echo "   For production: Pass --build-arg GITLAB_LPS_AGENT_API_TOKEN=<token>"; \
        exit 1; \
    fi

# Copy configuration files (before switching to non-root user)
COPY supervisord.conf /etc/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create non-root user (security: run as non-root)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy complete boilerplate
# CRITICAL: COPY --chown ensures files are owned by nodejs from the start
COPY --chown=nodejs:nodejs . .

# Remove .git if present (belt-and-suspenders with .dockerignore)
# .dockerignore should exclude .git, but this ensures clean slate for customer repos
# Note: .git could be a file (submodule pointer) or directory
RUN rm -rf /workspace/.git

# Copy Python initialization system (after main copy to ensure correct ownership)
# This provides robust container initialization with:
# - Safe volume mount handling
# - Git clone with validation  
# - npm clean install
# - Pre-flight health checks
COPY --chown=nodejs:nodejs .boilerplate /workspace/.boilerplate

# Clone/Copy agent daemon to SYSTEM LOCATION at BUILD TIME
# Agent lives in /opt/agent_daemon (immutable system code)
# Symlink created at /workspace/agent_daemon for Python imports
#
# Why /opt instead of /workspace?
# - agent_daemon is gitignored - customer repos never have it
# - No backup/restore needed during customer repo clone
# - Agent code is immutable (can't be accidentally modified)
# - Cleaner separation: system code (/opt) vs user code (/workspace)
#
# NOTE: CI/CD triggers ensure image is rebuilt when agent code changes.
# Cache invalidation: Agent commit SHA changes force fresh clone
RUN echo "🔄 Agent commit SHA: ${LPS_AGENT_COMMIT_SHA:-unknown}" && \
    echo "   This ensures fresh agent clone on new commits"

RUN if [ "$BUILD_MODE" = "local-mount" ]; then \
        echo "📂 BUILD_MODE=local-mount: Creating mount point at /opt/agent_daemon..."; \
        mkdir -p /opt/agent_daemon; \
        chown -R nodejs:nodejs /opt/agent_daemon; \
        rm -rf .build-context; \
        echo "✅ Mount point created — agent_daemon will be bind-mounted at runtime"; \
    elif [ "$BUILD_MODE" = "local" ] && [ -d ".build-context/agent_daemon" ]; then \
        echo "📦 BUILD_MODE=local: Copying agent to /opt/agent_daemon..."; \
        mkdir -p /opt/agent_daemon; \
        cp -r .build-context/agent_daemon/* /opt/agent_daemon/; \
        chown -R nodejs:nodejs /opt/agent_daemon; \
        rm -rf .build-context; \
        echo "✅ Local agent daemon installed to /opt/agent_daemon"; \
    elif [ "$BUILD_MODE" = "local" ]; then \
        echo "❌ ERROR: BUILD_MODE=local but .build-context/agent_daemon not found!"; \
        echo "   This means Makefile didn't copy local files correctly."; \
        echo "   Run: make build-local (which handles copying)"; \
        exit 1; \
    elif [ -n "$GITLAB_LPS_AGENT_API_TOKEN" ]; then \
        echo "🌐 BUILD_MODE=production: Cloning agent to /opt/agent_daemon..."; \
        echo "   Branch: ${LPS_AGENT_BRANCH}"; \
        CLONE_START=$(date +%s); \
        git clone --depth 1 --branch ${LPS_AGENT_BRANCH} \
            https://oauth2:${GITLAB_LPS_AGENT_API_TOKEN}@gitlab.com/LinkLabs/landing-page-studio/landing-page-studio-agent.git \
            /opt/agent_daemon 2>&1 | grep -v "oauth2" || \
            { echo "❌ Failed to clone agent repo"; exit 1; }; \
        CLONE_END=$(date +%s); \
        echo "   ✅ Clone completed in $((CLONE_END - CLONE_START))s"; \
        rm -rf /opt/agent_daemon/.git; \
        chown -R nodejs:nodejs /opt/agent_daemon; \
        AGENT_FILES=$(ls -1 /opt/agent_daemon/*.py 2>/dev/null | wc -l); \
        echo "   ✅ Agent daemon installed ($AGENT_FILES Python files)"; \
        rm -rf .build-context 2>/dev/null || true; \
    else \
        echo "❌ ERROR: No source for agent daemon!"; \
        echo "   For local builds: Run 'make build-local'"; \
        echo "   For production: Pass --build-arg GITLAB_LPS_AGENT_API_TOKEN=<token>"; \
        exit 1; \
    fi

# Create symlink from workspace to system agent location
# This allows Python imports to work: python3 -m agent_daemon.agent_daemon
# The symlink points to immutable /opt/agent_daemon
RUN ln -s /opt/agent_daemon /workspace/agent_daemon && \
    echo "✅ Symlink created: /workspace/agent_daemon -> /opt/agent_daemon"

# CRITICAL: Change ownership of /workspace directory and node_modules to nodejs user
# This allows nodejs user to:
# - Create new directories like 'dist/' during build
# - Write to node_modules/.vite/ for Vite caching
RUN chown nodejs:nodejs /workspace && \
    chown -R nodejs:nodejs /workspace/node_modules

# Pre-create .vite cache directory with correct ownership (Vite needs to write here)
RUN mkdir -p /workspace/node_modules/.vite && \
    chown -R nodejs:nodejs /workspace/node_modules/.vite

# Verify ownership is correct
RUN ls -la /workspace | head -5 && \
    ls -la /workspace/node_modules | head -3 && \
    echo "✅ Workspace directory and node_modules owned by nodejs"

# Suppress browserslist stale-data error during npm run build.
# caniuse-lite is installed at image build time and grows stale over months.
# Without this, browserslist exits non-zero when data is >6 months old,
# failing every publish even when the site code itself is valid.
ENV BROWSERSLIST_IGNORE_OLD_DATA=1

# NOTE: We intentionally DO NOT run `npm run build` during image build.
# Reason: The agent regenerates ALL code from scratch for each customer.
# The boilerplate's pre-built output would be immediately overwritten.
# This saves 15-30s per image build and reduces image size.
# Static builds happen on-demand via `build_and_publish` message when user requests it.

# Configure git to trust workspace (fixes dubious ownership error)
RUN git config --system --add safe.directory /workspace || true

# Configure sudo for nodejs user (for permission fixes, cleanup, and supervisord)
RUN echo "nodejs ALL=(ALL) NOPASSWD: /bin/chown" >> /etc/sudoers && \
    echo "nodejs ALL=(ALL) NOPASSWD: /bin/rm" >> /etc/sudoers && \
    echo "nodejs ALL=(ALL) NOPASSWD: /bin/mkdir" >> /etc/sudoers && \
    echo "nodejs ALL=(ALL) NOPASSWD: /usr/bin/supervisord" >> /etc/sudoers

# Environment variables for container runtime
# NOTE: GITLAB_LPS_AGENT_API_TOKEN and LPS_AGENT_BRANCH are BUILD-TIME args only,
# not needed at runtime since agent is baked into the image.
ENV JWT_SECRET="development-secret-key-change-in-production"
ENV OPENROUTER_API_KEY=""
ENV GITLAB_TOKEN=""
# GCS credentials for container-based static site publishing
# These are set at runtime by container_config.py
ENV GCS_SERVICE_ACCOUNT_KEY=""
ENV GCS_STATIC_SITES_BUCKET=""

# Switch to non-root user (must be last, after all root operations)
USER nodejs

# Container startup command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

