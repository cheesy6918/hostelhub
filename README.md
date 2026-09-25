# HostelHub - Nền Tảng Thuê & Quản Lý Phòng Trọ Sinh Viên

**HostelHub** là ứng dụng web kết nối sinh viên và chủ nhà trọ tại các khu vực làng đại học trọng điểm (Hà Nội, TP.HCM...). Hệ thống mang đến trải nghiệm tìm phòng trực tiếp, minh bạch chi phí, bảo mật thông tin và hỗ trợ ví điện tử demo để đặt cọc giữ chỗ an toàn.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### 1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy ứng dụng (Backend Express + Frontend Vite):
```bash
npm run dev
```

Ứng dụng sẽ tự động khởi động tại: **`http://localhost:3000`**

### 3. Build cho môi trường production:
```bash
npm run build
npm start
```

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
