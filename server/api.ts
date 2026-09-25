import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { readDb, writeDb, NguoiDung, PhongTro, YeuCauLienHe, LichHen, DatCoc, ThongBao, FavoriteItem } from './db.js';
import { createSessionToken, getUserByToken, sanitizeUser } from './auth.js';
import { handleChatMessage } from './chatService.js';

export const apiRouter = Router();

// Helper to push in-app notification
function addNotification(
  db: any,
  userId: string,
  title: string,
  content: string,
  type: 'LichHen' | 'DatCoc' | 'PhongTro' | 'HeThong' = 'HeThong'
) {
  if (!db.notifications) db.notifications = [];
  const notif: ThongBao = {
    Id: 'tb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    UserId: userId,
    TieuDe: title,
    NoiDung: content,
    Loai: type,
    TrangThai: 'ChuaDoc',
    NgayTao: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
  return notif;
}

// Middleware to extract authenticated user
export function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const user = getUserByToken(authHeader);
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
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { HoTen, Email, MatKhau, Sdt, VaiTro } = req.body;

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

    const db = readDb();

    // Check duplicate email
    const existing = db.users.find(u => u.Email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(400).json({ success: false, message: 'Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.' });
      return;
    }

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
      soDuVi: 2000000, // Mặc định 2.000.000 VNĐ cho demo
      NgayTao: new Date().toISOString(),
      TrangThai: 'HoatDong',
    };

    db.users.push(newUser);
    writeDb(db);

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
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { Email, MatKhau } = req.body;

    if (!Email || !MatKhau) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
      return;
    }

    const cleanEmail = Email.trim().toLowerCase();
    const db = readDb();

    const user = db.users.find(u => u.Email.toLowerCase() === cleanEmail);
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

    // Compare password
    const isMatch = bcrypt.compareSync(MatKhau, user.MatKhau);
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

// GET /api/auth/me
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = getUserByToken(authHeader);

  if (!user) {
    res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc phiên hết hạn.' });
    return;
  }

  res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// PUT /api/auth/profile
apiRouter.put('/auth/profile', requireAuth, (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as NguoiDung;
    const { HoTen, Sdt, MatKhauCu, MatKhauMoi } = req.body;

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.Id === currentUser.Id);
    if (userIndex === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    const targetUser = db.users[userIndex];

    if (HoTen && typeof HoTen === 'string' && HoTen.trim().length >= 2) {
      targetUser.HoTen = HoTen.trim();
    }

    if (Sdt && typeof Sdt === 'string') {
      const cleanPhone = Sdt.replace(/\D/g, '');
      if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
        targetUser.Sdt = cleanPhone;
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
      targetUser.MatKhau = bcrypt.hashSync(MatKhauMoi, bcrypt.genSaltSync(10));
    }

    db.users[userIndex] = targetUser;
    writeDb(db);

    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: sanitizeUser(targetUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi cập nhật hồ sơ' });
  }
});

// POST /api/auth/wallet/topup (Demo nạp tiền ví)
apiRouter.post('/auth/wallet/topup', requireAuth, (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as NguoiDung;
    const { amount } = req.body;
    const topupAmount = Number(amount) || 500000;

    const db = readDb();
    const user = db.users.find(u => u.Id === currentUser.Id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
      return;
    }

    user.soDuVi += topupAmount;
    writeDb(db);

    res.json({
      success: true,
      message: `Nạp thành công +${topupAmount.toLocaleString('vi-VN')} VNĐ vào ví!`,
      soDuVi: user.soDuVi,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi nạp tiền' });
  }
});

// -------------------------------------------------------------
// 2. PHÒNG TRỌ (ROOMS API)
// -------------------------------------------------------------

// GET /api/rooms
apiRouter.get('/rooms', (req: Request, res: Response) => {
  const { search, district, minPrice, maxPrice, minArea, maxArea, amenities, type, landlordId, status } = req.query;
  const db = readDb();

  let results = [...db.rooms];

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

  // Filter by landlord ID (for Landlord management page)
  if (landlordId && typeof landlordId === 'string') {
    results = results.filter(r => r.IdChuTro === landlordId || r.ChuTroId === landlordId);
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

  // Filter by status if specified, otherwise hide "Chờ duyệt" and "Từ chối" from public searches
  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter(r => r.TrangThai === status);
  } else if (!landlordId) {
    // When queried without landlordId or explicit status filter, show only approved rooms
    results = results.filter(r => r.TrangThai !== 'Chờ duyệt' && r.TrangThai !== 'Từ chối');
  }

  // Filter by room type
  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter(r => r.LoaiPhong === type);
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/rooms/:id
apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  const roomId = req.params.id;
  const db = readDb();
  const room = db.rooms.find(r => r.Id === roomId);

  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phòng trọ.' });
    return;
  }

  res.json({ success: true, room });
});

