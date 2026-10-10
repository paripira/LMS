// Native scrypt: no extra dependency, runs on libuv's thread pool (parallel across rows).
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';

const derive = (pw: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(pw, salt, 32, (err, key) => (err ? reject(err) : resolve(key))),
  );

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(pw, salt);
  return `s1$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [v, s, h] = stored.split('$');
  if (v !== 's1' || !s || !h) return false;
  const key = await derive(pw, Buffer.from(s, 'base64'));
  const want = Buffer.from(h, 'base64');
  return key.length === want.length && timingSafeEqual(key, want);
}

// No look-alike characters (0/O, 1/l/I) so printed credential sheets are readable.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export function randomPassword(len = 8): string {
  return Array.from(randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join('');
}
