import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/admin/login";
  const isProtectedAdminRoute = pathname.startsWith("/admin/") &&
    !["/admin/login", "/admin/reset-password", "/admin/setup-password"].includes(pathname);

  // Only trust a verified Supabase user, not the presence of a client-side session cookie.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (isProtectedAdminRoute) {
    if (userError || !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut({ scope: "local" });
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("error", "not-admin");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user && !userError) {
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (!adminError && isAdmin === true) {
      const url = request.nextUrl.clone();
      const next = request.nextUrl.searchParams.get("next");
      url.pathname = next?.startsWith("/admin/") && next !== "/admin/login"
        ? next
        : "/admin/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!adminError || user) {
      await supabase.auth.signOut({ scope: "local" });
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