// POST /api/rooms (ChuTro or Admin)
// Theo yêu cầu: Sau khi đăng thì trạng thái mặc định là "Chờ duyệt"
apiRouter.post('/rooms', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  if (user.VaiTro !== 'ChuTro' && user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Chỉ Chủ trọ mới có quyền đăng tin phòng trọ.' });
    return;
  }

  const {
    TieuDe,
    DiaChi,
    QuanHuyen,
    GiaThue,
    GiaDien,
    GiaNuoc,
    TienIch,
    HinhAnh,
    MoTa,
    NoiQuy,
    DienTich,
    LoaiPhong,
  } = req.body;

  if (!TieuDe || !GiaThue || !DiaChi) {
    res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: Tiêu đề, Giá thuê và Địa chỉ phòng trọ.'
    });
    return;
  }

  const db = readDb();

  // Ensure images array has at least placeholder if empty
  let images: string[] = [];
  if (Array.isArray(HinhAnh) && HinhAnh.length > 0) {
    images = HinhAnh;
  } else {
    images = [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    ];
  }

  const newRoom: PhongTro = {
    Id: 'room_' + Date.now(),
    TieuDe: TieuDe.trim(),
    DiaChi: DiaChi.trim(),
    QuanHuyen: QuanHuyen || 'Cầu Giấy, Hà Nội',
    GiaThue: Number(GiaThue) || 2000000,
    GiaDien: GiaDien ? String(GiaDien).trim() : '3.800 đ/kWh',
    GiaNuoc: GiaNuoc ? String(GiaNuoc).trim() : '30.000 đ/khối',
    TienIch: Array.isArray(TienIch) ? TienIch : ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do'],
    // Theo yêu cầu: sau khi đăng thì trạng thái mặc định là "Chờ duyệt"
    TrangThai: 'Chờ duyệt',
    IdChuTro: user.Id,
    ChuTroId: user.Id,
    ChuTroTen: user.HoTen,
    ChuTroSdt: user.Sdt,
    HinhAnh: images,
    MoTa: (MoTa || '').trim() || 'Phòng trọ sinh viên tiện nghi, an ninh tốt, gần các trường đại học.',
    NoiQuy: (NoiQuy || '').trim() || '1. Giữ gìn trật tự và vệ sinh chung sau 23:00.\n2. Khóa cửa cẩn thận khi ra vào.\n3. Tiết kiệm điện nước.',
    DienTich: Number(DienTich) || 20,
    LoaiPhong: LoaiPhong || 'GacLung',
    NgayDang: new Date().toISOString(),
    DanhGia: [],
  };

  db.rooms.unshift(newRoom);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Đăng phòng trọ thành công! Tin của bạn đang ở trạng thái Chờ duyệt.',
    room: newRoom
  });
});

// PUT /api/rooms/:id
apiRouter.put('/rooms/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const roomId = req.params.id;
  const db = readDb();

  const roomIndex = db.rooms.findIndex(r => r.Id === roomId);
  if (roomIndex === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  const existingRoom = db.rooms[roomIndex];
  if (user.VaiTro !== 'Admin' && existingRoom.IdChuTro !== user.Id && existingRoom.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa thông tin phòng trọ này.' });
    return;
  }

  // Preserve essential identity properties while updating editable ones
  const updated: PhongTro = {
    ...existingRoom,
    ...req.body,
    Id: existingRoom.Id,
    IdChuTro: existingRoom.IdChuTro || existingRoom.ChuTroId || user.Id,
    ChuTroId: existingRoom.IdChuTro || existingRoom.ChuTroId || user.Id,
  };

  db.rooms[roomIndex] = updated;
  writeDb(db);

  res.json({ success: true, message: 'Cập nhật phòng trọ thành công!', room: updated });
});

// DELETE /api/rooms/:id
apiRouter.delete('/rooms/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const roomId = req.params.id;
  const db = readDb();

  const room = db.rooms.find(r => r.Id === roomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  if (user.VaiTro !== 'Admin' && room.IdChuTro !== user.Id && room.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền xóa phòng trọ này.' });
    return;
  }

  db.rooms = db.rooms.filter(r => r.Id !== roomId);
  writeDb(db);

  res.json({ success: true, message: 'Đã xóa phòng trọ thành công.' });
});

// -------------------------------------------------------------
// 3. YÊU CẦU ĐẶT / LIÊN HỆ PHÒNG (INQUIRIES)
// -------------------------------------------------------------

