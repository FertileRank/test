# Styling Modernization & Placeholder Image Prompts

**Date:** 2026-06-07 · **Scope:** all 51 pages (via shared `assets/styles.css`) + per-page placeholder images.

## 1. Red backgrounds removed
The site had no literal `#FF0000`; the reddish accent was the **coral** family. Changes in `assets/styles.css`:
- `.section.coral` background `#f6e6e2` (pink) → **`#f8f9fa`** (neutral light gray).
- Process step-number circles `background:var(--coral)` (pink) → **brand blue `var(--blue)` with white numerals** (cleaner, higher contrast).
- Result: **no `var(--coral)` background remains in use** anywhere on the site.

## 2. Hero sections standardized & vertically centered (priority)
For both `.hero` (interior pages) and `.pillar-hero` (homepage):
- `align-items:end` → **`align-items:center`** (content now vertically centered in the hero).
- Asymmetric padding (`118px 0 74px` / `120px 0 84px`) → **balanced `96px 0`** (and symmetric values at every breakpoint).
- Behavior is now identical and balanced across the entire site.

## 3. Structure & readability polish (shared CSS)
- **Anchor offset:** `scroll-margin-top:96px` on `[id]` targets so in-page links (e.g., `#services`) no longer hide under the sticky header — better user flow.
- **Lede contrast:** body ledes darkened from `--muted` to `--body` for readability (hero ledes stay white).
- **Card interactivity:** subtle hover lift + brand-blue border on `.card` / `.related` / TOC links.
- Heading hierarchy reviewed and already sound (one `H1` per page → `H2` sections → `H3` subsections).

## 4. Placeholder images
- New reusable component: `.media-placeholder` (neutral dashed frame, 16:9, labeled "Image placeholder").
- A contextual placeholder was inserted **immediately after the hero on 46 pages**, each preceded by an HTML comment containing a ready-to-use **Midjourney/DALL-E prompt** (`AI image prompt: "… --ar 16:9"`).
- **The 5 physician bios were skipped** — they already use real headshots. (For those, use each doctor's professional headshot, not a generated image.)
- Every prompt ends with a shared style suffix: *"soft natural light, modern and hopeful, professional photography, clean, diverse and inclusive --ar 16:9"*.

### Per-page image prompts
| Page | Prompt subject (append the style suffix + `--ar 16:9`) |
|---|---|
| Home `/` | A warm, hopeful family moment in a bright modern home, conveying the start of a fertility journey |
| `/ivf/` | A serene modern IVF laboratory with an embryologist at a microscope, advanced and precise |
| `/iui/` | A reassuring consultation between a patient and a fertility nurse in a calm, bright clinic room |
| `/egg-freezing/` | A confident young professional looking ahead by a sunlit window, symbolizing fertility preservation |
| `/donor-egg-ivf/` | Joyful intended parents tenderly holding a newborn at home |
| `/pgt-a/` | A clean close-up of embryology lab work, a microscope and petri dish, scientific and calm |
| `/lgbtq-fertility/` | A happy LGBTQ+ couple with their young child in a sunlit park, inclusive and loving |
| `/male-infertility/` | A thoughtful man in a respectful, supportive consultation with a physician |
| `/fertility-testing/` | A clinician reviewing test results with a patient on a tablet, clear and reassuring |
| `/pcos-and-fertility/` | A supportive doctor-patient conversation about PCOS in a calm clinic, informative |
| `/egg-donation/` | A bright, friendly portrait of a healthy young adult egg donor, hopeful |
| `/gestational-carrier/` | A pregnant gestational carrier smiling with intended parents, joyful and trusting |
| `/ovulation-induction/` | A calm clinical setting with fertility medication and a monitoring ultrasound screen |
| `/fertility-surgery/` | A modern, well-lit operating suite with a focused, calm surgical team |
| `/era-testing/` | A clinician analyzing a uterine-lining ultrasound on a monitor, precise and modern |
| `/single-parent-fertility/` | A single parent joyfully holding their baby at home, warm and empowering |
| `/fertility-diet-and-nutrition/` | A colorful, healthy balanced meal with vegetables and whole grains, top-down view |
| `/fertility-guide/` | An open fertility guide and notebook on a tidy desk with soft light, informative |
| `/about/` | A welcoming fertility clinic care team in a bright Troy, Michigan office, trustworthy |
| `/treatments/` | A caring clinician beside a clean overview of fertility care options, modern and organized |
| `/faq/` | A friendly patient coordinator answering questions at a bright clinic reception, approachable |
| `/insurance/` | A financial counselor calmly reviewing insurance paperwork with a patient at a desk |
| `/financing/` | A couple reviewing a financing plan with a counselor at a desk, reassuring |
| `/financial-assistance/` | A supportive counselor helping a patient plan fertility-care costs, hopeful |
| `/grants/` | A hopeful couple reading about a fertility grant together, bright and optimistic |
| `/ivf-medication-savings/` | A pharmacist kindly explaining fertility medication options to a patient |
| `/troy-fertility-clinic/` | The clean exterior of a modern fertility clinic building in Troy, Michigan, daytime |
| `/livonia-fertility-clinic/` | A bright, modern medical building entrance representing a new Livonia clinic |
| `/ivf-ohio/` | A welcoming Michigan fertility clinic with travel-friendly access from Ohio, warm |
| `/out-of-town-patients/` | A traveler with a small suitcase arriving at a welcoming clinic, accommodating |
| `/clinical-team/` | A coordinated team of fertility nurses and care coordinators, caring and professional |
| `/lab-team/` | Embryologists working precisely in a modern IVF laboratory, scientific and clean |
| `/advanced-practice-providers/` | A nurse practitioner meeting warmly with a patient in a bright clinic |
| `/patient-services/` | A friendly patient-services coordinator with a headset assisting patients, welcoming |
| `/morning-monitoring/` | An early-morning ultrasound monitoring visit in a calm clinic, gentle light |
| `/resources/` | A tidy desk with patient resources, a tablet, and a fertility guide, organized |
| `/patient-portal/` | A patient using a secure health portal on a laptop at home, clean modern interface |
| `/forms/` | Neatly organized intake forms and a modern pen on a clean clinic desk, top-down view |
| `/appointments/` | A welcoming clinic reception desk with a calendar, inviting and organized |
| `/billpay/` | A secure online bill-pay screen on a laptop with a card nearby, clean and trustworthy |
| `/business-office/` | A professional, friendly medical business office, organized and calm |
| `/careers/` | A diverse, smiling healthcare team collaborating in a bright clinic, inspiring |
| `/blog/` | A cozy reading nook with a laptop showing a fertility blog, warm and inviting |
| `/patient-education-videos/` | A patient watching an educational fertility video on a tablet, engaged |
| `/egg-donor-compensation/` | A friendly, transparent consultation about egg-donor compensation, warm |
| `/our-doctors/` | A welcoming group of board-certified fertility specialists in a bright Troy clinic |
| `/doctors/*` (5 bios) | **Use the physician's real professional headshot** — not a generated image. |

### To finalize images
1. Generate each image from the prompt above (or commission photography).
2. Replace the `.media-placeholder` block with `<img src="…" alt="…" width="…" height="…" loading="lazy">` (keep WebP/AVIF, < ~150 KB).
3. Consider replacing the shared hero image (`rma-michigan-mother-daughter-embrace-home.avif`, currently reused on every page) with a per-page hero using the same prompt — optional but recommended for uniqueness.
