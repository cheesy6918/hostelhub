import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Maximize2, 
  Upload, 
  Video, 
  FileText, 
  Check, 
  X, 
  Plus, 
  ArrowLeft,
  Users,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockRoommates, TinOGhep } from '../utils/roommatesData';

interface RoommateCreatePostViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

const DISTRICTS = [
  'Cầu Giấy',
  'Đống Đa',
  'Hai Bà Trưng',
  'Ba Đình',
  'Thanh Xuân',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông',
];

const AVAILABLE_AMENITIES = [
  'Điều hòa',
  'Nóng lạnh',
  'Vệ sinh riêng',
  'Giờ tự do',
  'Gác lửng',
  'Tủ lạnh',
  'Máy giặt',
  'Wifi tốc độ cao',
  'Chỗ để xe máy',
  'Khóa vân tay',
  'Thang máy',
  'Ban công thoáng',
  'Bếp nấu ăn',
  'Không chung chủ',
];

export const RoommateCreatePostView: React.FC<RoommateCreatePostViewProps> = ({ onBack, onSuccess }) => {
  const { user, token } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Cầu Giấy');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Tất cả'>('Tất cả');
  const [area, setArea] = useState<number | ''>(25);
  const [price, setPrice] = useState<number | ''>(1500000);
  const [electricPrice, setElectricPrice] = useState('3.800 đ/số');
  const [waterPrice, setWaterPrice] = useState('30.000 đ/khối');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Điều hòa',
    'Nóng lạnh',
    'Wifi tốc độ cao',
    'Không chung chủ'
  ]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [roomRules, setRoomRules] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  // Toggle tiện ích
  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  // Thêm ảnh từ URL
  const handleAddImageUrl = () => {
    if (!inputImageUrl.trim()) return;
    setImages(prev => [...prev, inputImageUrl.trim()]);
    setInputImageUrl('');
  };

  // Upload ảnh từ máy tính (đọc base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Xử lý gửi tin lên Máy chủ Backend & TiDB Cloud
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');

    if (!title.trim() || !address.trim() || !price || !area) {
      setErrorNotice('Vui lòng điền đầy đủ tiêu đề, địa chỉ, giá ghép và diện tích phòng!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (images.length === 0) {
      setErrorNotice('Vui lòng cung cấp ít nhất 1 hình ảnh thực tế của căn phòng!');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    // Xử lý mảng ảnh an toàn, nếu base64 quá nặng thì thay bằng ảnh placeholder đẹp mắt
    const safeImages = images.map((img) => {
      if (typeof img === 'string' && img.startsWith('data:image') && img.length > 2500) {
        return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80';
      }
      return img;
    });

    const newPostPayload = {
      TieuDe: title.trim(),
      GiaThue: Number(price),
      DienTich: Number(area),
      QuanHuyen: district,
      DiaChi: address.trim(),
      DoiTuongGhep: gender,
      MoTa: description.trim() || 'Cần tìm bạn ở ghép hòa đồng, có ý thức chung.',
      TienNghi: selectedAmenities,
      HinhAnh: safeImages,
      VideoUrl: videoUrl.trim() || undefined,
      TrangThaiDuyet: 'Chờ duyệt', // Gửi rõ ràng để Admin lọc chính xác tab Chờ duyệt
    };

    try {
      // 1. Gửi lên API Backend để lưu vào TiDB Cloud
      const res = await fetch('/api/roommates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.VaiTro || 'SinhVien',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newPostPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi gửi bài đăng lên máy chủ');
      }

      // 2. Tạo đối tượng hoàn chỉnh để phản hồi tức thì
      const createdItem: TinOGhep = data.data || {
        ...newPostPayload,
        Id: `oghep_${Date.now()}`,
        TacGia: {
          Ten: user?.HoTen || 'Sinh viên',
          Sdt: user?.Sdt || '',
          Zalo: user?.Sdt || '',
          TrangThai: 'Đang online',
        },
        NgayCapNhat: 'Vừa xong',
        NgayDang: `Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`,
        NgayHetHan: 'Sau 30 ngày',
        TrangThaiDuyet: 'Chờ duyệt',
      };

      // 3. Bảo toàn các bài mẫu cũ, thêm bài mới lên đầu
      if (!mockRoommates.some(p => String(p.Id) === String(createdItem.Id))) {
        mockRoommates.unshift(createdItem);
      }

      // 4. Đồng bộ an toàn vào localStorage không làm mất bài cũ
      const saved = localStorage.getItem('hostelhub_roommates');
      let currentList: TinOGhep[] = [];
      if (saved) {
        try {
          currentList = JSON.parse(saved);
        } catch {
          currentList = [...mockRoommates];
        }
      } else {
        currentList = [...mockRoommates];
      }

      if (!currentList.some(p => String(p.Id) === String(createdItem.Id))) {
        currentList.unshift(createdItem);
      }
      localStorage.setItem('hostelhub_roommates', JSON.stringify(currentList));

      onSuccess();
    } catch (err: any) {
      console.error('Lỗi đăng tin ở ghép:', err);
      setErrorNotice(err.message || 'Không thể đăng bài viết, vui lòng thử lại.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang Ở ghép</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500">Tài khoản đăng tin:</span>
          <strong className="text-xs text-slate-800 ml-1.5">{user?.HoTen || 'Sinh viên'}</strong>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorNotice && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* MỤC 1: THÔNG TIN CHUNG BÀI ĐĂNG TÌM Ở GHÉP */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 text-blue-600 font-bold text-sm border-b border-slate-100 pb-3">
            <Users className="w-5 h-5" />
            <span>1. Thông tin bài đăng tìm bạn ở ghép</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Tiêu đề bài viết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tìm bạn nữ ở ghép CCMN full đồ ngõ 138 Triều Khúc, gần ĐH Hà Nội..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Địa chỉ chi tiết phòng trọ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, ngõ/ngách, tên đường, phường..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Quận / Huyện <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Đối tượng tìm ghép <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Tất cả">Tất cả (Nam hoặc Nữ)</option>
                  <option value="Nam">Chỉ tìm Nam</option>
                  <option value="Nữ">Chỉ tìm Nữ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Diện tích phòng (m²) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MỤC 2: CHI PHÍ & TIỆN ÍCH */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5" />
            <span>2. Chi phí & Tiện ích sẵn có</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Giá thuê ghép (đ/tháng/người) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-blue-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Giá điện dự kiến
                </label>
                <input
                  type="text"
                  value={electricPrice}
                  onChange={(e) => setElectricPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Giá nước dự kiến
                </label>
                <input
                  type="text"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Checklist tiện ích */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Tiện ích phòng & Không gian sống (chọn các mục phù hợp)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_AMENITIES.map((item) => {
                  const isChecked = selectedAmenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAmenity(item)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item}</span>
                      {isChecked && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MỤC 3: HÌNH ẢNH PHÒNG Ở GHÉP */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 text-purple-600 font-bold text-sm border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5" />
            <span>3. Hình ảnh căn phòng & Không gian sinh hoạt ({images.length} ảnh)</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nhập link ảnh */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputImageUrl}
                  onChange={(e) => setInputImageUrl(e.target.value)}
                  placeholder="Dán đường dẫn ảnh trực tiếp (https://...)"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
                >
                  + Thêm
                </button>
              </div>

              {/* Tải ảnh từ máy tính */}
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Tải ảnh từ máy tính / Điện thoại</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danh sách ảnh đã chọn */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    Ảnh #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                    title="Xóa ảnh này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MỤC 4: VIDEO THỰC TẾ PHÒNG TRỌ (TÙY CHỌN - LAYOUT CHUẨN GOOGLE DRIVE/YOUTUBE) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
              <Video className="w-5 h-5" />
              <span>4. Video thực tế phòng trọ (Tùy chọn)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Tăng 60% lượt tìm ghép
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Đường dẫn liên kết Video (Google Drive, YouTube, hoặc tệp .mp4)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="VD: https://drive.google.com/file/d/1a2b3c.../view hoặc https://youtu.be/..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Khung hướng dẫn chia sẻ link Google Drive */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-slate-500 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Hướng dẫn gắn video từ Google Drive:
              </span>
              <p>1. Tải video quay phòng lên Google Drive của bạn.</p>
              <p>2. Chuột phải vào video ➔ <strong>Chia sẻ (Share)</strong> ➔ Chuyển quyền truy cập chung thành <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong>.</p>
              <p>3. Sao chép liên kết dán vào ô trên, hệ thống sẽ tự động hiển thị video phát trực tiếp cho các bạn sinh viên khác xem.</p>
            </div>
          </div>
        </div>

        {/* MỤC 5: MÔ TẢ CHI TIẾT & TIÊU CHUẨN BẠN CÙNG PHÒNG */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5" />
            <span>5. Mô tả chi tiết & Tiêu chuẩn bạn cùng phòng</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mô tả chi tiết phòng trọ & Thói quen sinh hoạt
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể về phòng: giờ giấc đi lại, chỗ để xe, thói quen nấu nướng, yêu cầu bạn cùng phòng (gọn gàng, sạch sẽ, không dẫn bạn khác giới ngủ lại...)..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Nội quy hoặc cam kết chung trong phòng (Tùy chọn)
              </label>
              <textarea
                rows={3}
                value={roomRules}
                onChange={(e) => setRoomRules(e.target.value)}
                placeholder="VD: Giữ yên tĩnh sau 23h, luân phiên dọn vệ sinh hàng tuần, tiền phòng và điện nước chia đều vào mùng 5..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>

            {/* Lưu ý duyệt bài */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-amber-800 space-y-1">
              <span className="font-bold block flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                Quy trình kiểm duyệt tin đăng tìm ở ghép:
              </span>
              <p className="text-[11px] leading-relaxed">
                Sau khi bấm gửi tin, bài đăng của bạn sẽ chuyển sang trạng thái <strong>"Chờ duyệt"</strong>. Ban quản trị HostelHub sẽ đối chiếu và phê duyệt bài trong vòng 2–4 giờ để đảm bảo môi trường sinh viên văn minh và an toàn.
              </p>
            </div>
          </div>
        </div>

        {/* Nút Submit cuối trang */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{submitting ? 'Đang gửi bài...' : 'Đăng tin tìm bạn ở ghép (Chờ duyệt)'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};