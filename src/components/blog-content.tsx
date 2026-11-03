function headingId(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

export function getBlogHeadings(content: string) {
  return content.split(/\n/).map((line) => line.trim()).filter((line) => /^#{1,3}\s+/.test(line)).map((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/)!;
    return { level: match[1].length, title: match[2], id: headingId(match[2]) };
  });
}

export default function BlogContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return <div className="blog-article-content space-y-5 text-[15px] leading-8 text-slate-700">{blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => /^[-*•]\s+/.test(line))) return <ul key={index} className="list-disc space-y-2 pl-6 leading-8 text-slate-700 marker:text-[#8fca00]">{lines.map((line, i) => <li key={i}>{line.replace(/^[-*•]\s+/, "")}</li>)}</ul>;
    const heading = block.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { const text = heading[2]; const id = headingId(text); if (heading[1].length === 1) return <h2 id={id} key={index} className="scroll-mt-28 border-l-4 border-[#8fca00] pl-3 pt-4 text-2xl font-extrabold tracking-tight text-[#102b43] md:text-3xl">{text}</h2>; if (heading[1].length === 2) return <h2 id={id} key={index} className="scroll-mt-28 border-l-4 border-[#8fca00] pl-3 pt-3 text-xl font-extrabold text-[#102b43] md:text-2xl">{text}</h2>; return <h3 id={id} key={index} className="scroll-mt-28 pt-2 text-lg font-bold text-[#17364e]">{text}</h3>; }
    return <p key={index} className="whitespace-pre-line">{lines.join(" ")}</p>;
  })}</div>;
}
