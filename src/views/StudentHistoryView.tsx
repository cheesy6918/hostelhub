import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LichHen, DatCoc } from '../types';
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
  AlertTriangle
} from 'lucide-react';

interface StudentHistoryViewProps {
  onViewRoom?: (roomId: string) => void;
  onNavigate?: (view: string) => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ onViewRoom, onNavigate }) => {
  const { user, token, refreshUser, topupWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'deposits'>('appointments');
  
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [deposits, setDeposits] = useState<DatCoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [appRes, depRes] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/deposits', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const appData = await appRes.json();
      const depData = await depRes.json();

      if (appData.success) {
        setAppointments(appData.data || []);
      }
      if (depData.success) {
        setDeposits(depData.data || []);
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
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative ${
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
          className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative ${
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
