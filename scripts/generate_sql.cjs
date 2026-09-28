const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let sql = `-- ========================================================
-- DATABASE SCRIPT CHO HỆ THỐNG HOSTELHUB
-- Hệ quản trị CSDL: MySQL / MariaDB (phpMyAdmin)
-- Host: localhost | Database: hostelhub
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`hostelhub\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`hostelhub\`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG USERS (Người dùng: SinhVien, ChuTro, Admin)
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`HoTen\` VARCHAR(100) NOT NULL,
  \`Email\` VARCHAR(100) NOT NULL UNIQUE,
  \`MatKhau\` VARCHAR(255) NOT NULL,
  \`Sdt\` VARCHAR(20) NOT NULL,
  \`VaiTro\` ENUM('SinhVien', 'ChuTro', 'Admin') NOT NULL DEFAULT 'SinhVien',
  \`soDuVi\` INT NOT NULL DEFAULT 0,
  \`NgayTao\` VARCHAR(50) NOT NULL,
  \`TrangThai\` ENUM('HoatDong', 'BiKhoa') NOT NULL DEFAULT 'HoatDong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG ROOMS (Phòng trọ)
DROP TABLE IF EXISTS \`rooms\`;
CREATE TABLE \`rooms\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`TieuDe\` VARCHAR(255) NOT NULL,
  \`DiaChi\` VARCHAR(255) NOT NULL,
  \`QuanHuyen\` VARCHAR(100) NOT NULL,
  \`GiaThue\` INT NOT NULL,
  \`GiaDien\` VARCHAR(50) NOT NULL,
  \`GiaNuoc\` VARCHAR(50) NOT NULL,
  \`TienIch\` LONGTEXT NOT NULL COMMENT 'JSON mảng tiện ích',
  \`TrangThai\` VARCHAR(50) NOT NULL DEFAULT 'Còn phòng',
  \`LyDoTuChoi\` TEXT NULL,
  \`IdChuTro\` VARCHAR(50) NOT NULL,
  \`ChuTroId\` VARCHAR(50) NULL,
  \`ChuTroTen\` VARCHAR(100) NOT NULL,
  \`ChuTroSdt\` VARCHAR(20) NOT NULL,
  \`HinhAnh\` LONGTEXT NOT NULL COMMENT 'JSON mảng URL ảnh',
  \`MoTa\` LONGTEXT NULL,
  \`NoiQuy\` LONGTEXT NULL,
  \`DienTich\` INT NOT NULL DEFAULT 20,
  \`LoaiPhong\` VARCHAR(50) NOT NULL DEFAULT 'GacLung',
  \`NgayDang\` VARCHAR(50) NOT NULL,
  \`DanhGia\` LONGTEXT NULL COMMENT 'JSON mảng nhận xét & đánh giá'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG INQUIRIES (Yêu cầu liên hệ / giữ chỗ)
DROP TABLE IF EXISTS \`inquiries\`;
CREATE TABLE \`inquiries\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`PhongId\` VARCHAR(50) NOT NULL,
  \`TieuDePhong\` VARCHAR(255) NOT NULL,
  \`SinhVienId\` VARCHAR(50) NOT NULL,
  \`SinhVienTen\` VARCHAR(100) NOT NULL,
  \`SinhVienSdt\` VARCHAR(20) NOT NULL,
  \`ChuTroId\` VARCHAR(50) NOT NULL,
  \`TienCoc\` INT NOT NULL DEFAULT 0,
  \`GhiChu\` TEXT NULL,
  \`TrangThai\` VARCHAR(50) NOT NULL DEFAULT 'ChoXacNhan',
  \`NgayTao\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG APPOINTMENTS (Lịch hẹn xem phòng)
DROP TABLE IF EXISTS \`appointments\`;
CREATE TABLE \`appointments\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`IdSinhVien\` VARCHAR(50) NOT NULL,
  \`IdPhong\` VARCHAR(50) NOT NULL,
  \`ThoiGianHen\` VARCHAR(100) NOT NULL,
  \`GhiChu\` TEXT NULL,
  \`TrangThai\` VARCHAR(50) NOT NULL DEFAULT 'Chờ xác nhận',
  \`LyDoTuChoi\` TEXT NULL,
  \`TieuDePhong\` VARCHAR(255) NOT NULL,
  \`DiaChiPhong\` VARCHAR(255) NOT NULL,
  \`SinhVienTen\` VARCHAR(100) NOT NULL,
  \`SinhVienSdt\` VARCHAR(20) NOT NULL,
  \`ChuTroId\` VARCHAR(50) NOT NULL,
  \`ChuTroTen\` VARCHAR(100) NOT NULL,
  \`ChuTroSdt\` VARCHAR(20) NOT NULL,
  \`NgayTao\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG DEPOSITS (Giao dịch đặt cọc giữ chỗ 500k)
DROP TABLE IF EXISTS \`deposits\`;
CREATE TABLE \`deposits\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`IdSinhVien\` VARCHAR(50) NOT NULL,
  \`IdPhong\` VARCHAR(50) NOT NULL,
  \`SoTienCoc\` INT NOT NULL DEFAULT 500000,
  \`NgayCoc\` VARCHAR(50) NOT NULL,
  \`TrangThaiCoc\` VARCHAR(50) NOT NULL DEFAULT 'Chờ xác nhận',
  \`LyDoTuChoi\` TEXT NULL,
  \`TieuDePhong\` VARCHAR(255) NOT NULL,
  \`DiaChiPhong\` VARCHAR(255) NOT NULL,
  \`SinhVienTen\` VARCHAR(100) NOT NULL,
  \`SinhVienSdt\` VARCHAR(20) NOT NULL,
  \`ChuTroId\` VARCHAR(50) NOT NULL,
  \`ChuTroTen\` VARCHAR(100) NOT NULL,
  \`ThoiHanGiuCho\` VARCHAR(50) NULL,
  \`NgayTao\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG NOTIFICATIONS (Thông báo hệ thống)
DROP TABLE IF EXISTS \`notifications\`;
CREATE TABLE \`notifications\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`UserId\` VARCHAR(50) NOT NULL,
  \`TieuDe\` VARCHAR(255) NOT NULL,
  \`NoiDung\` TEXT NOT NULL,
  \`Loai\` VARCHAR(50) NOT NULL DEFAULT 'HeThong',
  \`TrangThai\` VARCHAR(50) NOT NULL DEFAULT 'ChuaDoc',
  \`NgayTao\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG FAVORITES (Phòng trọ yêu thích)
DROP TABLE IF EXISTS \`favorites\`;
CREATE TABLE \`favorites\` (
  \`Id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`UserId\` VARCHAR(50) NOT NULL,
  \`PhongId\` VARCHAR(50) NOT NULL,
  \`NgayTao\` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA TỪ DATABASE.JSON)
-- ========================================================
`;

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// Users
if (db.users && db.users.length) {
  sql += `\n-- Dữ liệu mẫu Users\n`;
  sql += `INSERT INTO \`users\` (\`Id\`, \`HoTen\`, \`Email\`, \`MatKhau\`, \`Sdt\`, \`VaiTro\`, \`soDuVi\`, \`NgayTao\`, \`TrangThai\`) VALUES\n`;
  const rows = db.users.map(u => `  (${esc(u.Id)}, ${esc(u.HoTen)}, ${esc(u.Email)}, ${esc(u.MatKhau)}, ${esc(u.Sdt)}, ${esc(u.VaiTro)}, ${u.soDuVi || 0}, ${esc(u.NgayTao)}, ${esc(u.TrangThai || 'HoatDong')})`);
  sql += rows.join(',\n') + ';\n';
}

