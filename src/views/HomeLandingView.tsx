import React, { useEffect, useState } from 'react';
import { Room } from '../types';
import { 
  Search, 
  MapPin, 
  Maximize2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  HelpCircle 
} from 'lucide-react';

interface HomeLandingViewProps {
  onNavigate: (view: string) => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({ onNavigate }) => {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Phân trang: Cố định 3 trang, mỗi trang 3 mục (tổng tối đa 9 mục mẫu)
  const [roomPage, setRoomPage] = useState<number>(0);
  const [guidePage, setGuidePage] = useState<number>(0);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Chỉ lấy tối đa 9 phòng (đủ cho 3 trang x 3 phòng)
          setAllRooms(data.data.slice(0, 9));
        }
      })
      .catch(() => { });
  }, []);

  // Danh sách 9 bài cẩm nang mẫu (đủ chia đều đúng 3 trang)
  const allGuides = [
    // Trang 1
    {
      id: 1,
      date: '03/10/2026',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      title: '10 Kinh Nghiệm Thuê Phòng Trọ Hay Không Nên Bỏ Qua',
      desc: 'Tại các đô thị lớn như Hà Nội, nhu cầu thuê trọ rất lớn. Việc tìm thuê phòng trọ đối với tân sinh viên cần đặc biệt lưu ý kiểm tra thực tế...'
    },
    {
      id: 2,
      date: '28/09/2026',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      title: 'Cảnh Giác Các Thủ Đoạn Lừa Cọc Phòng Trọ Sinh Viên',
      desc: 'Tổng hợp các chiêu trò giả danh chủ nhà trọ yêu cầu chuyển cọc giữ chỗ khi chưa ký hợp đồng và cách phòng tránh an toàn nhất...'
    },
    {
      id: 3,
      date: '25/09/2026',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      title: 'Checklist Kiểm Tra Công Tơ Điện Nước Ngày Đầu Nhận Phòng',
      desc: 'Quy trình chụp ảnh chỉ số đồng hồ điện nước, biên bản bàn giao điều hòa, bình nóng lạnh giúp bạn tránh bị tính tiền oan khi dọn đi...'
    },
    // Trang 2
    {
      id: 4,
      date: '20/09/2026',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      title: 'Cách Nhận Biết Phòng Trọ Đảm Bảo Tiêu Chuẩn Phòng Cháy Chữa Cháy',
      desc: 'Hướng dẫn kiểm tra lối thoát hiểm thứ 2, thang dây thoát hiểm và hệ thống báo cháy tự động tại các khu chung cư mini sinh viên...'
    },
    {
      id: 5,
      date: '15/09/2026',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      title: 'Kinh Nghiệm Chọn Bạn Cùng Phòng Hợp Tính Cách, Không Xích Mích',
      desc: 'Những thỏa thuận cần thống nhất trước: phân chia tiền sinh hoạt, trực nhật vệ sinh phòng, giờ giấc đi lại và quy định tiếp khách...'
    },
    {
      id: 6,
      date: '10/09/2026',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      title: 'Những Điều Khoản Bắt Buộc Phải Có Trong Hợp Đồng Thuê Nhà',
      desc: 'Quy định rõ thời hạn hoàn trả tiền cọc khi chấm dứt hợp đồng, trách nhiệm sửa chữa đường ống nước và cam kết không tăng giá bất ngờ...'
    },
    // Trang 3
    {
      id: 7,
      date: '05/09/2026',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      title: 'Bí Quyết Decor Phòng Trọ Nhỏ Đẹp Tiết Kiệm Dưới 500k',
      desc: 'Gợi ý sắm kệ treo đồ thông minh, đèn ngủ decor ấm cúng và cách sắp xếp gác xép giúp tối ưu không gian sinh hoạt của sinh viên...'
    },
    {
      id: 8,
      date: '01/09/2026',
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      title: 'Mẹo Tiết Kiệm Điện Hiệu Quả Cho Sinh Viên Thuê Trọ',
      desc: 'Cài đặt nhiệt độ điều hòa hợp lý từ 26-28 độ, ngắt cầu dao bình nóng lạnh sau khi bật 15 phút giúp giảm một nửa tiền điện hàng tháng...'
    },
    {
      id: 9,
      date: '28/08/2026',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      title: 'Quy Trình Đăng Ký Tạm Trú Tạm Vắng Dành Cho Sinh Viên Mới',
      desc: 'Thủ tục khai báo online trên Cổng Dịch vụ công Quốc gia, các giấy tờ cần chủ nhà cung cấp để tránh bị xử phạt hành chính...'
    }
  ];

  // Cắt danh sách theo trang hiện tại (3 mục mỗi trang)
  const currentRooms = allRooms.slice(roomPage * 3, roomPage * 3 + 3);
  const currentGuides = allGuides.slice(guidePage * 3, guidePage * 3 + 3);

  return (
    <div className="space-y-16">
      {/* 1. Hero Banner Section */}
      <section
        className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden border-b border-slate-100"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 backdrop-blur-[1.5px]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50/90 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold shadow-2xs">
            <span>Nền tảng tìm phòng trọ dành cho sinh viên Hà Nội</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Tìm phòng trọ sinh viên tiện nghi,{' '}
            <span className="text-blue-600 block sm:inline">giá chuẩn – không qua trung gian</span>
          </h1>
          
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate('find-rooms-public')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>Khám phá phòng trọ ngay</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Rooms Showcase (Có chuyển 3 trang + mũi tên) */}
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
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Khung trượt có mũi tên điều hướng hai bên */}
        <div className="relative">
          {/* Mũi tên trái */}
          <button
            type="button"
            disabled={roomPage === 0}
            onClick={() => setRoomPage((prev) => Math.max(0, prev - 1))}
            className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all ${
              roomPage === 0 
                ? 'opacity-30 cursor-not-allowed text-slate-300' 
                : 'hover:bg-slate-50 text-slate-700 hover:scale-105 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Mũi tên phải */}
          <button
            type="button"
            disabled={roomPage === 2}
            onClick={() => setRoomPage((prev) => Math.min(2, prev + 1))}
            className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all ${
              roomPage === 2 
                ? 'opacity-30 cursor-not-allowed text-slate-300' 
                : 'hover:bg-slate-50 text-slate-700 hover:scale-105 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Grid 3 phòng của trang hiện tại */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
            {currentRooms.map((room) => (
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
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-xl text-xs hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thanh phân trang 3 chấm/thanh (Trang 1, 2, 3) */}
        <div className="flex justify-center items-center gap-2 mt-7">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setRoomPage(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                roomPage === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Trang ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 3. Cẩm nang Thuê phòng (Chuyển 3 trang + mũi tên + thẻ xanh biển) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cẩm nang Thuê phòng
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Khung trượt cẩm nang có 2 mũi tên */}
        <div className="relative">
          {/* Mũi tên trái */}
          <button
            type="button"
            disabled={guidePage === 0}
            onClick={() => setGuidePage((prev) => Math.max(0, prev - 1))}
            className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all ${
              guidePage === 0 
                ? 'opacity-30 cursor-not-allowed text-slate-300' 
                : 'hover:bg-slate-50 text-slate-700 hover:scale-105 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Mũi tên phải */}
          <button
            type="button"
            disabled={guidePage === 2}
            onClick={() => setGuidePage((prev) => Math.min(2, prev + 1))}
            className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all ${
              guidePage === 2 
                ? 'opacity-30 cursor-not-allowed text-slate-300' 
                : 'hover:bg-slate-50 text-slate-700 hover:scale-105 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Grid 3 thẻ của trang hiện tại */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
            {currentGuides.map((item) => (
              <div 
                key={item.id}
                onClick={() => onNavigate('guide')}
                className="group cursor-pointer flex flex-col overflow-hidden rounded-3xl transition-transform hover:-translate-y-1 duration-200 shadow-xs hover:shadow-md"
              >
                <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                    {item.date}
                  </span>
                </div>
                {/* Phần chân thẻ màu xanh biển chuẩn đồng bộ web */}
                <div className="bg-blue-600 p-5 text-white rounded-b-3xl flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/90 mt-2 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thanh phân trang 3 chấm/thanh (Trang 1, 2, 3) */}
        <div className="flex justify-center items-center gap-2 mt-7">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setGuidePage(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                guidePage === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Trang ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 4. Câu hỏi thường gặp (FAQ Accordion) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp thắc mắc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Câu hỏi thường gặp khi thuê phòng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Những thông tin quan trọng giúp sinh viên hoàn toàn yên tâm khi sử dụng HostelHub
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Sinh viên tìm phòng và liên hệ xem phòng có mất khoản phí nào không?',
              a: 'Hoàn toàn KHÔNG. HostelHub miễn phí 100% cho sinh viên. Bạn có thể tự do tìm kiếm, lọc theo bán kính trường đại học, xem số điện thoại và nhắn tin Zalo trực tiếp với chủ trọ mà không mất bất kỳ đồng phí môi giới nào.'
            },
            {
              q: 'Làm thế nào để chắc chắn phòng trọ trên website là phòng chính chủ, có thật?',
              a: 'Tất cả các tin đăng của chủ trọ trước khi hiển thị công khai đều qua kiểm duyệt số điện thoại xác thực, khảo sát địa chỉ thực tế và kiểm tra ảnh phòng đúng thực trạng.'
            },
            {
              q: 'Nếu đến xem phòng mà thực tế không đúng như mô tả trên trang web thì sao?',
              a: 'Bạn có quyền từ chối thuê ngay lập tức. Đồng thời bạn có thể bấm nút "Báo cáo tin đăng" ngay tại trang chi tiết phòng đó để ban quản trị tiến hành khóa vĩnh viễn tin đăng của chủ nhà vi phạm.'
            },
            {
              q: 'Tiền cọc phòng được quy định và bảo vệ an toàn như thế nào?',
              a: 'Mọi khoản đặt cọc đều được ghi nhận bằng lịch hẹn rõ ràng và hợp đồng có chữ ký biên nhận giữa bạn và chủ nhà trọ, cam kết hoàn trả đầy đủ theo đúng thỏa thuận nếu phòng không đảm bảo như cam kết ban đầu.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};