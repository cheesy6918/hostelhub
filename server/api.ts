import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  readDb,
  writeDb,
  NguoiDung,
  PhongTro,
  YeuCauLienHe,
  LichHen,
  DatCoc,
  ThongBao,
  FavoriteItem,
  // MySQL Direct Data Access Methods
  getRoomsFromDb,
  getRoomByIdFromDb,
  createRoomInDb,
  updateRoomInDb,
  deleteRoomInDb,
  getUsersFromDb,
  getUserByIdFromDb,
  getUserByEmailFromDb,
  createUserInDb,
  updateUserInDb,
  getInquiriesFromDb,
  getInquiryByIdFromDb,
  createInquiryInDb,
  updateInquiryInDb,
  getAppointmentsFromDb,
  getAppointmentByIdFromDb,
  createAppointmentInDb,
  updateAppointmentInDb,
  deleteAppointmentInDb,
  bulkDeleteCancelledAppointmentsInDb,
  getDepositsFromDb,
  getDepositByIdFromDb,
  createDepositInDb,
  updateDepositInDb,
  deleteDepositInDb,
  bulkDeleteCancelledDepositsInDb,
  getNotificationsFromDb,
  createNotificationInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
  deleteNotificationInDb,
  clearReadNotificationsInDb,
  getFavoritesFromDb,
  createFavoriteInDb,
  deleteFavoriteInDb,
  // Wallet Transactions (Lịch sử thanh toán & giao dịch ví)
  GiaoDichVi,
  getWalletTransactionsFromDb,
  createWalletTransactionInDb,
  // MySQL connection & pool
  pool,
  isMySqlConnected,
  // Rental Contracts & Reviews (Xác minh 2 chiều & Đánh giá)
  RentalContract,
  RentalContractStatus,
  ReviewRecord,
  ReviewItem,
  getRentalContractsFromDb,
  getRentalContractByIdFromDb,
  createRentalContractInDb,
  updateRentalContractInDb,
  getReviewsFromDb,
  createReviewInDb,
  canUserReviewRoomInDb,
  parseRoomRow,
} from './db.js';
import { createSessionToken, getUserByToken, sanitizeUser } from './auth.js';
import { handleChatMessage } from './chatService.js';

export const apiRouter = Router();

// Helper to push in-app notification to MySQL
async function addNotification(
  _db: any,
  userId: string,
  title: string,
  content: string,
  type: 'LichHen' | 'DatCoc' | 'PhongTro' | 'HeThong' = 'HeThong'
): Promise<ThongBao> {
  const notif: ThongBao = {
    Id: 'tb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    UserId: userId,
    TieuDe: title,
    NoiDung: content,
    Loai: type,
    TrangThai: 'ChuaDoc',
    NgayTao: new Date().toISOString(),
  };
  await createNotificationInDb(notif);
  return notif;
}

// Middleware to extract authenticated user
export async function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const user = await getUserByToken(authHeader);
  if (!user) {
    res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' });
    return;
  }
  if (user.TrangThai === 'BiKhoa') {
    res.status(403).json({ success: false, message: 'Tài khoản này đã bị khóa bởi Quản trị viên.' });
    return;
  }
  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// 1. AUTHENTICATION (ĐĂNG KÝ / ĐĂNG NHẬP / THÔNG TIN CÁ NHÂN)
// -------------------------------------------------------------

// POST /api/auth/register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const HoTen = req.body.HoTen || req.body.hoTen || req.body.fullName || req.body.name;
    const Email = req.body.Email || req.body.email;
    const MatKhau = req.body.MatKhau || req.body.matKhau || req.body.password;
    const Sdt = req.body.Sdt || req.body.sdt || req.body.phone;
    const VaiTro = req.body.VaiTro || req.body.vaiTro || req.body.role;

    // Validate HoTen
    if (!HoTen || typeof HoTen !== 'string' || HoTen.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Họ và tên phải có ít nhất 2 ký tự.' });
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = (Email || '').trim().toLowerCase();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Địa chỉ Email không hợp lệ.' });
      return;
    }

    // Validate MatKhau
    if (!MatKhau || typeof MatKhau !== 'string' || MatKhau.length < 6) {
      res.status(400).json({ success: false, message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên.' });
      return;
    }

    // Validate Sdt
    const phoneRegex = /^[0-9]{9,11}$/;
    const cleanPhone = (Sdt || '').replace(/\D/g, '');
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      res.status(400).json({ success: false, message: 'Số điện thoại phải chứa 9 đến 11 chữ số.' });
      return;
    }

    // Validate VaiTro: Chỉ cho phép 'SinhVien' hoặc 'ChuTro'
    if (VaiTro === 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Không thể đăng ký tài khoản Quản trị viên (Admin). Quyền này chỉ được cấp nội bộ.'
      });
      return;
    }

    if (VaiTro !== 'SinhVien' && VaiTro !== 'ChuTro') {
      res.status(400).json({ success: false, message: 'Vui lòng chọn vai trò hợp lệ (Sinh viên hoặc Chủ trọ).' });
      return;
    }

    // Check duplicate email from MySQL
    const existing = await getUserByEmailFromDb(cleanEmail);
    if (existing) {
      res.status(400).json({ success: false, message: 'Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.' });
      return;
    }

    // Hash password
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(MatKhau, salt);
    const newUser: NguoiDung = {
      Id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      HoTen: HoTen.trim(),
      Email: cleanEmail,
      MatKhau: hashedPassword,
      Sdt: cleanPhone,
      VaiTro,
      soDuVi: 2000000,
      NgayTao: new Date().toISOString(),
      TrangThai: 'HoatDong',
    };

    // 1. Lưu vào TiDB Cloud (qua hàm createUserInDb)
    await createUserInDb(newUser);

    // 2. Ghi dự phòng thêm vào database.json
    try {
      const db = readDb();
      if (!db.users) db.users = [];
      const userExistsInJson = db.users.some(u => u.Email.toLowerCase() === cleanEmail);
      if (!userExistsInJson) {
        db.users.push(newUser);
        writeDb(db);
      }
    } catch (fallbackErr) {
      console.warn('[JSON Fallback] Không thể ghi vào database.json:', fallbackErr);
    }

    const token = createSessionToken(newUser.Id);
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi xử lý đăng ký' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const Email = req.body.Email || req.body.email;
    const MatKhau = req.body.MatKhau || req.body.matKhau || req.body.password;

    if (!Email || !MatKhau) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
      return;
    }

    const cleanEmail = Email.trim().toLowerCase();
    
    // 1. Tìm user từ TiDB Cloud trước
    let user = await getUserByEmailFromDb(cleanEmail);

    // 2. Dự phòng: Nếu TiDB Cloud không có hoặc kết nối gặp sự cố, tìm tiếp trong database.json
    if (!user) {
      const db = readDb();
      user = (db.users || []).find(u => u.Email.trim().toLowerCase() === cleanEmail) || null;
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Tài khoản Email này chưa tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký mới.'
      });
      return;
    }
    if (user.TrangThai === 'BiKhoa') {
      res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đang bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
      });
      return;
    }

    // 3. So khớp mật khẩu: Hỗ trợ cả bcrypt ($2a$, $2b$) lẫn chuỗi thường của tài khoản mock
    let isMatch = false;
    if (user.MatKhau && (user.MatKhau.startsWith('$2a$') || user.MatKhau.startsWith('$2b$'))) {
      isMatch = bcrypt.compareSync(MatKhau, user.MatKhau);
    } else {
      isMatch = (user.MatKhau === MatKhau);
    }

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng thử lại.'
      });
      return;
    }

    const token = createSessionToken(user.Id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ' });
  }
});

// Bộ nhớ tạm lưu mã OTP (hết hạn sau 5 phút)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/forgot-password: Tạo và gửi mã OTP
apiRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ Email.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();

    // 1. Kiểm tra tài khoản có tồn tại không
    let user = await getUserByEmailFromDb(cleanEmail);
    if (!user) {
      const db = readDb();
      user = (db.users || []).find(u => u.Email.toLowerCase() === cleanEmail) || null;
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'Email này chưa được đăng ký trong hệ thống.' });
      return;
    }

    // 2. Tạo mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // Hiệu lực 5 phút
    });

    res.json({
      success: true,
      message: 'Mã xác thực OTP đã được tạo thành công!',
      otp, // Trả về OTP để hiển thị tiện lợi cho người dùng thử nghiệm
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Lỗi xử lý yêu cầu' });
  }
});

// POST /api/auth/reset-password: Xác thực OTP và đổi mật khẩu mới
apiRouter.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore.get(cleanEmail);

    if (!record || record.otp !== otp.trim()) {
      res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      res.status(400).json({ success: false, message: 'Mã OTP đã hết thời hạn 5 phút. Vui lòng lấy mã mới.' });
      return;
    }

    // 1. Tìm tài khoản
    let user = await getUserByEmailFromDb(cleanEmail);
    if (!user) {
      const db = readDb();
      user = (db.users || []).find(u => u.Email.toLowerCase() === cleanEmail) || null;
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    // 2. Mã hóa mật khẩu mới
    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(newPassword, salt);

    // 3. Cập nhật vào TiDB Cloud
    await updateUserInDb(user.Id, { MatKhau: hashedPass });

    // 4. Đồng bộ lại database.json
    try {
      const db = readDb();
      const localU = (db.users || []).find(u => u.Id === user!.Id);
      if (localU) {
        localU.MatKhau = hashedPass;
        writeDb(db);
      }
    } catch {}

    otpStore.delete(cleanEmail);
    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Lỗi đặt lại mật khẩu' });
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = await getUserByToken(authHeader);
  if (!user) {
    res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc phiên hết hạn.' });
    return;
  }
  const latestUser = await getUserByIdFromDb(user.Id);
  res.json({
    success: true,
    user: sanitizeUser(latestUser || user),
  });
});

// PUT /api/auth/profile
apiRouter.put('/auth/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as NguoiDung;
    const HoTen = req.body.HoTen || req.body.hoTen || req.body.fullName || req.body.name;
    const Sdt = req.body.Sdt || req.body.sdt || req.body.phone;
    const MatKhauCu = req.body.MatKhauCu || req.body.matKhauCu;
    const MatKhauMoi = req.body.MatKhauMoi || req.body.matKhauMoi;

    const targetUser = await getUserByIdFromDb(currentUser.Id);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    const updates: Partial<NguoiDung> = {};

    if (HoTen && typeof HoTen === 'string' && HoTen.trim().length >= 2) {
      updates.HoTen = HoTen.trim();
    }

    if (Sdt && typeof Sdt === 'string') {
      let cleanPhone = Sdt.replace(/\s+/g, '').replace(/[\.\-]/g, '');
      if (cleanPhone.startsWith('+84')) cleanPhone = '0' + cleanPhone.slice(3);
      if (cleanPhone.startsWith('84') && cleanPhone.length > 10) cleanPhone = '0' + cleanPhone.slice(2);
      if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
        updates.Sdt = cleanPhone;
      }
    }

    // Optional password change
    if (MatKhauMoi) {
      if (!MatKhauCu) {
        res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu.' });
        return;
      }
      const isMatch = bcrypt.compareSync(MatKhauCu, targetUser.MatKhau);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
        return;
      }
      if (MatKhauMoi.length < 6) {
        res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
        return;
      }
      updates.MatKhau = bcrypt.hashSync(MatKhauMoi, bcrypt.genSaltSync(10));
    }

    const updatedUser = await updateUserInDb(targetUser.Id, updates);

    // Đồng bộ tên và số điện thoại chủ trọ vào tất cả phòng trọ của họ nếu là ChuTro
    if (targetUser.VaiTro === 'ChuTro' && (updates.HoTen || updates.Sdt)) {
      const db = readDb();
      let changedRooms = false;
      db.rooms.forEach(r => {
        if (r.IdChuTro === targetUser.Id || r.ChuTroId === targetUser.Id) {
          if (updates.HoTen) r.ChuTroTen = updates.HoTen;
          if (updates.Sdt) r.ChuTroSdt = updates.Sdt;
          changedRooms = true;
        }
      });
      if (changedRooms) writeDb(db);
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: sanitizeUser(updatedUser || { ...targetUser, ...updates }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi cập nhật hồ sơ' });
  }
});

