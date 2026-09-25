import React, { useState, useEffect, useRef } from 'react';
import { Room, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
  Maximize2,
  Phone,
  Check,
  Sparkles,
  Filter,
  Home,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  RotateCcw,
  Zap,
  Droplets,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Info,
  Lock,
  Ban,
  Layers,
  Wind,
  Wifi,
  Tag,
  Heart,
  Trash2,
  ArrowUpDown,
  ArrowLeftRight
} from 'lucide-react';
import { RoomDetailView } from './RoomDetailView';
import { useFavorites } from '../context/FavoritesContext';
import { useComparison } from '../context/ComparisonContext';

interface StudentFindRoomViewProps {
  onSelectRoomDetail?: (roomId: string) => void;
  initialTab?: 'browse' | 'favorites' | 'my-inquiries';
}

interface AmenityOption {
  id: string;
  label: string;
  icon: string;
}

const AMENITY_FILTER_OPTIONS: AmenityOption[] = [
  { id: 'Điều hòa', label: 'Điều hòa / Máy lạnh', icon: '❄️' },
  { id: 'Wifi', label: 'Wifi Internet', icon: '📶' },
  { id: 'Vệ sinh riêng', label: 'Vệ sinh riêng khép kín', icon: '🚿' },
  { id: 'Nóng lạnh', label: 'Bình nóng lạnh', icon: '🔥' },
  { id: 'Gác lửng', label: 'Có gác lửng', icon: '🪜' },
  { id: 'Tủ lạnh', label: 'Tủ lạnh', icon: '🧊' },
  { id: 'Máy giặt', label: 'Máy giặt', icon: '🧺' },
  { id: 'Giờ tự do', label: 'Giờ tự do / Không chung chủ', icon: '🔑' },
  { id: 'Khóa vân tay', label: 'Khóa vân tay an ninh', icon: '🔒' },
  { id: 'Chỗ để xe', label: 'Chỗ để xe an toàn', icon: '🛵' },
  { id: 'Ban công', label: 'Ban công / Cửa sổ thoáng', icon: '🪟' },
];

const PRICE_PRESETS = [
  { label: 'Tất cả giá', min: '', max: '' },
  { label: '< 1.5 triệu (SV giá rẻ)', min: '', max: '1500000' },
  { label: '1.5tr - 2.5 triệu (Phổ biến)', min: '1500000', max: '2500000' },
  { label: '2.5tr - 4 triệu (Studio/CCMN)', min: '2500000', max: '4000000' },
  { label: '> 4 triệu (Cao cấp)', min: '4000000', max: '' },
];

const AREA_PRESETS = [
  { label: 'Tất cả diện tích', min: '', max: '' },
  { label: '< 20 m² (Nhỏ gọn / Sleepbox)', min: '', max: '20' },
  { label: '20 - 30 m² (Tiêu chuẩn SV)', min: '20', max: '30' },
  { label: '30 - 45 m² (Rộng rãi / Ở ghép)', min: '30', max: '45' },
  { label: '> 45 m² (Nguyên căn / 2 phòng)', min: '45', max: '' },
];