apiRouter.post('/inquiries', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { roomId, message, depositAmount } = req.body;

  const db = readDb();
  const room = db.rooms.find(r => r.Id === roomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Phòng không tồn tại.' });
    return;
  }

  const deposit = Number(depositAmount) || 0;
  if (deposit > 0) {
    if (user.soDuVi < deposit) {
      res.status(400).json({
        success: false,
        message: `Số dư ví không đủ để đặt cọc ${deposit.toLocaleString('vi-VN')} VNĐ. Số dư hiện tại: ${user.soDuVi.toLocaleString('vi-VN')} VNĐ.`
      });
      return;
    }
    // Deduct deposit from student
    user.soDuVi -= deposit;
    const dbUser = db.users.find(u => u.Id === user.Id);
    if (dbUser) dbUser.soDuVi = user.soDuVi;
  }

  const newInq: YeuCauLienHe = {
    Id: 'inq_' + Date.now(),
    PhongId: room.Id,
    TieuDePhong: room.TieuDe,
    SinhVienId: user.Id,
    SinhVienTen: user.HoTen,
    SinhVienSdt: user.Sdt,
    ChuTroId: room.IdChuTro || room.ChuTroId || '',
    TienCoc: deposit,
    GhiChu: message || 'Liên hệ hẹn xem phòng',
    TrangThai: 'ChoXacNhan',
    NgayTao: new Date().toISOString(),
  };

  db.inquiries.unshift(newInq);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: deposit > 0
      ? `Đã gửi yêu cầu giữ chỗ và trừ tạm ${deposit.toLocaleString('vi-VN')} VNĐ từ ví của bạn!`
      : 'Đã gửi lời nhắn hẹn xem phòng đến chủ trọ thành công!',
    inquiry: newInq,
    newBalance: user.soDuVi,
  });
});

apiRouter.get('/inquiries', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();

  let list: YeuCauLienHe[] = [];
  if (user.VaiTro === 'ChuTro') {
    list = db.inquiries.filter(i => i.ChuTroId === user.Id);
  } else if (user.VaiTro === 'SinhVien') {
    list = db.inquiries.filter(i => i.SinhVienId === user.Id);
  } else if (user.VaiTro === 'Admin') {
    list = db.inquiries;
  }

  res.json({ success: true, data: list });
});

apiRouter.put('/inquiries/:id/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status } = req.body;
  const db = readDb();

  const inq = db.inquiries.find(i => i.Id === req.params.id);
  if (!inq) {
    res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại.' });
    return;
  }

  if (user.VaiTro !== 'Admin' && inq.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Không có quyền xử lý.' });
    return;
  }

  inq.TrangThai = status;

  // If approved and has deposit, landlord receives deposit
  if (status === 'DaDuyet' && inq.TienCoc > 0) {
    const chuTro = db.users.find(u => u.Id === inq.ChuTroId);
    if (chuTro) chuTro.soDuVi += inq.TienCoc;
  }

  // If rejected and has deposit, refund to student
  if (status === 'TuChoi' && inq.TienCoc > 0) {
    const sinhVien = db.users.find(u => u.Id === inq.SinhVienId);
    if (sinhVien) sinhVien.soDuVi += inq.TienCoc;
  }

  writeDb(db);
  res.json({ success: true, message: `Đã cập nhật trạng thái: ${status}`, inquiry: inq });
});

// -------------------------------------------------------------
// 3.1. ĐẶT LỊCH HẸN XEM PHÒNG (LICH HEN)
// -------------------------------------------------------------

// GET /api/appointments - Danh sách lịch hẹn
apiRouter.get('/appointments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  const list = db.appointments || [];

  let result: LichHen[] = [];
  if (user.VaiTro === 'SinhVien') {
    result = list.filter(a => a.IdSinhVien === user.Id);
  } else if (user.VaiTro === 'ChuTro') {
    result = list.filter(a => a.ChuTroId === user.Id);
  } else {
    result = list;
  }

  res.json({ success: true, data: result });
});