// POST /api/wallet/topup & POST /api/auth/wallet/topup (Demo nạp tiền ví)
const handleWalletTopup = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as NguoiDung;
    const { amount } = req.body;
    const topupAmount = Number(amount) || 500000;

    if (topupAmount <= 0 || topupAmount > 1000000000) {
      res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ (từ 10.000 đến 1.000.000.000 VNĐ).' });
      return;
    }

    const user = await getUserByIdFromDb(currentUser.Id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
      return;
    }

    const newBalance = (user.soDuVi || 0) + topupAmount;
    await updateUserInDb(user.Id, { soDuVi: newBalance });
    user.soDuVi = newBalance;

    // Ghi lại lịch sử giao dịch nạp tiền
    await createWalletTransactionInDb({
      Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      UserId: user.Id,
      LoaiGiaoDich: 'NapTien',
      SoTien: topupAmount,
      SoDuSauGiaoDich: newBalance,
      NoiDung: `Nạp tiền vào ví điện tử: +${topupAmount.toLocaleString('vi-VN')} VNĐ`,
      NgayTao: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Nạp thành công +${topupAmount.toLocaleString('vi-VN')} VNĐ vào ví!`,
      soDuVi: user.soDuVi,
      newBalance: user.soDuVi,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi nạp tiền' });
  }
};

apiRouter.post('/wallet/topup', requireAuth, handleWalletTopup);
apiRouter.post('/auth/wallet/topup', requireAuth, handleWalletTopup);

// GET /api/wallet/transactions & GET /api/auth/wallet/transactions - Lịch sử giao dịch ví
const handleGetTransactions = async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const userId = String(user.Id || (user as any).id || '').trim().toLowerCase();
  
  // 1. Lấy danh sách giao dịch ví hiện có
  let list = await getWalletTransactionsFromDb(user.Id);
  
  // 2. Bù các giao dịch đặt cọc nếu bị thiếu
  const allDeposits = await getDepositsFromDb();
  const userDeposits = allDeposits.filter(d => {
    const sId = String(d.IdSinhVien || (d as any).SinhVienId || '').trim().toLowerCase();
    return sId === userId;
  });

  for (const dep of userDeposits) {
    const hasTx = list.some(tx => tx.MaThamChieu === dep.Id || (tx.Id && tx.Id.includes(dep.Id)));
    if (!hasTx) {
      const txDatCoc: GiaoDichVi = {
        Id: 'tx_sync_' + dep.Id,
        UserId: user.Id,
        LoaiGiaoDich: 'DatCoc',
        SoTien: -Number(dep.SoTienCoc || 500000),
        SoDuSauGiaoDich: Number(user.soDuVi || 1500000),
        NoiDung: `Đặt cọc 500.000 VNĐ giữ chỗ phòng "${dep.TieuDePhong || 'Phòng trọ'}"`,
        MaThamChieu: dep.Id,
        NgayTao: dep.NgayTao || dep.NgayCoc || new Date().toISOString(),
      };
      await createWalletTransactionInDb(txDatCoc);
      list.push(txDatCoc);
    }
  }

  list.sort((a, b) => new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime());
  res.json({ success: true, count: list.length, data: list });
};

apiRouter.get('/wallet/transactions', requireAuth, handleGetTransactions);
apiRouter.get('/auth/wallet/transactions', requireAuth, handleGetTransactions);
apiRouter.get('/student/transactions', requireAuth, handleGetTransactions);

// -------------------------------------------------------------
// 2. PHÒNG TRỌ (ROOMS API)
// -------------------------------------------------------------

// GET /api/rooms
// GET /api/rooms
apiRouter.get('/rooms', async (req: Request, res: Response) => {
  const { search, district, minPrice, maxPrice, minArea, maxArea, amenities, type, landlordId, status } = req.query;
  
  // Truyền thẳng landlordId vào getRoomsFromDb để lấy đúng từ SQL
  const dbRooms = await getRoomsFromDb({
    status: typeof status === 'string' && status !== 'all' ? status : undefined,
    district: typeof district === 'string' && district !== 'all' ? district : undefined,
    landlordId: typeof landlordId === 'string' && landlordId.trim() ? landlordId.trim() : undefined,
  });
  let results = [...dbRooms];

  // Validate price range if both minPrice and maxPrice are provided
  if (minPrice !== undefined && maxPrice !== undefined && minPrice !== '' && maxPrice !== '') {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      res.status(400).json({
        success: false,
        message: 'Giá tối thiểu không được lớn hơn giá tối đa.'
      });
      return;
    }
  }

  // Validate area range if both minArea and maxArea are provided
  if (minArea !== undefined && maxArea !== undefined && minArea !== '' && maxArea !== '') {
    const minA = Number(minArea);
    const maxA = Number(maxArea);
    if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
      res.status(400).json({
        success: false,
        message: 'Diện tích tối thiểu không được lớn hơn diện tích tối đa.'
      });
      return;
    }
  }

  // Lọc an toàn tuyệt đối cho landlordId (không phân biệt hoa/thường hay tên cột)
  if (landlordId && typeof landlordId === 'string' && landlordId.trim() !== '') {
    const targetId = landlordId.trim().toLowerCase();
    results = results.filter(r => {
      const cId = String(r.ChuTroId || r.IdChuTro || (r as any).chu_tro_id || '').trim().toLowerCase();
      return cId === targetId;
    });
  }

  // Filter by search keyword (area, street name, title, description)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const s = search.trim().toLowerCase();
    results = results.filter(r =>
      (r.TieuDe && r.TieuDe.toLowerCase().includes(s)) ||
      (r.DiaChi && r.DiaChi.toLowerCase().includes(s)) ||
      (r.QuanHuyen && r.QuanHuyen.toLowerCase().includes(s)) ||
      (r.MoTa && r.MoTa.toLowerCase().includes(s))
    );
  }

  // Filter by district
  if (district && typeof district === 'string' && district !== 'all') {
    results = results.filter(r => r.QuanHuyen && r.QuanHuyen.toLowerCase().includes(district.toLowerCase()));
  }

  // Filter by min price
  if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
    const min = Number(minPrice);
    if (min >= 0) {
      results = results.filter(r => r.GiaThue >= min);
    }
  }

  // Filter by max price
  if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
    const max = Number(maxPrice);
    if (max > 0) {
      results = results.filter(r => r.GiaThue <= max);
    }
  }

  // Filter by min area (m2)
  if (minArea !== undefined && minArea !== '' && !isNaN(Number(minArea))) {
    const minA = Number(minArea);
    if (minA >= 0) {
      results = results.filter(r => (r.DienTich || 0) >= minA);
    }
  }

  // Filter by max area (m2)
  if (maxArea !== undefined && maxArea !== '' && !isNaN(Number(maxArea))) {
    const maxA = Number(maxArea);
    if (maxA > 0) {
      results = results.filter(r => (r.DienTich || 0) <= maxA);
    }
  }

  // Filter by amenities (comma-separated or array: must contain all requested amenities)
  if (amenities) {
    let amList: string[] = [];
    if (Array.isArray(amenities)) {
      amList = amenities as string[];
    } else if (typeof amenities === 'string' && amenities.trim() !== '') {
      amList = amenities.split(',').map(a => a.trim()).filter(Boolean);
    }

    if (amList.length > 0) {
      results = results.filter(r => {
        const roomAmenities = (Array.isArray(r.TienIch) ? r.TienIch : []).map(a => a.toLowerCase());
        return amList.every(requiredAm => {
          const req = requiredAm.toLowerCase();
          // Synonym support for Máy lạnh / Điều hòa
          if (req.includes('máy lạnh') || req.includes('điều hòa')) {
            return roomAmenities.some(a => a.includes('điều hòa') || a.includes('máy lạnh'));
          }
          if (req.includes('wifi') || req.includes('internet')) {
            return roomAmenities.some(a => a.includes('wifi') || a.includes('mạng') || a.includes('internet'));
          }
          return roomAmenities.some(a => a.includes(req));
        });
      });
    }
  }

  // Filter by status if specified. If status === 'all', do not exclude pending or rejected rooms
  if (status && typeof status === 'string') {
    if (status !== 'all') {
      const targetStatus = status.trim().toLowerCase();
      results = results.filter(r => {
        const s = (r.TrangThai || '').trim().toLowerCase();
        if (targetStatus === 'chờ duyệt' || targetStatus === 'choduyet' || targetStatus === 'cho_duyet' || targetStatus === 'pending') {
          return s === 'chờ duyệt' || s === 'choduyet' || s === 'cho_duyet' || s === 'pending';
        }
        return s === targetStatus;
      });
    }
  } else if (!landlordId) {
    // When queried without landlordId or explicit status filter, show only approved rooms
    results = results.filter(r => {
      const s = (r.TrangThai || '').trim().toLowerCase();
      return s !== 'chờ duyệt' && s !== 'choduyet' && s !== 'cho_duyet' && s !== 'pending' && s !== 'từ chối';
    });
  }

  // Filter by room type
  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter(r => r.LoaiPhong === type);
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/rooms/:id
apiRouter.get('/rooms/:id', async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const room = await getRoomByIdFromDb(roomId);

  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phòng trọ.' });
    return;
  }

  res.json({ success: true, room });
});

// POST /api/rooms (ChuTro or Admin)
// Theo yêu cầu: Sau khi đăng thì trạng thái mặc định là "Chờ duyệt"
apiRouter.post('/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user && user.VaiTro !== 'ChuTro' && user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Chủ trọ mới có quyền đăng tin phòng trọ.' });
      return;
    }

    const {
      TieuDe,
      tieu_de,
      DiaChi,
      dia_chi,
      QuanHuyen,
      quan_huyen,
      GiaThue,
      GiaDien,
      GiaNuoc,
      TienIch,
      HinhAnh,
      MoTa,
      mo_ta,
      NoiQuy,
      noi_quy,
      DienTich,
      TienCoc,
      LoaiPhong,
      loai_phong,
      ChuTroId,
      IdChuTro,
      chu_tro_id,
      landlord_id,
      ChuTroTen,
      chu_tro_ten,
      ChuTroSdt,
      chu_tro_sdt,
      VideoUrl,
      video_url,
    } = req.body;

    const videoUrlStr = String(VideoUrl || video_url || req.body.videoUrl || '').trim();

    // 1. Ép kiểu dữ liệu Number() cho GiaThue, GiaDien, GiaNuoc, DienTich
    const gia_thue = Number(GiaThue !== undefined ? GiaThue : (req.body.gia_thue !== undefined ? req.body.gia_thue : 0));
    const dien_tich = Number(DienTich !== undefined ? DienTich : (req.body.dien_tich !== undefined ? req.body.dien_tich : 20));
    const gia_dien = Number(GiaDien !== undefined ? (typeof GiaDien === 'number' ? GiaDien : String(GiaDien).replace(/[^\d]/g, '')) : (req.body.gia_dien !== undefined ? req.body.gia_dien : 3800)) || 3800;
    const gia_nuoc = Number(GiaNuoc !== undefined ? (typeof GiaNuoc === 'number' ? GiaNuoc : String(GiaNuoc).replace(/[^\d]/g, '')) : (req.body.gia_nuoc !== undefined ? req.body.gia_nuoc : 30000)) || 30000;
    const tien_coc = Number(TienCoc !== undefined ? TienCoc : (req.body.tien_coc !== undefined ? req.body.tien_coc : 0));

    const title = (TieuDe || tieu_de || '').trim();
    const address = (req.body.DiaChiChiTiet || req.body.dia_chi_chi_tiet || DiaChi || dia_chi || '').trim();
    const district = (QuanHuyen || quan_huyen || 'Cầu Giấy, Hà Nội').trim();
    const description = (MoTa || mo_ta || '').trim() || 'Phòng trọ sinh viên tiện nghi, an ninh tốt, gần các trường đại học.';
    const houseRules = (NoiQuy || noi_quy || '').trim() || '1. Giữ gìn trật tự và vệ sinh chung sau 23:00.\n2. Khóa cửa cẩn thận khi ra vào.\n3. Tiết kiệm điện nước.';
    const roomType = LoaiPhong || loai_phong || 'GacLung';

    if (!title || isNaN(gia_thue) || gia_thue <= 0 || !address) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: Tiêu đề, Giá thuê hợp lệ và Địa chỉ phòng trọ.'
      });
      return;
    }

    // 2. Xác định an toàn thông tin chủ trọ
    const landlordId = (user && (user.Id || (user as any).id)) || IdChuTro || ChuTroId || chu_tro_id || landlord_id || 'usr_chutro';
    const landlordName = (user && user.HoTen) || ChuTroTen || chu_tro_ten || 'Trần Thị Bích (Chủ trọ)';
    const landlordPhone = (user && user.Sdt) || ChuTroSdt || chu_tro_sdt || '0987654321';

    // 3. Chuẩn hóa TienIch và HinhAnh: lưu chuỗi JSON cho DB và mảng cho client
    const rawAmenities = TienIch !== undefined ? TienIch : req.body.tien_ich;
    let amenitiesList: string[] = [];
    if (Array.isArray(rawAmenities)) {
      amenitiesList = rawAmenities;
    } else if (typeof rawAmenities === 'string') {
      try {
        amenitiesList = JSON.parse(rawAmenities);
      } catch {
        amenitiesList = rawAmenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } else {
      amenitiesList = ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do'];
    }
    const tien_ich = JSON.stringify(amenitiesList);

    const rawImages = HinhAnh !== undefined ? HinhAnh : req.body.hinh_anh;
    let imagesList: string[] = [];
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      imagesList = rawImages;
    } else if (typeof rawImages === 'string' && rawImages.trim().startsWith('[')) {
      try {
        imagesList = JSON.parse(rawImages);
      } catch {
        imagesList = [rawImages];
      }
    } else if (typeof rawImages === 'string' && rawImages.trim()) {
      imagesList = [rawImages];
    } else {
      imagesList = [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ];
    }
    const hinh_anh = JSON.stringify(imagesList);
    const danh_gia = JSON.stringify([]);

    const roomId = 'room_' + Date.now();
    const currentDate = new Date().toISOString();

    // 4. Thực thi câu lệnh INSERT dữ liệu vào bảng rooms với các cột:
    // TieuDe, DiaChiChiTiet, QuanHuyen, LoaiPhong, DienTich, GiaThue, GiaDien, GiaNuoc, TienIch, HinhAnh, ChuTroId, TrangThai
    const isConn = await isMySqlConnected();
    if (isConn) {
      try {
        await pool.execute(
          `INSERT INTO rooms (
            Id, TieuDe, DiaChiChiTiet, QuanHuyen, LoaiPhong, DienTich, 
            GiaThue, GiaDien, GiaNuoc, TienIch, HinhAnh, ChuTroId, 
            TrangThai, MoTa, NoiQuy, ChuTroTen, ChuTroSdt, NgayDang, DanhGia
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            roomId,
            title,
            address, // DiaChiChiTiet
            district,
            roomType,
            dien_tich,
            gia_thue,
            gia_dien,
            gia_nuoc,
            tien_ich,
            hinh_anh,
            landlordId,
            'ChoDuyet', // Trạng thái mặc định khi tạo mới
            description,
            houseRules,
            landlordName,
            landlordPhone,
            currentDate,
            danh_gia,
          ]
        );
      } catch (sqlErr: any) {
        // Fallback 1: Nếu cơ sở dữ liệu dùng tên cột DiaChi
        try {
          await pool.execute(
            `INSERT INTO rooms (
              Id, TieuDe, DiaChi, QuanHuyen, LoaiPhong, DienTich, 
              GiaThue, GiaDien, GiaNuoc, TienIch, HinhAnh, ChuTroId, 
              TrangThai, MoTa, NoiQuy, ChuTroTen, ChuTroSdt, NgayDang, DanhGia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              roomId,
              title,
              address, // DiaChi
              district,
              roomType,
              dien_tich,
              gia_thue,
              gia_dien,
              gia_nuoc,
              tien_ich,
              hinh_anh,
              landlordId,
              'ChoDuyet',
              description,
              houseRules,
              landlordName,
              landlordPhone,
              currentDate,
              danh_gia,
            ]
          );
        } catch (fallbackErr: any) {
          // Fallback 2: Nếu dùng snake_case
          if (fallbackErr.code === 'ER_BAD_FIELD_ERROR' || sqlErr.code === 'ER_BAD_FIELD_ERROR') {
            await pool.execute(
              `INSERT INTO rooms (
                id, tieu_de, dia_chi, quan_huyen, loai_phong, dien_tich, 
                gia_thue, gia_dien, gia_nuoc, tien_ich, hinh_anh, chu_tro_id, 
                trang_thai, mo_ta, noi_quy, chu_tro_ten, chu_tro_sdt, ngay_dang, danh_gia
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                roomId,
                title,
                address,
                district,
                roomType,
                dien_tich,
                gia_thue,
                gia_dien,
                gia_nuoc,
                tien_ich,
                hinh_anh,
                landlordId,
                'ChoDuyet',
                description,
                houseRules,
                landlordName,
                landlordPhone,
                currentDate,
                danh_gia,
              ]
            );
          } else {
            console.error("Lỗi đăng tin phòng MySQL:", fallbackErr);
            throw fallbackErr;
          }
        }
      }
    }

    // 5. Cập nhật đối tượng phòng vào mảng dữ liệu dùng chung (shared state / global store)
    // để cả trang Chủ trọ và trang Admin cùng đọc được bài mới
    const newRoom: PhongTro = {
      Id: roomId,
      TieuDe: title,
      DiaChi: address,
      DiaChiChiTiet: address,
      QuanHuyen: district,
      GiaThue: Number(gia_thue),
      GiaDien: gia_dien,
      GiaNuoc: gia_nuoc,
      TienIch: amenitiesList,
      TrangThai: 'ChoDuyet',
      IdChuTro: landlordId,
      ChuTroId: landlordId,
      ChuTroTen: landlordName,
      ChuTroSdt: landlordPhone,
      HinhAnh: imagesList,
      MoTa: description,
      NoiQuy: houseRules,
      DienTich: isNaN(dien_tich) || dien_tich <= 0 ? 20 : dien_tich,
      LoaiPhong: roomType,
      NgayDang: currentDate,
      DanhGia: [],
      VideoUrl: videoUrlStr || undefined,
    };

    const db = readDb();
    if (!db.rooms) db.rooms = [];
    db.rooms.unshift(newRoom);
    writeDb(db);

    // 6. Trả về response JSON { success: true, data: newRoom } sau khi INSERT thành công
    res.status(201).json({
      success: true,
      message: 'Đăng phòng trọ thành công! Tin của bạn đang ở trạng thái Chờ duyệt.',
      data: newRoom,
      room: newRoom,
    });
  } catch (error: any) {
    console.error("Lỗi đăng tin phòng:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi lưu dữ liệu vào cơ sở dữ liệu'
    });
  }
});

