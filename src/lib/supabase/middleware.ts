import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOperator } from "@/lib/operator";

/**
 * Operator-product middleware. Only the /panel surface requires auth; the
 * landing page and link-only report pages (gh7.ai/<token>) are fully public.
 *
 * Production host split (panel.gh7.ai -> /panel) is wired here too: when the
 * request host starts with "panel.", the path is served from /panel internally.
 */
export async function updateSession(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const onPanelHost = host.startsWith("panel.");

  // Map panel.gh7.ai/* onto the /panel/* route tree.
  const effectivePath =
    onPanelHost && !url.pathname.startsWith("/panel")
      ? "/panel" + (url.pathname === "/" ? "" : url.pathname)
      : url.pathname;

  const isPanel = effectivePath.startsWith("/panel");
  const isPanelLogin = effectivePath.startsWith("/panel/login");

  // Helper: produce the base response, applying the host rewrite if needed.
  const baseResponse = () => {
    if (onPanelHost && !url.pathname.startsWith("/panel")) {
      const rewrite = url.clone();
      rewrite.pathname = effectivePath;
      return NextResponse.rewrite(rewrite, { request });
    }
    return NextResponse.next({ request });
  };

  // Public surfaces: no Supabase call at all.
  if (!isPanel || isPanelLogin) {
    return baseResponse();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const loginRedirect = () => {
    const r = url.clone();
    r.pathname = "/panel/login";
    r.search = "";
    return NextResponse.redirect(r);
  };

  if (!supabaseUrl || !supabaseKey) return loginRedirect();

  let response = baseResponse();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = baseResponse();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOperator(user.email)) {
    return loginRedirect();
  }

  return response;
}
