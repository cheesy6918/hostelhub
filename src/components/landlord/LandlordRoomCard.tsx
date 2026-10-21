import React from 'react';
import { Room } from '../../types';
import { MapPin, Eye, Edit2, Trash2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

interface LandlordRoomCardProps {
  room: Room;
  onViewDetail?: (roomId: string) => void;
  onEditRoom?: () => void;
  onToggleStatus?: () => void;
  onDeleteRoom?: () => void;
}

export const LandlordRoomCard: React.FC<LandlordRoomCardProps> = ({
  room,
  onViewDetail,
  onEditRoom,
  onToggleStatus,
  onDeleteRoom,
}) => {
  const rawStatus = (room.TrangThai || '').toLowerCase().trim();
  
  // Nhận diện Còn phòng bao gồm cả "Công khai" và "Còn trống"
  const isAvailable =
    rawStatus.includes('còn phòng') ||
    rawStatus.includes('controng') ||
    rawStatus.includes('công khai') ||
    rawStatus.includes('congkhai');

  const isPending =
    rawStatus.includes('chờ duyệt') ||
    rawStatus.includes('choduyet') ||
    rawStatus.includes('pending');

  const isDeposit =
    rawStatus.includes('đã cọc') ||
    rawStatus.includes('dacoc');

  // Xác nhận rõ quyền sở hữu bài đăng của Chủ trọ trước khi xóa
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `[Chủ trọ] Bạn có chắc chắn muốn xóa bài đăng phòng trọ "${room.TieuDe}" của mình không?\n\nLưu ý: Thao tác này sẽ gỡ bài viết vĩnh viễn khỏi danh sách quản lý của bạn.`
    );
    if (confirmed) {
      onDeleteRoom?.();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Khung ảnh */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={
            room.HinhAnh?.[0] ||
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
          }
          alt={room.TieuDe}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Nút 1 chạm đổi trạng thái nhanh Còn / Chờ duyệt / Đã cọc / Hết phòng */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus?.();
          }}
          title="Bấm để chuyển nhanh giữa Còn phòng và Hết phòng"
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95 ${
            isAvailable
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : isPending
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : isDeposit
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-slate-700 hover:bg-slate-800 text-white'
          }`}
        >
          {isAvailable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Còn phòng</span>
            </>
          ) : isPending ? (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ duyệt</span>
            </>
          ) : isDeposit ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã cọc</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-slate-300" />
              <span>Hết phòng</span>
            </>
          )}
        </button>

        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-bold text-xs tabular-nums">
          {(room.GiaThue || 0).toLocaleString('vi-VN')} đ/tháng
        </div>
      </div>

      {/* Thông tin phòng */}
      <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onViewDetail?.(room.Id)}
            className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
          >
            {room.TieuDe}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{room.DiaChi}</span>
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => onViewDetail?.(room.Id)}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem phòng</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Nút đổi trạng thái phòng */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus?.();
              }}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title={isAvailable ? 'Chuyển sang Hết phòng' : 'Chuyển sang Còn phòng'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Nút sửa thông tin */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditRoom?.();
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin phòng"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Nút xóa bài đăng */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa bài đăng của tôi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};