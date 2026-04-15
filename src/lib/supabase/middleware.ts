import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_ROUTES, hasAccess, type SubscriptionTier } from "@/lib/subscription";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Skip auth check if Supabase not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  // OAuth error on root → redirect to login
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.delete("error_code");
    url.searchParams.delete("error_description");
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  // OAuth code on root → redirect to /auth/callback
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Public route ise Supabase'e hiç gitme
  const isProtectedOrAuth =
    request.nextUrl.pathname.startsWith("/panel") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboard") ||
    request.nextUrl.pathname === "/login";

  if (!isProtectedOrAuth) {
    return supabaseResponse;
  }

  // Sadece korumalı rotalarda Supabase client oluştur ve getUser çağır
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Korumalı rota + kullanıcı yok → login'e yönlendir
  const isProtected =
    request.nextUrl.pathname.startsWith("/panel") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboard");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Giriş yapmış kullanıcı /login'e gelirse → panel'e yönlendir
  if (user && request.nextUrl.pathname === "/login") {
    const wantsLogout = request.nextUrl.searchParams.get("logout") === "true";
    if (!wantsLogout) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel/genel";
      return NextResponse.redirect(url);
    }
  }

  // /dashboard → /panel yönlendirmesi
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    const subpath = request.nextUrl.pathname.replace("/dashboard", "/panel");
    url.pathname = subpath === "/panel" ? "/panel/genel" : subpath;
    return NextResponse.redirect(url);
  }

  // RBAC: Plan kontrolü
  if (user) {
    const pathname = request.nextUrl.pathname;
    const requiredTier = Object.entries(PROTECTED_ROUTES).find(
      ([route]) => pathname === route || pathname.startsWith(route + "/"),
    )?.[1] as SubscriptionTier | undefined;

    if (requiredTier) {
      const userPlan = (user.user_metadata?.plan as string) ?? "free";
      if (!hasAccess(userPlan, requiredTier)) {
        const url = request.nextUrl.clone();
        url.pathname = "/panel/upgrade";
        url.searchParams.set("from", pathname);
        url.searchParams.set("required", requiredTier);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