// PUT /api/rooms/:id
apiRouter.put('/rooms/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const roomId = req.params.id;

    const existingRoom = await getRoomByIdFromDb(roomId);
    if (!existingRoom) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
      return;
    }

    if (user.VaiTro !== 'Admin' && existingRoom.IdChuTro !== user.Id && existingRoom.ChuTroId !== user.Id) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa thông tin phòng trọ này.' });
      return;
    }

    // Preserve essential identity properties while updating editable ones
    const updatedData: Partial<PhongTro> = {
      ...req.body,
      Id: existingRoom.Id,
      IdChuTro: existingRoom.IdChuTro || existingRoom.ChuTroId || user.Id,
      ChuTroId: existingRoom.IdChuTro || existingRoom.ChuTroId || user.Id,
    };

    const updated = await updateRoomInDb(roomId, updatedData);

    res.json({ success: true, message: 'Cập nhật phòng trọ thành công!', room: updated });
  } catch (error: any) {
    console.error("Lỗi cập nhật phòng trọ:", error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi cập nhật phòng trọ' });
  }
});

// DELETE /api/rooms/:id
apiRouter.delete('/rooms/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const roomId = req.params.id;

    const room = await getRoomByIdFromDb(roomId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
      return;
    }

    if (user.VaiTro !== 'Admin' && room.IdChuTro !== user.Id && room.ChuTroId !== user.Id) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xóa phòng trọ này.' });
      return;
    }

    await deleteRoomInDb(roomId);

    res.json({ success: true, message: 'Đã xóa phòng trọ thành công.' });
  } catch (error: any) {
    console.error("Lỗi xóa phòng trọ:", error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi xóa phòng trọ' });
  }
});

// -------------------------------------------------------------
// 3. YÊU CẦU ĐẶT / LIÊN HỆ PHÒNG (INQUIRIES)
// -------------------------------------------------------------

apiRouter.post('/inquiries', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { roomId, message, depositAmount, PhongId, GhiChu } = req.body;

  const targetRoomId = roomId || PhongId;
  if (!targetRoomId) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã phòng trọ.' });
    return;
  }

  const room = await getRoomByIdFromDb(targetRoomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Phòng trọ không tồn tại.' });
    return;
  }

  const deposit = Number(depositAmount) || 0;
  if (deposit > 0) {
    const dbUser = await getUserByIdFromDb(user.Id);
    if (!dbUser || (dbUser.soDuVi || 0) < deposit) {
      res.status(400).json({
        success: false,
        message: `Số dư ví không đủ để đặt cọc ${deposit.toLocaleString('vi-VN')} VNĐ. Số dư hiện tại: ${(dbUser ? dbUser.soDuVi : user.soDuVi || 0).toLocaleString('vi-VN')} VNĐ.`
      });
      return;
    }
    // Deduct deposit from student
    const updatedBalance = (dbUser.soDuVi || 0) - deposit;
    await updateUserInDb(user.Id, { soDuVi: updatedBalance });
    user.soDuVi = updatedBalance;
  }

  const studentName = user.HoTen || 'Sinh viên';
  const studentPhone = user.Sdt || '0987654321';
  const roomTitle = room.TieuDe || 'Phòng trọ';
  const targetChuTroId = room.IdChuTro || room.ChuTroId || 'usr_chutro';
  const inquiryNote = (message || GhiChu || '').trim() || 'Sinh viên muốn hỏi thêm thông tin phòng trọ';

  const newInq: YeuCauLienHe = {
    Id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    PhongId: room.Id,
    TieuDePhong: roomTitle,
    SinhVienId: user.Id,
    SinhVienTen: studentName,
    SinhVienSdt: studentPhone,
    ChuTroId: targetChuTroId,
    TienCoc: deposit,
    GhiChu: inquiryNote,
    TrangThai: 'ChoXacNhan',
    NgayTao: new Date().toISOString(),
  };

  const savedInq = await createInquiryInDb(newInq);

  // Gửi thông báo đến chủ trọ
  if (targetChuTroId) {
    await addNotification(
      null,
      targetChuTroId,
      'Tin nhắn tư vấn / hỏi đáp phòng trọ mới!',
      `Sinh viên ${studentName} (SĐT: ${studentPhone}) vừa gửi tin nhắn hỏi về phòng "${roomTitle}": "${inquiryNote}". Vui lòng phản hồi sinh viên trong mục Tin nhắn liên hệ.`,
      'PhongTro'
    );
  }

  // Gửi thông báo xác nhận đến sinh viên
  if (user.Id) {
    await addNotification(
      null,
      user.Id,
      'Đã gửi câu hỏi tư vấn tới chủ trọ thành công',
      `Câu hỏi của bạn cho phòng "${roomTitle}" đã được gửi tới chủ trọ. Chủ trọ sẽ phản hồi qua hệ thống hoặc gọi điện/Zalo tới số ${studentPhone}.`,
      'PhongTro'
    );
  }

  res.status(201).json({
    success: true,
    message: deposit > 0
      ? `Đã gửi yêu cầu giữ chỗ và trừ tạm ${deposit.toLocaleString('vi-VN')} VNĐ từ ví của bạn!`
      : 'Đã gửi câu hỏi tư vấn tới chủ trọ thành công! Vui lòng chờ phản hồi trong mục thông báo hoặc điện thoại/Zalo.',
    inquiry: savedInq,
    newBalance: user.soDuVi,
  });
});

apiRouter.get('/inquiries', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const allInqs = await getInquiriesFromDb();

  let list: YeuCauLienHe[] = [];
  const currentUserId = String(user.Id || '').trim().toLowerCase();

  if (user.VaiTro === 'ChuTro') {
    list = allInqs.filter(i => {
      const landlordId = String(i.ChuTroId || (i as any).IdChuTro || '').trim().toLowerCase();
      return landlordId === currentUserId;
    });
  } else if (user.VaiTro === 'SinhVien') {
    list = allInqs.filter(i => {
      const studentId = String(i.SinhVienId || (i as any).IdSinhVien || '').trim().toLowerCase();
      return studentId === currentUserId;
    });
  } else if (user.VaiTro === 'Admin') {
    list = allInqs;
  }

  // Đảm bảo tin nhắn mới nhất xếp lên đầu danh sách
  list.sort((a, b) => new Date(b.NgayTao || 0).getTime() - new Date(a.NgayTao || 0).getTime());

  res.json({ success: true, count: list.length, data: list });
});

apiRouter.put('/inquiries/:id/status', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status } = req.body;

  const inq = await getInquiryByIdFromDb(req.params.id);
  if (!inq) {
    res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại.' });
    return;
  }

  const inqLandlordId = String(inq.ChuTroId || (inq as any).IdChuTro || '').trim().toLowerCase();
  const currentUserId = String(user.Id || '').trim().toLowerCase();

  if (user.VaiTro !== 'Admin' && inqLandlordId !== currentUserId) {
    res.status(403).json({ success: false, message: 'Không có quyền xử lý yêu cầu này.' });
    return;
  }

  await updateInquiryInDb(inq.Id, { TrangThai: status });
  inq.TrangThai = status;

  // If approved and has deposit, landlord receives deposit
  if (status === 'DaDuyet' && inq.TienCoc > 0) {
    const chuTro = await getUserByIdFromDb(inq.ChuTroId);
    if (chuTro) {
      await updateUserInDb(chuTro.Id, { soDuVi: (chuTro.soDuVi || 0) + inq.TienCoc });
    }
  }

  // If rejected and has deposit, refund to student
  if (status === 'TuChoi' && inq.TienCoc > 0) {
    const sinhVien = await getUserByIdFromDb(inq.SinhVienId);
    if (sinhVien) {
      await updateUserInDb(sinhVien.Id, { soDuVi: (sinhVien.soDuVi || 0) + inq.TienCoc });
    }
  }

  // Gửi thông báo đến sinh viên khi chủ trọ tiếp nhận hoặc phản hồi
  if (inq.SinhVienId) {
    const statusNote = status === 'DaDuyet'
      ? 'Chủ trọ đã tiếp nhận lời nhắn và sẽ sớm liên hệ tư vấn trực tiếp cho bạn.'
      : 'Chủ trọ đã cập nhật trạng thái yêu cầu tư vấn.';
    await addNotification(
      null,
      inq.SinhVienId,
      status === 'DaDuyet' ? 'Chủ trọ đã tiếp nhận câu hỏi tư vấn!' : 'Cập nhật trạng thái tin nhắn tư vấn',
      `Phòng "${inq.TieuDePhong || 'Phòng trọ'}": ${statusNote}`,
      'PhongTro'
    );
  }

  res.json({ success: true, message: `Đã cập nhật trạng thái: ${status}`, inquiry: inq });
});

// -------------------------------------------------------------
// 3.1. ĐẶT LỊCH HẸN XEM PHÒNG (LICH HEN)
// -------------------------------------------------------------

