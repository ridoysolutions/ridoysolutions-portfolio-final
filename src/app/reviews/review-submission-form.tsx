"use client";

import { createClient } from "@/lib/supabase/browser";
import { FormEvent, useState } from "react";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Generate a unique filename safely across browsers
function generateUploadId() {
  // Preferred: native UUID support
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  // Fallback: Web Crypto random values
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Last-resort fallback
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ReviewSubmissionForm() {
  const [busy, setBusy] = useState(false);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const review = String(data.get("review") || "").trim();
    const rating = Number(data.get("rating"));
    const file = data.get("photo");

    // Required field validation
    if (
      !name ||
      !review ||
      review.length < 10 ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setNotice({
        type: "error",
        text: "Please provide your name, a review message of at least 10 characters, and a rating from 1 to 5.",
      });
      return;
    }

    // Image validation
    if (
      file instanceof File &&
      file.size > 0 &&
      (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE)
    ) {
      setNotice({
        type: "error",
        text: "Please upload a JPG, PNG, or WebP image smaller than 3 MB.",
      });
      return;
    }

    setBusy(true);

    const supabase = createClient();
    let photo = "";

    try {
      // Upload profile image if provided
      if (file instanceof File && file.size > 0) {
        const extension =
          file.type === "image/jpeg"
            ? "jpg"
            : file.type === "image/png"
              ? "png"
              : "webp";

        // FIX: Generate an ID without depending exclusively
        // on crypto.randomUUID()
        const path = `review-submissions/${generateUploadId()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("review-avatars")
          .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        photo = supabase.storage.from("review-avatars").getPublicUrl(path)
          .data.publicUrl;
      }

      // Submit review as pending
      const { error } = await supabase.from("reviews").insert({
        name,
        role: String(data.get("role") || "").trim(),
        company: String(data.get("company") || "").trim(),
        review,
        photo,
        rating,
        title: null,
        status: "pending",
        published: false,
      });

      if (error) {
        throw error;
      }

      // Reset form after successful submission
      form.reset();

      setNotice({
        type: "success",
        text: "Thank you! Your review has been submitted and is awaiting approval.",
      });
    } catch (error) {
      console.error("Review submission error:", error);

      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Your review could not be submitted. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 rounded-2xl border border-accent/20 bg-[#061224]/60 p-5 sm:p-7">
      <div className="max-w-2xl">
        <span className="eyebrow">Share your experience</span>

        <h2 className="mt-4 text-2xl font-bold text-white">
          Leave a Client Review
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Your feedback helps others understand what it is like to work with me.
          Reviews are published only after approval.
        </p>
      </div>

      <form onSubmit={submit} className="mt-7 grid gap-4 md:grid-cols-2">
        {/* Client Name */}
        <label className="text-xs text-slate-300">
          Client name <span className="text-rose-400">*</span>
          <input
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            className="field mt-2"
            placeholder="Your full name"
          />
        </label>

        {/* Position */}
        <label className="text-xs text-slate-300">
          Position
          <input
            name="role"
            maxLength={100}
            className="field mt-2"
            placeholder="e.g. Founder"
          />
        </label>

        {/* Company */}
        <label className="text-xs text-slate-300">
          Company
          <input
            name="company"
            maxLength={120}
            className="field mt-2"
            placeholder="Company name"
          />
        </label>

        {/* Rating */}
        <label className="text-xs text-slate-300">
          Rating <span className="text-rose-400">*</span>
          <select name="rating" required defaultValue="" className="field mt-2">
            <option value="" disabled>
              Select a rating
            </option>

            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} out of 5 stars
              </option>
            ))}
          </select>
        </label>

        {/* Review Message */}
        <label className="text-xs text-slate-300 md:col-span-2">
          Review message <span className="text-rose-400">*</span>
          <textarea
            name="review"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="field mt-2"
            placeholder="Tell us about your experience…"
          />
        </label>

        {/* Profile Photo */}
        <label className="text-xs text-slate-300 md:col-span-2">
          Profile photo (optional)
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="field mt-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent/20 file:px-3 file:py-2 file:cursor-pointer cursor-pointer"
          />
          <span className="mt-1 block text-[11px] text-slate-500">
            JPG, PNG or WebP · maximum 3 MB.
          </span>
        </label>

        {/* Success / Error Message */}
        {notice && (
          <p
            role={notice.type === "error" ? "alert" : "status"}
            className={`md:col-span-2 rounded-xl border p-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/20 bg-rose-400/10 text-rose-200"
            }`}
          >
            {notice.text}
          </p>
        )}

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            disabled={busy}
            className="gradient-button disabled:cursor-wait disabled:opacity-60"
            type="submit"
          >
            {busy ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </form>
    </section>
  );
}
