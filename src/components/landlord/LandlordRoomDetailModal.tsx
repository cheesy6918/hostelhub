import React, { useState } from 'react';
import { Room } from '../../types';
import { parseVideoUrl } from '../../utils/video';
import {
  X,
  MapPin,
  Maximize2,
  DollarSign,
  Zap,
  Droplets,
  Building2,
  CheckCircle2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  FileText,
  Video as VideoIcon,
  Play,
  ExternalLink
} from 'lucide-react';

interface LandlordRoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onEditRoom?: (room: Room) => void;
  onToggleStatus?: (room: Room) => void;
}

export const LandlordRoomDetailModal: React.FC<LandlordRoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onEditRoom,
  onToggleStatus,
}) => {
  if (!isOpen || !room) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images =
    room.HinhAnh && room.HinhAnh.length > 0
      ? room.HinhAnh
      : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'];

  const rawStatus = (room.TrangThai || '').toLowerCase().trim();
  const isAvailable =
    rawStatus.includes('còn phòng') ||
    rawStatus.includes('conphong') ||
    rawStatus.includes('controng') ||
    rawStatus.includes('công khai');
  const isDeposit = rawStatus.includes('đã cọc') || rawStatus.includes('dacoc');
  const isPending = rawStatus.includes('chờ duyệt') || rawStatus.includes('choduyet');

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block -mb-0.5">
                HỒ SƠ TIN ĐĂNG #{room.Id}
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                Chi tiết phòng trọ (Giao diện Chủ trọ)
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Gallery Ảnh phòng */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img
                src={images[activeImageIndex]}
                alt={room.TieuDe}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              {/* Badge trạng thái chuẩn màu */}
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-xs backdrop-blur-xs ${
                  isAvailable
                    ? 'bg-emerald-600 text-white'
                    : isDeposit
                    ? 'bg-purple-600 text-white'
                    : isPending
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                ● {isAvailable ? 'Còn phòng' : isDeposit ? 'Đã cọc' : isPending ? 'Chờ duyệt' : room.TrangThai}
              </span>

              {/* Phím chuyển ảnh */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail danh sách ảnh */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tiêu đề & Địa chỉ */}
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-900 leading-snug">{room.TieuDe}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {room.DiaChi}{room.QuanHuyen ? `, ${room.QuanHuyen}` : ''}
              </span>
            </p>
          </div>

          {/* Dải thông số chính */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <span className="text-blue-600 block text-[11px] font-semibold">Giá thuê niêm yết</span>
              <span className="text-lg font-extrabold text-blue-900 tabular-nums">
                {room.GiaThue?.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-blue-500 block">/tháng</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <span className="text-slate-500 block text-[11px] font-semibold">Diện tích sàn</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{room.DienTich} m²</span>
              <span className="text-[10px] text-slate-400 block">Rộng rãi</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <span className="text-slate-500 block text-[11px] font-semibold">Giá điện</span>
              <span className="text-sm font-bold text-slate-800">
                {typeof room.GiaDien === 'number'
                  ? (room.GiaDien === 0 ? 'Miễn phí' : `${room.GiaDien.toLocaleString('vi-VN')} đ/kWh`)
                  : (room.GiaDien || '3.800 đ/kWh')}
              </span>
              <span className="text-[10px] text-slate-400 block">Công tơ riêng</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <span className="text-slate-500 block text-[11px] font-semibold">Giá nước</span>
              <span className="text-sm font-bold text-slate-800">
                {typeof room.GiaNuoc === 'number'
                  ? (room.GiaNuoc === 0 ? 'Miễn phí' : `${room.GiaNuoc.toLocaleString('vi-VN')} đ/khối`)
                  : (room.GiaNuoc || '30.000 đ/khối')}
              </span>
              <span className="text-[10px] text-slate-400 block">Theo đồng hồ</span>
            </div>
          </div>

          {/* Tiện nghi phòng */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tiện nghi sẵn có</h3>
            <div className="flex flex-wrap gap-1.5">
              {(room.TienIch && room.TienIch.length > 0 ? room.TienIch : ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Vệ sinh riêng']).map(
                (item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 inline-flex items-center gap-1"
                  >
                    ✓ {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Mục Video thực tế phòng trọ */}
          {room.VideoUrl && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <VideoIcon className="w-4 h-4 text-rose-600" />
                  <span>Video thực tế phòng trọ</span>
                </h3>
                <a
                  href={room.VideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở liên kết gốc</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {(() => {
                const parsed = parseVideoUrl(room.VideoUrl);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Nguồn: <strong>{parsed.type === 'gdrive' ? 'Google Drive' : parsed.type === 'youtube' ? 'YouTube' : 'Video trực tiếp'}</strong></span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{room.VideoUrl}</span>
                    </div>
                    <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                      {parsed.isIframe ? (
                        <iframe
                          src={parsed.embedUrl}
                          title="Xem video phòng trọ"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : parsed.type === 'direct' ? (
                        <video controls src={parsed.embedUrl} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs p-6 text-center space-y-2">
                          <Play className="w-8 h-8 text-rose-500" />
                          <p>Không thể nhúng trực tiếp trình phát này.</p>
                          <a
                            href={parsed.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>Mở xem video trên tab mới</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Mô tả chi tiết & Nội quy */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Mô tả phòng của bạn:</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {room.MoTa || 'Chưa cập nhật mô tả chi tiết cho phòng này.'}
              </p>
            </div>
            {room.NoiQuy && (
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Nội quy phòng trọ:</span>
                <p className="text-amber-800 leading-relaxed whitespace-pre-line">
                  {room.NoiQuy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Cụm nút hành động dành riêng cho Chủ trọ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500">
            Trạng thái hiện tại: <strong className="text-slate-800">{isAvailable ? 'Còn phòng' : room.TrangThai}</strong>
          </div>
          <div className="flex items-center gap-2">
            {onToggleStatus && !isDeposit && !isPending && (
              <button
                type="button"
                onClick={() => onToggleStatus(room)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  isAvailable
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isAvailable ? 'Đổi sang Hết phòng' : 'Đổi sang Còn phòng'}
              </button>
            )}
            {onEditRoom && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditRoom(room);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa phòng này</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};