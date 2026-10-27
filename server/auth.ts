import crypto from 'crypto';
import { NguoiDung, readDb, getUserByIdFromDb } from './db.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'hostelhub_signed_session_secret_2026_safe';

// Fallback in-memory token store mapped to userId with TTL
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

export function createSessionToken(userId: string, _user?: NguoiDung): string {
  // Token có hiệu lực 90 ngày
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

export async function getUserByToken(token: string | undefined): Promise<NguoiDung | null> {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) return null;

  let userId: string | null = null;

  // 1. Token demo
  if (cleanToken.startsWith('hh_tok_demo_')) {
    const role = cleanToken.replace('hh_tok_demo_', '');
    if (role === 'admin') userId = 'usr_admin';
    if (role === 'chutro') userId = 'usr_chutro';
    if (role === 'sinhvien') userId = 'usr_sinhvien';
  }

  // 2. Token chuẩn hhtok.<b64Id>.<expiresAt>.<signature>
  if (!userId && cleanToken.startsWith('hhtok.')) {
    const parts = cleanToken.split('.');
    if (parts.length >= 3) {
      const b64Id = parts[1];
      try {
        userId = Buffer.from(b64Id, 'base64url').toString('utf8');
      } catch {
        userId = null;
      }
    }
  }

  // 3. Token cũ hh_tok_...
  if (!userId && cleanToken.startsWith('hh_tok_')) {
    const parts = cleanToken.split('_');
    if (parts.length >= 4) {
      userId = parts.slice(2, parts.length - 2).join('_');
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

  // 5. Direct User ID fallback
  if (!userId) {
    if (cleanToken.startsWith('usr_')) {
      userId = cleanToken;
    }
  }

  if (!userId) return null;

  // 6. TÌM KIẾM NGƯỜI DÙNG: Ưu tiên TiDB Cloud trước, database.json sau
  try {
    const dbUser = await getUserByIdFromDb(userId);
    if (dbUser) return dbUser;
  } catch (err) {
    console.warn('[Auth] Không thể query user từ TiDB Cloud:', err);
  }

  // Fallback tìm trong database.json
  const db = readDb();
  const localUser = (db.users || []).find(
    u => String(u.Id || (u as any).id).trim().toLowerCase() === userId!.trim().toLowerCase()
  );

  return localUser || null;
}

export function sanitizeUser(user: NguoiDung): Omit<NguoiDung, 'MatKhau'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { MatKhau, ...safeUser } = user;
  return safeUser;
}