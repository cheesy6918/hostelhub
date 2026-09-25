import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useComparison } from '../context/ComparisonContext';
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  Zap,
  Droplets,
  ShieldCheck,
  Phone,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building,
  User as UserIcon,
  X,
  Loader2,
  Wallet,
  PlusCircle,
  Check,
  Clock,
  ArrowRight,
  Heart,
  ArrowLeftRight
} from 'lucide-react';

interface RoomDetailViewProps {
  roomId: string;
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ roomId, onBack, onNavigate }) => {
  const { user, token, refreshUser, topupWallet } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInComparison, toggleComparison } = useComparison();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Modals state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Appointment form state
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Deposit form state
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);

  // Review form state
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewHoverStar, setReviewHoverStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms/${roomId}`);
        const data = await res.json();
        if (data.success && data.room) {
          setRoom(data.room);
        } else {
          setError(data.message || 'Không tìm thấy phòng trọ.');
        }
      } catch {
        setError('Không thể tải thông tin chi tiết phòng trọ. Vui lòng kiểm tra kết nối.');
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [roomId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded-lg" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Không tìm thấy phòng trọ yêu cầu.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách phòng
        </button>
      </div>
    );
  }

  const images = (room.HinhAnh && room.HinhAnh.length > 0)
    ? room.HinhAnh
    : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'];

  const prevImage = () => {
    setSelectedImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const statusColor = () => {
    switch (room.TrangThai) {
      case 'Còn phòng':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Hết phòng':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Chờ duyệt':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Chờ chủ trọ xác nhận cọc':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Mở modal đặt lịch hẹn
  const handleOpenAppointmentModal = () => {
    setAppointmentError('');
    setAppointmentSuccess(false);
    // Mặc định gợi ý ngày mai lúc 09:00
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(9, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    setAppointmentDate(localISOTime);
    setShowAppointmentModal(true);
  };

  // Gửi đặt lịch hẹn
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setAppointmentError('Vui lòng đăng nhập tài khoản Sinh viên để đặt lịch hẹn.');
      return;
    }
    if (!appointmentDate) {
      setAppointmentError('Vui lòng chọn ngày và giờ hẹn xem phòng.');
      return;
    }

    const selectedTime = new Date(appointmentDate).getTime();
    if (isNaN(selectedTime) || selectedTime <= Date.now()) {
      setAppointmentError('Thời gian hẹn không hợp lệ, vui lòng chọn lại');
      return;
    }

    try {
      setAppointmentLoading(true);
      setAppointmentError('');
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          IdPhong: room.Id,
          ThoiGianHen: new Date(appointmentDate).toISOString(),
          GhiChu: appointmentNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointmentSuccess(true);
      } else {
        setAppointmentError(data.message || 'Không thể đặt lịch hẹn.');
      }
    } catch {
      setAppointmentError('Lỗi kết nối máy chủ khi đặt lịch.');
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Mở modal đặt cọc
  const handleOpenDepositModal = () => {
    setDepositError('');
    setDepositSuccess(false);
    setShowDepositModal(true);
  };

  // Nạp nhanh tiền demo trong modal
  const handleQuickTopupInModal = async () => {
    try {
      setTopupLoading(true);
      setDepositError('');
      await topupWallet(500000);
      await refreshUser();
    } catch {
      setDepositError('Lỗi khi nạp tiền ví demo.');
    } finally {
      setTopupLoading(false);
    }
  };

  // Xác nhận đặt cọc
  const handleSubmitDeposit = async () => {
    if (!token) {
      setDepositError('Vui lòng đăng nhập tài khoản Sinh viên để đặt cọc.');
      return;
    }

    const currentBalance = user?.soDuVi || 0;
    if (currentBalance < 500000) {
      setDepositError('Số dư không đủ');
      return;
    }

    try {
      setDepositLoading(true);
      setDepositError('');
      // Animation delay nhẹ tăng trải nghiệm
      await new Promise(r => setTimeout(r, 600));

      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          IdPhong: room.Id,
          ThoiHanGiuCho: '48 giờ sau khi chủ trọ xác nhận',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDepositSuccess(true);
        setRoom(prev => (prev ? { ...prev, TrangThai: 'Chờ chủ trọ xác nhận cọc' } : null));
        await refreshUser();
      } else {
        setDepositError(data.message || 'Không thể đặt cọc giữ phòng.');
      }
    } catch {
      setDepositError('Lỗi kết nối khi thanh toán đặt cọc.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setReviewError('Vui lòng đăng nhập để gửi nhận xét đánh giá.');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Vui lòng nhập nhận xét chi tiết về phòng trọ.');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError('');
      const res = await fetch(`/api/rooms/${roomId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          soSao: reviewStar,
          nhanXet: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewComment('');
        setReviewSuccessMsg('Gửi đánh giá thành công! Cảm ơn trải nghiệm thực tế quý giá của bạn.');
        setTimeout(() => setReviewSuccessMsg(''), 4500);
        setShowReviewForm(false);
        if (data.allReviews) {
          setRoom(prev => (prev ? { ...prev, DanhGia: data.allReviews } : null));
        }
      } else {
        setReviewError(data.message || 'Không thể gửi đánh giá.');
      }
    } catch {
      setReviewError('Lỗi kết nối mạng, vui lòng thử lại.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const reviewsList = (room.DanhGia && room.DanhGia.length > 0)
    ? room.DanhGia
    : [
        {
          id: 'rev_1',
          tenNguoiDanhGia: 'Nguyễn Tiến Dũng',
          truongHoc: 'Sinh viên năm 3 - ĐH Bách Khoa',
          soSao: 5,
          nhanXet: 'Phòng sạch sẽ, gác lửng cao đứng thoải mái. Bác chủ trọ tốt bụng, có hỏng bóng đèn báo là bác thay ngay.',
          ngay: '14/09/2026',
        },
        {
          id: 'rev_2',
          tenNguoiDanhGia: 'Trần Thị Mai',
          truongHoc: 'Sinh viên năm 2 - ĐH Kinh Tế',
          soSao: 5,
          nhanXet: 'Khu vực an ninh tốt, đi bộ ra chợ rất gần, mạng internet khỏe tha hồ học online.',
          ngay: '02/09/2026',
        },
      ];

  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + (r.soSao || 5), 0) / reviewsList.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar: Back button & Favorite bookmark */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all shadow-xs">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Quay lại tìm kiếm phòng trọ</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (room) toggleComparison(room);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs cursor-pointer ${
              room && isInComparison(room.Id)
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20 hover:bg-blue-700'
                : 'bg-white text-slate-700 border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <ArrowLeftRight className={`w-4 h-4 ${room && isInComparison(room.Id) ? 'text-white' : 'text-slate-400'}`} />
            <span>{room && isInComparison(room.Id) ? 'Đang trong danh sách so sánh' : 'Thêm vào so sánh'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(room.Id, room)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs cursor-pointer ${
              isFavorite(room.Id)
                ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                : 'bg-white text-slate-700 border-slate-200 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(room.Id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>{isFavorite(room.Id) ? 'Đã lưu yêu thích' : 'Lưu vào mục yêu thích'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Gallery, Info, Rules, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery / Carousel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            {/* Big Main Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 group">
              <img
                src={images[selectedImgIndex]}
                alt={room.TieuDe}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />

              {/* Status Badge Over Image */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-xs ${statusColor()}`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {room.TrangThai}
                </span>
              </div>

              {/* Counter Badge */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-medium">
                {selectedImgIndex + 1} / {images.length}
              </div>

              {/* Prev / Next Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform active:scale-95"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform active:scale-95"
                    aria-label="Ảnh tiếp"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImgIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${idx}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Title, Address & Specs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" />
                <span>Mã tin: #{room.Id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {room.TieuDe}
              </h1>
              <div className="flex items-start gap-2 text-sm text-slate-600 mt-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{room.DiaChi}, {room.QuanHuyen}</span>
              </div>
            </div>

            {/* Price & Specs Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Giá thuê</span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">
                  {room.GiaThue.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs text-slate-500 block">đ/tháng</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Giá điện</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {room.GiaDien || '3.800 đ/kWh'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Giá nước</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  {room.GiaNuoc || '30.000 đ/khối'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Diện tích</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {room.DienTich || 20} m²
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Mô tả phòng trọ</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {room.MoTa}
              </p>
            </div>

            {/* Amenities Section */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Tiện ích phòng & tòa nhà</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {room.TienIch && room.TienIch.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-800 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Nội quy phòng trọ</span>
              </h2>
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4.5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {room.NoiQuy || '1. Giữ trật tự chung sau 23:00.\n2. Vệ sinh sạch sẽ không vứt rác bừa bãi.\n3. Khóa cửa cẩn thận khi ra vào.'}
              </div>
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">Đánh giá từ sinh viên</h2>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-extrabold shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating} / 5.0</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  ({reviewsList.length} nhận xét)
                </span>
              </div>

              {/* Button to open review form */}
              <button
                onClick={() => {
                  setShowReviewForm(!showReviewForm);
                  setReviewError('');
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                <span>{showReviewForm ? 'Đóng biểu mẫu' : 'Viết đánh giá'}</span>
              </button>
            </div>

            {/* Review Success Banner */}
            {reviewSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* Interactive Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSendReview} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Đánh giá trải nghiệm thực tế của bạn
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {user ? `Người đánh giá: ${user.HoTen}` : 'Cần đăng nhập để đánh giá'}
                  </span>
                </div>

                {/* Star rating selector (1-5) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mức độ hài lòng:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (reviewHoverStar || reviewStar) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewStar(star)}
                            onMouseEnter={() => setReviewHoverStar(star)}
                            onMouseLeave={() => setReviewHoverStar(0)}
                            className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-hidden"
                            title={`${star} sao`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      {reviewStar === 5 && '⭐⭐⭐⭐⭐ Tuyệt vời - Rất hài lòng'}
                      {reviewStar === 4 && '⭐⭐⭐⭐ Tốt - Phòng đúng mô tả'}
                      {reviewStar === 3 && '⭐⭐⭐ Bình thường - Ổn định'}
                      {reviewStar === 2 && '⭐⭐ Tạm được - Cần cải thiện'}
                      {reviewStar === 1 && '⭐ Chưa hài lòng'}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhận xét chi tiết <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => {
                      setReviewComment(e.target.value);
                      if (reviewError) setReviewError('');
                    }}
                    placeholder="Chia sẻ về độ sạch sẽ, an ninh khu vực, tiện nghi, thái độ của chủ trọ, tốc độ wifi..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {reviewError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{reviewError}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Đang gửi...' : 'Gửi nhận xét đánh giá'}
                  </button>
                </div>
              </form>
            )}

            {/* Notice */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Đánh giá thực tế và minh bạch từ sinh viên đã hẹn xem phòng hoặc đặt cọc giữ chỗ.</span>
            </div>

            {/* Reviews List */}
            <div className="space-y-3 pt-1">
              {reviewsList.map((rev, i) => (
                <div key={rev.id || i} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {(rev.tenNguoiDanhGia || 'S').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{rev.tenNguoiDanhGia}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-md font-semibold">
                            Sinh viên
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {rev.truongHoc || 'Đã xác thực xem phòng/đặt cọc'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/50">
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.soSao || 5)].map((_, s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 ml-1">
                        {rev.soSao || 5}.0
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-0.5">"{rev.nhanXet}"</p>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-400">
                    <span>Thời gian đánh giá: {rev.ngay}</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã xác thực
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary, Landlord Contact, Action Buttons */}
        <div className="space-y-6">
          
          {/* Main Action Card */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 sticky top-24 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Mức giá thuê trọn gói</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-blue-600 tabular-nums">
                  {room.GiaThue.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-semibold text-slate-600">VNĐ / tháng</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                ⚡ Điện: <strong className="text-slate-700">{room.GiaDien}</strong> · 💧 Nước: <strong className="text-slate-700">{room.GiaNuoc}</strong>
              </div>
            </div>

            {/* Landlord Contact Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Thông tin chủ trọ
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {room.ChuTroTen ? room.ChuTroTen.charAt(0) : 'C'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{room.ChuTroTen || 'Chủ trọ HostelHub'}</h4>
                  <p className="text-xs text-slate-500">Đã xác minh số điện thoại & CCCD</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Hotline / Zalo:</span>
                <a
                  href={`tel:${room.ChuTroSdt}`}
                  className="font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {room.ChuTroSdt || '0987654321'}
                </a>
              </div>
            </div>

            {/* Quick bookmark to favorites */}
            <button
              type="button"
              onClick={() => toggleFavorite(room.Id, room)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-xs ${
                isFavorite(room.Id)
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite(room.Id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span>{isFavorite(room.Id) ? 'Đã lưu trong mục yêu thích' : 'Lưu vào mục yêu thích'}</span>
            </button>

            {/* Action Buttons as requested: Đặt lịch hẹn xem phòng & Đặt cọc giữ phòng */}
            <div className="space-y-3">
              {room.TrangThai === 'Hết phòng' ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-700">Phòng này hiện đã được thuê hết</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Không thể đặt lịch hẹn hoặc đặt cọc phòng này</p>
                  </div>

                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    title="Phòng này hiện đã được thuê hết"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Đặt lịch hẹn xem phòng (Khóa)</span>
                  </button>

                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    title="Phòng này hiện đã được thuê hết"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Đặt cọc giữ phòng (Khóa)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {room.TrangThai === 'Chờ chủ trọ xác nhận cọc' && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 flex items-start gap-2">
                      <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Phòng đang có sinh viên đặt cọc giữ chỗ (Chờ chủ trọ xác nhận). Bạn vẫn có thể đặt lịch hẹn dự phòng.</span>
                    </div>
                  )}

                  <button
                    onClick={handleOpenAppointmentModal}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt lịch hẹn xem phòng</span>
                  </button>

                  <button
                    onClick={handleOpenDepositModal}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Đặt cọc giữ phòng (500.000 VNĐ)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
              <p>✓ Không thu phí môi giới trung gian đối với sinh viên.</p>
              <p>✓ Tiền cọc giữ phòng 500.000 VNĐ được đảm bảo an toàn qua hệ thống ví.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Đặt lịch hẹn xem phòng */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Đặt lịch hẹn xem phòng</h3>
              </div>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appointmentSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">Đặt lịch hẹn xem phòng thành công!</h4>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Trạng thái: Chờ chủ trọ xác nhận
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 max-w-sm mx-auto">
                    Yêu cầu đã được chuyển tới chủ trọ ({room.ChuTroTen}). Bạn có thể theo dõi tiến độ hoặc hủy lịch nếu thay đổi kế hoạch trong trang Lịch sử.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      onNavigate?.('student-history');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Xem tại Lịch sử của tôi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAppointmentModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                {/* Room snapshot */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Hẹn xem phòng:</span>
                  <p className="font-bold text-slate-900 line-clamp-1">{room.TieuDe}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{room.DiaChi}, {room.QuanHuyen}</span>
                  </p>
                </div>

                {/* Validation Error banner */}
                {appointmentError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold animate-in fade-in duration-150">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{appointmentError}</span>
                  </div>
                )}

                {/* Date & Time Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Chọn ngày & giờ hẹn xem phòng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={appointmentDate}
                      onChange={(e) => {
                        setAppointmentDate(e.target.value);
                        if (appointmentError) setAppointmentError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Lưu ý: Thời gian hẹn phải là thời điểm trong tương lai.
                  </span>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Lời nhắn gửi chủ trọ (tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={appointmentNote}
                    onChange={(e) => setAppointmentNote(e.target.value)}
                    placeholder="VD: Em đi cùng 1 bạn cùng phòng qua xem, bác hướng dẫn em chỗ để xe nhé..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={appointmentLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {appointmentLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{appointmentLoading ? 'Đang gửi yêu cầu...' : 'Xác nhận đặt lịch'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Đặt cọc giữ phòng (Ví demo) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Đặt cọc giữ phòng trọ</h3>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {depositLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-slate-800">Đang xử lý giao dịch đặt cọc...</h4>
                  <p className="text-xs text-slate-500">
                    Hệ thống đang trừ tiền ví và thiết lập bảo lãnh giữ phòng 48 giờ.
                  </p>
                </div>
              </div>
            ) : depositSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-slate-900">Đặt cọc giữ phòng thành công!</h4>
                  <p className="text-xs text-slate-600">
                    Số dư ví của bạn đã được trừ <strong>500.000 VNĐ</strong> và được HostelHub bảo lãnh.
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Trạng thái phòng: Chờ chủ trọ xác nhận cọc
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-2 max-w-sm mx-auto">
                    Nếu chủ trọ từ chối, tiền cọc 500.000 VNĐ sẽ được hoàn lại 100% vào ví của bạn. Bạn cũng có thể chủ động hủy cọc trong trang Lịch sử.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      onNavigate?.('student-history');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Xem tại Lịch sử của tôi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Deposit specs */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Số tiền cọc quy định:</span>
                    <span className="text-base font-black text-emerald-700 tabular-nums">500.000 VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Thời hạn giữ chỗ:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      48 giờ sau khi chủ trọ xác nhận
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Số dư ví của bạn:</span>
                    <span className="font-bold text-blue-900 tabular-nums">
                      {(user?.soDuVi || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>

                {/* Validation Error banner: Số dư không đủ */}
                {(depositError || (user && (user.soDuVi || 0) < 500000)) && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{depositError || 'Số dư không đủ'}</span>
                    </div>
                    <p className="text-[11px] text-rose-600 leading-relaxed">
                      Số dư ví hiện tại ({(user?.soDuVi || 0).toLocaleString('vi-VN')} đ) không đủ để thanh toán tiền cọc 500.000 VNĐ. Hãy nạp thêm tiền ví demo để tiếp tục.
                    </p>
                    <button
                      type="button"
                      onClick={handleQuickTopupInModal}
                      disabled={topupLoading}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{topupLoading ? 'Đang nạp...' : '+ Nạp nhanh 500.000 VNĐ vào ví demo'}</span>
                    </button>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-semibold text-slate-700">🛡️ Cam kết an toàn HostelHub:</p>
                  <p>1. Tiền cọc 500.000 VNĐ được tạm giữ trung gian, không chuyển trực tiếp cho chủ trọ cho tới khi bạn hoàn tất nhận phòng.</p>
                  <p>2. Phòng sẽ được chuyển sang trạng thái <strong>"Chờ chủ trọ xác nhận cọc"</strong> để bảo vệ chỗ của bạn.</p>
                  <p>3. Được hoàn lại 100% nếu chủ trọ từ chối hoặc bạn hủy đơn trước khi duyệt.</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDeposit}
                    disabled={!user || (user.soDuVi || 0) < 500000}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Xác nhận thanh toán 500.000 VNĐ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

