import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LichHen, DatCoc, GiaoDichVi } from '../types';
import {
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  ArrowRight,
  PlusCircle,
  Check,
  AlertTriangle,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Star
} from 'lucide-react';

interface StudentHistoryViewProps {
  onViewRoom?: (roomId: string) => void;
  onNavigate?: (view: string) => void;
  initialTab?: 'appointments' | 'deposits' | 'transactions';
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ onViewRoom, onNavigate, initialTab }) => {
  const { user, token, refreshUser, topupWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'deposits' | 'transactions'>(initialTab || 'appointments');
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [deposits, setDeposits] = useState<DatCoc[]>([]);
  const [transactions, setTransactions] = useState<GiaoDichVi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);

  // State phục vụ modal đánh giá phòng
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    roomId: string;
    roomTitle: string;
    soSao: number;
    nhanXet: string;
    submitting: boolean;
    error: string;
  }>({
    isOpen: false,
    roomId: '',
    roomTitle: '',
    soSao: 5,
    nhanXet: '',
    submitting: false,
    error: '',
  });

  // Hàm mở modal đánh giá
  const handleOpenReviewModal = (roomId: string, roomTitle: string) => {
    setReviewModal({
      isOpen: true,
      roomId,
      roomTitle,
      soSao: 5,
      nhanXet: '',
      submitting: false,
      error: '',
    });
  };

  // Hàm gửi đánh giá lên API backend
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.nhanXet.trim()) {
      setReviewModal(prev => ({ ...prev, error: 'Vui lòng nhập nội dung nhận xét chi tiết.' }));
      return;
    }

    try {
      setReviewModal(prev => ({ ...prev, submitting: true, error: '' }));
      const res = await fetch(`/api/rooms/${reviewModal.roomId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          soSao: reviewModal.soSao,
          nhanXet: reviewModal.nhanXet.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          text: 'Gửi đánh giá phòng trọ thành công! Đánh giá của bạn đã được hiển thị công khai.',
          type: 'success',
        });
        setReviewModal(prev => ({ ...prev, isOpen: false }));
      } else {
        setReviewModal(prev => ({
          ...prev,
          error: data.message || 'Không thể gửi đánh giá.',
        }));
      }
    } catch {
      setReviewModal(prev => ({
        ...prev,
        error: 'Lỗi kết nối máy chủ khi gửi đánh giá.',
      }));
    } finally {
      setReviewModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [appRes, depRes, txRes] = await Promise.all([
        fetch(`/api/appointments?_t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }),
        fetch(`/api/deposits?_t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }),
        fetch(`/api/wallet/transactions?_t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }),
      ]);
      const appData = await appRes.json();
      const depData = await depRes.json();
      const txData = await txRes.json();

      if (appData.success) setAppointments(appData.data || []);
      if (depData.success) setDeposits(depData.data || []);
      if (txData.success) setTransactions(txData.data || []);
    } catch (err) {
      console.error('Error fetching student history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  const getStatusBadge = (status: string) => {
    if (status === 'Chờ xác nhận') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Chờ xác nhận
        </span>
      );
    }
    if (status === 'Đã xác nhận' || status === 'Đã tiếp nhận thành công') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
          Đã tiếp nhận thành công
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

        {/* Wallet widget */}
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
            className="text-xs underline hover:opacity-80 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 3 Thẻ thống kê kiêm Tabs điều hướng trực tiếp */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Lịch xem phòng */}
        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Lịch xem phòng</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {appointments.length}
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {appointments.filter(a => a.TrangThai === 'Chờ xác nhận').length} đang chờ duyệt
          </p>
        </button>

        {/* Card 2: Đơn đặt cọc */}
        <button
          type="button"
          onClick={() => setActiveTab('deposits')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'deposits'
              ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Đơn đặt cọc</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'deposits' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {deposits.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {deposits.filter(d => d.TrangThaiCoc === 'Chờ xác nhận').length} chờ tiếp nhận
          </p>
        </button>

        {/* Card 3: Lịch sử thanh toán */}
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Lịch sử thanh toán</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'transactions' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {transactions.length}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Giao dịch nạp & hoàn tiền
          </p>
        </button>
      </div>

      {/* Tab 1: Lịch hẹn xem phòng */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Danh sách lịch hẹn xem phòng ({appointments.length})
            </h2>
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Tìm phòng đặt cọc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deposits.map(dep => {
                const isAccepted = dep.TrangThaiCoc === 'Đã tiếp nhận thành công' || dep.TrangThaiCoc === 'Đã xác nhận';
                return (
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

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500">
                        {dep.TrangThaiCoc === 'Chờ xác nhận' && (
                          <span className="text-amber-700 font-medium">
                            ⏳ Đang chờ chủ trọ xác nhận giữ phòng. Bạn có thể hủy cọc và nhận lại 500.000 VNĐ vào ví.
                          </span>
                        )}
                        {isAccepted && (
                          <span className="text-emerald-700 font-bold">
                            ✓ Chủ trọ đã tiếp nhận cọc thành công! Phòng đã được bảo lưu giữ chỗ cho bạn.
                          </span>
                        )}
                        {dep.TrangThaiCoc === 'Đã hủy' && (
                          <span className="text-slate-600 font-medium">
                            ✕ Đã hủy cọc · Tiền cọc 500.000 VNĐ đã được hoàn trả vào ví của bạn.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Nút Đánh giá phòng mở ngay khi cọc thành công */}
                        {/* SỬA LẠI ONCLICK: gọi handleOpenReviewModal */}
{isAccepted && dep.IdPhong && (
  <button
    type="button"
    onClick={() => handleOpenReviewModal(dep.IdPhong, dep.TieuDePhong || 'Phòng trọ')}
    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
  >
    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
    <span>Đánh giá phòng</span>
  </button>
)}
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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lịch sử thanh toán & Ví điện tử */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Lịch sử thanh toán & biến động số dư</h3>
                <p className="text-xs text-slate-500">
                  Theo dõi chi tiết các giao dịch nạp tiền, đặt cọc giữ phòng và hoàn tiền ví
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Số dư hiện tại</span>
                <span className="text-base font-black text-emerald-600 tabular-nums">
                  {(user?.soDuVi || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickTopup}
                disabled={topupLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{topupLoading ? 'Đang nạp...' : '+ Nạp tiền'}</span>
              </button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Chưa có giao dịch thanh toán nào</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Khi bạn nạp tiền ví, đặt cọc giữ phòng hoặc nhận hoàn tiền cọc, thông tin sẽ được lưu đầy đủ tại đây.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {transactions.map((tx) => {
                const isPlus = tx.SoTien > 0;
                return (
                  <div key={tx.Id} className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPlus ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {isPlus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{tx.NoiDung}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(tx.NgayTao)} • Mã GD: <span className="font-mono">{tx.Id}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-black tabular-nums text-sm sm:text-base ${
                          isPlus ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPlus ? '+' : ''}{tx.SoTien.toLocaleString('vi-VN')} đ
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Số dư sau GD: <span className="font-bold text-slate-700">{tx.SoDuSauGiaoDich.toLocaleString('vi-VN')} đ</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Modal Popup Nhận xét & Đánh giá phòng */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Đánh giá & Nhận xét phòng trọ</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thông tin phòng được đánh giá */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Phòng trọ:</span>
              <p className="font-bold text-slate-800 line-clamp-1">{reviewModal.roomTitle}</p>
            </div>

            {reviewModal.error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
                {reviewModal.error}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Chọn số sao */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Mức độ hài lòng của bạn:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewModal(prev => ({ ...prev, soSao: star }))}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewModal.soSao
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {reviewModal.soSao === 5
                      ? '5/5 - Rất hài lòng'
                      : reviewModal.soSao === 4
                      ? '4/5 - Hài lòng'
                      : reviewModal.soSao === 3
                      ? '3/5 - Bình thường'
                      : reviewModal.soSao === 2
                      ? '2/5 - Chưa ưng ý'
                      : '1/5 - Kém'}
                  </span>
                </div>
              </div>

              {/* Ô viết comment nhận xét */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Nội dung nhận xét chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewModal.nhanXet}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, nhanXet: e.target.value, error: '' }))}
                  placeholder="Chia sẻ trải nghiệm thực tế về phòng trọ, thái độ chủ nhà, an ninh, tiện nghi..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={reviewModal.submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {reviewModal.submitting ? 'Đang gửi...' : 'Gửi nhận xét ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};