// Helper to normalize Vietnamese diacritics for smart instant search
export const removeVietnameseTones = (str: string): string => {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

// Default safe fallback image for rooms
const DEFAULT_ROOM_FALLBACK_IMG = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';

// Popular university hubs and address shortcuts in Hanoi & HCMC
const POPULAR_ADDRESS_SHORTCUTS = [
  { label: 'Tạ Quang Bửu (Bách Khoa)', query: 'Tạ Quang Bửu' },
  { label: 'Cầu Giấy (ĐH Quốc Gia)', query: 'Cầu Giấy' },
  { label: 'Chùa Láng (Ngoại Thương)', query: 'Chùa Láng' },
  { label: 'Trần Đại Nghĩa (NEU)', query: 'Trần Đại Nghĩa' },
  { label: 'Nguyễn Trãi (Thanh Xuân)', query: 'Nguyễn Trãi' },
  { label: 'Cầu Diễn (ĐH Công Nghiệp)', query: 'Cầu Diễn' },
  { label: 'Ao Sen (Kiến Trúc & PTIT)', query: 'Ao Sen' },
  { label: 'Tây Sơn (Thủy Lợi & Công Đoàn)', query: 'Tây Sơn' },
  { label: 'Làng ĐH Thủ Đức (TP.HCM)', query: 'Thủ Đức' },
  { label: 'Hòa Hảo (Quận 10 TP.HCM)', query: 'Hòa Hảo' },
];

export const StudentFindRoomView: React.FC<StudentFindRoomViewProps> = ({ onSelectRoomDetail, initialTab }) => {
  const { user, token } = useAuth();
  const {
    favoriteRoomIds,
    favoriteRooms,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearAllFavorites,
    refreshFavorites,
  } = useFavorites();

  const {
    comparisonRooms,
    isInComparison,
    toggleComparison,
    openComparisonModal,
  } = useComparison();

  // Search input specifically for room name or specific address at the head of the room list
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listSortOrder, setListSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'area-desc'>('default');

  // Search input state for the top advanced filter form
  const [keywordInput, setKeywordInput] = useState('');
  
  // Price range inputs (min & max in VNĐ)
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  
  // Area range inputs (min & max in m²)
  const [minAreaInput, setMinAreaInput] = useState<string>('');
  const [maxAreaInput, setMaxAreaInput] = useState<string>('');

  // Desired amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Validation error state
  const [validationError, setValidationError] = useState<string>('');

  // Applied filter state (triggered when user clicks "Tìm kiếm / Áp dụng bộ lọc")
  const [appliedFilters, setAppliedFilters] = useState<{
    keyword: string;
    minPrice: string;
    maxPrice: string;
    minArea: string;
    maxArea: string;
    amenities: string[];
  }>({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    amenities: [],
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'con-trong' | 'da-dat' | 'het-phong'>('all');

  // Pagination State for Room Search
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const roomListTopRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, listSearchTerm, listSortOrder, statusFilter, itemsPerPage]);

  const handlePageChange = (newPage: number, totalPages: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(target);
    if (roomListTopRef.current) {
      roomListTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPaginationNumbers = (curr: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (curr <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (curr >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', curr - 1, curr, curr + 1, '...', total);
      }
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} className="px-1.5 py-1.5 text-xs font-bold text-slate-400 select-none">
            ...
          </span>
        );
      }
      const pageNum = p as number;
      const isActive = pageNum === curr;
      return (
        <button
          key={pageNum}
          type="button"
          onClick={() => handlePageChange(pageNum, total)}
          className={`min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95 shadow-2xs'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  // Helper for visual status indicator
  const getStatusIndicator = (trangThai: Room['TrangThai']) => {
    if (trangThai === 'Còn phòng' || trangThai === 'Công khai') {
      return {
        statusText: 'Còn trống',
        subtitle: 'Sẵn sàng dọn vào ở ngay',
        badgeClass: 'bg-emerald-600/95 text-white border-emerald-400/80 shadow-emerald-900/30',
        dotClass: 'bg-emerald-300',
        pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        tagBg: 'bg-emerald-500',
        type: 'con-trong' as const,
        ribbonText: null,
        grayscaleImg: false,
      };
    }
    if (trangThai === 'Đã cọc' || trangThai === 'Chờ chủ trọ xác nhận cọc') {
      return {
        statusText: 'Đã đặt',
        subtitle: 'Đang có sinh viên bảo lưu cọc',
        badgeClass: 'bg-amber-500/95 text-white border-amber-300/80 shadow-amber-900/30',
        dotClass: 'bg-amber-200',
        pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
        tagBg: 'bg-amber-500',
        type: 'da-dat' as const,
        ribbonText: 'Đã đặt cọc',
        grayscaleImg: false,
      };
    }
    if (trangThai === 'Hết phòng') {
      return {
        statusText: 'Hết phòng',
        subtitle: 'Hiện tại đã kín người thuê',
        badgeClass: 'bg-rose-600/95 text-white border-rose-400/80 shadow-rose-900/30',
        dotClass: 'bg-rose-200',
        pillClass: 'bg-rose-50 text-rose-800 border-rose-200',
        tagBg: 'bg-rose-500',
        type: 'het-phong' as const,
        ribbonText: 'Tạm hết phòng',
        grayscaleImg: true,
      };
    }
    return {
      statusText: trangThai || 'Còn trống',
      subtitle: 'Đang cập nhật',
      badgeClass: 'bg-slate-700/95 text-white border-slate-500',
      dotClass: 'bg-slate-300',
      pillClass: 'bg-slate-50 text-slate-700 border-slate-200',
      tagBg: 'bg-slate-500',
      type: 'khac' as const,
      ribbonText: null,
      grayscaleImg: false,
    };
  };

  // Active view: either browse list, favorites, inquiries history, or room detail view
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'my-inquiries'>(initialTab || 'browse');
  const [viewingRoomId, setViewingRoomId] = useState<string | null>(null);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);

  // Sub-filter for favorites view
  const [favSearch, setFavSearch] = useState('');
  const [favSort, setFavSort] = useState<'default' | 'price-asc' | 'price-desc' | 'area-desc'>('default');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'favorites') {
      refreshFavorites();
    }
  }, [activeTab]);

  const fetchRooms = async (filters: typeof appliedFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword.trim()) params.append('search', filters.keyword.trim());
      if (filters.minPrice !== '') params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== '') params.append('maxPrice', filters.maxPrice);
      if (filters.minArea !== '') params.append('minArea', filters.minArea);
      if (filters.maxArea !== '') params.append('maxArea', filters.maxArea);
      if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInquiries = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMyInquiries(data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRooms(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    if (activeTab === 'my-inquiries') {
      fetchMyInquiries();
    }
  }, [activeTab]);

  // Toggle amenity checkbox
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  // Quick price preset buttons
  const handleApplyPresetPrice = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    setValidationError('');
  };

  // Quick area preset buttons
  const handleApplyPresetArea = (min: string, max: string) => {
    setMinAreaInput(min);
    setMaxAreaInput(max);
    setValidationError('');
  };

  // Validate & apply filters
  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');

    const minP = minPriceInput !== '' ? Number(minPriceInput) : null;
    const maxP = maxPriceInput !== '' ? Number(maxPriceInput) : null;

    if (minP !== null && maxP !== null && minP > maxP) {
      setValidationError('Khoảng giá không hợp lệ: Giá tối thiểu không được lớn hơn giá tối đa');
      return;
    }

    const minA = minAreaInput !== '' ? Number(minAreaInput) : null;
    const maxA = maxAreaInput !== '' ? Number(maxAreaInput) : null;

    if (minA !== null && maxA !== null && minA > maxA) {
      setValidationError('Khoảng diện tích không hợp lệ: Diện tích tối thiểu không được lớn hơn diện tích tối đa');
      return;
    }

    // Sync listSearchTerm if user provided a keyword in the advanced filter
    if (keywordInput.trim() && !listSearchTerm) {
      setListSearchTerm(keywordInput.trim());
    }

    setAppliedFilters({
      keyword: keywordInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      minArea: minAreaInput,
      maxArea: maxAreaInput,
      amenities: [...selectedAmenities],
    });
  };

  // Submit search specifically from the list header search bar
  const handleListSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (listSearchTerm.trim() !== appliedFilters.keyword.trim()) {
      setKeywordInput(listSearchTerm.trim());
      setAppliedFilters(prev => ({ ...prev, keyword: listSearchTerm.trim() }));
    }
  };

  // Quick click on popular student addresses / universities
  const handleSelectAddressShortcut = (query: string) => {
    if (listSearchTerm.toLowerCase().includes(query.toLowerCase())) {
      // Toggle off if already selected
      setListSearchTerm('');
      setKeywordInput('');
      setAppliedFilters(prev => ({ ...prev, keyword: '' }));
    } else {
      setListSearchTerm(query);
      setKeywordInput(query);
      setAppliedFilters(prev => ({ ...prev, keyword: query }));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setKeywordInput('');
    setListSearchTerm('');
    setListSortOrder('default');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinAreaInput('');
    setMaxAreaInput('');
    setSelectedAmenities([]);
    setValidationError('');
    setStatusFilter('all');
    setAppliedFilters({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      amenities: [],
    });
  };

  // Remove individual active filter
  const handleRemoveActiveFilter = (type: 'keyword' | 'price' | 'area' | 'amenity', amenityId?: string) => {
    if (type === 'keyword') {
      setKeywordInput('');
      setListSearchTerm('');
      setAppliedFilters(prev => ({ ...prev, keyword: '' }));
    } else if (type === 'price') {
      setMinPriceInput('');
      setMaxPriceInput('');
      setAppliedFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
    } else if (type === 'area') {
      setMinAreaInput('');
      setMaxAreaInput('');
      setAppliedFilters(prev => ({ ...prev, minArea: '', maxArea: '' }));
    } else if (type === 'amenity' && amenityId) {
      const updated = selectedAmenities.filter(a => a !== amenityId);
      setSelectedAmenities(updated);
      setAppliedFilters(prev => ({ ...prev, amenities: updated }));
    }
  };

  // Check if any filter is currently applied
  const hasActiveFilters = Boolean(
    appliedFilters.keyword.trim() ||
    appliedFilters.minPrice ||
    appliedFilters.maxPrice ||
    appliedFilters.minArea ||
    appliedFilters.maxArea ||
    appliedFilters.amenities.length > 0
  );

  // If viewing single room details
  if (viewingRoomId) {
    return (
      <RoomDetailView
        roomId={viewingRoomId}
        onBack={() => setViewingRoomId(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kênh tìm phòng trọ sinh viên xác thực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tìm kiếm phòng trọ tiện nghi, gần trường, đúng giá
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Hệ sinh thái phòng trọ an toàn cho sinh viên các trường ĐH Bách Khoa, Quốc Gia, Ngoại Thương, Kinh Tế, Sư Phạm... Trực tiếp từ chủ nhà, không qua môi giới.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-white text-blue-900 shadow-sm font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              🔍 Tìm kiếm & Khám phá phòng
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-white text-rose-700 shadow-sm font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-rose-600 text-rose-600' : 'text-white'}`} />
              <span>Mục yêu thích của tôi</span>
              {favoriteRoomIds.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums ${
                  activeTab === 'favorites' ? 'bg-rose-100 text-rose-700' : 'bg-white/30 text-white'
                }`}>
                  {favoriteRoomIds.length}
                </span>
              )}
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-inquiries')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-inquiries'
                    ? 'bg-white text-blue-900 shadow-sm font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                📋 Lịch sử đặt hẹn & phòng ({myInquiries.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* SEARCH & ADVANCED FILTER SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Bộ lọc tìm kiếm nâng cao
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lọc chính xác theo khoảng giá, diện tích và tiện ích mong muốn (máy lạnh, wifi...)
                  </p>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="self-start sm:self-auto text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              )}
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleApplyFilter} className="space-y-6">
              
              {/* Row 1: Search keyword (Khu vực / Tên đường / Tên trường) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Từ khóa khu vực / Tên đường / Tên trường
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="VD: Cầu Giấy, Tạ Quang Bửu, Chùa Láng, ĐH Bách Khoa, NEU..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Khoảng giá & Diện tích */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
                
                {/* Section: Khoảng giá (Price range) */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Khoảng giá thuê (VNĐ / tháng)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Từ (tối thiểu)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="100000"
                          min="0"
                          value={minPriceInput}
                          onChange={(e) => {
                            setMinPriceInput(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="VD: 1500000"
                          className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                          đ/tháng
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Đến (tối đa)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="100000"
                          min="0"
                          value={maxPriceInput}
                          onChange={(e) => {
                            setMaxPriceInput(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="VD: 3000000"
                          className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                          đ/tháng
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick price presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {PRICE_PRESETS.map((p) => {
                      const isActive = minPriceInput === p.min && maxPriceInput === p.max;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleApplyPresetPrice(p.min, p.max)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-2xs'
                              : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Diện tích phòng (Area range in m2) */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>3. Diện tích phòng (m²)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Từ (tối thiểu)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={minAreaInput}
                          onChange={(e) => {
                            setMinAreaInput(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="VD: 18"
                          className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                          m²
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Đến (tối đa)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={maxAreaInput}
                          onChange={(e) => {
                            setMaxAreaInput(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="VD: 35"
                          className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                          m²
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick area presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {AREA_PRESETS.map((a) => {
                      const isActive = minAreaInput === a.min && maxAreaInput === a.max;
                      return (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => handleApplyPresetArea(a.min, a.max)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-2xs'
                              : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Row 3: Tiện ích mong muốn (Checkboxes / Multi-select with icons) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    4. Tiện ích mong muốn (Máy lạnh, Wifi, Vệ sinh riêng, Nóng lạnh...)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Đã chọn {selectedAmenities.length} tiện ích
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {AMENITY_FILTER_OPTIONS.map((item) => {
                    const checked = selectedAmenities.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-xs ring-1 ring-blue-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/90'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenity(item.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="line-clamp-1">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại bộ lọc</span>
                </button>

                <button
                  type="submit"
                  className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm & Áp dụng bộ lọc</span>
                </button>
              </div>

            </form>
          </div>

          {/* ACTIVE FILTER TAGS BAR */}
          {hasActiveFilters && (
            <div className="mb-6 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1 text-[11px] uppercase tracking-wider mr-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Bộ lọc đang áp dụng:</span>
              </span>

              {/* Keyword Tag */}
              {appliedFilters.keyword.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-xl text-slate-800 font-medium shadow-2xs">
                  <span>Khu vực: <strong>{appliedFilters.keyword}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActiveFilter('keyword')}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Price Tag */}
              {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-xl text-slate-800 font-medium shadow-2xs">
                  <span>
                    Giá:{' '}
                    <strong>
                      {appliedFilters.minPrice ? `${Number(appliedFilters.minPrice).toLocaleString('vi-VN')}đ` : '0đ'}{' '}
                      -{' '}
                      {appliedFilters.maxPrice ? `${Number(appliedFilters.maxPrice).toLocaleString('vi-VN')}đ` : 'Không giới hạn'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActiveFilter('price')}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Area Tag */}
              {(appliedFilters.minArea || appliedFilters.maxArea) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-xl text-slate-800 font-medium shadow-2xs">
                  <span>
                    Diện tích:{' '}
                    <strong>
                      {appliedFilters.minArea ? `${appliedFilters.minArea}m²` : '0m²'}{' '}
                      -{' '}
                      {appliedFilters.maxArea ? `${appliedFilters.maxArea}m²` : 'Không giới hạn'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActiveFilter('area')}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Amenities Tags */}
              {appliedFilters.amenities.map((amId) => {
                const opt = AMENITY_FILTER_OPTIONS.find(o => o.id === amId);
                return (
                  <span
                    key={amId}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-xl text-slate-800 font-medium shadow-2xs"
                  >
                    <span>{opt?.icon || '✨'} {opt?.label || amId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActiveFilter('amenity', amId)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 ml-auto cursor-pointer underline"
              >
                Đặt lại toàn bộ
              </button>
            </div>
          )}

          {/* Compute counts and filtered rooms with smart room name & address matching */}
          {(() => {
            const normalizedSearch = removeVietnameseTones(listSearchTerm.trim());

            // 1. Filter by search keyword across room name (TieuDe) and specific address (DiaChi, QuanHuyen)
            const matchingSearchRooms = rooms.filter((r) => {
              if (!normalizedSearch) return true;

              const searchFields = [
                r.TieuDe || '',
                r.DiaChi || '',
                r.QuanHuyen || '',
                r.MoTa || '',
                r.ChuTroTen || '',
              ].join(' ');

              const normalizedTarget = removeVietnameseTones(searchFields);
              const searchWords = normalizedSearch.split(/\s+/).filter(Boolean);
              return searchWords.every(word => normalizedTarget.includes(word));
            });

            // 2. Count statuses within search results
            const conTrongCount = matchingSearchRooms.filter(r => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai').length;
            const daDatCount = matchingSearchRooms.filter(r => r.TrangThai === 'Đã cọc' || r.TrangThai === 'Chờ chủ trọ xác nhận cọc').length;
            const hetPhongCount = matchingSearchRooms.filter(r => r.TrangThai === 'Hết phòng').length;

            // 3. Filter by selected status tab
            let displayedRooms = matchingSearchRooms.filter((r) => {
              if (statusFilter === 'con-trong') {
                return r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai';
              }
              if (statusFilter === 'da-dat') {
                return r.TrangThai === 'Đã cọc' || r.TrangThai === 'Chờ chủ trọ xác nhận cọc';
              }
              if (statusFilter === 'het-phong') {
                return r.TrangThai === 'Hết phòng';
              }
              return true;
            });

            // 4. Sort results
            if (listSortOrder === 'price-asc') {
              displayedRooms.sort((a, b) => a.GiaThue - b.GiaThue);
            } else if (listSortOrder === 'price-desc') {
              displayedRooms.sort((a, b) => b.GiaThue - a.GiaThue);
            } else if (listSortOrder === 'area-desc') {
              displayedRooms.sort((a, b) => b.DienTich - a.DienTich);
            }

            // 5. Pagination calculations
            const totalRoomsCount = displayedRooms.length;
            const totalPages = Math.max(1, Math.ceil(totalRoomsCount / itemsPerPage));
            const validPage = Math.min(Math.max(1, currentPage), totalPages);
            const startIndex = (validPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, totalRoomsCount);
            const paginatedRooms = displayedRooms.slice(startIndex, endIndex);

            return (
              <>
                {/* THANH TÌM KIẾM THEO TÊN PHÒNG HOẶC ĐỊA CHỈ CỤ THỂ VÀO ĐẦU DANH SÁCH */}
                <div ref={roomListTopRef} className="bg-white rounded-3xl border border-blue-200/90 p-5 sm:p-6 mb-6 shadow-xs relative overflow-hidden scroll-mt-6">
                  {/* Decorative background gradient */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50 via-indigo-50/40 to-transparent rounded-full -mr-28 -mt-28 pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    {/* Header: Title & Counter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">
                              Tìm kiếm theo tên phòng hoặc địa chỉ cụ thể
                            </h2>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full hidden sm:inline-block">
                              Trực tiếp tại danh sách
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Nhập tên phòng, số nhà, tên đường, ngõ ngách, hoặc khu vực trường đại học mong muốn
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        {comparisonRooms.length > 0 && (
                          <button
                            type="button"
                            onClick={openComparisonModal}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>So sánh ({comparisonRooms.length} phòng)</span>
                          </button>
                        )}
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 tabular-nums">
                          {loading ? 'Đang tìm...' : (
                            <>
                              Tìm thấy <strong className="text-blue-600 font-extrabold">{totalRoomsCount}</strong> phòng {totalPages > 1 && <span className="text-slate-500 font-medium">· Trang {validPage}/{totalPages}</span>}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Primary Search Input Bar */}
                    <form onSubmit={handleListSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                      <div className="relative flex-1">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-blue-600 pointer-events-none">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={listSearchTerm}
                          onChange={(e) => setListSearchTerm(e.target.value)}
                          placeholder="Nhập tên phòng hoặc địa chỉ cụ thể (VD: Tạ Quang Bửu, Cầu Giấy, Chùa Láng, Trần Đại Nghĩa, Ký túc xá, Studio...)"
                          className="w-full pl-10 pr-24 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 rounded-2xl text-xs sm:text-sm font-medium transition-all outline-none"
                        />

                        {listSearchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setListSearchTerm('');
                              if (appliedFilters.keyword) {
                                setKeywordInput('');
                                setAppliedFilters(prev => ({ ...prev, keyword: '' }));
                              }
                            }}
                            title="Xóa tìm kiếm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <Search className="w-4 h-4" />
                        <span>Tìm kiếm</span>
                      </button>
                    </form>

                    {/* Quick Address Shortcuts (Gợi ý địa chỉ cụ thể & trường ĐH phổ biến) */}
                    <div className="pt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1 mr-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Gợi ý địa chỉ SV:</span>
                      </span>
                      {POPULAR_ADDRESS_SHORTCUTS.map((item) => {
                        const isSelected = listSearchTerm.toLowerCase().includes(item.query.toLowerCase());
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSelectAddressShortcut(item.query)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80'
                            }`}
                          >
                            <MapPin className={`w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                            {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active search tag if searching */}
                    {listSearchTerm.trim() && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-slate-500 font-medium">Đang tìm theo:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold shadow-2xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>"{listSearchTerm}"</span>
                          <button
                            type="button"
                            onClick={() => {
                              setListSearchTerm('');
                              if (appliedFilters.keyword) {
                                setKeywordInput('');
                                setAppliedFilters(prev => ({ ...prev, keyword: '' }));
                              }
                            }}
                            className="hover:text-red-600 cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setListSearchTerm('');
                            if (appliedFilters.keyword) {
                              setKeywordInput('');
                              setAppliedFilters(prev => ({ ...prev, keyword: '' }));
                            }
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          Xóa tìm kiếm
                        </button>
                      </div>
                    )}

                    {/* Filter status tabs & Sort Options Bar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Quick Status Filter Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start">
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tất cả ({matchingSearchRooms.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('con-trong')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            statusFilter === 'con-trong'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Còn trống ({conTrongCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('da-dat')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            statusFilter === 'da-dat'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Đã đặt ({daDatCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('het-phong')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            statusFilter === 'het-phong'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>Hết phòng ({hetPhongCount})</span>
                        </button>
                      </div>

                      {/* Sắp xếp (Sort dropdown) */}
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sắp xếp:</span>
                        </span>
                        <select
                          value={listSortOrder}
                          onChange={(e) => setListSortOrder(e.target.value as any)}
                          aria-label="Sắp xếp danh sách phòng trọ"
                          className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                        >
                          <option value="default">Mặc định (Phổ biến nhất)</option>
                          <option value="price-asc">Giá thuê: Thấp đến cao</option>
                          <option value="price-desc">Giá thuê: Cao đến thấp</option>
                          <option value="area-desc">Diện tích: Lớn nhất</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROOMS GRID OR EMPTY STATE */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="bg-white rounded-3xl border border-slate-200 p-4 h-80 animate-pulse" />
                    ))}
                  </div>
                ) : displayedRooms.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-2">
                      {listSearchTerm
                        ? `Không tìm thấy phòng trọ nào khớp với "${listSearchTerm}"`
                        : 'Không tìm thấy phòng phù hợp, vui lòng thử nới lỏng bộ lọc'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                      {listSearchTerm
                        ? 'Vui lòng kiểm tra lại chính tả tên đường, địa chỉ hoặc chọn một trong các gợi ý địa điểm sinh viên bên trên.'
                        : 'Bạn có thể thử xóa bớt điều kiện tiện ích, mở rộng khoảng giá hoặc chọn tab trạng thái "Tất cả".'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {listSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setListSearchTerm('');
                            if (appliedFilters.keyword) {
                              setKeywordInput('');
                              setAppliedFilters(prev => ({ ...prev, keyword: '' }));
                            }
                          }}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                          Xóa tìm kiếm "{listSearchTerm}"
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Đặt lại toàn bộ bộ lọc
                      </button>
                    </div>
                  </div>
                ) : (
                  /* GRID CARDS: Ảnh đại diện, chỉ báo trực quan trạng thái, tên, giá, tiện ích nổi bật */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedRooms.map((room) => {
                      const statusInfo = getStatusIndicator(room.TrangThai);
                      const coverImage =
                        room.HinhAnh && room.HinhAnh.length > 0
                          ? room.HinhAnh[0]
                          : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';

                      return (
                        <div
                          key={room.Id}
                          onClick={() => {
                            if (onSelectRoomDetail) {
                              onSelectRoomDetail(room.Id);
                            } else {
                              setViewingRoomId(room.Id);
                            }
                          }}
                          className={`bg-white rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer ${
                            statusInfo.type === 'het-phong'
                              ? 'border-slate-200 hover:border-slate-300 opacity-95'
                              : statusInfo.type === 'da-dat'
                              ? 'border-amber-200/80 hover:border-amber-400'
                              : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {/* Visual Card Image (Ảnh đại diện) with Status Indicators */}
                          <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                            <img
                              src={coverImage}
                              alt={room.TieuDe}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = DEFAULT_ROOM_FALLBACK_IMG;
                              }}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                statusInfo.grayscaleImg ? 'grayscale-40 opacity-85' : ''
                              }`}
                            />

                            {/* Prominent Visual Status Badge (Top-Left) */}
                            <div className="absolute top-3 left-3 z-10">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md border backdrop-blur-md transition-all group-hover:scale-102 ${statusInfo.badgeClass}`}
                              >
                                {statusInfo.type === 'con-trong' && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                  </span>
                                )}
                                {statusInfo.type === 'da-dat' && (
                                  <Lock className="w-3.5 h-3.5 text-amber-100" />
                                )}
                                {statusInfo.type === 'het-phong' && (
                                  <Ban className="w-3.5 h-3.5 text-rose-100" />
                                )}
                                <span>{statusInfo.statusText}</span>
                              </span>
                            </div>

                            {/* Top-Right Ribbon / Status Tag if reserved or full */}
                            {statusInfo.ribbonText && (
                              <div className="absolute top-3 right-12 z-10">
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs border tracking-wide uppercase ${
                                    statusInfo.type === 'het-phong'
                                      ? 'bg-rose-950/80 text-rose-200 border-rose-500/40'
                                      : 'bg-amber-950/80 text-amber-200 border-amber-500/40'
                                  }`}
                                >
                                  {statusInfo.ribbonText}
                                </span>
                              </div>
                            )}

                            {/* Compare Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComparison(room);
                              }}
                              title={isInComparison(room.Id) ? 'Bỏ khỏi danh sách so sánh' : 'Thêm vào so sánh phòng'}
                              className={`absolute top-3 right-13 z-20 h-8 px-2.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
                                isInComparison(room.Id)
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-blue-500/40 scale-102 font-bold'
                                  : 'bg-black/45 text-white hover:bg-white hover:text-blue-600 font-semibold'
                              }`}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span className="text-[11px]">
                                {isInComparison(room.Id) ? 'Đang so sánh' : 'So sánh'}
                              </span>
                            </button>

                            {/* Favorite (Lưu vào mục yêu thích) bookmark button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(room.Id, room);
                              }}
                              title={isFavorite(room.Id) ? 'Xóa khỏi mục yêu thích' : 'Lưu vào mục yêu thích'}
                              className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer ${
                                isFavorite(room.Id)
                                  ? 'bg-white text-rose-600 ring-2 ring-rose-400 shadow-rose-200/50 scale-105'
                                  : 'bg-black/40 text-white hover:bg-white hover:text-rose-500 hover:scale-110'
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isFavorite(room.Id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-current'
                                }`}
                              />
                            </button>

                            {/* Price Tag over image */}
                            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-white shadow-xs">
                              <span className="text-base font-extrabold tabular-nums">
                                {room.GiaThue.toLocaleString('vi-VN')}
                              </span>{' '}
                              <span className="text-[10px] text-blue-200">đ/tháng</span>
                            </div>

                            {/* Photo count indicator */}
                            {room.HinhAnh && room.HinhAnh.length > 1 && (
                              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white">
                                📷 {room.HinhAnh.length} ảnh
                              </div>
                            )}
                          </div>

                          {/* Card Content: Tên, Địa chỉ, Chỉ báo trạng thái chi tiết, Tiện ích nổi bật */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                            <div className="space-y-2.5">
                              {/* Tên phòng trọ */}
                              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                                {room.TieuDe}
                              </h3>

                              {/* Địa chỉ & Diện tích */}
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-start gap-1.5 text-slate-500 line-clamp-1 flex-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{room.DiaChi}, {room.QuanHuyen}</span>
                                </div>
                                <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-lg text-[11px] shrink-0">
                                  <Maximize2 className="w-3 h-3 text-blue-600" />
                                  <span>{room.DienTich} m²</span>
                                </span>
                              </div>

                              {/* Dedicated Visual Status Strip in Card Body */}
                              <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${statusInfo.pillClass}`}>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className={`w-2 h-2 rounded-full ${
                                    statusInfo.type === 'con-trong'
                                      ? 'bg-emerald-500 animate-pulse'
                                      : statusInfo.type === 'da-dat'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`} />
                                  <span>{statusInfo.statusText}</span>
                                </div>
                                <span className="text-[11px] font-medium opacity-90">
                                  {statusInfo.subtitle}
                                </span>
                              </div>

                              {/* Tiện ích nổi bật (Highlighting requested amenities) */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {room.TienIch &&
                                  room.TienIch.slice(0, 5).map((amenity, idx) => {
                                    const isHighlighted = appliedFilters.amenities.some(am => {
                                      const a = amenity.toLowerCase();
                                      const req = am.toLowerCase();
                                      if (req.includes('điều hòa') || req.includes('máy lạnh')) {
                                        return a.includes('điều hòa') || a.includes('máy lạnh');
                                      }
                                      if (req.includes('wifi') || req.includes('internet')) {
                                        return a.includes('wifi') || a.includes('mạng');
                                      }
                                      return a.includes(req);
                                    });

                                    return (
                                      <span
                                        key={idx}
                                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg transition-colors ${
                                          isHighlighted
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {amenity}
                                      </span>
                                    );
                                  })}
                                {room.TienIch && room.TienIch.length > 5 && (
                                  <span className="text-[10px] text-slate-400 self-center">
                                    +{room.TienIch.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom strip: Specs (Diện tích, Điện, Nước) + CTA */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {room.DienTich} m²
                                </span>
                                <span>·</span>
                                <span>⚡ {room.GiaDien || '3.8k/kWh'}</span>
                                <span>·</span>
                                <span>💧 {room.GiaNuoc || '30k/khối'}</span>
                              </div>

                              <span className={`font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                                statusInfo.type === 'con-trong'
                                  ? 'text-blue-600'
                                  : statusInfo.type === 'da-dat'
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                              }`}>
                                <span>
                                  {statusInfo.type === 'con-trong'
                                    ? 'Đặt lịch & Chi tiết'
                                    : statusInfo.type === 'da-dat'
                                    ? 'Xem phòng (Đã cọc)'
                                    : 'Xem thông tin phòng'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* THANH PHÂN TRANG CHO MỤC TÌM PHÒNG TRỌ (PAGINATION BAR) */}
                {totalRoomsCount > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 mt-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Summary information */}
                    <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                      Hiển thị{' '}
                      <strong className="text-slate-900 font-bold">
                        {startIndex + 1} - {endIndex}
                      </strong>{' '}
                      trên tổng số{' '}
                      <strong className="text-blue-600 font-bold">{totalRoomsCount}</strong> phòng trọ
                    </div>

                    {/* Center: Pagination controls with Previous, Numbers, Next */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => handlePageChange(validPage - 1, totalPages)}
                        disabled={validPage <= 1}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Trước</span>
                      </button>

                      {renderPaginationNumbers(validPage, totalPages)}

                      <button
                        type="button"
                        onClick={() => handlePageChange(validPage + 1, totalPages)}
                        disabled={validPage >= totalPages}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right: Items per page selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="shrink-0 font-medium">Số lượng:</span>
                      <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/80">
                        {[6, 9, 12, 18].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setItemsPerPage(size);
                              setCurrentPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              itemsPerPage === size
                                ? 'bg-white text-blue-600 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <span className="shrink-0 hidden md:inline">/ trang</span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </>
      ) : activeTab === 'favorites' ? (
        /* DEDICATED FAVORITES VIEW (MỤC YÊU THÍCH CỦA TÔI) */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-xs p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-rose-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Mục yêu thích của tôi</h2>
                </div>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Lưu trữ các phòng trọ bạn đang quan tâm để dễ dàng so sánh giá cả, tiện ích và kiểm tra trạng thái phòng còn trống theo thời gian thực.
                </p>
              </div>

              {/* Stats badges & Clear all */}
              <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Đã lưu: {favoriteRooms.length} phòng</span>
                </span>
                
                {favoriteRooms.length > 0 && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    Còn trống: {favoriteRooms.filter(r => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai').length}
                  </span>
                )}

                {favoriteRooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa tất cả phòng khỏi danh sách yêu thích?')) {
                        clearAllFavorites();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Xóa toàn bộ phòng đã lưu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick search & sort bar inside favorites when there are rooms */}
            {favoriteRooms.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={favSearch}
                    onChange={(e) => setFavSearch(e.target.value)}
                    placeholder="Tìm nhanh trong mục yêu thích (tiêu đề, địa chỉ, quận)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                  />
                  {favSearch && (
                    <button
                      type="button"
                      onClick={() => setFavSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sắp xếp:
                  </span>
                  <select
                    value={favSort}
                    onChange={(e) => setFavSort(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="default">Mới lưu nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="area-desc">Diện tích: Lớn nhất</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Favorites Content */}
          {favoriteRooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Chưa có phòng trọ nào trong mục yêu thích</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Khi tìm kiếm phòng trọ, bạn chỉ cần bấm vào biểu tượng <strong>Trái tim</strong> trên góc ảnh của mỗi phòng để lưu lại và theo dõi trạng thái tại đây.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Khám phá phòng trọ ngay</span>
              </button>
            </div>
          ) : (() => {
            // Apply favorites filter & sort
            let filteredFavs = favoriteRooms.filter(r => {
              if (!favSearch.trim()) return true;
              const term = favSearch.toLowerCase().trim();
              return (
                r.TieuDe.toLowerCase().includes(term) ||
                (r.DiaChi && r.DiaChi.toLowerCase().includes(term)) ||
                (r.QuanHuyen && r.QuanHuyen.toLowerCase().includes(term))
              );
            });

            if (favSort === 'price-asc') {
              filteredFavs = [...filteredFavs].sort((a, b) => a.GiaThue - b.GiaThue);
            } else if (favSort === 'price-desc') {
              filteredFavs = [...filteredFavs].sort((a, b) => b.GiaThue - a.GiaThue);
            } else if (favSort === 'area-desc') {
              filteredFavs = [...filteredFavs].sort((a, b) => (b.DienTich || 0) - (a.DienTich || 0));
            }

            if (filteredFavs.length === 0) {
              return (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                  Không tìm thấy phòng yêu thích nào khớp với từ khóa "{favSearch}".
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavs.map((room) => {
                  const statusInfo = getStatusIndicator(room.TrangThai);
                  const coverImage = (room.HinhAnh && room.HinhAnh.length > 0)
                    ? room.HinhAnh[0]
                    : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

                  return (
                    <div
                      key={room.Id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                        <img
                          src={coverImage}
                          alt={room.TieuDe}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = DEFAULT_ROOM_FALLBACK_IMG;
                          }}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            statusInfo.grayscaleImg ? 'grayscale-40 opacity-85' : ''
                          }`}
                        />

                        {/* Visual Status Badge (Top-Left) */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md border backdrop-blur-md transition-all ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.type === 'con-trong' && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                            )}
                            {statusInfo.type === 'da-dat' && (
                              <Lock className="w-3.5 h-3.5 text-amber-100" />
                            )}
                            {statusInfo.type === 'het-phong' && (
                              <Ban className="w-3.5 h-3.5 text-rose-100" />
                            )}
                            <span>{statusInfo.statusText}</span>
                          </span>
                        </div>

                        {/* Compare Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComparison(room);
                          }}
                          title={isInComparison(room.Id) ? 'Bỏ khỏi danh sách so sánh' : 'Thêm vào so sánh phòng'}
                          className={`absolute top-3 right-13 z-20 h-8 px-2.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
                            isInComparison(room.Id)
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-blue-500/40 scale-102 font-bold'
                              : 'bg-black/45 text-white hover:bg-white hover:text-blue-600 font-semibold'
                          }`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span className="text-[11px]">
                            {isInComparison(room.Id) ? 'Đang so sánh' : 'So sánh'}
                          </span>
                        </button>

                        {/* Remove favorite button (Top-Right) */}
                        <button
                          type="button"
                          onClick={() => removeFavorite(room.Id)}
                          title="Bỏ lưu khỏi mục yêu thích"
                          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md border border-rose-200 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        </button>

                        {/* Price Tag */}
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-white shadow-xs">
                          <span className="text-base font-extrabold tabular-nums">
                            {room.GiaThue.toLocaleString('vi-VN')}
                          </span>{' '}
                          <span className="text-[10px] text-blue-200">đ/tháng</span>
                        </div>
                      </div>

                      {/* Body Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                            {room.TieuDe}
                          </h3>

                          {/* Address & Area */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-start gap-1.5 text-slate-500 line-clamp-1 flex-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{room.DiaChi}, {room.QuanHuyen}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-lg text-[11px] shrink-0">
                              <Maximize2 className="w-3 h-3 text-blue-600" />
                              <span>{room.DienTich} m²</span>
                            </span>
                          </div>

                          {/* Status Strip */}
                          <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${statusInfo.pillClass}`}>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className={`w-2 h-2 rounded-full ${
                                statusInfo.type === 'con-trong'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : statusInfo.type === 'da-dat'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`} />
                              <span>{statusInfo.statusText}</span>
                            </div>
                            <span className="text-[11px] font-medium opacity-90">
                              {statusInfo.subtitle}
                            </span>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {room.TienIch &&
                              room.TienIch.slice(0, 4).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                                >
                                  {amenity}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => removeFavorite(room.Id)}
                            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Bỏ lưu</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectRoomDetail) {
                                onSelectRoomDetail(room.Id);
                              } else {
                                setViewingRoomId(room.Id);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Xem phòng</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* My Inquiries Tab */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh sách phòng bạn đã liên hệ / đặt cọc</h2>
              <p className="text-xs text-slate-500">Theo dõi trạng thái xác nhận từ chủ nhà trọ</p>
            </div>
            <button
              onClick={fetchMyInquiries}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Làm mới
            </button>
          </div>

          {myInquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Bạn chưa gửi lời hẹn hoặc đặt cọc phòng nào.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Khám phá phòng ngay
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myInquiries.map((inq) => (
                <div key={inq.Id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{inq.TieuDePhong}</h4>
                    <p className="text-xs text-slate-500">Lời nhắn: "{inq.GhiChu}"</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Thời gian: {new Date(inq.NgayTao).toLocaleDateString('vi-VN')}</span>
                      {inq.TienCoc > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-bold text-emerald-600">
                            Đã tạm giữ cọc: {inq.TienCoc.toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {inq.TrangThai === 'ChoXacNhan' && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ chủ trọ phản hồi
                      </span>
                    )}
                    {inq.TrangThai === 'DaDuyet' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Chủ trọ đã đồng ý
                      </span>
                    )}
                    {inq.TrangThai === 'TuChoi' && (
                      <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        Đã từ chối (hoàn lại cọc)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
