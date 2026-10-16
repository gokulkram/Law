import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs only for /admin. Refreshes the Supabase session cookie and sends signed-out visitors to the
// login page. Pages and Server Actions re-check access themselves (lib/admin/auth.ts).
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new NextResponse("Admin panel is not configured (Supabase environment variables are missing).", { status: 503 });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const { pathname, search } = request.nextUrl;
  const onLogin = pathname === "/admin/login";

  if (!data?.claims && !onLogin) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return withCookies(NextResponse.redirect(login), response);
  }
  if (data?.claims && onLogin && !request.nextUrl.searchParams.has("error")) {
    return withCookies(NextResponse.redirect(new URL("/admin", request.url)), response);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

// Keep any refreshed session cookies when answering with a redirect instead.
function withCookies(redirect: NextResponse, from: NextResponse) {
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
  return redirect;
}

export const config = {
  matcher: ["/admin/:path*"],
};
