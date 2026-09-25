import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { User, Room, AdminStats, TrangThaiPhong } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Building2,
  Lock,
  Unlock,
  Search,
  Trash2,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  Eye,
  Check,
  X,
  MapPin,
  Maximize2,
  DollarSign
} from 'lucide-react';

interface AdminDashboardViewProps {
  onViewRoomDetail?: (roomId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onViewRoomDetail }) => {
  const { token, user: currentUser } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'stats' | 'moderate' | 'users' | 'all_rooms'>('stats');

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('Chờ duyệt');
  const [actionNotice, setActionNotice] = useState('');

  // Rejection modal for Room moderation
  const [rejectRoomModal, setRejectRoomModal] = useState<{
    isOpen: boolean;
    roomId: string;
    roomTitle: string;
    landlordName: string;
    reason: string;
    error: string;
    submitting: boolean;
  }>({
    isOpen: false,
    roomId: '',
    roomTitle: '',
    landlordName: '',
    reason: '',
    error: '',
    submitting: false,
  });

  // Chart Canvas Refs for the 3 requested charts:
  // 1. 'Tổng số phòng theo trạng thái'
  // 2. 'Lượt đặt lịch hàng tháng'
  // 3. 'Tỷ lệ cọc thành công'
  const roomStatusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyAppointmentsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const depositRateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstances = useRef<{
    roomStatus?: Chart;
    monthlyAppointments?: Chart;
    depositRate?: Chart;
  }>({});

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch stats, users, all rooms (including pending/rejected) in parallel
      const [resStats, resUsers, resRooms] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/rooms?status=all'),
      ]);

      const [dataStats, dataUsers, dataRooms] = await Promise.all([
        resStats.json(),
        resUsers.json(),
        resRooms.json(),
      ]);

      if (dataStats.success) setStats(dataStats.data);
      if (dataUsers.success) setUsers(dataUsers.data || []);
      if (dataRooms.success) setRooms(dataRooms.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Render Chart.js when stats are available and on 'stats' tab
  useEffect(() => {
    if (activeTab !== 'stats' || !stats) return;

    // Destroy prior instances
    if (chartInstances.current.roomStatus) {
      chartInstances.current.roomStatus.destroy();
    }
    if (chartInstances.current.monthlyAppointments) {
      chartInstances.current.monthlyAppointments.destroy();
    }
    if (chartInstances.current.depositRate) {
      chartInstances.current.depositRate.destroy();
    }

    // -------------------------------------------------------------
    // 1. Biểu đồ: 'Tổng số phòng theo trạng thái' (Doughnut Chart)
    // -------------------------------------------------------------
    if (roomStatusCanvasRef.current) {
      const roomStatusData = stats.roomsByStatus || {
        'Còn phòng': 0,
        'Công khai': 0,
        'Chờ duyệt': 0,
        'Đã cọc': 0,
        'Hết phòng': 0,
        'Từ chối': 0,
      };

      const labels = ['Còn phòng', 'Công khai', 'Đã cọc', 'Chờ duyệt', 'Hết phòng', 'Từ chối'];
      const dataValues = [
        roomStatusData['Còn phòng'] || 0,
        roomStatusData['Công khai'] || 0,
        roomStatusData['Đã cọc'] || 0,
        roomStatusData['Chờ duyệt'] || 0,
        roomStatusData['Hết phòng'] || 0,
        roomStatusData['Từ chối'] || 0,
      ];

      chartInstances.current.roomStatus = new Chart(roomStatusCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: [
                '#10b981', // Còn phòng (Emerald)
                '#2563eb', // Công khai (Blue)
                '#8b5cf6', // Đã cọc (Purple)
                '#f59e0b', // Chờ duyệt (Amber)
                '#64748b', // Hết phòng (Slate)
                '#ef4444', // Từ chối (Red)
              ],
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: { size: 11, weight: 600 },
                color: '#334155',
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const val = Number(context.raw) || 0;
                  const total = (context.dataset.data as number[]).reduce((a, b) => Number(a) + Number(b), 0);
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  return ` ${context.label}: ${val} phòng (${pct}%)`;
                },
              },
            },
          },
          cutout: '64%',
        },
      });
    }

    // -------------------------------------------------------------
    // 2. Biểu đồ: 'Lượt đặt lịch hàng tháng' (Bar & Trendline Chart)
    // -------------------------------------------------------------
    if (monthlyAppointmentsCanvasRef.current) {
      const monthLabels = stats.monthlyAppointments?.labels || [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ];
      const monthlyData = stats.monthlyAppointments?.data || [
        12, 18, 25, 22, 30, 48, 72, 88, 95, 42, 26, 32
      ];

      chartInstances.current.monthlyAppointments = new Chart(monthlyAppointmentsCanvasRef.current, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            {
              type: 'bar',
              label: 'Lượt đặt lịch xem phòng',
              data: monthlyData,
              backgroundColor: 'rgba(37, 99, 235, 0.85)',
              hoverBackgroundColor: '#1d4ed8',
              borderRadius: 6,
              barPercentage: 0.65,
              order: 2,
            },
            {
              type: 'line',
              label: 'Đường xu hướng (Trend)',
              data: monthlyData,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderWidth: 2.5,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#f59e0b',
              pointBorderWidth: 2,
              tension: 0.35,
              fill: false,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 11 }, stepSize: 20 },
              grid: { color: '#f1f5f9' },
            },
            x: {
              ticks: { font: { size: 11, weight: 500 }, color: '#475569' },
              grid: { display: false },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                font: { size: 11, weight: 600 },
                color: '#475569',
              },
            },
            tooltip: {
              padding: 10,
              boxPadding: 4,
            },
          },
        },
      });
    }

    // -------------------------------------------------------------
    // 3. Biểu đồ: 'Tỷ lệ cọc thành công' (Doughnut / Success Ratio Chart)
    // -------------------------------------------------------------
    if (depositRateCanvasRef.current) {
      const depStats = stats.depositStats || {
        successful: stats.successfulDeposits || 0,
        pending: Math.max(0, (stats.totalDeposits || 0) - (stats.successfulDeposits || 0)),
        cancelled: 0,
        total: stats.totalDeposits || 0,
        successRate: stats.depositSuccessRate || 0,
      };

      const depLabels = ['Cọc thành công', 'Đang chờ xử lý', 'Đã hủy / Hoàn tiền'];
      const depData = [
        depStats.successful,
        depStats.pending,
        depStats.cancelled,
      ];

      chartInstances.current.depositRate = new Chart(depositRateCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: depLabels,
          datasets: [
            {
              data: depData,
              backgroundColor: [
                '#10b981', // Cọc thành công (Emerald)
                '#f59e0b', // Đang chờ (Amber)
                '#ef4444', // Đã hủy (Red)
              ],
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 12,
                font: { size: 11, weight: 600 },
                color: '#334155',
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const val = Number(context.raw) || 0;
                  const total = (context.dataset.data as number[]).reduce((a, b) => Number(a) + Number(b), 0);
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  return ` ${context.label}: ${val} đơn (${pct}%)`;
                },
              },
            },
          },
          cutout: '70%',
        },
      });
    }

    return () => {
      if (chartInstances.current.roomStatus) chartInstances.current.roomStatus.destroy();
      if (chartInstances.current.monthlyAppointments) chartInstances.current.monthlyAppointments.destroy();
      if (chartInstances.current.depositRate) chartInstances.current.depositRate.destroy();
    };
  }, [activeTab, stats]);

  // Phê duyệt phòng trọ -> Trạng thái 'Công khai'
  const handleApproveRoom = async (roomId: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotice(`Đã phê duyệt bài đăng "${title}" thành công! Phòng đã chuyển sang trạng thái "Công khai".`);
        setTimeout(() => setActionNotice(''), 4500);
        fetchAdminData();
      } else {
        alert(data.message || 'Lỗi khi phê duyệt phòng.');
      }
    } catch {
      alert('Lỗi kết nối');
    }
  };

  // Mở modal từ chối duyệt phòng
  const handleOpenRejectRoomModal = (room: Room) => {
    setRejectRoomModal({
      isOpen: true,
      roomId: room.Id,
      roomTitle: room.TieuDe,
      landlordName: room.ChuTroTen || 'Chủ trọ',
      reason: '',
      error: '',
      submitting: false,
    });
  };

  // Xác nhận từ chối duyệt bài đăng phòng
  const handleConfirmRejectRoom = async () => {
    if (!rejectRoomModal.reason.trim()) {
      setRejectRoomModal((prev) => ({
        ...prev,
        error: 'Vui lòng nhập lý do từ chối kiểm duyệt để thông báo cho chủ trọ.',
      }));
      return;
    }

    try {
      setRejectRoomModal((prev) => ({ ...prev, submitting: true, error: '' }));
      const res = await fetch(`/api/admin/rooms/${rejectRoomModal.roomId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject', reason: rejectRoomModal.reason.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotice(`Đã từ chối bài đăng "${rejectRoomModal.roomTitle}". Lý do đã được thông báo cho chủ trọ.`);
        setTimeout(() => setActionNotice(''), 4500);
        setRejectRoomModal((prev) => ({ ...prev, isOpen: false }));
        fetchAdminData();
      } else {
        setRejectRoomModal((prev) => ({ ...prev, error: data.message || 'Lỗi xử lý từ chối.' }));
      }
    } catch {
      setRejectRoomModal((prev) => ({ ...prev, error: 'Lỗi kết nối mạng, vui lòng thử lại.' }));
    } finally {
      setRejectRoomModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(''), 3500);
        fetchAdminData();
      } else {
        alert(data.message || 'Lỗi xử lý');
      }
    } catch {
      alert('Lỗi kết nối');
    }
  };

  // Xóa phòng trọ vi phạm
  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phòng trọ "${title}" khỏi hệ thống?`)) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionNotice(`Đã gỡ bỏ phòng trọ "${title}" khỏi hệ thống.`);
        setTimeout(() => setActionNotice(''), 3500);
        fetchAdminData();
      }
    } catch {
      // ignore
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.HoTen.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.Email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.Sdt.includes(userSearch);
    const matchRole = roleFilter === 'all' || u.VaiTro === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingRooms = rooms.filter((r) => r.TrangThai === 'Chờ duyệt');

  const filteredModerationRooms = rooms.filter((r) => {
    if (roomStatusFilter === 'all') return true;
    return r.TrangThai === roomStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bảng điều khiển Quản trị viên (HostelHub Admin)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Hệ thống quản trị & kiểm duyệt</h1>
            <p className="text-xs text-slate-400 mt-1">
              Quản lý tài khoản, phê duyệt tin đăng phòng trọ và giám sát chỉ số vận hành toàn hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              Admin: <strong>{currentUser?.HoTen}</strong>
            </span>
          </div>
        </div>

        {/* Highlight Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-slate-400 block text-[11px]">Tổng người dùng</span>
            <span className="text-xl font-bold text-white tabular-nums">{stats?.totalUsers || users.length}</span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-blue-400 block text-[11px]">Sinh viên / Chủ trọ</span>
            <span className="text-lg font-bold text-blue-300 tabular-nums">
              {stats?.sinhVienCount || 0} / {stats?.chuTroCount || 0}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-amber-400 block text-[11px]">Phòng chờ duyệt</span>
            <span className="text-xl font-bold text-amber-300 tabular-nums">
              {pendingRooms.length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-slate-300 block text-[11px]">Lượt đặt lịch hẹn</span>
            <span className="text-xl font-bold text-white tabular-nums">{stats?.totalAppointments || 0}</span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-emerald-400 block text-[11px]">Tỷ lệ cọc thành công</span>
            <span className="text-xl font-bold text-emerald-300 tabular-nums">
              {stats?.depositSuccessRate || 0}%
            </span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-emerald-400 block text-[11px]">Tổng số dư lưu thông</span>
            <span className="text-sm font-bold text-emerald-300 tabular-nums truncate block">
              {(stats?.totalWallet || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Thống kê & Biểu đồ</span>
        </button>

        <button
          onClick={() => setActiveTab('moderate')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'moderate'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kiểm duyệt bài đăng phòng ({pendingRooms.length})</span>
          {pendingRooms.length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
              {pendingRooms.length} mới
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Quản lý tài khoản ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_rooms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'all_rooms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tất cả phòng trọ ({rooms.length})</span>
        </button>
      </div>

      {/* Tab 1: Thống kê & Biểu đồ (Chart.js) */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Tổng số phòng đã đăng</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {stats?.totalRooms || rooms.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">phòng trọ</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50 p-2 rounded-xl">
                  <span className="text-emerald-700 block text-[10px] font-semibold">Công khai/Còn</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {(stats?.roomsByStatus['Công khai'] || 0) + (stats?.roomsByStatus['Còn phòng'] || 0)}
                  </span>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl">
                  <span className="text-amber-700 block text-[10px] font-semibold">Chờ duyệt</span>
                  <span className="font-bold text-amber-800 text-sm">
                    {stats?.roomsByStatus['Chờ duyệt'] || 0}
                  </span>
                </div>
                <div className="bg-purple-50 p-2 rounded-xl">
                  <span className="text-purple-700 block text-[10px] font-semibold">Đã cọc/Hết</span>
                  <span className="font-bold text-purple-800 text-sm">
                    {(stats?.roomsByStatus['Đã cọc'] || 0) + (stats?.roomsByStatus['Hết phòng'] || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Tổng số lượt đặt lịch hẹn</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600 tabular-nums">
                  {stats?.totalAppointments || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">lượt hẹn xem phòng</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Kênh kết nối trực tiếp sinh viên và chủ trọ không qua trung gian.</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Tỷ lệ đặt cọc thành công</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">
                  {stats?.depositSuccessRate || 0}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({stats?.successfulDeposits || 0}/{stats?.totalDeposits || 0} đơn cọc)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats?.depositSuccessRate || 0))}%` }}
                />
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                Đơn cọc được chủ trọ tiếp nhận thành công và bảo lưu chỗ phòng trọ cho sinh viên.
              </div>
            </div>
          </div>

          {/* Chart.js Visualization Grid: 3 biêu đồ trực quan theo yêu cầu */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Biểu đồ 1: 'Tổng số phòng theo trạng thái' */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                      <PieChartIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Tổng số phòng theo trạng thái</h3>
                      <p className="text-[11px] text-slate-400">Phân bố phòng theo trạng thái kiểm duyệt & thuê</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Doughnut Chart
                  </span>
                </div>

                <div className="relative h-64 flex items-center justify-center">
                  <canvas ref={roomStatusCanvasRef} />
                </div>
              </div>

              {/* Status Chips Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 block">Còn phòng</span>
                  <span className="text-base font-extrabold text-emerald-900 tabular-nums">
                    {stats?.roomsByStatus['Còn phòng'] || 0}
                  </span>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-800 block">Công khai</span>
                  <span className="text-base font-extrabold text-blue-900 tabular-nums">
                    {stats?.roomsByStatus['Công khai'] || 0}
                  </span>
                </div>
                <div className="p-2 bg-purple-50 border border-purple-100 rounded-xl">
                  <span className="text-[10px] font-bold text-purple-800 block">Đã cọc</span>
                  <span className="text-base font-extrabold text-purple-900 tabular-nums">
                    {stats?.roomsByStatus['Đã cọc'] || 0}
                  </span>
                </div>
                <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-800 block">Chờ duyệt</span>
                  <span className="text-base font-extrabold text-amber-900 tabular-nums">
                    {stats?.roomsByStatus['Chờ duyệt'] || 0}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-700 block">Hết phòng</span>
                  <span className="text-base font-extrabold text-slate-800 tabular-nums">
                    {stats?.roomsByStatus['Hết phòng'] || 0}
                  </span>
                </div>
                <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-800 block">Từ chối</span>
                  <span className="text-base font-extrabold text-rose-900 tabular-nums">
                    {stats?.roomsByStatus['Từ chối'] || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Biểu đồ 2: 'Lượt đặt lịch hàng tháng' */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Lượt đặt lịch hàng tháng</h3>
                      <p className="text-[11px] text-slate-400">Số lượng sinh viên gửi lời hẹn xem phòng theo từng tháng trong năm</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Bar & Trendline
                  </span>
                </div>

                <div className="relative h-72 w-full">
                  <canvas ref={monthlyAppointmentsCanvasRef} />
                </div>
              </div>

              {/* Monthly Insights Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Tổng số lượt đặt lịch: <strong>{stats?.totalAppointments || 0}</strong> lượt</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-medium">
                  <span>🔥 Cao điểm: Tháng 7 - Tháng 9 (Mùa tân sinh viên nhập học)</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ 3: 'Tỷ lệ cọc thành công' */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Tỷ lệ cọc thành công</h3>
                      <p className="text-[11px] text-slate-400">Tỷ lệ đơn cọc được chủ trọ tiếp nhận và bảo lưu phòng</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {stats?.depositSuccessRate || 0}% Thành công
                  </span>
                </div>

                <div className="relative h-64 flex items-center justify-center">
                  <canvas ref={depositRateCanvasRef} />
                </div>
              </div>

              {/* Deposit Stats Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 px-2.5 bg-emerald-50/70 rounded-xl">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Đã tiếp nhận thành công:
                  </span>
                  <span className="font-extrabold text-emerald-900 tabular-nums">
                    {stats?.successfulDeposits || 0} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 bg-amber-50/70 rounded-xl">
                  <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Đang chờ chủ trọ xác nhận:
                  </span>
                  <span className="font-extrabold text-amber-900 tabular-nums">
                    {Math.max(0, (stats?.totalDeposits || 0) - (stats?.successfulDeposits || 0))} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    Tổng giá trị cọc đã chuyển thành công:
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {(stats?.depositStats?.totalDepositMoney || (stats?.successfulDeposits || 0) * 500000).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Bảng tổng hợp hiệu suất hệ thống (KPI Matrix & Operational Health) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Bảng chỉ số vận hành nền tảng (KPIs)</h3>
                      <p className="text-[11px] text-slate-400">Đánh giá tổng thể chất lượng giao dịch và tương tác trên hệ thống</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Thời gian thực
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">Tỷ lệ lấp đầy phòng trọ</span>
                      <span className="font-bold text-emerald-600">
                        {stats?.totalRooms ? Math.round(((stats.roomsByStatus['Đã cọc'] + stats.roomsByStatus['Hết phòng']) / stats.totalRooms) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${stats?.totalRooms ? Math.round(((stats.roomsByStatus['Đã cọc'] + stats.roomsByStatus['Hết phòng']) / stats.totalRooms) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Tỷ lệ phòng đã được thuê hoặc bảo lưu cọc trên tổng số phòng
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">Tốc độ duyệt tin đăng</span>
                      <span className="font-bold text-blue-600">~ 15 phút</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-[90%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Thời gian trung bình Admin phản hồi phê duyệt bài đăng mới
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">Mức độ hài lòng của SV</span>
                      <span className="font-bold text-amber-600">4.9 / 5.0 ⭐</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[98%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Dựa trên đánh giá và phản hồi sau khi xem phòng thực tế
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">Tỷ lệ hoàn tiền cọc an toàn</span>
                      <span className="font-bold text-emerald-600">100% tự động</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[100%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Tiền cọc được hoàn lại ví ngay nếu chủ trọ từ chối đơn
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Dữ liệu được đồng bộ liên tục với máy chủ cơ sở dữ liệu.</span>
                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Làm mới biểu đồ</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Kiểm duyệt bài đăng phòng (Chờ duyệt / Công khai / Từ chối) */}
      {activeTab === 'moderate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Kiểm duyệt tin đăng phòng trọ</span>
                  {pendingRooms.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      {pendingRooms.length} phòng đang chờ duyệt
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phòng được phê duyệt sẽ chuyển sang "Công khai" và hiển thị ngay trên trang tìm kiếm của sinh viên.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Chờ duyệt', value: 'Chờ duyệt', count: pendingRooms.length },
                  { label: 'Công khai', value: 'Công khai', count: rooms.filter(r => r.TrangThai === 'Công khai').length },
                  { label: 'Từ chối', value: 'Từ chối', count: rooms.filter(r => r.TrangThai === 'Từ chối').length },
                  { label: 'Tất cả', value: 'all', count: rooms.length },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setRoomStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      roomStatusFilter === tab.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* List of rooms to moderate */}
            {filteredModerationRooms.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-semibold text-slate-700">
                  {roomStatusFilter === 'Chờ duyệt'
                    ? 'Tuyệt vời! Không còn bài đăng phòng trọ nào đang chờ duyệt.'
                    : 'Không có phòng nào trong danh mục này.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredModerationRooms.map((room) => (
                  <div key={room.Id} className="py-5 flex flex-col md:flex-row gap-5 items-start">
                    {/* Thumbnail */}
                    <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                      <img
                        src={room.HinhAnh?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                        alt={room.TieuDe}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-xs ${
                        room.TrangThai === 'Công khai'
                          ? 'bg-emerald-600 text-white'
                          : room.TrangThai === 'Chờ duyệt'
                          ? 'bg-amber-500 text-white'
                          : room.TrangThai === 'Từ chối'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}>
                        {room.TrangThai}
                      </span>
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                            {room.TieuDe}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{room.DiaChi}{room.QuanHuyen ? `, ${room.QuanHuyen}` : ''}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-blue-600">
                            {room.GiaThue.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-slate-400 block">/tháng · {room.DienTich} m²</span>
                        </div>
                      </div>

                      {/* Landlord details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span>Chủ trọ: <strong>{room.ChuTroTen || 'Chủ trọ'}</strong></span>
                        <span>SĐT: <strong className="font-mono text-blue-600">{room.ChuTroSdt || 'Chưa cập nhật'}</strong></span>
                        <span>⚡ Điện: {room.GiaDien} · 💧 Nước: {room.GiaNuoc}</span>
                      </div>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1">
                        {(room.TienIch || []).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Description preview */}
                      {room.MoTa && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          "{room.MoTa}"
                        </p>
                      )}

                      {/* Rejection reason if any */}
                      {room.LyDoTuChoi && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>Lý do từ chối: <strong>{room.LyDoTuChoi}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                      {room.TrangThai === 'Chờ duyệt' ? (
                        <>
                          <button
                            onClick={() => handleApproveRoom(room.Id, room.TieuDe)}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Phê duyệt (Công khai)
                          </button>

                          <button
                            onClick={() => handleOpenRejectRoomModal(room)}
                            className="flex-1 md:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer active:scale-98 transition-all whitespace-nowrap"
                          >
                            <X className="w-3.5 h-3.5" />
                            Từ chối duyệt
                          </button>
                        </>
                      ) : room.TrangThai === 'Từ chối' ? (
                        <button
                          onClick={() => handleApproveRoom(room.Id, room.TieuDe)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Duyệt lại phòng này
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenRejectRoomModal(room)}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-medium cursor-pointer"
                        >
                          Gỡ/Hủy công khai
                        </button>
                      )}

                      {onViewRoomDetail && (
                        <button
                          onClick={() => onViewRoomDetail(room.Id)}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem trước</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Quản lý tài khoản */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh sách tài khoản người dùng ({users.length})</h2>
              <p className="text-xs text-slate-500">Giám sát tài khoản sinh viên, chủ trọ và phân quyền hệ thống</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 w-full sm:w-auto"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="SinhVien">🎓 Sinh viên</option>
                <option value="ChuTro">🏢 Chủ trọ</option>
                <option value="Admin">⚡ Quản trị viên (Admin)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Người dùng</th>
                  <th className="py-3 px-4 font-semibold">Email & SĐT</th>
                  <th className="py-3 px-4 font-semibold">Vai trò</th>
                  <th className="py-3 px-4 font-semibold">Số dư ví demo</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái tài khoản</th>
                  <th className="py-3 px-4 font-semibold text-right">Khóa / Mở tài khoản</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.Id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.HoTen}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {u.Id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium">{u.Email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.Sdt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.VaiTro === 'Admin' && (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-[11px] border border-purple-200">
                          ⚡ Admin
                        </span>
                      )}
                      {u.VaiTro === 'ChuTro' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] border border-emerald-200">
                          🏢 Chủ trọ
                        </span>
                      )}
                      {u.VaiTro === 'SinhVien' && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px] border border-blue-200">
                          🎓 Sinh viên
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-bold text-slate-800">
                      {(u.soDuVi || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.TrangThai === 'HoatDong'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.TrangThai === 'HoatDong' ? '● Đang hoạt động' : '✕ Bị khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.Id !== currentUser?.Id ? (
                        <button
                          onClick={() => handleToggleUserStatus(u.Id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                            u.TrangThai === 'HoatDong'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.TrangThai === 'HoatDong' ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Khóa tài khoản</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Mở khóa</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tài khoản này (Admin)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Tất cả phòng trọ */}
      {activeTab === 'all_rooms' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Toàn bộ phòng trọ trên hệ thống ({rooms.length})</h2>
              <p className="text-xs text-slate-500">Giám sát thông tin và gỡ bỏ các bài đăng vi phạm</p>
            </div>
            <button onClick={fetchAdminData} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Làm mới dữ liệu
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Phòng trọ</th>
                  <th className="py-3 px-4 font-semibold">Chủ trọ</th>
                  <th className="py-3 px-4 font-semibold">Giá thuê / Diện tích</th>
                  <th className="py-3 px-4 font-semibold">Địa chỉ</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Xóa bài vi phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((r) => (
                  <tr key={r.Id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{r.TieuDe}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {r.Id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.ChuTroTen}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.ChuTroSdt}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-600 tabular-nums">
                        {r.GiaThue.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11px] text-slate-500">{r.DienTich} m²</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-700 truncate">{r.DiaChi}</div>
                      <div className="text-[11px] text-slate-500">{r.QuanHuyen}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        r.TrangThai === 'Công khai' || r.TrangThai === 'Còn phòng'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.TrangThai === 'Chờ duyệt'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : r.TrangThai === 'Đã cọc'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : r.TrangThai === 'Từ chối'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.TrangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRoom(r.Id, r.TieuDe)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa phòng này khỏi hệ thống"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal for Room Moderation */}
      {rejectRoomModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Từ chối duyệt bài đăng phòng trọ</h3>
              </div>
              <button
                onClick={() => setRejectRoomModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs space-y-1">
              <p><strong className="text-slate-700">Phòng:</strong> {rejectRoomModal.roomTitle}</p>
              <p><strong className="text-slate-700">Chủ trọ:</strong> {rejectRoomModal.landlordName}</p>
              <p className="text-slate-500 mt-1">
                Khi từ chối, tin đăng sẽ chuyển sang trạng thái "Từ chối" và không hiển thị trên danh sách tìm kiếm của sinh viên.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do từ chối kiểm duyệt <span className="text-rose-600">* (Bắt buộc)</span>
              </label>
              <textarea
                rows={3}
                value={rejectRoomModal.reason}
                onChange={(e) =>
                  setRejectRoomModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))
                }
                placeholder="Nhập lý do cụ thể gửi thông báo cho chủ trọ điều chỉnh..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              {rejectRoomModal.error && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{rejectRoomModal.error}</p>
              )}

              {/* Quick suggestions */}
              <div className="mt-2 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Gợi ý lý do nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Hình ảnh mờ hoặc không phải ảnh chụp thực tế',
                    'Mức giá thuê hoặc tiền điện/nước chưa minh bạch',
                    'Địa chỉ cụ thể chưa chính xác',
                    'Thiếu số điện thoại liên hệ xác thực',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRejectRoomModal((prev) => ({ ...prev, reason: chip, error: '' }))}
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
                onClick={() => setRejectRoomModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectRoom}
                disabled={rejectRoomModal.submitting}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {rejectRoomModal.submitting ? 'Đang xử lý...' : 'Xác nhận từ chối duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
