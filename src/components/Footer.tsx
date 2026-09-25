import React from 'react';
import { Home, ShieldCheck, Mail, Phone, Info } from 'lucide-react';

export const Footer: React.FC<{ onSelectView?: (view: string) => void }> = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Hostel<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cổng thông tin kết nối và quản lý phòng trọ sinh viên tiện nghi, bảo mật, minh bạch giá cả tại các làng đại học.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dữ liệu phòng trọ xác thực 100%</span>
            </div>
          </div>

          {/* Col 2: Quick Demo Accounts */}
          <div className="md:col-span-2 bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-semibold text-blue-900 text-xs mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>3 TÀI KHOẢN MẪU KIỂM THỬ (MẬT KHẨU SẴN SÀNG)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                <div className="font-semibold text-slate-900">🎓 Sinh viên</div>
                <div className="text-slate-500 font-mono mt-0.5 truncate text-[11px]">sinhvien@hostelhub.vn</div>
                <div className="text-blue-600 font-mono text-[11px] font-semibold mt-0.5">pass: 123456</div>
                <div className="text-[10px] text-slate-400 mt-1">Tìm & đặt cọc phòng</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                <div className="font-semibold text-slate-900">🏢 Chủ trọ</div>
                <div className="text-slate-500 font-mono mt-0.5 truncate text-[11px]">chutro@hostelhub.vn</div>
                <div className="text-blue-600 font-mono text-[11px] font-semibold mt-0.5">pass: 123456</div>
                <div className="text-[10px] text-slate-400 mt-1">Đăng & quản lý phòng</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                <div className="font-semibold text-slate-900">⚡ Quản trị viên</div>
                <div className="text-slate-500 font-mono mt-0.5 truncate text-[11px]">admin@hostelhub.vn</div>
                <div className="text-purple-600 font-mono text-[11px] font-semibold mt-0.5">pass: admin123</div>
                <div className="text-[10px] text-slate-400 mt-1">Quản trị toàn hệ thống</div>
              </div>
            </div>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-slate-900 mb-2">Hỗ trợ sinh viên 24/7</div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Hotline: 1900 8899 (Miễn cước)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>hotro@hostelhub.vn</span>
            </div>
            <p className="text-slate-400 pt-2 text-[11px]">
              Khu vực hỗ trợ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Cần Thơ.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} HostelHub. Nền tảng công nghệ tìm và quản lý trọ sinh viên.</p>
          <div className="flex gap-4">
            <span>Quy định bảo mật</span>
            <span>·</span>
            <span>Điều khoản sử dụng</span>
            <span>·</span>
            <span>Hướng dẫn an toàn thuê phòng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
