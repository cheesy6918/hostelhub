-- ========================================================
-- DATABASE SCRIPT CHO HỆ THỐNG HOSTELHUB
-- Hệ quản trị CSDL: MySQL / MariaDB (phpMyAdmin)
-- Host: localhost | Database: hostelhub
-- ========================================================

CREATE DATABASE IF NOT EXISTS `hostelhub` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hostelhub`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG USERS (Người dùng: SinhVien, ChuTro, Admin)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `HoTen` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `MatKhau` VARCHAR(255) NOT NULL,
  `Sdt` VARCHAR(20) NOT NULL,
  `VaiTro` ENUM('SinhVien', 'ChuTro', 'Admin') NOT NULL DEFAULT 'SinhVien',
  `soDuVi` INT NOT NULL DEFAULT 0,
  `NgayTao` VARCHAR(50) NOT NULL,
  `TrangThai` ENUM('HoatDong', 'BiKhoa') NOT NULL DEFAULT 'HoatDong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG ROOMS (Phòng trọ)
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `TieuDe` VARCHAR(255) NOT NULL,
  `DiaChi` VARCHAR(255) NOT NULL,
  `QuanHuyen` VARCHAR(100) NOT NULL,
  `GiaThue` INT NOT NULL,
  `GiaDien` VARCHAR(50) NOT NULL,
  `GiaNuoc` VARCHAR(50) NOT NULL,
  `TienIch` LONGTEXT NOT NULL COMMENT 'JSON mảng tiện ích',
  `TrangThai` VARCHAR(50) NOT NULL DEFAULT 'Còn phòng',
  `LyDoTuChoi` TEXT NULL,
  `IdChuTro` VARCHAR(50) NOT NULL,
  `ChuTroId` VARCHAR(50) NULL,
  `ChuTroTen` VARCHAR(100) NOT NULL,
  `ChuTroSdt` VARCHAR(20) NOT NULL,
  `HinhAnh` LONGTEXT NOT NULL COMMENT 'JSON mảng URL ảnh',
  `MoTa` LONGTEXT NULL,
  `NoiQuy` LONGTEXT NULL,
  `DienTich` INT NOT NULL DEFAULT 20,
  `LoaiPhong` VARCHAR(50) NOT NULL DEFAULT 'GacLung',
  `NgayDang` VARCHAR(50) NOT NULL,
  `DanhGia` LONGTEXT NULL COMMENT 'JSON mảng nhận xét & đánh giá'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG INQUIRIES (Yêu cầu liên hệ / giữ chỗ)
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `PhongId` VARCHAR(50) NOT NULL,
  `TieuDePhong` VARCHAR(255) NOT NULL,
  `SinhVienId` VARCHAR(50) NOT NULL,
  `SinhVienTen` VARCHAR(100) NOT NULL,
  `SinhVienSdt` VARCHAR(20) NOT NULL,
  `ChuTroId` VARCHAR(50) NOT NULL,
  `TienCoc` INT NOT NULL DEFAULT 0,
  `GhiChu` TEXT NULL,
  `TrangThai` VARCHAR(50) NOT NULL DEFAULT 'ChoXacNhan',
  `NgayTao` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG APPOINTMENTS (Lịch hẹn xem phòng)
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `IdSinhVien` VARCHAR(50) NOT NULL,
  `IdPhong` VARCHAR(50) NOT NULL,
  `ThoiGianHen` VARCHAR(100) NOT NULL,
  `GhiChu` TEXT NULL,
  `TrangThai` VARCHAR(50) NOT NULL DEFAULT 'Chờ xác nhận',
  `LyDoTuChoi` TEXT NULL,
  `TieuDePhong` VARCHAR(255) NOT NULL,
  `DiaChiPhong` VARCHAR(255) NOT NULL,
  `SinhVienTen` VARCHAR(100) NOT NULL,
  `SinhVienSdt` VARCHAR(20) NOT NULL,
  `ChuTroId` VARCHAR(50) NOT NULL,
  `ChuTroTen` VARCHAR(100) NOT NULL,
  `ChuTroSdt` VARCHAR(20) NOT NULL,
  `NgayTao` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG DEPOSITS (Giao dịch đặt cọc giữ chỗ 500k)
DROP TABLE IF EXISTS `deposits`;
CREATE TABLE `deposits` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `IdSinhVien` VARCHAR(50) NOT NULL,
  `IdPhong` VARCHAR(50) NOT NULL,
  `SoTienCoc` INT NOT NULL DEFAULT 500000,
  `NgayCoc` VARCHAR(50) NOT NULL,
  `TrangThaiCoc` VARCHAR(50) NOT NULL DEFAULT 'Chờ xác nhận',
  `LyDoTuChoi` TEXT NULL,
  `TieuDePhong` VARCHAR(255) NOT NULL,
  `DiaChiPhong` VARCHAR(255) NOT NULL,
  `SinhVienTen` VARCHAR(100) NOT NULL,
  `SinhVienSdt` VARCHAR(20) NOT NULL,
  `ChuTroId` VARCHAR(50) NOT NULL,
  `ChuTroTen` VARCHAR(100) NOT NULL,
  `ThoiHanGiuCho` VARCHAR(50) NULL,
  `NgayTao` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG NOTIFICATIONS (Thông báo hệ thống)
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `UserId` VARCHAR(50) NOT NULL,
  `TieuDe` VARCHAR(255) NOT NULL,
  `NoiDung` TEXT NOT NULL,
  `Loai` VARCHAR(50) NOT NULL DEFAULT 'HeThong',
  `TrangThai` VARCHAR(50) NOT NULL DEFAULT 'ChuaDoc',
  `NgayTao` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG FAVORITES (Phòng trọ yêu thích)
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `Id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `UserId` VARCHAR(50) NOT NULL,
  `PhongId` VARCHAR(50) NOT NULL,
  `NgayTao` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG RENTAL_CONTRACTS (Hợp đồng thuê phòng / Xác nhận thuê 2 chiều)
