import React, { useState, useEffect } from 'react';
import { Room, Inquiry, TrangThaiPhong, LichHen, DatCoc } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
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
  Wallet
} from 'lucide-react';

interface LandlordManageViewProps {
  onNavigateToCreate?: () => void;
  onViewRoomDetail?: (roomId: string) => void;
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
}) => {
  const { user, token, refreshUser } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [deposits, setDeposits] = useState<DatCoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'appointments' | 'deposits' | 'inquiries'>('rooms');

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
    if (!user || !token) return;
    try {
      setLoading(true);
      // Fetch landlord's rooms, inquiries, appointments, deposits in parallel
      const [resRooms, resInq, resApp, resDep] = await Promise.all([
        fetch(`/api/rooms?landlordId=${user.Id}`),
        fetch('/api/inquiries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/deposits', { headers: { Authorization: `Bearer ${token}` } }),
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
    } catch {
      // ignore
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
    setEditGiaDien(r.GiaDien || '3.800 đ/kWh');
    setEditGiaNuoc(r.GiaNuoc || '30.000 đ/khối');
    setEditDienTich(r.DienTich || 20);
    setEditMoTa(r.MoTa || '');
    setEditNoiQuy(r.NoiQuy || '');
    setEditTienIch(r.TienIch || []);
    setEditTrangThai(r.TrangThai || 'Còn phòng');
    setEditImages(r.HinhAnh && r.HinhAnh.length > 0 ? r.HinhAnh : []);
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
        GiaDien: editGiaDien.trim(),
        GiaNuoc: editGiaNuoc.trim(),
        DienTich: Number(editDienTich) || 20,
        MoTa: editMoTa.trim(),
        NoiQuy: editNoiQuy.trim(),
        TienIch: editTienIch,
        TrangThai: editTrangThai,
        HinhAnh: editImages.length > 0 ? editImages : editingRoom.HinhAnh,
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

  const availableCount = rooms.filter((r) => r.TrangThai === 'Còn phòng').length;
  const occupiedCount = rooms.filter((r) => r.TrangThai === 'Hết phòng').length;
  const pendingCount = rooms.filter((r) => r.TrangThai === 'Chờ duyệt').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
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

          {/* Prominent Action Button: Đăng tin phòng mới */}
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

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
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
          <div className="bg-amber-50/70 p-3.5 rounded-2xl">
            <span className="text-xs text-amber-700 block">Đang chờ duyệt</span>
            <span className="text-xl font-bold text-amber-800 tabular-nums">{pendingCount}</span>
          </div>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Danh sách phòng ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch hẹn xem phòng ({appointments.length})</span>
          {appointments.filter(a => a.TrangThai === 'Chờ xác nhận').length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
              {appointments.filter(a => a.TrangThai === 'Chờ xác nhận').length} chờ duyệt
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Đơn cọc giữ phòng ({deposits.length})</span>
          {deposits.filter(d => d.TrangThaiCoc === 'Chờ xác nhận').length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
              {deposits.filter(d => d.TrangThaiCoc === 'Chờ xác nhận').length} chờ xử lý
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inquiries'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Tin nhắn liên hệ ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Rooms List */}
      {activeTab === 'rooms' ? (
        <>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const coverImage =
                  room.HinhAnh && room.HinhAnh.length > 0
                    ? room.HinhAnh[0]
                    : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';

                return (
                  <div
                    key={room.Id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Visual Card Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={coverImage}
                        alt={room.TieuDe}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs border backdrop-blur-md ${
                            room.TrangThai === 'Còn phòng'
                              ? 'bg-emerald-500/90 text-white border-emerald-400'
                              : room.TrangThai === 'Hết phòng'
                              ? 'bg-slate-700/90 text-white border-slate-600'
                              : 'bg-amber-500/90 text-white border-amber-400'
                          }`}
                        >
                          {room.TrangThai}
                        </span>
                      </div>

                      {/* Price Tag over image */}
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-white">
                        <span className="text-base font-bold tabular-nums">
                          {room.GiaThue.toLocaleString('vi-VN')}
                        </span>{' '}
                        <span className="text-[10px] text-blue-200">đ/tháng</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                          {room.TieuDe}
                        </h3>

                        <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{room.DiaChi}, {room.QuanHuyen}</span>
                        </div>

                        {/* Specs strip */}
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                          <span>⚡ {room.GiaDien || '3.800 đ/kWh'}</span>
                          <span>·</span>
                          <span>💧 {room.GiaNuoc || '30.000 đ/khối'}</span>
                          <span>·</span>
                          <span>📐 {room.DienTich || 20} m²</span>
                        </div>

                        {/* Amenities pills */}
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {room.TienIch &&
                            room.TienIch.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {item}
                              </span>
                            ))}
                          {room.TienIch && room.TienIch.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{room.TienIch.length - 3}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Status Toggle, Edit, Delete */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Toggle Status button */}
                        <button
                          onClick={() => handleToggleRoomStatus(room)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            room.TrangThai === 'Còn phòng'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                          title="Bấm để đổi trạng thái Còn phòng / Hết phòng"
                        >
                          {room.TrangThai === 'Còn phòng' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Đổi: Hết phòng</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Đổi: Còn phòng</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* View details */}
                          {onViewRoomDetail && (
                            <button
                              onClick={() => onViewRoomDetail(room.Id)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Xem chi tiết tin đăng"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Sửa tin button */}
                          <button
                            onClick={() => handleOpenEditModal(room)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="Chỉnh sửa tin phòng"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Xóa tin button */}
                          <button
                            onClick={() => handleDeleteRoom(room.Id, room.TieuDe)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa phòng trọ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : activeTab === 'appointments' ? (
        /* Tab 2: Appointments List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lịch hẹn xem phòng từ sinh viên ({appointments.length})
              </h2>
              <p className="text-xs text-slate-500">Xác nhận hoặc hủy hẹn để thông báo kịp thời cho sinh viên</p>
            </div>
            <button onClick={fetchLandlordData} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Làm mới
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hiện chưa có lịch hẹn xem phòng nào từ sinh viên.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <div key={app.Id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                    {app.TrangThai === 'Chờ xác nhận' ? (
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
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${
                            app.TrangThai === 'Đã xác nhận'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {app.TrangThai === 'Đã xác nhận' ? '✓ Đã xác nhận' : '✕ Đã hủy'}
                        </span>
                        {app.LyDoTuChoi && (
                          <p className="text-[11px] text-rose-600 font-medium italic mt-1 max-w-xs">
                            Lý do: {app.LyDoTuChoi}
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
      ) : activeTab === 'deposits' ? (
        /* Tab 3: Deposits List */
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
            <button onClick={fetchLandlordData} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Làm mới
            </button>
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
                          className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${
                            dep.TrangThaiCoc === 'Đã tiếp nhận thành công' || dep.TrangThaiCoc === 'Đã xác nhận'
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
      ) : (
        /* Tab 4: Inquiries List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách sinh viên gửi yêu cầu liên hệ ({inquiries.length})
            </h2>
            <button onClick={fetchLandlordData} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Làm mới
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hiện chưa có sinh viên nào gửi tin nhắn liên hệ.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div key={inq.Id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{inq.SinhVienTen}</h4>
                      <span className="text-xs text-blue-600 font-semibold">({inq.SinhVienSdt})</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">Phòng: {inq.TieuDePhong}</p>
                    <p className="text-xs text-slate-500">Lời nhắn: "{inq.GhiChu}"</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                      <span>Ngày gửi: {new Date(inq.NgayTao).toLocaleDateString('vi-VN')}</span>
                      {inq.TienCoc > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-bold text-emerald-600">
                            Tiền cọc tạm giữ: {inq.TienCoc.toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {inq.TrangThai === 'ChoXacNhan' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInquiryAction(inq.Id, 'DaDuyet')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Đồng ý
                        </button>
                        <button
                          onClick={() => handleInquiryAction(inq.Id, 'TuChoi')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-xl ${
                          inq.TrangThai === 'DaDuyet'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {inq.TrangThai === 'DaDuyet' ? '✓ Đã đồng ý' : '✕ Đã từ chối'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                        className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer select-none ${
                          checked ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200'
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hình ảnh ({editImages.length} ảnh)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Nhập URL ảnh..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditImage}
                    className="px-3 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl"
                  >
                    + Thêm ảnh
                  </button>
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

    </div>
  );
};
