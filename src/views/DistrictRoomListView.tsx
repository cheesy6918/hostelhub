import React, { useState, useMemo } from 'react';
import { Room } from '../types';
import {
  MapPin,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  Camera,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DistrictRoomListViewProps {
  district: string;
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
  onNavigateDistrict: (districtName: string) => void;
  onBackToHome: () => void;
}

const HANOI_DISTRICTS = [
  'Quận Cầu Giấy',
  'Quận Đống Đa',
  'Quận Hai Bà Trưng',
  'Quận Thanh Xuân',
  'Quận Nam Từ Liêm',
  'Quận Bắc Từ Liêm',
  'Quận Ba Đình',
  'Quận Hà Đông',
  'Quận Hoàng Mai',
  'Quận Tây Hồ',
  'Quận Long Biên',
  'Quận Hoàn Kiếm'
];

export const DistrictRoomListView: React.FC<DistrictRoomListViewProps> = ({
  district,
  rooms,
  onSelectRoom,
  onNavigateDistrict,
  onBackToHome,
}) => {
  // Trạng thái bộ lọc cột trái

  // Bảng tọa độ trung tâm các quận Hà Nội
  const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
    'Cầu Giấy': { lat: 21.0362, lng: 105.7906 },
    'Đống Đa': { lat: 21.0181, lng: 105.8299 },
    'Hai Bà Trưng': { lat: 21.0065, lng: 105.8524 },
    'Thanh Xuân': { lat: 20.9937, lng: 105.8118 },
    'Nam Từ Liêm': { lat: 21.0125, lng: 105.7667 },
    'Bắc Từ Liêm': { lat: 21.0631, lng: 105.7656 },
    'Ba Đình': { lat: 21.0341, lng: 105.8239 },
    'Hà Đông': { lat: 20.9721, lng: 105.7770 },
    'Hoàng Mai': { lat: 20.9744, lng: 105.8557 },
    'Tây Hồ': { lat: 21.0713, lng: 105.8247 },
    'Long Biên': { lat: 21.0366, lng: 105.8943 },
    'Hoàn Kiếm': { lat: 21.0285, lng: 105.8542 }
  };

  const districtKey = district.replace(/^Quận\s+/i, '').trim();
  const currentCoord = DISTRICT_COORDS[districtKey] || { lat: 21.0362, lng: 105.7906 };
  const currentBbox = `${currentCoord.lng - 0.025},${currentCoord.lat - 0.02},${currentCoord.lng + 0.025},${currentCoord.lat + 0.02}`;

  // Đổi giá trị mặc định thành 6 triệu
  const [maxPrice, setMaxPrice] = useState<number>(6000000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'phu-hop' | 'gia-thap' | 'gia-cao'>('phu-hop');

  // Lọc phòng theo quận hiện tại
  const districtFilteredRooms = useMemo(() => {
    const rawDistrict = district.replace(/^Quận\s+/i, '').trim().toLowerCase();
    return rooms.filter((r) => {
      const roomAddress = `${r.DiaChi || ''} ${r.QuanHuyen || ''}`.toLowerCase();
      const matchDistrict = roomAddress.includes(rawDistrict);
      const matchPrice = (r.GiaThue || 0) <= maxPrice;
      const matchAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every(amenity => (r.TienIch || []).some(t => t.toLowerCase().includes(amenity.toLowerCase())));
      return matchDistrict && matchPrice && matchAmenities;
    });
  }, [rooms, district, maxPrice, selectedAmenities]);

  // Sắp xếp danh sách
  const sortedRooms = useMemo(() => {
    const list = [...districtFilteredRooms];
    if (sortBy === 'gia-thap') {
      return list.sort((a, b) => a.GiaThue - b.GiaThue);
    }
    if (sortBy === 'gia-cao') {
      return list.sort((a, b) => b.GiaThue - a.GiaThue);
    }
    return list;
  }, [districtFilteredRooms, sortBy]);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const formattedDistrictTitle = district.startsWith('Quận') ? district : `Quận ${district}`;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={onBackToHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>›</span>
          <span className="hover:text-blue-600 cursor-pointer">Hà Nội</span>
          <span>›</span>
          <span className="text-blue-600 font-bold">{formattedDistrictTitle}</span>
        </nav>

        {/* 2. Tiêu đề khu vực & Số lượng tòa nhà / phòng */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cho thuê phòng trọ {formattedDistrictTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Có <strong className="text-blue-600">{sortedRooms.length} phòng trọ</strong> còn phòng sẵn sàng dọn vào ngay
          </p>
        </div>

        {/* 3. Bố cục chính: Cột trái (Bộ lọc) & Cột phải (Danh sách phòng nằm ngang) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* CỘT TRÁI: BỘ LỌC CHUYÊN SÂU */}
          <div className="lg:col-span-1 space-y-5">
            {/* Khung bản đồ tương tác theo quận */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-3 space-y-2">
              <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  key={districtKey}
                  title={`Bản đồ ${formattedDistrictTitle}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentBbox}&layer=mapnik&marker=${currentCoord.lat},${currentCoord.lng}`}
                  className="w-full h-full"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>{formattedDistrictTitle}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Mở Google Maps tìm kiếm chính xác vị trí quận tại Hà Nội
                  window.open(`https://www.google.com/maps/search/phòng+trọ+${encodeURIComponent(formattedDistrictTitle)}+Hà+Nội`, '_blank');
                }}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Mở xem toàn màn hình bản đồ</span>
              </button>
            </div>

            {/* Khung lọc khoảng giá cho sinh viên */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Khoảng giá sinh viên</span>
                <span className="text-xs font-black text-blue-600">{maxPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={6000000}
                step={200000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>1 triệu</span>
                <span>3.5 triệu</span>
                <span>6 triệu+</span>
              </div>
            </div>

            {/* Tiện ích tòa nhà */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block pb-2 border-b border-slate-100">
                Tiện ích phòng trọ
              </span>
              <div className="space-y-2.5">
                {[
                  'Điều hòa',
                  'Nóng lạnh',
                  'Vệ sinh riêng khép kín',
                  'Khóa vân tay',
                  'Giờ tự do',
                  'Gác lửng',
                  'Ban công / Cửa sổ lớn',
                  'Thang máy',
                  'Chỗ để xe riêng'
                ].map((item) => {
                  const isChecked = selectedAmenities.includes(item);
                  return (
                    <label key={item} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(item)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className={isChecked ? 'font-bold text-blue-600' : 'font-medium'}>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THANH SẮP XẾP & DANH SÁCH THẺ DẠNG HORIZONTAL */}
          <div className="lg:col-span-3 space-y-4">

            {/* Thanh chọn sắp xếp giá */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-xs">
              <span className="text-xs font-semibold text-slate-600">
                Hiển thị kết quả phù hợp nhất
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="phu-hop">Phù hợp nhất</option>
                  <option value="gia-thap">Giá từ thấp đến cao</option>
                  <option value="gia-cao">Giá từ cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Danh sách phòng */}
            {sortedRooms.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  !
                </div>
                <h3 className="text-base font-bold text-slate-800">Không tìm thấy phòng trọ phù hợp</h3>
                <p className="text-xs text-slate-500">Vui lòng điều chỉnh khoảng giá hoặc chọn khu vực quận khác lân cận.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRooms.map((room) => {
                  const images = (room.HinhAnh && room.HinhAnh.length > 0)
                    ? room.HinhAnh
                    : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'];

                  return (
                    <div
                      key={room.Id}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-5 group"
                    >
                      {/* Cột 1 Thẻ: Ảnh chính và dải thumbnail */}
                      <div className="w-full md:w-64 shrink-0 space-y-2">
                        <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
                          <img
                            src={images[0]}
                            alt={room.TieuDe}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{images.length}</span>
                          </div>
                        </div>

                        {/* Thumbnail nhỏ */}
                        {images.length > 1 && (
                          <div className="grid grid-cols-4 gap-1.5">
                            {images.slice(0, 4).map((img, i) => (
                              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cột 2 Thẻ: Thông tin chi tiết ở giữa */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h2
                            onClick={() => onSelectRoom(room.Id)}
                            className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                          >
                            {room.TieuDe}
                          </h2>

                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{room.DiaChi}, {room.QuanHuyen}</span>
                          </p>

                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 pt-0.5">
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Maximize2 className="w-3 h-3 text-slate-500" />
                              {room.DienTich || 25} m²
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-bold ${room.TrangThai === 'Hết phòng'
                                ? 'text-rose-700 bg-rose-50'
                                : (room.TrangThai === 'Đã cọc' || room.TrangThai === 'Chờ chủ trọ xác nhận cọc')
                                  ? 'text-purple-700 bg-purple-50'
                                  : 'text-emerald-700 bg-emerald-50'
                              }`}>
                              {room.TrangThai || 'Còn phòng'}
                            </span>
                          </div>

                          {/* Tiện ích nổi bật dạng list nhỏ giống video */}
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-400 block mb-1">Tiện ích tòa nhà:</span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {(room.TienIch || ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Khóa vân tay']).slice(0, 4).map((t, idx) => (
                                <span key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                  <span className="truncate">{t}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Cam kết phòng thực tế 100% chính chủ</span>
                        </div>
                      </div>

                      {/* Cột 3 Thẻ: Mức giá & Nút Chọn phòng (Căn giữa cân bằng) */}
                      <div className="w-full md:w-48 shrink-0 flex md:flex-col items-center md:items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:px-4 space-y-3">
                        <div className="text-center">
                          <span className="text-xl font-extrabold text-blue-600 tabular-nums tracking-tight">
                            {room.GiaThue.toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectRoom(room.Id)}
                          className="w-full max-w-[130px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Chọn phòng</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Phân trang */}
            <div className="pt-6 flex items-center justify-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">
                1
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer">
                2
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* 4. FOOTER LIÊN KẾT NHANH CÁC QUẬN TẠI HÀ NỘI (GIỐNG VIDEO) */}
        <div className="pt-10 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Phòng trọ cho thuê theo quận tại Hà Nội
          </h3>
          <div className="flex flex-wrap gap-2">
            {HANOI_DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onNavigateDistrict(d);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${d.toLowerCase().includes(district.toLowerCase())
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};