// POST /api/appointments - Sinh viên đặt lịch hẹn xem phòng
apiRouter.post('/appointments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { IdPhong, ThoiGianHen, GhiChu } = req.body;

  if (!IdPhong || !ThoiGianHen) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã phòng và thời gian hẹn.' });
    return;
  }

  const db = readDb();
  const room = db.rooms.find(r => r.Id === IdPhong);
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

  const newAppointment: LichHen = {
    Id: 'hen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    IdSinhVien: user.Id,
    IdPhong: room.Id,
    ThoiGianHen: henDate.toISOString(),
    GhiChu: (GhiChu || '').trim(),
    TrangThai: 'Chờ xác nhận',
    TieuDePhong: room.TieuDe,
    DiaChiPhong: room.DiaChi + (room.QuanHuyen ? ', ' + room.QuanHuyen : ''),
    SinhVienTen: user.HoTen,
    SinhVienSdt: user.Sdt,
    ChuTroId: room.IdChuTro || room.ChuTroId || '',
    ChuTroTen: room.ChuTroTen || 'Chủ trọ',
    ChuTroSdt: room.ChuTroSdt || '',
    NgayTao: new Date().toISOString(),
  };

  if (!db.appointments) db.appointments = [];
  db.appointments.unshift(newAppointment);

  // Gửi thông báo đến chủ trọ về yêu cầu đặt lịch hẹn mới
  const landlordId = room.IdChuTro || room.ChuTroId;
  if (landlordId) {
    addNotification(
      db,
      landlordId,
      'Yêu cầu đặt lịch hẹn xem phòng mới!',
      `Sinh viên ${user.HoTen} vừa gửi yêu cầu đặt lịch hẹn xem phòng "${room.TieuDe}" vào lúc ${henDate.toLocaleString('vi-VN')}. Vui lòng kiểm tra và phản hồi.`,
      'LichHen'
    );
  }

  // Gửi thông báo xác nhận đã tạo lịch hẹn đến sinh viên
  addNotification(
    db,
    user.Id,
    'Đã gửi yêu cầu đặt lịch hẹn xem phòng',
    `Yêu cầu đặt lịch xem phòng "${room.TieuDe}" vào lúc ${henDate.toLocaleString('vi-VN')} đã được gửi thành công đến chủ trọ ${room.ChuTroTen}. Vui lòng chờ xác nhận.`,
    'LichHen'
  );

  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Đặt lịch hẹn xem phòng thành công! Trạng thái: Chờ chủ trọ xác nhận',
    appointment: newAppointment,
  });
});

// PUT /api/appointments/:id/cancel - Sinh viên hủy lịch hẹn (nếu chưa được xác nhận)
apiRouter.put('/appointments/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.appointments) db.appointments = [];

  const appointment = db.appointments.find(a => a.Id === req.params.id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại.' });
    return;
  }

  if (appointment.IdSinhVien !== user.Id && user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Bạn không có quyền hủy lịch hẹn này.' });
    return;
  }

  if (appointment.TrangThai !== 'Chờ xác nhận') {
    res.status(400).json({ success: false, message: 'Chỉ có thể hủy lịch hẹn khi đang ở trạng thái Chờ xác nhận.' });
    return;
  }

  appointment.TrangThai = 'Đã hủy';

  // Thông báo cho chủ trọ biết sinh viên đã hủy lịch hẹn
  if (appointment.ChuTroId) {
    addNotification(
      db,
      appointment.ChuTroId,
      'Sinh viên đã hủy lịch hẹn xem phòng',
      `Sinh viên ${user.HoTen} đã hủy lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}" lúc ${new Date(appointment.ThoiGianHen).toLocaleString('vi-VN')}.`,
      'LichHen'
    );
  }

  writeDb(db);

  res.json({ success: true, message: 'Đã hủy lịch hẹn xem phòng.', appointment });
});

// PUT /api/appointments/:id/status - Chủ trọ hoặc Admin duyệt/hủy lịch hẹn
apiRouter.put('/appointments/:id/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status, reason } = req.body;
  const db = readDb();
  if (!db.appointments) db.appointments = [];

  const appointment = db.appointments.find(a => a.Id === req.params.id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại.' });
    return;
  }

  if (user.VaiTro !== 'Admin' && appointment.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Không có quyền thao tác lịch hẹn này.' });
    return;
  }

  if (status !== 'Đã xác nhận' && status !== 'Đã hủy') {
    res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    return;
  }

  appointment.TrangThai = status;

  if (status === 'Đã xác nhận') {
    addNotification(
      db,
      appointment.IdSinhVien,
      'Lịch hẹn xem phòng đã được xác nhận!',
      `Chủ trọ ${user.HoTen} đã xác nhận lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}" vào lúc ${new Date(appointment.ThoiGianHen).toLocaleString('vi-VN')}. Vui lòng đến đúng giờ nhé!`,
      'LichHen'
    );
  } else if (status === 'Đã hủy') {
    appointment.LyDoTuChoi = (reason || '').trim() || 'Chủ trọ có lịch bận đột xuất hoặc phòng đã kín lịch';
    addNotification(
      db,
      appointment.IdSinhVien,
      'Lịch hẹn xem phòng bị từ chối',
      `Chủ trọ ${user.HoTen} đã từ chối lịch hẹn xem phòng "${appointment.TieuDePhong || 'Phòng trọ'}". Lý do: ${appointment.LyDoTuChoi}`,
      'LichHen'
    );
  }

  writeDb(db);
  res.json({ success: true, message: `Lịch hẹn đã chuyển sang trạng thái: ${status}`, appointment });
});

// -------------------------------------------------------------
// 3.2. ĐẶT CỌC GIỮ PHÒNG (DAT COC)
// -------------------------------------------------------------

