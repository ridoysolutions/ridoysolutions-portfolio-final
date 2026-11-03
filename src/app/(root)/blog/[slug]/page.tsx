import BlogContent, { getBlogHeadings } from "@/components/blog-content";
import BlogTableOfContents from "@/components/blog-table-of-contents";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

function dateLabel(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    notFound();
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  const { data: p } = await db
    .from("blog_posts")
    .select("title,slug,excerpt,content,cover_image,published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!p) notFound();

  const headings = getBlogHeadings(p.content || "");
  const publishedDate = dateLabel(p.published_at);

  return (
    <main className="min-h-screen bg-[#020711] px-1 pb-20 pt-28 text-white md:pt-32">
      <div className="wrapper">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:text-white"
        >
          ← All articles
        </Link>

        {/* Blog Header */}
        <header className="mt-5 grid items-center gap-7 lg:grid-cols-[1.35fr_.9fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-accent">
              SEO & Digital Marketing Insights
            </p>

            <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-[-.035em] text-white sm:text-4xl lg:text-[2.55rem]">
              {p.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/profile/profileImg.png"
                  alt="Hridoy Chowdhury"
                  className="h-12 w-12 rounded-full border border-white/10 object-cover"
                />

                <div>
                  <p className="font-extrabold text-accent">Ridoy Ahmed</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Digital Marketing Specialist
                  </p>
                </div>
              </div>

              {publishedDate && (
                <div className="text-xs font-semibold leading-6 text-slate-300">
                  <p>
                    <span className="mr-2 text-accent">▦</span>
                    {publishedDate}
                  </p>
                  <p>
                    <span className="mr-2 text-accent">◉</span>
                    SEO & Marketing Article
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#061224]/60">
            {p.cover_image ? (
              <img
                src={p.cover_image}
                alt={p.title}
                className="max-h-[330px] min-h-48 w-full object-cover"
              />
            ) : (
              <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-[#061224] to-[#10213a] text-5xl font-black text-accent">
                R.
              </div>
            )}
          </div>
        </header>

        {/* Article + Sidebar */}
        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_268px]">
          {/* Main Article */}
          <article className="min-w-0 rounded-2xl border border-white/10 bg-[#061224]/60 p-3 shadow-xl shadow-black/10 sm:p-7 md:p-8">
            {p.excerpt && (
              <p className="mb-6 rounded-xl border-l-4 border-accent bg-white/[.03] px-4 py-3 text-[15px] font-medium leading-7 text-slate-300">
                {p.excerpt}
              </p>
            )}

            <div className="[&_.blog-article-content]:!text-slate-300 [&_.blog-article-content_p]:!text-slate-300 [&_.blog-article-content_ul]:!text-slate-300 [&_.blog-article-content_li]:!text-slate-300 [&_.blog-article-content_h2]:!text-white [&_.blog-article-content_h3]:!text-slate-100">
              <BlogContent content={p.content || ""} />
            </div>

            {/* Contact CTA */}
            <div className="mt-10 rounded-2xl border border-accent/20 bg-[#020711] p-6 sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">
                Have a project in mind?
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Let’s grow your business together.
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                Tell me what you’re working on and let’s discuss a practical
                strategy for your goals.
              </p>

              <Link href="/#contact" className="gradient-button mt-5">
                Discuss your project ↗
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            {/* Active section navigation; hidden on mobile */}
            {headings.length > 0 && <BlogTableOfContents headings={headings} />}

            {/* Author Card */}
            <section className="rounded-xl border border-white/10 bg-[#061224]/60 p-5 text-center shadow-sm">
              <img
                src="/images/profile/profileImg.png"
                alt="Hridoy Chowdhury"
                className="mx-auto h-20 w-20 rounded-full border border-white/10 object-cover"
              />

              <h2 className="mt-3 text-lg font-black text-white">
                Ridoy Ahmed
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Top Rated Plus SEO Expert
                <br />
                Digital Marketing Specialist
              </p>

              <Link
                href="/#contact"
                className="gradient-button mt-4 w-full justify-center"
              >
                Contact Ridoy ↗
              </Link>
            </section>

            {/* All Articles */}
            <Link
              href="/blog"
              className="block rounded-xl border border-white/10 bg-[#061224]/60 p-4 text-sm font-bold text-slate-300 transition hover:border-accent/50 hover:text-accent"
            >
              ← Browse all articles
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
