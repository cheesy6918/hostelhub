import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, ShieldCheck, Wallet, PlusCircle, CheckCircle2, AlertCircle, Save, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, topupWallet, walletTransactions, refreshTransactions } = useAuth();

  const [hoTen, setHoTen] = useState(user?.HoTen || '');
  const [sdt, setSdt] = useState(user?.Sdt || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhauMoi, setXacNhanMatKhauMoi] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [walletMsg, setWalletMsg] = useState('');
  const [customTopupAmount, setCustomTopupAmount] = useState('');
  const [isTopup, setIsTopup] = useState(false);

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      setHoTen(user.HoTen || '');
      setSdt(user.Sdt || '');
    }
  }, [user]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!hoTen.trim() || hoTen.trim().length < 2) {
      setProfileError('Họ và tên cần có ít nhất 2 ký tự.');
      return;
    }

    let cleanPhone = sdt.replace(/\s+/g, '').replace(/[\.\-]/g, '');
    if (cleanPhone.startsWith('+84')) cleanPhone = '0' + cleanPhone.slice(3);
    if (cleanPhone.startsWith('84') && cleanPhone.length > 10) cleanPhone = '0' + cleanPhone.slice(2);

    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      setProfileError('Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số, VD: 0987654321).');
      return;
    }

    if (isChangingPassword) {
      if (!matKhauCu) {
        setProfileError('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.');
        return;
      }
      if (!matKhauMoi || matKhauMoi.length < 6) {
        setProfileError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
        return;
      }
      if (matKhauMoi !== xacNhanMatKhauMoi) {
        setProfileError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
      }
    }

    setIsUpdating(true);
    const res = await updateProfile({
      HoTen: hoTen.trim(),
      Sdt: cleanPhone,
      MatKhauCu: isChangingPassword ? matKhauCu : undefined,
      MatKhauMoi: isChangingPassword ? matKhauMoi : undefined,
    });
    setIsUpdating(false);

    if (res.success) {
      setProfileMsg(res.message);
      if (isChangingPassword) {
        setMatKhauCu('');
        setMatKhauMoi('');
        setXacNhanMatKhauMoi('');
        setIsChangingPassword(false);
      }
      setTimeout(() => setProfileMsg(''), 4000);
    } else {
      setProfileError(res.message);
    }
  };

  const handleTopup = async (amount: number) => {
    if (amount <= 0) return;
    setIsTopup(true);
    setWalletMsg('');
    const res = await topupWallet(amount);
    setIsTopup(false);
    if (res.success) {
      setWalletMsg(res.message);
      setCustomTopupAmount('');
      setTimeout(() => setWalletMsg(''), 4000);
    }
  };

  const handleCustomTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customTopupAmount.replace(/\D/g, ''));
    if (!val || val < 10000) {
      setWalletMsg('Vui lòng nhập số tiền từ 10.000 VNĐ trở lên.');
      return;
    }
    handleTopup(val);
  };

  const getRoleBadge = () => {
    if (user?.VaiTro === 'Admin') {
      return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg text-xs">⚡ Quản trị viên (Admin)</span>;
    }
    if (user?.VaiTro === 'ChuTro') {
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs">🏢 Chủ trọ cho thuê</span>;
    }
    return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs">🎓 Sinh viên tìm phòng</span>;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleString('vi-VN', {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân & Ví điện tử</h1>
        <p className="text-xs text-slate-500 mt-1">Quản lý thông tin định danh, số điện thoại Zalo và số dư ví HostelHub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Col 1: Avatar & Wallet Card */}
        <div className="space-y-6">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              {user?.HoTen?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-base font-bold text-slate-900 truncate">{user?.HoTen}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.Email}</p>
            <div className="mt-3 flex justify-center">
              {getRoleBadge()}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Mã tài khoản: <span className="font-mono">{user?.Id}</span>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <Wallet className="w-4 h-4" />
                <span>Ví điện tử HostelHub</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-semibold">Demo</span>
            </div>

            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {(user?.soDuVi || 0).toLocaleString('vi-VN')} <span className="text-xs font-normal text-blue-200">VNĐ</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              Dùng để đặt cọc giữ phòng online (Sinh viên) hoặc nhận cọc (Chủ trọ)
            </p>

            {walletMsg && (
              <div className="mt-3 p-2 bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-[11px] text-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{walletMsg}</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/15 space-y-3">
              <span className="text-[11px] text-blue-200 block font-medium">Nạp tiền nhanh vào ví:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(500000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +500.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(1000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +1.000.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(2000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +2.000.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(5000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +5.000.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(10000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +10.000.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(50000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-[11px] font-semibold text-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  +50.000.000 đ
                </button>
              </div>

              {/* Custom amount topup */}
              <form onSubmit={handleCustomTopup} className="pt-2 border-t border-white/10 space-y-2">
                <label className="text-[10px] text-blue-200 block font-medium">
                  Hoặc nhập số tiền tùy chọn (đến 500.000.000 đ):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="10000"
                    max="500000000"
                    step="10000"
                    placeholder="VD: 15000000"
                    value={customTopupAmount}
                    onChange={(e) => setCustomTopupAmount(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white/15 text-white placeholder-blue-300 text-xs rounded-xl border border-white/20 focus:outline-none focus:bg-white/25"
                  />
                  <button
                    type="submit"
                    disabled={isTopup || !customTopupAmount}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isTopup ? '...' : 'Nạp'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Col 2 & 3: Form Edit info & Change password */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Cập nhật thông tin tài khoản
          </h3>

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{profileError}</span>
            </div>
          )}

          {profileMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4" autoComplete="off">
            
            {/* Readonly Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.Email || ''}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Email định danh cố định của tài khoản, không thể thay đổi.
              </span>
            </div>

            {/* Editable Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên hiển thị <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Editable Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ / Zalo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dùng để liên hệ trực tiếp khi xem phòng hoặc thực hiện thủ tục thuê phòng.
              </span>
            </div>

            {/* Toggle Change Password */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Đổi mật khẩu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    isChangingPassword ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isChangingPassword ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={matKhauCu}
                      onChange={(e) => setMatKhauCu(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={matKhauMoi}
                        onChange={(e) => setMatKhauMoi(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={xacNhanMatKhauMoi}
                        onChange={(e) => setXacNhanMatKhauMoi(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

      {/* Full-width Lịch sử giao dịch ví (Lịch sử thanh toán & biến động số dư) */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Lịch sử thanh toán & biến động số dư ví
              </h3>
              <p className="text-[11px] text-slate-500">
                Ghi nhận mọi giao dịch nạp tiền, đặt cọc giữ phòng và hoàn tiền ví trên hệ thống
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {walletTransactions.length} giao dịch
          </span>
        </div>

        {walletTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
            <p>Chưa có giao dịch nào được ghi nhận.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden">
            {walletTransactions.map((tx) => {
              const isPlus = tx.SoTien > 0;
              return (
                <div key={tx.Id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isPlus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isPlus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{tx.NoiDung}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(tx.NgayTao)} • Mã: <span className="font-mono">{tx.Id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-bold tabular-nums text-sm ${
                      isPlus ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isPlus ? '+' : ''}{tx.SoTien.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Số dư sau GD: {tx.SoDuSauGiaoDich.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
