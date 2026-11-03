import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: dashboard pages must be protected even if middleware is
  // skipped or misconfigured in a deployment environment.
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/admin/login");

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) redirect("/admin/login?error=not-admin");

  return <AdminShell>{children}</AdminShell>;
}
