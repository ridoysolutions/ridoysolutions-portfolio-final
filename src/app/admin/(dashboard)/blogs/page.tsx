import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from "@/app/admin/actions";
import BlogSubmitButton from "@/components/admin/blog-submit-button";
import DirtyForm from "@/components/admin/dirty-form";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function BlogsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const notice = await searchParams;
  let posts: any[] = [];
  try {
    const { data } = await createAdminClient()
      .from("blog_posts")
      .select("id,title,slug,excerpt,content,cover_image,published,created_at")
      .order("created_at", { ascending: false });
    posts = data || [];
  } catch {}
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Blog management</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create drafts, publish articles, and remove posts from your public
          blog.
        </p>
      </div>
      {notice.status && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${notice.status === "error" ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-[#8fca00]/30 bg-[#8fca00]/10 text-lime-200"}`}
        >
          {notice.status === "created"
            ? "✓ Blog post created successfully."
            : notice.status === "updated"
              ? "✓ Blog post updated successfully."
              : notice.status === "deleted"
                ? "✓ Blog post deleted successfully."
                : `Could not save blog post: ${notice.message || "Please check your inputs and try again."}`}
        </div>
      )}
      <form
        action={createBlogPost}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[.03] p-5"
      >
        <h2 className="text-lg font-bold">Create a blog post</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Title
            <input
              required
              name="title"
              className="field mt-2"
              placeholder="Article title"
            />
          </label>
          <label className="text-sm">
            URL slug
            <input
              required
              name="slug"
              className="field mt-2"
              placeholder="article-url-slug"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Cover image (upload from your device)
            <input
              type="file"
              name="cover_file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="field mt-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#5937D4] file:text-white/75 file:cursor-pointer file:px-3 file:py-2 file:font-semibold file:text-[#102b43]"
            />
            <span className="mt-1 block text-xs text-slate-500">
              JPG, PNG, WebP or other image · maximum 8 MB. Uploaded securely to
              Supabase Storage.
            </span>
          </label>
          <label className="text-sm md:col-span-2">
            Short excerpt
            <textarea
              name="excerpt"
              className="field mt-2 min-h-20"
              placeholder="A short summary for the blog card"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Article content
            <textarea
              required
              name="content"
              className="field mt-2 min-h-64"
              placeholder="Write the complete article. Separate paragraphs with blank lines. Use headings on their own lines, for example: ## What is SEO? and ### Key benefits. Use lines starting with - for bullet lists."
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" /> Publish immediately
        </label>
        <BlogSubmitButton label="Save blog post" pendingLabel="Saving post…" />
      </form>
      <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <h2 className="text-lg font-bold">Existing posts</h2>
        {posts.length ? (
          <div className="mt-4 divide-y divide-white/10">
            {posts.map((p) => (
              <details
                key={p.id}
                className="group border-b border-white/10 py-3 last:border-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-3 py-3 transition hover:bg-white/[.04] [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{p.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">/blog/{p.slug}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${p.published ? "bg-lime-400/10 text-lime-300" : "bg-white/10 text-slate-400"}`}>{p.published ? "Published" : "Draft"}</span>
                    <span className="text-xs text-accent group-open:rotate-180 transition">⌄</span>
                  </span>
                </summary>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-4">
                <DirtyForm
                  action={updateBlogPost}
                  className="grid gap-3 md:grid-cols-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <label className="text-sm">
                    Title
                    <input
                      required
                      name="title"
                      defaultValue={p.title}
                      className="field mt-1"
                    />
                  </label>
                  <label className="text-sm">
                    Slug
                    <input
                      required
                      name="slug"
                      defaultValue={p.slug}
                      className="field mt-1"
                    />
                  </label>
                  <input
                    type="hidden"
                    name="current_cover_image"
                    value={p.cover_image || ""}
                  />
                  <div className="text-sm md:col-span-2">
                    {p.cover_image && (
                      <img
                        src={p.cover_image}
                        alt="Current cover"
                        className="mb-3 h-32 w-56 rounded-xl border border-white/10 object-cover"
                      />
                    )}
                    <label>
                      Replace cover image
                      <input
                        type="file"
                        name="cover_file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="field mt-1 file:mr-3 file:rounded-lg file:border-0 file:bg-[#5937D4] file:text-white/75 file:cursor-pointer file:px-3 file:py-2 file:font-semibold"
                      />
                    </label>
                    <span className="mt-1 block text-xs text-slate-500">
                      Leave empty to keep the current cover image. Maximum 8 MB.
                    </span>
                  </div>
                  <label className="text-sm md:col-span-2">
                    Excerpt
                    <textarea
                      name="excerpt"
                      defaultValue={p.excerpt || ""}
                      className="field mt-1 min-h-16"
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    Full article content
                    <textarea
                      required
                      name="content"
                      defaultValue={p.content}
                      className="field mt-1 min-h-64"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      For organized article formatting, put headings on separate
                      lines using ## or ### and start bullet points with -.
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={p.published}
                    />{" "}
                    Published
                  </label>
                  <div className="flex gap-2">
                    <BlogSubmitButton
                      label="Update post"
                      pendingLabel="Updating post…"
                    />
                  </div>
                </DirtyForm>
                <form action={deleteBlogPost} className="mt-3">
                  <input type="hidden" name="id" value={p.id} />
                  <button className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300">
                    Delete post
                  </button>
                </form>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No blog posts yet. Create your first article above.
          </p>
        )}
      </section>
    </div>
  );
}
