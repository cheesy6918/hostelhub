import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useComparison } from '../context/ComparisonContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Home,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Building2,
  GraduationCap,
  Wallet,
  Heart,
  ArrowLeftRight,
  Bell,
  UserCircle2,
  ChevronDown,
  MapPin,
  BookOpen
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const { favoriteRoomIds } = useFavorites();
  const { comparisonRooms, openComparisonModal } = useComparison();
  const { unreadCount } = useNotifications();

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.VaiTro === 'Admin') return 'Quản trị viên';
    if (user.VaiTro === 'ChuTro') return 'Chủ trọ';
    return 'Sinh viên';
  };

  const getRoleIcon = () => {
    if (!user) return null;
    if (user.VaiTro === 'Admin') return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    if (user.VaiTro === 'ChuTro') return <Building2 className="w-4 h-4 text-emerald-600" />;
    return <GraduationCap className="w-4 h-4 text-blue-600" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Nhóm bên trái: Logo & Menu điều hướng */}
        <div className="flex items-center gap-8 lg:gap-10">
          {/* Logo HostelHub giữ nguyên màu xanh thương hiệu */}
          <button
            onClick={() => {
              if (!user) {
                setCurrentView('home');
              } else if (user.VaiTro === 'SinhVien') {
                setCurrentView('student-rooms');
              } else if (user.VaiTro === 'ChuTro') {
                setCurrentView('landlord-rooms');
              } else if (user.VaiTro === 'Admin') {
                setCurrentView('admin-dashboard');
              }
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                Hostel<span className="text-blue-600">Hub</span>
              </span>
            </div>
          </button>

          {/* Menu chính có Dropdown khi Hover */}
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-slate-700">
            {!user ? (
              <>
                {/* 1. MỤC TÌM PHÒNG TRỌ (MEGA DROPDOWN KHI HOVER) */}
                <div className="relative group py-4">
                  <button
                    onClick={() => setCurrentView('find-rooms-public')}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${currentView === 'find-rooms-public' ? 'text-blue-600 font-bold' : 'group-hover:text-blue-600'
                      }`}
                  >
                    <span>Tìm phòng trọ</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Hộp menu thả xuống 2 cột */}
                  <div className="absolute top-full left-0 hidden group-hover:block w-[460px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Khu vực cho thuê trọ phổ biến tại Hà Nội</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-slate-600">
                      {[
                        'Cho thuê phòng trọ Quận Cầu Giấy',
                        'Cho thuê phòng trọ Quận Đống Đa',
                        'Cho thuê phòng trọ Quận Thanh Xuân',
                        'Cho thuê phòng trọ Quận Hai Bà Trưng',
                        'Cho thuê phòng trọ Quận Nam Từ Liêm',
                        'Cho thuê phòng trọ Quận Bắc Từ Liêm',
                        'Cho thuê phòng trọ Quận Ba Đình',
                        'Cho thuê phòng trọ Quận Hà Đông',
                      ].map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentView('find-rooms-public')}
                          className="text-left py-1 hover:text-blue-600 transition-colors cursor-pointer truncate"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. MỤC CẨM NANG (DROPDOWN KHI HOVER) */}
                <div className="relative group py-4">
                  <button
                    onClick={() => setCurrentView('guide')}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${currentView === 'guide' ? 'text-blue-600 font-bold' : 'group-hover:text-blue-600'
                      }`}
                  >
                    <span>Cẩm nang</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Hộp menu thả xuống của Cẩm nang */}
                  <div className="absolute top-full left-0 hidden group-hover:block w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1 text-xs text-slate-600">
                      <button
                        type="button"
                        onClick={() => setCurrentView('guide')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>Kinh nghiệm thuê phòng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('guide')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>Kinh nghiệm cho thuê</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('guide')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                      >
                        <span>Cảnh báo lừa đảo đặt cọc</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('guide')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                      >
                        <span>Mẫu hợp đồng thuê trọ</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. MỤC TÌM Ở GHÉP */}
                <button
                  onClick={() => setCurrentView('roommate')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'roommate' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Tìm ở ghép
                </button>

                {/* 4. MỤC BẢN ĐỒ PHÒNG TRỌ */}
                <button
                  onClick={() => setCurrentView('map')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'map' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Bản đồ phòng trọ
                </button>
              </>

            ) : user.VaiTro === 'SinhVien' ? (
              <>
                <button
                  onClick={() => setCurrentView('student-rooms')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'student-rooms' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Tìm phòng trọ
                </button>
                {comparisonRooms.length > 0 && (
                  <button
                    type="button"
                    onClick={openComparisonModal}
                    className="flex items-center gap-1.5 cursor-pointer text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200 text-xs font-bold transition-all"
                    title="Mở bảng so sánh phòng trọ"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>So sánh</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tabular-nums">
                      {comparisonRooms.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('student-favorites')}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 transition-colors ${currentView === 'student-favorites' ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favoriteRoomIds.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                  <span>Yêu thích</span>
                  {favoriteRoomIds.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold tabular-nums">
                      {favoriteRoomIds.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('student-history')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'student-history' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Lịch sử của tôi
                </button>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 transition-colors ${currentView === 'notifications' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold tabular-nums animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'profile' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Ví cá nhân & Hồ sơ
                </button>
              </>
            ) : user.VaiTro === 'ChuTro' ? (
              <>
                <button
                  onClick={() => setCurrentView('landlord-rooms')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'landlord-rooms' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Quản lý phòng
                </button>
                <button
                  onClick={() => setCurrentView('landlord-create-room')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'landlord-create-room' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  + Đăng tin mới
                </button>
                <button
                  onClick={() => setCurrentView('landlord-inquiries')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'landlord-inquiries' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Yêu cầu xem phòng
                </button>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 transition-colors ${currentView === 'notifications' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold tabular-nums animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'profile' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Ví doanh thu
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'admin-dashboard' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setCurrentView('admin-users')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'admin-users' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Người dùng
                </button>
                <button
                  onClick={() => setCurrentView('admin-rooms')}
                  className={`transition-colors cursor-pointer py-1 ${currentView === 'admin-rooms' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  Kiểm duyệt phòng
                </button>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className={`flex items-center gap-1.5 cursor-pointer py-1 transition-colors ${currentView === 'notifications' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold tabular-nums animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Nhóm bên phải: Hotline & Nút hành động chuẩn giao diện mẫu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!user ? (
            <>
              {/* Hotline nhỏ gọn phong cách như ảnh mẫu */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-2">
                <span>Hotline:</span>
                <span className="text-slate-900 font-bold tracking-tight">1900 8899</span>
              </div>

              {/* Nút Đăng ký viền bo tròn hình viên thuốc (Pill shape) */}
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50/60 border border-blue-400 rounded-full transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <UserCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Đăng ký</span>
              </button>

              {/* Nút Đăng nhập viền xám nhẹ nhàng tinh tế */}
              <button
                onClick={() => setCurrentView('login')}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              >
                Đăng nhập
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Số dư ví dạng capsule nhỏ gọn */}
              <button
                onClick={() => setCurrentView('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer ${user.VaiTro === 'SinhVien'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                title="Số dư ví hiện tại - Nhấn để xem chi tiết"
              >
                <Wallet className={`w-3.5 h-3.5 ${user.VaiTro === 'SinhVien' ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span className="hidden sm:inline text-slate-500">Ví:</span>
                <span className="tabular-nums font-bold">{(user.soDuVi || 0).toLocaleString('vi-VN')} đ</span>
              </button>

              {/* Dropdown thông báo */}
              <NotificationDropdown
                onNavigateToNotifications={() => setCurrentView('notifications')}
                onNavigateToHistory={() => {
                  if (user.VaiTro === 'SinhVien') {
                    setCurrentView('student-history');
                  } else if (user.VaiTro === 'ChuTro') {
                    setCurrentView('landlord-rooms');
                  } else {
                    setCurrentView('admin-dashboard');
                  }
                }}
              />

              {/* Avatar người dùng bo tròn */}
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.HoTen.charAt(0).toUpperCase()}
                </div>
                <div className="text-left pr-2 hidden lg:block">
                  <div className="font-semibold text-slate-800 text-xs truncate max-w-[110px]">{user.HoTen}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>
              </button>

              {/* Nút Đăng xuất */}
              <button
                onClick={() => {
                  logout();
                  setCurrentView('login');
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};