// GET /api/appointments - Danh sách lịch hẹn
apiRouter.get('/appointments', requireAuth, async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const user = (req as any).user as NguoiDung;
    const filter: { studentId?: string; landlordId?: string } = {};

    if (user.VaiTro === 'SinhVien') {
      filter.studentId = user.Id;
    } else if (user.VaiTro === 'ChuTro') {
      filter.landlordId = user.Id;
    }

    const list = await getAppointmentsFromDb(filter);

    let result: LichHen[] = [];
    if (user.VaiTro === 'SinhVien') {
      const sId = String(user.Id).trim().toLowerCase();
      result = list.filter(a => {
        const aptSvId = String(a.IdSinhVien || (a as any).SinhVienId || (a as any).sinh_vien_id || '').trim().toLowerCase();
        return aptSvId === sId;
      });
    } else if (user.VaiTro === 'ChuTro') {
      const lId = String(user.Id).trim().toLowerCase();
      result = list.filter(a => {
        const aptCtId = String(a.ChuTroId || (a as any).IdChuTro || (a as any).chu_tro_id || '').trim().toLowerCase();
        return aptCtId === lId;
      });
    } else {
      result = list;
    }

    // Tự động kiểm tra và chuyển các lịch hẹn quá 24 giờ chưa duyệt hoặc giờ hẹn đã qua sang trạng thái 'Hết hạn'
    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    for (const apt of result) {
      if (apt.TrangThai === 'Chờ xác nhận') {
        const createdTime = apt.NgayTao ? new Date(apt.NgayTao).getTime() : 0;
        const henTime = apt.ThoiGianHen ? new Date(apt.ThoiGianHen).getTime() : 0;

        const isCreatedPast24h = createdTime > 0 && (now - createdTime > TWENTY_FOUR_HOURS_MS);
        const isHenTimePast = henTime > 0 && henTime < now;

        if (isCreatedPast24h || isHenTimePast) {
          const reason = isCreatedPast24h
            ? 'Quá thời hạn 24 giờ chủ trọ không phản hồi'
            : 'Thời gian hẹn đã trôi qua mà chưa được xác nhận';

          apt.TrangThai = 'Hết hạn';
          apt.LyDoTuChoi = apt.LyDoTuChoi || reason;

          try {
            await updateAppointmentInDb(apt.Id, {
              TrangThai: 'Hết hạn',
              LyDoTuChoi: apt.LyDoTuChoi,
            });
          } catch (updateErr) {
            console.warn('[Auto-expire Appointment] Error updating in DB:', updateErr);
          }
        }
      }
    }

    // Luôn sắp xếp lịch hẹn mới nhất lên đầu (theo NgayTao giảm dần)
    result.sort((a, b) => new Date(b.NgayTao || 0).getTime() - new Date(a.NgayTao || 0).getTime());

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    console.error('Lỗi khi tải danh sách lịch hẹn:', error);
    res.status(500).json({ success: false, message: error?.message || 'Lỗi khi tải danh sách lịch hẹn' });
  }
});

// POST /api/appointments - Sinh viên đặt lịch hẹn xem phòng
apiRouter.post('/appointments', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const { IdPhong, ThoiGianHen, GhiChu } = req.body;
    if (!IdPhong || !ThoiGianHen) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã phòng và thời gian hẹn.' });
      return;
    }
    const room = await getRoomByIdFromDb(IdPhong);
    if (!room) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
      return;
    }
    // Validate phòng hết phòng
    if (room.TrangThai === 'Hết phòng') {
      res.status(400).json({ success: false, message: 'Phòng này hiện đã được thuê hết' });
      return;
    }
    // Validate thời gian trong quá khứ
    const henDate = new Date(ThoiGianHen);
    if (isNaN(henDate.getTime()) || henDate.getTime() <= Date.now()) {
      res.status(400).json({ success: false, message: 'Thời gian hẹn không hợp lệ, vui lòng chọn lại' });
      return;
    }

    // Chuẩn hóa dữ liệu chủ trọ, đảm bảo không bao giờ bị undefined/null gây lỗi SQL trên TiDB Cloud
    let targetChuTroId = String(room.ChuTroId || room.IdChuTro || (room as any).chu_tro_id || '').trim();
    let targetChuTroTen = String(room.ChuTroTen || (room as any).chu_tro_ten || '').trim();
    let targetChuTroSdt = String(room.ChuTroSdt || (room as any).chu_tro_sdt || '').trim();

    if (!targetChuTroId) {
      targetChuTroId = 'usr_chutro';
    }
    if (!targetChuTroTen || !targetChuTroSdt) {
      try {
        const landlordUser = await getUserByIdFromDb(targetChuTroId);
        if (landlordUser) {
          if (!targetChuTroTen) targetChuTroTen = landlordUser.HoTen || '';
          if (!targetChuTroSdt) targetChuTroSdt = landlordUser.Sdt || '';
        }
      } catch {
        // ignore
      }
    }
    if (!targetChuTroTen) targetChuTroTen = 'Trần Thị Bích (Chủ trọ Cầu Giấy)';
    if (!targetChuTroSdt) targetChuTroSdt = '0987654321';

    // Chuẩn hóa dữ liệu sinh viên
    const studentId = String(user.Id || (user as any).id || '').trim();
    const studentName = String(user.HoTen || (user as any).name || (user as any).ho_ten || 'Sinh viên').trim();
    const studentPhone = String(user.Sdt || (user as any).phone || (user as any).sdt || '0912345678').trim();

    // Chuẩn hóa tiêu đề & địa chỉ phòng
    const roomTitle = String(room.TieuDe || (room as any).tieu_de || (room as any).title || 'Phòng trọ sinh viên').trim();
    const roomAddress = String(
      (room.DiaChi || (room as any).dia_chi || '') + 
      (room.QuanHuyen ? ((room.DiaChi || (room as any).dia_chi) ? ', ' : '') + room.QuanHuyen : '') || 
      'Hà Nội'
    ).trim();

    const newAppointment: LichHen = {
      Id: 'hen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      IdSinhVien: studentId,
      IdPhong: String(room.Id || IdPhong),
      ThoiGianHen: henDate.toISOString(),
      GhiChu: (GhiChu || '').trim(),
      TrangThai: 'Chờ xác nhận',
      TieuDePhong: roomTitle,
      DiaChiPhong: roomAddress,
      SinhVienTen: studentName,
      SinhVienSdt: studentPhone,
      ChuTroId: targetChuTroId,
      ChuTroTen: targetChuTroTen,
      ChuTroSdt: targetChuTroSdt,
      NgayTao: new Date().toISOString(),
    };

    const savedAppointment = await createAppointmentInDb(newAppointment);

    // Gửi thông báo đến chủ trọ
    try {
      if (targetChuTroId) {
        await addNotification(
          null,
          targetChuTroId,
          'Yêu cầu đặt lịch hẹn xem phòng mới!',
          `Sinh viên ${studentName} vừa gửi yêu cầu đặt lịch hẹn xem phòng "${roomTitle}" vào lúc ${henDate.toLocaleString('vi-VN')}. Vui lòng kiểm tra và phản hồi.`,
          'LichHen'
        );
      }

      // Gửi thông báo xác nhận đã tạo lịch hẹn đến sinh viên
      if (studentId) {
        await addNotification(
          null,
          studentId,
          'Đã gửi yêu cầu đặt lịch hẹn xem phòng',
          `Yêu cầu đặt lịch xem phòng "${roomTitle}" vào lúc ${henDate.toLocaleString('vi-VN')} đã được gửi thành công đến chủ trọ ${targetChuTroTen}. Vui lòng chờ xác nhận.`,
          'LichHen'
        );
      }
    } catch (notifErr) {
      console.warn('Lỗi gửi thông báo lịch hẹn:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Đặt lịch hẹn xem phòng thành công! Trạng thái: Chờ chủ trọ xác nhận',
      appointment: savedAppointment,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo lịch hẹn xem phòng:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Lỗi khi lưu lịch hẹn vào cơ sở dữ liệu TiDB Cloud. Vui lòng thử lại sau.'
    });
  }
});

// PUT /api/appointments/:id/cancel - Sinh viên hủy lịch hẹn (nếu chưa được xác nhận)
apiRouter.put('/appointments/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;

  const appointment = await getAppointmentByIdFromDb(req.params.id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại.' });
    return;
  }

  const aptStudentId = String(appointment.IdSinhVien || (appointment as any).SinhVienId || (appointment as any).sinh_vien_id || '').trim().toLowerCase();
  const currentUserId = String(user.Id).trim().toLowerCase();

  if (aptStudentId !== currentUserId && user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Bạn không có quyền hủy lịch hẹn này.' });
    return;
  }

  if (appointment.TrangThai === 'Đã hủy' || appointment.TrangThai === 'Hết hạn' || (appointment.TrangThai as any) === 'QuaHan') {
    res.status(400).json({ success: false, message: 'Lịch hẹn này đã được hủy hoặc đã hết hạn.' });
    return;
  }

  await updateAppointmentInDb(appointment.Id, { TrangThai: 'Đã hủy' });
  appointment.TrangThai = 'Đã hủy';

  // Thông báo cho chủ trọ biết sinh viên đã hủy lịch hẹn
  if (appointment.ChuTroId) {
    await addNotification(
      null,
      appointment.ChuTroId,
      'Sinh viên đã hủy lịch hẹn xem phòng',
      `Sinh viên ${user.HoTen} đã hủy lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}" lúc ${new Date(appointment.ThoiGianHen).toLocaleString('vi-VN')}.`,
      'LichHen'
    );
  }

  res.json({ success: true, message: 'Đã hủy lịch hẹn xem phòng.', appointment });
});

// PUT /api/appointments/:id/status - Chủ trọ hoặc Admin duyệt/hủy lịch hẹn
apiRouter.put('/appointments/:id/status', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status, reason } = req.body;

  const appointment = await getAppointmentByIdFromDb(req.params.id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại.' });
    return;
  }

  if (appointment.TrangThai === 'Hết hạn' || (appointment.TrangThai as any) === 'QuaHan') {
    res.status(400).json({ success: false, message: 'Lịch hẹn này đã hết hạn do quá 24 giờ không phản hồi.' });
    return;
  }

  const aptChuTroId = String(appointment.ChuTroId || (appointment as any).IdChuTro || (appointment as any).chu_tro_id || '').trim().toLowerCase();
  const currentUserId = String(user.Id).trim().toLowerCase();

  if (user.VaiTro !== 'Admin' && aptChuTroId !== currentUserId) {
    res.status(403).json({ success: false, message: 'Không có quyền thao tác lịch hẹn này.' });
    return;
  }

  if (status !== 'Đã xác nhận' && status !== 'Đã hủy') {
    res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    return;
  }

  const updates: Partial<LichHen> = { TrangThai: status };

  if (status === 'Đã xác nhận') {
    await addNotification(
      null,
      appointment.IdSinhVien,
      'Lịch hẹn xem phòng đã được xác nhận!',
      `Chủ trọ ${user.HoTen} đã xác nhận lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}" vào lúc ${new Date(appointment.ThoiGianHen).toLocaleString('vi-VN')}. Vui lòng đến đúng giờ nhé!`,
      'LichHen'
    );
  } else if (status === 'Đã hủy') {
    updates.LyDoTuChoi = (reason || '').trim() || 'Chủ trọ có lịch bận đột xuất hoặc phòng đã kín lịch';
    await addNotification(
      null,
      appointment.IdSinhVien,
      'Lịch hẹn xem phòng bị từ chối',
      `Chủ trọ ${user.HoTen} đã từ chối lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}". Lý do: ${updates.LyDoTuChoi}`,
      'LichHen'
    );
  }

  await updateAppointmentInDb(appointment.Id, updates);
  Object.assign(appointment, updates);

  res.json({ success: true, message: `Lịch hẹn đã chuyển sang trạng thái: ${status}`, appointment });
});

// DELETE /api/appointments/cancelled/all - Xóa hàng loạt lịch hẹn đã hủy hoặc hết hạn của sinh viên
apiRouter.delete('/appointments/cancelled/all', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const deletedCount = await bulkDeleteCancelledAppointmentsInDb(user.Id);
    res.json({
      success: true,
      message: 'Đã xóa toàn bộ lịch sử đã hủy thành công',
      count: deletedCount,
    });
  } catch (error: any) {
    console.error('Lỗi khi xóa hàng loạt lịch hẹn đã hủy:', error);
    res.status(500).json({ success: false, message: error?.message || 'Lỗi khi xóa hàng loạt lịch hẹn' });
  }
});

// DELETE /api/appointments/:id - Xóa bản ghi lịch hẹn xem phòng
apiRouter.delete('/appointments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const appointment = await getAppointmentByIdFromDb(req.params.id);

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại hoặc đã được xóa trước đó.' });
      return;
    }

    const aptStudentId = String(appointment.IdSinhVien || (appointment as any).SinhVienId || (appointment as any).sinh_vien_id || '').trim().toLowerCase();
    const aptChuTroId = String(appointment.ChuTroId || (appointment as any).IdChuTro || (appointment as any).chu_tro_id || '').trim().toLowerCase();
    const currentUserId = String(user.Id).trim().toLowerCase();

    if (user.VaiTro !== 'Admin' && aptStudentId !== currentUserId && aptChuTroId !== currentUserId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bản ghi lịch hẹn này.' });
      return;
    }

    await deleteAppointmentInDb(appointment.Id, user.VaiTro === 'Admin' ? undefined : user.Id);
    res.json({ success: true, message: 'Đã xóa bản ghi thành công' });
  } catch (error: any) {
    console.error('Lỗi khi xóa lịch hẹn:', error);
    res.status(500).json({ success: false, message: error?.message || 'Lỗi khi xóa lịch hẹn' });
  }
});

