import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

/**
 * Routes that require an authenticated session.
 * Any route that starts with one of these prefixes will redirect to /login
 * if the user is not signed in.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/coaching',
  '/profile/edit',
  '/settings',
  '/billing',
];

/**
 * Routes only accessible when NOT authenticated.
 * Signed-in users visiting these are redirected to /dashboard.
 */
const AUTH_ONLY_PREFIXES = ['/login', '/signup', '/auth/callback/error'];

/**
 * Refreshes the Supabase session on every request and enforces route-level
 * access control.  Must be called from `middleware.ts` at the project root.
 *
 * @example
 * // middleware.ts
 * export { updateSession as middleware } from '@/lib/supabase/middleware';
 * export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Start with a plain pass-through response that we may redirect or mutate.
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward cookies to both the request and the response so that the
          // refreshed session is visible to downstream Server Components.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: use getUser() (not getSession()) to avoid trusting unvalidated
  // JWT data stored in the browser cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Redirect unauthenticated users away from protected routes ──
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect authenticated users away from auth-only routes ──
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isAuthOnly && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
