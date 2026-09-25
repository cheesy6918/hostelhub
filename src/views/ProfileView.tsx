import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, ShieldCheck, Wallet, PlusCircle, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, topupWallet } = useAuth();

  const [hoTen, setHoTen] = useState(user?.HoTen || '');
  const [sdt, setSdt] = useState(user?.Sdt || '');
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhauMoi, setXacNhanMatKhauMoi] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [walletMsg, setWalletMsg] = useState('');
  const [isTopup, setIsTopup] = useState(false);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!hoTen.trim() || hoTen.trim().length < 2) {
      setProfileError('Họ và tên cần có ít nhất 2 ký tự.');
      return;
    }

    const cleanPhone = sdt.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      setProfileError('Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số).');
      return;
    }

    if (matKhauMoi) {
      if (!matKhauCu) {
        setProfileError('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.');
        return;
      }
      if (matKhauMoi.length < 6) {
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
      MatKhauCu: matKhauCu || undefined,
      MatKhauMoi: matKhauMoi || undefined,
    });
    setIsUpdating(false);

    if (res.success) {
      setProfileMsg(res.message);
      setMatKhauCu('');
      setMatKhauMoi('');
      setXacNhanMatKhauMoi('');
      setTimeout(() => setProfileMsg(''), 4000);
    } else {
      setProfileError(res.message);
    }
  };

  const handleTopup = async (amount: number) => {
    setIsTopup(true);
    setWalletMsg('');
    const res = await topupWallet(amount);
    setIsTopup(false);
    if (res.success) {
      setWalletMsg(res.message);
      setTimeout(() => setWalletMsg(''), 4000);
    }
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

            <div className="mt-4 pt-4 border-t border-white/15">
              <span className="text-[11px] text-blue-200 block mb-2 font-medium">Nạp tiền thử nghiệm nhanh:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(500000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-center transition-colors disabled:opacity-50"
                >
                  +500.000 đ
                </button>
                <button
                  type="button"
                  disabled={isTopup}
                  onClick={() => handleTopup(1000000)}
                  className="py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-center transition-colors disabled:opacity-50"
                >
                  +1.000.000 đ
                </button>
              </div>
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

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dùng để chủ trọ và sinh viên liên lạc trực tiếp khi xem phòng.
              </span>
            </div>

            {/* Change password section */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Đổi mật khẩu (Tùy chọn)
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={matKhauCu}
                      onChange={(e) => setMatKhauCu(e.target.value)}
                      placeholder="Chỉ nhập nếu bạn muốn đổi mật khẩu"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={matKhauMoi}
                      onChange={(e) => setMatKhauMoi(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={xacNhanMatKhauMoi}
                      onChange={(e) => setXacNhanMatKhauMoi(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
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

    </div>
  );
};