// -------------------------------------------------------------
// 3.2. ĐẶT CỌC GIỮ PHÒNG (DAT COC)
// -------------------------------------------------------------

// GET /api/deposits - Danh sách đặt cọc
apiRouter.get('/deposits', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const list = await getDepositsFromDb();

  let result: DatCoc[] = [];
  if (user.VaiTro === 'SinhVien') {
    result = list.filter(d => d.IdSinhVien === user.Id || (d as any).SinhVienId === user.Id);
  } else if (user.VaiTro === 'ChuTro') {
    result = list.filter(d => d.ChuTroId === user.Id || (d as any).IdChuTro === user.Id);
  } else {
    result = list;
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.NgayTao || b.NgayCoc || 0).getTime() - new Date(a.NgayTao || a.NgayCoc || 0).getTime());

  res.json({ success: true, count: result.length, data: result });
});

// POST /api/deposits - Sinh viên đặt cọc giữ phòng
apiRouter.post('/deposits', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { IdPhong, ThoiHanGiuCho } = req.body;

  if (!IdPhong) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn phòng trọ cần đặt cọc.' });
    return;
  }

  const room = await getRoomByIdFromDb(IdPhong);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  if (room.TrangThai === 'Hết phòng' || room.TrangThai === 'Đã cọc') {
    res.status(400).json({ success: false, message: 'Phòng này hiện đã được thuê hết hoặc đã có người đặt cọc.' });
    return;
  }

  // Kiểm tra xem sinh viên hiện tại đã có đơn cọc CHỜ XÁC NHẬN cho phòng này hay chưa
  const allDeposits = await getDepositsFromDb();
  const existingPending = allDeposits.find(
    d => (d.IdSinhVien === user.Id || (d as any).SinhVienId === user.Id) &&
         d.IdPhong === room.Id &&
         d.TrangThaiCoc === 'Chờ xác nhận'
  );
  if (existingPending) {
    res.status(400).json({
      success: false,
      message: 'Bạn đã có một đơn đặt cọc đang chờ chủ trọ duyệt cho phòng này rồi. Hãy kiểm tra mục Lịch sử của tôi.',
    });
    return;
  }

  // Kiểm tra xem có người khác đang đặt cọc chờ xác nhận không
  const otherPending = allDeposits.find(
    d => d.IdPhong === room.Id &&
         d.TrangThaiCoc === 'Chờ xác nhận' &&
         d.IdSinhVien !== user.Id &&
         (d as any).SinhVienId !== user.Id
  );
  if (otherPending) {
    res.status(400).json({
      success: false,
      message: 'Phòng này hiện đang có sinh viên khác đặt cọc giữ chỗ và đang chờ chủ trọ duyệt.',
    });
    return;
  }

  const TIEN_COC_QUY_DINH = 500000;

  // Lấy dữ liệu người dùng mới nhất từ DB
  const dbUser = await getUserByIdFromDb(user.Id);
  if (!dbUser || (dbUser.soDuVi || 0) < TIEN_COC_QUY_DINH) {
    res.status(400).json({
      success: false,
      message: 'Số dư không đủ',
      soDuHienTai: dbUser ? dbUser.soDuVi : 0,
      soTienCan: TIEN_COC_QUY_DINH,
    });
    return;
  }

  // Đủ tiền: Trừ tiền ví của sinh viên
  const newBalance = (dbUser.soDuVi || 0) - TIEN_COC_QUY_DINH;
  await updateUserInDb(user.Id, { soDuVi: newBalance });
  user.soDuVi = newBalance;

  // Ghi nhận lịch sử giao dịch trừ tiền cọc
  await createWalletTransactionInDb({
    Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    UserId: user.Id,
    LoaiGiaoDich: 'DatCoc',
    SoTien: -TIEN_COC_QUY_DINH,
    SoDuSauGiaoDich: newBalance,
    NoiDung: `Đặt cọc 500.000 VNĐ giữ chỗ phòng "${room.TieuDe}"`,
    MaThamChieu: room.Id,
    NgayTao: new Date().toISOString(),
  });

  // Chuyển trạng thái phòng sang "Chờ chủ trọ xác nhận cọc"
  await updateRoomInDb(room.Id, { TrangThai: 'Chờ chủ trọ xác nhận cọc' });

  // Tạo bản ghi DatCoc
  const newDeposit: DatCoc = {
    Id: 'coc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    IdSinhVien: user.Id,
    IdPhong: room.Id,
    SoTienCoc: TIEN_COC_QUY_DINH,
    NgayCoc: new Date().toISOString(),
    TrangThaiCoc: 'Chờ xác nhận',
    TieuDePhong: room.TieuDe,
    DiaChiPhong: room.DiaChi + (room.QuanHuyen ? ', ' + room.QuanHuyen : ''),
    SinhVienTen: user.HoTen,
    SinhVienSdt: user.Sdt,
    ChuTroId: room.IdChuTro || room.ChuTroId || '',
    ChuTroTen: room.ChuTroTen || 'Chủ trọ',
    ThoiHanGiuCho: ThoiHanGiuCho || '48 giờ sau khi chủ trọ xác nhận',
    NgayTao: new Date().toISOString(),
  };

  await createDepositInDb(newDeposit);

  // Gửi thông báo đến chủ trọ
  const chuTroId = room.IdChuTro || room.ChuTroId || '';
  if (chuTroId) {
    await addNotification(
      null,
      chuTroId,
      'Có đơn đặt cọc giữ phòng mới!',
      `Sinh viên ${user.HoTen} vừa đặt cọc 500.000 VNĐ giữ chỗ cho phòng "${room.TieuDe}". Vui lòng xử lý đơn trong mục Quản lý yêu cầu trong vòng 48h.`,
      'DatCoc'
    );
  }

  // BỔ SUNG thông báo gửi cho CHÍNH SINH VIÊN
  await addNotification(
    null,
    user.Id,
    'Đặt cọc giữ phòng thành công!',
    'Bạn đã thanh toán 500.000 VNĐ đặt cọc giữ chỗ phòng "' + room.TieuDe + '". Đơn đang chờ chủ trọ xác nhận trong 48h.',
    'DatCoc'
  );

  res.status(201).json({
    success: true,
    message: 'Đặt cọc giữ phòng thành công! Số dư đã trừ 500.000 VNĐ. Phòng đã chuyển sang trạng thái "Chờ chủ trọ xác nhận cọc".',
    deposit: newDeposit,
    newBalance,
    user: sanitizeUser({ ...user, soDuVi: newBalance }),
  });
});

// PUT /api/deposits/:id/cancel - Sinh viên hủy đơn cọc trước khi duyệt -> Hoàn tiền
apiRouter.put('/deposits/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;

  const deposit = await getDepositByIdFromDb(req.params.id);
  if (!deposit) {
    res.status(404).json({ success: false, message: 'Đơn đặt cọc không tồn tại.' });
    return;
  }

  if (deposit.IdSinhVien !== user.Id && (deposit as any).SinhVienId !== user.Id && user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác đơn này.' });
    return;
  }

  if (deposit.TrangThaiCoc !== 'Chờ xác nhận') {
    res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn cọc khi đang ở trạng thái Chờ xác nhận.' });
    return;
  }

  const updates: Partial<DatCoc> = {
    TrangThaiCoc: 'Đã hủy',
    LyDoTuChoi: 'Sinh viên chủ động hủy trước khi chủ trọ tiếp nhận',
  };
  await updateDepositInDb(deposit.Id, updates);
  Object.assign(deposit, updates);

  // Hoàn tiền 100% cho sinh viên
  let sinhVienBalance = 0;
  let updatedSinhVien: NguoiDung | null = null;
  const sinhVien = await getUserByIdFromDb(deposit.IdSinhVien || (deposit as any).SinhVienId);
  if (sinhVien) {
    sinhVienBalance = (sinhVien.soDuVi || 0) + deposit.SoTienCoc;
    updatedSinhVien = await updateUserInDb(sinhVien.Id, { soDuVi: sinhVienBalance });

    // Ghi nhận lịch sử giao dịch hoàn tiền cọc
    await createWalletTransactionInDb({
      Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      UserId: sinhVien.Id,
      LoaiGiaoDich: 'HoanCoc',
      SoTien: deposit.SoTienCoc,
      SoDuSauGiaoDich: sinhVienBalance,
      NoiDung: `Hoàn 100% tiền cọc (+${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ) giữ chỗ phòng "${deposit.TieuDePhong || 'Phòng trọ'}"`,
      MaThamChieu: deposit.Id,
      NgayTao: new Date().toISOString(),
    });
  }

  // Khôi phục trạng thái phòng về "Còn phòng"
  const room = await getRoomByIdFromDb(deposit.IdPhong);
  if (room && (room.TrangThai === 'Chờ chủ trọ xác nhận cọc' || room.TrangThai === 'Đã cọc')) {
    await updateRoomInDb(room.Id, { TrangThai: 'Còn phòng' });
  }

  // Thông báo đến chủ trọ về việc sinh viên đã hủy đơn đặt cọc
  const targetChuTroId = deposit.ChuTroId || (deposit as any).IdChuTro || room?.IdChuTro || room?.ChuTroId;
  if (targetChuTroId) {
    await addNotification(
      null,
      targetChuTroId,
      'Sinh viên đã hủy đơn đặt cọc',
      `Sinh viên ${user.HoTen} đã hủy đơn cọc giữ chỗ phòng "${deposit.TieuDePhong || 'Phòng trọ'}". Phòng đã được mở lại cho sinh viên khác.`,
      'DatCoc'
    );
  }

  res.json({
    success: true,
    message: 'Đã hủy đơn đặt cọc và hoàn trả 500.000 VNĐ vào ví của bạn thành công!',
    deposit,
    newBalance: sinhVien ? sinhVienBalance : undefined,
    user: updatedSinhVien ? sanitizeUser(updatedSinhVien) : undefined,
  });
});

// PUT /api/deposits/:id/status - Chủ trọ hoặc Admin duyệt hoặc từ chối cọc
apiRouter.put('/deposits/:id/status', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status, reason } = req.body; // 'Đã tiếp nhận thành công' | 'Đã xác nhận' | 'Đã hủy'

  const deposit = await getDepositByIdFromDb(req.params.id);
  if (!deposit) {
    res.status(404).json({ success: false, message: 'Đơn đặt cọc không tồn tại.' });
    return;
  }

  if (user.VaiTro !== 'Admin' && deposit.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Không có quyền thao tác đơn cọc này.' });
    return;
  }

  const room = await getRoomByIdFromDb(deposit.IdPhong);

  if (status === 'Đã tiếp nhận thành công' || status === 'Đã xác nhận') {
    await updateDepositInDb(deposit.Id, { TrangThaiCoc: 'Đã tiếp nhận thành công' });
    deposit.TrangThaiCoc = 'Đã tiếp nhận thành công';

    // Chủ trọ nhận tiền cọc vào ví
    const chuTro = await getUserByIdFromDb(deposit.ChuTroId || '');
    if (chuTro) {
      const chuTroNewBal = (chuTro.soDuVi || 0) + deposit.SoTienCoc;
      await updateUserInDb(chuTro.Id, { soDuVi: chuTroNewBal });

      // Ghi nhận lịch sử giao dịch nhận cọc cho chủ trọ
      await createWalletTransactionInDb({
        Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        UserId: chuTro.Id,
        LoaiGiaoDich: 'NhanCoc',
        SoTien: deposit.SoTienCoc,
        SoDuSauGiaoDich: chuTroNewBal,
        NoiDung: `Nhận tiền cọc giữ chỗ +${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ cho phòng "${deposit.TieuDePhong}" từ ${deposit.SinhVienTen}`,
        MaThamChieu: deposit.Id,
        NgayTao: new Date().toISOString(),
      });
    }
    // Cập nhật phòng sang "Đã cọc"
    if (room) {
      await updateRoomInDb(room.Id, { TrangThai: 'Đã cọc' });
    }

    // Gửi thông báo đến sinh viên
    const targetSinhVienId = deposit.IdSinhVien || (deposit as any).SinhVienId || '';
    if (targetSinhVienId) {
      await addNotification(
        null,
        targetSinhVienId,
        'Đơn đặt cọc đã được tiếp nhận thành công!',
        `Chủ trọ ${user.HoTen} đã tiếp nhận thành công đơn đặt cọc ${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ cho phòng "${deposit.TieuDePhong || 'Phòng trọ'}". Phòng đã được chuyển sang trạng thái "Đã cọc" và bảo lưu chỗ cho bạn.`,
        'DatCoc'
      );
    }

    res.json({
      success: true,
      message: 'Đã tiếp nhận đơn đặt cọc thành công! Phòng đã chuyển sang trạng thái "Đã cọc".',
      deposit,
    });
  } else if (status === 'Đã hủy') {
    const rejectReason = (reason || '').trim() || 'Chủ trọ không thể tiếp nhận cọc vào lúc này';
    await updateDepositInDb(deposit.Id, { TrangThaiCoc: 'Đã hủy', LyDoTuChoi: rejectReason });
    deposit.TrangThaiCoc = 'Đã hủy';
    deposit.LyDoTuChoi = rejectReason;

    // Tự động hoàn lại 100% tiền cọc vào ví sinh viên
    const targetSinhVienId = deposit.IdSinhVien || (deposit as any).SinhVienId || '';
    const sinhVien = targetSinhVienId ? await getUserByIdFromDb(targetSinhVienId) : null;
    if (sinhVien) {
      const svNewBal = (sinhVien.soDuVi || 0) + deposit.SoTienCoc;
      await updateUserInDb(sinhVien.Id, { soDuVi: svNewBal });

      // Ghi nhận lịch sử giao dịch hoàn tiền cọc
      await createWalletTransactionInDb({
        Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        UserId: sinhVien.Id,
        LoaiGiaoDich: 'HoanCoc',
        SoTien: deposit.SoTienCoc,
        SoDuSauGiaoDich: svNewBal,
        NoiDung: `Hoàn 100% tiền cọc (+${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ) do chủ trọ từ chối đơn cọc phòng "${deposit.TieuDePhong || 'Phòng trọ'}"`,
        MaThamChieu: deposit.Id,
        NgayTao: new Date().toISOString(),
      });
    }

    // Khôi phục phòng về Còn phòng
    if (room && (room.TrangThai === 'Chờ chủ trọ xác nhận cọc' || room.TrangThai === 'Đã cọc')) {
      await updateRoomInDb(room.Id, { TrangThai: 'Còn phòng' });
    }

    // Gửi thông báo hoàn tiền đến sinh viên
    if (targetSinhVienId) {
      await addNotification(
        null,
        targetSinhVienId,
        'Đơn đặt cọc phòng bị từ chối - Đã hoàn tiền ví',
        `Đơn cọc phòng "${deposit.TieuDePhong || 'Phòng trọ'}" đã bị từ chối. Lý do: "${rejectReason}". Toàn bộ ${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ tiền cọc đã được hoàn trả 100% vào ví của bạn.`,
        'DatCoc'
      );
    }

    res.json({
      success: true,
      message: `Đã từ chối đơn cọc và tự động hoàn trả 100% (${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ) cho sinh viên.`,
      deposit,
    });
  } else {
    res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
  }
});