// Rooms
if (db.rooms && db.rooms.length) {
  sql += `\n-- Dữ liệu mẫu Rooms (22 phòng trọ thực tế)\n`;
  sql += `INSERT INTO \`rooms\` (\`Id\`, \`TieuDe\`, \`DiaChi\`, \`QuanHuyen\`, \`GiaThue\`, \`GiaDien\`, \`GiaNuoc\`, \`TienIch\`, \`TrangThai\`, \`LyDoTuChoi\`, \`IdChuTro\`, \`ChuTroId\`, \`ChuTroTen\`, \`ChuTroSdt\`, \`HinhAnh\`, \`MoTa\`, \`NoiQuy\`, \`DienTich\`, \`LoaiPhong\`, \`NgayDang\`, \`DanhGia\`) VALUES\n`;
  const rows = db.rooms.map(r => {
    return `  (${esc(r.Id)}, ${esc(r.TieuDe)}, ${esc(r.DiaChi)}, ${esc(r.QuanHuyen)}, ${r.GiaThue}, ${esc(r.GiaDien)}, ${esc(r.GiaNuoc)}, ${esc(r.TienIch || [])}, ${esc(r.TrangThai)}, ${esc(r.LyDoTuChoi || null)}, ${esc(r.IdChuTro || r.ChuTroId || '')}, ${esc(r.ChuTroId || r.IdChuTro || '')}, ${esc(r.ChuTroTen)}, ${esc(r.ChuTroSdt)}, ${esc(r.HinhAnh || [])}, ${esc(r.MoTa || '')}, ${esc(r.NoiQuy || '')}, ${r.DienTich || 20}, ${esc(r.LoaiPhong || 'GacLung')}, ${esc(r.NgayDang || new Date().toISOString())}, ${esc(r.DanhGia || [])})`;
  });
  sql += rows.join(',\n') + ';\n';
}

