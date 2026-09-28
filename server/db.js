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
