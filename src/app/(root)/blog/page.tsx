import { createClient } from "@supabase/supabase-js";
import BlogBrowser from "./blog-browser";
export const revalidate = 300;
async function posts() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
      return [];
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
    const { data } = await db
      .from("blog_posts")
      .select("id,title,slug,excerpt,content,cover_image,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}
export default async function BlogPage() {
  const items = await posts();
  return (
    <main className="page-enter min-h-screen bg-[#020711] px-1 pb-20 pt-32 text-white">
      <div className="wrapper">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-accent">
          Insights & resources
        </p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          The <span className="gradient-text">Blog</span>
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Practical ideas, strategies, and lessons on SEO, digital marketing,
          and growing your business online.
        </p>
        <BlogBrowser posts={items} />
      </div>
    </main>
  );
}
