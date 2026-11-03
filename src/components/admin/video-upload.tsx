"use client";

import { createClient } from "@/lib/supabase/browser";
import { ChangeEvent, useId, useState } from "react";
import { FaCheckCircle, FaTrash, FaUpload, FaVideo } from "react-icons/fa";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

function uploadId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function VideoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setProgressText("");

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError("Please choose an MP4 or WebM video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("This video is over 50 MB. Compress it to 50 MB or less before uploading.");
      return;
    }

    setBusy(true);
    setProgressText("Uploading video securely to Supabase Storage…");
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `video-reviews/${uploadId()}.${extension}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("portfolio-media")
        .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
      onChange(data.publicUrl);
      setProgressText("Video uploaded. Save the review to publish your changes.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Video upload failed. Check your Supabase Storage policies and try again.");
      setProgressText("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#020b18]/70 p-4">
      <input
        id={`video-upload-${inputId}`}
        className="sr-only"
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        onChange={upload}
        disabled={busy}
      />
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={`video-upload-${inputId}`} className={`outline-button cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
          <FaUpload /> {busy ? "Uploading video…" : value ? "Replace video file" : "Upload video file"}
        </label>
        {value && (
          <button type="button" onClick={() => { onChange(""); setProgressText("Video removed from this form. Save the review to apply the change."); setError(""); }} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-300">
            <FaTrash /> Remove
          </button>
        )}
      </div>
      {busy && <div className="mt-4 flex items-center gap-3 text-xs text-slate-300"><span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/25 border-t-accent" />{progressText}</div>}
      {!busy && value && <p className="mt-3 flex items-center gap-2 break-all text-xs text-emerald-300"><FaCheckCircle className="shrink-0" /> Current video attached</p>}
      {!busy && !value && <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><FaVideo className="shrink-0" /> MP4 recommended · max 50 MB · 30–60 seconds works well</p>}
      {!busy && progressText && <p className="mt-3 text-xs text-slate-400">{progressText}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
