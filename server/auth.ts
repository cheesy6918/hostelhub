import crypto from 'crypto';
import { NguoiDung, readDb } from './db.js';

// Khóa bí mật dùng để ký token (Có thể tạo biến môi trường JWT_SECRET trên Vercel)
const JWT_SECRET = process.env.JWT_SECRET || 'hostelhub_secret_key_2026_super_secure';

export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // Token có hiệu lực 7 ngày
  };

  // Mã hóa Payload thành Base64URL
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Tạo chữ ký HMAC SHA256 bảo mật
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('hex');

  // Trả về token dạng: hh_tok_<payload>.<signature>
  return `hh_tok_${base64Payload}.${signature}`;
}

export function getUserByToken(token: string | undefined): NguoiDung | null {
  if (!token) return null;

  // Lọc lấy đoạn token nguyên bản
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();

  // 1. Hỗ trợ Quick Demo Login
  if (cleanToken.startsWith('hh_tok_demo_')) {
    const role = cleanToken.replace('hh_tok_demo_', '');
    let userId: string | null = null;
    if (role === 'admin') userId = 'usr_admin';
    if (role === 'chutro') userId = 'usr_chutro';
    if (role === 'sinhvien') userId = 'usr_sinhvien';

    if (userId) {
      const db = readDb();
      return db.users.find(u => u.Id === userId) || null;
    }
  }

  // 2. Xác thực Token mã hóa Stateless
  if (!cleanToken.startsWith('hh_tok_')) return null;

  const rawToken = cleanToken.slice(7);
  const parts = rawToken.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;

  // Kiểm tra chữ ký bảo mật
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return null; // Token bị can thiệp / giả mạo
  }

  try {
    // Giải mã Payload
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    // Kiểm tra thời hạn Token
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) {
      return null; // Token hết hạn
    }

    // Đọc thông tin User từ Database
    const db = readDb();
    const user = db.users.find(u => u.Id === payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: NguoiDung): Omit<NguoiDung, 'MatKhau'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { MatKhau, ...safeUser } = user;
  return safeUser;
}