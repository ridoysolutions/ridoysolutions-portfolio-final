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
  const all = await getServices();
  const service = all.find((item) => slugify(item.title) === slug);
  if (!service) notFound();
  const details: Record<
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
        "Monthly reporting and ongoing optimization",
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
        "Capture high-intent demand with search and performance campaigns built around relevant keywords, strong landing pages, and measurable conversions.",
      steps: [
        "Keyword and competitor research",
        "Account structure and conversion tracking",
        "Ad copy and landing-page alignment",
        "Search-term reviews, optimization, and reporting",
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
        "A consistent publishing direction",
        "Data-led channel improvements",
      ],
    },
  };
  const d = details[slug] || {
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
  return (
    <main className="min-h-screen px-4 pb-20 pt-32 text-white">
      <div className="wrapper">
        <Link
          href="/#services"
          className="text-sm text-emerald-300 hover:text-white"
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
            className="mt-7 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
          >
            Discuss your project ↗
          </Link>
        </section>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[.03] p-4 md:p-8">
            <h2 className="text-xl font-bold">How the service works</h2>
            <ol className="mt-5 space-y-4">
              {d.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-bold text-emerald-300">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-sm leading-6 text-slate-300">
                    {step}
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
                  <span className="text-emerald-300">✓</span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-7 rounded-xl bg-white/[.04] p-4 text-sm leading-6 text-slate-400">
              Every project starts with understanding your goals. Scope,
              timelines, and reporting are agreed before implementation begins.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
