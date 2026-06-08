/**
 * IvfIcsiPage.tsx — Spring Creek Fertility · IVF & ICSI service page
 * ---------------------------------------------------------------------------
 * Dedicated IVF/ICSI page (the SEO audit's #1 content-gap priority). Built to
 * match HomepageBody.tsx: React + TypeScript + Tailwind + lucide-react, on the
 * springcreekglobal.css brand tokens (see ./tailwind.config.js).
 *
 * INTERNAL LINKING (per audit): link to this page (/ivf) from the homepage and
 * all three location pages. This page links out to the location pages and
 * related services (ICSI, PGT, egg freezing, donor, IUI).
 *
 * DATA GROUNDING (no invented data):
 *   • Brand Vault (Search Atlas MCP) d7b8aea4-4bc2-4be0-8336-582b66e69db6 —
 *     IVF process steps, advanced-lab specs, ICSI candidacy, Dr. Groll creds.
 *   • SEMrush audit (springcreekfertilityauditrewrite20260607.md) — IVF keyword
 *     targets (IVF Ohio, IVF Cincinnati/Columbus/Dayton, "how much is IVF in Ohio").
 * Sensitive YMYL items (success-rate figures, lab accreditation, hours) are left
 * as marked {/* VERIFY * / } placeholders.
 *
 * Requires the same tailwind.config.js extension as HomepageBody.tsx.
 */

import { useState, type FC, type ReactNode } from "react";
import {
  FlaskConical,
  ShieldCheck,
  Phone,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Pill,
  Activity,
  Stethoscope,
  Microscope,
  HeartHandshake,
  Snowflake,
  Wind,
  Thermometer,
  Award,
  LineChart,
  MapPin,
  HandCoins,
  CheckCircle2,
  Dna,
  Users,
  Syringe,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

/* ========================= Types ========================= */
interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}
interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}
interface RelatedCard {
  icon: LucideIcon;
  name: string;
  body: string;
  href: string;
}
interface Faq {
  q: string;
  a: string;
}

/* ========================= Content (grounded) ========================= */
const SCHEDULE_HREF = "/contact";
const PHONE_DISPLAY = "(937) 458-5084"; // Grounded main line — VERIFY per-location numbers
const PHONE_TEL = "+19374585084";

// IVF process — grounded in Brand Vault
const steps: Step[] = [
  {
    icon: Pill,
    title: "Ovarian Stimulation",
    body: "Fertility medications gentle-start your ovaries to mature multiple eggs in one cycle, rather than the single egg your body usually releases.",
  },
  {
    icon: Activity,
    title: "Monitoring",
    body: "Short, regular visits for bloodwork and ultrasound let your team track how your follicles are developing and fine-tune your medications.",
  },
  {
    icon: Stethoscope,
    title: "Egg Retrieval",
    body: "A minor outpatient procedure under light sedation, using ultrasound guidance to collect the mature eggs — most people are home the same day.",
  },
  {
    icon: FlaskConical,
    title: "Fertilization (with ICSI if needed)",
    body: "In our lab, eggs and sperm are combined to fertilize. When sperm factors call for it, ICSI injects a single sperm directly into each egg.",
  },
  {
    icon: Microscope,
    title: "Embryo Development",
    body: "Fertilized eggs grow in our embryology lab for 2–5 days, where our embryologists watch for healthy development to the blastocyst stage.",
  },
  {
    icon: HeartHandshake,
    title: "Embryo Transfer",
    body: "A healthy embryo is placed into the uterus in a quick, gentle procedure similar to a Pap smear — typically no sedation needed.",
  },
  {
    icon: Snowflake,
    title: "Frozen Embryo Transfer",
    body: "Any additional healthy embryos can be frozen for future use, giving you options for another transfer or growing your family later.",
  },
];