// GET /api/deposits - Danh sách đơn đặt cọc
apiRouter.get('/deposits', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  const list = db.deposits || [];

  let result: DatCoc[] = [];
  if (user.VaiTro === 'SinhVien') {
    result = list.filter(d => d.IdSinhVien === user.Id);
  } else if (user.VaiTro === 'ChuTro') {
    result = list.filter(d => d.ChuTroId === user.Id);
  } else {
    result = list;
  }

  res.json({ success: true, data: result });
});

// POST /api/deposits - Sinh viên đặt cọc giữ phòng
apiRouter.post('/deposits', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { IdPhong, ThoiHanGiuCho } = req.body;

  if (!IdPhong) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn phòng trọ cần đặt cọc.' });
    return;
  }

  const db = readDb();
  const room = db.rooms.find(r => r.Id === IdPhong);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  if (room.TrangThai === 'Hết phòng' || room.TrangThai === 'Đã cọc') {
    res.status(400).json({ success: false, message: 'Phòng này hiện đã được thuê hết hoặc đã có người đặt cọc.' });
    return;
  }

  const TIEN_COC_QUY_DINH = 500000;

  // Lấy dữ liệu người dùng mới nhất từ DB
  const dbUser = db.users.find(u => u.Id === user.Id);
  if (!dbUser || dbUser.soDuVi < TIEN_COC_QUY_DINH) {
    res.status(400).json({
      success: false,
      message: 'Số dư không đủ',
      soDuHienTai: dbUser ? dbUser.soDuVi : 0,
      soTienCan: TIEN_COC_QUY_DINH,
    });
    return;
  }

  // Đủ tiền: Trừ tiền ví của sinh viên
  dbUser.soDuVi -= TIEN_COC_QUY_DINH;
  user.soDuVi = dbUser.soDuVi;

  // Chuyển trạng thái phòng sang "Chờ chủ trọ xác nhận cọc"
  room.TrangThai = 'Chờ chủ trọ xác nhận cọc';

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

  if (!db.deposits) db.deposits = [];
  db.deposits.unshift(newDeposit);

  // Gửi thông báo đến chủ trọ
  if (room.IdChuTro || room.ChuTroId) {
    addNotification(
      db,
      room.IdChuTro || room.ChuTroId || '',
      'Có đơn đặt cọc mới!',
      `Sinh viên ${user.HoTen} vừa đặt cọc 500.000 VNĐ giữ chỗ cho phòng "${room.TieuDe}". Vui lòng xử lý đơn trong mục Quản lý yêu cầu.`,
      'DatCoc'
    );
  }

  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Đặt cọc giữ phòng thành công! Số dư đã trừ 500.000 VNĐ. Phòng đã chuyển sang trạng thái "Chờ chủ trọ xác nhận cọc".',
    deposit: newDeposit,
    newBalance: dbUser.soDuVi,
  });
});

// PUT /api/deposits/:id/cancel - Sinh viên hủy đơn cọc trước khi duyệt -> Hoàn tiền
apiRouter.put('/deposits/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.deposits) db.deposits = [];

  const deposit = db.deposits.find(d => d.Id === req.params.id);
  if (!deposit) {
    res.status(404).json({ success: false, message: 'Đơn đặt cọc không tồn tại.' });
    return;
  }

  if (deposit.IdSinhVien !== user.Id && user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác đơn này.' });
    return;
  }

  if (deposit.TrangThaiCoc !== 'Chờ xác nhận') {
    res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn cọc khi đang ở trạng thái Chờ xác nhận.' });
    return;
  }

  deposit.TrangThaiCoc = 'Đã hủy';
  deposit.LyDoTuChoi = 'Sinh viên chủ động hủy trước khi chủ trọ tiếp nhận';

  // Hoàn tiền cho sinh viên
  const sinhVien = db.users.find(u => u.Id === deposit.IdSinhVien);
  if (sinhVien) {
    sinhVien.soDuVi += deposit.SoTienCoc;
  }

  // Khôi phục trạng thái phòng về "Công khai" nếu phòng đang "Chờ chủ trọ xác nhận cọc"
  const room = db.rooms.find(r => r.Id === deposit.IdPhong);
  if (room && (room.TrangThai === 'Chờ chủ trọ xác nhận cọc' || room.TrangThai === 'Đã cọc')) {
    room.TrangThai = 'Công khai';
  }

  // Thông báo đến chủ trọ về việc sinh viên đã hủy đơn đặt cọc
  if (deposit.ChuTroId) {
    addNotification(
      db,
      deposit.ChuTroId,
      'Sinh viên đã hủy đơn đặt cọc',
      `Sinh viên ${user.HoTen} đã hủy đơn cọc giữ chỗ phòng "${deposit.TieuDePhong || 'Phòng trọ'}". Phòng đã được mở lại trạng thái "Công khai".`,
      'DatCoc'
    );
  }

  writeDb(db);

  res.json({
    success: true,
    message: 'Đã hủy đơn đặt cọc và hoàn trả 500.000 VNĐ vào ví của bạn thành công!',
    deposit,
    newBalance: sinhVien ? sinhVien.soDuVi : undefined,
  });
});

