import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface NguoiDung {
  Id: string;
  HoTen: string;
  Email: string;
  MatKhau: string; // hashed
  Sdt: string;
  VaiTro: 'SinhVien' | 'ChuTro' | 'Admin';
  soDuVi: number;
  NgayTao: string;
  TrangThai: 'HoatDong' | 'BiKhoa';
}

export type TrangThaiPhong = 'Còn phòng' | 'Công khai' | 'Hết phòng' | 'Chờ duyệt' | 'Chờ chủ trọ xác nhận cọc' | 'Đã cọc' | 'Từ chối';

export type TrangThaiLichHen = 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy';
export type TrangThaiDatCoc = 'Chờ xác nhận' | 'Đã tiếp nhận thành công' | 'Đã xác nhận' | 'Đã hủy';

export interface ThongBao {
  Id: string;
  UserId: string;
  TieuDe: string;
  NoiDung: string;
  Loai: 'LichHen' | 'DatCoc' | 'PhongTro' | 'HeThong';
  TrangThai: 'ChuaDoc' | 'DaDoc';
  NgayTao: string;
}

export interface LichHen {
  Id: string;
  IdSinhVien: string;
  IdPhong: string;
  ThoiGianHen: string; // ISO string hoặc định dạng thời gian
  GhiChu: string;
  TrangThai: TrangThaiLichHen; // 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy'
  LyDoTuChoi?: string;
  TieuDePhong?: string;
  DiaChiPhong?: string;
  SinhVienTen?: string;
  SinhVienSdt?: string;
  ChuTroId?: string;
  ChuTroTen?: string;
  ChuTroSdt?: string;
  NgayTao?: string;
}

export interface DatCoc {
  Id: string;
  IdSinhVien: string;
  IdPhong: string;
  SoTienCoc: number; // Mặc định 500.000 VNĐ
  NgayCoc: string;
  TrangThaiCoc: TrangThaiDatCoc; // 'Chờ xác nhận' | 'Đã tiếp nhận thành công' | 'Đã xác nhận' | 'Đã hủy'
  LyDoTuChoi?: string;
  TieuDePhong?: string;
  DiaChiPhong?: string;
  SinhVienTen?: string;
  SinhVienSdt?: string;
  ChuTroId?: string;
  ChuTroTen?: string;
  ThoiHanGiuCho?: string; // Mặc định 48 giờ
  NgayTao?: string;
}

export interface ReviewItem {
  id?: string;
  tenNguoiDanhGia: string;
  truongHoc: string;
  soSao: number;
  nhanXet: string;
  ngay: string;
}

export interface PhongTro {
  Id: string;
  TieuDe: string;
  DiaChi: string;
  QuanHuyen: string;
  GiaThue: number; // VNĐ / tháng
  GiaDien: string; // VD: "3.800 đ/kWh"
  GiaNuoc: string; // VD: "30.000 đ/khối" hoặc "100.000 đ/người/tháng"
  TienIch: string[]; // Mảng: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', ...]
  TrangThai: TrangThaiPhong; // 'Còn phòng' | 'Công khai' | 'Hết phòng' | 'Chờ duyệt' | 'Đã cọc' | 'Từ chối'
  LyDoTuChoi?: string;
  IdChuTro: string;
  ChuTroId?: string; // alias
  ChuTroTen: string;
  ChuTroSdt: string;
  HinhAnh: string[]; // Mảng URL / ảnh mẫu
  MoTa: string;
  NoiQuy: string;
  DienTich: number; // m2
  LoaiPhong?: 'GacLung' | 'Studio' | 'KyTucXa' | 'ChungCuMini';
  NgayDang?: string;
  DanhGia?: ReviewItem[];
}

export interface YeuCauLienHe {
  Id: string;
  PhongId: string;
  TieuDePhong: string;
  SinhVienId: string;
  SinhVienTen: string;
  SinhVienSdt: string;
  ChuTroId: string;
  TienCoc: number;
  GhiChu: string;
  TrangThai: 'ChoXacNhan' | 'DaDuyet' | 'TuChoi';
  NgayTao: string;
}

export interface FavoriteItem {
  Id: string;
  UserId: string;
  PhongId: string;
  NgayTao: string;
}

export interface DatabaseSchema {
  users: NguoiDung[];
  rooms: PhongTro[];
  inquiries: YeuCauLienHe[];
  appointments: LichHen[];
  deposits: DatCoc[];
  notifications: ThongBao[];
  favorites: FavoriteItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const hashPass123456 = bcrypt.hashSync('123456', salt);
  const hashPassAdmin = bcrypt.hashSync('admin123', salt);

  const now = new Date().toISOString();

