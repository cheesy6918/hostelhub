import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  Maximize2, 
  Phone,
  MessageCircle,
  Filter,
  PlusCircle,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockRoommates, TinOGhep } from '../utils/roommatesData';
import { RoommateDetailView } from './RoommateDetailView';
import { RoommateCreatePostView } from './RoommateCreatePostView';

interface RoommateViewProps {
  onNavigate?: (view: string) => void;
}

const DISTRICTS = [
  'Cầu Giấy',
  'Đống Đa',
  'Hai Bà Trưng',
  'Ba Đình',
  'Thanh Xuân',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông'
];

const PRICE_RANGES = [
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: 'Từ 1 - 2 triệu', min: 1000000, max: 2000000 },
  { label: 'Từ 2 - 3 triệu', min: 2000000, max: 3000000 },
  { label: 'Từ 3 - 5 triệu', min: 3000000, max: 5000000 },
  { label: 'Từ 5 - 7 triệu', min: 5000000, max: 7000000 }
];

const AREA_RANGES = [
  { label: 'Dưới 20 m²', min: 0, max: 20 },
  { label: 'Từ 20 - 30 m²', min: 20, max: 30 },
  { label: 'Từ 30 - 50 m²', min: 30, max: 50 }
];

export const RoommateView: React.FC<RoommateViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // State lưu danh sách bài đăng đồng bộ từ CSDL máy chủ
  const [allPosts, setAllPosts] = useState<TinOGhep[]>(() => {
    const saved = localStorage.getItem('hostelhub_roommates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return mockRoommates || [];
  });

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TinOGhep | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('Tất cả');
  const [selectedAreaRange, setSelectedAreaRange] = useState<string>('Tất cả');
  const [sortTab, setSortTab] = useState<'recommend' | 'newest'>('recommend');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tải danh sách bài ở ghép đã được duyệt từ máy chủ Backend TiDB Cloud
  const fetchApprovedRoommates = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch(`/api/roommates?_t=${Date.now()}`);
      const data = await res.json();
      
      const serverPosts: TinOGhep[] = (data && data.success && Array.isArray(data.data)) ? data.data : [];

      // Gộp bài từ máy chủ với bài mẫu mockRoommates (ưu tiên bài máy chủ)
      const combined = [...serverPosts];
      (mockRoommates || []).forEach(mock => {
        if (!combined.some(p => String(p.Id) === String(mock.Id))) {
          combined.push(mock);
        }
      });

      setAllPosts(combined);
      localStorage.setItem('hostelhub_roommates', JSON.stringify(combined));
    } catch (err) {
      console.warn('Lỗi tải bài ở ghép từ máy chủ, dùng bài lưu tạm:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchApprovedRoommates();
  }, []);

  const handleOpenCreateModal = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập tài khoản để đăng tin tìm ở ghép!', 'warning');
      setTimeout(() => {
        if (onNavigate) onNavigate('login');
      }, 1200);
      return;
    }
    setIsCreatingPost(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trang tạo bài đăng
  if (isCreatingPost) {
    return (
      <RoommateCreatePostView
        onBack={() => {
          setIsCreatingPost(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSuccess={() => {
          setIsCreatingPost(false);
          fetchApprovedRoommates();
          showToast('Tin đăng tìm ở ghép của bạn đã được gửi thành công và đang chờ ban quản trị duyệt!', 'success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }
  
  // Trang chi tiết bài đăng
  if (selectedPost) {
    return (
      <RoommateDetailView
        post={selectedPost}
        allPosts={allPosts}
        onBack={() => {
          setSelectedPost(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectPost={(post) => {
          setSelectedPost(post);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectDistrict={(district) => {
          setSelectedDistrict(district);
          setSelectedPost(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const getRecencyScore = (timeStr: string) => {
    if (!timeStr) return 99;
    const lower = timeStr.toLowerCase();
    if (lower.includes('hôm nay') || lower.includes('vừa xong') || lower.includes('giờ') || lower.includes('phút')) return 0;
    if (lower.includes('1 ngày')) return 1;
    if (lower.includes('2 ngày')) return 2;
    if (lower.includes('3 ngày')) return 3;
    if (lower.includes('4 ngày')) return 4;
    return 10;
  };

  // Lọc chỉ hiển thị những bài ĐÃ ĐƯỢC DUYỆT (hoặc bài mẫu không có cờ từ chối)
  const filteredList = allPosts.filter((post) => {
    if (post.TrangThaiDuyet === 'Chờ duyệt' || post.TrangThaiDuyet === 'Từ chối') {
      return false;
    }

    if (selectedDistrict !== 'Tất cả' && post.QuanHuyen !== selectedDistrict) return false;
    
    if (selectedPriceRange !== 'Tất cả') {
      const pRange = PRICE_RANGES.find((r) => r.label === selectedPriceRange);
      if (pRange && (post.GiaThue < pRange.min || post.GiaThue > pRange.max)) return false;
    }
    if (selectedAreaRange !== 'Tất cả') {
      const aRange = AREA_RANGES.find((r) => r.label === selectedAreaRange);
      if (aRange && (post.DienTich < aRange.min || post.DienTich > aRange.max)) return false;
    }
    return true;
  });

  const filteredPosts = [...filteredList].sort((a, b) => {
    if (sortTab === 'newest') {
      return getRecencyScore(a.NgayCapNhat) - getRecencyScore(b.NgayCapNhat);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilter = () => {
    setSelectedDistrict('Tất cả');
    setSelectedPriceRange('Tất cả');
    setSelectedAreaRange('Tất cả');
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 relative">
      {/* Toast thông báo */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-amber-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 1. Header Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tìm Người Ở Ghép Hà Nội Giá Rẻ, Uy Tín, Mới Nhất
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Kênh kết nối bạn cùng phòng tin cậy dành riêng cho sinh viên tại các trường Đại học khu vực Hà Nội.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin tìm ở ghép</span>
            </button>
          </div>

          {/* Danh sách Quận */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-3">
              Khu vực trọng điểm sinh viên:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict('Tất cả');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDistrict === 'Tất cả'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả Hà Nội
              </button>

              {DISTRICTS.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => {
                    setSelectedDistrict(district);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDistrict === district
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Bố cục 2 cột chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-2">Sắp xếp:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSortTab('recommend');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sortTab === 'recommend'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Đề xuất
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortTab('newest');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sortTab === 'newest'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mới đăng
                </button>
              </div>

              {(selectedDistrict !== 'Tất cả' || selectedPriceRange !== 'Tất cả' || selectedAreaRange !== 'Tất cả') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Danh sách thẻ bài đăng */}
            {currentPosts.length > 0 ? (
              <div className="space-y-4">
                {currentPosts.map((post) => (
                  <div
                    key={post.Id}
                    onClick={() => {
                      setSelectedPost(post);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 group cursor-pointer"
                  >
                    <div className="w-full sm:w-56 h-48 sm:h-auto shrink-0 relative rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={post.HinhAnh?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                        alt={post.TieuDe}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        Ghép {post.DoiTuongGhep}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {post.TieuDe}
                        </h2>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-base sm:text-lg font-black text-rose-600 tabular-nums">
                            {post.GiaThue.toLocaleString('vi-VN')} đ/tháng
                          </span>
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                            {post.DienTich} m²
                          </span>
                          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                            Quận {post.QuanHuyen}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{post.DiaChi}</span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {post.MoTa}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {post.TacGia?.Ten?.[0] || 'S'}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{post.TacGia?.Ten || 'Sinh viên'}</span>
                          <span className="text-[11px] text-slate-400">• {post.NgayCapNhat || 'Vừa xong'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.TacGia?.Zalo && (
                            <a
                              href={`https://zalo.me/${post.TacGia.Zalo}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Zalo</span>
                            </a>
                          )}
                          {post.TacGia?.Sdt && (
                            <a
                              href={`tel:${post.TacGia.Sdt}`}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Gọi điện</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
                <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">
                  Không tìm thấy bài đăng nào phù hợp với bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-blue-700"
                >
                  Xem tất cả tin ở ghép
                </button>
              </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center transition-all ${
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
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? 'opacity-30 cursor-not-allowed text-slate-300'
                      : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Xem theo khoảng giá</span>
              </h3>
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange('Tất cả');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedPriceRange === 'Tất cả'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả mức giá</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      setSelectedPriceRange(range.label);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedPriceRange === range.label
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{range.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <span>Xem theo diện tích</span>
              </h3>
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAreaRange('Tất cả');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedAreaRange === 'Tất cả'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả diện tích</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {AREA_RANGES.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      setSelectedAreaRange(range.label);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedAreaRange === range.label
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{range.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};