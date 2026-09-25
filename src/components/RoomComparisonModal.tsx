import React, { useState } from 'react';
import { Room } from '../types';
import { useComparison } from '../context/ComparisonContext';
import {
  X,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  Maximize2,
  DollarSign,
  Zap,
  Droplets,
  Phone,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Layers,
  SlidersHorizontal,
  Home,
  AlertCircle
} from 'lucide-react';

interface RoomComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoomDetail?: (roomId: string) => void;
  allRooms?: Room[];
}

const COMPARISON_AMENITIES = [
  { key: 'Điều hòa', label: 'Điều hòa / Máy lạnh', icon: '❄️' },
  { key: 'Wifi', label: 'Wifi Internet', icon: '📶' },
  { key: 'Vệ sinh riêng', label: 'Vệ sinh riêng khép kín', icon: '🚿' },
  { key: 'Nóng lạnh', label: 'Bình nóng lạnh', icon: '🔥' },
  { key: 'Gác lửng', label: 'Có gác lửng', icon: '🪜' },
  { key: 'Tủ lạnh', label: 'Tủ lạnh', icon: '🧊' },
  { key: 'Máy giặt', label: 'Máy giặt', icon: '🧺' },
  { key: 'Giờ tự do', label: 'Giờ tự do / Không chung chủ', icon: '🔑' },
  { key: 'Khóa vân tay', label: 'Khóa vân tay an ninh', icon: '🔒' },
  { key: 'Chỗ để xe', label: 'Chỗ để xe an toàn', icon: '🛵' },
  { key: 'Ban công', label: 'Ban công / Cửa sổ thoáng', icon: '🪟' },
];

