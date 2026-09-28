import mysql from 'mysql2/promise';

/**
 * Cấu hình kết nối MySQL cục bộ (Local MySQL Connection)
 * Host: localhost
 * User: root
 * Password: ''
 * Database: hostelhub
 * Port: 3306
 */
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'hostelhub',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Khởi tạo Connection Pool mysql2/promise
export const pool = mysql.createPool(dbConfig);

// Helper thực thi câu truy vấn SQL an toàn
export async function query(sql, params = []) {
  const [results] = await pool.query(sql, params);
  return results;
}

// Helper thực thi câu lệnh Prepared Statement
export async function execute(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// -------------------------------------------------------------
// 1. QUẢN LÝ PHÒNG TRỌ (ROOMS)
// -------------------------------------------------------------

/**
 * Thêm phòng trọ mới vào bảng `rooms`
 * Đảm bảo 100% khớp các cột trong database.sql
 */
export async function createRoom(roomData) {
  const {
    Id,
    id,
    TieuDe,
    tieu_de,
    DiaChi,
    dia_chi,
    QuanHuyen,
    quan_huyen,
    GiaThue,
    gia_thue,
    GiaDien,
    gia_dien,
    GiaNuoc,
    gia_nuoc,
    TienIch,
    tien_ich,
    TrangThai,
    trang_thai,
    LyDoTuChoi,
    ly_do_tu_choi,
    IdChuTro,
    ChuTroId,
    chu_tro_id,
    landlord_id,
    ChuTroTen,
    chu_tro_ten,
    ChuTroSdt,
    chu_tro_sdt,
    HinhAnh,
    hinh_anh,
    MoTa,
    mo_ta,
    NoiQuy,
    noi_quy,
    DienTich,
    dien_tich,
    LoaiPhong,
    loai_phong,
    NgayDang,
    ngay_dang,
    DanhGia,
    danh_gia,
  } = roomData;

  const finalId = Id || id || ('room_' + Date.now());
  const finalTitle = (TieuDe || tieu_de || '').trim();
  const finalAddress = (DiaChi || dia_chi || '').trim();
  const finalDistrict = (QuanHuyen || quan_huyen || 'Cầu Giấy, Hà Nội').trim();
  const finalRentPrice = Number(GiaThue || gia_thue || 2000000);
  const finalElectricityPrice = String(GiaDien || gia_dien || '3.800 đ/kWh').trim();
  const finalWaterPrice = String(GiaNuoc || gia_nuoc || '30.000 đ/khối').trim();
  const finalStatus = TrangThai || trang_thai || 'Chờ duyệt';
  const finalRejectReason = LyDoTuChoi || ly_do_tu_choi || null;
  const finalLandlordId = IdChuTro || ChuTroId || chu_tro_id || landlord_id || 'usr_chutro';
  const finalLandlordName = ChuTroTen || chu_tro_ten || 'Trần Thị Bích (Chủ trọ)';
  const finalLandlordPhone = ChuTroSdt || chu_tro_sdt || '0987654321';
  const finalDescription = (MoTa || mo_ta || '').trim();
  const finalHouseRules = (NoiQuy || noi_quy || '').trim();
  const finalArea = Number(DienTich || dien_tich || 20);
  const finalRoomType = LoaiPhong || loai_phong || 'GacLung';
  const finalPostedDate = NgayDang || ngay_dang || new Date().toISOString();

  // Chuẩn hóa JSON cho các trường mảng/object
  const rawAmenities = TienIch !== undefined ? TienIch : tien_ich;
  const finalAmenities = Array.isArray(rawAmenities)
    ? JSON.stringify(rawAmenities)
    : (typeof rawAmenities === 'string' ? rawAmenities : JSON.stringify(['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do']));

  const rawImages = HinhAnh !== undefined ? HinhAnh : hinh_anh;
  const finalImages = Array.isArray(rawImages) && rawImages.length > 0
    ? JSON.stringify(rawImages)
    : JSON.stringify([
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
      ]);

  const rawReviews = DanhGia !== undefined ? DanhGia : danh_gia;
  const finalReviews = Array.isArray(rawReviews) ? JSON.stringify(rawReviews) : JSON.stringify([]);

  try {
    // Câu lệnh chuẩn khớp 100% database.sql PascalCase
    const sql = `
      INSERT INTO rooms (
        Id, TieuDe, DiaChi, QuanHuyen, GiaThue, GiaDien, GiaNuoc, 
        TienIch, TrangThai, LyDoTuChoi, IdChuTro, ChuTroId, ChuTroTen, 
        ChuTroSdt, HinhAnh, MoTa, NoiQuy, DienTich, LoaiPhong, 
        NgayDang, DanhGia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      finalId,
      finalTitle,
      finalAddress,
      finalDistrict,
      finalRentPrice,
      finalElectricityPrice,
      finalWaterPrice,
      finalAmenities,
      finalStatus,
      finalRejectReason,
      finalLandlordId,
      finalLandlordId,
      finalLandlordName,
      finalLandlordPhone,
      finalImages,
      finalDescription,
      finalHouseRules,
      finalArea,
      finalRoomType,
      finalPostedDate,
      finalReviews,
    ];

    await pool.execute(sql, params);

    return {
      Id: finalId,
      TieuDe: finalTitle,
      DiaChi: finalAddress,
      QuanHuyen: finalDistrict,
      GiaThue: finalRentPrice,
      GiaDien: finalElectricityPrice,
      GiaNuoc: finalWaterPrice,
      TienIch: JSON.parse(finalAmenities),
      TrangThai: finalStatus,
      LyDoTuChoi: finalRejectReason,
      IdChuTro: finalLandlordId,
      ChuTroId: finalLandlordId,
      ChuTroTen: finalLandlordName,
      ChuTroSdt: finalLandlordPhone,
      HinhAnh: JSON.parse(finalImages),
      MoTa: finalDescription,
      NoiQuy: finalHouseRules,
      DienTich: finalArea,
      LoaiPhong: finalRoomType,
      NgayDang: finalPostedDate,
      DanhGia: JSON.parse(finalReviews),
    };
  } catch (error) {
    // Nếu bảng được tạo với tên cột snake_case, tự động fallback
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const fallbackSql = `
          INSERT INTO rooms (
            id, tieu_de, dia_chi, quan_huyen, gia_thue, gia_dien, gia_nuoc, 
            tien_ich, trang_thai, ly_do_tu_choi, chu_tro_id, chu_tro_ten, 
            chu_tro_sdt, hinh_anh, mo_ta, noi_quy, dien_tich, loai_phong, 
            ngay_dang, danh_gia
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const fallbackParams = [
          finalId,
          finalTitle,
          finalAddress,
          finalDistrict,
          finalRentPrice,
          finalElectricityPrice,
          finalWaterPrice,
          finalAmenities,
          finalStatus,
          finalRejectReason,
          finalLandlordId,
          finalLandlordName,
          finalLandlordPhone,
          finalImages,
          finalDescription,
          finalHouseRules,
          finalArea,
          finalRoomType,
          finalPostedDate,
          finalReviews,
        ];
        await pool.execute(fallbackSql, fallbackParams);
        return {
          Id: finalId,
          TieuDe: finalTitle,
          DiaChi: finalAddress,
          QuanHuyen: finalDistrict,
          GiaThue: finalRentPrice,
          GiaDien: finalElectricityPrice,
          GiaNuoc: finalWaterPrice,
          TienIch: JSON.parse(finalAmenities),
          TrangThai: finalStatus,
          LyDoTuChoi: finalRejectReason,
          IdChuTro: finalLandlordId,
          ChuTroId: finalLandlordId,
          ChuTroTen: finalLandlordName,
          ChuTroSdt: finalLandlordPhone,
          HinhAnh: JSON.parse(finalImages),
          MoTa: finalDescription,
          NoiQuy: finalHouseRules,
          DienTich: finalArea,
          LoaiPhong: finalRoomType,
          NgayDang: finalPostedDate,
          DanhGia: JSON.parse(finalReviews),
        };
      } catch (fallbackError) {
        console.error('Lỗi đăng tin phòng (fallback snake_case):', fallbackError);
        throw fallbackError;
      }
    }
    console.error('Lỗi đăng tin phòng:', error);
    throw error;
  }
}

