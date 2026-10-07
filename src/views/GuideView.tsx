import React from 'react';
import { ShieldAlert, AlertTriangle, Clock, BookOpen, FileCheck, CheckCircle2 } from 'lucide-react';

export const GuideView: React.FC = () => {
  const guides = [
    {
      id: 1,
      tag: 'Cảnh báo lừa đảo',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: '5 thủ đoạn lừa cọc phòng trọ tân sinh viên hay gặp nhất',
      desc: 'Giả danh chủ trọ giục chuyển cọc giữ chỗ khi chưa xem phòng thực tế, chèo kéo ký hợp đồng ma kèm phụ phí bất hợp lý.',
      author: 'Ban Quản Trị HostelHub',
      readTime: '4 phút đọc'
    },
    {
      id: 2,
      tag: 'Kinh nghiệm nhận phòng',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Cách chốt số điện nước & công tơ chính xác ngày đầu dọn vào',
      desc: 'Quy trình chụp ảnh công tơ điện, lập biên bản bàn giao thiết bị (điều hòa, bình nóng lạnh) để không phải đền bù khi trả phòng.',
      author: 'Hội Sinh Viên',
      readTime: '3 phút đọc'
    },
    {
      id: 3,
      tag: 'Pháp lý hợp đồng',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Mẫu hợp đồng thuê trọ chuẩn pháp lý kèm lưu ý đặt cọc',
      desc: 'Quy định về thời hạn hoàn trả cọc, điều khoản báo trước khi chuyển đi 30 ngày và trách nhiệm sửa chữa hỏng hóc tự nhiên.',
      author: 'Tư vấn pháp lý',
      readTime: '6 phút đọc'
    },
    {
      id: 4,
      tag: 'An toàn phòng cháy',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Tiêu chí kiểm tra lối thoát hiểm và PCCC ở chung cư mini',
      desc: 'Những điểm cần quan sát kỹ: thang thoát hiểm ngoài trời, bình cứu hỏa hành lang, chuông báo khói tự động và cửa chống cháy.',
      author: 'Kỹ sư an toàn',
      readTime: '5 phút đọc'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Cẩm nang bỏ túi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cẩm nang & Kinh nghiệm thuê trọ</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Trang bị kiến thức pháp lý, bí quyết kiểm tra phòng thực tế và các lưu ý quan trọng giúp sinh viên tìm nơi ở an toàn, minh bạch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {guides.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block mb-3 ${item.tagColor}`}>
                {item.tag}
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors cursor-pointer">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{item.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.readTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-sm">Lưu ý an toàn từ HostelHub:</p>
          <p>1. Tuyệt đối không chuyển cọc online khi chưa trực tiếp khảo sát phòng và kiểm tra giấy tờ CCCD của chủ nhà.</p>
          <p>2. Đọc kỹ từng điều khoản phụ phí (điện nước, wifi, gửi xe, vệ sinh) trước khi đặt bút ký hợp đồng.</p>
        </div>
      </div>
    </div>
  );
};