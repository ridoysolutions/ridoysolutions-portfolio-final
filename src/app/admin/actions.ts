"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.rpc("is_admin");
  if (error || !data) throw new Error("Admin access required");

  return user;
}

export async function refreshPublicContent() {
  await requireAdmin();
  revalidatePath("/", "layout");
  for (const tag of ["portfolio-profile", "portfolio-services", "portfolio-certificates", "portfolio-case-studies", "portfolio-reviews", "portfolio-video-reviews", "portfolio-process", "portfolio-settings"]) {
    revalidateTag(tag);
  }
}

export async function listAdminUsers() {
  await requireAdmin();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_users")
    .select("user_id,email,created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addAdminUser(emailInput: string) {
  const currentUser = await requireAdmin();
  const email = emailInput.trim().toLowerCase();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (email === currentUser.email?.toLowerCase()) {
    throw new Error("This account is already an admin.");
  }

  const admin = createAdminClient();

  const { data: existingAdmins, error: existingAdminError } = await admin
    .from("admin_users")
    .select("user_id,email")
    .ilike("email", email)
    .limit(1);

  if (existingAdminError) throw new Error(existingAdminError.message);
  if (existingAdmins?.length) {
    throw new Error("That email already has admin access.");
  }

  // If the email already has a Supabase Auth account, grant admin access
  // immediately. Otherwise invite the person to create their account.
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) throw new Error(usersError.message);

  const existingUser = usersData.users.find(
    (u) => u.email?.toLowerCase() === email,
  );

  let userId = existingUser?.id;

  if (!userId) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback?next=/admin/setup-password`;

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Could not send the admin invitation.");
    }

    userId = data.user.id;
  }

  const { error: insertError } = await admin.from("admin_users").insert({
    user_id: userId,
    email,
  });

  if (insertError) {
    // If the Auth user was invited successfully but the membership insert
    // failed, do not hide the database error.
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/settings");
  return existingUser
    ? "Admin access granted to the existing Supabase user."
    : "Invitation sent. The user can accept it and set a password.";
}

export async function removeAdminUser(userId: string) {
  const currentUser = await requireAdmin();

  if (userId === currentUser.id) {
    throw new Error("You cannot remove your own admin access.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("admin_users")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
  return "Admin access removed.";
}


export async function syncAdminEmail(email: string) {
  const user = await requireAdmin();
  const nextEmail = email.trim().toLowerCase();

  const admin = createAdminClient();
  const { error } = await admin
    .from("admin_users")
    .update({ email: nextEmail })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
  return "Admin email synchronized.";
}

async function uploadBlogCover(admin: ReturnType<typeof createAdminClient>, fileValue: FormDataEntryValue | null) {
  if (!(fileValue instanceof File) || fileValue.size === 0) return null;
  if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(fileValue.type)) redirect(`/admin/blogs?status=error&message=${encodeURIComponent("Cover image must be JPG, PNG, WebP, GIF, or AVIF.")}`);
  if (fileValue.size > 8 * 1024 * 1024) redirect(`/admin/blogs?status=error&message=${encodeURIComponent("Cover image must be 8 MB or smaller.")}`);
  const extension = (fileValue.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await admin.storage.from("blog-images").upload(path, fileValue, {
    contentType: fileValue.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) redirect(`/admin/blogs?status=error&message=${encodeURIComponent(`Could not upload cover image: ${error.message}. Check the blog-images Storage bucket and its permissions.`)}`);
  return admin.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}

function normalizeBlogSlug(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function createBlogPost(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const title = String(formData.get("title") || "").trim();
  const slug = normalizeBlogSlug(String(formData.get("slug") || ""));
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const published = formData.get("published") === "on";
  if (!title || !slug || !content) redirect(`/admin/blogs?status=error&message=${encodeURIComponent("Title, URL slug, and article content are required.")}`);
  const cover_image = await uploadBlogCover(admin, formData.get("cover_file"));
  const { error } = await admin.from("blog_posts").insert({ title, slug, excerpt, content, cover_image, published, published_at: published ? new Date().toISOString() : null });
  if (error) {
    const message = error.message.toLowerCase().includes("cover_image") || error.code === "PGRST204"
      ? "Blog database is missing the cover_image column. Run MIGRATION-BLOG-SERVICES.sql in Supabase SQL Editor, then retry."
      : error.message;
    redirect(`/admin/blogs?status=error&message=${encodeURIComponent(message)}`);
  }
  revalidatePath("/blog"); revalidatePath(`/blog/${slug}`); revalidatePath("/admin/blogs");
  redirect("/admin/blogs?status=created");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect(`/admin/blogs?status=error&message=${encodeURIComponent("Post ID is required.")}`);
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) redirect(`/admin/blogs?status=error&message=${encodeURIComponent(error.message)}`);
  revalidatePath("/blog"); revalidatePath("/admin/blogs");
  redirect("/admin/blogs?status=deleted");
}

export async function updateBlogPost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = normalizeBlogSlug(String(formData.get("slug") || ""));
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const currentCover = String(formData.get("current_cover_image") || "").trim();
  const published = formData.get("published") === "on";
  if (!id || !title || !slug || !content) redirect(`/admin/blogs?status=error&message=${encodeURIComponent("Post ID, title, URL slug, and article content are required.")}`);
  const admin = createAdminClient();
  const newCover = await uploadBlogCover(admin, formData.get("cover_file"));
  const { error } = await admin.from("blog_posts").update({ title, slug, excerpt, content, cover_image: newCover || currentCover || null, published, published_at: published ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    const message = error.message.toLowerCase().includes("cover_image") || error.code === "PGRST204"
      ? "Blog database is missing the cover_image column. Run MIGRATION-BLOG-SERVICES.sql in Supabase SQL Editor, then retry."
      : error.message;
    redirect(`/admin/blogs?status=error&message=${encodeURIComponent(message)}`);
  }
  revalidatePath("/blog"); revalidatePath(`/blog/${slug}`); revalidatePath("/admin/blogs");
  redirect("/admin/blogs?status=updated");
}