export async function getRooms(filter = {}) {
  let sql = 'SELECT * FROM rooms';
  const conditions = [];
  const params = [];

  if (filter.landlordId) {
    conditions.push('(IdChuTro = ? OR ChuTroId = ?)');
    params.push(filter.landlordId, filter.landlordId);
  }
  if (filter.status && filter.status !== 'all') {
    conditions.push('TrangThai = ?');
    params.push(filter.status);
  }
  if (filter.district && filter.district !== 'all') {
    conditions.push('QuanHuyen LIKE ?');
    params.push(`%${filter.district}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY NgayDang DESC';

  const [rows] = await pool.query(sql, params);
  return (rows || []).map(r => ({
    ...r,
    GiaThue: Number(r.GiaThue || r.gia_thue || 0),
    DienTich: Number(r.DienTich || r.dien_tich || 20),
    TienIch: typeof r.TienIch === 'string' ? JSON.parse(r.TienIch || '[]') : (r.TienIch || []),
    HinhAnh: typeof r.HinhAnh === 'string' ? JSON.parse(r.HinhAnh || '[]') : (r.HinhAnh || []),
    DanhGia: typeof r.DanhGia === 'string' ? JSON.parse(r.DanhGia || '[]') : (r.DanhGia || []),
  }));
}

export async function getRoomById(id) {
  const [rows] = await pool.query('SELECT * FROM rooms WHERE Id = ? OR id = ? LIMIT 1', [id, id]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    GiaThue: Number(r.GiaThue || r.gia_thue || 0),
    DienTich: Number(r.DienTich || r.dien_tich || 20),
    TienIch: typeof r.TienIch === 'string' ? JSON.parse(r.TienIch || '[]') : (r.TienIch || []),
    HinhAnh: typeof r.HinhAnh === 'string' ? JSON.parse(r.HinhAnh || '[]') : (r.HinhAnh || []),
    DanhGia: typeof r.DanhGia === 'string' ? JSON.parse(r.DanhGia || '[]') : (r.DanhGia || []),
  };
}

export async function updateRoom(id, updates = {}) {
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'TienIch' || key === 'HinhAnh' || key === 'DanhGia') {
      fields.push(`\`${key}\` = ?`);
      params.push(JSON.stringify(value || []));
    } else {
      fields.push(`\`${key}\` = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return true;

  params.push(id, id);
  const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE Id = ? OR id = ?`;
  await pool.execute(sql, params);
  return true;
}

export async function deleteRoom(id) {
  await pool.execute('DELETE FROM rooms WHERE Id = ? OR id = ?', [id, id]);
  return true;
}

// -------------------------------------------------------------
// HỢP ĐỒNG THUÊ PHÒNG (RENTAL_CONTRACTS)
// -------------------------------------------------------------

export async function createRentalContract({ room_id, renter_id, landlord_id, status = 'pending_landlord', start_date = null, end_date = null }) {
  const sql = `
    INSERT INTO rental_contracts (room_id, renter_id, landlord_id, status, start_date, end_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const [result] = await pool.execute(sql, [room_id, renter_id, landlord_id, status, start_date, end_date]);
  return { id: result.insertId, room_id, renter_id, landlord_id, status, start_date, end_date };
}

export async function getRentalContracts({ renter_id, landlord_id, room_id } = {}) {
  let sql = 'SELECT * FROM rental_contracts';
  const conditions = [];
  const params = [];

  if (renter_id) {
    conditions.push('renter_id = ?');
    params.push(renter_id);
  }
  if (landlord_id) {
    conditions.push('landlord_id = ?');
    params.push(landlord_id);
  }
  if (room_id) {
    conditions.push('room_id = ?');
    params.push(room_id);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function updateRentalContract(id, updates = {}) {
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`\`${key}\` = ?`);
    params.push(value);
  }
  fields.push('`updated_at` = NOW()');
  params.push(id);

  const sql = `UPDATE rental_contracts SET ${fields.join(', ')} WHERE id = ?`;
  await pool.execute(sql, params);
  return true;
}