// PUT /api/deposits/:id/status - Chủ trọ hoặc Admin duyệt hoặc từ chối cọc
apiRouter.put('/deposits/:id/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { status, reason } = req.body; // 'Đã tiếp nhận thành công' | 'Đã xác nhận' | 'Đã hủy'
  const db = readDb();
  if (!db.deposits) db.deposits = [];

  const deposit = db.deposits.find(d => d.Id === req.params.id);
  if (!deposit) {
    res.status(404).json({ success: false, message: 'Đơn đặt cọc không tồn tại.' });
    return;
  }

  if (user.VaiTro !== 'Admin' && deposit.ChuTroId !== user.Id) {
    res.status(403).json({ success: false, message: 'Không có quyền thao tác đơn cọc này.' });
    return;
  }

  const room = db.rooms.find(r => r.Id === deposit.IdPhong);

  if (status === 'Đã tiếp nhận thành công' || status === 'Đã xác nhận') {
    deposit.TrangThaiCoc = 'Đã tiếp nhận thành công';
    // Chủ trọ nhận tiền cọc vào ví
    const chuTro = db.users.find(u => u.Id === deposit.ChuTroId);
    if (chuTro) {
      chuTro.soDuVi += deposit.SoTienCoc;
    }
    // Cập nhật phòng sang "Đã cọc"
    if (room) {
      room.TrangThai = 'Đã cọc';
    }

    // Gửi thông báo đến sinh viên
    addNotification(
      db,
      deposit.IdSinhVien,
      'Đơn đặt cọc đã được tiếp nhận thành công!',
      `Chủ trọ ${user.HoTen} đã tiếp nhận thành công đơn đặt cọc ${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ cho phòng "${deposit.TieuDePhong || 'Phòng trọ'}". Phòng đã được chuyển sang trạng thái "Đã cọc" và bảo lưu chỗ cho bạn.`,
      'DatCoc'
    );

    writeDb(db);
    res.json({
      success: true,
      message: 'Đã tiếp nhận đơn đặt cọc thành công! Phòng đã chuyển sang trạng thái "Đã cọc".',
      deposit,
    });
  } else if (status === 'Đã hủy') {
    const rejectReason = (reason || '').trim() || 'Chủ trọ không thể tiếp nhận cọc vào lúc này';
    deposit.TrangThaiCoc = 'Đã hủy';
    deposit.LyDoTuChoi = rejectReason;

    // Tự động hoàn lại 100% tiền cọc vào ví sinh viên
    const sinhVien = db.users.find(u => u.Id === deposit.IdSinhVien);
    if (sinhVien) {
      sinhVien.soDuVi += deposit.SoTienCoc;
    }

    // Khôi phục phòng về Công khai / Còn phòng
    if (room && (room.TrangThai === 'Chờ chủ trọ xác nhận cọc' || room.TrangThai === 'Đã cọc')) {
      room.TrangThai = 'Công khai';
    }

    // Gửi thông báo hoàn tiền đến sinh viên
    addNotification(
      db,
      deposit.IdSinhVien,
      'Đơn đặt cọc phòng bị từ chối - Đã hoàn tiền ví',
      `Đơn cọc phòng "${deposit.TieuDePhong || 'Phòng trọ'}" đã bị từ chối. Lý do: "${rejectReason}". Toàn bộ ${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ tiền cọc đã được hoàn trả 100% vào ví của bạn.`,
      'DatCoc'
    );

    writeDb(db);
    res.json({
      success: true,
      message: `Đã từ chối đơn cọc và tự động hoàn trả 100% (${deposit.SoTienCoc.toLocaleString('vi-VN')} VNĐ) cho sinh viên.`,
      deposit,
    });
  } else {
    res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
  }
});

// POST /api/wallet/topup - Nạp tiền ví demo cho sinh viên để trải nghiệm test
apiRouter.post('/wallet/topup', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const amount = Number(req.body.amount) || 1000000;

  if (amount <= 0 || amount > 50000000) {
    res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ (từ 50.000 đến 50.000.000 VNĐ).' });
    return;
  }

  const db = readDb();
  const dbUser = db.users.find(u => u.Id === user.Id);
  if (!dbUser) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return;
  }

  dbUser.soDuVi = (dbUser.soDuVi || 0) + amount;
  user.soDuVi = dbUser.soDuVi;
  writeDb(db);

  res.json({
    success: true,
    message: `Đã nạp ${amount.toLocaleString('vi-VN')} VNĐ vào ví demo thành công!`,
    newBalance: dbUser.soDuVi,
  });
});

