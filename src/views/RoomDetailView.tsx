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
  ArrowLeftRight,
  QrCode,
  Copy,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Danh sách ngân hàng hỗ trợ tạo mã VietQR chuẩn quốc gia
const BANK_OPTIONS = [
  {
    id: 'MB',
    name: 'MBBank (Ngân hàng Quân Đội)',
    shortName: 'MBBank',
    accountNo: '0987654321',
    accountName: 'CONG TY HOSTELHUB VIETNAM',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'VCB',
    name: 'Vietcombank (Ngoại Thương Việt Nam)',
    shortName: 'Vietcombank',
    accountNo: '1023456789',
    accountName: 'CONG TY HOSTELHUB VIETNAM',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'TCB',
    name: 'Techcombank (Kỹ Thương Việt Nam)',
    shortName: 'Techcombank',
    accountNo: '19034567890',
    accountName: 'CONG TY HOSTELHUB VIETNAM',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    id: 'BIDV',
    name: 'BIDV (Đầu Tư & Phát Triển Việt Nam)',
    shortName: 'BIDV',
    accountNo: '2151000123456',
    accountName: 'CONG TY HOSTELHUB VIETNAM',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
];

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

  // QR Payment & Bank Top-up state (VietQR)
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);
  const [qrAmount, setQrAmount] = useState<number>(500000);
  const [customQrAmount, setCustomQrAmount] = useState<string>('');
  const [qrCopiedField, setQrCopiedField] = useState<string | null>(null);
  const [qrConfirmLoading, setQrConfirmLoading] = useState(false);
  const [qrSuccessMessage, setQrSuccessMessage] = useState('');
  const [qrImageError, setQrImageError] = useState(false);
  const [qrRefreshKey, setQrRefreshKey] = useState(0);

  // Review form state
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewHoverStar, setReviewHoverStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review Verification & Eligibility state (Xác minh thuê phòng 2 chiều)
  const [canReview, setCanReview] = useState(false);
  const [canReviewReason, setCanReviewReason] = useState('');
  const [canReviewLoading, setCanReviewLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState<any>(null);

  // Kiểm tra quyền đánh giá từ API
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!roomId) return;
      if (!user || !token) {
        setCanReview(false);
        setCanReviewReason('Vui lòng đăng nhập tài khoản sinh viên đã xác minh thuê phòng để viết nhận xét.');
        return;
      }
      try {
        setCanReviewLoading(true);
        const res = await fetch(`/api/rooms/${roomId}/can-review?userId=${user.Id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCanReview(Boolean(data.canReview));
          setCanReviewReason(data.reason || '');
          setContractInfo(data.contract || null);
        } else {
          setCanReview(false);
          setCanReviewReason(data.message || 'Chỉ người thuê phòng đã được xác minh mới có thể gửi đánh giá và nhận xét.');
        }
      } catch {
        setCanReview(false);
        setCanReviewReason('Không thể kiểm tra điều kiện đánh giá.');
      } finally {
        setCanReviewLoading(false);
      }
    };

    checkReviewEligibility();
  }, [roomId, user, token]);

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

  // Dữ liệu & helper xử lý VietQR Ngân hàng
  const selectedBank = BANK_OPTIONS[selectedBankIndex] || BANK_OPTIONS[0];
  const effectiveQrAmount = customQrAmount ? (Number(customQrAmount) || 500000) : qrAmount;
  const studentCode = user?.Id ? user.Id.replace('usr_', '').toUpperCase() : 'SV';
  const roomCode = room?.Id ? room.Id.replace('room_', '').toUpperCase() : 'PHONG';
  const transferMemo = `HOSTELHUB ${studentCode} ${roomCode}`;

  const vietQrUrl = `https://img.vietqr.io/image/${selectedBank.id}-${selectedBank.accountNo}-compact2.png?amount=${effectiveQrAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(selectedBank.accountName)}&key=${qrRefreshKey}`;
  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(`VietQR|Bank:${selectedBank.shortName}|STK:${selectedBank.accountNo}|Name:${selectedBank.accountName}|Amount:${effectiveQrAmount}|Memo:${transferMemo}`)}`;

  const handleCopyText = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setQrCopiedField(fieldName);
      setTimeout(() => {
        setQrCopiedField(null);
      }, 2000);
    } catch {
      // Fallback nếu browser chặn clipboard
    }
  };

  const handleConfirmQrTopup = async () => {
    if (!token) {
      setDepositError('Vui lòng đăng nhập để nạp tiền vào ví.');
      return;
    }
    if (isNaN(effectiveQrAmount) || effectiveQrAmount <= 0) {
      return;
    }
    try {
      setQrConfirmLoading(true);
      await topupWallet(effectiveQrAmount);
      await refreshUser();
      setQrSuccessMessage(`Nạp thành công ${effectiveQrAmount.toLocaleString('vi-VN')} VNĐ vào ví HostelHub!`);
      setDepositError('');
      setTimeout(() => {
        setQrSuccessMessage('');
      }, 4000);
    } catch {
      setDepositError('Lỗi kết nối khi nạp tiền ví.');
    } finally {
      setQrConfirmLoading(false);
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
        setCanReview(false);
        setCanReviewReason('Bạn đã gửi đánh giá cho đợt thuê phòng này rồi. Cảm ơn bạn!');
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

              {/* Button to open review form - Chỉ hiển thị khi ĐỦ ĐIỀU KIỆN */}
              {canReview ? (
                <button
                  onClick={() => {
                    setShowReviewForm(!showReviewForm);
                    setReviewError('');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{showReviewForm ? 'Đóng biểu mẫu' : 'Viết đánh giá (Đã xác minh)'}</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-xl border border-slate-200/80 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Yêu cầu xác minh người thuê</span>
                </span>
              )}
            </div>

            {/* Review Success Banner */}
            {reviewSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* TH1: CHƯA ĐỦ ĐIỀU KIỆN ĐÁNH GIÁ (Ẩn form, hiển thị banner thông báo quy định) */}
            {!canReview && (
              <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 animate-in fade-in">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Cơ chế xác minh thuê phòng 2 chiều</span>
                    </h4>
                    <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                      Chống đánh giá ảo
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-bold leading-relaxed">
                    Chỉ người thuê phòng đã được xác minh mới có thể gửi đánh giá và nhận xét.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {canReviewReason || 'Hệ thống yêu cầu bạn và chủ trọ xác nhận hợp đồng thuê phòng ở trạng thái "Đang ở" hoặc "Đã hoàn tất" để bảo đảm 100% đánh giá minh bạch, khách quan từ sinh viên thực tế sinh sống.'}
                  </p>
                  {user && user.VaiTro === 'SinhVien' && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => onNavigate ? onNavigate('student-history') : undefined}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <span>Mở mục Quản lý hợp đồng & Xác nhận thuê phòng</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TH2: ĐỦ ĐIỀU KIỆN ĐÁNH GIÁ (Hiển thị banner khích lệ hoặc form nhập) */}
            {canReview && !showReviewForm && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950">
                      Bạn đã được xác minh là người thuê phòng ({contractInfo?.status === 'completed' ? 'Đã hoàn tất trả phòng' : 'Đang ở'})!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Hãy chia sẻ đánh giá thực tế của bạn để giúp các bạn sinh viên khác có thông tin hữu ích.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors shadow-2xs"
                >
                  Viết nhận xét ngay
                </button>
              </div>
            )}

            {/* Interactive Review Form - Chỉ mở khi ĐỦ ĐIỀU KIỆN */}
            {canReview && showReviewForm && (
              <form onSubmit={handleSendReview} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Đánh giá trải nghiệm thực tế của bạn
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ✔ Người thuê đã xác minh
                    </span>
                  </div>
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
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Đang gửi...' : 'Gửi nhận xét đánh giá'}
                  </button>
                </div>
              </form>
            )}

            {/* Notice */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Đánh giá thực tế và minh bạch từ sinh viên đã ký kết hợp đồng và xác minh thuê phòng 2 chiều.</span>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{rev.tenNguoiDanhGia}</span>
                          {/* Huy hiệu xanh: ✔ Đã xác minh thuê phòng (Verified Tenant) */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            ✔ Đã xác minh thuê phòng
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {rev.truongHoc || 'Người thuê đã xác minh'}
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
                      <ShieldCheck className="w-3.5 h-3.5" /> Hợp đồng hợp lệ
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

                  {/* Student Wallet & VietQR Top-up Widget */}
                  <div className="pt-1">
                    <div className="p-3 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/90 rounded-2xl border border-blue-200/80 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <span>Ví sinh viên:</span>
                        </div>
                        <span className="text-xs font-black text-blue-700 tabular-nums">
                          {(user?.soDuVi || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQrAmount(500000);
                          setCustomQrAmount('');
                          setShowQrModal(true);
                        }}
                        className="w-full py-2 px-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
                      >
                        <QrCode className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                        <span>Mã QR Nạp tiền Ngân hàng</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 group-hover:bg-white/20 text-blue-700 group-hover:text-white font-semibold ml-auto">
                          VietQR 24/7
                        </span>
                      </button>
                    </div>
                  </div>
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
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setQrAmount(500000);
                          setCustomQrAmount('');
                          setShowQrModal(true);
                        }}
                        className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Quét mã VietQR nạp 500.000 đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickTopupInModal}
                        disabled={topupLoading}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>{topupLoading ? 'Đang nạp...' : 'Nạp demo nhanh'}</span>
                      </button>
                    </div>
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

      {/* Modal 3: Quét mã QR thanh toán ngân hàng (VietQR) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Thanh toán & Nạp tiền qua VietQR</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">24/7</span>
                  </h3>
                  <p className="text-xs text-slate-500">Quét mã bằng app ngân hàng để chuyển khoản nạp tiền vào ví</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification / Success banner */}
            {qrSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{qrSuccessMessage}</span>
              </div>
            )}

            {/* Bank Selector Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1. Chọn ngân hàng thụ hưởng:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BANK_OPTIONS.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBankIndex(idx);
                      setQrImageError(false);
                      setQrRefreshKey(k => k + 1);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedBankIndex === idx
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{b.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  2. Chọn số tiền cần nạp:
                </label>
                <span className="text-[11px] text-slate-500">
                  Số dư hiện tại: <strong className="text-blue-700">{(user?.soDuVi || 0).toLocaleString('vi-VN')} đ</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setQrAmount(amt);
                      setCustomQrAmount('');
                      setQrImageError(false);
                      setQrRefreshKey(k => k + 1);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      qrAmount === amt && !customQrAmount
                        ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-2xs ring-1 ring-blue-400'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{amt.toLocaleString('vi-VN')} đ</span>
                    {amt === 500000 && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Đủ tiền cọc</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Display & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              {/* QR Code Frame */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center group">
                  <img
                    src={qrImageError ? fallbackQrUrl : vietQrUrl}
                    alt="Mã QR Chuyển khoản ngân hàng"
                    onError={() => setQrImageError(true)}
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                  {/* Watermark / Badge */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    NAPAS 247 · VietQR
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQrRefreshKey(k => k + 1);
                      setQrImageError(false);
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Làm mới mã</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <a
                    href={qrImageError ? fallbackQrUrl : vietQrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải ảnh QR</span>
                  </a>
                </div>
              </div>

              {/* Bank Transfer Details Table with Copy Buttons */}
              <div className="space-y-2.5 text-xs">
                {/* Bank Name */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Ngân hàng thụ hưởng</span>
                    <span className="font-bold text-slate-900">{selectedBank.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
                    {selectedBank.shortName}
                  </span>
                </div>

                {/* Account Number */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Số tài khoản</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{selectedBank.accountNo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedBank.accountNo, 'accountNo')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {qrCopiedField === 'accountNo' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Name */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Chủ tài khoản</span>
                    <span className="font-bold text-slate-800 uppercase">{selectedBank.accountName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedBank.accountName, 'accountName')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {qrCopiedField === 'accountName' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transfer Amount */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Số tiền nạp</span>
                    <span className="font-black text-blue-600 text-sm tabular-nums">
                      {effectiveQrAmount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(String(effectiveQrAmount), 'amount')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {qrCopiedField === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transfer Content / Memo */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="pr-2 truncate">
                    <span className="text-[10px] text-amber-800 block font-bold">Nội dung chuyển khoản (bắt buộc)</span>
                    <span className="font-mono font-bold text-slate-900 text-xs truncate block">{transferMemo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(transferMemo, 'memo')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    {qrCopiedField === 'memo' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-700" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Instruction Footer Note */}
            <div className="text-[11px] text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Mã VietQR đã tích hợp sẵn số tài khoản, số tiền và nội dung chuyển khoản. Sau khi chuyển khoản thành công trên app ngân hàng, vui lòng nhấn nút <strong>"Xác nhận đã chuyển khoản"</strong> bên dưới để số dư ví được cập nhật ngay lập tức.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmQrTopup}
                disabled={qrConfirmLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98 transition-all"
              >
                {qrConfirmLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật ví...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận đã chuyển khoản ({effectiveQrAmount.toLocaleString('vi-VN')} đ)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

