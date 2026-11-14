import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rlotxrtdbqtnbglbmyea.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xft8dx8s2qhtL4Upw0oHVQ__trf1mEy";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        }
      },
    },
  });

  // IMPORTANT: Avoid code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Retrieve current demo or explicit role from cookies
  const activeRoleCookie = request.cookies.get("literatrack_role")?.value;

  const hasSession = Boolean(user || activeRoleCookie);
  const effectiveRole = activeRoleCookie || (user?.app_metadata?.role as string) || (user?.user_metadata?.role as string) || "admin";

  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isAuthRoute = pathname === "/login" || pathname === "/reset-password";
  const isProtectedRoute = isAdminRoute || isTeacherRoute || isStudentRoute;

  // 1. Unauthenticated users trying to access protected routes
  if (isProtectedRoute && !hasSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated users visiting login/reset-password -> redirect to their role hub
  if (isAuthRoute && hasSession) {
    const redirectUrl = request.nextUrl.clone();
    if (effectiveRole === "teacher") {
      redirectUrl.pathname = "/teacher";
    } else if (effectiveRole === "student") {
      redirectUrl.pathname = "/student";
    } else {
      redirectUrl.pathname = "/admin";
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Role-based isolation
  if (hasSession && effectiveRole) {
    // Teachers cannot access /admin
    if (isAdminRoute && effectiveRole === "teacher") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/teacher";
      return NextResponse.redirect(redirectUrl);
    }

    // Students cannot access /admin or /teacher
    if ((isAdminRoute || isTeacherRoute) && effectiveRole === "student") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/student";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Avoid caching for protected/auth routes
  if (isProtectedRoute || isAuthRoute) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store");
  }

  return supabaseResponse;
}
