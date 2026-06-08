/**
 * HomepageBody.tsx — Spring Creek Fertility (springcreekfertility.com)
 * ---------------------------------------------------------------------------
 * Main homepage body (NO hero — hero is suggested only, see bottom of file).
 * Stack: React + TypeScript + Tailwind CSS + lucide-react.
 *
 * DATA GROUNDING (all factual claims trace to a source — no invented data):
 *   • Brand Vault (Search Atlas MCP) uuid d7b8aea4-4bc2-4be0-8336-582b66e69db6
 *     — business description, UVP, differentiators, services list, care-team
 *       roster, Dr. Groll credentials, locations + geo-coordinates.
 *   • OTTO project 64371 (Search Atlas) — domain context.
 *   • SEMrush SEO audit (springcreekfertilityauditrewrite20260607.md)
 *     — keyword strategy, approved patient-facing service/FAQ copy.
 *   • Brand design tokens — springcreekglobal.css (Elementor global presets).
 *
 * Anything not verifiable in those sources is marked {/* PLACEHOLDER * / } or
 * {/* VERIFY * / } and must be confirmed before publishing. Specific success
 * rates, per-location hours, and testimonials are intentionally placeholders
 * (YMYL / FTC / ASRM-SART compliance).
 *
 * ---------------------------------------------------------------------------
 * REQUIRED tailwind.config.js extension (see ./tailwind.config.js). These map
 * Tailwind utilities onto the brand tokens defined in springcreekglobal.css so
 * the single source of truth for color stays in that stylesheet:
 *
 *   theme: { extend: {
 *     colors: { scf: {
 *       teal:'var(--scf-teal)', 'teal-alt':'var(--scf-teal-alt)',
 *       'teal-dark':'var(--scf-teal-dark)', 'teal-light':'var(--scf-teal-light)',
 *       blue:'var(--scf-blue)', 'blue-soft':'var(--scf-blue-soft)',
 *       navy:'var(--scf-navy)', cream:'var(--scf-cream)',
 *       'cream-soft':'var(--scf-cream-soft)', muted:'var(--scf-gray-500)',
 *       line:'var(--scf-gray-300)' } },
 *     fontFamily: {
 *       display:['"Playfair Display"','Georgia','serif'],
 *       body:['"Open Sans"','system-ui','sans-serif'],
 *       ui:['"Poppins"','"Open Sans"','system-ui','sans-serif'] },
 *     boxShadow: {
 *       'scf-sm':'0 2px 8px rgba(0,97,107,.08)',
 *       scf:'0 10px 30px rgba(0,97,107,.12)',
 *       'scf-lg':'0 24px 60px rgba(0,97,107,.16)' },
 *     borderRadius: { scf:'12px','scf-lg':'20px' },
 *   } }
 * ---------------------------------------------------------------------------
 */

import { useState, type FC, type ReactNode } from "react";
import {
  Award,
  FlaskConical,
  LineChart,
  HeartHandshake,
  MapPin,
  HandCoins,
  Syringe,
  Snowflake,
  Stethoscope,
  Users,
  Dna,
  MessageSquare,
  ClipboardList,
  FileText,
  Activity,
  Star,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  Quote,
  BookOpen,
  CheckCircle2,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

/* =========================================================================
   Types
   ========================================================================= */
interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}
interface Service {
  icon: LucideIcon;
  name: string;
  body: string;
  href: string; // PLACEHOLDER: repoint to dedicated service page (e.g. /ivf)
}
interface JourneyStep {
  icon: LucideIcon;
  title: string;
  body: string;
}
interface Testimonial {
  initials: string;
  name: string;
  context: string;
  quote: string;
  rating: number;
}
interface Article {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  href: string;
}
interface Faq {
  q: string;
  a: string;
}

/* =========================================================================
   Content — grounded copy (see header for sources)
   ========================================================================= */

// CTA destinations are placeholders per brief (#contact / /contact).
const SCHEDULE_HREF = "/contact";
const PHONE_DISPLAY = "(937) 458-5084"; // Grounded (Brand Vault main line) — VERIFY per-location numbers
const PHONE_TEL = "+19374585084";

