import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  Building,
  Info,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NotificationDropdownProps {
  onNavigateToHistory?: () => void;
  onNavigateToNotifications?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onNavigateToHistory,
  onNavigateToNotifications,
}) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
        title="Thông báo hệ thống (nhấn để mở bảng xem nhanh)"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã đọc hết</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Bạn chưa có thông báo nào.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cập nhật xác nhận đặt chỗ, tiền cọc và yêu cầu mới sẽ xuất hiện tại đây theo thời gian thực.
                </p>
              </div>
            ) : (
              notifications.slice(0, 8).map((item) => {
                const isUnread = item.TrangThai === 'ChuaDoc';
                return (
                  <div
                    key={item.Id}
                    onClick={() => {
                      if (isUnread) markAsRead(item.Id);
                      if (onNavigateToNotifications) {
                        onNavigateToNotifications();
                        setIsOpen(false);
                      } else if (onNavigateToHistory && (item.Loai === 'LichHen' || item.Loai === 'DatCoc')) {
                        onNavigateToHistory();
                        setIsOpen(false);
                      }
                    }}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 items-start ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Icon according to type */}
                    <div className="mt-0.5 shrink-0">
                      {item.Loai === 'LichHen' ? (
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      ) : item.Loai === 'DatCoc' ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      ) : item.Loai === 'PhongTro' ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Building className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs leading-snug ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {item.TieuDe}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {item.NoiDung}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.NgayTao).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation Button to Full Board */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToNotifications) {
                  onNavigateToNotifications();
                } else if (onNavigateToHistory) {
                  onNavigateToHistory();
                }
                setIsOpen(false);
              }}
              className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-1.5 py-1"
            >
              <span>Xem tất cả trong Bảng thông báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
