import { getServices } from "@/lib/content";
import { slugify } from "@/lib/slugs";
import Link from "next/link";
import { notFound } from "next/navigation";
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const services = await getServices();
  const service = services.find((s) => slugify(s.title) === slug);
  if (!service) notFound();
  const tailored: Record<
    string,
    { intro: string; steps: string[]; benefits: string[] }
  > = {
    "social-media-management": {
      intro:
        "Build a consistent, recognizable social presence with a clear content plan, thoughtful community management, and regular performance reviews.",
      steps: [
        "Brand and audience research",
        "Monthly content calendar and creative direction",
        "Publishing, moderation, and community engagement",
        "Monthly reporting and optimization",
      ],
      benefits: [
        "Consistent brand voice",
        "More meaningful audience engagement",
        "Clear performance reporting",
      ],
    },
    "meta-ads": {
      intro:
        "Reach the right people on Facebook and Instagram with carefully structured campaigns designed around your business goals.",
      steps: [
        "Offer, audience, and funnel research",
        "Campaign and tracking setup",
        "Creative and audience testing",
        "Budget optimization and conversion reporting",
      ],
      benefits: [
        "Better audience targeting",
        "Measurable lead and sales campaigns",
        "Continuous testing and improvement",
      ],
    },
    "google-ads": {
      intro:
        "Capture high-intent demand with search campaigns built around relevant keywords, strong landing pages, and measurable conversions.",
      steps: [
        "Keyword and competitor research",
        "Account structure and conversion tracking",
        "Ad copy and landing-page alignment",
        "Search-term reviews and optimization",
      ],
      benefits: [
        "Reach customers actively searching",
        "Transparent campaign performance",
        "Smarter budget allocation",
      ],
    },
    "youtube-marketing": {
      intro:
        "Grow a YouTube channel with a repeatable strategy for discoverability, useful content, audience retention, and channel development.",
      steps: [
        "Channel and niche audit",
        "Topic, keyword, title, and thumbnail planning",
        "Publishing and video SEO support",
        "Analytics review and growth experiments",
      ],
      benefits: [
        "Stronger video discoverability",
        "Consistent publishing direction",
        "Data-led channel improvements",
      ],
    },
  };
  const f = tailored[slug] || {
    intro: service.description,
    steps: [
      "Discovery and goal setting",
      "Research and strategy",
      "Implementation and quality review",
      "Reporting and continuous improvement",
    ],
    benefits: [
      "A plan tailored to your business",
      "Clear deliverables and communication",
      "Measurable progress toward your goals",
    ],
  };
  const d = {
    intro: service.details_intro || f.intro,
    steps: service.process_steps?.length ? service.process_steps : f.steps,
    benefits: service.benefits?.length ? service.benefits : f.benefits,
  };
  const detailSections = Array.isArray(service.detail_sections)
    ? service.detail_sections.filter(
        (section) =>
          section &&
          typeof section.heading === "string" &&
          (section.heading.trim() ||
            section.body?.trim() ||
            section.bullets?.length),
      )
    : [];
  return (
    <main className="min-h-screen px-1 pb-20 pt-32 text-white">
      <div className="wrapper">
        <Link
          href="/#services"
          className="text-sm text-white hover:text-emerald-300"
        >
          ← All services
        </Link>
        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b2636] to-[#071222] p-4 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
            Service overview
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black md:text-5xl">
            {service.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            {d.intro}
          </p>
          <Link
            href="/#contact"
            className="mt-7 inline-flex rounded-full gradient-button px-6 py-3 text-sm font-bold"
          >
            Discuss your project ↗
          </Link>
        </section>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[.03] p-4 md:p-8">
            <h2 className="text-xl font-bold">How the service works</h2>
            <ol className="mt-5 space-y-4">
              {d.steps.map((x, i) => (
                <li key={x} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-sm leading-6 text-slate-300">
                    {x}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[.03] p-4 md:p-8">
            <h2 className="text-xl font-bold">What you can expect</h2>
            <ul className="mt-5 space-y-4">
              {d.benefits.map((x, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="text-accent">✓</span>
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-xl bg-white/[.04] p-4 text-sm leading-6 text-slate-400">
              Every project starts with understanding your goals. Scope,
              timelines, and reporting are agreed before implementation begins.
            </p>
          </section>
        </div>
        {detailSections.length > 0 && (
          <section className="mt-8 space-y-5">
            {detailSections.map((section, i) => (
              <article
                key={`${section.heading}-${i}`}
                className="rounded-2xl border border-white/10 bg-white/[.03] p-4 md:p-8"
              >
                <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">
                  Service details · {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-xl font-bold md:text-2xl">
                  {section.heading}
                </h2>
                {section.body && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300 md:text-base">
                    {section.body}
                  </p>
                )}
                {Array.isArray(section.bullets) &&
                  section.bullets.length > 0 && (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {section.bullets
                        .filter(
                          (item) => typeof item === "string" && item.trim(),
                        )
                        .map((item, j) => (
                          <li
                            key={`${j}-${item}`}
                            className="flex gap-3 rounded-xl bg-white/[.04] p-3 text-sm leading-6 text-slate-300"
                          >
                            <span className="text-accent">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  )}
              </article>
            ))}
          </section>
        )}
        <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] p-6 md:p-8">
          <h2 className="text-xl font-bold">Ready to discuss your project?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Tell me about your goals and I’ll help shape the right approach for
            your business.
          </p>
          <Link
            href="/#contact"
            className="mt-5 inline-flex rounded-full gradient-button px-6 py-3 text-sm font-bold "
          >
            Contact me about this service ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