const features: Feature[] = [
  {
    icon: Award,
    title: "Experienced Fertility Specialists",
    body: "Care led by board-certified reproductive endocrinologists who guide an individualized plan for every patient — with the depth of experience that complex journeys deserve.",
  },
  {
    icon: FlaskConical,
    title: "Advanced On-Site IVF Lab",
    body: "Our state-of-the-art embryology laboratory is designed to closely replicate the body's natural conditions, supporting healthy embryo development at every step.",
  },
  {
    icon: LineChart,
    title: "Transparent Success Reporting",
    body: "You deserve honest information. We report outcomes accurately and review what the numbers mean for your situation, so you can make confident, informed decisions.",
  },
  {
    icon: HeartHandshake,
    title: "Compassionate, Inclusive Care",
    body: "Every family-building path is welcome here — individuals, couples, and the LGBTQIA+ community. We meet you with warmth, respect, and clear communication.",
  },
  {
    icon: MapPin,
    title: "Three Convenient Ohio Centers",
    body: "With centers in Dayton, Columbus/Dublin, and Cincinnati/Mason near major corridors, monitoring and procedures stay close to home.",
  },
  {
    icon: HandCoins,
    title: "Financial Guidance & Support",
    body: "Cost shouldn't stand in the way of answers. Our team helps with insurance navigation, financing, discount, and refund program options.",
  },
];

const services: Service[] = [
  {
    icon: FlaskConical,
    name: "IVF & ICSI",
    body: "In vitro fertilization retrieves eggs and fertilizes them with sperm in our lab; the embryo can then be transferred or frozen for the future. ICSI can support fertilization when sperm factors make it appropriate.",
    href: "/ivf" /* dedicated IVF/ICSI page (IvfIcsiPage.tsx) */,
  },
  {
    icon: Syringe,
    name: "IUI (Intrauterine Insemination)",
    body: "IUI places prepared sperm directly into the uterus around ovulation, using a partner's or donor sperm. For many patients it's a comfortable, lower-intervention first step.",
    href: "/contact" /* PLACEHOLDER: link to /iui service page */,
  },
  {
    icon: Snowflake,
    name: "Egg Freezing & Fertility Preservation",
    body: "Preserve options for the future — whether you're not ready to build a family yet or planning ahead of medical treatment. Includes egg freezing and oncofertility care.",
    href: "/contact" /* PLACEHOLDER: link to /fertility-preservation page */,
  },
  {
    icon: Stethoscope,
    name: "Fertility Testing & Diagnosis",
    body: "Clear answers start with understanding. Evaluation may include bloodwork, ultrasound, semen analysis, and uterine assessment to identify what's affecting conception.",
    href: "/contact" /* PLACEHOLDER: link to /fertility-testing page */,
  },
  {
    icon: Users,
    name: "Donor & Third-Party Programs",
    body: "Build your family with donor eggs, donor sperm or embryos, and gestational carrier coordination — with guidance through the medical, emotional, and practical steps.",
    href: "/contact" /* PLACEHOLDER: link to /donor-services page */,
  },
  {
    icon: Dna,
    name: "Genetic Testing (PGT)",
    body: "Preimplantation genetic testing (PGT-A/PGT-M) can screen embryos for chromosomal or specific inherited conditions, helping inform your treatment decisions.",
    href: "/contact" /* PLACEHOLDER: link to /pgt page */,
  },
];

const journey: JourneyStep[] = [
  {
    icon: MessageSquare,
    title: "Initial Consultation",
    body: "A conversation about your goals, history, and questions — never rushed. You'll leave understanding possible next steps.",
  },
  {
    icon: ClipboardList,
    title: "Diagnostic Testing",
    body: "Targeted testing helps us understand the factors that may be affecting conception, so your plan is built on real answers.",
  },
  {
    icon: FileText,
    title: "Personalized Treatment Plan",
    body: "Your physician explains the results and recommends a path — from timed cycles to IUI, IVF/ICSI, preservation, or donor options.",
  },
  {
    icon: Activity,
    title: "Treatment & Monitoring",
    body: "We guide you through medications, monitoring visits, and timing — and you'll always know who to reach with questions.",
  },
  {
    icon: HeartHandshake,
    title: "Ongoing Support",
    body: "Whatever comes next — a transfer, another cycle, or time to pause — we help you understand your choices, every step of the way.",
  },
];