export const RoomComparisonModal: React.FC<RoomComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectRoomDetail,
  allRooms = [],
}) => {
  const { comparisonRooms, removeFromComparison, clearComparison, addToComparison } = useComparison();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [showAddRoomDropdown, setShowAddRoomDropdown] = useState(false);

  if (!isOpen) return null;

  // Determine best attributes across compared rooms
  const minPrice = Math.min(...comparisonRooms.map((r) => r.GiaThue));
  const maxArea = Math.max(...comparisonRooms.map((r) => r.DienTich || 0));

  // Calculate average rating for each room
  const getAverageRating = (room: Room) => {
    if (!room.DanhGia || room.DanhGia.length === 0) return 5.0;
    const sum = room.DanhGia.reduce((acc, curr) => acc + curr.soSao, 0);
    return Math.round((sum / room.DanhGia.length) * 10) / 10;
  };

  const highestRating = Math.max(...comparisonRooms.map((r) => getAverageRating(r)));

  // Helper to check if room has amenity
  const hasAmenity = (room: Room, amenityKey: string) => {
    if (!room.TienIch || !Array.isArray(room.TienIch)) return false;
    const keyLower = amenityKey.toLowerCase();
    return room.TienIch.some((a) => {
      const aLower = a.toLowerCase();
      if (keyLower.includes('điều hòa') || keyLower.includes('máy lạnh')) {
        return aLower.includes('điều hòa') || aLower.includes('máy lạnh');
      }
      if (keyLower.includes('wifi') || keyLower.includes('internet')) {
        return aLower.includes('wifi') || aLower.includes('mạng') || aLower.includes('internet');
      }
      return aLower.includes(keyLower);
    });
  };

  // Rooms available to add to comparison
  const availableToAdd = allRooms.filter(
    (r) => !comparisonRooms.some((cr) => cr.Id === r.Id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-5 sm:px-8 py-5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="comparison-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                  So sánh chi tiết các phòng trọ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {comparisonRooms.length} phòng được chọn
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Đặt các đặc điểm, mức giá, tiện ích và đánh giá của từng phòng cạnh nhau để chọn nơi ở ưng ý nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Toggle highlight differences */}
            <button
              type="button"
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyDifferences
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Chỉ hiện điểm khác biệt</span>
            </button>

            {/* Clear all */}
            <button
              type="button"
              onClick={clearComparison}
              title="Xóa tất cả phòng so sánh"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              title="Đóng hộp thoại"
              className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE COMPARISON MATRIX) */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          
          {comparisonRooms.length < 2 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Cần ít nhất 2 phòng để so sánh
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Hiện bạn chỉ còn 1 phòng trong danh sách. Hãy thêm thêm phòng từ danh sách để so sánh cạnh nhau.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Quay lại danh sách phòng
              </button>
            </div>
          ) : (
            <div className="min-w-[680px]">
              
              {/* TOP HEADER: ROOM SUMMARY CARDS */}
              <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 pb-6 border-b border-slate-200">
                <div className="flex flex-col justify-end pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tiêu chí đối chiếu
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cuộn ngang để xem đầy đủ các phòng đã chọn
                  </p>
                </div>

                {comparisonRooms.map((room) => {
                  const coverImg =
                    room.HinhAnh && room.HinhAnh.length > 0
                      ? room.HinhAnh[0]
                      : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80';
                  
                  const isLowestPrice = room.GiaThue === minPrice;
                  const isLargestArea = room.DienTich === maxArea;
                  const avgRating = getAverageRating(room);
                  const isHighestRating = avgRating === highestRating && avgRating > 0;

                  return (
                    <div
                      key={room.Id}
                      className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col justify-between relative group hover:border-blue-400 transition-all"
                    >
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeFromComparison(room.Id)}
                        title="Xóa phòng này khỏi so sánh"
                        className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-600 flex items-center justify-center shadow-md transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-2.5">
                        <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-200">
                          <img
                            src={coverImg}
                            alt={room.TieuDe}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                            }}
                            className="w-full h-full object-cover"
                          />
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm ${
                                room.TrangThai === 'Còn phòng' || room.TrangThai === 'Công khai'
                                  ? 'bg-emerald-600 text-white'
                                  : room.TrangThai === 'Đã cọc'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {room.TrangThai || 'Còn phòng'}
                            </span>
                          </div>
                        </div>

                        {/* Best value tags */}
                        <div className="flex flex-wrap gap-1">
                          {isLowestPrice && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <span>🏷️ Giá tốt nhất</span>
                            </span>
                          )}
                          {isLargestArea && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                              <span>📐 Rộng nhất</span>
                            </span>
                          )}
                          {isHighestRating && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <span>⭐ Đánh giá cao nhất</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {room.TieuDe}
                        </h3>

                        {/* Price */}
                        <div className="text-blue-700 font-extrabold text-sm tabular-nums">
                          {room.GiaThue.toLocaleString('vi-VN')} đ/tháng
                        </div>
                      </div>

                      {/* Direct action CTA */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectRoomDetail) {
                            onClose();
                            onSelectRoomDetail(room.Id);
                          }
                        }}
                        className="mt-3 w-full py-2 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Add room column if < 4 */}
                {comparisonRooms.length < 4 && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center relative">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 mb-1">
                      Thêm phòng so sánh
                    </span>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Có thể so sánh tối đa 4 phòng
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowAddRoomDropdown(!showAddRoomDropdown)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Chọn thêm phòng
                    </button>

                    {showAddRoomDropdown && availableToAdd.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-20 max-h-56 overflow-y-auto space-y-1 text-left">
                        {availableToAdd.map((avRoom) => (
                          <button
                            key={avRoom.Id}
                            type="button"
                            onClick={() => {
                              addToComparison(avRoom);
                              setShowAddRoomDropdown(false);
                            }}
                            className="w-full text-left p-2 hover:bg-blue-50 rounded-xl text-xs transition-colors cursor-pointer flex flex-col"
                          >
                            <span className="font-semibold text-slate-800 truncate">
                              {avRoom.TieuDe}
                            </span>
                            <span className="text-[11px] text-blue-600 font-bold">
                              {avRoom.GiaThue.toLocaleString('vi-VN')} đ · {avRoom.QuanHuyen}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TABLE BODY SECTIONS */}
              <div className="divide-y divide-slate-100 text-xs">
                
                {/* 1. SECTION: GIÁ CẢ & CHI PHÍ */}
                <div className="py-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700 flex items-center gap-1.5 mb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>1. Giá cả & Chi phí định kỳ hàng tháng</span>
                  </div>

                  {/* Row: Giá thuê */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Giá thuê / tháng</div>
                    {comparisonRooms.map((room) => {
                      const isLowest = room.GiaThue === minPrice;
                      return (
                        <div key={room.Id} className="flex items-center gap-1.5">
                          <span className={`font-extrabold text-sm tabular-nums ${isLowest ? 'text-emerald-700 font-black' : 'text-slate-900'}`}>
                            {room.GiaThue.toLocaleString('vi-VN')} đ
                          </span>
                          {isLowest && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Rẻ nhất
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Row: Tiền cọc giữ chỗ */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Tiền cọc giữ chỗ</div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800 font-medium">
                        500.000 đ <span className="text-[10px] text-slate-400">(hoàn khi vào ở)</span>
                      </div>
                    ))}
                  </div>

                  {/* Row: Giá điện */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Giá tiền điện</span>
                    </div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800 font-medium">
                        {room.GiaDien || '3.800 đ/kWh'}
                      </div>
                    ))}
                  </div>

                  {/* Row: Giá nước */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>Giá tiền nước</span>
                    </div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800 font-medium">
                        {room.GiaNuoc || '30.000 đ/khối'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. SECTION: ĐẶC ĐIỂM & THÔNG SỐ KHÔNG GIAN */}
                <div className="py-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700 flex items-center gap-1.5 mb-2">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>2. Đặc điểm, diện tích & vị trí phòng</span>
                  </div>

                  {/* Row: Diện tích */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Diện tích phòng</div>
                    {comparisonRooms.map((room) => {
                      const isMax = room.DienTich === maxArea;
                      return (
                        <div key={room.Id} className="flex items-center gap-1.5">
                          <span className={`font-bold tabular-nums ${isMax ? 'text-blue-700 font-extrabold' : 'text-slate-900'}`}>
                            {room.DienTich} m²
                          </span>
                          {isMax && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              Rộng nhất
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Row: Địa chỉ cụ thể */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Địa chỉ cụ thể</span>
                    </div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800 font-medium leading-relaxed">
                        {room.DiaChi}
                      </div>
                    ))}
                  </div>

                  {/* Row: Quận / Huyện */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Quận / Huyện</div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800 font-semibold">
                        {room.QuanHuyen}
                      </div>
                    ))}
                  </div>

                  {/* Row: Loại hình phòng */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Loại hình phòng</div>
                    {comparisonRooms.map((room) => {
                      const typeLabel =
                        room.LoaiPhong === 'KyTucXa'
                          ? 'Ký túc xá / Sleepbox'
                          : room.LoaiPhong === 'Studio'
                          ? 'Phòng Studio khép kín'
                          : room.LoaiPhong === 'GacLung'
                          ? 'Phòng có gác lửng'
                          : 'Chung cư mini / Căn hộ';
                      return (
                        <div key={room.Id} className="text-slate-800 font-medium">
                          {typeLabel}
                        </div>
                      );
                    })}
                  </div>

                  {/* Row: Chủ nhà trọ & SĐT */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Chủ trọ liên hệ</span>
                    </div>
                    {comparisonRooms.map((room) => (
                      <div key={room.Id} className="text-slate-800">
                        <p className="font-semibold">{room.ChuTroTen}</p>
                        <p className="text-[11px] text-blue-600 font-mono mt-0.5">{room.ChuTroSdt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. SECTION: BẢNG SO SÁNH TIỆN ÍCH CHI TIẾT (AMENITY MATRIX) */}
                <div className="py-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>3. Bảng đối chiếu tiện ích trang bị (Checklist)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {COMPARISON_AMENITIES.map((amenity) => {
                      // Check if there is difference across rooms for this amenity
                      const presenceList = comparisonRooms.map((r) => hasAmenity(r, amenity.key));
                      const allSame = presenceList.every((val) => val === presenceList[0]);

                      // If onlyDifferences is toggled, hide rows that are identical
                      if (onlyDifferences && allSame) {
                        return null;
                      }

                      return (
                        <div
                          key={amenity.key}
                          className={`grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 rounded-xl px-1 transition-colors ${
                            !allSame ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-medium text-slate-700 flex items-center gap-2">
                            <span>{amenity.icon}</span>
                            <span>{amenity.label}</span>
                          </div>

                          {comparisonRooms.map((room) => {
                            const available = hasAmenity(room, amenity.key);
                            return (
                              <div key={room.Id} className="flex items-center gap-1.5">
                                {available ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Có sẵn</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium">
                                    <XCircle className="w-3.5 h-3.5 text-slate-300" />
                                    <span>Không có</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. SECTION: ĐÁNH GIÁ & NHẬN XÉT CỦA SINH VIÊN (REVIEWS) */}
                <div className="py-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700 flex items-center gap-1.5 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>4. Đánh giá & Nhận xét trải nghiệm thực tế</span>
                  </div>

                  {/* Row: Điểm đánh giá trung bình */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Điểm sao trung bình</div>
                    {comparisonRooms.map((room) => {
                      const avg = getAverageRating(room);
                      const reviewCount = room.DanhGia?.length || 0;
                      return (
                        <div key={room.Id} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-extrabold tabular-nums">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{avg} / 5.0</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            ({reviewCount} đánh giá)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Row: Nhận xét tiêu biểu từ sinh viên */}
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Nhận xét tiêu biểu</div>
                    {comparisonRooms.map((room) => {
                      const reviews = room.DanhGia || [];
                      if (reviews.length === 0) {
                        return (
                          <div key={room.Id} className="text-slate-400 italic text-[11px]">
                            Chưa có nhận xét nào
                          </div>
                        );
                      }

                      return (
                        <div key={room.Id} className="space-y-2">
                          {reviews.slice(0, 2).map((rev, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{rev.tenNguoiDanhGia}</span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {Array.from({ length: rev.soSao }).map((_, i) => (
                                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">{rev.truongHoc}</p>
                              <p className="text-slate-600 italic">"{rev.nhanXet}"</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. SECTION: NỘI QUY & GHI CHÚ */}
                <div className="py-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-700 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>5. Nội quy phòng trọ & Lưu ý chung</span>
                  </div>

                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 py-2 hover:bg-slate-50 rounded-xl px-1">
                    <div className="font-semibold text-slate-600">Nội quy chính</div>
                    {comparisonRooms.map((room) => (
                      <div
                        key={room.Id}
                        className="text-slate-700 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-line"
                      >
                        {room.NoiQuy || '1. Giữ trật tự chung sau 23:00.\n2. Vệ sinh sạch sẽ.\n3. Khóa cửa cẩn thận.'}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* BOTTOM ACTIONS ROW */}
              <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(220px,1fr))] gap-4 pt-6 border-t border-slate-200">
                <div className="font-bold text-slate-700 flex items-center">
                  Hành động
                </div>

                {comparisonRooms.map((room) => (
                  <div key={room.Id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectRoomDetail) {
                          onClose();
                          onSelectRoomDetail(room.Id);
                        }
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem & Đặt lịch hẹn</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromComparison(room.Id)}
                      className="w-full py-1.5 text-slate-500 hover:text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Bỏ khỏi so sánh
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span>Mẹo: Bạn có thể sao chép thông tin hoặc liên hệ trực tiếp số điện thoại chủ trọ trước khi đặt cọc giữ chỗ.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-end sm:self-auto"
          >
            Đóng bảng so sánh
          </button>
        </div>

      </div>
    </div>
  );
};
