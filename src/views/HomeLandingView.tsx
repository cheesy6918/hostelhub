import React, { useEffect, useState } from 'react';
import { Room } from '../types';
import { Search, MapPin, Maximize2, ShieldCheck, CheckCircle2, ArrowRight, Building2, GraduationCap, Sparkles } from 'lucide-react';

interface HomeLandingViewProps {
  onNavigate: (view: string) => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({ onNavigate }) => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedRooms(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 text-blue-800 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Nền tảng tìm phòng trọ số 1 dành cho sinh viên Việt Nam</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Tìm phòng trọ sinh viên tiện nghi, <span className="text-blue-600">giá chuẩn - không qua trung gian</span>
            </h1>

            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Kết nối trực tiếp sinh viên với các chủ nhà trọ uy tín quanh các trường Đại học lớn. Minh bạch chi phí điện nước, tự do giờ giấc, đặt cọc giữ chỗ an toàn.
            </p>

            {/* Quick Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('find-rooms-public')}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Khám phá phòng trọ ngay</span>
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Tôi là chủ trọ muốn đăng tin</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% phòng trọ được xác thực</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Không mất phí môi giới</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tặng 2.000.000 VNĐ ví trải nghiệm</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Rooms Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Phòng mới nổi bật</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Phòng trọ sinh viên gần trường đại học
            </h2>
          </div>
          <button
            onClick={() => onNavigate('find-rooms-public')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRooms.map((room) => (
            <div
              key={room.Id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="h-44 relative overflow-hidden bg-slate-900 text-white flex flex-col justify-between p-4">
                {room.HinhAnh && room.HinhAnh.length > 0 ? (
                  <img
                    src={room.HinhAnh[0]}
                    alt={room.TieuDe}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                <div className="flex items-center justify-between z-10">
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg">
                    {room.LoaiPhong}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${
                    room.TrangThai === 'Còn phòng' || room.TrangThai === 'Công khai'
                      ? 'bg-emerald-600/90 text-white'
                      : room.TrangThai === 'Hết phòng'
                      ? 'bg-rose-600/90 text-white'
                      : 'bg-amber-500/90 text-white'
                  }`}>
                    {room.TrangThai === 'Còn phòng' || room.TrangThai === 'Công khai'
                      ? 'Còn trống'
                      : room.TrangThai === 'Đã cọc' || room.TrangThai === 'Chờ chủ trọ xác nhận cọc'
                      ? 'Đã đặt'
                      : room.TrangThai}
                  </span>
                </div>
                <div className="z-10">
                  <div className="text-2xl font-bold tabular-nums">
                    {room.GiaThue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-blue-200">đ/tháng</span>
                  </div>
                  <div className="text-xs text-blue-200 flex items-center gap-1.5 mt-0.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Diện tích {room.DienTich} m²</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {room.TieuDe}
                  </h3>
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{room.DiaChi}, {room.QuanHuyen}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Chủ trọ: <strong>{room.ChuTroTen}</strong></span>
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-xl text-xs hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quy trình thuê phòng 3 bước siêu tốc</h2>
            <p className="text-xs text-slate-500 mt-1">Đơn giản, an tâm cho tân sinh viên và sinh viên năm cuối</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Tìm phòng theo trường & khu vực</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lọc phòng trọ theo bán kính trường học, ngân sách chi trả mỗi tháng và tiện ích mong muốn (máy lạnh, gác lửng, giờ giấc).
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Kết nối Zalo & Hẹn xem phòng</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhắn tin hẹn giờ trực tiếp tới chủ trọ hoặc gọi điện thoại chỉ với 1 chạm. Không lo gặp môi giới giả mạo hay cò mồi.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Đặt cọc giữ phòng an toàn</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đặt cọc online qua ví điện tử minh bạch. Số tiền cọc được đảm bảo cho đến khi bạn hoàn tất hợp đồng dọn vào ở.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
