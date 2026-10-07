import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onNavigate: (view: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = customEmail !== undefined ? customEmail : email;
    const targetPass = customPass !== undefined ? customPass : password;

    if (!targetEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Email.');
      return;
    }

    if (!targetPass) {
      setErrorMsg('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(targetEmail.trim(), targetPass);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Đăng nhập thành công! Đang điều hướng theo vai trò...');
      setTimeout(() => {
        if (res.role === 'SinhVien') {
          onNavigate('student-rooms');
        } else if (res.role === 'ChuTro') {
          onNavigate('landlord-rooms');
        } else if (res.role === 'Admin') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('student-rooms');
        }
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (role: 'SinhVien' | 'ChuTro' | 'Admin') => {
    if (role === 'SinhVien') {
      setEmail('sinhvien@hostelhub.vn');
      setPassword('123456');
      handleSubmit(undefined, 'sinhvien@hostelhub.vn', '123456');
    } else if (role === 'ChuTro') {
      setEmail('chutro@hostelhub.vn');
      setPassword('123456');
      handleSubmit(undefined, 'chutro@hostelhub.vn', '123456');
    } else {
      setEmail('admin@hostelhub.vn');
      setPassword('admin123');
      handleSubmit(undefined, 'admin@hostelhub.vn', 'admin123');
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 relative bg-cover bg-center bg-no-repeat selection:bg-blue-600 selection:text-white"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80')`
      }}
    >
      {/* Lớp phủ tối và mờ nhẹ giúp form nổi bật, dễ đọc chữ */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      {/* Khối chứa toàn bộ form đăng nhập */}
      <div className="relative z-10 max-w-md w-full">
        
        {/* Header card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white mb-3 shadow-lg border border-white/20">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Đăng nhập HostelHub
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Chào mừng bạn quay trở lại nền tảng phòng trọ sinh viên
          </p>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl p-4 mb-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              ĐĂNG NHẬP NHANH TÀI KHOẢN MẪU (1-CLICK)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('SinhVien')}
              className="px-2.5 py-2 text-xs font-medium bg-white hover:bg-blue-600 hover:text-white text-blue-800 rounded-xl border border-blue-200 shadow-xs transition-all flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <span className="font-semibold">🎓 Sinh viên</span>
              <span className="text-[10px] text-slate-500 group-hover:text-blue-100 font-mono">123456</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ChuTro')}
              className="px-2.5 py-2 text-xs font-medium bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-xl border border-emerald-200 shadow-xs transition-all flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <span className="font-semibold">🏢 Chủ trọ</span>
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-100 font-mono">123456</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Admin')}
              className="px-2.5 py-2 text-xs font-medium bg-white hover:bg-purple-600 hover:text-white text-purple-800 rounded-xl border border-purple-200 shadow-xs transition-all flex flex-col items-center gap-0.5 group cursor-pointer"
            >
              <span className="font-semibold">⚡ Admin</span>
              <span className="text-[10px] text-slate-500 group-hover:text-purple-100 font-mono">admin123</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa chỉ Email <span className="text-red-500">*</span>
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
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Quên mật khẩu?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Đang xử lý đăng nhập...</span>
              ) : (
                <>
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Bạn chưa có tài khoản trên HostelHub?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Đăng ký tài khoản mới
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
