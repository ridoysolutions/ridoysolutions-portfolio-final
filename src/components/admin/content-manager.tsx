"use client";

import { refreshPublicContent } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";
import { AdminPageSkeleton } from "./admin-skeleton";
import VideoUpload from "./video-upload";
import {
  AdminHeader,
  Field,
  ImageUpload,
  Input,
  SaveButton,
  Select,
  Switch,
  Textarea,
} from "./admin-ui";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image" | "json" | "url" | "video";
  options?: string[];
  help?: string;
  placeholder?: string;
};

const configs: Record<
  string,
  { title: string; description: string; fields: FieldDef[] }
> = {
  services: {
    title: "Services",
    description:
      "Add, edit, reorder, publish or remove the services shown across your portfolio.",
    fields: [
      { key: "title", label: "Service name" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "details_intro",
        label: "Detail page introduction",
        type: "textarea",
        help: "Shown at the top of this service detail page.",
      },
      {
        key: "process_steps",
        label: "Process steps (JSON list)",
        type: "json",
        help: 'Example: ["Research","Implementation","Reporting"]',
      },
      {
        key: "benefits",
        label: "Benefits (JSON list)",
        type: "json",
        help: 'Example: ["Better visibility","Clear reporting"]',
      },
      {
        key: "detail_sections",
        label: "Detailed service content (JSON sections)",
        type: "json",
        help: 'Add as many organized sections as needed. Example: [{"heading":"What this service includes","body":"Explain the service in detail.","bullets":["Content planning","Publishing","Monthly reporting"]}]. Each section supports heading, body, and optional bullets.',
      },
      {
        key: "icon",
        label: "Icon key",
        type: "select",
        options: [
          "users",
          "facebook",
          "google",
          "youtube",
          "location",
          "video",
          "code",
          "thumbnails",
        ],
      },
      {
        key: "color",
        label: "Accent color",
        help: "Hex value such as #168bff",
      },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
  certificates: {
    title: "Certificates",
    description:
      "Manage certificate images, issuer details and credential links.",
    fields: [
      { key: "slug", label: "Unique slug" },
      { key: "title", label: "Title" },
      { key: "issuer", label: "Issuer" },
      { key: "year", label: "Year" },
      { key: "image", label: "Certificate file", type: "image" },
      { key: "credential_url", label: "Credential URL" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
  reviews: {
    title: "Client Reviews",
    description:
      "Manage written testimonials and client photos. Ask clients for permission before publishing identifiable content.",
    fields: [
      { key: "name", label: "Client name" },
      { key: "title", label: "Project / service title", help: "Shown prominently on the public review card." },
      { key: "role", label: "Role" },
      { key: "company", label: "Company" },
      {
        key: "photo",
        label: "Client photo",
        type: "image",
        help: "Upload to Supabase Storage.",
      },
      { key: "review", label: "Review", type: "textarea" },
      { key: "rating", label: "Rating", type: "number", help: "1 to 5" },
      { key: "status", label: "Approval status", type: "select", options: ["pending", "approved"], help: "Only approved reviews are visible publicly." },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
  video_reviews: {
    title: "Client Video Reviews",
    description:
      "Upload short client video testimonials to Supabase Storage. Visitors only load a video after clicking its thumbnail, with a responsive player and loading spinner.",
    fields: [
      { key: "client_name", label: "Client name" },
      { key: "role", label: "Role" },
      { key: "company", label: "Company" },
      {
        key: "thumbnail",
        label: "Thumbnail image",
        type: "image",
        help: "Upload a JPG, PNG or WebP image; the admin panel will save its public URL automatically. Optional if the video provider displays its own preview.",
      },
      {
        key: "video_url",
        label: "Video file",
        type: "video",
        help: "Upload an MP4, WebM, or MOV file (50 MB maximum). MP4/H.264 is recommended. Existing YouTube reviews continue to work until you replace them with an uploaded file.",
      },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
  process_steps: {
    title: "Process",
    description: "Control the workflow section and add more steps when needed.",
    fields: [
      { key: "number", label: "Step number" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
  case_studies: {
    title: "Case Studies",
    description:
      "Manage campaign results and detail pages. JSON fields keep multiple metrics in one record without changing the database every time.",
    fields: [
      { key: "slug", label: "Unique slug" },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: ["Google Ads", "Meta Ads", "SEO", "Social Media", "YouTube", "Thumbnails"],
      },
      { key: "title", label: "Title" },
      { key: "description", label: "Short description", type: "textarea" },
      {
        key: "metrics",
        label: "Metrics JSON",
        type: "json",
        help: 'Example: [{"label":"Sales","value":"+245%"}]',
      },
      {
        key: "visual",
        label: "Visual key",
        type: "select",
        options: ["google", "meta", "seo", "social", "youtube", "thumbnails"],
      },
      { key: "challenge", label: "Challenge", type: "textarea" },
      {
        key: "strategy",
        label: "Strategy JSON",
        type: "json",
        help: 'Example: ["Keyword research","Testing"]',
      },
      { key: "outcome", label: "Outcome", type: "textarea" },
      // { key: "before_stats", label: "Before stats JSON", type: "json" },
      // { key: "after_stats", label: "After stats JSON", type: "json" },
      {
        key: "card_image",
        label: "Card image",
        type: "image",
        help: "Image shown on the homepage and All Case Studies cards.",
      },
      {
        key: "before_image",
        label: "Before image (optional)",
        type: "image",
        help: "Use this only when you have a genuine before-and-after comparison. Leave empty for a single-result case study.",
      },
      {
        key: "after_image",
        label: "After / Result image",
        type: "image",
        help: "Upload the final result screenshot. For a single-image case study (e.g. Google Ads or thumbnails), upload the one result image here and leave Before image empty.",
      },
      { key: "sort_order", label: "Display order", type: "number" },
    ],
  },
};

function portfolioStoragePath(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    const marker = "/storage/v1/object/public/portfolio-media/";
    const index = url.pathname.indexOf(marker);
    if (index < 0) return null;
    const path = url.pathname.slice(index + marker.length).split("?")[0];
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

async function removePortfolioFiles(values: unknown[]) {
  const paths = [...new Set(values.map(portfolioStoragePath).filter((path): path is string => Boolean(path)))];
  if (!paths.length) return;
  const { error } = await createClient().storage.from("portfolio-media").remove(paths);
  if (error) console.warn("Could not remove an unused portfolio media file:", error.message);
}

const requiredFields: Record<string, string[]> = {
  services: ["title", "description", "icon"],
  certificates: ["slug", "title", "issuer", "image"],
  reviews: ["name", "review", "rating"],
  video_reviews: ["client_name"],
  process_steps: ["number", "title", "description"],
  case_studies: [
    "slug",
    "category",
    "title",
    "description",
    "visual",
    "challenge",
    "strategy",
    "outcome",
  ],
};

const isMissingRequiredValue = (
  field: FieldDef | undefined,
  value: unknown,
) => {
  if (value === undefined || value === null || String(value).trim() === "")
    return true;
  if (field?.type === "json") {
    try {
      const parsed = JSON.parse(String(value));
      return !Array.isArray(parsed) || parsed.length === 0;
    } catch {
      return true;
    }
  }
  return false;
};

const empty = (fields: FieldDef[]) =>
  Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.type === "number"
        ? field.key === "rating"
          ? ""
          : 0
        : field.type === "json"
          ? "[]"
          : field.key === "status"
            ? "pending"
            : "",
    ]),
  );

export default function ContentManager({
  table,
}: {
  table: keyof typeof configs;
}) {
  const cfg = configs[table];
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty(cfg.fields));
  const [originalForm, setOriginalForm] = useState<any>(empty(cfg.fields));
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const { data, error } = await createClient()
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) setError(error.message);
    else setRows(data || []);
    setInitialLoading(false);
  };

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void load();

    const channel = supabase
      .channel(`admin-content-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        if (active) void load();
      })
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [table]);

  const edit = (row: any) => {
    const next: any = { ...empty(cfg.fields), ...row };
    for (const field of cfg.fields) {
      if (field.type === "json" && typeof next[field.key] !== "string") {
        next[field.key] = JSON.stringify(next[field.key] || [], null, 2);
      }
    }
    setForm(next);
    setOriginalForm(next);
    setEditing(row.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (key: string, value: any) =>
    setForm((current: any) => ({ ...current, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const required = requiredFields[table] || [];
    const missing = required.filter((key) =>
      isMissingRequiredValue(
        cfg.fields.find((field) => field.key === key),
        form[key],
      ),
    );
    if (missing.length) {
      const labels = missing.map(
        (key) => cfg.fields.find((field) => field.key === key)?.label || key,
      );
      setError(
        `Please complete required field${labels.length > 1 ? "s" : ""}: ${labels.join(", ")}.`,
      );
      return;
    }
    if (table === "reviews") {
      if (form.status === "approved" && !String(form.title || "").trim() && (!editing || originalForm.status !== "approved")) {
        setError("Assign a project / service title before approving this review.");
        return;
      }
      const rating = Number(form.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        setError("Rating must be a whole number from 1 to 5.");
        return;
      }
    }
    if (editing && JSON.stringify(form) === JSON.stringify(originalForm)) {
      setError("No changes detected. Update at least one field before saving.");
      return;
    }

    setLoading(true);
    const payload: any = { ...form, published: table === "reviews" ? form.status === "approved" : (form.published ?? true) };
    if (table === "reviews") payload.status = payload.status || "pending";

    if (table === "video_reviews" && !editing && !portfolioStoragePath(payload.video_url)) {
      setLoading(false);
      setError("Please upload a video file from Supabase Storage before adding this review.");
      return;
    }

    for (const field of cfg.fields) {
      if (field.type === "json") {
        try {
          payload[field.key] = JSON.parse(payload[field.key] || "[]");
        } catch {
          setLoading(false);
          setError(`${field.label} contains invalid JSON.`);
          return;
        }
      }
    }

    for (const field of cfg.fields) {
      if (field.type === "number")
        payload[field.key] = Number(payload[field.key] || 0);
    }

    const result = editing
      ? await createClient().from(table).update(payload).eq("id", editing)
      : await createClient().from(table).insert(payload);

    if (result.error) {
      setError(result.error.message);
    } else {
      if (editing && table === "video_reviews") {
        await removePortfolioFiles([
          originalForm.video_url !== payload.video_url ? originalForm.video_url : "",
          originalForm.thumbnail !== payload.thumbnail ? originalForm.thumbnail : "",
        ]);
      }
      await refreshPublicContent();
      setMessage(editing ? "Updated successfully." : "Added successfully.");
      const nextEmpty = empty(cfg.fields);
      setForm(nextEmpty);
      setOriginalForm(nextEmpty);
      setEditing(null);
      await load();
    }

    setLoading(false);
  };

  const remove = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setError("");
    const { error } = await createClient()
      .from(table)
      .delete()
      .eq("id", pendingDelete.id);
    if (error) {
      setError(error.message);
    } else {
      if (table === "video_reviews") {
        const removedRow = rows.find((row) => row.id === pendingDelete.id);
        if (removedRow) await removePortfolioFiles([removedRow.video_url, removedRow.thumbnail]);
      }
      setPendingDelete(null);
      await refreshPublicContent();
      await load();
    }
    setDeleting(false);
  };

  if (initialLoading) return <AdminPageSkeleton />;

  return (
    <div>
      <AdminHeader
        eyebrow="Content Management"
        title={cfg.title}
        description={cfg.description}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form
          onSubmit={save}
          className="rounded-2xl border border-accent/20 bg-[#061224]/60 p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              {editing ? "Edit item" : "Add new item"}
            </h2>
            {editing && (
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-white"
                onClick={() => {
                  setEditing(null);
                  const nextEmpty = empty(cfg.fields);
                  setForm(nextEmpty);
                  setOriginalForm(nextEmpty);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {cfg.fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.type === "textarea" ||
                  field.type === "json" ||
                  field.type === "image" ||
                  field.type === "video"
                    ? "md:col-span-2"
                    : ""
                }
              >
                <Field label={field.label} help={field.help}>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={form[field.key] ?? ""}
                      onChange={(e: any) => set(field.key, e.target.value)}
                    />
                  ) : field.type === "json" ? (
                    <Textarea
                      className="font-mono text-[11px]"
                      value={form[field.key] ?? "[]"}
                      onChange={(e: any) => set(field.key, e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={form[field.key] ?? ""}
                      onChange={(e: any) => set(field.key, e.target.value)}
                    >
                      <option value="">Select…</option>
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </Select>
                  ) : field.type === "image" ? (
                    <ImageUpload
                      value={form[field.key] ?? ""}
                      onChange={(value) => set(field.key, value)}
                      folder={table}
                    />
                  ) : field.type === "video" ? (
                    <VideoUpload
                      value={form[field.key] ?? ""}
                      onChange={(value) => set(field.key, value)}
                    />
                  ) : (
                    <Input
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "url"
                            ? "url"
                            : "text"
                      }
                      min={field.key === "rating" ? 1 : undefined}
                      max={field.key === "rating" ? 5 : undefined}
                      step={field.key === "rating" ? 1 : undefined}
                      placeholder={
                        field.placeholder ||
                        (field.key === "rating" ? "1–5" : undefined)
                      }
                      value={form[field.key] ?? ""}
                      onChange={(e: any) => set(field.key, e.target.value)}
                    />
                  )}
                </Field>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            {table !== "reviews" && <Switch
              checked={Boolean(form.published ?? true)}
              onChange={(value) => set("published", value)}
            />}
            <SaveButton
              loading={loading}
              disabled={
                (requiredFields[table] || []).some((key) =>
                  isMissingRequiredValue(
                    cfg.fields.find((field) => field.key === key),
                    form[key],
                  ),
                ) ||
                (table === "reviews" &&
                  (!Number.isInteger(Number(form.rating)) ||
                    Number(form.rating) < 1 ||
                    Number(form.rating) > 5)) ||
                (Boolean(editing) &&
                  JSON.stringify(form) === JSON.stringify(originalForm))
              }
            />
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-300">
              {message}
            </p>
          )}
        </form>

        <div className="space-y-3">
          <h2 className="font-bold">Current items ({rows.length})</h2>
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-white/10 bg-[#061224]/45 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {row.title || row.name || row.client_name || row.number}
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {row.company || row.category || row.description || ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(row)}
                    className="rounded-lg border border-accent/20 px-2.5 py-1.5 text-[10px] text-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingDelete({
                        id: row.id,
                        label: String(
                          row.title ||
                            row.name ||
                            row.client_name ||
                            row.number ||
                            "this item",
                        ),
                      })
                    }
                    className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[10px] text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {table === "reviews" && (
                <div className="mt-3 space-y-2 rounded-xl border border-white/5 bg-black/10 p-3">
                  {row.photo && <img src={row.photo} alt={`${row.name} profile`} className="h-12 w-12 rounded-full object-cover" />}
                  <p className="text-xs leading-5 text-slate-300">{row.review}</p>
                  <p className="text-[10px] text-amber-200">Rating: {row.rating}/5</p>
                  <p className="text-[10px] text-slate-500">{row.role || "Position not provided"}{row.company ? ` · ${row.company}` : ""}</p>
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {table === "reviews" ? (
                  <>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${row.status === "approved" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
                      {row.status === "approved" ? "Approved" : "Pending"}
                    </span>
                    {row.status !== "approved" && row.title && (
                      <button type="button" onClick={async () => {
                        const { error } = await createClient().from("reviews").update({ status: "approved", published: true }).eq("id", row.id);
                        if (error) setError(error.message);
                        else { await refreshPublicContent(); await load(); setMessage("Review approved and published."); }
                      }} className="rounded-lg border border-emerald-400/20 px-2.5 py-1.5 text-[10px] text-emerald-300">Approve</button>
                    )}
                    {row.status !== "approved" && !row.title && <span className="text-[10px] text-slate-500">Edit to assign a project title before approval.</span>}
                  </>
                ) : (
                  <Switch
                    checked={row.published !== false}
                    label="Published"
                    onChange={async (value) => {
                      const { error } = await createClient()
                        .from(table)
                        .update({ published: value })
                        .eq("id", row.id);
                      if (!error) await refreshPublicContent();
                      await load();
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {!rows.length && (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-500">
              No items yet.
            </div>
          )}
        </div>
      </div>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting)
              setPendingDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
            className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#071321] p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300">
              <span aria-hidden="true">!</span>
            </div>
            <h2
              id="delete-confirm-title"
              className="mt-4 text-lg font-bold text-white"
            >
              Delete this item?
            </h2>
            <p
              id="delete-confirm-description"
              className="mt-2 text-sm leading-6 text-slate-400"
            >
              You are about to permanently delete{" "}
              <strong className="text-slate-200">{pendingDelete.label}</strong>.
              This action cannot be undone.
            </p>
            {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={remove}
                className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-500/25 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