/* PLACEHOLDER: Example testimonials only. Replace with real, consented patient
   stories (with written authorization). Keep outcomes individual — avoid
   implying typical or guaranteed results. */
const testimonials: Testimonial[] = [
  {
    initials: "M&C",
    name: "Maria & Carlos R.",
    context: "Cincinnati/Mason",
    quote:
      "After two hard years, this was the first place that truly listened. They explained every option in plain language and never made us feel like a number.",
    rating: 5,
  },
  {
    initials: "J",
    name: "Jordan T.",
    context: "Building a family — donor IUI",
    quote:
      "As a single parent by choice, I was nervous walking in. The team made me feel welcome from the first call and supported every decision along the way.",
    rating: 5,
  },
  {
    initials: "A",
    name: "Aisha M.",
    context: "Egg freezing",
    quote:
      "I froze my eggs to give my future self options. The process was clear, calm, and far less intimidating than I expected. I'm so glad I started.",
    rating: 5,
  },
];

/* PLACEHOLDER: Example resource cards. Replace href, image, and metadata with
   real published articles. */
const articles: Article[] = [
  {
    category: "IVF",
    title: "Understanding IVF: What to Expect",
    excerpt:
      "A step-by-step look at the IVF process — from stimulation and egg retrieval to fertilization, embryo transfer, and the two-week wait.",
    readTime: "7 min read",
    href: "/contact" /* PLACEHOLDER: /blog/understanding-ivf */,
  },
  {
    category: "Fertility Preservation",
    title: "Egg Freezing: Is It Right for You?",
    excerpt:
      "Who considers egg freezing, how timing affects your options, and the questions to ask before you begin preserving your fertility.",
    readTime: "6 min read",
    href: "/contact" /* PLACEHOLDER: /blog/egg-freezing-guide */,
  },
  {
    category: "Getting Started",
    title: "Fertility Testing: Your First Steps",
    excerpt:
      "What a fertility evaluation involves, when to seek one, and how testing helps your care team build a plan that fits your goals.",
    readTime: "5 min read",
    href: "/contact" /* PLACEHOLDER: /blog/fertility-testing-first-steps */,
  },
];

const faqs: Faq[] = [
  {
    q: "What can I expect at my first fertility appointment?",
    a: "Your first visit is a conversation, not a rush. You'll meet with a fertility specialist to review your medical history, any prior testing, and your family-building goals. We'll explain what we may need to evaluate and outline possible next steps so you leave with a clear understanding of your options. If you have records from another provider, bring them or send them ahead of time.",
  },
  {
    q: "How much does IVF cost in Ohio?",
    a: "The cost of IVF varies based on your treatment plan, medications, lab services, genetic testing, and whether you use donor or preservation services. Insurance coverage also affects your out-of-pocket cost. Rather than relying on a general online estimate, our financial team will walk you through a personalized estimate before treatment begins.",
  },
  {
    q: "Does insurance cover IVF or IUI in Ohio?",
    a: "Fertility coverage depends on your specific plan and employer benefits. Some plans cover diagnostic testing but not treatment, while others cover certain services after prior authorization. Our team helps you understand your benefits, navigate insurance questions, and explore financing, discount, and refund programs that may help make care more affordable.",
  },
  {
    q: "What are your success rates?",
    a: "Success depends on many personal factors, including age, diagnosis, and treatment type, so the most meaningful numbers are the ones we review together for your situation. We are committed to transparent, accurate outcome reporting and will discuss how our results compare with national benchmarks during your consultation.",
  },
  {
    q: "How long does fertility treatment take?",
    a: "Every journey is different. Initial testing often takes a few weeks, an IUI cycle generally spans a single menstrual cycle, and an IVF cycle typically takes several weeks from the start of medications to embryo transfer or freezing. Your care team will give you a personalized timeline based on your plan.",
  },
  {
    q: "Who is fertility treatment for?",
    a: "Fertility care is for anyone who wants help building or preserving the option of a family. We support individuals and couples, including those facing infertility, single parents by choice, LGBTQIA+ families, and people who want to preserve their fertility for the future through egg or embryo freezing.",
  },
  {
    q: "What is the difference between IUI and IVF?",
    a: "IUI places prepared sperm directly into the uterus around ovulation and is often a lower-intervention first step. IVF retrieves eggs, fertilizes them in our lab, and transfers an embryo to the uterus or freezes embryos for later. The right option depends on your diagnosis, age, and goals — your physician will help you decide.",
  },
  {
    q: "What makes Spring Creek Fertility different?",
    a: "We're an independent, full-service fertility practice with three convenient Ohio locations, an advanced on-site IVF laboratory designed to support healthy embryo development, and a team known for combining scientific rigor with genuine kindness. From your first call through every decision, you'll get clear communication, inclusive care, and coordinated support.",
  },
];

