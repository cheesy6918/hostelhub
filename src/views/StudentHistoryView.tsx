import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LichHen, DatCoc, RentalContract } from '../types';
import {
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Wallet,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Building,
  Check,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Star,
  Send,
  X
} from 'lucide-react';

interface StudentHistoryViewProps {
  onViewRoom?: (roomId: string) => void;
  onNavigate?: (view: string) => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ onViewRoom, onNavigate }) => {
  const { user, token, refreshUser, topupWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<'contracts' | 'appointments' | 'deposits'>('contracts');
  
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [deposits, setDeposits] = useState<DatCoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmingContractId, setConfirmingContractId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);

  // New contract request modal
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [requestStartDate, setRequestStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [creatingContract, setCreatingContract] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [appRes, depRes, contRes, roomsRes] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/deposits', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/rentals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/rooms'),
      ]);
      const appData = await appRes.json();
      const depData = await depRes.json();
      const contData = await contRes.json();
      const roomsData = await roomsRes.json();

      if (appData.success) {
        setAppointments(appData.data || []);
      }
      if (depData.success) {
        setDeposits(depData.data || []);
      }
      if (contData.success) {
        setContracts(contData.data || []);
      }
      if (roomsData.success) {
        setAvailableRooms(roomsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching student history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Sinh viên xác nhận đồng ý thuê phòng (khi chủ trọ gửi đề xuất pending_renter)
  const handleConfirmContract = async (id: number) => {
    try {
      setConfirmingContractId(id);
      const res = await fetch(`/api/rentals/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          text: 'Xác nhận hợp đồng thuê phòng thành công! Trạng thái hiện tại: Đang ở. Bạn đã có quyền viết đánh giá kèm huy hiệu xác minh.',
          type: 'success',
        });
        setContracts(prev => prev.map(c => (c.id === id ? { ...c, status: 'active', start_date: new Date().toISOString() } : c)));
      } else {
        setActionMessage({ text: data.message || 'Không thể xác nhận hợp đồng.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Lỗi kết nối khi xác nhận hợp đồng.', type: 'error' });
    } finally {
      setConfirmingContractId(null);
    }
  };

  // Hủy hoặc từ chối đề xuất thuê phòng
  const handleCancelContract = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy / từ chối đề xuất thuê phòng này?')) return;
    try {
      setCancelingId(String(id));
      const res = await fetch(`/api/rentals/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ text: 'Đã hủy đề xuất thuê phòng.', type: 'success' });
        setContracts(prev => prev.map(c => (c.id === id ? { ...c, status: 'cancelled' } : c)));
      } else {
        setActionMessage({ text: data.message || 'Không thể hủy đề xuất.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Lỗi kết nối mạng khi hủy hợp đồng.', type: 'error' });
    } finally {
      setCancelingId(null);
    }
  };

  // Sinh viên chủ động tạo yêu cầu thuê phòng mới
  const handleCreateContractRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert('Vui lòng chọn phòng trọ!');
      return;
    }
    try {
      setCreatingContract(true);
      const res = await fetch('/api/rentals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startDate: requestStartDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          text: 'Gửi yêu cầu thuê phòng thành công! Đang chờ chủ trọ xác nhận.',
          type: 'success',
        });
        setShowNewContractModal(false);
        setSelectedRoomId('');
        fetchData();
      } else {
        alert(data.message || 'Không thể gửi yêu cầu thuê phòng.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setCreatingContract(false);
    }
  };

  // Hủy lịch hẹn
  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này?')) return;
    try {
      setCancelingId(id);
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ text: 'Đã hủy lịch hẹn xem phòng thành công.', type: 'success' });
        setAppointments(prev => prev.map(a => (a.Id === id ? { ...a, TrangThai: 'Đã hủy' } : a)));
      } else {
        setActionMessage({ text: data.message || 'Không thể hủy lịch hẹn.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Lỗi kết nối khi hủy lịch hẹn.', type: 'error' });
    } finally {
      setCancelingId(null);
    }
  };

  // Hủy đặt cọc & hoàn tiền
  const handleCancelDeposit = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn cọc giữ phòng? Số tiền 500.000 VNĐ sẽ được hoàn trả ngay vào ví của bạn.')) return;
    try {
      setCancelingId(id);
      const res = await fetch(`/api/deposits/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ text: 'Đã hủy đơn đặt cọc và hoàn trả 500.000 VNĐ về ví demo của bạn.', type: 'success' });
        setDeposits(prev => prev.map(d => (d.Id === id ? { ...d, TrangThaiCoc: 'Đã hủy' } : d)));
        await refreshUser();
      } else {
        setActionMessage({ text: data.message || 'Không thể hủy đặt cọc.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Lỗi kết nối khi hủy đặt cọc.', type: 'error' });
    } finally {
      setCancelingId(null);
    }
  };

  const handleQuickTopup = async () => {
    setTopupLoading(true);
    await topupWallet(500000);
    setTopupLoading(false);
    setActionMessage({ text: 'Đã nạp thêm 500.000 VNĐ vào ví demo thành công!', type: 'success' });
  };

  // Helper format ngày giờ
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Chưa xác định';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Badge màu chuẩn theo yêu cầu:
  // vàng = chờ, xanh = đã xác nhận, đỏ = đã hủy
  const getStatusBadge = (status: string) => {
    if (status === 'Chờ xác nhận') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Chờ xác nhận
        </span>
      );
    }
    if (status === 'Đã xác nhận') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
          Đã xác nhận
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Đã hủy
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Wallet Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-400/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Khu vực Sinh viên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Lịch sử của tôi
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Theo dõi tất cả lịch hẹn xem phòng trực tiếp và các đơn đặt cọc giữ chỗ đã thực hiện trên HostelHub.
          </p>
        </div>

        {/* Wallet widget in page */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-medium">Số dư ví demo</span>
              <span className="text-xl font-black text-emerald-300 tabular-nums">
                {(user?.soDuVi || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
          <button
            onClick={handleQuickTopup}
            disabled={topupLoading}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Nạp thêm tiền vào ví demo để thử nghiệm tính năng"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{topupLoading ? 'Đang nạp...' : '+ Nạp 500k'}</span>
          </button>
        </div>
      </div>

      {/* Action alert if any */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm animate-in fade-in duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs underline hover:opacity-80"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'contracts'
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Hợp đồng & Xác nhận thuê phòng</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'contracts' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {contracts.length}
          </span>
          {activeTab === 'contracts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'appointments'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch hẹn xem phòng</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'appointments' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {appointments.length}
          </span>
          {activeTab === 'appointments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'deposits'
              ? 'text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Đơn đặt cọc giữ chỗ</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'deposits' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {deposits.length}
          </span>
          {activeTab === 'deposits' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab: Hợp đồng & Xác nhận thuê phòng 2 chiều */}
      {activeTab === 'contracts' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Xác nhận thuê phòng 2 chiều & Phân quyền đánh giá</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Khi cả hai bên bấm "Đồng ý thuê", hợp đồng sẽ kích hoạt (Đang ở) và cấp quyền đánh giá phòng trọ có huy hiệu xác minh.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewContractModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Gửi yêu cầu thuê phòng</span>
              </button>
              <button
                onClick={fetchData}
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Policy Explanation Banner */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-800">Quy trình xác minh thuê phòng:</span>
              <p className="text-slate-600 leading-relaxed">
                1. Chủ trọ hoặc Sinh viên gửi đề xuất thuê phòng ➔ 2. Bên còn lại kiểm tra và bấm nút <strong>"Xác nhận đồng ý thuê phòng"</strong> ➔ 3. Hợp đồng chuyển sang trạng thái <strong>"Đang ở" (Active)</strong> ➔ 4. Bạn được mở quyền đánh giá phòng trọ kèm huy hiệu xanh <strong>"✔ Đã xác minh thuê phòng"</strong>.
              </p>
            </div>
          </div>

          {/* List of Contracts */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800">Chưa có hợp đồng thuê phòng nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi chủ trọ gửi đề xuất hoặc bạn chủ động gửi yêu cầu xác nhận thuê phòng, danh sách hợp đồng sẽ xuất hiện tại đây.
              </p>
              <button
                onClick={() => setShowNewContractModal(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Gửi yêu cầu thuê phòng đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {contracts.map(contract => {
                const isPendingRenter = contract.status === 'pending_renter';
                const isPendingLandlord = contract.status === 'pending_landlord';
                const isActive = contract.status === 'active';
                const isCompleted = contract.status === 'completed';
                const isCancelled = contract.status === 'cancelled';

                return (
                  <div
                    key={contract.id}
                    className={`bg-white rounded-2xl border p-4.5 transition-all shadow-xs space-y-3.5 ${
                      isPendingRenter
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : isActive
                        ? 'border-emerald-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Room & Landlord Info */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={contract.roomImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80'}
                          alt={contract.roomTitle}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Mã HĐ #{contract.id}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 leading-snug">
                              {contract.roomTitle}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{contract.roomAddress || 'Khu vực phòng trọ'}</span>
                          </p>
                          <div className="flex items-center gap-3 pt-0.5 text-xs text-slate-600 flex-wrap">
                            <span className="font-bold text-blue-600">
                              {(contract.roomPrice || 0).toLocaleString('vi-VN')} đ/tháng
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <span>Chủ trọ: <strong>{contract.landlordName}</strong></span>
                            </span>
                            {contract.landlordPhone && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{contract.landlordPhone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 self-start sm:self-auto">
                        {isPendingRenter && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chủ trọ mời xác nhận</span>
                          </span>
                        )}
                        {isPendingLandlord && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Chờ chủ trọ xác nhận</span>
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đang ở (Hợp đồng có hiệu lực)</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Check className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đã hoàn thành (Trả phòng)</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3.5 h-3.5 text-rose-500" />
                            <span>Đã hủy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline & Actions Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="text-slate-500 flex items-center gap-3 flex-wrap">
                        {contract.start_date && (
                          <span>
                            Ngày bắt đầu: <strong>{new Date(contract.start_date).toLocaleDateString('vi-VN')}</strong>
                          </span>
                        )}
                        {contract.end_date && (
                          <span>
                            Ngày trả phòng: <strong>{new Date(contract.end_date).toLocaleDateString('vi-VN')}</strong>
                          </span>
                        )}
                        <span>Tạo lúc: {new Date(contract.created_at).toLocaleString('vi-VN')}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Case 1: Chủ trọ đề xuất -> Sinh viên bấm xác nhận đồng ý */}
                        {isPendingRenter && (
                          <>
                            <button
                              onClick={() => handleConfirmContract(contract.id)}
                              disabled={confirmingContractId === contract.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>{confirmingContractId === contract.id ? 'Đang xác nhận...' : 'Xác nhận đồng ý thuê'}</span>
                            </button>
                            <button
                              onClick={() => handleCancelContract(contract.id)}
                              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {/* Case 2: Sinh viên gửi -> chờ chủ trọ duyệt */}
                        {isPendingLandlord && (
                          <button
                            onClick={() => handleCancelContract(contract.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Hủy yêu cầu
                          </button>
                        )}

                        {/* Case 3: Đã active hoặc completed -> Nút Đánh giá phòng ngay */}
                        {(isActive || isCompleted) && (
                          <button
                            onClick={() => onViewRoom?.(contract.room_id)}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Đánh giá phòng ngay</span>
                          </button>
                        )}

                        {contract.room_id && (
                          <button
                            onClick={() => onViewRoom?.(contract.room_id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Xem phòng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Gửi yêu cầu xác nhận thuê phòng mới */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Gửi yêu cầu thuê phòng</h3>
                  <p className="text-[11px] text-slate-500">Gửi đề xuất xác nhận thuê 2 chiều tới chủ trọ</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewContractModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContractRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn phòng trọ bạn muốn thuê <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn phòng trọ cần gửi yêu cầu --</option>
                  {availableRooms.map(r => (
                    <option key={r.Id} value={r.Id}>
                      {r.TieuDe} ({r.GiaThue?.toLocaleString('vi-VN')} đ/tháng - {r.QuanHuyen})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngày dự kiến bắt đầu ở
                </label>
                <input
                  type="date"
                  value={requestStartDate}
                  onChange={(e) => setRequestStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                <span className="font-bold block">Lưu ý xác minh:</span>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Sau khi gửi, yêu cầu sẽ được chuyển đến chủ trọ tương ứng. Khi chủ trọ bấm "Đồng ý cho thuê", trạng thái chuyển sang "Đang ở", và bạn có thể viết đánh giá cho phòng bất cứ lúc nào!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingContract || !selectedRoomId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{creatingContract ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 1: Lịch hẹn xem phòng */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Danh sách lịch hẹn xem phòng ({appointments.length})
            </h2>
            <button
              onClick={fetchData}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Bạn chưa đặt lịch hẹn xem phòng nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy tìm kiếm phòng trọ ưng ý và nhấn "Đặt lịch hẹn xem phòng" để tới xem trực tiếp cùng bạn bè.
              </p>
              <button
                onClick={() => onNavigate?.('student-rooms')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all"
              >
                <span>Tìm phòng trọ ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map(app => (
                <div
                  key={app.Id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-200 hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-400">#{app.Id}</span>
                        <span className="text-xs text-slate-400">· Tạo lúc {formatDateTime(app.NgayTao)}</span>
                      </div>
                      <h3
                        onClick={() => app.IdPhong && onViewRoom?.(app.IdPhong)}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors mt-0.5"
                      >
                        {app.TieuDePhong || 'Phòng trọ sinh viên'}
                      </h3>
                      {app.DiaChiPhong && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{app.DiaChiPhong}</span>
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {getStatusBadge(app.TrangThai)}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Thời gian hẹn gặp
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{formatDateTime(app.ThoiGianHen)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Chủ trọ liên hệ
                      </span>
                      <div className="font-semibold text-slate-800">{app.ChuTroTen || 'Chủ trọ'}</div>
                      {app.ChuTroSdt && (
                        <a
                          href={`tel:${app.ChuTroSdt}`}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{app.ChuTroSdt}</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 sm:col-span-2 md:col-span-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Ghi chú đã gửi
                      </span>
                      <p className="text-slate-600 italic">
                        {app.GhiChu ? `"${app.GhiChu}"` : '(Không có ghi chú thêm)'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      {app.TrangThai === 'Chờ xác nhận' && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Chủ trọ đang duyệt lịch hẹn của bạn. Bạn có thể hủy nếu đổi ý.
                        </span>
                      )}
                      {app.TrangThai === 'Đã xác nhận' && (
                        <span className="text-emerald-700 font-medium">
                          ✓ Chủ trọ đã xác nhận! Vui lòng đến đúng giờ hẹn.
                        </span>
                      )}
                      {app.TrangThai === 'Đã hủy' && (
                        <span className="text-rose-600">
                          ✕ Lịch hẹn này đã bị hủy.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {app.IdPhong && (
                        <button
                          onClick={() => onViewRoom?.(app.IdPhong)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Xem phòng
                        </button>
                      )}
                      {/* Sinh viên có thể hủy lịch hẹn đã đặt (nếu chưa được xác nhận) */}
                      {app.TrangThai === 'Chờ xác nhận' && (
                        <button
                          onClick={() => handleCancelAppointment(app.Id)}
                          disabled={cancelingId === app.Id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancelingId === app.Id ? 'Đang hủy...' : 'Hủy lịch hẹn'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Đơn đặt cọc giữ chỗ */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Danh sách đơn đặt cọc giữ chỗ ({deposits.length})
            </h2>
            <button
              onClick={fetchData}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : deposits.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Chưa có đơn đặt cọc giữ chỗ nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi ưng ý phòng, bạn có thể đặt cọc 500.000 VNĐ qua ví để giữ chỗ đảm bảo phòng không bị người khác thuê trước.
              </p>
              <button
                onClick={() => onNavigate?.('student-rooms')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all"
              >
                <span>Tìm phòng đặt cọc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deposits.map(dep => (
                <div
                  key={dep.Id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-200 hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-400">#{dep.Id}</span>
                        <span className="text-xs text-slate-400">· Đặt lúc {formatDateTime(dep.NgayCoc || dep.NgayTao)}</span>
                      </div>
                      <h3
                        onClick={() => dep.IdPhong && onViewRoom?.(dep.IdPhong)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors mt-0.5"
                      >
                        {dep.TieuDePhong || 'Phòng trọ sinh viên'}
                      </h3>
                      {dep.DiaChiPhong && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dep.DiaChiPhong}</span>
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {getStatusBadge(dep.TrangThaiCoc)}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                        Số tiền đặt cọc quy định
                      </span>
                      <div className="text-lg font-black text-emerald-700 tabular-nums">
                        {(dep.SoTienCoc || 500000).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Thời hạn giữ chỗ
                      </span>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dep.ThoiHanGiuCho || '48 giờ sau khi xác nhận'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Chủ trọ nhận cọc
                      </span>
                      <div className="font-semibold text-slate-800">{dep.ChuTroTen || 'Chủ trọ'}</div>
                      <span className="text-[10px] text-slate-500">Tiền được tạm giữ an toàn qua ví HostelHub</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      {dep.TrangThaiCoc === 'Chờ xác nhận' && (
                        <span className="text-amber-700 font-medium">
                          ⏳ Đang chờ chủ trọ xác nhận giữ phòng. Bạn có thể hủy cọc và nhận lại 500.000 VNĐ vào ví.
                        </span>
                      )}
                      {dep.TrangThaiCoc === 'Đã xác nhận' && (
                        <span className="text-emerald-700 font-bold">
                          ✓ Chủ trọ đã xác nhận giữ phòng cho bạn! Phòng đã được khóa chỗ.
                        </span>
                      )}
                      {dep.TrangThaiCoc === 'Đã hủy' && (
                        <span className="text-slate-600 font-medium">
                          ✕ Đã hủy cọc · Tiền cọc 500.000 VNĐ đã được hoàn trả vào ví của bạn.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {dep.IdPhong && (
                        <button
                          onClick={() => onViewRoom?.(dep.IdPhong)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Xem phòng
                        </button>
                      )}
                      {dep.TrangThaiCoc === 'Chờ xác nhận' && (
                        <button
                          onClick={() => handleCancelDeposit(dep.Id)}
                          disabled={cancelingId === dep.Id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancelingId === dep.Id ? 'Đang hoàn tiền...' : 'Hủy cọc & Hoàn tiền'}
                        </button>
                      )}
                    </div>
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
