# HostelHub - Nền Tảng Thuê & Quản Lý Phòng Trọ Sinh Viên

**HostelHub** là ứng dụng web kết nối sinh viên và chủ nhà trọ tại các khu vực làng đại học trọng điểm (Hà Nội, TP.HCM...). Hệ thống mang đến trải nghiệm tìm phòng trực tiếp, minh bạch chi phí, bảo mật thông tin và hỗ trợ ví điện tử demo để đặt cọc giữ chỗ an toàn.

---

## 🚀 Hướng Dẫn Đồng Bộ Hóa Lên GitHub & Xuất Bản (Publish)

### 1. Đồng bộ mã nguồn lên GitHub (Sync to GitHub):
Dự án đã được khởi tạo sẵn Git repository cục bộ. Để liên kết và đẩy (push) mã nguồn lên GitHub của bạn:

```bash
# 1. Tạo repository mới trên GitHub (ví dụ: hostelhub-platform)
# 2. Thêm remote origin trỏ đến repository GitHub của bạn:
git remote add origin https://github.com/<tai-khoan-cua-ban>/hostelhub.git

# 3. Đổi tên branch chính thành main (nếu cần) và đẩy code lên:
git branch -M main
git push -u origin main
```

### 2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

### 3. Khởi chạy ứng dụng trong môi trường phát triển (Development):
```bash
npm run dev
```
Ứng dụng sẽ tự động khởi động tại: **`http://localhost:3000`** (Backend Express tích hợp Vite Middleware).

### 4. Kiểm tra Type & Linter:
```bash
npm run lint
```

### 5. Build & Triển khai Production (Vercel / Railway / Docker / VPS):
```bash
# Build mã nguồn Frontend
npm run build

# Khởi chạy server production
npm start
```

- **Triển khai trên Vercel**: Đã có sẵn file cấu hình `vercel.json`. Bạn chỉ cần liên kết repo GitHub vào Vercel, chọn Framework Vite/Node.js, hệ thống sẽ tự động nhận diện REST API tại `/api` và trang đơn SPA.
- **Triển khai trên Railway / Render / VPS**: Dùng lệnh build `npm run build` và start command `npm start`.

---

## 🌟 Các Tính Năng Nổi Bật Vừa Hoàn Thiện

1. **Cơ chế xác minh thuê phòng 2 chiều (2-Way Verification)**:
   - Nút **"Xác nhận thuê phòng / Gửi yêu cầu thuê"** tích hợp trực tiếp trên trang chi tiết phòng trọ (`RoomDetailView`).
   - Hai bên (Sinh viên và Chủ trọ) cùng xác nhận đề xuất thuê phòng để chuyển trạng thái sang **"Đang ở"** (Active).
   - Bảo đảm 100% đánh giá minh bạch, mở khóa quyền viết nhận xét có huy hiệu xác minh **"✔ Người thuê đã xác minh"** chống đánh giá ảo.

2. **Hỗ trợ nhúng Video thực tế phòng trọ (Google Drive & YouTube)**:
   - Cho phép Chủ trọ dán liên kết video quay thực tế từ Google Drive, YouTube hoặc tệp MP4 trực tiếp.
   - Tự động chuyển đổi các đường dẫn Google Drive (`/view?usp=sharing`, `/open?id=...`) sang định dạng trình chiếu nhúng (`/preview`) chuẩn xác, kèm nút mở trực tiếp trên Drive dự phòng.

3. **Quản lý Đặt cọc & Lịch hẹn thông minh**:
   - Khôi phục trạng thái phòng về *"Còn phòng"* ngay khi sinh viên chủ động hủy đơn cọc chưa duyệt.
   - Hoàn trả 100% tiền cọc (500.000 VNĐ) về ví sinh viên ngay lập tức.
   - Cho phép sinh viên đặt cọc lại hoặc cọc phòng khác mà không bị chặn lỗi.

4. **Lịch sử thanh toán & Biến động số dư ví (VietQR 24/7)**:
   - Mục **"Lịch sử thanh toán"** tích hợp đầy đủ trong trang *Lịch sử của tôi* và *Hồ sơ cá nhân*.
   - Ghi nhận chi tiết từng giao dịch: Nạp tiền ví, Đặt cọc giữ phòng, Hoàn tiền cọc, Nhận tiền cọc.
   - Hỗ trợ tạo mã VietQR theo chuẩn Napas 24/7 để nạp tiền nhanh chóng.

5. **Cập nhật hồ sơ định danh không lỗi**:
   - Tự động làm sạch và chuẩn hóa số điện thoại liên hệ (9-11 chữ số, hỗ trợ +84).
   - Đổi mật khẩu an toàn và bảo toàn phiên đăng nhập lâu dài.

