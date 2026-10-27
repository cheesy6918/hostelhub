import React, { useState, useEffect } from 'react';
import { Room, Inquiry, TrangThaiPhong, LichHen, DatCoc, RentalContract } from '../types';
import { useAuth } from '../context/AuthContext';
import { LandlordRoomFilter } from '../components/landlord/LandlordRoomFilter';
import { LandlordRoomCard } from '../components/landlord/LandlordRoomCard';
import { LandlordWalletModal } from '../components/landlord/LandlordWalletModal';
import { LandlordCreateArticleModal } from '../components/landlord/LandlordCreateArticleModal';
import { ARTICLES_DATA as INITIAL_ARTICLES } from '../utils/articlesData';
import { LandlordRoomDetailModal } from '../components/landlord/LandlordRoomDetailModal';
import { parseVideoUrl } from '../utils/video';

import {
  Search,
  Tag,
  BookOpen,
  Building2,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  Maximize2,
  Zap,
  Droplets,
  DollarSign,
  AlertCircle,
  Clock,
  Eye,
  Check,
  X,
  ShieldCheck,
  Image as ImageIcon,
  Calendar,
  CreditCard,
  Phone,
  Wallet,
  FileText,
  Send,
  UserCheck,
  Star,
  RefreshCw,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

interface LandlordManageViewProps {
  onNavigateToCreate?: () => void;
  onViewRoomDetail?: (roomId: string) => void;
  initialTab?: 'rooms' | 'appointments' | 'deposits' | 'inquiries' | 'articles';
}

const AVAILABLE_AMENITIES_LIST = [
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

export const LandlordManageView: React.FC<LandlordManageViewProps> = ({
  onNavigateToCreate,
  onViewRoomDetail,
  initialTab,
}) => {
  // 👇 ĐẢM BẢO LẤY ĐỦ CẢ 3 BIẾN NÀY:
  const { user, token, refreshUser } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  // State bổ sung cho mục Tin nhắn liên hệ
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'pending' | 'handled'>('all');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [deposits, setDeposits] = useState<DatCoc[]>([]);
  const [articles, setArticles] = useState<any[]>(INITIAL_ARTICLES || []);
  const [loading, setLoading] = useState(true);

  // Khai báo activeTab ở đây:
  const [activeTab, setActiveTab] = useState<'rooms' | 'appointments' | 'deposits' | 'inquiries' | 'articles'>(
  initialTab || 'rooms'
);

  // State modal ví & bài viết:
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null); // 👈 DÁN DÒNG NÀY

  // --- State xem trước & chỉnh sửa cẩm nang của Chủ trọ ---
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  const [editArticleTitle, setEditArticleTitle] = useState('');
  const [editArticleTag, setEditArticleTag] = useState('Kinh nghiệm thuê phòng');
  const [editArticleSummary, setEditArticleSummary] = useState('');
  const [editArticleContent, setEditArticleContent] = useState('');
  const [editArticleImage, setEditArticleImage] = useState('');
  const [submittingEditArticle, setSubmittingEditArticle] = useState(false);

  const handleOpenEditArticle = (item: any) => {
    setEditingArticle(item);
    setEditArticleTitle(item.TieuDe || item.title || '');
    setEditArticleTag(item.Tag || item.ChuyenMuc || item.category || 'Kinh nghiệm thuê phòng');
    setEditArticleSummary(item.MoTaNgan || item.TomTat || item.NoiDung1 || '');
    setEditArticleContent(item.NoiDung || item.content || item.NoiDung1 || '');
    setEditArticleImage(item.HinhAnh || item.image || '');
    setShowEditArticleModal(true);
  };

  // Xử lý khi chủ trọ chọn tệp ảnh từ máy tính
  const handleUploadArticleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ chọn tệp định dạng hình ảnh (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    // Đọc file thành base64 data URL để lưu và hiển thị trực tiếp
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditArticleImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      setSubmittingEditArticle(true);
      const res = await fetch(`/api/articles/${editingArticle.Id || editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          TieuDe: editArticleTitle.trim(),
          Tag: editArticleTag,
          MoTaNgan: editArticleSummary.trim(),
          NoiDung: editArticleContent.trim(),
          HinhAnh: editArticleImage.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage('Cập nhật bài viết cẩm nang thành công!');
        setShowEditArticleModal(false);
        fetchLandlordData();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setArticles((prev) =>
          prev.map((a) =>
            (a.Id || a.id) === (editingArticle.Id || editingArticle.id)
              ? {
                ...a,
                TieuDe: editArticleTitle.trim(),
                Tag: editArticleTag,
                MoTaNgan: editArticleSummary.trim(),
                NoiDung: editArticleContent.trim(),
                HinhAnh: editArticleImage.trim(),
              }
              : a
          )
        );
        setActionMessage('Cập nhật bài viết cẩm nang thành công!');
        setShowEditArticleModal(false);
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi cập nhật cẩm nang.');
    } finally {
      setSubmittingEditArticle(false);
    }
  };

  const handleDeleteArticle = async (item: any) => {
    const articleId = item.Id || item.id;
    const title = item.TieuDe || item.title;
    if (!window.confirm(`[Chủ trọ] Bạn có chắc chắn muốn xóa bài viết cẩm nang:\n"${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => (a.Id || a.id) !== articleId));
        setActionMessage(`Đã xóa bài viết "${title}" thành công.`);
        setTimeout(() => setActionMessage(''), 3500);
      } else {
        setArticles((prev) => prev.filter((a) => (a.Id || a.id) !== articleId));
        setActionMessage(`Đã gỡ bài viết "${title}".`);
        setTimeout(() => setActionMessage(''), 3500);
      }
    } catch {
      setArticles((prev) => prev.filter((a) => (a.Id || a.id) !== articleId));
    }
  };

  // Các biến tính toán doanh thu & cọc:
  const totalDepositReceived = deposits
    .filter((d) => d.TrangThaiCoc === 'Đã tiếp nhận thành công' || d.TrangThaiCoc === 'Đã xác nhận')
    .reduce((sum, d) => sum + (d.SoTienCoc || 500000), 0);

  const expectedMonthlyRevenue = rooms
    .filter((r) => r.TrangThai === 'Hết phòng' || (r.TrangThai as string)?.toLowerCase().includes('dathue'))
    .reduce((sum, r) => sum + (r.GiaThue || 0), 0);

  // State bộ lọc phòng:
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all'); // 👈 THÊM DÒNG NÀY
  const [sortBy, setSortBy] = useState('newest');

  // Trích xuất danh sách các quận/huyện hiện có của chủ trọ
  const availableDistricts = Array.from(
    new Set(rooms.map((r) => r.QuanHuyen).filter(Boolean))
  ) as string[];

  // Kiểm tra xem người dùng có đang áp dụng bộ lọc nào không
  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'all' || districtFilter !== 'all';

  // Hàm đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDistrictFilter('all');
    setSortBy('newest');
  };

  // 1. Khai báo state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6; // 6 phòng/trang (2 hàng x 3 cột)

  // 2. Lọc và sắp xếp danh sách phòng (PHẢI NẰM Ở ĐÂY để có filteredRooms trước)
  const filteredRooms = rooms
    .filter((room) => {
      const title = (room.TieuDe || '').toLowerCase();
      const address = (room.DiaChi || '').toLowerCase();
      const district = (room.QuanHuyen || '').toLowerCase();
      const matchesSearch =
        title.includes(searchTerm.toLowerCase()) ||
        address.includes(searchTerm.toLowerCase()) ||
        district.includes(searchTerm.toLowerCase());

      // Lọc theo trạng thái mở rộng chuẩn xác
      // Lọc theo trạng thái mở rộng chuẩn xác
      const rawStatus = (room.TrangThai || '').toLowerCase().trim();
      const isAvailable =
        rawStatus.includes('còn phòng') ||
        rawStatus.includes('conphong') ||
        rawStatus.includes('controng') ||
        rawStatus.includes('công khai') ||
        rawStatus.includes('congkhai');

      const isPending =
        rawStatus.includes('chờ duyệt') ||
        rawStatus.includes('choduyet') ||
        rawStatus.includes('pending');

      const isRentedOrOccupied =
        rawStatus.includes('hết phòng') ||
        rawStatus.includes('hetphong') ||
        rawStatus.includes('đã cho thuê') ||
        rawStatus.includes('dathue') ||
        rawStatus.includes('đã cọc') ||
        rawStatus.includes('dacoc') ||
        rawStatus.includes('rented') ||
        rawStatus.includes('occupied');

      let matchesStatus = true;
      const lowerFilter = (statusFilter || '').toLowerCase().trim();

      if (lowerFilter === 'available' || lowerFilter === 'còn phòng' || lowerFilter === 'controng') {
        matchesStatus = isAvailable;
      } else if (
        lowerFilter === 'rented' ||
        lowerFilter === 'occupied' ||
        lowerFilter === 'hết phòng' ||
        lowerFilter === 'đã cho thuê' ||
        lowerFilter.includes('hết') ||
        lowerFilter.includes('thuê')
      ) {
        // Chỉ lấy những phòng thực sự đã hết/đã thuê/đã cọc, TUYỆT ĐỐI không lấy phòng còn trống
        matchesStatus = !isAvailable && (isRentedOrOccupied || !isPending);
      } else if (lowerFilter === 'pending' || lowerFilter === 'chờ duyệt' || lowerFilter === 'choduyet') {
        matchesStatus = isPending;
      }

      // Lọc theo quận/huyện
      let matchesDistrict = true;
      if (districtFilter !== 'all') {
        matchesDistrict = room.QuanHuyen === districtFilter;
      }

      return matchesSearch && matchesStatus && matchesDistrict;
    })
    .sort((a, b) => {
      const priceA = a.GiaThue || 0;
      const priceB = b.GiaThue || 0;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return 0;
    });

  // Reset về trang 1 khi đổi bất kỳ tiêu chí lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, districtFilter, sortBy]);

  // 4. Cắt mảng phòng hiển thị cho trang hiện tại (lúc này filteredRooms đã có sẵn)
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // --- State lọc & phân trang cho Cẩm nang ---
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleSortDate, setArticleSortDate] = useState<'newest' | 'oldest'>('newest'); // 👈 THÊM DÒNG NÀY
  const [articleCurrentPage, setArticleCurrentPage] = useState(1);
  const articlesPerPage = 6;

  // Kiểm tra xem cẩm nang có đang được lọc hay không
  const isArticleFiltered =
    articleSearchTerm.trim() !== '' ||
    articleCategoryFilter !== 'all' ||
    articleSortDate !== 'newest';

  // Hàm đặt lại toàn bộ bộ lọc cẩm nang về mặc định
  const handleResetArticleFilters = () => {
    setArticleSearchTerm('');
    setArticleCategoryFilter('all');
    setArticleSortDate('newest');
  };

  // Danh sách các chuyên mục cẩm nang duy nhất
  const availableCategories = Array.from(
    new Set(articles.map((a) => a.Tag || a.ChuyenMuc || a.category).filter(Boolean))
  ) as string[];

  // Lọc và sắp xếp bài viết theo từ khóa, chuyên mục và thời gian đăng
  const filteredArticles = articles
    .filter((item) => {
      const title = (item.TieuDe || item.title || '').toLowerCase();
      const summary = (item.MoTaNgan || item.TomTat || item.NoiDung1 || '').toLowerCase();
      const tag = (item.Tag || item.ChuyenMuc || item.category || '').toLowerCase();

      const matchesSearch =
        title.includes(articleSearchTerm.toLowerCase()) ||
        summary.includes(articleSearchTerm.toLowerCase());

      const matchesCategory =
        articleCategoryFilter === 'all' || tag === articleCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Chuyển đổi định dạng ngày (ví dụ DD/MM/YYYY hoặc ISO) sang timestamp
      const parseDate = (dStr: string) => {
        if (!dStr) return 0;
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          }
        }
        return new Date(dStr).getTime() || 0;
      };

      const dateA = parseDate(a.NgayDang || a.NgayTao || a.date);
      const dateB = parseDate(b.NgayDang || b.NgayTao || b.date);

      if (articleSortDate === 'newest') return dateB - dateA;
      return dateA - dateB;
    });

  // Tự động về trang 1 khi đổi từ khóa hoặc bộ lọc
  useEffect(() => {
    setArticleCurrentPage(1);
  }, [articleSearchTerm, articleCategoryFilter, articleSortDate]);

  // Cắt mảng bài viết cho trang hiện tại
  const totalArticlePages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = articleCurrentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  useEffect(() => {
    setActiveTab(initialTab || 'rooms');
  }, [initialTab]);


  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Edit form states
  const [editTieuDe, setEditTieuDe] = useState('');
  const [editDiaChi, setEditDiaChi] = useState('');
  const [editQuanHuyen, setEditQuanHuyen] = useState('Cầu Giấy, Hà Nội');
  const [editGiaThue, setEditGiaThue] = useState<number | ''>('');
  const [editGiaDien, setEditGiaDien] = useState('');
  const [editGiaNuoc, setEditGiaNuoc] = useState('');
  const [editDienTich, setEditDienTich] = useState<number | ''>('');
  const [editMoTa, setEditMoTa] = useState('');
  const [editNoiQuy, setEditNoiQuy] = useState('');
  const [editTienIch, setEditTienIch] = useState<string[]>([]);
  const [editTrangThai, setEditTrangThai] = useState<TrangThaiPhong>('Còn phòng');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState(''); // 👈 THÊM DÒNG NÀY
  const [editError, setEditError] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Feedback banner
  const [actionMessage, setActionMessage] = useState('');

  // Rejection modal state (prompting landlord for reason)
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    type: 'appointment' | 'deposit';
    id: string;
    studentName: string;
    roomTitle: string;
    reason: string;
    error: string;
    submitting: boolean;
  }>({
    isOpen: false,
    type: 'appointment',
    id: '',
    studentName: '',
    roomTitle: '',
    reason: '',
    error: '',
    submitting: false,
  });

  const fetchLandlordData = async () => {
    // Luôn đảm bảo có ID chủ trọ (dù user.Id hay user.id)
    const currentLandlordId = user?.Id || (user as any)?.id || 'usr_chutro';
    if (!token && !user) return;

    try {
      setLoading(true);
      // Chỉ fetch đúng các mục còn dùng: phòng, tin nhắn, lịch hẹn, đơn cọc (BỎ HẲN /api/rentals)
      const [resRooms, resInq, resApp, resDep] = await Promise.all([
        fetch(`/api/rooms?landlordId=${currentLandlordId}&_t=${Date.now()}`),
        fetch(`/api/inquiries?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch(`/api/appointments?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch(`/api/deposits?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
      ]);

      const [dataRooms, dataInq, dataApp, dataDep] = await Promise.all([
        resRooms.json(),
        resInq.json(),
        resApp.json(),
        resDep.json(),
      ]);

      if (dataRooms.success) setRooms(dataRooms.data || []);
      if (dataInq.success) setInquiries(dataInq.data || []);
      if (dataApp.success) setAppointments(dataApp.data || []);
      if (dataDep.success) setDeposits(dataDep.data || []);
      // Lấy danh sách cẩm nang từ API CSDL và gộp thông minh với bài mẫu INITIAL_ARTICLES
      try {
        const resArticles = await fetch(`/api/articles?_t=${Date.now()}`, {
          headers: {
            'x-user-role': 'ChuTro',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const dataArticles = await resArticles.json();
        const serverArticles = (dataArticles && dataArticles.success && Array.isArray(dataArticles.data)) ? dataArticles.data : [];

        // Đưa bài mới từ CSDL lên đầu danh sách
        const combinedArticles = [...serverArticles];

        // Gộp các bài mẫu mặc định nếu chưa tồn tại
        (INITIAL_ARTICLES || []).forEach((defArticle: any) => {
          const isExisted = combinedArticles.some(
            (item: any) =>
              String(item.Id ?? item.id ?? '') === String(defArticle.Id ?? defArticle.id ?? '') ||
              (item.TieuDe && defArticle.TieuDe && item.TieuDe.trim().toLowerCase() === defArticle.TieuDe.trim().toLowerCase())
          );

          if (!isExisted) {
            combinedArticles.push({
              ...defArticle,
              TrangThai: defArticle.TrangThai || 'Công khai',
            });
          }
        });

        setArticles(combinedArticles);
      } catch (artErr) {
        console.error('Lỗi tải danh sách bài viết cho Chủ trọ:', artErr);
        if (INITIAL_ARTICLES && INITIAL_ARTICLES.length > 0) {
          setArticles(INITIAL_ARTICLES);
        }
      }

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu chủ trọ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, [user, token]);

  // Cập nhật trạng thái Lịch hẹn (Xác nhận)
  const handleAppointmentStatus = async (id: string, status: 'Đã xác nhận' | 'Đã hủy', reason?: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(
          status === 'Đã xác nhận'
            ? 'Đã xác nhận lịch hẹn xem phòng với sinh viên thành công!'
            : `Đã từ chối lịch hẹn xem phòng.`
        );
        setTimeout(() => setActionMessage(''), 4000);
        fetchLandlordData();
      }
    } catch {
      // ignore
    }
  };

  // Cập nhật trạng thái Đơn cọc (Xác nhận -> "Đã tiếp nhận thành công", phòng -> "Đã cọc")
  const handleDepositApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/deposits/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Đã tiếp nhận thành công' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(
          'Đã tiếp nhận thành công đơn cọc 500.000 VNĐ vào ví chủ trọ! Phòng trọ đã tự động chuyển sang trạng thái "Đã cọc".'
        );
        setTimeout(() => setActionMessage(''), 4500);
        fetchLandlordData();
        refreshUser();
      }
    } catch {
      // ignore
    }
  };

  const handleOpenRejectModal = (
    type: 'appointment' | 'deposit',
    id: string,
    studentName: string,
    roomTitle: string
  ) => {
    setRejectModal({
      isOpen: true,
      type,
      id,
      studentName,
      roomTitle,
      reason: '',
      error: '',
      submitting: false,
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.reason.trim()) {
      setRejectModal((prev) => ({
        ...prev,
        error: 'Vui lòng nhập lý do từ chối để thông báo cho sinh viên.',
      }));
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, submitting: true, error: '' }));
      if (rejectModal.type === 'appointment') {
        const res = await fetch(`/api/appointments/${rejectModal.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'Đã hủy', reason: rejectModal.reason.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setActionMessage(
            `Đã từ chối lịch hẹn của sinh viên ${rejectModal.studentName}. Thông báo kèm lý do đã được gửi.`
          );
          setTimeout(() => setActionMessage(''), 4500);
          setRejectModal((prev) => ({ ...prev, isOpen: false }));
          fetchLandlordData();
        } else {
          setRejectModal((prev) => ({ ...prev, error: data.message || 'Lỗi xử lý từ chối.' }));
        }
      } else {
        // Deposit rejection -> 100% refund
        const res = await fetch(`/api/deposits/${rejectModal.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'Đã hủy', reason: rejectModal.reason.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setActionMessage(
            `Đã từ chối đơn đặt cọc của ${rejectModal.studentName}. Hệ thống đã tự động hoàn trả 100% (500.000 VNĐ) tiền cọc vào ví của sinh viên.`
          );
          setTimeout(() => setActionMessage(''), 5000);
          setRejectModal((prev) => ({ ...prev, isOpen: false }));
          fetchLandlordData();
          refreshUser();
        } else {
          setRejectModal((prev) => ({ ...prev, error: data.message || 'Lỗi xử lý từ chối.' }));
        }
      }
    } catch {
      setRejectModal((prev) => ({ ...prev, error: 'Lỗi kết nối mạng, vui lòng thử lại.' }));
    } finally {
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleOpenEditModal = (r: Room) => {
    setEditingRoom(r);
    setEditTieuDe(r.TieuDe);
    setEditDiaChi(r.DiaChi);
    setEditQuanHuyen(r.QuanHuyen || 'Cầu Giấy, Hà Nội');
    setEditGiaThue(r.GiaThue);
    setEditGiaDien(String(r.GiaDien ?? 3800));
    setEditGiaNuoc(String(r.GiaNuoc ?? 30000));
    setEditDienTich(r.DienTich || 20);
    setEditMoTa(r.MoTa || '');
    setEditNoiQuy(r.NoiQuy || '');
    setEditTienIch(r.TienIch || []);
    setEditTrangThai(r.TrangThai || 'Còn phòng');
    setEditImages(r.HinhAnh && r.HinhAnh.length > 0 ? r.HinhAnh : []);
    setEditVideoUrl(r.VideoUrl || ''); // 👈 THÊM DÒNG NÀY
    setEditError('');
    setShowEditModal(true);
  };

  const toggleEditAmenity = (name: string) => {
    setEditTienIch((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddEditImage = () => {
    if (!newImageUrl.trim()) return;
    setEditImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveEditImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 👇 THÊM HÀM NÀY ĐỂ CHỌN ẢNH TỪ MÁY TÍNH
  const handleUploadEditImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle room status between "Còn phòng" and "Hết phòng"
  const handleToggleRoomStatus = async (room: Room) => {
    const nextStatus: TrangThaiPhong = room.TrangThai === 'Còn phòng' ? 'Hết phòng' : 'Còn phòng';
    try {
      const res = await fetch(`/api/rooms/${room.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ TrangThai: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Đã chuyển trạng thái phòng thành: "${nextStatus}"`);
        setTimeout(() => setActionMessage(''), 3000);
        fetchLandlordData();
      }
    } catch {
      // ignore
    }
  };

  // Save room edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !token) return;
    if (!editTieuDe.trim() || !editDiaChi.trim() || !editGiaThue) {
      setEditError('Vui lòng điền đủ Tiêu đề, Giá thuê và Địa chỉ.');
      return;
    }

    setSubmittingEdit(true);
    setEditError('');

    try {
      const payload = {
        TieuDe: editTieuDe.trim(),
        DiaChi: editDiaChi.trim(),
        QuanHuyen: editQuanHuyen,
        GiaThue: Number(editGiaThue),
        GiaDien: Number(String(editGiaDien).replace(/[^\d]/g, '')) || 3800,
        GiaNuoc: Number(String(editGiaNuoc).replace(/[^\d]/g, '')) || 30000,
        DienTich: Number(editDienTich) || 20,
        MoTa: editMoTa.trim(),
        NoiQuy: editNoiQuy.trim(),
        TienIch: editTienIch,
        TrangThai: editTrangThai,
        HinhAnh: editImages.length > 0 ? editImages : editingRoom.HinhAnh,
        VideoUrl: editVideoUrl.trim() || undefined, // 👈 THÊM DÒNG NÀY
      };

      const res = await fetch(`/api/rooms/${editingRoom.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowEditModal(false);
        setActionMessage('Cập nhật thông tin phòng trọ thành công!');
        setTimeout(() => setActionMessage(''), 3000);
        fetchLandlordData();
      } else {
        setEditError(data.message || 'Lỗi khi cập nhật phòng.');
      }
    } catch {
      setEditError('Lỗi kết nối máy chủ.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin phòng:\n"${title}"?`)) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage('Đã xóa phòng trọ thành công.');
        setTimeout(() => setActionMessage(''), 3000);
        fetchLandlordData();
      }
    } catch {
      // ignore
    }
  };

  // Inquiry actions (Duyệt / Từ chối)
  const handleInquiryAction = async (inqId: string, status: 'DaDuyet' | 'TuChoi') => {
    try {
      const res = await fetch(`/api/inquiries/${inqId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLandlordData();
        refreshUser();
      }
    } catch {
      // ignore
    }
  };

  const availableCount = rooms.filter((r) => {
    const st = (r.TrangThai || '').toLowerCase().trim();
    return st.includes('còn phòng') || st.includes('conphong') || st.includes('controng') || st.includes('công khai') || st.includes('congkhai');
  }).length;

  const occupiedCount = rooms.filter((r) => {
    const st = (r.TrangThai || '').toLowerCase().trim();
    const isAvail = st.includes('còn phòng') || st.includes('controng') || st.includes('công khai');
    const isPend = st.includes('chờ duyệt') || st.includes('choduyet');
    return !isAvail && !isPend;
  }).length;
  const pendingCount = rooms.filter((r) => r.TrangThai === 'Chờ duyệt' || r.TrangThai === 'ChoDuyet' || (r.TrangThai as string)?.toLowerCase() === 'choduyet').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Banner: Tự động thay đổi đồng bộ theo 5 mục trên Navbar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        {
        activeTab === 'appointments' ? (
          /* 2. Banner mục Lịch hẹn xem phòng */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Điều phối lịch hẹn xem phòng</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Lịch hẹn xem phòng trực tiếp
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Xác nhận hoặc dời lịch để sinh viên chủ động thời gian qua xem phòng
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Về Quản lý phòng</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Tổng số lịch hẹn</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">{appointments.length}</span>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-amber-700 block">Chờ xác nhận</span>
                <span className="text-xl font-bold text-amber-800 tabular-nums">
                  {appointments.filter(a => a.TrangThai === 'Chờ xác nhận').length}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-emerald-700 block">Đã xác nhận gặp</span>
                <span className="text-xl font-bold text-emerald-800 tabular-nums">
                  {appointments.filter(a => a.TrangThai === 'Đã xác nhận').length}
                </span>
              </div>
              <div className="bg-slate-100/80 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-500 block">Đã quá hạn / Hết hạn</span>
                <span className="text-xl font-bold text-slate-700 tabular-nums">
                  {appointments.filter(a => a.TrangThai === 'Hết hạn' || (a.TrangThai as any) === 'QuaHan').length}
                </span>
              </div>
            </div>
          </div>
        ) : activeTab === 'deposits' ? (
          /* 3. Banner mục Đơn cọc */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Quản lý cọc bảo đảm 48h</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Đơn đặt cọc giữ phòng
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Tiếp nhận tiền cọc vào ví và tự động chuyển trạng thái phòng sang Đã cọc
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Về Quản lý phòng</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Tổng đơn cọc nhận</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">{deposits.length}</span>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-amber-700 block">Đơn chờ duyệt</span>
                <span className="text-xl font-bold text-amber-800 tabular-nums">
                  {deposits.filter(d => d.TrangThaiCoc === 'Chờ xác nhận').length}
                </span>
              </div>
              <div className="bg-blue-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-blue-700 block">Tổng tiền cọc nhận được</span>
                <span className="text-lg font-bold text-blue-900 tabular-nums">
                  {totalDepositReceived.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>
        ) : activeTab === 'inquiries' ? (
          /* 4. Banner mục Tin nhắn liên hệ */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trung tâm tin nhắn & Hỗ trợ sinh viên</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Tin nhắn & Yêu cầu tư vấn
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Quản lý và giải đáp thắc mắc của sinh viên gửi tới các phòng trọ của bạn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Về Quản lý phòng</span>
                </button>

              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Tổng tin nhắn nhận</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">{inquiries.length}</span>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-amber-700 block">Chờ phản hồi</span>
                <span className="text-xl font-bold text-amber-800 tabular-nums">
                  {inquiries.filter(i => i.TrangThai === 'ChoXacNhan').length}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-emerald-700 block">Đã xử lý & Phản hồi</span>
                <span className="text-xl font-bold text-emerald-800 tabular-nums">
                  {inquiries.filter(i => i.TrangThai !== 'ChoXacNhan').length}
                </span>
              </div>
            </div>
          </div>

        ) : activeTab === 'articles' ? (
          /* Banner chuyên biệt cho mục Quản lý cẩm nang */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trung tâm cẩm nang & Chia sẻ kinh nghiệm</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Quản lý cẩm nang & Hướng dẫn
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Đăng tải kinh nghiệm thuê trọ, nội quy và mẹo vặt hữu ích giúp kết nối sinh viên tốt hơn
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Viết cẩm nang mới</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Tổng số bài viết</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">{articles.length}</span>
              </div>
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-emerald-700 block">Đã xuất bản</span>
                <span className="text-xl font-bold text-emerald-800 tabular-nums">{articles.length}</span>
              </div>
              <div className="bg-blue-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-blue-700 block">Tác giả đăng bài</span>
                <span className="text-sm font-bold text-blue-900 truncate block mt-1">
                  {user?.HoTen || 'Chủ trọ'}
                </span>
              </div>
            </div>
          </div>

        ) : (
          /* 5. Banner mặc định: Quản lý phòng của tôi */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Giao diện quản lý dành cho Chủ trọ</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Quản lý phòng của tôi
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Chủ trọ: <strong>{user?.HoTen}</strong> · SĐT: {user?.Sdt}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(true)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all whitespace-nowrap cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Viết cẩm nang</span>
                </button>
                {onNavigateToCreate && (
                  <button
                    onClick={onNavigateToCreate}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng tin phòng mới</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Tổng số phòng</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">{rooms.length}</span>
              </div>
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-emerald-700 block">Đang còn trống</span>
                <span className="text-xl font-bold text-emerald-800 tabular-nums">{availableCount}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block">Đã cho thuê</span>
                <span className="text-xl font-bold text-slate-700 tabular-nums">{occupiedCount}</span>
              </div>
              <div className="bg-blue-50/70 p-3.5 rounded-2xl">
                <span className="text-xs text-blue-700 block">Tiền cọc giữ chỗ</span>
                <span className="text-lg font-bold text-blue-900 tabular-nums">
                  {totalDepositReceived.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action message */}
        {actionMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* 2 nút chuyển đổi: CHỈ HIỂN THỊ KHI Ở TAB PHÒNG HOẶC CẨM NANG */}
      {(activeTab === 'rooms' || activeTab === 'articles') && (
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'rooms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Quản lý phòng ({rooms.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'articles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý cẩm nang ({articles.length})</span>
          </button>
        </div>
      )}

      {/* Nội dung hiển thị theo tab đang chọn (Đồng bộ từ Navbar & Nút chuyển tab) */}
      {activeTab === 'articles' ? (
        /* Giao diện Danh sách Cẩm nang của tôi (Kèm Bộ lọc & Phân trang) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Danh sách bài viết cẩm nang ({filteredArticles.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các bài chia sẻ kinh nghiệm thuê trọ, nội quy và mẹo vặt hữu ích cho sinh viên
              </p>
            </div>
          </div>

          {/* HÀNG 1: Thanh tìm kiếm & Cụm Dropdown bộ lọc cẩm nang */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* 1. Ô tìm kiếm bài viết */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm bài viết theo tiêu đề, nội dung tóm tắt..."
                value={articleSearchTerm}
                onChange={(e) => setArticleSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 2 Dropdown bên phải */}
            <div className="flex items-center gap-3">
              {/* 2. Lọc theo chuyên mục */}
              <div className="relative min-w-[200px]">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={articleCategoryFilter}
                  onChange={(e) => setArticleCategoryFilter(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs appearance-none"
                >
                  <option value="all">Tất cả chuyên mục</option>
                  {availableCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* 3. Lọc theo thời gian đăng */}
              <div className="relative min-w-[160px]">
                <select
                  value={articleSortDate}
                  onChange={(e) => setArticleSortDate(e.target.value as 'newest' | 'oldest')}
                  className="w-full px-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs appearance-none"
                >
                  <option value="newest">Mới đăng</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* HÀNG 2: Tách biệt xuống dòng dưới - Tìm thấy X kết quả & Nút Xóa bộ lọc */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Tìm thấy <strong className="text-slate-800">{filteredArticles.length}</strong> kết quả
            </span>

            {isArticleFiltered && (
              <button
                type="button"
                onClick={handleResetArticleFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>

          {/* Danh sách bài viết */}
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Không tìm thấy bài viết cẩm nang nào.</p>
              <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc chuyên mục.</p>
              {(articleSearchTerm || articleCategoryFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setArticleSearchTerm('');
                    setArticleCategoryFilter('all');
                  }}
                  className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentArticles.map((item: any) => (
                  <div
                    key={item.Id || item.id}
                    className="border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col bg-white group"
                  >
                    {/* Phần ảnh bìa - Bấm vào mở xem trước */}
                    <div
                      onClick={() => setPreviewArticle(item)}
                      className="aspect-16/10 overflow-hidden bg-slate-100 relative cursor-pointer"
                    >
                      {item.HinhAnh ? (
                        <img
                          src={item.HinhAnh}
                          alt={item.TieuDe}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <BookOpen className="w-10 h-10" />
                        </div>
                      )}

                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                        {item.TrangThai === 'Chờ duyệt' ? '⏳ Chờ duyệt' : '✓ Đã xuất bản'}
                      </span>
                    </div>

                    {/* Nội dung thông tin bài viết */}
                    <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg inline-block mb-1.5">
                          {item.Tag || item.ChuyenMuc || 'Kinh nghiệm thuê phòng'}
                        </span>
                        <h3
                          onClick={() => setPreviewArticle(item)}
                          className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                        >
                          {item.TieuDe}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.MoTaNgan || item.NoiDung1 || item.NoiDung}
                        </p>
                      </div>

                      {/* Thanh công cụ: Xem bài, Sửa và Xóa đồng bộ với Thẻ phòng */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewArticle(item)}
                          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem bài</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditArticle(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArticle(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thanh phân trang cẩm nang */}
              {totalArticlePages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">
                    Hiển thị <strong>{indexOfFirstArticle + 1} - {Math.min(indexOfLastArticle, filteredArticles.length)}</strong> trên tổng số <strong>{filteredArticles.length}</strong> bài viết
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={articleCurrentPage === 1}
                      onClick={() => {
                        setArticleCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang trước
                    </button>
                    {Array.from({ length: totalArticlePages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => {
                          setArticleCurrentPage(page);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${articleCurrentPage === page
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={articleCurrentPage === totalArticlePages}
                      onClick={() => {
                        setArticleCurrentPage((prev) => Math.min(prev + 1, totalArticlePages));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
      ) : activeTab === 'appointments' ? (
        /* Tab: Lịch hẹn */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Lịch hẹn xem phòng từ sinh viên ({appointments.length})
            </h2>
            <p className="text-xs text-slate-500">Xác nhận hoặc hủy hẹn để thông báo kịp thời cho sinh viên</p>
          </div>
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hiện chưa có lịch hẹn xem phòng nào từ sinh viên.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((app) => {
                const isExpired = app.TrangThai === 'Hết hạn' || (app.TrangThai as any) === 'QuaHan';
                const isPending = app.TrangThai === 'Chờ xác nhận' && !isExpired;

                return (
                  <div
                    key={app.Id}
                    className={`py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                      isExpired ? 'opacity-70 bg-slate-50/80 -mx-3 px-3 rounded-2xl border border-dashed border-slate-200' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{app.SinhVienTen || 'Sinh viên'}</span>
                        {app.SinhVienSdt && (
                          <a href={`tel:${app.SinhVienSdt}`} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{app.SinhVienSdt}</span>
                          </a>
                        )}
                        <span className="text-xs font-mono text-slate-400">#{app.Id}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700">Phòng: {app.TieuDePhong || 'Phòng trọ'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Hẹn lúc: {new Date(app.ThoiGianHen).toLocaleString('vi-VN')}</span>
                      </div>
                      {app.GhiChu && (
                        <p className="text-xs text-slate-500 italic">Lời nhắn: "{app.GhiChu}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleAppointmentStatus(app.Id, 'Đã xác nhận')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer active:scale-98 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Xác nhận lịch hẹn
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal('appointment', app.Id, app.SinhVienTen || 'Sinh viên', app.TieuDePhong || 'Phòng trọ')}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer border border-rose-200 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <div className="text-right space-y-1">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${
                              app.TrangThai === 'Đã xác nhận'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isExpired
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {app.TrangThai === 'Đã xác nhận'
                              ? '✓ Đã xác nhận'
                              : isExpired
                              ? '🕒 Đã quá hạn / Hết hạn'
                              : '✕ Đã hủy'}
                          </span>
                          {isExpired && (
                            <p className="text-[11px] text-slate-500 italic max-w-xs">
                              Quá 24h không phản hồi - Lịch hẹn đã tự động hết hạn.
                            </p>
                          )}
                          {!isExpired && app.LyDoTuChoi && (
                            <p className="text-[11px] text-rose-600 font-medium italic mt-1 max-w-xs">
                              Lý do: {app.LyDoTuChoi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'deposits' ? (
        /* Tab: Đơn cọc */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Đơn đặt cọc giữ chỗ phòng ({deposits.length})
              </h2>
              <p className="text-xs text-slate-500">
                "Xác nhận" sẽ tiếp nhận đơn thành công, phòng chuyển sang "Đã cọc". "Từ chối" yêu cầu nhập lý do và tự động hoàn lại 100% tiền cọc vào ví sinh viên.
              </p>
            </div>
          </div>
          {deposits.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hiện chưa có đơn đặt cọc giữ chỗ nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deposits.map((dep) => (
                <div key={dep.Id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{dep.SinhVienTen || 'Sinh viên'}</span>
                      {dep.SinhVienSdt && (
                        <a href={`tel:${dep.SinhVienSdt}`} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{dep.SinhVienSdt}</span>
                        </a>
                      )}
                      <span className="text-xs font-mono text-slate-400">#{dep.Id}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">Phòng: {dep.TieuDePhong || 'Phòng trọ'}</p>
                    <div className="flex items-center gap-3 text-xs pt-0.5">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Tiền cọc: {(dep.SoTienCoc || 500000).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-slate-500">
                        Đặt lúc: {new Date(dep.NgayCoc || dep.NgayTao || '').toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dep.TrangThaiCoc === 'Chờ xác nhận' ? (
                      <>
                        <button
                          onClick={() => handleDepositApprove(dep.Id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer active:scale-98 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Xác nhận (Tiếp nhận & Chuyển Đã cọc)
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal('deposit', dep.Id, dep.SinhVienTen || 'Sinh viên', dep.TieuDePhong || 'Phòng trọ')}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer border border-rose-200 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          Từ chối (Hoàn 100% ví SV)
                        </button>
                      </>
                    ) : (
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${dep.TrangThaiCoc === 'Đã tiếp nhận thành công' || dep.TrangThaiCoc === 'Đã xác nhận'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                        >
                          {dep.TrangThaiCoc === 'Đã tiếp nhận thành công' || dep.TrangThaiCoc === 'Đã xác nhận'
                            ? '✓ Đã tiếp nhận thành công (Phòng: Đã cọc)'
                            : '✕ Đã hủy (Đã hoàn 100% ví SV)'}
                        </span>
                        {dep.LyDoTuChoi && (
                          <p className="text-[11px] text-rose-600 font-medium italic mt-1 max-w-xs">
                            Lý do: {dep.LyDoTuChoi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'inquiries' ? (
        /* Tab: Tin nhắn liên hệ */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách sinh viên gửi yêu cầu liên hệ ({inquiries.length})
              </h2>
              <p className="text-xs text-slate-500">
                Phản hồi tin nhắn hoặc liên hệ trực tiếp qua SĐT/Zalo để tư vấn cho sinh viên
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${inquiryStatusFilter === 'all' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Tất cả ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${inquiryStatusFilter === 'pending' ? 'bg-white text-amber-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Chờ phản hồi ({inquiries.filter(i => i.TrangThai === 'ChoXacNhan').length})
              </button>
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('handled')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${inquiryStatusFilter === 'handled' ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Đã xử lý ({inquiries.filter(i => i.TrangThai !== 'ChoXacNhan').length})
              </button>
            </div>
          </div>
          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hiện chưa có sinh viên nào gửi tin nhắn liên hệ.[cite: 19]</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries
                .filter(inq => {
                  if (inquiryStatusFilter === 'pending') return inq.TrangThai === 'ChoXacNhan';
                  if (inquiryStatusFilter === 'handled') return inq.TrangThai !== 'ChoXacNhan';
                  return true;
                })
                .map((inq) => {
                  const rawPhone = (inq.SinhVienSdt || '').replace(/\D/g, '');
                  const isReplying = replyingId === inq.Id;
                  return (
                    <div key={inq.Id} className="py-5 space-y-3">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{inq.SinhVienTen}</h4>
                            <span className="text-xs font-mono text-slate-400">#{inq.Id}</span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              · Gửi lúc: {new Date(inq.NgayTao).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-lg w-fit">
                            Phòng quan tâm: {inq.TieuDePhong}
                          </p>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed">
                            <span className="font-semibold text-slate-500 block mb-0.5">Lời nhắn từ sinh viên:</span>
                            "{inq.GhiChu || 'Sinh viên quan tâm và muốn được tư vấn thêm về phòng trọ này.'}"
                          </div>
                        </div>
                        <div className="flex flex-col items-stretch gap-2 shrink-0 w-full sm:w-44 self-center">
                          {/* 1. Trạng thái tiếp nhận */}
                          {inq.TrangThai === 'ChoXacNhan' ? (
                            <div className="grid grid-cols-2 gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => handleInquiryAction(inq.Id, 'DaDuyet')}
                                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-98 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Tiếp nhận</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInquiryAction(inq.Id, 'TuChoi')}
                                className="px-2.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Bỏ qua</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${inq.TrangThai === 'DaDuyet'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                              <span>{inq.TrangThai === 'DaDuyet' ? '✓ Đã tiếp nhận' : '✕ Đã từ chối'}</span>
                            </div>
                          )}

                          {/* 2. Nút Trả lời nhanh */}
                          <button
                            type="button"
                            onClick={() => setReplyingId(isReplying ? null : inq.Id)}
                            className="w-full px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isReplying ? 'Đóng trả lời' : 'Trả lời nhanh'}</span>
                          </button>

                          {/* 3. Nút Chat Zalo & Gọi điện xếp đôi hoặc nút Zalo nổi bật */}
                          <div className="grid grid-cols-2 gap-1.5 w-full">
                            {rawPhone ? (
                              <a
                                href={`https://zalo.me/${rawPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                <span>Zalo</span>
                              </a>
                            ) : null}

                            {inq.SinhVienSdt && (
                              <a
                                href={`tel:${inq.SinhVienSdt}`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                                title="Gọi điện thoại trực tiếp"
                              >
                                <Phone className="w-3 h-3 text-blue-600" />
                                <span>Gọi điện</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      {isReplying && (
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-indigo-900">
                              Phản hồi trực tiếp tới sinh viên {inq.SinhVienTen}:
                            </span>
                            <span className="text-[11px] text-slate-400">Chọn câu mẫu để điền nhanh:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Chào bạn, phòng này hiện vẫn còn nhé!',
                              'Bạn có thể qua xem phòng trực tiếp vào chiều nay không?',
                              'Giá điện nước và dịch vụ chuẩn như trên bài đăng em nhé.',
                            ].map((sample, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => setReplyTextMap(prev => ({ ...prev, [inq.Id]: sample }))}
                                className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] cursor-pointer transition-colors"
                              >
                                + {sample}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyTextMap[inq.Id] || ''}
                              onChange={(e) => setReplyTextMap(prev => ({ ...prev, [inq.Id]: e.target.value }))}
                              placeholder="Nhập nội dung tin nhắn gửi tới sinh viên..."
                              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!(replyTextMap[inq.Id] || '').trim()) return;
                                setActionMessage(`Đã gửi phản hồi thành công tới sinh viên ${inq.SinhVienTen}!`);
                                setTimeout(() => setActionMessage(''), 4000);
                                setReplyTextMap(prev => ({ ...prev, [inq.Id]: '' }));
                                setReplyingId(null);
                                handleInquiryAction(inq.Id, 'DaDuyet');
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Gửi phản hồi</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* Mặc định: Tab Quản lý phòng (activeTab === 'rooms') */
        <>
          <LandlordRoomFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            districtFilter={districtFilter}
            onDistrictFilterChange={setDistrictFilter}
            districts={availableDistricts}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            totalFilteredCount={filteredRooms.length}
            isFiltered={isFiltered}
            onReset={handleResetFilters}
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 h-64 animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Bạn chưa có tin đăng phòng trọ nào</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Hãy đăng phòng trọ đầu tiên của bạn để sinh viên có thể tìm thấy và gửi yêu cầu xem phòng.
              </p>
              {onNavigateToCreate && (
                <button
                  onClick={onNavigateToCreate}
                  className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-sm"
                >
                  + Đăng tin phòng mới
                </button>
              )}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">Không tìm thấy phòng trọ nào phù hợp với bộ lọc.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-700"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRooms.map((room) => (
                  <LandlordRoomCard
                    key={room.Id}
                    room={room}
                    onViewDetail={(id) => {
                      const target = rooms.find(r => String(r.Id) === String(id));
                      if (target) setViewingRoom(target);
                    }}
                    onEditRoom={() => handleOpenEditModal(room)}
                    onToggleStatus={() => handleToggleRoomStatus(room)}
                    onDeleteRoom={() => handleDeleteRoom(room.Id, room.TieuDe)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">
                    Hiển thị <strong>{indexOfFirstRoom + 1} - {Math.min(indexOfLastRoom, filteredRooms.length)}</strong> trên tổng số <strong>{filteredRooms.length}</strong> phòng
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${currentPage === page
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Sửa tin phòng trọ */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Chỉnh sửa tin phòng trọ</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề tin đăng *</label>
                <input
                  type="text"
                  required
                  value={editTieuDe}
                  onChange={(e) => setEditTieuDe(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={editDiaChi}
                    onChange={(e) => setEditDiaChi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quận / Huyện</label>
                  <input
                    type="text"
                    value={editQuanHuyen}
                    onChange={(e) => setEditQuanHuyen(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá thuê (đ/tháng) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={editGiaThue}
                    onChange={(e) => setEditGiaThue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá điện</label>
                  <input
                    type="text"
                    value={editGiaDien}
                    onChange={(e) => setEditGiaDien(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá nước</label>
                  <input
                    type="text"
                    value={editGiaNuoc}
                    onChange={(e) => setEditGiaNuoc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái phòng</label>
                  <select
                    value={editTrangThai}
                    onChange={(e) => setEditTrangThai(e.target.value as TrangThaiPhong)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Còn phòng">Còn phòng</option>
                    <option value="Hết phòng">Hết phòng</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tiện ích phòng</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_AMENITIES_LIST.map((item) => {
                    const checked = editTienIch.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer select-none ${checked ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEditAmenity(item)}
                          className="rounded text-blue-600"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả phòng trọ</label>
                <textarea
                  rows={3}
                  value={editMoTa}
                  onChange={(e) => setEditMoTa(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội quy phòng trọ (NoiQuy)</label>
                <textarea
                  rows={3}
                  value={editNoiQuy}
                  onChange={(e) => setEditNoiQuy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Edit images */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Hình ảnh phòng ({editImages.length} ảnh)</label>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  {/* Nút chọn tệp ảnh từ máy tính */}
                  <label className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadEditImageFile}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-slate-400 self-center hidden sm:inline">hoặc</span>

                  {/* Nhập link ảnh online */}
                  <div className="flex flex-1 gap-1.5">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Dán link ảnh (https://...)"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl.trim()) {
                          alert('Vui lòng dán link URL ảnh vào ô trước khi bấm Thêm!');
                          return;
                        }
                        handleAddEditImage();
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer whitespace-nowrap"
                    >
                      + Thêm URL
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={img}
                        alt=""
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 👈 DÁN ĐOẠN DƯỚI ĐÂY VÀO TRƯỚC NÚT "HỦY / LƯU THAY ĐỔI" */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Video thực tế phòng trọ (Google Drive, YouTube, hoặc tệp .mp4)
                </label>
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  placeholder="VD: https://drive.google.com/file/d/... hoặc https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 block">
                  Dán link chia sẻ công khai từ Google Drive hoặc YouTube để người thuê xem trước video thực tế.
                </span>

                {/* Khung xem trước video nếu có link */}
                {editVideoUrl.trim() && (() => {
                  const parsed = parseVideoUrl(editVideoUrl);
                  return (
                    <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Xem trước video:</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold uppercase">
                          {parsed.type === 'gdrive' ? 'Google Drive' : parsed.type === 'youtube' ? 'YouTube' : 'Video trực tiếp'}
                        </span>
                      </div>
                      <div className="aspect-16/9 w-full max-w-md rounded-xl overflow-hidden bg-black border border-slate-300">
                        {parsed.isIframe ? (
                          <iframe
                            src={parsed.embedUrl}
                            title="Xem trước video phòng"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : parsed.type === 'direct' ? (
                          <video controls src={parsed.embedUrl} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs p-4 text-center">
                            <p className="line-clamp-1">Link: {parsed.originalUrl}</p>
                            <a href={parsed.originalUrl} target="_blank" rel="noreferrer" className="mt-2 text-blue-400 underline inline-flex items-center gap-1">
                              <span>Mở kiểm tra liên kết</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {submittingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal for Landlord with mandatory Reason */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  {rejectModal.type === 'appointment'
                    ? 'Từ chối lịch hẹn xem phòng'
                    : 'Từ chối đơn đặt cọc giữ chỗ'}
                </h3>
              </div>
              <button
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs space-y-1">
              <p>
                <strong className="text-slate-700">Sinh viên:</strong> {rejectModal.studentName}
              </p>
              <p>
                <strong className="text-slate-700">Phòng:</strong> {rejectModal.roomTitle}
              </p>
              {rejectModal.type === 'deposit' && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Chính sách hoàn tiền: Hệ thống sẽ tự động hoàn 100% (500.000 VNĐ) tiền cọc vào ví của sinh viên ngay lập tức.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do từ chối <span className="text-rose-600">* (Bắt buộc)</span>
              </label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))
                }
                placeholder="Nhập lý do cụ thể để gửi thông báo giải thích cho sinh viên..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              {rejectModal.error && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{rejectModal.error}</p>
              )}

              {/* Quick Suggestion Chips */}
              <div className="mt-2 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Lý do gợi ý nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    rejectModal.type === 'deposit'
                      ? 'Phòng đã có khách cọc trực tiếp'
                      : 'Trùng lịch bận đột xuất của chủ trọ',
                    'Phòng đang tiến hành sửa chữa bảo dưỡng',
                    'Vui lòng liên hệ trực tiếp chủ trọ để chọn ngày khác',
                    'Phòng đã kín người thuê',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRejectModal((prev) => ({ ...prev, reason: chip, error: '' }))}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-medium transition-colors text-left"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectModal.submitting}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {rejectModal.submitting
                  ? 'Đang xử lý...'
                  : rejectModal.type === 'deposit'
                    ? 'Xác nhận từ chối & Hoàn 100% ví SV'
                    : 'Xác nhận từ chối lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý ví nạp / rút */}
      <LandlordWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSuccess={() => {
          fetchLandlordData();
          refreshUser();
        }}
      />

      {/* Modal Đăng cẩm nang mới */}
      <LandlordCreateArticleModal
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        onSuccess={() => {
          setActionMessage('Đăng bài viết cẩm nang thành công! Bài viết đang chờ Quản trị viên duyệt.');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setActionMessage(''), 4500);
          fetchLandlordData(); // 👈 Gọi lại hàm fetch để cập nhật ngay bài mới vào danh sách
        }}
      />

      {/* Modal Xem Trước Bài Viết Cẩm Nang */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Xem trước bài viết cẩm nang</h3>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {previewArticle.HinhAnh && (
                <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={previewArticle.HinhAnh}
                    alt={previewArticle.TieuDe}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {previewArticle.Tag || previewArticle.ChuyenMuc || 'Kinh nghiệm thuê phòng'}
                </span>
                <span className="text-xs text-slate-400">
                  Ngày đăng: {previewArticle.NgayDang || 'Mới cập nhật'}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
                {previewArticle.TieuDe}
              </h1>
              {previewArticle.MoTaNgan && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 leading-relaxed italic">
                  "{previewArticle.MoTaNgan}"
                </div>
              )}
              <div className="text-xs text-slate-600 leading-relaxed space-y-2 whitespace-pre-line">
                {previewArticle.NoiDung || previewArticle.NoiDung1 || 'Bài viết chưa có nội dung chi tiết.'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewArticle;
                  setPreviewArticle(null);
                  handleOpenEditArticle(target);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa bài này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Bài Viết Cẩm Nang */}
      {showEditArticleModal && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Chỉnh sửa bài viết cẩm nang</h3>
              </div>
              <button
                onClick={() => setShowEditArticleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditArticle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  value={editArticleTitle}
                  onChange={(e) => setEditArticleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyên mục bài viết</label>
                <select
                  value={editArticleTag}
                  onChange={(e) => setEditArticleTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Kinh nghiệm thuê phòng">Kinh nghiệm thuê phòng</option>
                  <option value="Kinh nghiệm cho thuê">Kinh nghiệm cho thuê</option>
                  <option value="Cảnh báo lừa đảo đặt cọc">Cảnh báo lừa đảo đặt cọc</option>
                  <option value="Mẹo tiết kiệm & Decor phòng">Mẹo tiết kiệm & Decor phòng</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Hình ảnh đại diện bài viết</label>

                {/* Khung tải tệp lên từ máy tính */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <label className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadArticleImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 self-center hidden sm:inline">hoặc nhập link URL:</span>
                  <input
                    type="url"
                    value={editArticleImage}
                    onChange={(e) => setEditArticleImage(e.target.value)}
                    placeholder="Dán đường dẫn ảnh (https://...)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Khung xem trước ảnh đại diện */}
                {editArticleImage && (
                  <div className="relative aspect-16/9 max-h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group mt-2">
                    <img
                      src={editArticleImage}
                      alt="Xem trước ảnh"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setEditArticleImage('')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Xóa ảnh này</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn gọn (Tóm tắt)</label>
                <textarea
                  rows={2}
                  value={editArticleSummary}
                  onChange={(e) => setEditArticleSummary(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung bài viết chi tiết</label>
                <textarea
                  rows={6}
                  value={editArticleContent}
                  onChange={(e) => setEditArticleContent(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditArticleModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEditArticle}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {submittingEditArticle ? 'Đang lưu...' : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết phòng cho Chủ trọ */}
      <LandlordRoomDetailModal
        room={viewingRoom}
        isOpen={!!viewingRoom}
        onClose={() => setViewingRoom(null)}
        onEditRoom={(r) => handleOpenEditModal(r)}
        onToggleStatus={(r) => handleToggleRoomStatus(r)}
      />
    </div>
  );
};
