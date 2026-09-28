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
