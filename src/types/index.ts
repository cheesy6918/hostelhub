export type VaiTro = 'SinhVien' | 'ChuTro' | 'Admin';

export interface User {
  Id: string;
  HoTen: string;
  Email: string;
  Sdt: string;
  VaiTro: VaiTro;
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
  ThoiGianHen: string;
  GhiChu: string;
  TrangThai: TrangThaiLichHen;
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
  TrangThaiCoc: TrangThaiDatCoc;
  LyDoTuChoi?: string;
  TieuDePhong?: string;
  DiaChiPhong?: string;
  SinhVienTen?: string;
  SinhVienSdt?: string;
  ChuTroId?: string;
  ChuTroTen?: string;
  ThoiHanGiuCho?: string;
  NgayTao?: string;
}

export interface Review {
  id?: string;
  tenNguoiDanhGia: string;
  truongHoc: string;
  soSao: number;
  nhanXet: string;
  ngay: string;
}

export interface FavoriteItem {
  Id: string;
  UserId: string;
  PhongId: string;
  NgayTao: string;
}

export interface Room {
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
  ChuTroId?: string; // alias for backward compatibility
  ChuTroTen: string;
  ChuTroSdt: string;
  HinhAnh: string[]; // Mảng URL / ảnh mẫu
  MoTa: string;
  NoiQuy: string;
  DienTich: number;
  LoaiPhong?: 'GacLung' | 'Studio' | 'KyTucXa' | 'ChungCuMini';
  NgayDang?: string;
  DanhGia?: Review[];
}

export interface Inquiry {
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

export interface AdminStats {
  totalUsers: number;
  sinhVienCount: number;
  chuTroCount: number;
  totalRooms: number;
  availableRooms: number;
  totalInquiries: number;
  totalWallet: number;
  // Specific stats requested
  totalAppointments: number;
  totalDeposits: number;
  successfulDeposits: number;
  depositSuccessRate: number;
  roomsByStatus: {
    'Công khai': number;
    'Còn phòng': number;
    'Chờ duyệt': number;
    'Đã cọc': number;
    'Hết phòng': number;
    'Từ chối': number;
  };
  pendingRoomsCount: number;
  monthlyAppointments?: {
    labels: string[];
    data: number[];
  };
  depositStats?: {
    total: number;
    successful: number;
    pending: number;
    cancelled: number;
    successRate: number;
    totalDepositMoney: number;
  };
}
