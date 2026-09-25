import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ThongBao } from '../types';
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  Building2,
  ShieldCheck,
  Clock,
  Search,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Inbox
} from 'lucide-react';

interface NotificationsViewProps {
  onNavigate: (view: string) => void;
  onViewRoomDetail?: (roomId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onNavigate,
  onViewRoomDetail,
}) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    categoryCounts,
    loading,
    lastUpdated,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    generateTestNotification,
  } = useNotifications();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [testingScenario, setTestingScenario] = useState<string | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTestTrigger = async (scenario: string) => {
    setTestingScenario(scenario);
    await generateTestNotification(scenario);
    setTestingScenario(null);
  };

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Type filter
      if (filterType === 'unread' && notif.TrangThai !== 'ChuaDoc') return false;
      if (filterType === 'LichHen' && notif.Loai !== 'LichHen') return false;
      if (filterType === 'DatCoc' && notif.Loai !== 'DatCoc') return false;
      if (filterType === 'PhongTro' && notif.Loai !== 'PhongTro') return false;
      if (filterType === 'HeThong' && notif.Loai !== 'HeThong') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = notif.TieuDe.toLowerCase().includes(query);
        const matchContent = notif.NoiDung.toLowerCase().includes(query);
        return matchTitle || matchContent;
      }

      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const getNotificationIcon = (type: ThongBao['Loai']) => {
    switch (type) {
      case 'LichHen':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'DatCoc':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
        );
      case 'PhongTro':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
        );
      case 'HeThong':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
    }
  };

  const getNotificationCategoryBadge = (type: ThongBao['Loai']) => {
    switch (type) {
      case 'LichHen':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3 h-3" />
            <span>Đặt chỗ & Lịch hẹn</span>
          </span>
        );
      case 'DatCoc':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CreditCard className="w-3 h-3" />
            <span>Tiền đặt cọc</span>
          </span>
        );
      case 'PhongTro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Building2 className="w-3 h-3" />
            <span>Tin đăng phòng</span>
          </span>
        );
      case 'HeThong':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3" />
            <span>Hệ thống</span>
          </span>
        );
    }
  };

  const handleActionNavigation = (item: ThongBao) => {
    if (item.TrangThai === 'ChuaDoc') {
      markAsRead(item.Id);
    }

    if (user?.VaiTro === 'SinhVien') {
      if (item.Loai === 'LichHen' || item.Loai === 'DatCoc') {
        onNavigate('student-history');
      } else {
        onNavigate('student-rooms');
      }
    } else if (user?.VaiTro === 'ChuTro') {
      if (item.Loai === 'LichHen') {
        onNavigate('landlord-inquiries');
      } else if (item.Loai === 'DatCoc') {
        onNavigate('landlord-rooms');
      } else {
        onNavigate('landlord-rooms');
      }
    } else {
      onNavigate('admin-dashboard');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Bảng Thông Báo
                  </h1>
                  {unreadCount > 0 ? (
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white text-xs font-extrabold rounded-full animate-pulse shadow-xs">
                      {unreadCount} mới
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                      Đã đọc hết
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Cập nhật thời gian thực</span>
                  {lastUpdated && (
                    <span className="text-slate-400">
                      • Đồng bộ lúc {lastUpdated.toLocaleTimeString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl pt-1">
              {user?.VaiTro === 'SinhVien'
                ? 'Theo dõi cập nhật tức thời về xác nhận lịch hẹn xem phòng, tiến độ phê duyệt đơn cọc, hoàn tiền ví và trạng thái phòng đã đặt.'
                : user?.VaiTro === 'ChuTro'
                ? 'Nhận thông báo ngay lập tức khi có sinh viên đặt lịch xem phòng mới, gửi tiền cọc giữ chỗ và trạng thái kiểm duyệt bài đăng phòng.'
                : 'Theo dõi các hoạt động kiểm duyệt tin đăng, giao dịch cọc và thông báo vận hành toàn hệ thống.'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Kiểm tra thông báo mới ngay lập tức"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Làm mới</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Đánh dấu tất cả thông báo là đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}

            {notifications.some((n) => n.TrangThai === 'DaDoc') && (
              <button
                onClick={clearReadNotifications}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Dọn dẹp các thông báo đã đọc để bảng tin gọn gàng"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dọn thông báo đã đọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Real-Time Test Simulation Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Thanh kiểm thử thông báo thời gian thực:</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Nhấn nút để kích hoạt các cập nhật mẫu theo đúng vai trò hiện tại
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user?.VaiTro === 'SinhVien' && (
              <>
                <button
                  onClick={() => handleTestTrigger('booking-confirm')}
                  disabled={testingScenario === 'booking-confirm'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>🧪 Xác nhận đặt chỗ</span>
                </button>
                <button
                  onClick={() => handleTestTrigger('deposit-success')}
                  disabled={testingScenario === 'deposit-success'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🧪 Trạng thái nhận cọc thành công</span>
                </button>
                <button
                  onClick={() => handleTestTrigger('deposit-refund')}
                  disabled={testingScenario === 'deposit-refund'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                  <span>🧪 Hoàn tiền cọc về ví</span>
                </button>
              </>
            )}

            {user?.VaiTro === 'ChuTro' && (
              <>
                <button
                  onClick={() => handleTestTrigger('booking-request')}
                  disabled={testingScenario === 'booking-request'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>🧪 Yêu cầu đặt chỗ mới</span>
                </button>
                <button
                  onClick={() => handleTestTrigger('deposit-request')}
                  disabled={testingScenario === 'deposit-request'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🧪 Có đơn đặt cọc mới (500k)</span>
                </button>
                <button
                  onClick={() => handleTestTrigger('room-approved')}
                  disabled={testingScenario === 'room-approved'}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>🧪 Tin đăng được phê duyệt</span>
                </button>
              </>
            )}

            {user?.VaiTro === 'Admin' && (
              <button
                onClick={() => handleTestTrigger('admin-alert')}
                disabled={testingScenario === 'admin-alert'}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>🧪 Cảnh báo quản trị & giao dịch</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-white">
                {categoryCounts.total}
              </span>
            </button>

            <button
              onClick={() => setFilterType('unread')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Chưa đọc</span>
              {categoryCounts.unread > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
                  {categoryCounts.unread}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('LichHen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'LichHen'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Đặt chỗ & Lịch hẹn</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {categoryCounts.lichHen}
              </span>
            </button>

            <button
              onClick={() => setFilterType('DatCoc')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'DatCoc'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tiền đặt cọc</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {categoryCounts.datCoc}
              </span>
            </button>

            <button
              onClick={() => setFilterType('PhongTro')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'PhongTro'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Phòng trọ</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {categoryCounts.phongTro}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu thông báo...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy thông báo phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `Không có thông báo nào khớp với từ khóa "${searchQuery}".`
                : 'Hiện tại bạn chưa có thông báo nào trong mục này. Khi có cập nhật mới về lịch hẹn, cọc hoặc phòng, hệ thống sẽ hiển thị tại đây.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Xóa từ khóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const isUnread = item.TrangThai === 'ChuaDoc';
            return (
              <div
                key={item.Id}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-2xs hover:shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {getNotificationIcon(item.Loai)}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getNotificationCategoryBadge(item.Loai)}
                      {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>Chưa đọc</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.NgayTao).toLocaleString('vi-VN')}</span>
                      </span>
                    </div>

                    <h3
                      className={`text-sm tracking-tight ${
                        isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {item.TieuDe}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {item.NoiDung}
                    </p>

                    {/* Action buttons inside card */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleActionNavigation(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                      >
                        <span>
                          {user?.VaiTro === 'SinhVien'
                            ? item.Loai === 'LichHen'
                              ? 'Xem lịch hẹn của tôi'
                              : item.Loai === 'DatCoc'
                              ? 'Xem đơn cọc & Ví'
                              : 'Xem phòng trọ'
                            : user?.VaiTro === 'ChuTro'
                            ? item.Loai === 'LichHen'
                              ? 'Xử lý yêu cầu lịch hẹn'
                              : item.Loai === 'DatCoc'
                              ? 'Xác nhận đơn cọc'
                              : 'Quản lý phòng trọ'
                            : 'Bảng quản trị'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.Id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex sm:flex-col items-center gap-1.5 self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => deleteNotification(item.Id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Xóa thông báo này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
