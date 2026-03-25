import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Skip auth check if Supabase not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

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

  // If OAuth error lands on root (bad_oauth_state etc.), redirect to login with error
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.delete("error_code");
    url.searchParams.delete("error_description");
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  // If OAuth code lands on root, redirect to /auth/callback
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Refresh session — DO NOT remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /panel, /dashboard and /onboard routes — redirect to /login if no session
  const isProtected =
    request.nextUrl.pathname.startsWith("/panel") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboard");
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /login (unless they want to log out)
  if (user && request.nextUrl.pathname === "/login") {
    const wantsLogout = request.nextUrl.searchParams.get("logout") === "true";
    if (!wantsLogout) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel/genel";
      return NextResponse.redirect(url);
    }
  }

  // Redirect old /dashboard routes to new /panel routes
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    const subpath = request.nextUrl.pathname.replace("/dashboard", "/panel");
    url.pathname = subpath === "/panel" ? "/panel/genel" : subpath;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
