import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Sync to localStorage
  const saveToLocalStorage = (ids: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
  };

  // Fetch full details of favorite rooms
  const refreshFavorites = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setFavoriteRoomIds(data.roomIds || []);
          setFavoriteRooms(data.rooms || []);
          saveToLocalStorage(data.roomIds || []);
          return;
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    // Fallback if not logged in or server fails: fetch rooms matching favoriteRoomIds
    if (favoriteRoomIds.length > 0) {
      try {
        setLoading(true);
        const res = await fetch('/api/rooms');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const matched = data.data.filter((r: Room) => favoriteRoomIds.includes(r.Id));
          setFavoriteRooms(matched);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    } else {
      setFavoriteRooms([]);
    }
  }, [token, favoriteRoomIds]);

  // Load favorites when user / token changes
  useEffect(() => {
    refreshFavorites();
  }, [token, user]);

  const isFavorite = useCallback(
    (roomId: string) => {
      return favoriteRoomIds.includes(roomId);
    },
    [favoriteRoomIds]
  );

  // Toggle favorite
  const toggleFavorite = async (roomId: string, roomData?: Room): Promise<{ isFavorite: boolean; message: string }> => {
    const currentlyFav = favoriteRoomIds.includes(roomId);
    const nextFavState = !currentlyFav;

    let updatedIds: string[];
    if (currentlyFav) {
      updatedIds = favoriteRoomIds.filter((id) => id !== roomId);
      setFavoriteRooms((prev) => prev.filter((r) => r.Id !== roomId));
    } else {
      updatedIds = [roomId, ...favoriteRoomIds];
      if (roomData) {
        setFavoriteRooms((prev) => [roomData, ...prev.filter((r) => r.Id !== roomId)]);
      }
    }

    setFavoriteRoomIds(updatedIds);
    saveToLocalStorage(updatedIds);

    let message = nextFavState ? 'Đã lưu phòng vào mục yêu thích!' : 'Đã xóa phòng khỏi mục yêu thích.';

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
        if (data.success) {
          if (data.message) message = data.message;
          if (Array.isArray(data.roomIds)) {
            setFavoriteRoomIds(data.roomIds);
            saveToLocalStorage(data.roomIds);
          }
        }
      } catch {
        // optimistic update already done
      }
    }

    showToast(message);
    return { isFavorite: nextFavState, message };
  };

  // Remove specific favorite
  const removeFavorite = async (roomId: string) => {
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
  };

  // Clear all favorites
  const clearAllFavorites = async () => {
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
  };

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
