import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle, 
  Heart, 
  Share2, 
  Flag,
  ArrowLeft,
  CheckCircle2,
  Video,
  Play,
  ExternalLink
} from 'lucide-react';
import { TinOGhep } from '../utils/roommatesData';
import { parseVideoUrl } from '../utils/video';

interface RoommateDetailViewProps {
  post: TinOGhep;
  allPosts: TinOGhep[];
  onBack: () => void;
  onSelectPost: (post: TinOGhep) => void;
  onSelectDistrict?: (district: string) => void;
}

// 8 Quận sinh viên trọng điểm tại Hà Nội
const DISTRICT_LINKS = [
  'Cầu Giấy',
  'Đống Đa',
  'Hai Bà Trưng',
  'Ba Đình',
  'Thanh Xuân',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông'
];

export const RoommateDetailView: React.FC<RoommateDetailViewProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
  onSelectDistrict
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Lọc các tin liên quan trong cùng quận (loại trừ tin hiện tại)
  const relatedPosts = allPosts.filter(
    (p) => p.QuanHuyen === post.QuanHuyen && p.Id !== post.Id
  );

  const nextImg = () => {
    setCurrentImgIndex((prev) => (prev + 1) % post.HinhAnh.length);
  };

  const prevImg = () => {
    setCurrentImgIndex((prev) => (prev - 1 + post.HinhAnh.length) % post.HinhAnh.length);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb & Nút quay lại */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </button>
          <span>/</span>
          <span>Tìm người ở ghép</span>
          <span>/</span>
          <span className="font-medium text-slate-700">Hà Nội</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Quận {post.QuanHuyen}</span>
        </div>

        {/* Khối chính 2 cột: Cột trái nội dung tin & Cột phải tác giả */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (8/12) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6">
            
            {/* Slider ảnh lớn */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-900">
              <img
                src={post.HinhAnh[currentImgIndex]}
                alt={post.TieuDe}
                className="w-full h-full object-cover"
              />
              {post.HinhAnh.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium">
                    {currentImgIndex + 1} / {post.HinhAnh.length}
                  </div>
                </>
              )}
            </div>

            {/* Tiêu đề & Mức giá, diện tích */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {post.TieuDe}
              </h1>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-2xl font-black text-rose-600">
                    {post.GiaThue.toLocaleString('vi-VN')} đ/tháng
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Diện tích: <strong className="text-slate-900 font-bold">{post.DienTich} m²</strong>
                </div>
                <div className="text-xs text-slate-400">
                  Cập nhật: {post.NgayCapNhat}
                </div>
              </div>
            </div>

            {/* Bảng thông tin chi tiết */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Đặc điểm tin đăng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Quận huyện:</span>
                  <span className="font-semibold text-blue-600">{post.QuanHuyen}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tỉnh thành:</span>
                  <span className="font-semibold text-slate-800">Hà Nội</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Đối tượng ghép:</span>
                  <span className="font-semibold text-slate-800">{post.DoiTuongGhep}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Mã tin:</span>
                  <span className="font-semibold text-slate-800">#{post.Id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Ngày đăng:</span>
                  <span className="font-semibold text-slate-800">{post.NgayDang}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Ngày hết hạn:</span>
                  <span className="font-semibold text-slate-800">{post.NgayHetHan}</span>
                </div>
              </div>

              <div className="pt-2 text-xs flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Địa chỉ:</strong> {post.DiaChi}</span>
              </div>
            </div>

            {/* Tiện ích nổi bật */}
            {post.TienNghi && post.TienNghi.length > 0 && (
              <div className="space-y-3 pt-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Nổi bật
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {post.TienNghi.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video thực tế phòng ở ghép (nếu có) */}
            {post.VideoUrl && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>Video thực tế phòng trọ</span>
                  </h3>
                  <a
                    href={post.VideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mở tab mới</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {(() => {
                  const parsed = parseVideoUrl(post.VideoUrl);
                  return (
                    <div className="space-y-2">
                      <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                        {parsed.isIframe ? (
                          <iframe
                            src={parsed.embedUrl}
                            title="Video thực tế phòng ở ghép"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : parsed.type === 'direct' ? (
                          <video controls src={parsed.embedUrl} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs p-6 text-center space-y-3">
                            <Play className="w-10 h-10 text-rose-500" />
                            <p className="text-slate-300">Video lưu trữ ngoài nền tảng.</p>
                            <a
                              href={parsed.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span>Bấm để xem video</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block text-right">
                        Nguồn video: {parsed.type === 'gdrive' ? 'Google Drive' : parsed.type === 'youtube' ? 'YouTube' : 'Trực tiếp'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Thông tin mô tả */}
            <div className="space-y-3 pt-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Thông tin mô tả
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {post.MoTa}
              </div>
            </div>

            {/* Lưu ý an toàn cho sinh viên */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">Lưu ý khi tìm người ở ghép:</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Gặp mặt trực tiếp khảo sát phòng, đối soát căn cước công dân và lập bản thỏa thuận rõ ràng về giờ giấc, chi phí sinh hoạt trước khi chuyển tiền đặt cọc giữ chỗ.
                </p>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (4/12): Thông tin tác giả & Liên hệ */}
          <div className="lg:col-span-4 space-y-5">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5 text-center">
              {/* Avatar & Tên */}
              <div className="space-y-2">
                <div className="w-18 h-18 rounded-full bg-blue-50 text-blue-600 font-black text-2xl flex items-center justify-center mx-auto border-2 border-blue-200">
                  {post.TacGia.Ten[0]}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {post.TacGia.Ten}
                </h3>
                <p className="text-xs text-slate-400">
                  {post.TacGia.TrangThai} • Tham gia từ {post.TacGia.NgayThamGia}
                </p>
              </div>

              {/* Nút hành động liên hệ nổi bật */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={`tel:${post.TacGia.Sdt}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{post.TacGia.Sdt}</span>
                </a>

                <a
                  href={`https://zalo.me/${post.TacGia.Zalo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Zalo</span>
                </a>
              </div>

              {/* Nút phụ: Lưu tin, Báo xấu */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs font-semibold text-slate-500">
                <button type="button" className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span>Lưu tin</span>
                </button>
                <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ</span>
                </button>
                <button type="button" className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer">
                  <Flag className="w-4 h-4" />
                  <span>Báo xấu</span>
                </button>
              </div>
            </div>

            {/* Huy hiệu an toàn HostelHub */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-blue-900 block">Xác thực bởi HostelHub</span>
                <span className="text-blue-700 text-[11px]">Thông tin số điện thoại chính chủ đã được đối chiếu an toàn.</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MỤC 1: TIN ĐĂNG CÙNG KHU VỰC                              */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Tin đăng cùng khu vực Quận {post.QuanHuyen}
            </h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {relatedPosts.length} tin liên quan
            </span>
          </div>

          {relatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedPosts.slice(0, 4).map((item) => (
                <div
                  key={item.Id}
                  onClick={() => {
                    onSelectPost(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl border border-slate-200/70 hover:border-blue-400 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={item.HinhAnh[0]}
                      alt={item.TieuDe}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Ghép {item.DoiTuongGhep}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.TieuDe}
                    </h4>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-rose-600 tabular-nums">
                        {item.GiaThue.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.DienTich} m²
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-2">
              Hiện tại chưa có tin đăng ở ghép nào khác cùng Quận {post.QuanHuyen}.
            </p>
          )}
        </div>

        {/* ========================================================= */}
        {/* MỤC 2: XEM THEO QUẬN HUYỆN KHÁC                           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
            Xem theo quận huyện khác
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 pt-1">
            {DISTRICT_LINKS.map((district) => {
              const isCurrent = district === post.QuanHuyen;
              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => {
                    if (onSelectDistrict) {
                      onSelectDistrict(district);
                    } else {
                      onBack();
                    }
                  }}
                  className={`text-left text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer group ${
                    isCurrent 
                      ? 'text-blue-600 font-bold' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <span className={`text-[11px] transition-transform group-hover:translate-x-0.5 ${isCurrent ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                    ›
                  </span>
                  <span>Tìm ở ghép {district}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};