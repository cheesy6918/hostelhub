import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, GraduationCap, Building2, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface RegisterViewProps {
  onNavigate: (view: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [vaiTro, setVaiTro] = useState<'SinhVien' | 'ChuTro'>('SinhVien');
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [sdt, setSdt] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend validations
    if (!hoTen.trim() || hoTen.trim().length < 2) {
      setErrorMsg('Vui lòng nhập họ và tên (ít nhất 2 ký tự).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Địa chỉ email không đúng định dạng.');
      return;
    }

    const cleanPhone = sdt.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      setErrorMsg('Số điện thoại không hợp lệ (cần từ 9 - 11 chữ số).');
      return;
    }

    if (!matKhau || matKhau.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (matKhau !== xacNhanMatKhau) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      HoTen: hoTen.trim(),
      Email: email.trim(),
      MatKhau: matKhau,
      Sdt: cleanPhone,
      VaiTro: vaiTro,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Đăng ký thành công tài khoản ${vaiTro === 'SinhVien' ? 'Sinh viên' : 'Chủ trọ'}! Đang chuyển hướng...`);
      setTimeout(() => {
        if (res.role === 'SinhVien') {
          onNavigate('student-rooms');
        } else if (res.role === 'ChuTro') {
          onNavigate('landlord-rooms');
        } else {
          onNavigate('student-rooms');
        }
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Đăng ký tài khoản HostelHub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kết nối trực tiếp giữa Sinh viên và Chủ nhà trọ uy tín
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Step 1: Role Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Bạn tham gia HostelHub với tư cách gì? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVaiTro('SinhVien')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  vaiTro === 'SinhVien'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg ${vaiTro === 'SinhVien' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-bold ${vaiTro === 'SinhVien' ? 'text-blue-900' : 'text-slate-800'}`}>
                    Sinh viên
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Tìm phòng, đặt lịch xem & đặt cọc an toàn
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVaiTro('ChuTro')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  vaiTro === 'ChuTro'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg ${vaiTro === 'ChuTro' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-bold ${vaiTro === 'ChuTro' ? 'text-blue-900' : 'text-slate-800'}`}>
                    Chủ trọ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Đăng phòng, quản lý phòng & nhận sinh viên
                </p>
              </button>
            </div>

            {/* Admin restriction notice */}
            <div className="mt-3 flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Tài khoản <strong>Quản trị viên (Admin)</strong> được cấp sẵn 1 tài khoản mẫu để kiểm thử, không đăng ký ngoài form.</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Họ và tên của bạn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={hoTen}
                  onChange={(e) => {
                    setHoTen(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={vaiTro === 'SinhVien' ? 'Nguyễn Văn Sinh' : 'Trần Thị Bích'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email đăng nhập <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số điện thoại / Zalo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={sdt}
                    onChange={(e) => {
                      setSdt(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="0912345678"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={matKhau}
                    onChange={(e) => {
                      setMatKhau(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={xacNhanMatKhau}
                    onChange={(e) => {
                      setXacNhanMatKhau(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Wallet note */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
              <span>Số dư ví mẫu khởi tạo ban đầu:</span>
              <span className="font-bold tabular-nums text-blue-700">2.000.000 VNĐ</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span>Hoàn tất đăng ký</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Đã có tài khoản trên HostelHub?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