// -------------------------------------------------------------
// 4. ĐÁNH GIÁ PHÒNG TRỌ (REVIEWS API)
// -------------------------------------------------------------

apiRouter.post('/rooms/:id/reviews', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const roomId = req.params.id;
  const { soSao, nhanXet } = req.body;

  const star = Math.min(5, Math.max(1, Math.round(Number(soSao) || 5)));
  const comment = (nhanXet || '').trim();

  if (!comment) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung đánh giá/nhận xét.' });
    return;
  }

  const db = readDb();
  const room = db.rooms.find(r => r.Id === roomId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    return;
  }

  if (!room.DanhGia) room.DanhGia = [];

  const newReview = {
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    tenNguoiDanhGia: user.HoTen,
    truongHoc: user.VaiTro === 'SinhVien' ? 'Sinh viên đã trải nghiệm' : 'Người thuê',
    soSao: star,
    nhanXet: comment,
    ngay: new Date().toLocaleDateString('vi-VN'),
  };

  room.DanhGia.unshift(newReview);

  // Gửi thông báo đến chủ trọ
  if (room.IdChuTro || room.ChuTroId) {
    addNotification(
      db,
      room.IdChuTro || room.ChuTroId || '',
      'Phòng trọ nhận được đánh giá mới!',
      `Sinh viên ${user.HoTen} đã gửi đánh giá ${star} sao cho phòng "${room.TieuDe}": "${comment}"`,
      'PhongTro'
    );
  }

  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Gửi đánh giá phòng trọ thành công! Cảm ơn nhận xét của bạn.',
    review: newReview,
    allReviews: room.DanhGia,
  });
});

// -------------------------------------------------------------
// 5. THÔNG BÁO (NOTIFICATIONS API)
// -------------------------------------------------------------

apiRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const userNotifications = db.notifications.filter(n => n.UserId === user.Id);
  // Sắp xếp mới nhất lên đầu
  userNotifications.sort((a, b) => new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime());

  const unreadCount = userNotifications.filter(n => n.TrangThai === 'ChuaDoc').length;
  const categoryCounts = {
    total: userNotifications.length,
    unread: unreadCount,
    lichHen: userNotifications.filter(n => n.Loai === 'LichHen').length,
    datCoc: userNotifications.filter(n => n.Loai === 'DatCoc').length,
    phongTro: userNotifications.filter(n => n.Loai === 'PhongTro').length,
    heThong: userNotifications.filter(n => n.Loai === 'HeThong').length,
  };

  res.json({
    success: true,
    data: userNotifications,
    unreadCount,
    categoryCounts,
  });
});

apiRouter.put('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const notif = db.notifications.find(n => n.Id === req.params.id && n.UserId === user.Id);
  if (notif) {
    notif.TrangThai = 'DaDoc';
    writeDb(db);
  }

  res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
});

apiRouter.put('/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  db.notifications.forEach(n => {
    if (n.UserId === user.Id) {
      n.TrangThai = 'DaDoc';
    }
  });

  writeDb(db);
  res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
});

// DELETE /api/notifications/:id - Xóa 1 thông báo
apiRouter.delete('/notifications/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const index = db.notifications.findIndex(n => n.Id === req.params.id && n.UserId === user.Id);
  if (index !== -1) {
    db.notifications.splice(index, 1);
    writeDb(db);
  }

  res.json({ success: true, message: 'Đã xóa thông báo' });
});

// DELETE /api/notifications/clear-read - Xóa tất cả thông báo đã đọc
apiRouter.delete('/notifications/clear-read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  db.notifications = db.notifications.filter(n => !(n.UserId === user.Id && n.TrangThai === 'DaDoc'));
  writeDb(db);

  res.json({ success: true, message: 'Đã dọn dẹp các thông báo đã đọc' });
});

