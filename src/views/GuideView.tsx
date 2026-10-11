import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GuideDetailView, Article } from './GuideDetailView';
import { ARTICLES_DATA } from '../utils/articlesData';

const CATEGORIES = ['Tất cả bài viết', 'Cảnh báo lừa đảo', 'Kinh nghiệm thuê phòng', 'Kinh nghiệm nhận phòng', 'Pháp lý hợp đồng', 'An toàn PCCC'];

interface GuideViewProps {
  initialArticleId?: string | null;
  onClearInitialArticle?: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ initialArticleId, onClearInitialArticle }) => {
  // Tự động tìm và mở bài viết nếu được truyền ID từ trang chủ vào
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialArticleId) {
      return ARTICLES_DATA.find((a) => a.Id === initialArticleId) || null;
    }
    return null;
  });

  const [selectedCategory, setSelectedCategory] = useState('Tất cả bài viết');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 9; // 9 bài

  // 1. Khai báo filteredArticles TRƯỚC
  const filteredArticles = selectedCategory === 'Tất cả bài viết'
    ? ARTICLES_DATA
    : ARTICLES_DATA.filter((a) => a.Tag.toLowerCase().includes(selectedCategory.toLowerCase()));

  // 2. Rồi mới tính totalPages và paginatedArticles dựa trên filteredArticles
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 3. Hàm đổi danh mục
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  // Nút quay lại trang danh sách cẩm nang
  const handleBack = () => {
    setSelectedArticle(null);
    if (onClearInitialArticle) onClearInitialArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Nếu người dùng chọn bài viết -> Chuyển sang Component GuideDetailView riêng biệt
  if (selectedArticle) {
    return (
      <GuideDetailView
        article={selectedArticle}
        allArticles={ARTICLES_DATA}
        onBack={handleBack}
        onSelectArticle={(article) => {
          setSelectedArticle(article);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Danh sách bài viết dạng lưới 3 cột (Blog Main Page)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cẩm nang & Kinh nghiệm thuê trọ
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
          Khám phá những kiến thức pháp lý, kinh nghiệm khảo sát phòng thực tế và các lưu ý an toàn dành cho sinh viên.
        </p>
      </div>

      {/* Thanh tiêu đề và bộ lọc danh mục tinh gọn */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            Tất cả bài viết
          </span>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {filteredArticles.length} bài
          </span>
        </div>

        {/* Dropdown danh mục bên phải */}
        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer shadow-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedArticles.map((article) => (
          <div
            key={article.Id}
            onClick={() => {
              setSelectedArticle(article);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group active:scale-[0.99]"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
              <img
                src={article.HinhAnh}
                alt={article.TieuDe}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-slate-800 shadow-xs flex items-center gap-1.5">
                <span>{article.NgayDang}</span>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-blue-100 transition-colors">
                  {article.TieuDe}
                </h3>
                <p className="text-xs text-blue-100 line-clamp-3 leading-relaxed">
                  {article.MoTaNgan}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-blue-200 flex items-center justify-between border-t border-blue-500/50">
                <span>{article.Tag}</span>
                <span className="font-semibold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Đọc tiếp →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang động hoạt động thực tế */}
      <div className="pt-6 flex items-center justify-center gap-2">
        {/* Nút lùi về trang trước */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage((prev) => Math.max(1, prev - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${
            currentPage === 1
              ? 'opacity-30 cursor-not-allowed text-slate-300'
              : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Các số trang 1, 2, 3... */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => {
              setCurrentPage(pageNum);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600 border border-transparent'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Nút sang trang sau */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage((prev) => Math.min(totalPages, prev + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${
            currentPage === totalPages
              ? 'opacity-30 cursor-not-allowed text-slate-300'
              : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};