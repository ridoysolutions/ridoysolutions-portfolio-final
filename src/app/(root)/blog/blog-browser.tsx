"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Post = { id: string; title: string; slug: string; excerpt: string | null; content?: string; cover_image: string | null; published_at: string | null };

export default function BlogBrowser({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return posts;
    return posts.filter((post) => [post.title, post.excerpt || "", post.content || ""].join(" ").toLocaleLowerCase().includes(q));
  }, [posts, query]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="blog-search">Search articles</label>
        <input id="blog-search" value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search articles, topics, or keywords…" className="field min-w-0 flex-1" />
        {query && <button type="button" onClick={() => setQuery("")} className="outline-button">Clear search</button>}
      </div>
      {filtered.length ? (
        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div key={p.id} layout initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}>
              <Link href={`/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-[#061224]/60 transition duration-300 hover:-translate-y-1 hover:border-accent/50">
                {p.cover_image ? <div className="relative h-48 w-full"><Image src={p.cover_image} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" /></div> : <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[#eaf0f7] to-[#dce5ef] text-5xl font-black text-accent">R.</div>}
                <div className="p-5">
                  {p.published_at && <p className="text-xs text-accent">{new Date(p.published_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</p>}
                  <h2 className="mt-2 text-lg font-bold text-white transition group-hover:text-accent">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{p.excerpt}</p>
                  <span className="mt-5 inline-block text-sm font-bold text-accent">Read article →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center"><h2 className="text-lg font-bold text-white">{query ? "No results found" : "Articles coming soon"}</h2><p className="mt-2 text-sm text-slate-400">{query ? "Try another keyword or clear your search to see all articles." : "New insights will appear here when they are published."}</p>{query && <button onClick={() => setQuery("")} className="gradient-button mt-5">Show all articles</button>}</div>}
    </>
  );
}
