/**
 * Pure TypeScript JWT Implementation
 * Standard Header.Payload.Signature format (RFC 7519)
 * Compatible with React Native, Hermes, iOS, Android, and Web.
 */

// Simple, reliable pure-JS base64 encoding/decoding without external dependencies
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function base64Encode(input: string): string {
  const str = unescape(encodeURIComponent(input));
  let output = '';
  for (let block = 0, charCode, i = 0, map = CHARS; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error("'base64Encode' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
}

export function base64Decode(input: string): string {
  const str = input.replace(/=+$/, '');
  if (str.length % 4 === 1) {
    throw new Error("'base64Decode' failed: The string to be decoded is not correctly encoded.");
  }
  let output = '';
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = CHARS.indexOf(buffer);
  }
  return decodeURIComponent(escape(output));
}

export function base64UrlEncode(input: string): string {
  return base64Encode(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64Decode(base64);
}

// Pseudo HMAC-SHA256 hash generator for robust JWT signature simulation
export function generateSignature(headerB64: string, payloadB64: string, secret: string = 'smartcanteen_secret_key_2026'): string {
  const data = `${headerB64}.${payloadB64}.${secret}`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0x27d4eb2f;

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 0x01000193);

    hash2 ^= char;
    hash2 = Math.imul(hash2, 0x000001b3);
  }

  const rawHash = `${(hash1 >>> 0).toString(16).padStart(8, '0')}${(hash2 >>> 0).toString(16).padStart(8, '0')}${Date.now().toString(16)}`;
  return base64UrlEncode(rawHash);
}

export interface JwtPayload {
  sub: string;
  name: string;
  role: 'siswa' | 'pengelola' | 'guest';
  detail: string;
  iat: number;
  exp: number;
  jti: string;
  tokenType: 'access' | 'refresh';
}

export interface DecodedJwt {
  header: { alg: string; typ: string };
  payload: JwtPayload;
  signature: string;
}

export function createJwtToken(
  user: { username: string; name: string; role: 'siswa' | 'pengelola' | 'guest'; detail: string },
  expiresInSeconds: number = 3600,
  tokenType: 'access' | 'refresh' = 'access'
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user.username,
    name: user.name,
    role: user.role,
    detail: user.detail,
    iat: now,
    exp: now + expiresInSeconds,
    jti: `jwt_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    tokenType,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = generateSignature(headerB64, payloadB64);

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function decodeJwtToken(token: string): DecodedJwt | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch (e) {
    return null;
  }
}

export function verifyJwtToken(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  const decoded = decodeJwtToken(token);
  if (!decoded) {
    return { valid: false, error: 'Format Token JWT tidak valid (harus 3 segmen: header.payload.signature)' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (decoded.payload.exp && decoded.payload.exp < now) {
    return { valid: false, error: 'Token JWT telah kedaluwarsa (Expired)' };
  }

  return { valid: true, payload: decoded.payload };
}
