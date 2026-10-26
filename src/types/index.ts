export type VaiTro = 'SinhVien' | 'ChuTro' | 'Admin';

export interface User {
  Id: string;
  HoTen: string;
  Email: string;
  Sdt: string;
  VaiTro: VaiTro;
  soDuVi: number;
  NgayTao: string;
  SoDuVi?: number;
  [key: string]: any;
  TrangThai: 'HoatDong' | 'BiKhoa';
}

export type TrangThaiPhong = 'Còn phòng' | 'Công khai' | 'Hết phòng' | 'Chờ duyệt' | 'ChoDuyet' | 'Chờ chủ trọ xác nhận cọc' | 'Đã cọc' | 'Từ chối';
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

export type RentalContractStatus = 'pending_renter' | 'pending_landlord' | 'active' | 'completed' | 'cancelled';

export interface RentalContract {
  id: number;
  room_id: string;
  renter_id: string;
  landlord_id: string;
  status: RentalContractStatus;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields for display:
  roomTitle?: string;
  roomAddress?: string;
  roomImage?: string;
  roomPrice?: number;
  renterName?: string;
  renterPhone?: string;
  renterEmail?: string;
  landlordName?: string;
  landlordPhone?: string;
}

export interface Review {
  id?: string | number;
  tenNguoiDanhGia: string;
  truongHoc?: string;
  soSao: number;
  nhanXet: string;
  ngay?: string;
  is_verified?: boolean;
  contract_id?: number;
  renter_id?: string;
  room_id?: string;
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
  DiaChiChiTiet?: string;
  QuanHuyen: string;
  GiaThue: number; // VNĐ / tháng
  GiaDien: number | string; // Đã chuẩn hóa hỗ trợ cả number (3800) và string
  GiaNuoc: number | string; // Đã chuẩn hóa hỗ trợ cả number (30000) và string
  TienIch: string[];
  TrangThai: TrangThaiPhong;
  LyDoTuChoi?: string;
  IdChuTro: string;
  ChuTroId?: string;
  ChuTroTen: string;
  ChuTroSdt: string;
  HinhAnh: string[];
  MoTa: string;
  NoiQuy: string;
  DienTich: number;
  LoaiPhong?: 'GacLung' | 'Studio' | 'KyTucXa' | 'ChungCuMini';
  NgayDang?: string;
  NgayTao?: string;
  DanhGia?: Review[];
  VideoUrl?: string;
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

export interface GiaoDichVi {
  Id: string;
  UserId: string;
  LoaiGiaoDich: 'NapTien' | 'DatCoc' | 'HoanCoc' | 'NhanCoc';
  SoTien: number;
  SoDuSauGiaoDich: number;
  NoiDung: string;
  MaThamChieu?: string;
  NgayTao: string;
}