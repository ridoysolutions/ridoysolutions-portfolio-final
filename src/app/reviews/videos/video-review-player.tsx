"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay, FaTimes, FaVideo } from "react-icons/fa";

type Props = { clientName: string; videoUrl?: string; thumbnail?: string };

function isExternalEmbedUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return ["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be", "vimeo.com", "player.vimeo.com"].includes(host);
  } catch {
    return false;
  }
}

export default function VideoReviewPlayer({ clientName, videoUrl, thumbnail }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const externalEmbed = Boolean(videoUrl && isExternalEmbedUrl(videoUrl));

  const close = useCallback(() => {
    setOpen(false);
    setLoading(true);
    setFailed(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!videoUrl) {
    return <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-[#07172c] to-[#020814] text-slate-500">
      {thumbnail ? <Image src={thumbnail} alt={`${clientName} video thumbnail`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" /> : <FaVideo className="text-3xl" />}
      <span className="absolute bottom-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-wider">Video coming soon</span>
    </div>;
  }

  return <>
    <button type="button" onClick={() => { setLoading(true); setFailed(false); setOpen(true); }} aria-label={`Play ${clientName} video review`} className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#07172c] to-[#020814] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
      {thumbnail ? <Image src={thumbnail} alt={`${clientName} video thumbnail`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" /> : <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,139,255,.2),transparent_60%)]" />}
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-accent/90 pl-1 text-lg shadow-[0_0_35px_rgba(22,139,255,.35)] transition duration-300 group-hover:scale-110 group-hover:bg-accent"><FaPlay /></span>
      <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      <span className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[.16em] text-white/90">Watch video review</span>
    </button>
    {open && <div role="dialog" aria-modal="true" aria-label={`${clientName} video review`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010611]/95 p-3 backdrop-blur-md sm:p-6">
      <button type="button" onClick={close} aria-label="Close video" className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:right-7 sm:top-7"><FaTimes /></button>
      <div className="w-full max-w-5xl">
        <div className="mb-3 pr-14 text-sm font-semibold text-white">{clientName}</div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
          {externalEmbed ? <iframe src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`} title={`${clientName} video review`} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen onLoad={() => setLoading(false)} /> : <video ref={videoRef} src={videoUrl} controls autoPlay playsInline preload="none" poster={thumbnail || undefined} onCanPlay={() => setLoading(false)} onPlaying={() => setLoading(false)} onWaiting={() => setLoading(true)} onError={() => { setLoading(false); setFailed(true); }} className="h-full w-full bg-black object-contain" />}
          {loading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#020814]/80 text-center"><span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/20 border-t-accent" /><span className="text-xs font-medium text-slate-300">Loading video…</span></div>}
          {failed && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#020814] p-6 text-center"><FaVideo className="text-3xl text-slate-500" /><p className="text-sm text-white">This video could not be played.</p><p className="text-xs text-slate-400">Please check the video format or try again later.</p></div>}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">Press Esc or tap outside the player to close</p>
      </div>
    </div>}
  </>;
}
