import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = form.get('password');
  const next = (form.get('next') as string) || '/';

  if (typeof password !== 'string' || password !== process.env.AUTH_PASSWORD) {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', '1');
    if (next) url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await createSessionToken();
  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
