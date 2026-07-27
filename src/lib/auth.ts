// Session signée (HMAC-SHA256, Web Crypto — compatible Edge middleware).
// Mono-utilisateur pour l'instant : le payload porte un `sub` fixe, mais la
// forme (payload signé + cookie) est celle qu'un vrai multi-compte réutilisera
// telle quelle plus tard (il suffira d'y mettre un vrai userId).

export const SESSION_COOKIE = 'matn_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

type SessionPayload = { sub: string; iat: number };

function base64urlEncode(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  const str = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(str.length));
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error('AUTH_SESSION_SECRET manquant');
  return secret;
}

export async function createSessionToken(sub = 'app'): Promise<string> {
  const payload: SessionPayload = { sub, iat: Date.now() };
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(getSecret());
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = base64urlEncode(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return false;

  try {
    const key = await hmacKey(getSecret());
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return false;

    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    return Date.now() - payload.iat < SESSION_TTL_MS;
  } catch {
    return false;
  }
}