/* FAQ structured data — mirrors the visible FAQs exactly (Schema.org FAQPage). */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* =========================================================================
   Small presentational helpers
   ========================================================================= */
const SectionHeading: FC<{
  eyebrow: string;
  id: string;
  title: string;
  children?: ReactNode;
}> = ({ eyebrow, id, title, children }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-scf-teal">
      {eyebrow}
    </p>
    <h2
      id={id}
      className="mt-2 font-display text-3xl font-bold leading-tight text-scf-teal-dark md:text-4xl"
    >
      {title}
    </h2>
    {children && <p className="mt-4 text-scf-muted">{children}</p>}
  </div>
);

const PrimaryCta: FC<{ href: string; children: ReactNode; className?: string }> = ({
  href,
  children,
  className = "",
}) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-scf-teal px-7 py-3.5 font-ui font-semibold text-white shadow-scf-sm transition duration-200 hover:-translate-y-0.5 hover:bg-scf-teal-dark hover:shadow-scf focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark ${className}`}
  >
    {children}
  </a>
);

/* =========================================================================
   Component
   ========================================================================= */
const HomepageBody: FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="bg-scf-cream-soft font-body text-scf-navy">
      {/* JSON-LD: FAQPage. The full MedicalClinic / Physician / MedicalProcedure
          graph lives in the Elementor HTML version and your site <head>. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Medically-reviewed trust bar — grounded E-E-A-T attribution */}
      <div className="border-b border-scf-line bg-scf-teal-light/60">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-2.5 text-center font-ui text-sm text-scf-teal-dark">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Medically reviewed by{" "}
            <strong className="font-semibold">Jeremy Groll, MD</strong> —
            double board-certified in Reproductive Endocrinology &amp;
            Infertility and OB/GYN
          </span>
          {/* VERIFY: add review date, e.g. "· Reviewed June 2026" */}
        </div>
      </div>

      {/* ===================================================================
          1 · WHY CHOOSE SPRING CREEK FERTILITY
          =================================================================== */}
      <section
        aria-labelledby="why-heading"
        className="scroll-mt-24 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            eyebrow="Why Spring Creek Fertility"
            id="why-heading"
            title="Expert care that treats you like a person, not a chart"
          >
            Trying to grow your family can feel hopeful one day and heavy the
            next. You don't have to sort through the questions alone — here's
            what patients across Ohio count on.
          </SectionHeading>

          {/* Grounded trust stats */}
          <ul className="mx-auto mb-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { stat: "20+", label: "Years of REI experience*" },
              { stat: "6,500+", label: "Families helped*" },
              { stat: "3", label: "Ohio fertility centers" },
            ].map((s) => (
              <li
                key={s.label}
                className="rounded-scf-lg border border-scf-line bg-white p-6 text-center shadow-scf-sm"
              >
                <p className="font-display text-4xl font-bold text-scf-teal">
                  {s.stat}
                </p>
                <p className="mt-1 font-ui text-sm text-scf-muted">{s.label}</p>
              </li>
            ))}
          </ul>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="group rounded-scf-lg border border-scf-line bg-white p-7 shadow-scf-sm transition duration-300 hover:-translate-y-1 hover:shadow-scf"
              >
                <span
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-scf bg-scf-teal-light text-scf-teal transition group-hover:bg-scf-teal group-hover:text-white"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-scf-teal-dark">
                  {title}
                </h3>
                <p className="mt-2 text-scf-muted">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center font-ui text-xs text-scf-muted">
            *Reflects the career experience of Medical Director Jeremy Groll,
            MD. {/* VERIFY: practice-wide figures via Brand Vault */}
          </p>
        </div>
      </section>

      {/* ===================================================================
          2 · OUR FERTILITY SERVICES
          =================================================================== */}
      <section
        aria-labelledby="services-heading"
        className="scroll-mt-24 bg-scf-teal-light/40 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            eyebrow="Our Services"
            id="services-heading"
            title="Comprehensive fertility care, all in one place"
          >
            From your first evaluation to advanced treatment, our Ohio team
            offers the full range of fertility services — explained in plain
            language so you can choose the next right step.
          </SectionHeading>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, name, body, href }) => (
              <li
                key={name}
                className="group flex flex-col rounded-scf-lg border border-scf-line bg-white p-7 shadow-scf-sm transition duration-300 hover:-translate-y-1 hover:shadow-scf"
              >
                <span
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-scf bg-scf-teal-light text-scf-teal"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-scf-teal-dark">
                  {name}
                </h3>
                <p className="mt-2 flex-1 text-scf-muted">{body}</p>
                <a
                  href={href}
                  className="mt-5 inline-flex items-center gap-1.5 font-ui font-semibold text-scf-teal transition hover:gap-2.5 hover:text-scf-teal-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">about {name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================================================================
          3 · YOUR FERTILITY JOURNEY
          =================================================================== */}
      <section
        aria-labelledby="journey-heading"
        className="scroll-mt-24 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            eyebrow="What to Expect"
            id="journey-heading"
            title="Your fertility journey, step by step"
          >
            Knowing what comes next brings calm to an uncertain time. Here's the
            path most patients follow with us.
          </SectionHeading>

          {/* Connecting line is a ::before pseudo so the <ol> only contains <li> */}
          <ol className="relative grid grid-cols-1 gap-8 before:absolute before:inset-x-0 before:top-7 before:hidden before:h-0.5 before:bg-scf-blue-soft before:content-[''] md:grid-cols-5 md:gap-4 md:before:block">
            {journey.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative flex flex-col md:items-center md:text-center">
                <span className="relative z-10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-scf-teal bg-white text-scf-teal shadow-scf-sm">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-scf-teal font-ui text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="font-display text-lg font-bold text-scf-teal-dark">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-scf-muted md:max-w-[15rem]">
                  {body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <PrimaryCta href={SCHEDULE_HREF}>
              Start with a consultation
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </PrimaryCta>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4 · PATIENT SUCCESS STORIES / TESTIMONIALS
          =================================================================== */}
      <section
        aria-labelledby="stories-heading"
        className="scroll-mt-24 bg-scf-teal-light/40 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            eyebrow="Patient Stories"
            id="stories-heading"
            title="Real support, every step of the way"
          >
            The people we care for inspire everything we do.
          </SectionHeading>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <li
                key={t.name}
                className="flex flex-col rounded-scf-lg border border-scf-line bg-white p-7 shadow-scf-sm"
              >
                <Quote
                  className="h-8 w-8 text-scf-blue-soft"
                  aria-hidden="true"
                />
                <div
                  className="mt-3 flex gap-0.5"
                  role="img"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-scf-blue text-scf-blue"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-scf-navy">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-scf-teal font-ui text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <span>
                    <span className="block font-ui font-semibold text-scf-teal-dark">
                      {t.name}
                    </span>
                    <span className="block text-sm text-scf-muted">
                      {t.context}
                    </span>
                  </span>
                </figcaption>
              </li>
            ))}
          </ul>

          {/* PLACEHOLDER notice — required until real consented stories are added */}
          <p className="mx-auto mt-8 max-w-2xl text-center font-ui text-xs italic text-scf-muted">
            Example testimonials shown for layout. Replace with real patient
            stories collected with written consent; individual results vary and
            are not a guarantee of outcome.
          </p>
        </div>
      </section>

      {/* ===================================================================
          5 · FERTILITY EDUCATION & RESOURCES
          =================================================================== */}
      <section
        aria-labelledby="resources-heading"
        className="scroll-mt-24 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            eyebrow="Education & Resources"
            id="resources-heading"
            title="Learn at your own pace"
          >
            Clear, compassionate answers to help you feel informed and
            empowered — wherever you are in your journey.
          </SectionHeading>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <li
                key={a.title}
                className="group flex flex-col overflow-hidden rounded-scf-lg border border-scf-line bg-white shadow-scf-sm transition duration-300 hover:-translate-y-1 hover:shadow-scf"
              >
                {/* PLACEHOLDER: swap for a real <img> — lazy-loaded, descriptive alt */}
                <img
                  src="/images/placeholder-resource.webp"
                  alt={`Illustration for the article: ${a.title}`}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={360}
                  className="aspect-[16/9] w-full bg-scf-teal-light object-cover"
                />
                <div className="flex flex-1 flex-col p-6">
                  <span className="font-ui text-xs font-semibold uppercase tracking-wider text-scf-teal">
                    {a.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-scf-teal-dark">
                    {a.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-scf-muted">
                    {a.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-scf-muted">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {a.readTime}
                    </span>
                    <a
                      href={a.href}
                      className="inline-flex items-center gap-1.5 font-ui text-sm font-semibold text-scf-teal transition hover:gap-2.5 hover:text-scf-teal-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
                    >
                      Read article
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">: {a.title}</span>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <a
              href="/contact" /* PLACEHOLDER: /blog */
              className="inline-flex items-center gap-2 font-ui font-semibold text-scf-teal transition hover:gap-3 hover:text-scf-teal-dark"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Explore all fertility resources
            </a>
          </div>
        </div>
      </section>

      {/* ===================================================================
          6 · INSURANCE & FINANCING
          =================================================================== */}
      <section
        aria-labelledby="financing-heading"
        className="scroll-mt-24 bg-scf-teal-light/40 px-5 py-16 md:py-24"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-scf-teal">
              Insurance &amp; Financing
            </p>
            <h2
              id="financing-heading"
              className="mt-2 font-display text-3xl font-bold leading-tight text-scf-teal-dark md:text-4xl"
            >
              Cost shouldn't stand between you and answers
            </h2>
            <p className="mt-4 text-scf-muted">
              Fertility benefits vary widely by plan, employer, and treatment
              type — and we know that uncertainty adds stress. Our financial
              team helps you understand your coverage and the questions to ask
              your insurer, so there are no surprises before treatment begins.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Insurance navigation and benefits guidance",
                "Flexible financing options",
                "Discount and refund program options",
                "A personalized cost estimate before treatment starts",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-scf-teal"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href="/contact" /* PLACEHOLDER: /financing-options */
                className="inline-flex items-center gap-2 rounded-full border-2 border-scf-teal bg-transparent px-7 py-3 font-ui font-semibold text-scf-teal-dark transition hover:bg-scf-teal-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
              >
                Review financing &amp; insurance guidance
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf">
            <HandCoins
              className="h-10 w-10 text-scf-teal"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-xl font-bold text-scf-teal-dark">
              A clear, supportive conversation about cost
            </p>
            <p className="mt-3 text-scf-muted">
              Don't rely on a general online estimate as your final price. Your
              actual cost can depend on testing, medication, treatment type, lab
              and genetic services, donor services, and freezing or storage —
              along with your insurance coverage. We'll walk through it with you.
            </p>
            {/* VERIFY: accepted insurance plans, financing vendors, refund/discount
                program terms, and FTC-compliant pricing language via Brand Vault. */}
          </div>
        </div>
      </section>

      {/* ===================================================================
          7 · FAQ (accessible accordion)
          =================================================================== */}
      <section
        aria-labelledby="faq-heading"
        className="scroll-mt-24 px-5 py-16 md:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Questions & Answers"
            id="faq-heading"
            title="Fertility care questions, answered"
          >
            Quick, honest answers to what patients across Ohio ask us most.
          </SectionHeading>

          <dl className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              const panelId = `faq-panel-${i}`;
              const btnId = `faq-button-${i}`;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-scf border border-scf-line bg-white"
                >
                  <dt>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-ui font-semibold text-scf-teal-dark transition hover:bg-scf-teal-light/40 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-scf-teal-dark"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-scf-teal transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </dt>
                  <dd
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    hidden={!isOpen}
                    className="px-5 pb-5 text-scf-muted"
                  >
                    {f.a}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ===================================================================
          8 · FINAL CTA / APPOINTMENT BOOKING
          =================================================================== */}
      <section
        aria-labelledby="cta-heading"
        className="scroll-mt-24 bg-scf-teal-dark px-5 py-20 text-white"
      >
        <div className="mx-auto max-w-2xl text-center">
          <CalendarCheck
            className="mx-auto h-12 w-12 text-scf-blue-soft"
            aria-hidden="true"
          />
          <h2
            id="cta-heading"
            className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl"
          >
            Take the next step, with a team beside you
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Wherever you are in your family-building journey, a clear and
            compassionate conversation is the best place to begin. We're ready
            when you are.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={SCHEDULE_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-ui text-lg font-semibold text-scf-teal-dark shadow-scf transition hover:-translate-y-0.5 hover:bg-scf-cream focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Schedule Your Consultation
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 px-7 py-4 font-ui font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {/* PLACEHOLDER: confirm best inbound number / per-location routing */}
              Call {PHONE_DISPLAY}
            </a>
          </div>

          <p className="mt-6 inline-flex items-center justify-center gap-2 font-ui text-sm text-white/80">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {/* PLACEHOLDER: wire to live chat widget */}
            Prefer to chat? Our team is available by live chat during office
            hours.
          </p>
        </div>
      </section>
    </main>
  );
};

export default HomepageBody;

/* =========================================================================
   HERO SECTION — SUGGESTIONS ONLY (do not build; for the team to choose from)
   =========================================================================

   1. Headline:    "Your Path to Parenthood Starts Here"
      Subheadline: "Compassionate, expert fertility care in Dayton, Columbus &
                    Cincinnati — with the science, support, and clarity you
                    deserve at every step."

   2. Headline:    "Hope, Backed by Science"
      Subheadline: "Advanced reproductive medicine and a state-of-the-art IVF
                    lab, delivered with genuine warmth across three Ohio centers."

   3. Headline:    "Fertility Care in Ohio, Centered Around You"
      Subheadline: "From your first questions to your next steps, our specialists
                    guide your family-building journey with clarity and kindness."

   4. Headline:    "Every Family Begins With a Conversation"
      Subheadline: "Personalized IVF, IUI, egg freezing, and family-building
                    support for individuals, couples, and the LGBTQIA+ community."

   5. Headline:    "You Don't Have to Navigate This Alone"
      Subheadline: "Trusted Ohio fertility specialists offering expert care,
                    transparent answers, and steady support — close to home."

   ------------------------------------------------------------------------
   AI HERO IMAGE GENERATION PROMPT:
   "A warm, hopeful, photorealistic image of a diverse couple sitting together
   in a bright, modern fertility clinic consultation room, softly lit by natural
   window light, looking calm and reassured. Muted teal and cream color palette,
   shallow depth of field, gentle and authentic (not staged), no text. Editorial
   healthcare photography style, soft focus background suggesting a welcoming
   medical environment. 16:9, high resolution, optimized for web hero (export as
   WebP, ~1600x900, under 180KB)."
   ========================================================================= */
