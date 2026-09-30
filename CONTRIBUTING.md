# Quy định làm việc nhóm (HostelHub)

## 1. Quy ước đặt tên nhánh
- `feature/<so-issue>-<mo-ta>`: Tính năng mới
- `bugfix/<so-issue>-<mo-ta>`: Sửa lỗi
- `chore/<mo-ta>`: Cấu hình hệ thống, thư viện
- `docs/<mo-ta>`: Cập nhật tài liệu

## 2. Quy ước commit message
- Cú pháp: `<type>(<scope>): <mô tả ngắn gọn>`
- Ví dụ:
  - `feat(room): thêm chức năng lọc phòng`
  - `fix(auth): sửa lỗi token hết hạn`

## 3. Quy trình Pull Request
- Mọi thay đổi đều phải tạo nhánh riêng và mở PR vào `main`.
- Cần ít nhất 1 người review (Approve) và CI chạy xanh mới được merge.
- Chọn **Squash and merge** khi gộp vào `main`.
