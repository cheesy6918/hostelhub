import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useComparison } from '../context/ComparisonContext';
import { useNotifications } from '../context/NotificationContext';
import { Home, User as UserIcon, LogOut, ShieldCheck, Building2, GraduationCap, Wallet, Heart, ArrowLeftRight, Bell } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
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
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-blue-900 block leading-tight">
              Hostel<span className="text-blue-600">Hub</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links based on role */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!user ? (
            <>
              <button
                onClick={() => setCurrentView('home')}
                className={`transition-colors ${currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setCurrentView('find-rooms-public')}
                className={`transition-colors ${currentView === 'find-rooms-public' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tìm phòng trọ
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className={`transition-colors ${currentView === 'about' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Giới thiệu
              </button>
            </>
          ) : user.VaiTro === 'SinhVien' ? (
            <>
              <button
                onClick={() => setCurrentView('student-rooms')}
                className={`transition-colors cursor-pointer ${currentView === 'student-rooms' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tìm phòng trọ
              </button>
              {comparisonRooms.length > 0 && (
                <button
                  type="button"
                  onClick={openComparisonModal}
                  className="transition-colors flex items-center gap-1.5 cursor-pointer text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 text-xs font-bold"
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
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'student-favorites' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
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
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${currentView === 'student-history' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span>Lịch sử của tôi</span>
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'notifications' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
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
                className={`transition-colors cursor-pointer ${currentView === 'profile' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Ví cá nhân & Hồ sơ
              </button>
            </>
          ) : user.VaiTro === 'ChuTro' ? (
            <>
              <button
                onClick={() => setCurrentView('landlord-rooms')}
                className={`transition-colors ${currentView === 'landlord-rooms' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Quản lý phòng của tôi
              </button>
              <button
                onClick={() => setCurrentView('landlord-create-room')}
                className={`transition-colors flex items-center gap-1 ${currentView === 'landlord-create-room' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span>+ Đăng tin phòng mới</span>
              </button>
              <button
                onClick={() => setCurrentView('landlord-inquiries')}
                className={`transition-colors ${currentView === 'landlord-inquiries' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Yêu cầu xem phòng
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'notifications' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
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
                className={`transition-colors ${currentView === 'profile' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Ví doanh thu & Hồ sơ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className={`transition-colors ${currentView === 'admin-dashboard' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tổng quan hệ thống
              </button>
              <button
                onClick={() => setCurrentView('admin-users')}
                className={`transition-colors ${currentView === 'admin-users' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Quản lý người dùng
              </button>
              <button
                onClick={() => setCurrentView('admin-rooms')}
                className={`transition-colors ${currentView === 'admin-rooms' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Kiểm duyệt phòng trọ
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'notifications' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
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

        {/* Zone 3: Primary Actions / User Menu */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button
                onClick={() => setCurrentView('login')}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors whitespace-nowrap"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                Đăng ký
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Wallet quick balance in header corner */}
              <button
                onClick={() => setCurrentView('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  user.VaiTro === 'SinhVien'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                }`}
                title="Số dư ví hiện tại - Nhấn để xem chi tiết hoặc nạp thêm"
              >
                <Wallet className={`w-3.5 h-3.5 ${user.VaiTro === 'SinhVien' ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span className="hidden sm:inline text-slate-500">Ví:</span>
                <span className="tabular-nums font-bold">{(user.soDuVi || 0).toLocaleString('vi-VN')} đ</span>
              </button>

              {/* Notification Dropdown with unread badge */}
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

              {/* User profile button */}
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {user.HoTen.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">{user.HoTen}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={() => {
                  logout();
                  setCurrentView('login');
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
