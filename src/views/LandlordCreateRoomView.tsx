import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Building,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Droplets,
  DollarSign,
  Maximize2,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Play,
  ExternalLink
} from 'lucide-react';
import { parseVideoUrl } from '../utils/video';

interface LandlordCreateRoomViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SAMPLE_PRESET_IMAGES = [
  {
    title: 'Phòng gác lửng đúc hiện đại',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Studio ban công sáng thoáng',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Nội thất gỗ sồi ấm áp',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Góc bếp & bàn học sinh viên',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Căn hộ mini duplex tầng cao',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Phòng khép kín sạch sẽ',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
  },
];

const AVAILABLE_AMENITIES = [
  'Điều hòa',
  'Nóng lạnh',
  'Vệ sinh riêng',
  'Giờ tự do',
  'Gác lửng',
  'Tủ lạnh',
  'Máy giặt',
  'Wifi',
  'Chỗ để xe',
  'Khóa vân tay',
  'Thang máy',
  'Ban công',
];

export const LandlordCreateRoomView: React.FC<LandlordCreateRoomViewProps> = ({ onBack, onSuccess }) => {
  const { token, user } = useAuth();

  const [tieuDe, setTieuDe] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [quanHuyen, setQuanHuyen] = useState('Cầu Giấy, Hà Nội');
  const [giaThue, setGiaThue] = useState<number | ''>(2500000);
  const [giaDien, setGiaDien] = useState<number | ''>(3800);
  const [giaNuoc, setGiaNuoc] = useState<number | ''>(30000);
  const [dienTich, setDienTich] = useState<number | ''>(25);
  const [loaiPhong, setLoaiPhong] = useState<'GacLung' | 'Studio' | 'ChungCuMini' | 'KyTucXa'>('GacLung');
  
  // Selected amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Điều hòa',
    'Nóng lạnh',
    'Vệ sinh riêng',
    'Giờ tự do',
  ]);

  const [moTa, setMoTa] = useState(
    'Phòng mới tinh tươm, thoáng mát sạch sẽ, có ban công thoáng gió. Vị trí trung tâm thuận tiện đi lại đến các trường đại học lớn. Giờ giấc tự do, an ninh đảm bảo 24/7.'
  );

  const [noiQuy, setNoiQuy] = useState(
    '1. Giữ trật tự chung sau 23:00, không tụ tập làm ồn ảnh hưởng phòng bên cạnh.\n2. Vệ sinh sạch sẽ khu vực hành lang và bếp.\n3. Khóa cửa cẩn thận khi ra vào.\n4. Đóng tiền phòng và điện nước đúng hẹn từ ngày 1 đến ngày 5 hàng tháng.'
  );

  // Images state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleSelectPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!tieuDe.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề phòng trọ.');
      return;
    }
    if (!diaChi.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ cụ thể của phòng trọ.');
      return;
    }
    if (!giaThue || Number(giaThue) <= 0) {
      setErrorMessage('Vui lòng nhập mức giá thuê hợp lệ.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Vui lòng thêm ít nhất 1 hình ảnh mô tả phòng trọ.');
      return;
    }

    try {
      setSubmitting(true);
      const authToken = token || localStorage.getItem('token') || '';
      if (!authToken) {
        const authErr = 'Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại tài khoản Chủ trọ.';
        console.error("Lỗi đăng tin:", authErr);
        alert(authErr);
        setErrorMessage(authErr);
        setSubmitting(false);
        return;
      }

      const landlordId = (user && (user.Id || (user as any).id)) || 'usr_chutro';
      const landlordName = (user && user.HoTen) || 'Trần Thị Bích (Chủ trọ)';
      const landlordPhone = (user && user.Sdt) || '0987654321';

      // Đảm bảo request gửi kèm đầy đủ headers xác thực
      const authHeader = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

      // Ép kiểu Number() cho GiaThue, GiaDien, GiaNuoc, DienTich theo yêu cầu
      const numGiaThue = Number(giaThue);
      const numGiaDien = typeof giaDien === 'number' ? giaDien : (Number(String(giaDien).replace(/[^\d]/g, '')) || 3800);
      const numGiaNuoc = typeof giaNuoc === 'number' ? giaNuoc : (Number(String(giaNuoc).replace(/[^\d]/g, '')) || 30000);
      const numDienTich = Number(dienTich) || 20;

      const payload = {
        TieuDe: tieuDe.trim(),
        DiaChiChiTiet: diaChi.trim(),
        DiaChi: diaChi.trim(),
        QuanHuyen: quanHuyen,
        LoaiPhong: loaiPhong,
        DienTich: numDienTich,
        GiaThue: numGiaThue,
        GiaDien: numGiaDien,
        GiaNuoc: numGiaNuoc,
        TienIch: selectedAmenities,
        HinhAnh: images,
        MoTa: moTa.trim(),
        NoiQuy: noiQuy.trim(),
        IdChuTro: landlordId,
        ChuTroId: landlordId,
        chu_tro_id: landlordId,
        landlord_id: landlordId,
        ChuTroTen: landlordName,
        ChuTroSdt: landlordPhone,
        VideoUrl: videoUrl.trim() || undefined,
      };

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });

      let responseData: any = {};
      try {
        const rawText = await res.text();
        try {
          responseData = JSON.parse(rawText);
        } catch {
          responseData = { message: rawText || `Máy chủ phản hồi mã lỗi ${res.status}` };
        }
      } catch (readErr: any) {
        responseData = { message: readErr?.message || 'Không thể đọc phản hồi từ máy chủ' };
      }

      // Bắt buộc kiểm tra kết quả trả về status: 200/201 và responseData.success
      if ((res.status !== 200 && res.status !== 201) || !responseData?.success) {
        const errorMsg = responseData?.message || responseData?.error || `Lỗi máy chủ (HTTP ${res.status})`;
        console.error("Lỗi đăng tin:", errorMsg, responseData);
        alert(`Lỗi đăng tin: ${errorMsg}`);
        setErrorMessage(errorMsg);
        // KHÔNG tự ý navigate chuyển trang nếu chưa có kết quả trả về status: 200/201
        return;
      }

      const successMsg = responseData.message || 'Đăng phòng trọ thành công! Tin của bạn đang ở trạng thái Chờ duyệt.';
      alert(successMsg);
      setSuccessMessage(successMsg);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error("Lỗi đăng tin:", error);
      const actualErrorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.data?.message ||
        error?.message ||
        'Lỗi lưu dữ liệu phòng trọ vào cơ sở dữ liệu. Vui lòng kiểm tra lại.';
      alert(`Lỗi đăng tin: ${actualErrorMessage}`);
      setErrorMessage(actualErrorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-6 group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all shadow-xs">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span>Quay lại Quản lý phòng của tôi</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold mb-3">
          <Building className="w-3.5 h-3.5" />
          <span>Dành cho Chủ trọ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Đăng tin phòng trọ mới
        </h1>
        <p className="mt-2 text-blue-100 text-sm max-w-xl">
          Điền đầy đủ thông tin phòng trọ để tiếp cận hàng ngàn sinh viên đang tìm kiếm phòng. Sau khi gửi, tin sẽ ở trạng thái <strong>"Chờ duyệt"</strong>.
        </p>
      </div>

      {/* Error or Success notification */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <span>1. Thông tin chung phòng trọ</span>
          </h2>

          {/* Room Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tiêu đề tin đăng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Phòng gác lửng mới đúc cực đẹp gần ĐH Bách Khoa, có điều hòa..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Address & District */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ chi tiết (Số nhà, Ngõ/Ngách, Tên đường) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                placeholder="VD: Số 18 Ngõ 204 Tạ Quang Bửu"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quận / Huyện
              </label>
              <select
                value={quanHuyen}
                onChange={(e) => setQuanHuyen(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
              >
                <option value="Cầu Giấy, Hà Nội">Cầu Giấy, Hà Nội</option>
                <option value="Hai Bà Trưng, Hà Nội">Hai Bà Trưng, Hà Nội</option>
                <option value="Đống Đa, Hà Nội">Đống Đa, Hà Nội</option>
                <option value="Bắc Từ Liêm, Hà Nội">Bắc Từ Liêm, Hà Nội</option>
                <option value="Thanh Xuân, Hà Nội">Thanh Xuân, Hà Nội</option>
                <option value="Hà Đông, Hà Nội">Hà Đông, Hà Nội</option>
                <option value="Quận 1, TP.HCM">Quận 1, TP.HCM</option>
                <option value="Thủ Đức, TP.HCM">Thủ Đức, TP.HCM</option>
              </select>
            </div>
          </div>

          {/* Room Type & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Loại hình phòng
              </label>
              <select
                value={loaiPhong}
                onChange={(e) => setLoaiPhong(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
              >
                <option value="GacLung">Phòng gác lửng</option>
                <option value="Studio">Studio khép kín</option>
                <option value="ChungCuMini">Chung cư mini</option>
                <option value="KyTucXa">Ký túc xá / Sleepbox</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Diện tích phòng (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={dienTich}
                  onChange={(e) => setDienTich(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="25"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Pricing & Utilities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>2. Chi phí & Đơn giá dịch vụ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá thuê / tháng (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50000"
                  min="500000"
                  required
                  value={giaThue}
                  onChange={(e) => setGiaThue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">đ/tháng</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá điện (VNĐ/kWh) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={giaDien}
                  onChange={(e) => setGiaDien(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="3800"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">đ/kWh</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá nước (VNĐ/tháng hoặc khối) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={giaNuoc}
                  onChange={(e) => setGiaNuoc(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="30000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">đ/tháng</span>
              </div>
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tiện ích có sẵn (Chọn các mục phù hợp)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_AMENITIES.map((item) => {
                const checked = selectedAmenities.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                      checked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(item)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Images Upload & Preset Selector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-purple-600" />
            <span>3. Hình ảnh phòng trọ</span>
          </h2>

          {/* Quick presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chọn nhanh ảnh mẫu phòng trọ chất lượng cao
              </span>
              <span className="text-[11px] text-slate-400">Click để thêm vào danh sách</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPresetImage(preset.url)}
                  className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-all text-left"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium line-clamp-1">{preset.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input & Local file upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nhập link URL ảnh trực tiếp
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/anh-phong.jpg"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tải ảnh từ máy tính / điện thoại
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Chọn tập tin ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Images Preview List */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Danh sách ảnh đã chọn ({images.length} ảnh) <span className="text-red-500">*</span>
            </span>
            {images.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                Chưa có ảnh nào được chọn. Vui lòng chọn ít nhất 1 ảnh ở trên.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={img}
                      alt={`uploaded-${index}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Ảnh đại diện
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-90 transition-all shadow-xs"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Video thực tế phòng trọ (Google Drive, YouTube, MP4) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-600" />
              <span>4. Video thực tế phòng trọ (Tùy chọn)</span>
            </h2>
            <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
              Tăng 80% lượt liên hệ
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Đường dẫn link Video (Google Drive, YouTube, hoặc tệp .mp4)
            </label>
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="VD: https://drive.google.com/file/d/1a2b3c4d.../view?usp=sharing hoặc https://youtu.be/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
              />
            </div>
            
            <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                Hướng dẫn dùng video từ Google Drive:
              </p>
              <p className="text-blue-800 pl-3">
                1. Tải video lên Google Drive của bạn.
              </p>
              <p className="text-blue-800 pl-3">
                2. Chuột phải vào video ➔ Chọn <strong>Chia sẻ (Share)</strong> ➔ Chuyển quyền truy cập chung thành <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong> (Anyone with the link).
              </p>
              <p className="text-blue-800 pl-3">
                3. Sao chép liên kết và dán vào đây. Hệ thống HostelHub sẽ tự động chuyển đổi sang định dạng nhúng video tương thích chuẩn xác!
              </p>
            </div>
          </div>

          {/* Live Preview if videoUrl is filled */}
          {videoUrl.trim() && (() => {
            const parsed = parseVideoUrl(videoUrl);
            return (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-rose-600" />
                    Xem trước video:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold uppercase">
                    {parsed.type === 'gdrive' ? 'Google Drive' : parsed.type === 'youtube' ? 'YouTube' : 'Video trực tiếp'}
                  </span>
                </div>

                <div className="aspect-16/9 w-full max-w-lg rounded-xl overflow-hidden bg-black border border-slate-300">
                  {parsed.isIframe ? (
                    <iframe
                      src={parsed.embedUrl}
                      title="Xem trước video phòng trọ"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : parsed.type === 'direct' ? (
                    <video controls src={parsed.embedUrl} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs p-4 text-center">
                      <p>Link: {parsed.originalUrl}</p>
                      <a href={parsed.originalUrl} target="_blank" rel="noreferrer" className="mt-2 text-blue-400 underline inline-flex items-center gap-1">
                        Mở liên kết <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Step 5: Description & House Rules */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>5. Mô tả chi tiết & Nội quy phòng</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mô tả phòng trọ <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả cụ thể về kết cấu phòng, trang bị, vị trí, khoảng cách đến các trường đại học..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội quy phòng trọ (NoiQuy) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={noiQuy}
              onChange={(e) => setNoiQuy(e.target.value)}
              placeholder="VD: 1. Giữ gìn trật tự sau 23h. 2. Không làm ồn... 3. Khóa cửa cẩn thận..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Quy định phê duyệt tin đăng:</span>
              <span>
                Theo quy định kiểm duyệt của HostelHub, sau khi bạn đăng tin, trạng thái mặc định sẽ là <strong>"Chờ duyệt"</strong>. Quản trị viên sẽ rà soát và thông qua để hiển thị công khai trên kênh tìm kiếm.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đăng tin...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Đăng phòng trọ (Chờ duyệt)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