// -------------------------------------------------------------
// ĐÁNH GIÁ VÀ XÁC MINH THUÊ PHÒNG (REVIEWS)
// -------------------------------------------------------------

export async function createReview({ room_id, renter_id, contract_id, tenNguoiDanhGia, truongHoc = '', soSao = 5, nhanXet, is_verified = true }) {
  const sql = `
    INSERT INTO reviews (room_id, renter_id, contract_id, tenNguoiDanhGia, truongHoc, soSao, nhanXet, is_verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const [result] = await pool.execute(sql, [room_id, renter_id, contract_id, tenNguoiDanhGia, truongHoc, soSao, nhanXet, is_verified ? 1 : 0]);
  return { id: result.insertId, room_id, renter_id, contract_id, tenNguoiDanhGia, truongHoc, soSao, nhanXet, is_verified };
}

export async function getReviews(roomId) {
  let sql = 'SELECT * FROM reviews';
  const params = [];
  if (roomId) {
    sql += ' WHERE room_id = ?';
    params.push(roomId);
  }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function checkUserCanReview(roomId, userId) {
  // Tìm hợp đồng thuê phòng của sinh viên với trạng thái active hoặc completed
  const [contracts] = await pool.query(
    'SELECT * FROM rental_contracts WHERE room_id = ? AND renter_id = ? AND status IN ("active", "completed")',
    [roomId, userId]
  );

  if (!contracts || contracts.length === 0) {
    return { canReview: false, reason: 'Chỉ người thuê phòng đã được xác minh mới có thể gửi đánh giá và nhận xét.' };
  }

  // Kiểm tra xem đã từng đánh giá cho hợp đồng nào chưa
  for (const contract of contracts) {
    const [existingReviews] = await pool.query(
      'SELECT id FROM reviews WHERE room_id = ? AND renter_id = ? AND contract_id = ? LIMIT 1',
      [roomId, userId, contract.id]
    );

    if (existingReviews.length === 0) {
      // Tìm thấy hợp đồng hợp lệ chưa từng đánh giá
      return { canReview: true, contractId: contract.id, contract };
    }
  }

  return { canReview: false, reason: 'Bạn đã gửi đánh giá cho hợp đồng thuê phòng này rồi.' };
}

// Kiểm tra kết nối tới MySQL
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[MySQL] Kết nối thành công tới cơ sở dữ liệu hostelhub trên localhost:3306');
    connection.release();
    return true;
  } catch (error) {
    console.warn('[MySQL] Không thể kết nối tới localhost:3306:', error.message);
    return false;
  }
}

export default pool;
