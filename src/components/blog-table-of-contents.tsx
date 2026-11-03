"use client";

import { useEffect, useState } from "react";

type Heading = { level: number; title: string; id: string };

export default function BlogTableOfContents({ headings }: { headings: Heading[] }) {
  const [activeIds, setActiveIds] = useState<string[]>(headings[0] ? [headings[0].id] : []);

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActiveIds(visible.map((entry) => entry.target.id));
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    elements.forEach((element) => observer.observe(element));
    const onScroll = () => {
      const passed = elements.filter((element) => element.getBoundingClientRect().top <= 150);
      if (passed.length) setActiveIds([passed[passed.length - 1].id]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [headings]);

  return (
    <section className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#061224]/80 shadow-sm lg:block">
      <div className="flex items-center justify-between border-b border-accent/30 px-4 py-3">
        <h2 className="text-sm font-extrabold text-white">Table of Contents</h2>
        <span className="text-lg leading-none text-accent">⌃</span>
      </div>
      <nav className="max-h-[430px] overflow-y-auto p-4">
        <ol className="space-y-2">
          {headings.map((heading, index) => {
            const active = activeIds.includes(heading.id);
            return <li key={`${heading.id}-${index}`} className={heading.level > 1 ? "pl-3" : ""}>
              <a href={`#${heading.id}`} aria-current={active ? "location" : undefined}
                className={`block rounded-md px-2 py-1 text-[13px] leading-5 transition ${active ? "bg-accent/15 font-bold text-accent ring-1 ring-accent/30" : "text-slate-300 hover:text-accent hover:underline"}`}>
                <span className="mr-2 text-slate-500">{index + 1}.</span>{heading.title}
              </a>
            </li>;
          })}
        </ol>
      </nav>
    </section>
  );
}