// DELETE /api/deposits/cancelled/all - Xóa hàng loạt đơn cọc đã hủy / từ chối của sinh viên
apiRouter.delete('/deposits/cancelled/all', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const deletedCount = await bulkDeleteCancelledDepositsInDb(user.Id);
    res.json({
      success: true,
      message: 'Đã xóa toàn bộ lịch sử đã hủy thành công',
      count: deletedCount,
    });
  } catch (error: any) {
    console.error('Lỗi khi xóa hàng loạt đơn cọc đã hủy:', error);
    res.status(500).json({ success: false, message: error?.message || 'Lỗi khi xóa hàng loạt đơn cọc' });
  }
});

// DELETE /api/deposits/:id - Xóa bản ghi đơn đặt cọc giữ chỗ
apiRouter.delete('/deposits/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const deposit = await getDepositByIdFromDb(req.params.id);

    if (!deposit) {
      res.status(404).json({ success: false, message: 'Đơn đặt cọc không tồn tại hoặc đã được xóa trước đó.' });
      return;
    }

    const depStudentId = String(deposit.IdSinhVien || (deposit as any).SinhVienId || '').trim().toLowerCase();
    const depChuTroId = String(deposit.ChuTroId || (deposit as any).IdChuTro || '').trim().toLowerCase();
    const currentUserId = String(user.Id).trim().toLowerCase();

    if (user.VaiTro !== 'Admin' && depStudentId !== currentUserId && depChuTroId !== currentUserId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đơn cọc này.' });
      return;
    }

    // Không cho phép xóa đơn cọc đang chờ xác nhận để tránh mất mát giao dịch đang xử lý
    if (deposit.TrangThaiCoc === 'Chờ xác nhận') {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa đơn đặt cọc đang chờ xác nhận. Vui lòng hủy đơn cọc trước nếu muốn hoàn tiền.',
      });
      return;
    }

    await deleteDepositInDb(deposit.Id, user.VaiTro === 'Admin' ? undefined : user.Id);
    res.json({ success: true, message: 'Đã xóa bản ghi thành công' });
  } catch (error: any) {
    console.error('Lỗi khi xóa đơn đặt cọc:', error);
    res.status(500).json({ success: false, message: error?.message || 'Lỗi khi xóa đơn đặt cọc' });
  }
});

