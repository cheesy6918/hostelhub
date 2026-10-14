import React from 'react';
import { Search, RotateCcw, MapPin } from 'lucide-react';

interface LandlordRoomFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  districtFilter: string;
  onDistrictFilterChange: (value: string) => void;
  districts: string[];
  sortBy: string;
  onSortByChange: (value: string) => void;
  totalFilteredCount: number;
  onReset?: () => void;
  isFiltered?: boolean;
}

export const LandlordRoomFilter: React.FC<LandlordRoomFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  districtFilter,
  onDistrictFilterChange,
  districts,
  sortBy,
  onSortByChange,
  totalFilteredCount,
  onReset,
  isFiltered,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* 1. Ô tìm kiếm theo từ khóa */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên bài đăng, địa chỉ, số phòng..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 transition-all"
          />
        </div>

        {/* 2. Lọc theo Quận / Huyện (Tính năng 2) */}
        <div className="md:col-span-3 relative">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={districtFilter}
            onChange={(e) => onDistrictFilterChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:bg-white focus:border-blue-600 cursor-pointer"
          >
            <option value="all">Tất cả quận / khu vực</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Lọc theo trạng thái phòng */}
        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:bg-white focus:border-blue-600 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Đang còn phòng</option>
            <option value="rented">Đã cho thuê / Hết</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        {/* 4. Sắp xếp theo giá */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:bg-white focus:border-blue-600 cursor-pointer"
          >
            <option value="newest">Mới đăng nhất</option>
            <option value="price-asc">Giá thuê: Thấp → Cao</option>
            <option value="price-desc">Giá thuê: Cao → Thấp</option>
          </select>
        </div>
      </div>

      {/* Dòng hiển thị kết quả & Nút xóa nhanh bộ lọc (Tính năng 1) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">
          Tìm thấy <strong className="text-blue-600">{totalFilteredCount}</strong> kết quả
        </span>

        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};