DROP TABLE IF EXISTS `rental_contracts`;
CREATE TABLE `rental_contracts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_id` VARCHAR(50) NOT NULL,
  `renter_id` VARCHAR(50) NOT NULL,
  `landlord_id` VARCHAR(50) NOT NULL,
  `status` ENUM('pending_renter', 'pending_landlord', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending_landlord',
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rental_room` (`room_id`),
  INDEX `idx_rental_renter` (`renter_id`),
  INDEX `idx_rental_landlord` (`landlord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG REVIEWS (Đánh giá và nhận xét phòng trọ có phân quyền xác minh)
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_id` VARCHAR(50) NOT NULL,
  `renter_id` VARCHAR(50) NOT NULL,
  `contract_id` INT NOT NULL,
  `tenNguoiDanhGia` VARCHAR(100) NOT NULL,
  `truongHoc` VARCHAR(100) NULL,
  `soSao` INT NOT NULL DEFAULT 5,
  `nhanXet` TEXT NOT NULL,
  `is_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_renter_room_contract` (`renter_id`, `room_id`, `contract_id`),
  INDEX `idx_review_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA TỪ DATABASE.JSON)
-- ========================================================

-- Dữ liệu mẫu Users
INSERT INTO `users` (`Id`, `HoTen`, `Email`, `MatKhau`, `Sdt`, `VaiTro`, `soDuVi`, `NgayTao`, `TrangThai`) VALUES
  ('usr_admin', 'Quản Trị Viên HostelHub', 'admin@hostelhub.vn', '$2b$10$Bz10KPwmYz3a3EzTDn04OuUJv3RuG.guZT0CAALfF7Hqu2bmlXn0G', '0909998888', 'Admin', 2000000, '2026-09-23T07:53:06.312Z', 'HoatDong'),
  ('usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', 'chutro@hostelhub.vn', '$2b$10$Bz10KPwmYz3a3EzTDn04OufTvi1No65PLqBFUyV/kkeZTWmGbJMm2', '0987654321', 'ChuTro', 2000000, '2026-09-23T07:53:06.312Z', 'HoatDong'),
  ('usr_sinhvien', 'Nguyễn Văn Sinh (SV Bách Khoa)', 'sinhvien@hostelhub.vn', '$2b$10$Bz10KPwmYz3a3EzTDn04OufTvi1No65PLqBFUyV/kkeZTWmGbJMm2', '0912345678', 'SinhVien', 2000000, '2026-09-23T07:53:06.312Z', 'HoatDong');

