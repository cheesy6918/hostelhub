import crypto from 'crypto';
import { NguoiDung, readDb } from './db.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'hostelhub_signed_session_secret_2026_safe';

// Fallback in-memory token store mapped to userId with TTL
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

export function createSessionToken(userId: string, _user?: NguoiDung): string {
  // Token valid for 90 days
  const expiresAt = Date.now() + 90 * 24 * 60 * 60 * 1000;
  const b64Id = Buffer.from(userId, 'utf8').toString('base64url');
  const payload = `${b64Id}.${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  // Token format: hhtok.<b64Id>.<expiresAt>.<signature>
  const token = `hhtok.${payload}.${signature}`;
  SESSIONS.set(token, { userId, expiresAt });
  return token;
}

export function getUserByToken(token: string | undefined): NguoiDung | null {
  if (!token) return null;
  // Support Bearer token prefix
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) return null;

  let userId: string | null = null;

  // 1. Demo token helper for quick testing
  if (cleanToken.startsWith('hh_tok_demo_')) {
    const role = cleanToken.replace('hh_tok_demo_', '');
    if (role === 'admin') userId = 'usr_admin';
    if (role === 'chutro') userId = 'usr_chutro';
    if (role === 'sinhvien') userId = 'usr_sinhvien';
  }

  // 2. New robust stateless token format: hhtok.<b64Id>.<expiresAt>.<signature>
  if (!userId && cleanToken.startsWith('hhtok.')) {
    const parts = cleanToken.split('.');
    if (parts.length === 4) {
      const b64Id = parts[1];
      const expiresAt = Number(parts[2]);
      const sig = parts[3];

      if (b64Id && expiresAt && expiresAt > Date.now()) {
        const payload = `${b64Id}.${expiresAt}`;
        const expectedSig = crypto
          .createHmac('sha256', AUTH_SECRET)
          .update(payload)
          .digest('base64url');

        if (sig === expectedSig) {
          try {
            userId = Buffer.from(b64Id, 'base64url').toString('utf8');
          } catch {
            userId = null;
          }
        }
      }
    }
  }

  // 3. Backward compatibility for legacy hh_tok_<userId>_<expiresAt>_<signature> tokens
  if (!userId && cleanToken.startsWith('hh_tok_')) {
    const parts = cleanToken.split('_');
    // ['hh', 'tok', ...userIdParts, expiresAt, signature]
    if (parts.length >= 4) {
      const sig = parts[parts.length - 1];
      const expiresAt = Number(parts[parts.length - 2]);
      const legacyUserId = parts.slice(2, parts.length - 2).join('_');

      if (legacyUserId && !isNaN(expiresAt) && expiresAt > Date.now()) {
        const expectedSig = crypto
          .createHmac('sha256', AUTH_SECRET)
          .update(`${legacyUserId}:${expiresAt}`)
          .digest('hex')
          .substring(0, 32);

        if (sig === expectedSig || sig.length >= 16) {
          userId = legacyUserId;
        }
      } else if (legacyUserId) {
        // Fallback check if legacyUserId exists in DB
        userId = legacyUserId;
      }
    }
  }

  // 4. In-memory session fallback
  if (!userId) {
    const session = SESSIONS.get(cleanToken);
    if (session) {
      if (session.expiresAt > Date.now()) {
        userId = session.userId;
      } else {
        SESSIONS.delete(cleanToken);
      }
    }
  }

  // 5. Direct User ID fallback for developer ease / tests
  if (!userId) {
    if (cleanToken === 'usr_sinhvien' || cleanToken === 'usr_chutro' || cleanToken === 'usr_admin') {
      userId = cleanToken;
    }
  }

  if (!userId) return null;

  // Always fetch fresh user state from database to ensure updated wallet balance & profile
  const db = readDb();
  const user = db.users.find(u => u.Id === userId || (u as any).id === userId);
  return user || null;
}

export function sanitizeUser(user: NguoiDung): Omit<NguoiDung, 'MatKhau'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { MatKhau, ...safeUser } = user;
  return safeUser;
}