---

## 🔑 3 Tài Khoản Mẫu Để Kiểm Thử (Pre-seeded Accounts)

Hệ thống đã tạo sẵn 3 tài khoản mẫu với đầy đủ vai trò để bạn kiểm thử ngay lập tức (hoặc bấm nút **"1-Click Đăng Nhập Mẫu"** trên màn hình Đăng nhập):

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng chính sau khi đăng nhập |
| :--- | :--- | :--- | :--- |
| 🎓 **Sinh viên** | `sinhvien@hostelhub.vn` | `123456` | Tự động chuyển tới **Trang tìm phòng trọ**: lọc theo quận huyện, khoảng giá, diện tích; gửi lời hẹn xem phòng hoặc đặt cọc giữ chỗ từ số dư ví (2.000.000 VNĐ). |
| 🏢 **Chủ trọ** | `chutro@hostelhub.vn` | `123456` | Tự động chuyển tới **Trang quản lý phòng của tôi**: đăng phòng mới, chỉnh sửa thông tin, bật/tắt trạng thái *Còn phòng* / *Đã thuê*, duyệt/từ chối sinh viên liên hệ. |
| ⚡ **Quản trị viên (Admin)** | `admin@hostelhub.vn` | `admin123` | Tự động chuyển tới **Trang quản trị (Dashboard)**: thống kê toàn hệ thống, quản lý danh sách người dùng, khóa/mở khóa tài khoản, kiểm duyệt phòng trọ. |

---

## 📋 Cấu Trúc Dự Án & Các Tính Năng Đã Xây Dựng

### 1. Kiến trúc hệ thống
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, font chữ `Plus Jakarta Sans`, thiết kế responsive trên mobile & desktop với tông màu xanh dương - trắng hiện đại, bo góc mềm mại (`rounded-xl`, `rounded-2xl`), shadow nhẹ thanh lịch.
- **Backend**: Node.js + Express (`server.ts` tích hợp `vite.middlewares`), cung cấp đầy đủ RESTful API `/api/auth/*`, `/api/rooms/*`, `/api/inquiries/*`, `/api/admin/*`.
- **Database**: Dữ liệu lưu trữ bền vững tại file JSON `data/database.json`, mật khẩu được mã hóa an toàn bằng thuật toán **bcrypt** (salt rounds = 10).

### 2. Thực hiện đầy đủ 6 yêu cầu đề ra:
1. **Bảng NguoiDung**:
   - Trường dữ liệu: `Id`, `HoTen`, `Email`, `MatKhau` (đã hash bcrypt), `Sdt`, `VaiTro` (`SinhVien` / `ChuTro` / `Admin`), `soDuVi` (mặc định khởi tạo 2.000.000 VNĐ).
2. **Trang Đăng Ký**:
   - Cho phép chọn vai trò: **Sinh viên** hoặc **Chủ trọ**.
   - Khóa đăng ký vai trò **Admin** ngoài giao diện công khai (chỉ cấp nội bộ theo yêu cầu).
   - Kiểm tra trùng lặp email, kiểm tra số điện thoại (9-11 chữ số), mật khẩu tối thiểu 6 ký tự và xác nhận mật khẩu.
3. **Trang Đăng Nhập**:
   - Validate định dạng email và mật khẩu, hiển thị thông báo lỗi chi tiết nếu sai email hoặc sai mật khẩu.
   - Hỗ trợ nút đăng nhập nhanh 1-click cho cả 3 tài khoản mẫu để test nhanh chóng.
4. **Điều hướng chính xác theo vai trò sau đăng nhập**:
   - Sinh viên ➔ Trang tìm phòng trọ sinh viên.
   - Chủ trọ ➔ Trang quản lý phòng của tôi.
   - Admin ➔ Trang tổng quan và quản trị hệ thống.
5. **Session/Token quản lý phiên làm việc**:
   - Token xác thực lưu tại `localStorage` và đồng bộ qua API `GET /api/auth/me`.
   - Giữ trạng thái đăng nhập khi tải lại trang, tự động điều hướng đúng quyền hạn.
6. **Trang Cập Nhật Thông Tin Cá Nhân**:
   - Cập nhật Họ và tên, Số điện thoại / Zalo liên hệ.
   - Hiển thị ví điện tử HostelHub với số dư demo 2.000.000 VNĐ, có nút nạp tiền trải nghiệm nhanh (+500k, +1tr).
   - Hỗ trợ form đổi mật khẩu an toàn (xác thực mật khẩu hiện tại).
