import React from 'react';
import { Home, ShieldCheck, Phone, Mail, CheckCircle2, Lock, FileText, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectView?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView }) => {
  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Cột 1: Thông tin thương hiệu HostelHub */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-2xs">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Hostel<span className="text-blue-600">Hub</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Nền tảng công nghệ kết nối trực tiếp sinh viên và chủ nhà trọ tại Hà Nội. Cam kết minh bạch giá thuê, hỗ trợ khảo sát thực tế và bảo vệ an toàn dòng tiền cọc.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Hệ thống phòng trọ kiểm duyệt thực tế</span>
            </div>
          </div>

          {/* Cột 2: Khối thay thế 3 tài khoản mẫu - CAM KẾT VẬN HÀNH AN TOÀN */}
          <div className="md:col-span-5 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Tiêu chuẩn bảo vệ sinh viên thuê trọ
            </span>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold text-xs block">Minh bạch chi phí điện nước:</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Đơn giá điện, nước, internet và phí dịch vụ được công khai rõ ràng trên hợp đồng.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold text-xs block">Giữ cọc an toàn có biên nhận:</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Bảo lưu chỗ ở uy tín, có lịch hẹn xem phòng và xác nhận từ chủ nhà trọ.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold text-xs block">Hỗ trợ pháp lý thuê nhà:</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Cung cấp sẵn mẫu hợp đồng chuẩn quy định pháp luật giúp hạn chế tranh chấp.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 3: Hỗ trợ sinh viên 24/7 (Đã lược bỏ dòng khu vực nhiều tỉnh thành) */}
          <div className="md:col-span-3 space-y-3.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Trung tâm hỗ trợ sinh viên
            </span>

            <div className="space-y-2.5 text-xs">
              <a
                href="tel:19008899"
                className="flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tổng đài giải đáp (Miễn cước)</span>
                  <span className="font-bold text-slate-900 text-sm">1900 8899</span>
                </div>
              </a>

              <a
                href="mailto:hotro@hostelhub.vn"
                className="flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hộp thư hỗ trợ sự cố</span>
                  <span className="font-semibold text-slate-800">hotro@hostelhub.vn</span>
                </div>
              </a>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Thời gian trực hotline: 08:00 - 21:00 hàng ngày (kể cả Thứ 7 & CN).
            </div>
          </div>

        </div>

        {/* Thanh bản quyền & Liên kết điều khoản chân trang */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © 2026 HostelHub. Nền tảng công nghệ tìm và quản lý trọ sinh viên Hà Nội.
          </div>
          <div className="flex items-center gap-5">
            <button 
              type="button" 
              onClick={() => onSelectView && onSelectView('guide')} 
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Quy định bảo mật
            </button>
            <button 
              type="button" 
              onClick={() => onSelectView && onSelectView('guide')} 
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            <button 
              type="button" 
              onClick={() => onSelectView && onSelectView('guide')} 
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Hướng dẫn an toàn thuê phòng
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};