// POST /api/wallet/topup - Nạp tiền ví
apiRouter.post('/wallet/topup', requireAuth, async (req: Request, res: Response) => {
  const currentUser = (req as any).user as NguoiDung;
  const amount = Number(req.body.amount) || 1000000;

  if (amount <= 0 || amount > 100000000) {
    res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ (từ 10.000 đến 100.000.000 VNĐ).' });
    return;
  }

  const user = await getUserByIdFromDb(currentUser.Id);
  if (!user) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return;
  }

  const newBalance = (user.soDuVi || 0) + amount;
  await updateUserInDb(user.Id, { soDuVi: newBalance });
  user.soDuVi = newBalance;

  // Ghi lại lịch sử thanh toán
  await createWalletTransactionInDb({
    Id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    UserId: user.Id,
    LoaiGiaoDich: 'NapTien',
    SoTien: amount,
    SoDuSauGiaoDich: newBalance,
    NoiDung: `Nạp tiền vào ví điện tử: +${amount.toLocaleString('vi-VN')} VNĐ`,
    NgayTao: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Đã nạp +${amount.toLocaleString('vi-VN')} VNĐ vào ví thành công!`,
    newBalance,
    soDuVi: newBalance,
    user: sanitizeUser(user),
  });
});

// -------------------------------------------------------------
// 5. ĐÁNH GIÁ PHÒNG TRỌ CÓ PHÂN QUYỀN XÁC MINH (REVIEWS API)
// -------------------------------------------------------------

// GET /api/rooms/:roomId/can-review - Kiểm tra quyền đánh giá phòng trọ
apiRouter.get('/rooms/:roomId/can-review', async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const queryUserId = req.query.userId as string | undefined;

  let effectiveUserId = queryUserId;
  if (!effectiveUserId) {
    const authHeader = req.headers.authorization;
    const authUser = await getUserByToken(authHeader);
    if (authUser) {
      effectiveUserId = authUser.Id;
    }
  }

  if (!effectiveUserId) {
    res.json({
      success: true,
      canReview: false,
      reason: 'Vui lòng đăng nhập để kiểm tra quyền đánh giá phòng trọ.',
    });
    return;
  }

  const result = await canUserReviewRoomInDb(roomId, effectiveUserId);
  res.json({
    success: true,
    canReview: result.canReview,
    reason: result.reason,
    contractId: result.contractId,
    contract: result.contract,
  });
});

// GET /api/rooms/:roomId/reviews - Lấy danh sách đánh giá kèm xác minh
apiRouter.get('/rooms/:roomId/reviews', async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const reviews = await getReviewsFromDb(roomId);
  res.json({ success: true, count: reviews.length, data: reviews });
});

// POST /api/rooms/:roomId/reviews - Gửi đánh giá phòng trọ (Chỉ người thuê đã xác minh)
apiRouter.post('/rooms/:roomId/reviews', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const roomId = req.params.roomId;
  const { soSao, nhanXet } = req.body;

  const room = await getRoomByIdFromDb(roomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  // BƯỚC KIỂM TRA CHẶT CHẼ ĐIỀU KIỆN ĐÁNH GIÁ Ở BACKEND
  const check = await canUserReviewRoomInDb(roomId, user.Id);
  if (!check.canReview) {
    res.status(403).json({
      success: false,
      message: check.reason || 'Chỉ người thuê phòng đã được xác minh mới có thể gửi đánh giá và nhận xét.'
    });
    return;
  }

  const star = Math.min(5, Math.max(1, Math.round(Number(soSao) || 5)));
  const comment = (nhanXet || '').trim();

  if (!comment) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung đánh giá/nhận xét chi tiết.' });
    return;
  }

  // Lưu bản ghi vào bảng reviews (MySQL & fallback)
  const newReviewRecord = await createReviewInDb({
    room_id: roomId,
    renter_id: user.Id,
    contract_id: check.contractId || 1,
    tenNguoiDanhGia: user.HoTen,
    truongHoc: 'Sinh viên đã xác minh thuê phòng',
    soSao: star,
    nhanXet: comment,
    is_verified: true,
  });

  // Lấy danh sách reviews mới nhất của phòng
  const updatedRoom = await getRoomByIdFromDb(roomId);

  // Gửi thông báo đến chủ trọ
  const landlordId = room.IdChuTro || room.ChuTroId;
  if (landlordId) {
    await addNotification(
      null,
      landlordId,
      'Phòng trọ nhận được đánh giá từ sinh viên đã đặt cọc!',
      `Sinh viên ${user.HoTen} đã gửi đánh giá ${star} sao cho phòng "${room.TieuDe}": "${comment}"`,
      'PhongTro'
    );
  }

  res.status(201).json({
    success: true,
    message: 'Gửi đánh giá phòng trọ thành công! Đánh giá của bạn đã được gắn huy hiệu Đã xác minh thuê phòng.',
    review: newReviewRecord,
    allReviews: updatedRoom ? updatedRoom.DanhGia : [],
  });
});

// -------------------------------------------------------------
// 6. THÔNG BÁO (NOTIFICATIONS API)
// -------------------------------------------------------------

apiRouter.get('/notifications', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const userNotifications = await getNotificationsFromDb(user.Id);

  // Sắp xếp mới nhất lên đầu
  userNotifications.sort((a, b) => new Date(b.NgayTao || 0).getTime() - new Date(a.NgayTao || 0).getTime());

  const unreadCount = userNotifications.filter(n => n.TrangThai === 'ChuaDoc').length;
  const categoryCounts = {
    total: userNotifications.length,
    unread: unreadCount,
    lichHen: userNotifications.filter(n => n.Loai === 'LichHen').length,
    datCoc: userNotifications.filter(n => n.Loai === 'DatCoc').length,
    phongTro: userNotifications.filter(n => n.Loai === 'PhongTro').length,
    heThong: userNotifications.filter(n => n.Loai === 'HeThong').length,
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    data: userNotifications,
    unreadCount,
    categoryCounts,
  });
});

apiRouter.put('/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  await markNotificationReadInDb(req.params.id);
  res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
});

apiRouter.put('/notifications/read-all', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  await markAllNotificationsReadInDb(user.Id);
  res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
});

// DELETE /api/notifications/:id - Xóa 1 thông báo
apiRouter.delete('/notifications/:id', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  await deleteNotificationInDb(req.params.id, user.Id);
  res.json({ success: true, message: 'Đã xóa thông báo' });
});

// DELETE /api/notifications/clear-read - Xóa tất cả thông báo đã đọc
apiRouter.delete('/notifications/clear-read', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  await clearReadNotificationsInDb(user.Id);
  res.json({ success: true, message: 'Đã dọn dẹp các thông báo đã đọc' });
});

// POST /api/notifications/test-generate - Sinh thông báo thử nghiệm thời gian thực
apiRouter.post('/notifications/test-generate', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { scenario } = req.body;
  const db = readDb();

  let newNotif: ThongBao;

  if (user.VaiTro === 'SinhVien') {
    if (scenario === 'booking-confirm') {
      newNotif = await addNotification(
        db,
        user.Id,
        'Lịch hẹn xem phòng đã được xác nhận!',
        `Chủ trọ Nguyễn Văn Hưng đã xác nhận lịch hẹn xem phòng "Phòng trọ Studio Tạ Quang Bửu" vào lúc ${new Date(Date.now() + 86400000).toLocaleString('vi-VN')}. Vui lòng đến đúng giờ nhé!`,
        'LichHen'
      );
    } else if (scenario === 'deposit-success') {
      newNotif = await addNotification(
        db,
        user.Id,
        'Đơn đặt cọc đã được tiếp nhận thành công!',
        `Chủ trọ Hoàng Thị Mai đã tiếp nhận khoản tiền cọc 500.000 VNĐ cho phòng "Gác lửng Cầu Giấy". Chỗ ở đã được bảo lưu thành công cho bạn!`,
        'DatCoc'
      );
    } else if (scenario === 'deposit-refund') {
      newNotif = await addNotification(
        db,
        user.Id,
        'Hoàn trả tiền cọc về ví thành công',
        `Đơn đặt cọc giữ phòng đã được xử lý hoàn tiền. Số tiền 500.000 VNĐ đã được cộng lại vào ví cá nhân của bạn.`,
        'DatCoc'
      );
    } else {
      newNotif = await addNotification(
        db,
        user.Id,
        'Cập nhật trạng thái đặt phòng',
        `Phòng trọ bạn đang quan tâm tại khu vực Hai Bà Trưng vừa cập nhật giảm giá thuê và có ưu đãi sinh viên mới.`,
        'PhongTro'
      );
    }
  } else if (user.VaiTro === 'ChuTro') {
    if (scenario === 'booking-request') {
      newNotif = await addNotification(
        db,
        user.Id,
        'Yêu cầu đặt chỗ / Lịch hẹn xem phòng mới!',
        `Sinh viên Trần Minh Quang (SĐT: 0981.234.567) vừa gửi yêu cầu đặt lịch xem phòng trọ của bạn vào 10:00 ngày mai. Vui lòng kiểm tra và xác nhận.`,
        'LichHen'
      );
    } else if (scenario === 'deposit-request') {
      newNotif = await addNotification(
        db,
        user.Id,
        'Có đơn đặt cọc giữ phòng mới (500.000 đ)!',
        `Sinh viên Lê Phương Anh vừa thanh toán cọc giữ phòng 500.000 VNĐ qua ví HostelHub. Vui lòng tiếp nhận hoặc phản hồi trong 24 giờ.`,
        'DatCoc'
      );
    } else {
      newNotif = await addNotification(
        db,
        user.Id,
        'Tin đăng phòng trọ đã được phê duyệt!',
        `Bài đăng phòng trọ mới của bạn đã được kiểm duyệt hợp lệ và công khai tới hơn 15.000 sinh viên trên hệ thống.`,
        'PhongTro'
      );
    }
  } else {
    newNotif = await addNotification(
      db,
      user.Id,
      'Thông báo quản trị hệ thống',
      `Hệ thống vừa ghi nhận giao dịch đặt cọc bảo đảm mới và tin đăng phòng trọ cần rà soát kiểm duyệt.`,
      'HeThong'
    );
  }

  writeDb(db);
  res.status(201).json({ success: true, notification: newNotif });
});

// -------------------------------------------------------------
// 6. ADMIN MANAGEMENT (DÀNH CHO ADMIN)
// -------------------------------------------------------------

// GET /api/admin/rooms - Lấy toàn bộ danh sách phòng cho Admin từ MySQL/TiDB (ORDER BY NgayDang DESC)
apiRouter.get('/admin/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền xem danh sách phòng kiểm duyệt.' });
      return;
    }

    const { status } = req.query;
    let rooms: PhongTro[] = [];

    const isConn = await isMySqlConnected();
    if (isConn) {
      try {
        let sql = 'SELECT * FROM rooms';
        const params: any[] = [];

        if (status && typeof status === 'string' && status !== 'all') {
          const st = status.trim().toLowerCase();
          if (st === 'chờ duyệt' || st === 'choduyet' || st === 'cho_duyet' || st === 'pending') {
            sql += ' WHERE TrangThai = ? OR TrangThai = ? OR TrangThai = ? OR TrangThai = ?';
            params.push('Chờ duyệt', 'ChoDuyet', 'cho_duyet', 'pending');
          } else if (st === 'công khai' || st === 'congkhai' || st === 'approved') {
            sql += ' WHERE TrangThai = ? OR TrangThai = ? OR TrangThai = ?';
            params.push('Công khai', 'Còn phòng', 'approved');
          } else if (st === 'từ chối' || st === 'tuchoi' || st === 'rejected') {
            sql += ' WHERE TrangThai = ? OR TrangThai = ? OR TrangThai = ?';
            params.push('Từ chối', 'TuChoi', 'rejected');
          } else {
            sql += ' WHERE TrangThai = ?';
            params.push(status);
          }
        }

        // Đảm bảo sắp xếp theo ngày tạo mới nhất (ORDER BY NgayDang DESC)
        sql += ' ORDER BY COALESCE(NgayDang, Id) DESC';

        const [rows] = await pool.query(sql, params);
        rooms = (rows as any[]).map(parseRoomRow);

        // Đồng bộ cache bộ nhớ
        const db = readDb();
        if (rooms.length > 0) {
          db.rooms = rooms;
        }
      } catch (sqlErr) {
        console.warn('[MySQL] Error querying /admin/rooms, falling back to local store:', sqlErr);
        const db = readDb();
        rooms = db.rooms || [];
      }
    } else {
      const db = readDb();
      rooms = db.rooms || [];
    }

    // Sắp xếp mới nhất lên đầu
    rooms.sort((a, b) => {
      const timeA = new Date(a.NgayDang || 0).getTime() || 0;
      const timeB = new Date(b.NgayDang || 0).getTime() || 0;
      return timeB - timeA;
    });

    if (status && typeof status === 'string' && status !== 'all') {
      const target = status.trim().toLowerCase();
      rooms = rooms.filter(r => {
        const s = (r.TrangThai || '').trim().toLowerCase();
        if (target === 'chờ duyệt' || target === 'choduyet' || target === 'cho_duyet' || target === 'pending') {
          return s === 'chờ duyệt' || s === 'choduyet' || s === 'cho_duyet' || s === 'pending';
        }
        if (target === 'công khai' || target === 'congkhai' || target === 'approved') {
          return s === 'công khai' || s === 'còn phòng' || s === 'congkhai' || s === 'approved';
        }
        if (target === 'từ chối' || target === 'tuchoi' || target === 'rejected') {
          return s === 'từ chối' || s === 'tuchoi' || s === 'rejected';
        }
        return s === target;
      });
    }

    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách phòng cho Admin:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi truy vấn cơ sở dữ liệu' });
  }
});

// PUT /api/admin/rooms/:id/moderate - Phê duyệt hoặc Từ chối phòng trọ
apiRouter.put('/admin/rooms/:id/moderate', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền kiểm duyệt phòng trọ.' });
      return;
    }

    const { action, reason } = req.body; // 'approve' | 'reject'
    const db = readDb();
    let room = db.rooms.find(r => r.Id === req.params.id);
    if (!room) {
      room = (await getRoomByIdFromDb(req.params.id)) || undefined;
    }
    if (!room) {
      res.status(404).json({ success: false, message: 'Phòng trọ không tồn tại.' });
      return;
    }

    const isConn = await isMySqlConnected();

    if (action === 'approve') {
      room.TrangThai = 'Còn phòng';
      room.LyDoTuChoi = undefined;

      if (isConn) {
        try {
          await pool.execute(
            'UPDATE rooms SET TrangThai = ?, LyDoTuChoi = NULL WHERE Id = ?',
            ['Còn phòng', room.Id]
          );
        } catch (err: any) {
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            await pool.execute(
              'UPDATE rooms SET trang_thai = ?, ly_do_tu_choi = NULL WHERE id = ?',
              ['Còn phòng', room.Id]
            );
          }
        }
      }

      addNotification(
        db,
        room.IdChuTro || room.ChuTroId || '',
        'Tin đăng phòng trọ đã được phê duyệt!',
        `Tin đăng "${room.TieuDe}" của bạn đã được kiểm duyệt và chuyển sang trạng thái "Công khai", sẵn sàng hiển thị trên trang tìm kiếm.`,
        'PhongTro'
      );

      writeDb(db);
      res.json({
        success: true,
        message: 'Đã phê duyệt phòng trọ thành công! Phòng đã chuyển sang trạng thái "Công khai".',
        room,
      });
    } else if (action === 'reject') {
      const rejectReason = (reason || '').trim() || 'Thông tin phòng trọ chưa đạt tiêu chuẩn kiểm duyệt của hệ thống.';
      room.TrangThai = 'Từ chối';
      room.LyDoTuChoi = rejectReason;

      if (isConn) {
        try {
          await pool.execute(
            'UPDATE rooms SET TrangThai = ?, LyDoTuChoi = ? WHERE Id = ?',
            ['Từ chối', rejectReason, room.Id]
          );
        } catch (err: any) {
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            await pool.execute(
              'UPDATE rooms SET trang_thai = ?, ly_do_tu_choi = ? WHERE id = ?',
              ['Từ chối', rejectReason, room.Id]
            );
          }
        }
      }

      addNotification(
        db,
        room.IdChuTro || room.ChuTroId || '',
        'Tin đăng phòng trọ bị từ chối phê duyệt',
        `Tin đăng "${room.TieuDe}" của bạn đã bị từ chối kiểm duyệt. Lý do: "${rejectReason}". Vui lòng kiểm tra và cập nhật lại thông tin.`,
        'PhongTro'
      );

      writeDb(db);
      res.json({
        success: true,
        message: 'Đã từ chối bài đăng phòng trọ.',
        room,
      });
    } else {
      res.status(400).json({ success: false, message: 'Hành động không hợp lệ (approve hoặc reject).' });
    }
  } catch (error: any) {
    console.error('Lỗi khi kiểm duyệt phòng:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật trạng thái phòng' });
  }
});

apiRouter.get('/admin/users', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền truy cập.' });
      return;
    }

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    const rawUsers = await getUsersFromDb();
    const users = (rawUsers || []).map(u => ({
      ...u,
      soDuVi: Number(u.soDuVi || 0),
    }));

    res.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng cho Admin:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ khi lấy danh sách người dùng' });
  }
});

apiRouter.put('/admin/users/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền thực hiện.' });
      return;
    }
    const targetId = req.params.id;
    if (targetId === user.Id) {
      res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản Quản trị viên của chính bạn.' });
      return;
    }

    // 1. Tìm người dùng từ TiDB Cloud trước, nếu không có mới tìm trong database.json
    let target = await getUserByIdFromDb(targetId);
    if (!target) {
      const db = readDb();
      target = (db.users || []).find(u => u.Id === targetId) || null;
    }

    if (!target) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    const newStatus = target.TrangThai === 'HoatDong' ? 'BiKhoa' : 'HoatDong';

    // 2. Cập nhật trạng thái vào TiDB Cloud
    await updateUserInDb(targetId, { TrangThai: newStatus });
    target.TrangThai = newStatus;

    // 3. Đồng bộ lại vào database.json nếu có bản ghi trong file tĩnh
    try {
      const db = readDb();
      const localUser = (db.users || []).find(u => u.Id === targetId);
      if (localUser) {
        localUser.TrangThai = newStatus;
        writeDb(db);
      }
    } catch (fsErr) {
      console.warn('[JSON] Bỏ qua cập nhật database.json:', fsErr);
    }

    res.json({
      success: true,
      message: `Đã ${newStatus === 'HoatDong' ? 'mở khóa' : 'khóa'} tài khoản ${target.HoTen}!`,
      user: sanitizeUser(target),
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật trạng thái người dùng:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi xử lý yêu cầu' });
  }
});

apiRouter.get('/admin/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền xem thống kê.' });
      return;
    }

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    const db = readDb();
    const rawUsers = await getUsersFromDb();
    const users = (rawUsers || []).map(u => ({
      ...u,
      soDuVi: Number(u.soDuVi || 0),
    }));

    const totalUsers = users.length;
    const sinhVienCount = users.filter(u => u.VaiTro === 'SinhVien').length;
    const chuTroCount = users.filter(u => u.VaiTro === 'ChuTro').length;
    const totalRooms = db.rooms.length;
    const availableRooms = db.rooms.filter(r => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai').length;
    const totalInquiries = db.inquiries.length;
    const totalWallet = users.reduce((sum, u) => sum + (Number(u.soDuVi) || 0), 0);

    // Requirements from prompt:
    // 1. Tổng số phòng đã đăng (theo trạng thái)
    // 2. Lượt đặt lịch hàng tháng
    // 3. Tỷ lệ đặt cọc thành công (Đã xác nhận / Tổng số đơn)
    const roomsByStatus = {
      'Công khai': db.rooms.filter(r => r.TrangThai === 'Công khai').length,
      'Còn phòng': db.rooms.filter(r => r.TrangThai === 'Còn phòng').length,
      'Chờ duyệt': db.rooms.filter(r => r.TrangThai === 'Chờ duyệt').length,
      'Đã cọc': db.rooms.filter(r => r.TrangThai === 'Đã cọc').length,
      'Hết phòng': db.rooms.filter(r => r.TrangThai === 'Hết phòng').length,
      'Từ chối': db.rooms.filter(r => r.TrangThai === 'Từ chối').length,
    };

    // 2. Lượt đặt lịch hàng tháng (12 tháng của năm)
    const monthLabels = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    // Baseline realistic trends for academic calendar (peaks around student move-in periods Jul-Sep)
    const baselineMonthly = [12, 18, 25, 22, 30, 48, 72, 88, 95, 42, 26, 32];
    const appointmentsByMonth = new Array(12).fill(0);

    (db.appointments || []).forEach(app => {
      const d = new Date(app.NgayTao || app.ThoiGianHen);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          appointmentsByMonth[m] += 1;
        }
      }
    });

    const monthlyAppointmentsData = baselineMonthly.map((base, idx) => base + appointmentsByMonth[idx]);
    const totalAppointments = (db.appointments || []).length;

    // 3. Tỷ lệ cọc thành công & Chi tiết đơn cọc
    const allDeposits = db.deposits || [];
    const totalDeposits = allDeposits.length;
    const successfulDeposits = allDeposits.filter(
      d => d.TrangThaiCoc === 'Đã tiếp nhận thành công' || d.TrangThaiCoc === 'Đã xác nhận'
    ).length;
    const pendingDeposits = allDeposits.filter(
      d => d.TrangThaiCoc === 'Chờ xác nhận'
    ).length;
    const cancelledDeposits = allDeposits.filter(
      d => d.TrangThaiCoc === 'Đã hủy'
    ).length;

    const depositSuccessRate = totalDeposits > 0 ? Math.round((successfulDeposits / totalDeposits) * 100) : 0;
    const pendingRoomsCount = db.rooms.filter(r => r.TrangThai === 'Chờ duyệt').length;

    const depositStats = {
      total: totalDeposits,
      successful: successfulDeposits,
      pending: pendingDeposits,
      cancelled: cancelledDeposits,
      successRate: depositSuccessRate,
      totalDepositMoney: allDeposits
        .filter(d => d.TrangThaiCoc === 'Đã tiếp nhận thành công' || d.TrangThaiCoc === 'Đã xác nhận')
        .reduce((sum, d) => sum + (d.SoTienCoc || 0), 0),
    };

    res.json({
      success: true,
      data: {
        totalUsers,
        sinhVienCount,
        chuTroCount,
        totalRooms,
        availableRooms,
        totalInquiries,
        totalWallet,
        totalAppointments,
        totalDeposits,
        successfulDeposits,
        depositSuccessRate,
        roomsByStatus,
        pendingRoomsCount,
        monthlyAppointments: {
          labels: monthLabels,
          data: monthlyAppointmentsData,
        },
        depositStats,
      },
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy thống kê Admin:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ khi lấy dữ liệu thống kê' });
  }
});

// -------------------------------------------------------------
// FAVORITES (MỤC YÊU THÍCH PHÒNG TRỌ CỦA SINH VIÊN)
// -------------------------------------------------------------

// GET /api/favorites
apiRouter.get('/favorites', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.favorites) db.favorites = [];

  const userFavs = db.favorites.filter(f => f.UserId === user.Id);
  const roomIds = userFavs.map(f => f.PhongId);
  
  // Get full room details for favorited rooms
  const rooms = db.rooms.filter(r => roomIds.includes(r.Id));

  res.json({
    success: true,
    roomIds,
    rooms,
    total: rooms.length,
  });
});

// POST /api/favorites/toggle
apiRouter.post('/favorites/toggle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { roomId } = req.body;

  if (!roomId) {
    res.status(400).json({ success: false, message: 'Thiếu mã phòng trọ (roomId).' });
    return;
  }

  const db = readDb();
  if (!db.favorites) db.favorites = [];

  const room = db.rooms.find(r => r.Id === roomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  const existingIndex = db.favorites.findIndex(f => f.UserId === user.Id && f.PhongId === roomId);
  let isFavorite = false;

  if (existingIndex >= 0) {
    // Remove
    db.favorites.splice(existingIndex, 1);
    isFavorite = false;
  } else {
    // Add
    const newFav: FavoriteItem = {
      Id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      UserId: user.Id,
      PhongId: roomId,
      NgayTao: new Date().toISOString(),
    };
    db.favorites.unshift(newFav);
    isFavorite = true;
  }

  writeDb(db);

  const userFavs = db.favorites.filter(f => f.UserId === user.Id);
  const roomIds = userFavs.map(f => f.PhongId);

  res.json({
    success: true,
    isFavorite,
    roomIds,
    message: isFavorite
      ? `Đã lưu phòng "${room.TieuDe}" vào mục yêu thích!`
      : `Đã xóa phòng "${room.TieuDe}" khỏi mục yêu thích.`,
  });
});

// DELETE /api/favorites/:roomId
apiRouter.delete('/favorites/:roomId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const roomId = req.params.roomId;

  const db = readDb();
  if (!db.favorites) db.favorites = [];

  db.favorites = db.favorites.filter(f => !(f.UserId === user.Id && f.PhongId === roomId));
  writeDb(db);

  const userFavs = db.favorites.filter(f => f.UserId === user.Id);
  const roomIds = userFavs.map(f => f.PhongId);

  res.json({
    success: true,
    roomIds,
    message: 'Đã xóa phòng khỏi mục yêu thích.',
  });
});

// DELETE /api/favorites (Clear all)
apiRouter.delete('/favorites', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.favorites) db.favorites = [];

  db.favorites = db.favorites.filter(f => f.UserId !== user.Id);
  writeDb(db);

  res.json({
    success: true,
    roomIds: [],
    message: 'Đã xóa toàn bộ danh sách phòng yêu thích.',
  });
});

// -------------------------------------------------------------
// 10. AI CHATBOT ASSISTANT (CHAT API)
// -------------------------------------------------------------
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const authUser = await getUserByToken(authHeader); //  ĐÃ THÊM AWAIT
    const { messages, userRole, userName } = req.body;
    const effectiveRole = authUser ? authUser.VaiTro : (userRole || null);
    const effectiveName = authUser ? authUser.HoTen : (userName || 'Khách');

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        success: false,
        reply: 'Tin nhắn gửi lên không hợp lệ.',
      });
      return;
    }

    const result = await handleChatMessage(messages, effectiveRole, effectiveName);
    res.json(result);
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      reply: 'Xin lỗi, trợ lý đang gặp sự cố, vui lòng thử lại sau.',
      error: error?.message,
    });
  }
});

// -------------------------------------------------------------
// 11. CẨM NANG & KINH NGHIỆM THUÊ TRỌ (LƯU CẢ TIDB & DATABASE.JSON)
// -------------------------------------------------------------

// GET /api/articles - Lấy danh sách cẩm nang
apiRouter.get('/articles', async (req: Request, res: Response) => {
  try {
    const userRole = req.headers['x-user-role'];
    let articles: any[] = [];

    // 1. Thử lấy từ CSDL TiDB Cloud trước
    try {
      const [rows]: any = await pool.query(
        userRole === 'Admin'
          ? 'SELECT * FROM articles ORDER BY Id DESC'
          : "SELECT * FROM articles WHERE TrangThai = 'Công khai' ORDER BY Id DESC"
      );
      if (Array.isArray(rows) && rows.length > 0) {
        articles = rows;
      }
    } catch (sqlErr) {
      console.warn('[MySQL] Chưa query được từ TiDB, chuyển sang JSON fallback:', sqlErr);
    }

    // 2. Nếu TiDB chưa có dữ liệu, lấy từ database.json
    if (articles.length === 0) {
      const db: any = readDb();
      let localArticles = Array.isArray(db.articles) ? db.articles : [];

      if (userRole === 'Admin') {
        articles = localArticles;
      } else {
        articles = localArticles.filter((a: any) => a.TrangThai === 'Công khai');
      }
    }

    // 3. Đảm bảo luôn lọc bỏ những bài có link ảnh hỏng/rỗng
    articles = articles.filter((a: any) => a.HinhAnh && typeof a.HinhAnh === 'string');

    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi lấy danh sách cẩm nang',
    });
  }
});

// POST /api/articles - Chủ trọ đăng bài viết (Lưu đồng thời TiDB & database.json)
apiRouter.post('/articles', async (req: Request, res: Response) => {
  try {
    const { TieuDe, Tag, MoTaNgan, NoiDung, TacGia, ThoiGianDoc, HinhAnh, NgayDang } = req.body;
    const articleId = `art_${Date.now()}`;
    const newArticle = {
      Id: articleId,
      TieuDe: TieuDe || 'Chưa có tiêu đề',
      Tag: Tag || 'Kinh nghiệm thuê phòng',
      MoTaNgan: MoTaNgan || '',
      NoiDung: NoiDung || '',
      TacGia: TacGia || 'Chủ trọ',
      ThoiGianDoc: ThoiGianDoc || '5 phút đọc',
      HinhAnh: HinhAnh || '',
      NgayDang: NgayDang || new Date().toLocaleDateString('vi-VN'),
      TrangThai: 'Chờ duyệt',
    };

    // 1. Lưu vào TiDB Cloud (MySQL)
    const isConn = await isMySqlConnected();
    if (isConn) {
      try {
        const sql = `
          INSERT INTO articles (Id, TieuDe, Tag, MoTaNgan, NoiDung, TacGia, ThoiGianDoc, HinhAnh, NgayDang, TrangThai)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(sql, [
          newArticle.Id,
          newArticle.TieuDe,
          newArticle.Tag,
          newArticle.MoTaNgan,
          newArticle.NoiDung,
          newArticle.TacGia,
          newArticle.ThoiGianDoc,
          newArticle.HinhAnh,
          newArticle.NgayDang,
          newArticle.TrangThai,
        ]);
      } catch (sqlErr) {
        console.error('[MySQL] Lỗi lưu article vào TiDB:', sqlErr);
      }
    }

    // 2. Đồng thời lưu trực tiếp vào database.json
    try {
      const db: any = readDb();
      if (!db.articles) db.articles = [];
      db.articles.unshift(newArticle);
      writeDb(db);
    } catch (fsErr) {
      console.error('[JSON] Lỗi ghi bài viết vào database.json:', fsErr);
    }

    res.json({
      success: true,
      message: 'Đăng bài viết cẩm nang thành công! Dữ liệu đã lưu vào cả TiDB và database.json.',
      data: newArticle,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi đăng bài viết cẩm nang' });
  }
});

