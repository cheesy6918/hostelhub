import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Room } from '../types';

interface ComparisonContextType {
  comparisonRooms: Room[];
  isComparisonModalOpen: boolean;
  compareToast: string | null;
  addToComparison: (room: Room) => boolean;
  removeFromComparison: (roomId: string) => void;
  toggleComparison: (room: Room) => void;
  isInComparison: (roomId: string) => boolean;
  clearComparison: () => void;
  openComparisonModal: () => void;
  closeComparisonModal: () => void;
  clearCompareToast: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const STORAGE_KEY = 'hostelhub_compare_rooms_v1';
const MAX_COMPARE_ROOMS = 4;

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonRooms, setComparisonRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  const clearCompareToast = useCallback(() => {
    setCompareToast(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    setCompareToast(msg);
    setTimeout(() => {
      setCompareToast((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonRooms));
    } catch {
      // ignore
    }
  }, [comparisonRooms]);

  const isInComparison = useCallback(
    (roomId: string) => {
      return comparisonRooms.some((r) => r.Id === roomId);
    },
    [comparisonRooms]
  );

  const addToComparison = useCallback(
    (room: Room): boolean => {
      if (comparisonRooms.some((r) => r.Id === room.Id)) {
        showToast(`Phòng "${room.TieuDe.substring(0, 28)}..." đã có trong danh sách so sánh`);
        return false;
      }

      if (comparisonRooms.length >= MAX_COMPARE_ROOMS) {
        showToast(`Chỉ có thể so sánh tối đa ${MAX_COMPARE_ROOMS} phòng cùng lúc. Vui lòng bỏ bớt một phòng trước khi thêm mới.`);
        return false;
      }

      const updated = [...comparisonRooms, room];
      setComparisonRooms(updated);
      showToast(`Đã thêm vào so sánh (${updated.length}/${MAX_COMPARE_ROOMS} phòng)`);
      return true;
    },
    [comparisonRooms, showToast]
  );

  const removeFromComparison = useCallback(
    (roomId: string) => {
      setComparisonRooms((prev) => {
        const target = prev.find((r) => r.Id === roomId);
        const filtered = prev.filter((r) => r.Id !== roomId);
        if (target) {
          showToast(`Đã xóa "${target.TieuDe.substring(0, 24)}..." khỏi so sánh`);
        }
        // If 0 rooms left, automatically close modal
        if (filtered.length === 0) {
          setIsComparisonModalOpen(false);
        }
        return filtered;
      });
    },
    [showToast]
  );

  const toggleComparison = useCallback(
    (room: Room) => {
      if (isInComparison(room.Id)) {
        removeFromComparison(room.Id);
      } else {
        addToComparison(room);
      }
    },
    [isInComparison, removeFromComparison, addToComparison]
  );

  const clearComparison = useCallback(() => {
    setComparisonRooms([]);
    setIsComparisonModalOpen(false);
    showToast('Đã xóa tất cả phòng khỏi danh sách so sánh');
  }, [showToast]);

  const openComparisonModal = useCallback(() => {
    if (comparisonRooms.length < 2) {
      showToast('Vui lòng chọn ít nhất 2 phòng để so sánh cạnh nhau');
      return;
    }
    setIsComparisonModalOpen(true);
  }, [comparisonRooms.length, showToast]);

  const closeComparisonModal = useCallback(() => {
    setIsComparisonModalOpen(false);
  }, []);

  return (
    <ComparisonContext.Provider
      value={{
        comparisonRooms,
        isComparisonModalOpen,
        compareToast,
        addToComparison,
        removeFromComparison,
        toggleComparison,
        isInComparison,
        clearComparison,
        openComparisonModal,
        closeComparisonModal,
        clearCompareToast,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
