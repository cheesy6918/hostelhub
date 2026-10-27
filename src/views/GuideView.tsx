import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { GuideDetailView, Article } from './GuideDetailView';
import { ARTICLES_DATA } from '../utils/articlesData';

const CATEGORIES = [
  'Tất cả bài viết',
  'Kinh nghiệm thuê phòng',
  'Kinh nghiệm cho thuê',
  'Cảnh báo lừa đảo đặt cọc',
  'Mẹo tiết kiệm & Decor phòng'
];

interface GuideViewProps {
  initialArticleId?: string | null;
  onClearInitialArticle?: () => void;
  initialCategory?: string;
  onBackToHome?: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({
  initialArticleId,
  onClearInitialArticle,
  initialCategory,
  onBackToHome,
}) => {
  // 1. Quản lý danh sách bài viết khởi tạo mặc định bằng ARTICLES_DATA
  const [articlesList, setArticlesList] = useState<Article[]>(() => ARTICLES_DATA || []);

  // Tải danh sách bài viết từ API và gộp thông minh với danh sách bài mẫu mặc định
  useEffect(() => {
    fetch(`/api/articles?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const serverArticles: Article[] = data.data;
          
          // Ưu tiên bài mới từ server đặt lên đầu danh sách
          const combined: Article[] = [...serverArticles];

          // Gộp các bài mẫu mặc định từ ARTICLES_DATA nếu chưa tồn tại
          (ARTICLES_DATA || []).forEach((defArticle: any) => {
            const isExisted = combined.some(
              (item: any) =>
                String(item.Id ?? item.id ?? '') === String(defArticle.Id ?? defArticle.id ?? '') ||
                (item.TieuDe && defArticle.TieuDe && item.TieuDe.trim().toLowerCase() === defArticle.TieuDe.trim().toLowerCase())
            );

            if (!isExisted) {
              combined.push({
                ...defArticle,
                TrangThai: defArticle.TrangThai || 'Công khai',
              });
            }
          });

          setArticlesList(combined);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải bài viết cẩm nang từ API:', err);
      });
  }, []);

  // Hàm tìm kiếm bài viết theo ID dựa trên danh sách articlesList động
  const findArticleById = (id?: string | null): Article | null => {
    if (!id) return null;
    return (
      articlesList.find((a: any) => String(a.Id ?? a.id ?? '') === String(id)) || null
    );
  };

  // Khởi tạo bài viết chi tiết nếu có initialArticleId truyền vào
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() =>
    findArticleById(initialArticleId)
  );

  // Khởi tạo danh mục hiển thị
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && initialCategory !== 'Tất cả' ? initialCategory : 'Tất cả bài viết'
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 9;

  // Luôn đồng bộ và mở bài viết khi initialArticleId hoặc articlesList thay đổi
  useEffect(() => {
    if (initialArticleId) {
      const article = findArticleById(initialArticleId);
      if (article) {
        setSelectedArticle(article);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [initialArticleId, articlesList]);

  // Cập nhật danh mục khi người dùng đổi danh mục từ bên ngoài Navbar
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory === 'Tất cả' ? 'Tất cả bài viết' : initialCategory);
      setCurrentPage(1);
      if (!initialArticleId) {
        setSelectedArticle(null);
      }
    }
  }, [initialCategory, initialArticleId]);

  // Lọc bài viết theo danh mục từ danh sách articlesList
  const filteredArticles =
    selectedCategory === 'Tất cả bài viết'
      ? articlesList
      : articlesList.filter((a) => a.Tag === selectedCategory);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    setSelectedArticle(null);
  };

  // Quay lại danh sách tổng quan
  const handleBack = () => {
    setSelectedArticle(null);
    if (onClearInitialArticle) onClearInitialArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Khi có bài viết được chọn -> Chuyển sang giao diện đọc bài chi tiết
  if (selectedArticle) {
    return (
      <GuideDetailView
        article={selectedArticle}
        allArticles={articlesList}
        onBack={handleBack}
        onSelectArticle={(article) => {
          setSelectedArticle(article);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Danh sách bài viết dạng lưới (Blog Main Page)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Nút Quay lại trang chủ */}
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang chủ</span>
        </button>
      )}

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cẩm nang & Kinh nghiệm thuê trọ
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
          Khám phá những kiến thức pháp lý, kinh nghiệm khảo sát phòng thực tế và các lưu ý an toàn dành cho sinh viên.
        </p>
      </div>

      {/* Thanh tiêu đề và bộ lọc danh mục */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            {selectedCategory}
          </span>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {filteredArticles.length} bài
          </span>
        </div>

        {/* Dropdown chọn danh mục */}
        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden cursor-pointer shadow-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Danh sách bài viết */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((article: any) => (
            <div
              key={article.Id || article.id}
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
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <p className="text-sm font-bold text-slate-700">
            Hiện chưa có bài viết nào trong chuyên mục này.
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange('Tất cả bài viết')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Xem tất cả bài viết
          </button>
        </div>
      )}

      {/* Phân trang */}
      <div className="pt-6 flex items-center justify-center gap-2">
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