// Inquiries
if (db.inquiries && db.inquiries.length) {
  sql += `\n-- Dữ liệu mẫu Inquiries\n`;
  sql += `INSERT INTO \`inquiries\` (\`Id\`, \`PhongId\`, \`TieuDePhong\`, \`SinhVienId\`, \`SinhVienTen\`, \`SinhVienSdt\`, \`ChuTroId\`, \`TienCoc\`, \`GhiChu\`, \`TrangThai\`, \`NgayTao\`) VALUES\n`;
  const rows = db.inquiries.map(i => `  (${esc(i.Id)}, ${esc(i.PhongId)}, ${esc(i.TieuDePhong)}, ${esc(i.SinhVienId)}, ${esc(i.SinhVienTen)}, ${esc(i.SinhVienSdt)}, ${esc(i.ChuTroId)}, ${i.TienCoc || 0}, ${esc(i.GhiChu || '')}, ${esc(i.TrangThai || 'ChoXacNhan')}, ${esc(i.NgayTao)})`);
  sql += rows.join(',\n') + ';\n';
}

// Appointments
if (db.appointments && db.appointments.length) {
  sql += `\n-- Dữ liệu mẫu Appointments\n`;
  sql += `INSERT INTO \`appointments\` (\`Id\`, \`IdSinhVien\`, \`IdPhong\`, \`ThoiGianHen\`, \`GhiChu\`, \`TrangThai\`, \`LyDoTuChoi\`, \`TieuDePhong\`, \`DiaChiPhong\`, \`SinhVienTen\`, \`SinhVienSdt\`, \`ChuTroId\`, \`ChuTroTen\`, \`ChuTroSdt\`, \`NgayTao\`) VALUES\n`;
  const rows = db.appointments.map(a => `  (${esc(a.Id)}, ${esc(a.IdSinhVien)}, ${esc(a.IdPhong)}, ${esc(a.ThoiGianHen)}, ${esc(a.GhiChu || '')}, ${esc(a.TrangThai || 'Chờ xác nhận')}, ${esc(a.LyDoTuChoi || null)}, ${esc(a.TieuDePhong || '')}, ${esc(a.DiaChiPhong || '')}, ${esc(a.SinhVienTen || '')}, ${esc(a.SinhVienSdt || '')}, ${esc(a.ChuTroId || '')}, ${esc(a.ChuTroTen || '')}, ${esc(a.ChuTroSdt || '')}, ${esc(a.NgayTao || new Date().toISOString())})`);
  sql += rows.join(',\n') + ';\n';
}

// Notifications
if (db.notifications && db.notifications.length) {
  sql += `\n-- Dữ liệu mẫu Notifications\n`;
  sql += `INSERT INTO \`notifications\` (\`Id\`, \`UserId\`, \`TieuDe\`, \`NoiDung\`, \`Loai\`, \`TrangThai\`, \`NgayTao\`) VALUES\n`;
  const rows = db.notifications.map(n => `  (${esc(n.Id)}, ${esc(n.UserId)}, ${esc(n.TieuDe)}, ${esc(n.NoiDung)}, ${esc(n.Loai || 'HeThong')}, ${esc(n.TrangThai || 'ChuaDoc')}, ${esc(n.NgayTao)})`);
  sql += rows.join(',\n') + ';\n';
}

fs.writeFileSync(path.resolve(__dirname, '../database.sql'), sql, 'utf8');
console.log('Successfully written database.sql, total size:', sql.length, 'bytes');