-- Dữ liệu mẫu Rooms (22 phòng trọ thực tế)
INSERT INTO `rooms` (`Id`, `TieuDe`, `DiaChi`, `QuanHuyen`, `GiaThue`, `GiaDien`, `GiaNuoc`, `TienIch`, `TrangThai`, `LyDoTuChoi`, `IdChuTro`, `ChuTroId`, `ChuTroTen`, `ChuTroSdt`, `HinhAnh`, `MoTa`, `NoiQuy`, `DienTich`, `LoaiPhong`, `NgayDang`, `DanhGia`) VALUES
  ('room_1', 'Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân', 'Số 88 Trần Đại Nghĩa, Phường Đồng Tâm', 'Hai Bà Trưng, Hà Nội', 1200000, 'Miễn phí (bao trọn gói tiền phòng)', 'Miễn phí (nước sinh hoạt + nước lọc RO)', '["Điều hòa","Nóng lạnh","Giờ tự do","Wifi","Dọn phòng","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"]', 'Mô hình ký túc xá capsule / sleepbox riêng tư, nệm cao su non êm ái, rèm kéo cách âm tốt, đèn học và ổ sạc type-C riêng biệt. Khu sinh hoạt chung rộng rãi, bếp từ đôi nấu ăn thoải mái, máy giặt sấy công nghiệp dùng miễn phí.', '1. Giữ trật tự chung sau 23:00, không nói chuyện lớn tiếng trong buồng ngủ.
2. Vệ sinh sạch sẽ khu vực bếp và bồn rửa sau khi nấu nướng.
3. Khóa cửa vân tay bảo mật cẩn thận khi ra vào.
4. Tuyệt đối không hút thuốc lá trong phòng kín.', 12, 'KyTucXa', '2026-09-23T07:53:06.312Z', '[{"id":"rev_1790151502712_j5t2","tenNguoiDanhGia":"Nguyễn Văn Sinh (SV Bách Khoa)","truongHoc":"Sinh viên đã trải nghiệm","soSao":5,"nhanXet":"Phòng ngủ sạch sẽ, cô chú chủ trọ nhiệt tình hỗ trợ!","ngay":"23/9/2026"},{"tenNguoiDanhGia":"Hoàng Nhật Minh","truongHoc":"Đại học Kinh Tế Quốc Dân","soSao":5,"nhanXet":"Phòng sạch sẽ, điều hòa mát rượi cả ngày. Bác chủ trọ dễ tính hỗ trợ sinh viên rất chu đáo.","ngay":"15/09/2026"},{"tenNguoiDanhGia":"Nguyễn Thùy Linh","truongHoc":"Đại học Bách Khoa Hà Nội","soSao":5,"nhanXet":"Giá 1.2tr mà bao cả điện nước điều hòa là quá hời cho sinh viên. Rất yên tĩnh để ôn thi.","ngay":"02/09/2026"}]'),
  ('room_2', 'Phòng trọ sinh viên giá rẻ, an ninh tốt gần ĐH Công Nghiệp Hà Nội', 'Ngõ 29/8 Đường Cầu Diễn, Phường Phúc Diễn', 'Bắc Từ Liêm, Hà Nội', 1500000, '3.500 đ/kWh (đồng hồ riêng từng phòng)', '80.000 đ/người/tháng', '["Nóng lạnh","Vệ sinh riêng","Giờ tự do","Wifi","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80"]', 'Phòng trọ tầng 2 thoáng mát có cửa sổ trời, bồn rửa mặt và vệ sinh khép kín trong phòng. Có sân để xe rộng rãi dưới tầng 1 có camera giám sát 24/7. Cách cổng trường ĐH Công Nghiệp chỉ 500m đi bộ.', '1. Tự do giờ giấc nhưng không đưa người lạ vào qua đêm khi chưa báo quản lý.
2. Để xe ngay ngắn đúng vị trí phân chia tầng 1.
3. Đổ rác đúng giờ quy định trước 19h hàng ngày.', 18, 'ChungCuMini', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Phạm Đức Anh","truongHoc":"Đại học Công Nghiệp Hà Nội","soSao":4,"nhanXet":"Phòng rộng rãi, gần chợ sinh viên Nhổn đồ ăn rẻ. Điện nước tính theo công tơ rõ ràng.","ngay":"10/08/2026"}]'),
  ('room_3', 'Phòng khép kín sạch đẹp khu Chùa Láng, gần ĐH Ngoại Thương & Ngoại Giao', 'Số 45 Ngách 185 Chùa Láng, Phường Láng Thượng', 'Đống Đa, Hà Nội', 1800000, '3.800 đ/kWh', '100.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Wifi","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80"]', 'Phòng nằm trong ngõ yên tĩnh, an ninh cực tốt, hàng xóm toàn sinh viên Ngoại Thương và Ngoại Giao văn minh. Có ban công phơi đồ thoáng gió, bình nóng lạnh mới lắp, có điều hòa làm lạnh nhanh.', '1. Không tụ tập nhậu nhẹt, không gây mất an ninh trật tự khu phố.
2. Khóa cổng cẩn thận khi đi về sau 23h.
3. Tiết kiệm điện nước chung.', 20, 'ChungCuMini', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Lê Thảo Trang","truongHoc":"Đại học Ngoại Thương","soSao":5,"nhanXet":"Vị trí siêu đỉnh, đi bộ 3 phút sang FTU. Phòng sạch và thoáng gió tự nhiên.","ngay":"20/08/2026"}]'),
  ('room_4', 'Phòng gác lửng sinh viên cao ráo, gần ĐH Sư Phạm - ĐHQG Hà Nội', 'Số 16 Ngõ 199 Trần Quốc Hoàn, Phường Dịch Vọng Hậu', 'Cầu Giấy, Hà Nội', 2200000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80"]', 'Thiết kế gác lửng bê tông kiên cố, cầu thang gỗ có tay vịn an toàn. Tầng dưới làm phòng khách & góc học tập, gác trên đặt đệm ngủ riêng tư. Có kệ bếp và chậu rửa inox tiện nấu ăn.', '1. Không đóng đinh khoan tường làm hỏng kết cấu gác lửng.
2. Nấu ăn dùng bếp từ/bếp hồng ngoại, không sử dụng bình gas mini nguy hiểm.
3. Vệ sinh phòng ốc gọn gàng.', 22, 'GacLung', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Trần Văn Quyết","truongHoc":"Đại học Quốc Gia Hà Nội","soSao":5,"nhanXet":"Gác xịn lắm, mình cao 1m75 đứng trên gác không hề bị đụng đầu, quạt và điều hòa phả đều khắp phòng.","ngay":"18/08/2026"}]'),
  ('room_5', 'Phòng trọ gác đúc cao cấp, kệ bếp riêng sát cổng ĐH Bách Khoa & Xây Dựng', 'Số 18 Ngõ 204 Tạ Quang Bửu, Phường Bách Khoa', 'Hai Bà Trưng, Hà Nội', 2600000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Khóa vân tay","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"]', 'Phòng mới xây sửa mới 100%, sơn tường trắng tinh tươm. Vệ sinh khép kín ốp gạch men cao cấp, vòi hoa sen tăng áp, gương led. Có khóa cửa vân tay từng phòng, camera hành lang giám sát đảm bảo an ninh tuyệt đối.', '1. Giữ gìn an ninh trật tự chung khu ký túc xá Bách Khoa.
2. Phân loại rác hữu cơ và vô cơ trước khi bỏ vào thùng rác chung.
3. Thanh toán tiền phòng đúng hẹn từ mùng 1 đến mùng 5 hàng tháng.', 25, 'GacLung', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Vũ Quốc Huy","truongHoc":"Đại học Bách Khoa Hà Nội","soSao":5,"nhanXet":"Ở đây năm thứ hai rồi rất ưng, ra cổng Ký túc xá Bách Khoa ăn cơm sinh viên siêu tiện.","ngay":"05/09/2026"}]'),
  ('room_6', 'Studio mini ban công thoáng ngập nắng, gần ĐH Y Hà Nội & Học Viện Ngân Hàng', 'Số 12 Ngõ 10 Tôn Thất Tùng, Phường Khương Thượng', 'Đống Đa, Hà Nội', 2900000, '4.000 đ/kWh', '100.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Tủ lạnh","Ban công","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80"]', 'Căn studio cực xinh xắn có ban công riêng nhìn ra cây xanh thoáng mát, đã trang bị sẵn tủ lạnh 150L, tủ quần áo 2 cánh và bàn học đôi. Thích hợp cho 1-2 sinh viên trường Y cần không gian yên tĩnh học bài.', '1. Không làm ồn đêm khuya để các bạn sinh viên y khoa tập trung ôn thi lâm sàng.
2. Tưới cây chăm sóc ban công định kỳ.
3. Khóa cổng an toàn khi về khuya.', 26, 'Studio', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Nguyễn Bích Ngọc","truongHoc":"Đại học Y Hà Nội","soSao":5,"nhanXet":"Ban công nhiều nắng trồng cây rất thích. Phòng yên tĩnh, chủ nhà thân thiện.","ngay":"12/08/2026"}]'),
  ('room_7', 'Chung cư mini có thang máy, full đồ gần Học viện Tài Chính & Mỏ Địa Chất', 'Ngõ 52 Tân Nhuệ, Phường Cổ Nhuế 2', 'Bắc Từ Liêm, Hà Nội', 3200000, '3.800 đ/kWh', '35.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Máy giặt","Tủ lạnh","Thang máy","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80"]', 'Tòa nhà CCMN 7 tầng có thang máy thẻ từ, máy giặt riêng lắp ngay logia ban công. Đầy đủ bếp từ đôi âm mặt đá hoa cương, giường 1m6 x 2m và đệm lò xo cao cấp. Internet cáp quang tốc độ cao mỗi tầng 1 router.', '1. Sử dụng thang máy văn minh, không giữ nút bấm quá lâu.
2. Phơi đồ đúng khu vực quy định trên logia.
3. Đóng tiền điện nước và dịch vụ vệ sinh đúng hạn.', 28, 'ChungCuMini', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Đặng Tuấn Kiệt","truongHoc":"Học viện Tài Chính","soSao":5,"nhanXet":"Tòa nhà mới đẹp, thang máy chạy êm ru, có máy giặt riêng đỡ phải tranh nhau giặt đồ.","ngay":"22/07/2026"}]'),
  ('room_8', 'Studio cao cấp full nội thất phong cách Hàn Quốc sát ĐH Quốc Gia HN', 'Số 130 Xuân Thủy, Phường Dịch Vọng Hậu', 'Cầu Giấy, Hà Nội', 3500000, '4.000 đ/kWh', '100.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Máy giặt","Tủ lạnh","Gác lửng","Thang máy","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"]', 'Căn hộ dịch vụ cao cấp dành cho sinh viên và chuyên gia trẻ, thiết kế tông màu gỗ sồi ấm cúng phong cách Hàn Quốc. Có sofa tiếp khách, tivi thông minh, máy hút mùi bếp và tủ quần áo kịch trần sang trọng.', '1. Không mang chất dễ cháy nổ vào căn hộ.
2. Giữ gìn nguyên vẹn nội thất cao cấp của phòng.
3. Hút thuốc vui lòng ra ngoài ban công thoáng khí.', 32, 'Studio', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Nguyễn Hải Đăng","truongHoc":"ĐH Ngoại Ngữ - ĐHQGHN","soSao":5,"nhanXet":"Phòng đẹp y như ảnh, nội thất xịn sò thơm tho. Rất đáng giá tiền bỏ ra.","ngay":"30/08/2026"}]'),
  ('room_9', 'Căn hộ 1 ngủ 1 khách hiện đại khu vực ĐH Luật & Học viện Ngoại Giao', 'Ngõ 91 Nguyễn Chí Thanh, Phường Láng Hạ', 'Đống Đa, Hà Nội', 3800000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Máy giặt","Tủ lạnh","Ban công","Wifi"]', 'Công khai', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"]', 'Căn hộ riêng biệt gồm phòng khách liền bếp và 1 phòng ngủ độc lập có cửa sổ lớn. Ban công riêng phơi đồ ngắm thành phố. Thích hợp nhóm bạn 2-3 sinh viên chia tiền ở cùng nhau rất tiết kiệm.', '1. Giữ trật tự khu chung cư sau 22:30.
2. Bảo quản khóa cửa và chìa cơ dự phòng.
3. Không nuôi chó mèo phóng uế hành lang.', 35, 'ChungCuMini', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Trần Mai Phương","truongHoc":"Đại học Luật Hà Nội","soSao":5,"nhanXet":"Phòng chia 1 khách 1 ngủ riêng biệt rất riêng tư, bọn mình 2 đứa ở thoải mái.","ngay":"15/07/2026"}]'),
  ('room_10', 'Căn hộ mini duplex tầng cao view hồ Triều Khúc, gần ĐH Hà Nội & KHXH&NV', 'Số 68 Phố Triều Khúc, Phường Thanh Xuân Nam', 'Thanh Xuân, Hà Nội', 4000000, '3.800 đ/kWh', '35.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Máy giặt","Tủ lạnh","Khóa vân tay","Thang máy"]', 'Chờ duyệt', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"]', 'Căn hộ duplex trần cao 4.2m view thẳng hồ Triều Khúc lộng gió. Thiết kế thời thượng với lan can kính cường lực sang trọng, rèm 2 lớp cản sáng 100%. Phù hợp sinh viên thích không gian sống phong cách resort.', '1. Không dán sticker keo dính lên kính cường lực và tường thạch cao.
2. Giữ gìn an toàn trên khu vực duplex gác cao.
3. Tuân thủ nội quy phòng cháy chữa cháy của tòa nhà.', 38, 'GacLung', '2026-09-23T07:53:06.312Z', '[{"tenNguoiDanhGia":"Nguyễn Thành Trung","truongHoc":"Đại học Hà Nội","soSao":5,"nhanXet":"View hồ siêu chill buổi chiều ngắm hoàng hôn, phòng cách âm tốt.","ngay":"10/09/2026"}]'),
  ('room_11', 'Phòng gác lửng ban công ngập nắng gần ĐH Quốc Gia & Sư Phạm Kỹ Thuật TP.HCM', 'Số 15 Đường số 6, Phường Linh Trung', 'Thủ Đức, TP.HCM', 1800000, '3.500 đ/kWh', '25.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Ban công","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80"]', 'Phòng gác lửng đúc kiên cố trần cao 3.8m, ban công lộng gió ngắm khu Làng Đại Học. Gần ngay chợ đêm sinh viên và trạm xe buýt 53, 08.', '1. Không làm ồn sau 23h đêm.
2. Khóa cổng vân tay khi ra vào.
3. Giữ vệ sinh hành lang chung.', 22, 'GacLung', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Lê Minh Khang","truongHoc":"ĐH Sư Phạm Kỹ Thuật TP.HCM","soSao":5,"nhanXet":"Phòng rất thoáng mát, ban công rộng phơi đồ nhanh khô.","ngay":"14/09/2026"}]'),
  ('room_12', 'Studio mini khép kín full nội thất gần ĐH Bách Khoa TP.HCM & ĐH Y Dược', 'Hẻm 497 Hòa Hảo, Phường 7', 'Quận 10, TP.HCM', 2800000, '3.800 đ/kWh', '100.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Tủ lạnh","Máy giặt","Wifi","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"]', 'Studio mini trang bị sẵn máy lạnh Inverter tiết kiệm điện, tủ lạnh 2 cánh, bếp nấu mặt kính và nệm cao su. Không chung chủ, giờ giấc hoàn toàn tự do 24/7.', '1. Không tụ tập nhậu nhẹt cờ bạc.
2. Để xe ngăn nắp ở tầng hầm.
3. Tắt điện nước khi ra khỏi phòng.', 25, 'Studio', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Nguyễn Thị Cẩm Ly","truongHoc":"ĐH Bách Khoa TP.HCM","soSao":5,"nhanXet":"Phòng tiện nghi y như căn hộ nhỏ, đi bộ sang Bách Khoa cơ sở 1 chỉ 5 phút.","ngay":"18/09/2026"}]'),
  ('room_13', 'Phòng trọ sinh viên giá rẻ cách cổng ĐH Giao Thông Vận Tải 300m', 'Ngõ 102 Cầu Giấy, Phường Quan Hoa', 'Cầu Giấy, Hà Nội', 1300000, '3.500 đ/kWh', '70.000 đ/người/tháng', '["Nóng lạnh","Vệ sinh riêng","Wifi","Giờ tự do","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80"]', 'Phòng trọ tầng 1 cao ráo không ngập nước, có chỗ để xe máy an toàn trong nhà. Gần trạm xe buýt Cầu Giấy và ga đường sắt trên cao.', '1. Khóa cửa cổng khi đi sau 23h.
2. Vệ sinh chung khu để xe.
3. Tiết kiệm điện nước.', 16, 'ChungCuMini', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Đỗ Hữu Thắng","truongHoc":"ĐH Giao Thông Vận Tải","soSao":4,"nhanXet":"Giá rẻ phù hợp túi tiền sinh viên năm nhất, đi bộ ra trường cực tiện.","ngay":"08/09/2026"}]'),
  ('room_14', 'Chung cư mini cao cấp có thang máy gần ĐH Thủy Lợi & ĐH Công Đoàn', 'Số 25 Ngõ 167 Tây Sơn, Phường Quang Trung', 'Đống Đa, Hà Nội', 3400000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Máy giặt","Tủ lạnh","Thang máy","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80"]', 'Tòa nhà mới bàn giao, thang máy Mitsubishi êm ái, cửa thẻ từ chống trộm. Phòng trang bị trọn bộ giường tủ cao cấp, máy giặt riêng trên ban công.', '1. Không gây ồn ào hành lang.
2. Phân loại rác thải.
3. Đóng tiền phòng đúng kỳ hạn.', 28, 'ChungCuMini', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Phan Bảo Trâm","truongHoc":"ĐH Thủy Lợi","soSao":5,"nhanXet":"Tòa nhà văn minh, bảo vệ trực 24/7 an tâm học tập.","ngay":"12/09/2026"}]'),
  ('room_15', 'Phòng gác đúc kiên cố, khóa vân tay gần ĐH Tôn Đức Thắng & RMIT', 'Số 82 Đường số 9, KDC Him Lam, Phường Tân Hưng', 'Quận 7, TP.HCM', 2300000, '3.500 đ/kWh', '80.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Khóa vân tay","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"]', 'Gác đúc bê tông cao ráo không đụng đầu, gạch men sáng bóng. Khu dân cư Him Lam an ninh bậc nhất, nhiều quán ăn và siêu thị tiện lợi.', '1. Không dắt người lạ ngủ qua đêm không báo trước.
2. Để xe đúng ô vạch kẻ.
3. Giữ trật tự ban đêm.', 24, 'GacLung', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Huỳnh Gia Huy","truongHoc":"ĐH Tôn Đức Thắng","soSao":5,"nhanXet":"Gần TDTU chạy xe máy 3 phút tới cổng trường, phòng mát mẻ.","ngay":"16/09/2026"}]'),
  ('room_16', 'Sleepbox cao cấp có điều hòa riêng gần ĐH Sân Khấu Điện Ảnh & ĐH Mở', 'Ngõ 12 Hồ Tùng Mậu, Phường Mai Dịch', 'Cầu Giấy, Hà Nội', 1100000, 'Miễn phí (bao trọn gói)', 'Miễn phí (bao trọn gói)', '["Điều hòa","Nóng lạnh","Giờ tự do","Wifi","Dọn phòng","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80"]', 'Buồng ngủ capsule riêng tư, rèm kéo cách âm, ổ cắm sạc type-C và đèn led đọc sách. Có máy giặt sấy tự động và bếp từ đôi chung.', '1. Đi nhẹ nói khẽ sau 22h30.
2. Không ăn uống trong buồng ngủ.
3. Giữ gìn vệ sinh chung.', 10, 'KyTucXa', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Trần Quốc Bảo","truongHoc":"ĐH Thương Mại","soSao":5,"nhanXet":"Giá 1.1tr bao cả điện nước điều hòa là lựa chọn tiết kiệm nhất cho sinh viên.","ngay":"21/09/2026"}]'),
  ('room_17', 'Phòng khép kín sạch sẽ ngõ rộng gần ĐH Thương Mại & Sân Mỹ Đình', 'Số 38 Ngõ 75 Hồ Tùng Mậu, Phường Mai Dịch', 'Nam Từ Liêm, Hà Nội', 1900000, '3.800 đ/kWh', '80.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Wifi","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80"]', 'Phòng khép kín tầng 3 có cửa sổ lớn đón gió mát, kệ bếp bồn rửa inox thuận tiện nấu nướng. Cách trường ĐH Thương Mại chỉ 400m.', '1. Giữ gìn trật tự khu trọ.
2. Không hút thuốc lá trong phòng.
3. Khóa cổng cẩn thận.', 20, 'ChungCuMini', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Vũ Mai Anh","truongHoc":"ĐH Thương Mại","soSao":5,"nhanXet":"Phòng sạch đẹp, chủ trọ thân thiện nhiệt tình.","ngay":"17/09/2026"}]'),
  ('room_18', 'Studio Duplex trần cao hiện đại gần ĐH Kiến Trúc & Học viện Bưu Chính', 'Số 19 Ngõ 10 Phố Ao Sen, Phường Mộ Lao', 'Hà Đông, Hà Nội', 2700000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Gác lửng","Tủ lạnh","Khóa vân tay","Wifi"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80"]', 'Căn hộ duplex phố ẩm thực Ao Sen sầm uất, view thoáng, ánh sáng tự nhiên. Thiết kế gác cao đi lại thoải mái, góc học tập decor xinh xắn.', '1. Sử dụng thiết bị điện an toàn.
2. Đổ rác đúng giờ quy định.
3. Không làm phiền các phòng bên cạnh.', 30, 'GacLung', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Nguyễn Tấn Đạt","truongHoc":"Học viện Bưu Chính Viễn Thông","soSao":5,"nhanXet":"Khu Ao Sen đồ ăn nhiều vô kể, phòng đẹp mê ly.","ngay":"19/09/2026"}]'),
  ('room_19', 'Phòng trọ mới xây ngõ ô tô gần ĐH Khoa Học Tự Nhiên & ĐH Hà Nội', 'Số 42 Ngõ 330 Nguyễn Trãi, Phường Thanh Xuân Trung', 'Thanh Xuân, Hà Nội', 2100000, '3.800 đ/kWh', '30.000 đ/khối', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Wifi","Khóa vân tay","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"]', 'Phòng mới xây 100%, thiết bị vệ sinh Inax cao cấp, bình nóng lạnh Ariston, điều hòa Casper 9000BTU mát rượi. Ngõ thông rộng rãi đi bộ ra ga metro Thượng Đình.', '1. Không dán băng dính làm bong sơn tường mới.
2. Khóa cửa vân tay khi ra vào.
3. Tiết kiệm điện nước.', 22, 'ChungCuMini', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Lê Hoàng Yến","truongHoc":"ĐH Khoa Học Tự Nhiên","soSao":5,"nhanXet":"Phòng mới toanh thơm mùi sơn mới, cửa vân tay bảo mật tốt.","ngay":"22/09/2026"}]'),
  ('room_20', 'Căn hộ mini ban công thoáng ngập nắng gần ĐH Kinh Tế TP.HCM (UEH)', 'Hẻm 142 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu', 'Quận 3, TP.HCM', 3800000, '4.000 đ/kWh', '100.000 đ/người/tháng', '["Điều hòa","Nóng lạnh","Vệ sinh riêng","Giờ tự do","Tủ lạnh","Máy giặt","Ban công","Thang máy"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"]', 'Căn hộ mini trung tâm Quận 3 có ban công cây xanh thoáng mát, máy giặt riêng, tủ lạnh side by side nhỏ gọn, giường đệm cao su nhập khẩu.', '1. Không làm ồn đêm khuya.
2. Chăm sóc cây ban công.
3. Tuân thủ PCCC.', 32, 'Studio', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Nguyễn Đình Phúc","truongHoc":"ĐH Kinh Tế TP.HCM (UEH)","soSao":5,"nhanXet":"Vị trí đắc địa ngay trung tâm, đi đâu cũng gần, phòng như khách sạn.","ngay":"20/09/2026"}]'),
  ('room_21', 'Phòng trọ sinh viên giá mềm gần ĐH Nông Lâm TP.HCM & Làng Đại Học', 'Đường số 14, Khu phố 6, Phường Linh Trung', 'Thủ Đức, TP.HCM', 1400000, '3.500 đ/kWh', '60.000 đ/người/tháng', '["Nóng lạnh","Vệ sinh riêng","Giờ tự do","Wifi","Chỗ để xe"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"]', 'Phòng rộng rãi yên tĩnh, an ninh tốt, gần chợ sinh viên và bến xe buýt. Có sân để xe rộng rãi dưới tầng trệt.', '1. Giữ trật tự khu xóm trọ.
2. Để xe ngay ngắn.
3. Đóng tiền trọ đúng hẹn.', 18, 'ChungCuMini', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Trần Thị Thu Thảo","truongHoc":"ĐH Nông Lâm TP.HCM","soSao":4,"nhanXet":"Phòng trọ giá mềm, bác chủ trọ hiền lành dễ mến.","ngay":"11/09/2026"}]'),
  ('room_22', 'Ký túc xá cao cấp bao trọn gói điện nước sát ĐH Bách Khoa Hà Nội', 'Số 10 Ngõ 30 Tạ Quang Bửu, Phường Bách Khoa', 'Hai Bà Trưng, Hà Nội', 1250000, 'Miễn phí (bao trọn gói)', 'Miễn phí (bao trọn gói)', '["Điều hòa","Nóng lạnh","Giờ tự do","Wifi","Dọn phòng","Khóa vân tay"]', 'Còn phòng', NULL, 'usr_chutro', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80"]', 'Mô hình ký túc xá hiện đại cho sinh viên Bách Khoa, Xây Dựng, Kinh Tế. Giường tầng gỗ chắc chắn, tủ đồ cá nhân có khóa riêng, có người dọn vệ sinh hàng ngày.', '1. Không gây ồn sau 23h.
2. Giữ vệ sinh khu bếp và nhà tắm.
3. Khóa cửa vân tay cẩn thận.', 14, 'KyTucXa', '2026-09-24T21:40:00.000Z', '[{"tenNguoiDanhGia":"Nguyễn Trọng Nhân","truongHoc":"ĐH Xây Dựng Hà Nội","soSao":5,"nhanXet":"Rất tiện cho sinh viên, bạn bè cùng phòng hòa đồng vui vẻ.","ngay":"15/09/2026"}]');

-- Dữ liệu mẫu Inquiries
INSERT INTO `inquiries` (`Id`, `PhongId`, `TieuDePhong`, `SinhVienId`, `SinhVienTen`, `SinhVienSdt`, `ChuTroId`, `TienCoc`, `GhiChu`, `TrangThai`, `NgayTao`) VALUES
  ('inq_1', 'room_1', 'Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân', 'usr_sinhvien', 'Nguyễn Văn Sinh (SV Bách Khoa)', '0912345678', 'usr_chutro', 500000, 'Em muốn hẹn xem phòng vào thứ 7 tuần này lúc 9h sáng được không ạ?', 'ChoXacNhan', '2026-09-23T07:53:06.312Z');

-- Dữ liệu mẫu Appointments
INSERT INTO `appointments` (`Id`, `IdSinhVien`, `IdPhong`, `ThoiGianHen`, `GhiChu`, `TrangThai`, `LyDoTuChoi`, `TieuDePhong`, `DiaChiPhong`, `SinhVienTen`, `SinhVienSdt`, `ChuTroId`, `ChuTroTen`, `ChuTroSdt`, `NgayTao`) VALUES
  ('hen_1790151502696_9560', 'usr_sinhvien', 'room_1', '2026-10-01T14:00:00.000Z', 'Em muốn hẹn xem trực tiếp ạ', 'Đã hủy', 'Chủ trọ bận đột xuất vào khung giờ này', 'Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân', 'Số 88 Trần Đại Nghĩa, Phường Đồng Tâm, Hai Bà Trưng, Hà Nội', 'Nguyễn Văn Sinh (SV Bách Khoa)', '0912345678', 'usr_chutro', 'Trần Thị Bích (Chủ trọ Cầu Giấy)', '0987654321', '2026-09-23T08:18:22.696Z');

-- Dữ liệu mẫu Notifications
INSERT INTO `notifications` (`Id`, `UserId`, `TieuDe`, `NoiDung`, `Loai`, `TrangThai`, `NgayTao`) VALUES
  ('tb_1790151513737_xix2', 'usr_chutro', 'Tin đăng phòng trọ đã được phê duyệt!', 'Tin đăng "Căn hộ 1 ngủ 1 khách hiện đại khu vực ĐH Luật & Học viện Ngoại Giao" của bạn đã được kiểm duyệt và chuyển sang trạng thái "Công khai", sẵn sàng hiển thị trên trang tìm kiếm.', 'PhongTro', 'ChuaDoc', '2026-09-23T08:18:33.737Z'),
  ('tb_1790151508540_4rvr', 'usr_sinhvien', 'Lịch hẹn xem phòng bị từ chối', 'Chủ trọ Trần Thị Bích (Chủ trọ Cầu Giấy) đã từ chối lịch hẹn xem phòng "Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân". Lý do: Chủ trọ bận đột xuất vào khung giờ này', 'LichHen', 'ChuaDoc', '2026-09-23T08:18:28.541Z'),
  ('tb_1790151502714_x3y2', 'usr_chutro', 'Phòng trọ nhận được đánh giá mới!', 'Sinh viên Nguyễn Văn Sinh (SV Bách Khoa) đã gửi đánh giá 5 sao cho phòng "Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân": "Phòng ngủ sạch sẽ, cô chú chủ trọ nhiệt tình hỗ trợ!"', 'PhongTro', 'ChuaDoc', '2026-09-23T08:18:22.714Z');

-- Dữ liệu mẫu Rental Contracts (Hợp đồng thuê phòng xác nhận 2 chiều)
INSERT INTO `rental_contracts` (`id`, `room_id`, `renter_id`, `landlord_id`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
  (1, 'room_1', 'usr_sinhvien', 'usr_chutro', 'active', '2026-09-01 08:00:00', NULL, '2026-09-01 07:30:00', '2026-09-01 08:00:00'),
  (2, 'room_14', 'usr_sinhvien', 'usr_chutro', 'pending_landlord', '2026-10-01 08:00:00', NULL, '2026-09-27 08:00:00', '2026-09-27 08:00:00'),
  (3, 'room_15', 'usr_sinhvien', 'usr_chutro', 'pending_renter', '2026-10-05 08:00:00', NULL, '2026-09-27 09:00:00', '2026-09-27 09:00:00');

-- Dữ liệu mẫu Reviews (Đã xác minh thuê phòng có contract_id)
INSERT INTO `reviews` (`id`, `room_id`, `renter_id`, `contract_id`, `tenNguoiDanhGia`, `truongHoc`, `soSao`, `nhanXet`, `is_verified`, `created_at`) VALUES
  (1, 'room_1', 'usr_sinhvien', 1, 'Nguyễn Văn Sinh (SV Bách Khoa)', 'Sinh viên đã xác minh thuê phòng', 5, 'Phòng ngủ sạch sẽ, cô chú chủ trọ nhiệt tình hỗ trợ! An ninh tốt, khóa vân tay tiện lợi.', 1, '2026-09-23 08:18:22');

