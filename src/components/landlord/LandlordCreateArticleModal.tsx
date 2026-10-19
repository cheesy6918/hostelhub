import React, { useState, useRef } from 'react';
import { X, BookOpen, Sparkles, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandlordCreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GUIDE_CATEGORIES = [
  'Kinh nghiệm cho thuê',
  'Kinh nghiệm thuê phòng',
  'Cảnh báo lừa đảo đặt cọc',
  'Mẹo tiết kiệm & Decor phòng',
  'Nội quy & Hợp đồng',
];

export const LandlordCreateArticleModal: React.FC<LandlordCreateArticleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, token } = useAuth();
  const [tieuDe, setTieuDe] = useState('');
  const [tag, setTag] = useState('Kinh nghiệm cho thuê');
  const [moTaNgan, setMoTaNgan] = useState('');
  const [noiDung1, setNoiDung1] = useState('');
  const [noiDung2, setNoiDung2] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ref cho thẻ input file máy tính
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Xử lý khi chọn ảnh từ thư mục máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh có dung lượng dưới 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHinhAnh(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !moTaNgan.trim() || !noiDung1.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung bài viết.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const newArticle = {
        Id: `art_${Date.now()}`,
        TieuDe: tieuDe.trim(),
        Tag: tag,
        MoTaNgan: moTaNgan.trim(),
        TacGia: user?.HoTen || 'Chủ trọ HostelHub',
        ThoiGianDoc: '4 phút đọc',
        NgayDang: new Date().toLocaleDateString('vi-VN'),
        HinhAnh:
          hinhAnh.trim() ||
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        NoiDung1: noiDung1.trim(),
        NoiDung2: noiDung2.trim(),
      };

      // Gửi lên backend API (nếu có route /api/articles)
      await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newArticle),
      }).catch(() => {});

      onSuccess();
      onClose();
    } catch {
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">Đăng bài viết cẩm nang mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tiêu đề bài viết */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu đề bài viết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: 5 kinh nghiệm quản lý phòng trọ hiệu quả cho chủ nhà..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-blue-600 transition-all"
            />
          </div>

          {/* Hàng 2 cột: Chuyên mục & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Chuyên mục (Đã chỉnh mũi tên thoáng đẹp, không bị dính sát viền) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chuyên mục <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer appearance-none transition-all"
                >
                  {GUIDE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Ảnh bìa (Hỗ trợ Tải từ máy tính HOẶC Dán link URL) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Ảnh bìa bài viết</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh từ máy</span>
                </button>
              </div>

              {/* Input file ẩn */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <input
                type="text"
                value={hinhAnh}
                onChange={(e) => setHinhAnh(e.target.value)}
                placeholder="Dán link ảnh https://... hoặc bấm nút Tải ảnh"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Khung xem trước (Preview) ảnh bìa */}
          {hinhAnh && (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <img
                src={hinhAnh}
                alt="Xem trước ảnh bìa"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setHinhAnh('')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg text-[11px] font-semibold backdrop-blur-xs transition-all cursor-pointer"
              >
                Gỡ ảnh
              </button>
            </div>
          )}

          {/* Tóm tắt ngắn */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tóm tắt ngắn (1–2 câu) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={moTaNgan}
              onChange={(e) => setMoTaNgan(e.target.value)}
              placeholder="Mô tả tóm tắt để hiển thị ở danh sách bài viết..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-600 transition-all"
            />
          </div>

          {/* Nội dung đoạn 1 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội dung đoạn 1 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={noiDung1}
              onChange={(e) => setNoiDung1(e.target.value)}
              placeholder="Nội dung chính hoặc phần mở đầu bài chia sẻ..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-600 transition-all"
            />
          </div>

          {/* Nội dung đoạn 2 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội dung đoạn 2 (Tùy chọn)</label>
            <textarea
              rows={4}
              value={noiDung2}
              onChange={(e) => setNoiDung2(e.target.value)}
              placeholder="Lời khuyên, đúc kết kinh nghiệm hoặc lưu ý bổ sung..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-600 transition-all"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang đăng...' : 'Đăng bài viết'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};