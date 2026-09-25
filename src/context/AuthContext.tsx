import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, VaiTro } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string; role?: VaiTro }>;
  register: (payload: {
    HoTen: string;
    Email: string;
    MatKhau: string;
    Sdt: string;
    VaiTro: 'SinhVien' | 'ChuTro';
  }) => Promise<{ success: boolean; message: string; role?: VaiTro }>;
  logout: () => void;
  updateProfile: (data: { HoTen?: string; Sdt?: string; MatKhauCu?: string; MatKhauMoi?: string }) => Promise<{ success: boolean; message: string }>;
  topupWallet: (amount: number) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'hostelhub_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
      } else {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, MatKhau: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message, role: data.user.VaiTro };
      } else {
        return { success: false, message: data.message || 'Đăng nhập thất bại.' };
      }
    } catch {
      return { success: false, message: 'Lỗi kết nối máy chủ. Vui lòng thử lại.' };
    }
  };

  const register = async (payload: {
    HoTen: string;
    Email: string;
    MatKhau: string;
    Sdt: string;
    VaiTro: 'SinhVien' | 'ChuTro';
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message, role: data.user.VaiTro };
      } else {
        return { success: false, message: data.message || 'Đăng ký thất bại.' };
      }
    } catch {
      return { success: false, message: 'Lỗi kết nối đến máy chủ. Vui lòng thử lại.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { HoTen?: string; Sdt?: string; MatKhauCu?: string; MatKhauMoi?: string }) => {
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      } else {
        return { success: false, message: resData.message || 'Không thể cập nhật hồ sơ.' };
      }
    } catch {
      return { success: false, message: 'Lỗi kết nối mạng.' };
    }
  };

  const topupWallet = async (amount: number) => {
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch('/api/auth/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      } else {
        return { success: false, message: resData.message || 'Lỗi nạp tiền.' };
      }
    } catch {
      return { success: false, message: 'Lỗi nạp tiền ví.' };
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        topupWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
