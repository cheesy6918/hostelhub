import React from 'react';
import { 
  ArrowLeft, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Smartphone 
} from 'lucide-react';

export interface Article {
  Id: string;
  TieuDe: string;
  Tag: string;
  MoTaNgan: string;
  NoiDung1: string;
  NoiDung2: string;
  TacGia: string;
  ThoiGianDoc: string;
  NgayDang: string;
  HinhAnh: string;
  HinhAnhPhu?: string;
}

interface GuideDetailViewProps {
  article: Article;
  allArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
}

export const GuideDetailView: React.FC<GuideDetailViewProps> = ({
  article,
  allArticles,
  onBack,
  onSelectArticle,
}) => {
  const otherArticles = allArticles.filter((a) => a.Id !== article.Id).slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-16 animate-in fade-in duration-200">
      {/* Nút quay lại danh sách bài viết */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tất cả bài viết</span>
        </button>
      </div>

      {/* 1. Header bài viết căn giữa */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 text-center space-y-3">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block">
          {article.Tag}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {article.TieuDe}
        </h1>
      </header>

      {/* 2. Ảnh bìa chính */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-10">
        <div className="aspect-16/10 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <img 
            src={article.HinhAnh} 
            alt={article.TieuDe} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Thân bài viết */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 text-slate-600 text-sm leading-relaxed">
        <p className="text-slate-800 font-medium text-base sm:text-lg leading-relaxed">
          {article.MoTaNgan}
        </p>

        <p className="whitespace-pre-line">
          {article.NoiDung1}
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-4 leading-snug">
          Lưu ý quan trọng trong quá trình kiểm tra và ký kết
        </h2>

        <p>
          Mọi sự chuẩn bị kỹ lưỡng trước khi nhận phòng sẽ giúp bạn tránh khỏi những mâu thuẫn không đáng có với chủ trọ sau này. Hãy luôn giữ tinh thần cẩn trọng và ưu tiên sự an toàn của bản thân lên hàng đầu.
        </p>

        {article.HinhAnhPhu && (
          <div className="my-8 rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-16/9">
            <img 
              src={article.HinhAnhPhu} 
              alt="Minh họa thực tế" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <p className="whitespace-pre-line">
          {article.NoiDung2}
        </p>

        {/* 4. Thanh Tác giả & Chia sẻ Social */}
        <div className="pt-8 mt-10 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {article.TacGia.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{article.TacGia}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>{article.NgayDang}</span>
                <span>·</span>
                <span>{article.ThoiGianDoc}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Chia sẻ:</span>
            <button 
              onClick={() => alert('Đã sao chép liên kết bài viết!')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Chia sẻ Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('Đã sao chép liên kết bài viết!')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Chia sẻ Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('Đã sao chép liên kết bài viết!')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Chia sẻ LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* 5. Banner kêu gọi hành động */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 my-16">
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Sẵn sàng tìm phòng trọ ưng ý?
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Khám phá hàng trăm phòng trọ sinh viên đã xác minh chính chủ, an ninh tốt và giá cả minh bạch tại Hà Nội ngay hôm nay.
            </p>
            <div className="pt-2">
              <button
                onClick={onBack}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Khám phá phòng trọ ngay</span>
              </button>
            </div>
          </div>

          <div className="w-full sm:w-60 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 shrink-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-800">HostelHub</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl text-[10px] text-blue-700 font-semibold text-center">
              ✓ 100% Xác thực chính chủ
            </div>
          </div>
        </div>
      </div>

      {/* 6. Danh sách bài viết liên quan */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 border-t border-slate-200">
        <h3 className="text-xl font-extrabold text-slate-900 mb-6 text-center sm:text-left">
          Các bài viết liên quan có thể bạn quan tâm
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherArticles.map((item) => (
            <div
              key={item.Id}
              onClick={() => onSelectArticle(item)}
              className="rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group active:scale-[0.99]"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.HinhAnh}
                  alt={item.TieuDe}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-slate-800 shadow-xs">
                  {item.NgayDang}
                </div>
              </div>

              <div className="bg-blue-600 text-white p-5 flex-1 flex flex-col justify-between space-y-2">
                <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-blue-100 transition-colors">
                  {item.TieuDe}
                </h4>
                <div className="pt-2 text-[11px] text-blue-200 flex items-center justify-between border-t border-blue-500/50">
                  <span>{item.Tag}</span>
                  <span className="font-semibold text-white group-hover:translate-x-1 transition-transform">
                    Đọc tiếp →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};