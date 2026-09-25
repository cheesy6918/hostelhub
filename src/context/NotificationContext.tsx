import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ThongBao } from '../types';

interface CategoryCounts {
  total: number;
  unread: number;
  lichHen: number;
  datCoc: number;
  phongTro: number;
  heThong: number;
}

interface NotificationContextType {
  notifications: ThongBao[];
  unreadCount: number;
  categoryCounts: CategoryCounts;
  loading: boolean;
  isPolling: boolean;
  lastUpdated: Date | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  generateTestNotification: (scenario: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    total: 0,
    unread: 0,
    lichHen: 0,
    datCoc: 0,
    phongTro: 0,
    heThong: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
        if (data.categoryCounts) {
          setCategoryCounts(data.categoryCounts);
        } else {
          const list: ThongBao[] = data.data || [];
          setCategoryCounts({
            total: list.length,
            unread: data.unreadCount || 0,
            lichHen: list.filter((n) => n.Loai === 'LichHen').length,
            datCoc: list.filter((n) => n.Loai === 'DatCoc').length,
            phongTro: list.filter((n) => n.Loai === 'PhongTro').length,
            heThong: list.filter((n) => n.Loai === 'HeThong').length,
          });
        }
        setLastUpdated(new Date());
      }
    } catch {
      // ignore network errors silently in background
    }
  }, [token, user]);

  // Initial load
  useEffect(() => {
    if (token && user) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, user, fetchNotifications]);

  // Real-time polling every 6 seconds
  useEffect(() => {
    if (!token || !user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 6000);
    return () => clearInterval(interval);
  }, [token, user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.Id === id ? { ...n, TrangThai: 'DaDoc' as const } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setCategoryCounts((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }));

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // revert on failure if needed
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, TrangThai: 'DaDoc' as const })));
    setUnreadCount(0);
    setCategoryCounts((prev) => ({ ...prev, unread: 0 }));

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    const target = notifications.find((n) => n.Id === id);
    const wasUnread = target?.TrangThai === 'ChuaDoc';

    // Optimistic UI
    setNotifications((prev) => prev.filter((n) => n.Id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const clearReadNotifications = async () => {
    if (!token) return;
    setNotifications((prev) => prev.filter((n) => n.TrangThai === 'ChuaDoc'));

    try {
      await fetch('/api/notifications/clear-read', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const generateTestNotification = async (scenario: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/test-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scenario }),
      });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        categoryCounts,
        loading,
        isPolling: true,
        lastUpdated,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
        generateTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