// Advanced IVF lab — grounded in Brand Vault
const labFeatures: Feature[] = [
  {
    icon: FlaskConical,
    title: "Built for embryos",
    body: "Our lab was purpose-designed for assisted reproduction to mimic the physiologic conditions inside the body — the environment embryos need to thrive.",
  },
  {
    icon: Thermometer,
    title: "Optimized incubators",
    body: "Specialized low-oxygen incubators create ideal conditions for culturing embryos to the blastocyst stage.",
  },
  {
    icon: Wind,
    title: "Medical-grade air quality",
    body: "A dedicated HVAC system holds temperature and humidity steady, with HEPA and chemical filtration that removes 99.9%+ of particles and VOCs.",
  },
  {
    icon: ShieldCheck,
    title: "Protected & isolated",
    body: "Tightly sealed, positively pressurized lab construction keeps outside contaminants away from your developing embryos.",
  },
];

const ivfFor: string[] = [
  "Tubal-factor infertility or blocked fallopian tubes",
  "Male-factor infertility",
  "Ovulation disorders, including PCOS",
  "Endometriosis",
  "Unexplained infertility",
  "When genetic testing of embryos (PGT) is planned",
  "Donor egg or donor embryo treatment",
  "LGBTQIA+ family building and reciprocal IVF",
];

// ICSI candidacy — grounded in Brand Vault
const icsiFor: string[] = [
  "Very low sperm count",
  "Sperm quality concerns (motility or morphology)",
  "Prior IVF with failed or low fertilization",
  "Surgically retrieved sperm (e.g., after a vasectomy)",
  "Frozen sperm of suboptimal quality",
  "When embryos will undergo genetic testing",
];

const whyChoose: Feature[] = [
  {
    icon: Award,
    title: "Experienced specialists",
    body: "Care led by board-certified reproductive endocrinologists who tailor every IVF plan to your diagnosis and goals.",
  },
  {
    icon: FlaskConical,
    title: "Advanced on-site lab",
    body: "Your embryos never leave the building — they develop in our purpose-built embryology lab here in Ohio.",
  },
  {
    icon: LineChart,
    title: "Transparent reporting",
    body: "We share outcomes honestly and review what the numbers mean for your situation before you begin.",
  },
  {
    icon: MapPin,
    title: "Three Ohio locations",
    body: "Monitoring and procedures stay close to home in Dayton, Columbus/Dublin, and Cincinnati/Mason.",
  },
];

const related: RelatedCard[] = [
  { icon: Syringe, name: "IUI", body: "A lower-intervention option that may come before IVF for some patients.", href: "/contact" /* PLACEHOLDER: /iui */ },
  { icon: Dna, name: "Genetic Testing (PGT)", body: "Screen embryos for chromosomal or inherited conditions before transfer.", href: "/contact" /* PLACEHOLDER: /pgt */ },
  { icon: Snowflake, name: "Egg & Embryo Freezing", body: "Preserve eggs or embryos for future cycles or family planning.", href: "/contact" /* PLACEHOLDER: /fertility-preservation */ },
  { icon: Users, name: "Donor & Third-Party", body: "Donor egg, donor sperm or embryo, and gestational-carrier pathways.", href: "/contact" /* PLACEHOLDER: /donor-services */ },
];

const locations = [
  { city: "Dayton", href: "/contact" /* PLACEHOLDER: /dayton-fertility-center/ */ },
  { city: "Columbus / Dublin", href: "/contact" /* PLACEHOLDER: /columbus-fertility-center/ */ },
  { city: "Cincinnati / Mason", href: "/contact" /* PLACEHOLDER: /cincinnati-fertility-center/ */ },
];