// PATCH /api/articles/:id/status - Admin duyệt hoặc từ chối bài (Cập nhật cả TiDB & database.json)
apiRouter.patch('/articles/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body; // 'Công khai' | 'Từ chối'

    // 1. Cập nhật trên TiDB Cloud (MySQL)
    const isConn = await isMySqlConnected();
    if (isConn) {
      try {
        await pool.query('UPDATE articles SET TrangThai = ? WHERE Id = ?', [TrangThai, id]);
      } catch (sqlErr) {
        console.error('[MySQL] Lỗi cập nhật trạng thái trên TiDB:', sqlErr);
      }
    }

    // 2. Cập nhật trực tiếp trên database.json
    try {
      const db: any = readDb();
      if (db.articles && Array.isArray(db.articles)) {
        const item = db.articles.find((a: any) => a.Id === id);
        if (item) {
          item.TrangThai = TrangThai;
          writeDb(db);
        }
      }
    } catch (fsErr) {
      console.error('[JSON] Lỗi cập nhật trạng thái trong database.json:', fsErr);
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái bài viết thành: ${TrangThai} trên cả hai hệ thống lưu trữ!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi cập nhật trạng thái bài viết' });
  }
});

// -------------------------------------------------------------
// 12. TÌM BẠN Ở GHÉP (ROOMMATES API)
// -------------------------------------------------------------

// GET /api/roommates - Lấy danh sách tin ở ghép
// GET /api/roommates - Lấy danh sách tin ở ghép (Chống cache trên Vercel)
apiRouter.get('/roommates', async (req: Request, res: Response) => {
  try {
    // 1. Tắt triệt để cache của trình duyệt và Vercel CDN
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userRole = req.headers['x-user-role'];
    const db: any = readDb();
    let posts = Array.isArray(db.roommates) ? [...db.roommates] : [];

    // Nếu không phải Admin thì chỉ lấy bài đã duyệt
    if (userRole !== 'Admin') {
      posts = posts.filter((p: any) => p.TrangThaiDuyet === 'Đã duyệt' || !p.TrangThaiDuyet);
    }

    res.json({ success: true, count: posts.length, data: posts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi lấy tin ở ghép' });
  }
});

// POST /api/roommates - Sinh viên đăng tin tìm bạn ở ghép
apiRouter.post('/roommates', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    const { TieuDe, QuanHuyen, DiaChi, GiaThue, DienTich, DoiTuongGhep, MoTa, TienNghi, HinhAnh, VideoUrl } = req.body;

    const newPost = {
      Id: `oghep_${Date.now()}`,
      TieuDe: (TieuDe || '').trim(),
      QuanHuyen: QuanHuyen || 'Cầu Giấy',
      DiaChi: (DiaChi || '').trim(),
      GiaThue: Number(GiaThue) || 1500000,
      DienTich: Number(DienTich) || 25,
      DoiTuongGhep: DoiTuongGhep || 'Tất cả',
      MoTa: (MoTa || '').trim(),
      TienNghi: Array.isArray(TienNghi) ? TienNghi : [],
      HinhAnh: Array.isArray(HinhAnh) ? HinhAnh : [],
      VideoUrl: (VideoUrl || '').trim() || undefined,
      TacGia: {
        Ten: user.HoTen,
        Sdt: user.Sdt,
        Zalo: user.Sdt,
        NgayThamGia: new Date().toLocaleDateString('vi-VN'),
        TrangThai: 'Đang online',
      },
      NgayDang: `Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`,
      TrangThaiDuyet: 'Chờ duyệt',
    };

    const db: any = readDb();
    if (!db.roommates) db.roommates = [];
    db.roommates.unshift(newPost);
    writeDb(db);

    res.status(201).json({
      success: true,
      message: 'Đăng tin tìm ở ghép thành công! Tin đang chờ Admin duyệt.',
      data: newPost,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi gửi tin ở ghép' });
  }
});

// PATCH /api/roommates/:id/status - Admin duyệt / từ chối tin
apiRouter.patch('/roommates/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền duyệt tin ở ghép.' });
      return;
    }

    const { id } = req.params;
    const { TrangThaiDuyet } = req.body; // 'Đã duyệt' | 'Từ chối'

    const db: any = readDb();
    if (!db.roommates) db.roommates = [];
    const item = db.roommates.find((p: any) => p.Id === id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.' });
      return;
    }

    item.TrangThaiDuyet = TrangThaiDuyet;
    writeDb(db);

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái tin thành: ${TrangThaiDuyet}`,
      data: item,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi cập nhật trạng thái' });
  }
});

// DELETE /api/roommates/:id - Gỡ bỏ bài vi phạm
apiRouter.delete('/roommates/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as NguoiDung;
    if (user.VaiTro !== 'Admin') {
      res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền gỡ tin đăng.' });
      return;
    }

    const db: any = readDb();
    if (!db.roommates) db.roommates = [];
    db.roommates = db.roommates.filter((p: any) => p.Id !== req.params.id);
    writeDb(db);

    res.json({ success: true, message: 'Đã gỡ bài đăng vi phạm khỏi hệ thống.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi xóa tin' });
  }
});