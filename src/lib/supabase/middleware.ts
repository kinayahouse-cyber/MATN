import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
// Portail client : accès par jeton opaque dans l'URL, pas par session Supabase — toute la
// branche est publique, l'authentification se fait au niveau de la page (jeton valide ou 404).
const PUBLIC_PREFIXES = ['/portail/'];

// Échappatoire de développement local : permet d'inspecter l'UI sans session Supabase, contre
// une base Postgres locale. Doublement verrouillée (NODE_ENV + variable explicite) et
// impossible à activer dans un build de production, où NODE_ENV vaut toujours 'production'.
const AUTH_DISABLED =
  process.env.NODE_ENV === 'development' && process.env.MATN_DEV_DISABLE_AUTH === '1';

export async function updateSession(request: NextRequest) {
  if (AUTH_DISABLED) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}