const faqs: Faq[] = [
  {
    q: "How much does IVF cost in Ohio?",
    a: "The cost of an IVF cycle in Ohio depends on your treatment plan, medications, lab services, genetic testing (PGT), and whether you use donor or freezing services — and your insurance coverage affects what you actually pay. Instead of a general online estimate, our financial team provides a personalized estimate and reviews financing, discount, and refund program options before you begin.",
  },
  {
    q: "What is the success rate of IVF?",
    a: "IVF success depends heavily on personal factors such as age, diagnosis, egg and sperm quality, and embryo health, so the most meaningful figures are the ones we review for your specific situation. We're committed to transparent, accurate outcome reporting and will discuss how our results compare with national benchmarks during your consultation.",
  },
  {
    q: "How long does one IVF cycle take?",
    a: "From the start of ovarian stimulation to egg retrieval is typically about two weeks, followed by fertilization and several days of embryo development. A fresh embryo transfer may happen days later, or embryos can be frozen for a future transfer. Your care team will give you a personalized timeline.",
  },
  {
    q: "Is the egg retrieval procedure painful?",
    a: "Egg retrieval is a minor outpatient procedure performed under light sedation, so you shouldn't feel pain during it. Most people rest at home the same day and have mild, short-lived cramping or bloating afterward.",
  },
  {
    q: "What is ICSI, and do I need it?",
    a: "ICSI (intracytoplasmic sperm injection) is a lab technique where a single sperm is injected directly into an egg to support fertilization. It's often recommended for low sperm count, sperm quality concerns, prior fertilization failure, surgically retrieved or suboptimal frozen sperm, or when embryos will undergo genetic testing. Your physician will advise whether ICSI is right for your cycle.",
  },
  {
    q: "What is the difference between IVF and IUI?",
    a: "IUI places prepared sperm directly into the uterus around ovulation and is a lower-intervention first step for some patients. IVF retrieves eggs, fertilizes them in the lab, and transfers an embryo to the uterus or freezes embryos for later. The right choice depends on your diagnosis, age, and goals.",
  },
  {
    q: "How many embryos are transferred?",
    a: "The number of embryos transferred is an individualized decision based on your age, embryo quality, and medical history. To reduce the chance of a multiple pregnancy, single embryo transfer is often recommended. Your physician will discuss what's safest and most effective for you.",
  },
  {
    q: "Does insurance cover IVF in Ohio?",
    a: "Coverage for IVF varies by plan and employer — some cover diagnostics but not treatment, and others cover certain services after prior authorization. Our financial team helps you understand your benefits and explore financing options so cost is clearer before you start.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ========================= Helpers ========================= */
const SectionHeading: FC<{ eyebrow: string; id: string; title: string; children?: ReactNode }> = ({
  eyebrow,
  id,
  title,
  children,
}) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-scf-teal">{eyebrow}</p>
    <h2 id={id} className="mt-2 font-display text-3xl font-bold leading-tight text-scf-teal-dark md:text-4xl">
      {title}
    </h2>
    {children && <p className="mt-4 text-scf-muted">{children}</p>}
  </div>
);

/* ========================= Page ========================= */
const IvfIcsiPage: FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="bg-scf-cream-soft font-body text-scf-navy">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Medically-reviewed trust bar */}
      <div className="border-b border-scf-line bg-scf-teal-light/60">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-2.5 text-center font-ui text-sm text-scf-teal-dark">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Medically reviewed by <strong className="font-semibold">Jeremy Groll, MD</strong> — double
            board-certified in Reproductive Endocrinology &amp; Infertility and OB/GYN
          </span>
          {/* VERIFY: add review date */}
        </div>
      </div>

      {/* ===== Page header ===== */}
      <header className="bg-gradient-to-br from-scf-cream to-scf-teal-light/70 px-5 py-14 md:py-20">
        <div className="mx-auto max-w-[1000px]">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 font-ui text-sm text-scf-muted">
              <li><a href="/" className="hover:text-scf-teal-dark">Home</a></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li><a href="/contact" className="hover:text-scf-teal-dark">{/* PLACEHOLDER: /#services */}Fertility Services</a></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li aria-current="page" className="font-semibold text-scf-teal-dark">IVF &amp; ICSI</li>
            </ol>
          </nav>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.1] text-scf-teal-dark md:text-5xl">
            IVF &amp; ICSI in Ohio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-scf-muted">
            In vitro fertilization (IVF) is one of the most effective fertility treatments available — and
            at Spring Creek Fertility, your embryos are cared for in our advanced on-site lab in Ohio. Here's
            how IVF and ICSI work, who they help, and what to expect.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={SCHEDULE_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-scf-teal px-7 py-3.5 font-ui font-semibold text-white shadow-scf-sm transition hover:-translate-y-0.5 hover:bg-scf-teal-dark hover:shadow-scf focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
            >
              Schedule a Consultation <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-scf-teal bg-transparent px-6 py-3.5 font-ui font-semibold text-scf-teal-dark transition hover:bg-scf-teal-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {/* PLACEHOLDER: confirm number */}
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </header>

      {/* ===== What is IVF / ICSI (answer-first for AIO) ===== */}
      <section aria-labelledby="what-heading" className="px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-[1000px] gap-6 md:grid-cols-2">
          <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf-sm">
            <h2 id="what-heading" className="font-display text-2xl font-bold text-scf-teal-dark">
              What is IVF?
            </h2>
            <p className="mt-3 text-scf-muted">
              <strong className="text-scf-navy">IVF (in vitro fertilization)</strong> is a fertility
              treatment in which eggs are retrieved from the ovaries and fertilized with sperm in a
              laboratory. The resulting embryo is then transferred to the uterus or frozen for a future
              cycle. IVF can help with many causes of infertility and is the foundation for treatments like
              genetic testing and donor or gestational-carrier care.
            </p>
          </div>
          <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf-sm">
            <h2 className="font-display text-2xl font-bold text-scf-teal-dark">What is ICSI?</h2>
            <p className="mt-3 text-scf-muted">
              <strong className="text-scf-navy">ICSI (intracytoplasmic sperm injection)</strong> is a lab
              technique used during some IVF cycles in which a single sperm is injected directly into an egg
              to support fertilization. Your care team may recommend ICSI when sperm factors or prior
              results make it the best path to fertilization.
            </p>
          </div>
        </div>
      </section>

      {/* ===== The IVF process ===== */}
      <section aria-labelledby="process-heading" className="bg-scf-teal-light/40 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <SectionHeading eyebrow="Step by Step" id="process-heading" title="The IVF process, explained">
            Every plan is personalized, but most IVF journeys move through these stages.
          </SectionHeading>
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-scf-lg border border-scf-line bg-white p-6 shadow-scf-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-scf bg-scf-teal-light text-scf-teal" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl font-bold text-scf-blue">{i + 1}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-scf-teal-dark">{title}</h3>
                <p className="mt-1.5 text-sm text-scf-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Who is it for ===== */}
      <section aria-labelledby="candidacy-heading" className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1000px]">
          <SectionHeading eyebrow="Is It Right for You?" id="candidacy-heading" title="Who IVF and ICSI can help">
            A consultation is the best way to know your options — but here's who these treatments often help.
          </SectionHeading>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf-sm">
              <h3 className="font-display text-xl font-bold text-scf-teal-dark">IVF may be considered for</h3>
              <ul className="mt-4 space-y-3">
                {ivfFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-scf-teal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf-sm">
              <h3 className="font-display text-xl font-bold text-scf-teal-dark">ICSI may be recommended for</h3>
              <ul className="mt-4 space-y-3">
                {icsiFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-scf-teal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Why Spring Creek for IVF (lab + E-E-A-T) ===== */}
      <section aria-labelledby="why-heading" className="bg-scf-teal-light/40 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <SectionHeading eyebrow="Why Spring Creek" id="why-heading" title="An IVF lab built for healthy embryos">
            Embryos are sensitive to their environment. Ours is engineered to protect them.
          </SectionHeading>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {labFeatures.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-scf-lg border border-scf-line bg-white p-6 shadow-scf-sm">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-scf bg-scf-teal-light text-scf-teal" aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-lg font-bold text-scf-teal-dark">{title}</h3>
                <p className="mt-2 text-sm text-scf-muted">{body}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-scf-teal" aria-hidden="true" />
                <span>
                  <span className="block font-ui font-semibold text-scf-teal-dark">{title}</span>
                  <span className="block text-sm text-scf-muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* VERIFY: lab accreditation (CAP/CLIA) and any approved success-rate statement */}
        </div>
      </section>

      {/* ===== Cost & insurance ===== */}
      <section aria-labelledby="cost-heading" className="px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-[1000px] items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-scf-teal">Cost &amp; Insurance</p>
            <h2 id="cost-heading" className="mt-2 font-display text-3xl font-bold leading-tight text-scf-teal-dark md:text-4xl">
              How much does IVF cost in Ohio?
            </h2>
            <p className="mt-4 text-scf-muted">
              There's no single price for IVF. Your cost depends on your treatment plan, medications, lab and
              genetic services, and whether you use donor or freezing services — and your insurance coverage
              changes what you actually pay. The best number is a personalized estimate, not an online average.
            </p>
            <p className="mt-3 text-scf-muted">
              Our financial team reviews your benefits and walks through financing, discount, and refund
              program options, so you can plan with clarity before treatment begins.
            </p>
            <a
              href="/contact" /* PLACEHOLDER: /financing-options */
              className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-scf-teal bg-transparent px-7 py-3 font-ui font-semibold text-scf-teal-dark transition hover:bg-scf-teal-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-scf-teal-dark"
            >
              Review financing &amp; insurance guidance <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <div className="rounded-scf-lg border border-scf-line bg-white p-8 shadow-scf">
            <HandCoins className="h-10 w-10 text-scf-teal" aria-hidden="true" />
            <p className="mt-4 font-display text-xl font-bold text-scf-teal-dark">What can affect your IVF cost</p>
            <ul className="mt-4 space-y-2.5 text-scf-muted">
              {[
                "Medications and monitoring",
                "Lab services and ICSI",
                "Genetic testing (PGT)",
                "Embryo freezing and storage",
                "Donor or gestational-carrier services",
                "Your insurance coverage",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-scf-teal" aria-hidden="true" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            {/* VERIFY: approved IVF price ranges / bundles only if Brand Vault + finance approve */}
          </div>
        </div>
      </section>

      {/* ===== Related treatments ===== */}
      <section aria-labelledby="related-heading" className="bg-scf-teal-light/40 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <SectionHeading eyebrow="Related Care" id="related-heading" title="Treatments that often work with IVF" />
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map(({ icon: Icon, name, body, href }) => (
              <li key={name} className="group flex flex-col rounded-scf-lg border border-scf-line bg-white p-6 shadow-scf-sm transition hover:-translate-y-1 hover:shadow-scf">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-scf bg-scf-teal-light text-scf-teal" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-scf-teal-dark">{name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-scf-muted">{body}</p>
                <a href={href} className="mt-4 inline-flex items-center gap-1.5 font-ui text-sm font-semibold text-scf-teal transition hover:gap-2.5 hover:text-scf-teal-dark">
                  Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">about {name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section aria-labelledby="faq-heading" className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Questions & Answers" id="faq-heading" title="IVF & ICSI questions, answered" />
          <dl className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              const panelId = `ivf-faq-panel-${i}`;
              const btnId = `ivf-faq-button-${i}`;
              return (
                <div key={f.q} className="overflow-hidden rounded-scf border border-scf-line bg-white">
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
                      <ChevronDown className={`h-5 w-5 shrink-0 text-scf-teal transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                  </dt>
                  <dd id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen} className="px-5 pb-5 text-scf-muted">
                    {f.a}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ===== Final CTA + location CTAs ===== */}
      <section aria-labelledby="cta-heading" className="bg-scf-teal-dark px-5 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-scf-blue-soft" aria-hidden="true" />
          <h2 id="cta-heading" className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
            Ready to talk about IVF?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Start with a consultation at the Ohio center most convenient for you. We'll answer your questions
            and help you understand your options — no pressure, just clarity.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={SCHEDULE_HREF} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-ui text-lg font-semibold text-scf-teal-dark shadow-scf transition hover:-translate-y-0.5 hover:bg-scf-cream focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white">
              Schedule Your Consultation <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {locations.map((l) => (
              <a
                key={l.city}
                href={l.href}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-5 py-2.5 font-ui text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" /> {l.city}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default IvfIcsiPage;
