#!/bin/sh
# =============================================================================
# Container Entrypoint - Minimal Bootstrap
# =============================================================================
# 
# This entrypoint does minimal setup then hands off to Python for robust
# initialization. The Python initializer handles:
#   - Volume mount detection and safe handling
#   - Customer repository cloning with validation
#   - npm dependency installation with clean state
#   - Pre-flight health checks
#   - Starting supervisord
#
# See: .boilerplate/ for the Python initialization system
# =============================================================================

set -e

START_TIME=$(date +%s%3N)
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║  Landing Page Studio - Container Bootstrap                           ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "[Bootstrap] ⏱️  Started at $(date '+%Y-%m-%d %H:%M:%S')"
echo "[Bootstrap] 👤 User: $(whoami)"
echo "[Bootstrap] 📂 Workspace: /workspace"
echo ""

# =============================================================================
# Step 1: Minimal Permission Fixes (required before Python can run properly)
# =============================================================================
echo "[Bootstrap] 🔐 Fixing base permissions..."

# Ensure /workspace is writable
WORKSPACE_OWNER=$(stat -c '%U' /workspace 2>/dev/null || echo "unknown")
if [ "$WORKSPACE_OWNER" != "nodejs" ]; then
    sudo chown nodejs:nodejs /workspace 2>/dev/null || true
fi

# Ensure dist volume mount is accessible (if exists)
if [ -d "/workspace/dist" ]; then
    sudo chown -R nodejs:nodejs /workspace/dist 2>/dev/null || true
fi

echo "[Bootstrap] ✅ Base permissions ready"
echo ""

# =============================================================================
# Step 2: Verify Python Initializer Exists
# =============================================================================
echo "[Bootstrap] 🐍 Checking Python initializer..."

INIT_SCRIPT="/workspace/.boilerplate/init_container.py"

if [ -f "$INIT_SCRIPT" ]; then
    echo "[Bootstrap] ✅ Found Python initializer"
else
    echo "[Bootstrap] ❌ Python initializer not found!"
    echo "[Bootstrap]    Expected: $INIT_SCRIPT"
    echo "[Bootstrap]    Falling back to legacy shell initialization..."
    
    # Fallback: Run supervisord directly (basic functionality)
    exec supervisord -c /etc/supervisord.conf
fi

# =============================================================================
# Step 3: Create .env file for Vite
# =============================================================================
# Vite only reads VITE_* variables from .env files, NOT from shell environment.
# We write shell env vars to .env so Vite can expose them to client-side code.
echo "[Bootstrap] 📝 Creating .env file for Vite..."

ENV_FILE="/workspace/.env"
: > "$ENV_FILE"  # Create/truncate file

# Write VITE_* environment variables to .env file
if [ -n "$VITE_FORM_SUBMIT_URL" ]; then
    echo "VITE_FORM_SUBMIT_URL=$VITE_FORM_SUBMIT_URL" >> "$ENV_FILE"
    echo "[Bootstrap]   ✅ VITE_FORM_SUBMIT_URL=$VITE_FORM_SUBMIT_URL"
else
    echo "[Bootstrap]   ⚠️  VITE_FORM_SUBMIT_URL not set (forms will use relative URLs)"
fi

# Expose BUILDER_ENVIRONMENT to Vite client (dev/staging/prod)
if [ -n "$BUILDER_ENVIRONMENT" ]; then
    echo "VITE_BUILDER_ENVIRONMENT=$BUILDER_ENVIRONMENT" >> "$ENV_FILE"
    echo "[Bootstrap]   ✅ VITE_BUILDER_ENVIRONMENT=$BUILDER_ENVIRONMENT"
else
    echo "VITE_BUILDER_ENVIRONMENT=development" >> "$ENV_FILE"
    echo "[Bootstrap]   ⚠️  BUILDER_ENVIRONMENT not set, defaulting to development"
fi

# Expose UPLOAD_TYPE to Vite client (react_source | static_html | static_zip | "")
# Used by main.tsx to widen the blank-root watchdog for upload projects whose
# cold-start first-paint exceeds the AI-generated default budget.
echo "VITE_UPLOAD_TYPE=${UPLOAD_TYPE:-}" >> "$ENV_FILE"
if [ -n "$UPLOAD_TYPE" ]; then
    echo "[Bootstrap]   ✅ VITE_UPLOAD_TYPE=$UPLOAD_TYPE"
fi

# Ensure file is readable by nodejs user
chmod 644 "$ENV_FILE" 2>/dev/null || true
echo "[Bootstrap] ✅ .env file ready"
echo ""

# =============================================================================
# Step 4: Set Environment for Python
# =============================================================================
# Keep existing PROJECT_ID if set, otherwise fallback to CONTAINER_PROJECT_ID
export PROJECT_ID="${PROJECT_ID:-${CONTAINER_PROJECT_ID:-}}"
export WORKSPACE_PATH="/workspace"
export DEBUG="${DEBUG:-false}"

# Ensure Python output is unbuffered (immediate logging)
export PYTHONUNBUFFERED=1

# =============================================================================
# Step 5: Hand Off to Python Initializer
# =============================================================================
END_TIME=$(date +%s%3N)
BOOTSTRAP_DURATION=$((END_TIME - START_TIME))

echo ""
echo "[Bootstrap] ⏱️  Bootstrap completed in ${BOOTSTRAP_DURATION}ms"
echo "[Bootstrap] 🐍 Handing off to Python initializer..."
echo ""
echo "=============================================================================="
echo ""

# Run Python initializer
# It will exec supervisord at the end, replacing this process
cd /workspace
export PYTHONPATH="/workspace:$PYTHONPATH"
exec python3 /workspace/.boilerplate/init_container.py