  const users: NguoiDung[] = [
    {
      Id: 'usr_admin',
      HoTen: 'Quản Trị Viên HostelHub',
      Email: 'admin@hostelhub.vn',
      MatKhau: hashPassAdmin,
      Sdt: '0909998888',
      VaiTro: 'Admin',
      soDuVi: 2000000,
      NgayTao: now,
      TrangThai: 'HoatDong',
    },
    {
      Id: 'usr_chutro',
      HoTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      Email: 'chutro@hostelhub.vn',
      MatKhau: hashPass123456,
      Sdt: '0987654321',
      VaiTro: 'ChuTro',
      soDuVi: 2000000,
      NgayTao: now,
      TrangThai: 'HoatDong',
    },
    {
      Id: 'usr_sinhvien',
      HoTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      Email: 'sinhvien@hostelhub.vn',
      MatKhau: hashPass123456,
      Sdt: '0912345678',
      VaiTro: 'SinhVien',
      soDuVi: 2000000,
      NgayTao: now,
      TrangThai: 'HoatDong',
    },
  ];

  // 10 sample rooms with diverse prices from 1.000.000 to 4.000.000 VNĐ
  const rooms: PhongTro[] = [
    {
      Id: 'room_1',
      TieuDe: 'Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân',
      DiaChi: 'Số 88 Trần Đại Nghĩa, Phường Đồng Tâm',
      QuanHuyen: 'Hai Bà Trưng, Hà Nội',
      GiaThue: 1200000,
      GiaDien: 'Miễn phí (bao trọn gói tiền phòng)',
      GiaNuoc: 'Miễn phí (nước sinh hoạt + nước lọc RO)',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Giờ tự do', 'Wifi', 'Dọn phòng', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Mô hình ký túc xá capsule / sleepbox riêng tư, nệm cao su non êm ái, rèm kéo cách âm tốt, đèn học và ổ sạc type-C riêng biệt. Khu sinh hoạt chung rộng rãi, bếp từ đôi nấu ăn thoải mái, máy giặt sấy công nghiệp dùng miễn phí.',
      NoiQuy: '1. Giữ trật tự chung sau 23:00, không nói chuyện lớn tiếng trong buồng ngủ.\n2. Vệ sinh sạch sẽ khu vực bếp và bồn rửa sau khi nấu nướng.\n3. Khóa cửa vân tay bảo mật cẩn thận khi ra vào.\n4. Tuyệt đối không hút thuốc lá trong phòng kín.',
      DienTich: 12,
      LoaiPhong: 'KyTucXa',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Hoàng Nhật Minh',
          truongHoc: 'Đại học Kinh Tế Quốc Dân',
          soSao: 5,
          nhanXet: 'Phòng sạch sẽ, điều hòa mát rượi cả ngày. Bác chủ trọ dễ tính hỗ trợ sinh viên rất chu đáo.',
          ngay: '15/09/2026',
        },
        {
          tenNguoiDanhGia: 'Nguyễn Thùy Linh',
          truongHoc: 'Đại học Bách Khoa Hà Nội',
          soSao: 5,
          nhanXet: 'Giá 1.2tr mà bao cả điện nước điều hòa là quá hời cho sinh viên. Rất yên tĩnh để ôn thi.',
          ngay: '02/09/2026',
        },
      ],
    },
    {
      Id: 'room_2',
      TieuDe: 'Phòng trọ sinh viên giá rẻ, an ninh tốt gần ĐH Công Nghiệp Hà Nội',
      DiaChi: 'Ngõ 29/8 Đường Cầu Diễn, Phường Phúc Diễn',
      QuanHuyen: 'Bắc Từ Liêm, Hà Nội',
      GiaThue: 1500000,
      GiaDien: '3.500 đ/kWh (đồng hồ riêng từng phòng)',
      GiaNuoc: '80.000 đ/người/tháng',
      TienIch: ['Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Wifi', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng trọ tầng 2 thoáng mát có cửa sổ trời, bồn rửa mặt và vệ sinh khép kín trong phòng. Có sân để xe rộng rãi dưới tầng 1 có camera giám sát 24/7. Cách cổng trường ĐH Công Nghiệp chỉ 500m đi bộ.',
      NoiQuy: '1. Tự do giờ giấc nhưng không đưa người lạ vào qua đêm khi chưa báo quản lý.\n2. Để xe ngay ngắn đúng vị trí phân chia tầng 1.\n3. Đổ rác đúng giờ quy định trước 19h hàng ngày.',
      DienTich: 18,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Phạm Đức Anh',
          truongHoc: 'Đại học Công Nghiệp Hà Nội',
          soSao: 4,
          nhanXet: 'Phòng rộng rãi, gần chợ sinh viên Nhổn đồ ăn rẻ. Điện nước tính theo công tơ rõ ràng.',
          ngay: '10/08/2026',
        },
      ],
    },
    {
      Id: 'room_3',
      TieuDe: 'Phòng khép kín sạch đẹp khu Chùa Láng, gần ĐH Ngoại Thương & Ngoại Giao',
      DiaChi: 'Số 45 Ngách 185 Chùa Láng, Phường Láng Thượng',
      QuanHuyen: 'Đống Đa, Hà Nội',
      GiaThue: 1800000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '100.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Wifi', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng nằm trong ngõ yên tĩnh, an ninh cực tốt, hàng xóm toàn sinh viên Ngoại Thương và Ngoại Giao văn minh. Có ban công phơi đồ thoáng gió, bình nóng lạnh mới lắp, có điều hòa làm lạnh nhanh.',
      NoiQuy: '1. Không tụ tập nhậu nhẹt, không gây mất an ninh trật tự khu phố.\n2. Khóa cổng cẩn thận khi đi về sau 23h.\n3. Tiết kiệm điện nước chung.',
      DienTich: 20,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Lê Thảo Trang',
          truongHoc: 'Đại học Ngoại Thương',
          soSao: 5,
          nhanXet: 'Vị trí siêu đỉnh, đi bộ 3 phút sang FTU. Phòng sạch và thoáng gió tự nhiên.',
          ngay: '20/08/2026',
        },
      ],
    },
    {
      Id: 'room_4',
      TieuDe: 'Phòng gác lửng sinh viên cao ráo, gần ĐH Sư Phạm - ĐHQG Hà Nội',
      DiaChi: 'Số 16 Ngõ 199 Trần Quốc Hoàn, Phường Dịch Vọng Hậu',
      QuanHuyen: 'Cầu Giấy, Hà Nội',
      GiaThue: 2200000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Thiết kế gác lửng bê tông kiên cố, cầu thang gỗ có tay vịn an toàn. Tầng dưới làm phòng khách & góc học tập, gác trên đặt đệm ngủ riêng tư. Có kệ bếp và chậu rửa inox tiện nấu ăn.',
      NoiQuy: '1. Không đóng đinh khoan tường làm hỏng kết cấu gác lửng.\n2. Nấu ăn dùng bếp từ/bếp hồng ngoại, không sử dụng bình gas mini nguy hiểm.\n3. Vệ sinh phòng ốc gọn gàng.',
      DienTich: 22,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Trần Văn Quyết',
          truongHoc: 'Đại học Quốc Gia Hà Nội',
          soSao: 5,
          nhanXet: 'Gác xịn lắm, mình cao 1m75 đứng trên gác không hề bị đụng đầu, quạt và điều hòa phả đều khắp phòng.',
          ngay: '18/08/2026',
        },
      ],
    },
    {
      Id: 'room_5',
      TieuDe: 'Phòng trọ gác đúc cao cấp, kệ bếp riêng sát cổng ĐH Bách Khoa & Xây Dựng',
      DiaChi: 'Số 18 Ngõ 204 Tạ Quang Bửu, Phường Bách Khoa',
      QuanHuyen: 'Hai Bà Trưng, Hà Nội',
      GiaThue: 2600000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Khóa vân tay', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng mới xây sửa mới 100%, sơn tường trắng tinh tươm. Vệ sinh khép kín ốp gạch men cao cấp, vòi hoa sen tăng áp, gương led. Có khóa cửa vân tay từng phòng, camera hành lang giám sát đảm bảo an ninh tuyệt đối.',
      NoiQuy: '1. Giữ gìn an ninh trật tự chung khu ký túc xá Bách Khoa.\n2. Phân loại rác hữu cơ và vô cơ trước khi bỏ vào thùng rác chung.\n3. Thanh toán tiền phòng đúng hẹn từ mùng 1 đến mùng 5 hàng tháng.',
      DienTich: 25,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Vũ Quốc Huy',
          truongHoc: 'Đại học Bách Khoa Hà Nội',
          soSao: 5,
          nhanXet: 'Ở đây năm thứ hai rồi rất ưng, ra cổng Ký túc xá Bách Khoa ăn cơm sinh viên siêu tiện.',
          ngay: '05/09/2026',
        },
      ],
    },
    {
      Id: 'room_6',
      TieuDe: 'Studio mini ban công thoáng ngập nắng, gần ĐH Y Hà Nội & Học Viện Ngân Hàng',
      DiaChi: 'Số 12 Ngõ 10 Tôn Thất Tùng, Phường Khương Thượng',
      QuanHuyen: 'Đống Đa, Hà Nội',
      GiaThue: 2900000,
      GiaDien: '4.000 đ/kWh',
      GiaNuoc: '100.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Tủ lạnh', 'Ban công', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn studio cực xinh xắn có ban công riêng nhìn ra cây xanh thoáng mát, đã trang bị sẵn tủ lạnh 150L, tủ quần áo 2 cánh và bàn học đôi. Thích hợp cho 1-2 sinh viên trường Y cần không gian yên tĩnh học bài.',
      NoiQuy: '1. Không làm ồn đêm khuya để các bạn sinh viên y khoa tập trung ôn thi lâm sàng.\n2. Tưới cây chăm sóc ban công định kỳ.\n3. Khóa cổng an toàn khi về khuya.',
      DienTich: 26,
      LoaiPhong: 'Studio',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Bích Ngọc',
          truongHoc: 'Đại học Y Hà Nội',
          soSao: 5,
          nhanXet: 'Ban công nhiều nắng trồng cây rất thích. Phòng yên tĩnh, chủ nhà thân thiện.',
          ngay: '12/08/2026',
        },
      ],
    },
    {
      Id: 'room_7',
      TieuDe: 'Chung cư mini có thang máy, full đồ gần Học viện Tài Chính & Mỏ Địa Chất',
      DiaChi: 'Ngõ 52 Tân Nhuệ, Phường Cổ Nhuế 2',
      QuanHuyen: 'Bắc Từ Liêm, Hà Nội',
      GiaThue: 3200000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '35.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Máy giặt', 'Tủ lạnh', 'Thang máy', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Tòa nhà CCMN 7 tầng có thang máy thẻ từ, máy giặt riêng lắp ngay logia ban công. Đầy đủ bếp từ đôi âm mặt đá hoa cương, giường 1m6 x 2m và đệm lò xo cao cấp. Internet cáp quang tốc độ cao mỗi tầng 1 router.',
      NoiQuy: '1. Sử dụng thang máy văn minh, không giữ nút bấm quá lâu.\n2. Phơi đồ đúng khu vực quy định trên logia.\n3. Đóng tiền điện nước và dịch vụ vệ sinh đúng hạn.',
      DienTich: 28,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Đặng Tuấn Kiệt',
          truongHoc: 'Học viện Tài Chính',
          soSao: 5,
          nhanXet: 'Tòa nhà mới đẹp, thang máy chạy êm ru, có máy giặt riêng đỡ phải tranh nhau giặt đồ.',
          ngay: '22/07/2026',
        },
      ],
    },
    {
      Id: 'room_8',
      TieuDe: 'Studio cao cấp full nội thất phong cách Hàn Quốc sát ĐH Quốc Gia HN',
      DiaChi: 'Số 130 Xuân Thủy, Phường Dịch Vọng Hậu',
      QuanHuyen: 'Cầu Giấy, Hà Nội',
      GiaThue: 3500000,
      GiaDien: '4.000 đ/kWh',
      GiaNuoc: '100.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Máy giặt', 'Tủ lạnh', 'Gác lửng', 'Thang máy', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn hộ dịch vụ cao cấp dành cho sinh viên và chuyên gia trẻ, thiết kế tông màu gỗ sồi ấm cúng phong cách Hàn Quốc. Có sofa tiếp khách, tivi thông minh, máy hút mùi bếp và tủ quần áo kịch trần sang trọng.',
      NoiQuy: '1. Không mang chất dễ cháy nổ vào căn hộ.\n2. Giữ gìn nguyên vẹn nội thất cao cấp của phòng.\n3. Hút thuốc vui lòng ra ngoài ban công thoáng khí.',
      DienTich: 32,
      LoaiPhong: 'Studio',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Hải Đăng',
          truongHoc: 'ĐH Ngoại Ngữ - ĐHQGHN',
          soSao: 5,
          nhanXet: 'Phòng đẹp y như ảnh, nội thất xịn sò thơm tho. Rất đáng giá tiền bỏ ra.',
          ngay: '30/08/2026',
        },
      ],
    },
    {
      Id: 'room_9',
      TieuDe: 'Căn hộ 1 ngủ 1 khách hiện đại khu vực ĐH Luật & Học viện Ngoại Giao',
      DiaChi: 'Ngõ 91 Nguyễn Chí Thanh, Phường Láng Hạ',
      QuanHuyen: 'Đống Đa, Hà Nội',
      GiaThue: 3800000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Máy giặt', 'Tủ lạnh', 'Ban công', 'Wifi'],
      TrangThai: 'Hết phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn hộ riêng biệt gồm phòng khách liền bếp và 1 phòng ngủ độc lập có cửa sổ lớn. Ban công riêng phơi đồ ngắm thành phố. Thích hợp nhóm bạn 2-3 sinh viên chia tiền ở cùng nhau rất tiết kiệm.',
      NoiQuy: '1. Giữ trật tự khu chung cư sau 22:30.\n2. Bảo quản khóa cửa và chìa cơ dự phòng.\n3. Không nuôi chó mèo phóng uế hành lang.',
      DienTich: 35,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Trần Mai Phương',
          truongHoc: 'Đại học Luật Hà Nội',
          soSao: 5,
          nhanXet: 'Phòng chia 1 khách 1 ngủ riêng biệt rất riêng tư, bọn mình 2 đứa ở thoải mái.',
          ngay: '15/07/2026',
        },
      ],
    },
    {
      Id: 'room_10',
      TieuDe: 'Căn hộ mini duplex tầng cao view hồ Triều Khúc, gần ĐH Hà Nội & KHXH&NV',
      DiaChi: 'Số 68 Phố Triều Khúc, Phường Thanh Xuân Nam',
      QuanHuyen: 'Thanh Xuân, Hà Nội',
      GiaThue: 4000000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '35.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Máy giặt', 'Tủ lạnh', 'Khóa vân tay', 'Thang máy'],
      TrangThai: 'Chờ duyệt',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn hộ duplex trần cao 4.2m view thẳng hồ Triều Khúc lộng gió. Thiết kế thời thượng với lan can kính cường lực sang trọng, rèm 2 lớp cản sáng 100%. Phù hợp sinh viên thích không gian sống phong cách resort.',
      NoiQuy: '1. Không dán sticker keo dính lên kính cường lực và tường thạch cao.\n2. Giữ gìn an toàn trên khu vực duplex gác cao.\n3. Tuân thủ nội quy phòng cháy chữa cháy của tòa nhà.',
      DienTich: 38,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Thành Trung',
          truongHoc: 'Đại học Hà Nội',
          soSao: 5,
          nhanXet: 'View hồ siêu chill buổi chiều ngắm hoàng hôn, phòng cách âm tốt.',
          ngay: '10/09/2026',
        },
      ],
    },
    {
      Id: 'room_11',
      TieuDe: 'Phòng gác lửng ban công ngập nắng gần ĐH Quốc Gia & Sư Phạm Kỹ Thuật TP.HCM',
      DiaChi: 'Số 15 Đường số 6, Phường Linh Trung',
      QuanHuyen: 'Thủ Đức, TP.HCM',
      GiaThue: 1800000,
      GiaDien: '3.500 đ/kWh',
      GiaNuoc: '25.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Ban công', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng gác lửng đúc kiên cố trần cao 3.8m, ban công lộng gió ngắm khu Làng Đại Học. Gần ngay chợ đêm sinh viên và trạm xe buýt 53, 08.',
      NoiQuy: '1. Không làm ồn sau 23h đêm.\n2. Khóa cổng vân tay khi ra vào.\n3. Giữ vệ sinh hành lang chung.',
      DienTich: 22,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Lê Minh Khang',
          truongHoc: 'ĐH Sư Phạm Kỹ Thuật TP.HCM',
          soSao: 5,
          nhanXet: 'Phòng rất thoáng mát, ban công rộng phơi đồ nhanh khô.',
          ngay: '14/09/2026',
        },
      ],
    },
    {
      Id: 'room_12',
      TieuDe: 'Studio mini khép kín full nội thất gần ĐH Bách Khoa TP.HCM & ĐH Y Dược',
      DiaChi: 'Hẻm 497 Hòa Hảo, Phường 7',
      QuanHuyen: 'Quận 10, TP.HCM',
      GiaThue: 2800000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '100.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Tủ lạnh', 'Máy giặt', 'Wifi', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Studio mini trang bị sẵn máy lạnh Inverter tiết kiệm điện, tủ lạnh 2 cánh, bếp nấu mặt kính và nệm cao su. Không chung chủ, giờ giấc hoàn toàn tự do 24/7.',
      NoiQuy: '1. Không tụ tập nhậu nhẹt cờ bạc.\n2. Để xe ngăn nắp ở tầng hầm.\n3. Tắt điện nước khi ra khỏi phòng.',
      DienTich: 25,
      LoaiPhong: 'Studio',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Thị Cẩm Ly',
          truongHoc: 'ĐH Bách Khoa TP.HCM',
          soSao: 5,
          nhanXet: 'Phòng tiện nghi y như căn hộ nhỏ, đi bộ sang Bách Khoa cơ sở 1 chỉ 5 phút.',
          ngay: '18/09/2026',
        },
      ],
    },
    {
      Id: 'room_13',
      TieuDe: 'Phòng trọ sinh viên giá rẻ cách cổng ĐH Giao Thông Vận Tải 300m',
      DiaChi: 'Ngõ 102 Cầu Giấy, Phường Quan Hoa',
      QuanHuyen: 'Cầu Giấy, Hà Nội',
      GiaThue: 1300000,
      GiaDien: '3.500 đ/kWh',
      GiaNuoc: '70.000 đ/người/tháng',
      TienIch: ['Nóng lạnh', 'Vệ sinh riêng', 'Wifi', 'Giờ tự do', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng trọ tầng 1 cao ráo không ngập nước, có chỗ để xe máy an toàn trong nhà. Gần trạm xe buýt Cầu Giấy và ga đường sắt trên cao.',
      NoiQuy: '1. Khóa cửa cổng khi đi sau 23h.\n2. Vệ sinh chung khu để xe.\n3. Tiết kiệm điện nước.',
      DienTich: 16,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Đỗ Hữu Thắng',
          truongHoc: 'ĐH Giao Thông Vận Tải',
          soSao: 4,
          nhanXet: 'Giá rẻ phù hợp túi tiền sinh viên năm nhất, đi bộ ra trường cực tiện.',
          ngay: '08/09/2026',
        },
      ],
    },
    {
      Id: 'room_14',
      TieuDe: 'Chung cư mini cao cấp có thang máy gần ĐH Thủy Lợi & ĐH Công Đoàn',
      DiaChi: 'Số 25 Ngõ 167 Tây Sơn, Phường Quang Trung',
      QuanHuyen: 'Đống Đa, Hà Nội',
      GiaThue: 3400000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Máy giặt', 'Tủ lạnh', 'Thang máy', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Tòa nhà mới bàn giao, thang máy Mitsubishi êm ái, cửa thẻ từ chống trộm. Phòng trang bị trọn bộ giường tủ cao cấp, máy giặt riêng trên ban công.',
      NoiQuy: '1. Không gây ồn ào hành lang.\n2. Phân loại rác thải.\n3. Đóng tiền phòng đúng kỳ hạn.',
      DienTich: 28,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Phan Bảo Trâm',
          truongHoc: 'ĐH Thủy Lợi',
          soSao: 5,
          nhanXet: 'Tòa nhà văn minh, bảo vệ trực 24/7 an tâm học tập.',
          ngay: '12/09/2026',
        },
      ],
    },
    {
      Id: 'room_15',
      TieuDe: 'Phòng gác đúc kiên cố, khóa vân tay gần ĐH Tôn Đức Thắng & RMIT',
      DiaChi: 'Số 82 Đường số 9, KDC Him Lam, Phường Tân Hưng',
      QuanHuyen: 'Quận 7, TP.HCM',
      GiaThue: 2300000,
      GiaDien: '3.500 đ/kWh',
      GiaNuoc: '80.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Khóa vân tay', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Gác đúc bê tông cao ráo không đụng đầu, gạch men sáng bóng. Khu dân cư Him Lam an ninh bậc nhất, nhiều quán ăn và siêu thị tiện lợi.',
      NoiQuy: '1. Không dắt người lạ ngủ qua đêm không báo trước.\n2. Để xe đúng ô vạch kẻ.\n3. Giữ trật tự ban đêm.',
      DienTich: 24,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Huỳnh Gia Huy',
          truongHoc: 'ĐH Tôn Đức Thắng',
          soSao: 5,
          nhanXet: 'Gần TDTU chạy xe máy 3 phút tới cổng trường, phòng mát mẻ.',
          ngay: '16/09/2026',
        },
      ],
    },
    {
      Id: 'room_16',
      TieuDe: 'Sleepbox cao cấp có điều hòa riêng gần ĐH Sân Khấu Điện Ảnh & ĐH Mở',
      DiaChi: 'Ngõ 12 Hồ Tùng Mậu, Phường Mai Dịch',
      QuanHuyen: 'Cầu Giấy, Hà Nội',
      GiaThue: 1100000,
      GiaDien: 'Miễn phí (bao trọn gói)',
      GiaNuoc: 'Miễn phí (bao trọn gói)',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Giờ tự do', 'Wifi', 'Dọn phòng', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Buồng ngủ capsule riêng tư, rèm kéo cách âm, ổ cắm sạc type-C và đèn led đọc sách. Có máy giặt sấy tự động và bếp từ đôi chung.',
      NoiQuy: '1. Đi nhẹ nói khẽ sau 22h30.\n2. Không ăn uống trong buồng ngủ.\n3. Giữ gìn vệ sinh chung.',
      DienTich: 10,
      LoaiPhong: 'KyTucXa',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Trần Quốc Bảo',
          truongHoc: 'ĐH Thương Mại',
          soSao: 5,
          nhanXet: 'Giá 1.1tr bao cả điện nước điều hòa là lựa chọn tiết kiệm nhất cho sinh viên.',
          ngay: '21/09/2026',
        },
      ],
    },
    {
      Id: 'room_17',
      TieuDe: 'Phòng khép kín sạch sẽ ngõ rộng gần ĐH Thương Mại & Sân Mỹ Đình',
      DiaChi: 'Số 38 Ngõ 75 Hồ Tùng Mậu, Phường Mai Dịch',
      QuanHuyen: 'Nam Từ Liêm, Hà Nội',
      GiaThue: 1900000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '80.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Wifi', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng khép kín tầng 3 có cửa sổ lớn đón gió mát, kệ bếp bồn rửa inox thuận tiện nấu nướng. Cách trường ĐH Thương Mại chỉ 400m.',
      NoiQuy: '1. Giữ gìn trật tự khu trọ.\n2. Không hút thuốc lá trong phòng.\n3. Khóa cổng cẩn thận.',
      DienTich: 20,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Vũ Mai Anh',
          truongHoc: 'ĐH Thương Mại',
          soSao: 5,
          nhanXet: 'Phòng sạch đẹp, chủ trọ thân thiện nhiệt tình.',
          ngay: '17/09/2026',
        },
      ],
    },
    {
      Id: 'room_18',
      TieuDe: 'Studio Duplex trần cao hiện đại gần ĐH Kiến Trúc & Học viện Bưu Chính',
      DiaChi: 'Số 19 Ngõ 10 Phố Ao Sen, Phường Mộ Lao',
      QuanHuyen: 'Hà Đông, Hà Nội',
      GiaThue: 2700000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Gác lửng', 'Tủ lạnh', 'Khóa vân tay', 'Wifi'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn hộ duplex phố ẩm thực Ao Sen sầm uất, view thoáng, ánh sáng tự nhiên. Thiết kế gác cao đi lại thoải mái, góc học tập decor xinh xắn.',
      NoiQuy: '1. Sử dụng thiết bị điện an toàn.\n2. Đổ rác đúng giờ quy định.\n3. Không làm phiền các phòng bên cạnh.',
      DienTich: 30,
      LoaiPhong: 'GacLung',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Tấn Đạt',
          truongHoc: 'Học viện Bưu Chính Viễn Thông',
          soSao: 5,
          nhanXet: 'Khu Ao Sen đồ ăn nhiều vô kể, phòng đẹp mê ly.',
          ngay: '19/09/2026',
        },
      ],
    },
    {
      Id: 'room_19',
      TieuDe: 'Phòng trọ mới xây ngõ ô tô gần ĐH Khoa Học Tự Nhiên & ĐH Hà Nội',
      DiaChi: 'Số 42 Ngõ 330 Nguyễn Trãi, Phường Thanh Xuân Trung',
      QuanHuyen: 'Thanh Xuân, Hà Nội',
      GiaThue: 2100000,
      GiaDien: '3.800 đ/kWh',
      GiaNuoc: '30.000 đ/khối',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Wifi', 'Khóa vân tay', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng mới xây 100%, thiết bị vệ sinh Inax cao cấp, bình nóng lạnh Ariston, điều hòa Casper 9000BTU mát rượi. Ngõ thông rộng rãi đi bộ ra ga metro Thượng Đình.',
      NoiQuy: '1. Không dán băng dính làm bong sơn tường mới.\n2. Khóa cửa vân tay khi ra vào.\n3. Tiết kiệm điện nước.',
      DienTich: 22,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Lê Hoàng Yến',
          truongHoc: 'ĐH Khoa Học Tự Nhiên',
          soSao: 5,
          nhanXet: 'Phòng mới toanh thơm mùi sơn mới, cửa vân tay bảo mật tốt.',
          ngay: '22/09/2026',
        },
      ],
    },
    {
      Id: 'room_20',
      TieuDe: 'Căn hộ mini ban công thoáng ngập nắng gần ĐH Kinh Tế TP.HCM (UEH)',
      DiaChi: 'Hẻm 142 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu',
      QuanHuyen: 'Quận 3, TP.HCM',
      GiaThue: 3800000,
      GiaDien: '4.000 đ/kWh',
      GiaNuoc: '100.000 đ/người/tháng',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'Thang máy'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Căn hộ mini trung tâm Quận 3 có ban công cây xanh thoáng mát, máy giặt riêng, tủ lạnh side by side nhỏ gọn, giường đệm cao su nhập khẩu.',
      NoiQuy: '1. Không làm ồn đêm khuya.\n2. Chăm sóc cây ban công.\n3. Tuân thủ PCCC.',
      DienTich: 32,
      LoaiPhong: 'Studio',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Đình Phúc',
          truongHoc: 'ĐH Kinh Tế TP.HCM (UEH)',
          soSao: 5,
          nhanXet: 'Vị trí đắc địa ngay trung tâm, đi đâu cũng gần, phòng như khách sạn.',
          ngay: '20/09/2026',
        },
      ],
    },
    {
      Id: 'room_21',
      TieuDe: 'Phòng trọ sinh viên giá mềm gần ĐH Nông Lâm TP.HCM & Làng Đại Học',
      DiaChi: 'Đường số 14, Khu phố 6, Phường Linh Trung',
      QuanHuyen: 'Thủ Đức, TP.HCM',
      GiaThue: 1400000,
      GiaDien: '3.500 đ/kWh',
      GiaNuoc: '60.000 đ/người/tháng',
      TienIch: ['Nóng lạnh', 'Vệ sinh riêng', 'Giờ tự do', 'Wifi', 'Chỗ để xe'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Phòng rộng rãi yên tĩnh, an ninh tốt, gần chợ sinh viên và bến xe buýt. Có sân để xe rộng rãi dưới tầng trệt.',
      NoiQuy: '1. Giữ trật tự khu xóm trọ.\n2. Để xe ngay ngắn.\n3. Đóng tiền trọ đúng hẹn.',
      DienTich: 18,
      LoaiPhong: 'ChungCuMini',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Trần Thị Thu Thảo',
          truongHoc: 'ĐH Nông Lâm TP.HCM',
          soSao: 4,
          nhanXet: 'Phòng trọ giá mềm, bác chủ trọ hiền lành dễ mến.',
          ngay: '11/09/2026',
        },
      ],
    },
    {
      Id: 'room_22',
      TieuDe: 'Ký túc xá cao cấp bao trọn gói điện nước sát ĐH Bách Khoa Hà Nội',
      DiaChi: 'Số 10 Ngõ 30 Tạ Quang Bửu, Phường Bách Khoa',
      QuanHuyen: 'Hai Bà Trưng, Hà Nội',
      GiaThue: 1250000,
      GiaDien: 'Miễn phí (bao trọn gói)',
      GiaNuoc: 'Miễn phí (bao trọn gói)',
      TienIch: ['Điều hòa', 'Nóng lạnh', 'Giờ tự do', 'Wifi', 'Dọn phòng', 'Khóa vân tay'],
      TrangThai: 'Còn phòng',
      IdChuTro: 'usr_chutro',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      HinhAnh: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      ],
      MoTa: 'Mô hình ký túc xá hiện đại cho sinh viên Bách Khoa, Xây Dựng, Kinh Tế. Giường tầng gỗ chắc chắn, tủ đồ cá nhân có khóa riêng, có người dọn vệ sinh hàng ngày.',
      NoiQuy: '1. Không gây ồn sau 23h.\n2. Giữ vệ sinh khu bếp và nhà tắm.\n3. Khóa cửa vân tay cẩn thận.',
      DienTich: 14,
      LoaiPhong: 'KyTucXa',
      NgayDang: now,
      DanhGia: [
        {
          tenNguoiDanhGia: 'Nguyễn Trọng Nhân',
          truongHoc: 'ĐH Xây Dựng Hà Nội',
          soSao: 5,
          nhanXet: 'Rất tiện cho sinh viên, bạn bè cùng phòng hòa đồng vui vẻ.',
          ngay: '15/09/2026',
        },
      ],
    },
  ];

  const inquiries: YeuCauLienHe[] = [
    {
      Id: 'inq_1',
      PhongId: 'room_1',
      TieuDePhong: 'Ký túc xá Sleepbox thông minh cao cấp, sát ĐH Kinh Tế Quốc Dân',
      SinhVienId: 'usr_sinhvien',
      SinhVienTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      SinhVienSdt: '0912345678',
      ChuTroId: 'usr_chutro',
      TienCoc: 500000,
      GhiChu: 'Em muốn hẹn xem phòng vào thứ 7 tuần này lúc 9h sáng được không ạ?',
      TrangThai: 'ChoXacNhan',
      NgayTao: now,
    },
  ];

  const appointments: LichHen[] = [
    {
      Id: 'hen_1',
      IdSinhVien: 'usr_sinhvien',
      IdPhong: 'room_2',
      ThoiGianHen: new Date(Date.now() + 86400000 * 2).toISOString(),
      GhiChu: 'Em muốn qua xem phòng vào chiều thứ 7, có bạn cùng phòng đi cùng xem ạ.',
      TrangThai: 'Chờ xác nhận',
      TieuDePhong: 'Phòng trọ gác lửng đúc cao ráo, ngõ 204 Tạ Quang Bửu',
      DiaChiPhong: 'Số 18 Ngõ 204 Tạ Quang Bửu, Phường Bách Khoa, Hai Bà Trưng, Hà Nội',
      SinhVienTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      SinhVienSdt: '0912345678',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      NgayTao: now,
    },
    {
      Id: 'hen_2',
      IdSinhVien: 'usr_sinhvien',
      IdPhong: 'room_3',
      ThoiGianHen: new Date(Date.now() - 86400000 * 3).toISOString(),
      GhiChu: 'Hẹn xem phòng buổi sáng',
      TrangThai: 'Đã xác nhận',
      TieuDePhong: 'Căn hộ mini Studio ban công thoáng sáng gần ĐH Quốc Gia Hà Nội',
      DiaChiPhong: 'Số 45 Ngõ 165 Cầu Giấy, Cầu Giấy, Hà Nội',
      SinhVienTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      SinhVienSdt: '0912345678',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ChuTroSdt: '0987654321',
      NgayTao: now,
    },
  ];

  const deposits: DatCoc[] = [
    {
      Id: 'coc_1',
      IdSinhVien: 'usr_sinhvien',
      IdPhong: 'room_4',
      SoTienCoc: 500000,
      NgayCoc: now,
      TrangThaiCoc: 'Chờ xác nhận',
      TieuDePhong: 'Phòng trọ giá rẻ cho sinh viên năm nhất, cạnh ĐH Giao Thông Vận Tải',
      DiaChiPhong: 'Số 12 Ngách 38 Ngõ Chùa Láng, Đống Đa, Hà Nội',
      SinhVienTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      SinhVienSdt: '0912345678',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ThoiHanGiuCho: '48 giờ sau khi chủ trọ xác nhận',
      NgayTao: now,
    },
    {
      Id: 'coc_2',
      IdSinhVien: 'usr_sinhvien',
      IdPhong: 'room_5',
      SoTienCoc: 500000,
      NgayCoc: new Date(Date.now() - 86400000 * 8).toISOString(),
      TrangThaiCoc: 'Đã xác nhận',
      TieuDePhong: 'Studio full nội thất cao cấp sát ĐH Ngoại Thương & Ngoại Giao',
      DiaChiPhong: 'Số 9 Ngõ 91 Chùa Láng, Đống Đa, Hà Nội',
      SinhVienTen: 'Nguyễn Văn Sinh (SV Bách Khoa)',
      SinhVienSdt: '0912345678',
      ChuTroId: 'usr_chutro',
      ChuTroTen: 'Trần Thị Bích (Chủ trọ Cầu Giấy)',
      ThoiHanGiuCho: '48 giờ',
      NgayTao: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];

  const notifications: ThongBao[] = [
    {
      Id: 'tb_1',
      UserId: 'usr_sinhvien',
      TieuDe: 'Chào mừng bạn đến với HostelHub!',
      NoiDung: 'Bạn đã đăng ký thành công tài khoản Sinh viên với số dư ví demo 2.000.000 VNĐ để thử nghiệm đặt cọc & hẹn xem phòng an toàn.',
      Loai: 'HeThong',
      TrangThai: 'ChuaDoc',
      NgayTao: now,
    },
  ];

  const favorites: FavoriteItem[] = [
    {
      Id: 'fav_1',
      UserId: 'usr_sinhvien',
      PhongId: 'room_1',
      NgayTao: now,
    },
  ];

  return { users, rooms, inquiries, appointments, deposits, notifications, favorites };
}

export function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    writeDb(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.deposits) parsed.deposits = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.favorites) parsed.favorites = [];
    return parsed;
  } catch {
    const initial = getInitialData();
    writeDb(initial);
    return initial;
  }
}

export function writeDb(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
