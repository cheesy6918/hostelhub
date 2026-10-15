import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Room } from '../types';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteRoomIds: string[];
  favoriteRooms: Room[];
  loading: boolean;
  isFavorite: (roomId: string) => boolean;
  toggleFavorite: (roomId: string, roomData?: Room) => Promise<{ isFavorite: boolean; message: string }>;
  removeFavorite: (roomId: string) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  toastMessage: string | null;
  clearToast: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'hostelhub_favorite_room_ids';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [favoriteRoomIds, setFavoriteRoomIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<any>(null);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Lưu đồng bộ vào localStorage
  const saveToLocalStorage = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  // Tải danh sách phòng yêu thích
  const refreshFavorites = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const ids = data.roomIds || [];
          setFavoriteRoomIds(ids);
          setFavoriteRooms(data.rooms || []);
          saveToLocalStorage(ids);
          return;
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    // Fallback: nếu không có token hoặc offline
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedIds: string[] = stored ? JSON.parse(stored) : [];
      if (storedIds.length > 0) {
        setLoading(true);
        const res = await fetch('/api/rooms');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const matched = data.data.filter((r: Room) => storedIds.includes(r.Id));
          setFavoriteRooms(matched);
        }
      } else {
        setFavoriteRooms([]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, saveToLocalStorage]);

  // Chỉ fetch 1 lần khi đăng nhập/đổi token
  useEffect(() => {
    refreshFavorites();
  }, [token]);

  const isFavorite = useCallback(
    (roomId: string) => {
      return favoriteRoomIds.includes(roomId);
    },
    [favoriteRoomIds]
  );

  // Thêm / Bỏ yêu thích phòng (Optimistic Update chuẩn không gây crash view)
  const toggleFavorite = useCallback(
    async (roomId: string, roomData?: Room): Promise<{ isFavorite: boolean; message: string }> => {
      const currentlyFav = favoriteRoomIds.includes(roomId);
      const nextFavState = !currentlyFav;

      const updatedIds = currentlyFav
        ? favoriteRoomIds.filter((id) => id !== roomId)
        : [roomId, ...favoriteRoomIds];

      setFavoriteRoomIds(updatedIds);
      saveToLocalStorage(updatedIds);

      if (currentlyFav) {
        setFavoriteRooms((prev) => prev.filter((r) => r.Id !== roomId));
      } else if (roomData) {
        setFavoriteRooms((prev) => [roomData, ...prev.filter((r) => r.Id !== roomId)]);
      }

      const message = nextFavState ? 'Đã lưu phòng vào mục yêu thích!' : 'Đã xóa phòng khỏi mục yêu thích.';

      if (token) {
        try {
          const res = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roomId }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.roomIds)) {
            setFavoriteRoomIds(data.roomIds);
            saveToLocalStorage(data.roomIds);
          }
        } catch {
          // ignore
        }
      }

      showToast(message);
      return { isFavorite: nextFavState, message };
    },
    [favoriteRoomIds, token, saveToLocalStorage, showToast]
  );

  // Bỏ lưu 1 phòng cụ thể
  const removeFavorite = useCallback(
    async (roomId: string) => {
      const updatedIds = favoriteRoomIds.filter((id) => id !== roomId);
      setFavoriteRoomIds(updatedIds);
      setFavoriteRooms((prev) => prev.filter((r) => r.Id !== roomId));
      saveToLocalStorage(updatedIds);
      showToast('Đã xóa phòng khỏi mục yêu thích.');

      if (token) {
        try {
          await fetch(`/api/favorites/${roomId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // ignore
        }
      }
    },
    [favoriteRoomIds, token, saveToLocalStorage, showToast]
  );

  // Xóa toàn bộ phòng yêu thích
  const clearAllFavorites = useCallback(async () => {
    setFavoriteRoomIds([]);
    setFavoriteRooms([]);
    saveToLocalStorage([]);
    showToast('Đã xóa toàn bộ danh sách phòng yêu thích.');

    if (token) {
      try {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
  }, [token, saveToLocalStorage, showToast]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteRoomIds,
        favoriteRooms,
        loading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearAllFavorites,
        refreshFavorites,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};