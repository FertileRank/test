# CLAUDE.md

## Project Overview

This repository contains a single-page static HTML site for **RSC Fertility (Reproductive Specialists of the Carolinas)** — a fertility clinic based in Charlotte, NC. The page is an SEO-optimized blog/landing page covering a WSOC-TV feature story about a patient's infertility journey and the importance of choosing the right fertility doctor.

**Live URL:** `https://fertilitycarolinas.com/blog/wsoc-feature-story-mom-says-infertility-showed-her-the-importance-of-having-the-right-doctor`

## Repository Structure

```
/
├── index.html      # The entire site — HTML, CSS, and JS in a single file (~1042 lines)
└── CLAUDE.md       # This file
```

This is a **self-contained single-file project**. All markup, styles, and scripts live in `index.html`. There are no build tools, package managers, bundlers, or external dependencies.

## Technology Stack

- **HTML5** — Semantic elements (`<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`)
- **CSS3** — Custom properties, Grid, Flexbox, transitions; all embedded in a `<style>` block
- **Vanilla JavaScript** — Minimal (~12 lines); FAQ accordion toggle and mobile menu
- **No frameworks or libraries** — No React, Vue, jQuery, Bootstrap, Tailwind, etc.
- **System fonts only** — Georgia (headings), Segoe UI/Helvetica Neue/Arial (body); no web font downloads

## File Architecture (index.html)

The file is organized in this order:

| Section | Lines (approx.) | Description |
|---------|-----------------|-------------|
| `<head>` | 1–190 | Meta tags, SEO, Open Graph, Twitter Cards, JSON-LD schema, embedded CSS |
| CSS (in `<style>`) | ~30–190 | Design system with custom properties, responsive layout, component styles |
| `<nav>` | Sticky header | Logo, navigation links, mobile hamburger toggle |
| Breadcrumbs | After nav | Schema-aware breadcrumb trail |
| Hero | Main heading | Title, badge ("Featured on WSOC-TV"), subtitle, metadata |
| Article body | Core content | Educational sections, patient story, checklists, statistics |
| FAQ | Accordion | 5 collapsible Q&A items |
| Related articles | Card grid | 3 linked blog post cards |
| CTA | Dark section | Call-to-action with consultation booking |
| `<footer>` | End | Company info, link groups, copyright |
| `<script>` | Final lines | FAQ toggle and mobile menu JS |

## CSS Design System

Custom properties are defined in `:root`:

```css
--coral: #E8734A          /* Primary brand color */
--coral-dark: #D4623B     /* Hover/dark variant */
--coral-light: #FFF5F0    /* Light tint backgrounds */
--charcoal: #2D2D2D       /* Primary text */
--gray-*                  /* Gray scale for borders, muted text, backgrounds */
--accent-gold: #C9975C    /* Accent color */
--soft-pink: #FEF0EC      /* Soft background accent */
--font-heading: Georgia, 'Times New Roman', serif
--font-body: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif
```

**Responsive breakpoint:** `@media (max-width: 768px)` — single breakpoint for mobile adaptations.

## SEO & Structured Data

The page has extensive SEO optimization:

- **JSON-LD schemas:** Organization, MedicalWebPage, Article, FAQPage, BreadcrumbList
- **Meta tags:** Title, description, keywords, Open Graph, Twitter Card
- **Canonical URL** set
- **Medical content reviewed by** Dr. Matrika Johnson (Reproductive Endocrinologist)
- **External citations** link to WHO, CDC, ACOG, SART, RESOLVE with `rel="noopener" target="_blank"`

## Key Conventions

### When editing this project:

1. **Keep everything in `index.html`** — Do not split into separate CSS/JS files unless the project scope significantly expands.
2. **Preserve the CSS custom property system** — Use existing `--var` tokens for colors, fonts, and spacing rather than hardcoding values.
3. **Maintain semantic HTML** — Use proper heading hierarchy (h1 > h2 > h3), semantic elements, and ARIA attributes.
4. **Preserve SEO elements** — When modifying content, update the corresponding JSON-LD schema, meta tags, and Open Graph tags to stay in sync.
5. **Keep accessibility intact** — Maintain `aria-label`, `aria-expanded`, `role` attributes, and semantic structure.
6. **External links must use** `rel="noopener" target="_blank"` for security.
7. **Internal links** point to `https://fertilitycarolinas.com/...` paths.
8. **Mobile-first awareness** — Test changes against the 768px breakpoint; the mobile hamburger menu is toggled via `.nav-toggle` / `.nav-links.active`.

### Content guidelines:

- This is **medical content** — accuracy and sensitivity are critical.
- A medical disclaimer section exists and should be preserved.
- Patient stories reference real people (e.g., Brennan Moreno) — handle with care.
- Statistics should cite authoritative sources (WHO, CDC, ACOG).

## Development Workflow

There is **no build step**. To work on this project:

1. Open `index.html` directly in a browser, or use a local HTTP server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```
2. Edit the file and refresh the browser.
3. Validate HTML at https://validator.w3.org/ if making structural changes.
4. Test responsive behavior at 768px breakpoint width.
5. Verify JSON-LD schema at https://search.google.com/test/rich-results if modifying structured data.

## Testing Checklist

Before committing changes:

- [ ] Page renders correctly at desktop width (>768px)
- [ ] Page renders correctly at mobile width (<=768px)
- [ ] FAQ accordion expand/collapse works
- [ ] Mobile hamburger menu toggles navigation
- [ ] All internal links point to valid `fertilitycarolinas.com` paths
- [ ] External links open in new tabs (`target="_blank"`)
- [ ] JSON-LD schema is valid JSON and matches page content
- [ ] Meta description stays under 160 characters
- [ ] Heading hierarchy is correct (single h1, logical h2/h3 nesting)
- [ ] No console errors in browser DevTools
