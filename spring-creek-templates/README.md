# SpringCreek Fertility — Landing Page Templates

Two distinct, fully responsive landing-page templates cloned from the
[SpringCreek Fertility](https://www.springcreekfertility.com/) brand identity:
a calm, compassionate palette of **cream, sky blue, soft green, and deep navy**,
with **Lora** (serif headings) and **Open Sans** (body) typography.

## Files

| File | Format | Use case |
| --- | --- | --- |
| `version-1-static.html` | Single self-contained HTML5 file with embedded CSS/JS | Drop-in static hosting, quick preview, standalone landing page |
| `version-2-elementor.html` | Modular HTML/CSS snippet (no `<html>/<head>/<body>` wrappers) | Paste into an Elementor **HTML** or **Custom Code** widget in WordPress |

## Shared structure

- **Header / top bar** — logo placeholder, navigation, click-to-call phone, CTA
- **Hero** — patient-focused headline, supportive subheadline, and a high-converting
  lead capture form (**Name, Email, Phone, Preferred Location**)
- **Value proposition** — 3-column grid: Personalized Care, High Success Rates, Expert Team
- **Social proof** — trust badges + auto-rotating testimonial carousel
- **Final CTA** and **footer** — contact info, privacy/legal links, copyright

## Version 2 (Elementor) notes

- Every class is namespaced with **`.scf-lp-`** and all rules are scoped under the
  `.scf-lp` wrapper to prevent CSS bleed / conflicts with the active WordPress theme.
- Images and avatars use **replaceable placeholder URLs** (`via.placeholder.com`) —
  swap them for real brand assets.
- The inner width wrapper respects Elementor's default container padding.
- Replace the form `action` with your real endpoint (Jotform, Gravity Forms, etc.).

Both versions use semantic HTML5, CSS Flexbox/Grid, and media queries for full
mobile responsiveness.