// POST /api/notifications/test-generate - Sinh thông báo thử nghiệm thời gian thực
apiRouter.post('/notifications/test-generate', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  const { scenario } = req.body;
  const db = readDb();

  let newNotif: ThongBao;

  if (user.VaiTro === 'SinhVien') {
    if (scenario === 'booking-confirm') {
      newNotif = addNotification(
        db,
        user.Id,
        'Lịch hẹn xem phòng đã được xác nhận!',
        `Chủ trọ Nguyễn Văn Hưng đã xác nhận lịch hẹn xem phòng "Phòng trọ Studio Tạ Quang Bửu" vào lúc ${new Date(Date.now() + 86400000).toLocaleString('vi-VN')}. Vui lòng đến đúng giờ nhé!`,
        'LichHen'
      );
    } else if (scenario === 'deposit-success') {
      newNotif = addNotification(
        db,
        user.Id,
        'Đơn đặt cọc đã được tiếp nhận thành công!',
        `Chủ trọ Hoàng Thị Mai đã tiếp nhận khoản tiền cọc 500.000 VNĐ cho phòng "Gác lửng Cầu Giấy". Chỗ ở đã được bảo lưu thành công cho bạn!`,
        'DatCoc'
      );
    } else if (scenario === 'deposit-refund') {
      newNotif = addNotification(
        db,
        user.Id,
        'Hoàn trả tiền cọc về ví thành công',
        `Đơn đặt cọc giữ phòng đã được xử lý hoàn tiền. Số tiền 500.000 VNĐ đã được cộng lại vào ví cá nhân của bạn.`,
        'DatCoc'
      );
    } else {
      newNotif = addNotification(
        db,
        user.Id,
        'Cập nhật trạng thái đặt phòng',
        `Phòng trọ bạn đang quan tâm tại khu vực Hai Bà Trưng vừa cập nhật giảm giá thuê và có ưu đãi sinh viên mới.`,
        'PhongTro'
      );
    }
  } else if (user.VaiTro === 'ChuTro') {
    if (scenario === 'booking-request') {
      newNotif = addNotification(
        db,
        user.Id,
        'Yêu cầu đặt chỗ / Lịch hẹn xem phòng mới!',
        `Sinh viên Trần Minh Quang (SĐT: 0981.234.567) vừa gửi yêu cầu đặt lịch xem phòng trọ của bạn vào 10:00 ngày mai. Vui lòng kiểm tra và xác nhận.`,
        'LichHen'
      );
    } else if (scenario === 'deposit-request') {
      newNotif = addNotification(
        db,
        user.Id,
        'Có đơn đặt cọc giữ phòng mới (500.000 đ)!',
        `Sinh viên Lê Phương Anh vừa thanh toán cọc giữ phòng 500.000 VNĐ qua ví HostelHub. Vui lòng tiếp nhận hoặc phản hồi trong 24 giờ.`,
        'DatCoc'
      );
    } else {
      newNotif = addNotification(
        db,
        user.Id,
        'Tin đăng phòng trọ đã được phê duyệt!',
        `Bài đăng phòng trọ mới của bạn đã được kiểm duyệt hợp lệ và công khai tới hơn 15.000 sinh viên trên hệ thống.`,
        'PhongTro'
      );
    }
  } else {
    newNotif = addNotification(
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

// PUT /api/admin/rooms/:id/moderate - Phê duyệt hoặc Từ chối phòng trọ
apiRouter.put('/admin/rooms/:id/moderate', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  if (user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền kiểm duyệt phòng trọ.' });
    return;
  }

  const { action, reason } = req.body; // 'approve' | 'reject'
  const db = readDb();
  const room = db.rooms.find(r => r.Id === req.params.id);
  if (!room) {
    res.status(404).json({ success: false, message: 'Phòng trọ không tồn tại.' });
    return;
  }

  if (action === 'approve') {
    room.TrangThai = 'Công khai';
    room.LyDoTuChoi = undefined;

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
});

apiRouter.get('/admin/users', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  if (user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền truy cập.' });
    return;
  }

  const db = readDb();
  const sanitized = db.users.map(sanitizeUser);
  res.json({ success: true, data: sanitized });
});

apiRouter.put('/admin/users/:id/status', requireAuth, (req: Request, res: Response) => {
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

  const db = readDb();
  const target = db.users.find(u => u.Id === targetId);
  if (!target) {
    res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    return;
  }

  target.TrangThai = target.TrangThai === 'HoatDong' ? 'BiKhoa' : 'HoatDong';
  writeDb(db);

  res.json({
    success: true,
    message: `Đã ${target.TrangThai === 'HoatDong' ? 'mở khóa' : 'khóa'} tài khoản ${target.HoTen}!`,
    user: sanitizeUser(target),
  });
});

apiRouter.get('/admin/stats', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as NguoiDung;
  if (user.VaiTro !== 'Admin') {
    res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới có quyền xem thống kê.' });
    return;
  }

  const db = readDb();
  const totalUsers = db.users.length;
  const sinhVienCount = db.users.filter(u => u.VaiTro === 'SinhVien').length;
  const chuTroCount = db.users.filter(u => u.VaiTro === 'ChuTro').length;
  const totalRooms = db.rooms.length;
  const availableRooms = db.rooms.filter(r => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai').length;
  const totalInquiries = db.inquiries.length;
  const totalWallet = db.users.reduce((sum, u) => sum + (u.soDuVi || 0), 0);

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
    const authUser = getUserByToken(authHeader);

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


