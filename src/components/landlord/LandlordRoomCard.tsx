import React from 'react';
import { Room } from '../../types';
import { MapPin, Eye, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

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
  const isAvailable =
    room.TrangThai === 'Còn phòng' ||
    (room.TrangThai as string)?.toLowerCase().includes('controng');

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

        {/* Nút 1 chạm đổi trạng thái nhanh Còn/Hết phòng (Tính năng 4) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus?.();
          }}
          title="Bấm để chuyển nhanh giữa Còn phòng / Hết phòng"
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95 ${
            isAvailable
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-700 hover:bg-slate-800 text-white'
          }`}
        >
          {isAvailable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Còn phòng</span>
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
            <button
              type="button"
              onClick={onEditRoom}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDeleteRoom}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa tin phòng"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};