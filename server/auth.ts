import crypto from 'crypto';
import { NguoiDung, readDb, writeDb } from './db.js';

// In-memory token store mapped to userId with TTL
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

export function createSessionToken(userId: string): string {
  const token = 'hh_tok_' + crypto.randomBytes(24).toString('hex');
  // Token valid for 7 days
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  SESSIONS.set(token, { userId, expiresAt });
  return token;
}

export function getUserByToken(token: string | undefined): NguoiDung | null {
  if (!token) return null;
  // Support Bearer token prefix
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  
  // Fast in-memory check
  const session = SESSIONS.get(cleanToken);
  let userId: string | null = null;
  
  if (session) {
    if (session.expiresAt < Date.now()) {
      SESSIONS.delete(cleanToken);
      return null;
    }
    userId = session.userId;
  } else if (cleanToken.startsWith('hh_tok_demo_')) {
    // Demo token helper for quick testing
    const role = cleanToken.replace('hh_tok_demo_', '');
    if (role === 'admin') userId = 'usr_admin';
    if (role === 'chutro') userId = 'usr_chutro';
    if (role === 'sinhvien') userId = 'usr_sinhvien';
  }

  if (!userId) return null;

  const db = readDb();
  const user = db.users.find(u => u.Id === userId);
  return user || null;
}

export function sanitizeUser(user: NguoiDung): Omit<NguoiDung, 'MatKhau'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { MatKhau, ...safeUser } = user;
  return safeUser;
}
