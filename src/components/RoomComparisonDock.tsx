import React, { useState } from 'react';
import { useComparison } from '../context/ComparisonContext';
import { ArrowLeftRight, X, Sparkles, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface RoomComparisonDockProps {
  onOpenModal?: () => void;
}

export const RoomComparisonDock: React.FC<RoomComparisonDockProps> = ({ onOpenModal }) => {
  const { comparisonRooms, removeFromComparison, clearComparison, openComparisonModal } = useComparison();
  const [isMinimized, setIsMinimized] = useState(false);

  if (comparisonRooms.length === 0) {
    return null;
  }

  const handleOpenModal = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      openComparisonModal();
    }
  };

  const canCompare = comparisonRooms.length >= 2;

  return (
    <aside
      aria-label="Thanh so sánh phòng trọ"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-none"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-3xl shadow-2xl p-3 sm:p-4 pointer-events-auto transition-all duration-300">
        
        {/* Header bar when minimized or desktop summary */}
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  So sánh phòng trọ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {comparisonRooms.length}/4 phòng
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {canCompare
                  ? 'Sẵn sàng so sánh đặc điểm, giá cả và đánh giá cạnh nhau'
                  : 'Hãy chọn thêm ít nhất 1 phòng nữa để bắt đầu so sánh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canCompare ? (
              <button
                type="button"
                onClick={handleOpenModal}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>So sánh ngay ({comparisonRooms.length})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-3.5 py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-2xl cursor-not-allowed border border-slate-700"
              >
                Chọn thêm 1 phòng nữa
              </button>
            )}

            <button
              type="button"
              onClick={clearComparison}
              title="Xóa tất cả phòng khỏi danh sách so sánh"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer sm:hidden"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Selected Rooms Thumbnails Grid (Visible unless minimized on mobile) */}
        {!isMinimized && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {comparisonRooms.map((room) => {
              const coverImg =
                room.HinhAnh && room.HinhAnh.length > 0
                  ? room.HinhAnh[0]
                  : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80';

              return (
                <div
                  key={room.Id}
                  className="group relative flex items-center gap-2 p-1.5 pr-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-2xl transition-all"
                >
                  <img
                    src={coverImg}
                    alt={room.TieuDe}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80';
                    }}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-200 truncate leading-tight">
                      {room.TieuDe}
                    </p>
                    <p className="text-[10px] font-extrabold text-blue-400 tabular-nums">
                      {room.GiaThue.toLocaleString('vi-VN')} đ/tháng
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromComparison(room.Id);
                    }}
                    title="Xóa phòng này khỏi so sánh"
                    className="w-5 h-5 rounded-full bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Empty placeholder slots up to 4 */}
            {Array.from({ length: 4 - comparisonRooms.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="hidden sm:flex items-center justify-center gap-1.5 p-2 rounded-2xl border border-dashed border-slate-700/70 text-slate-500 text-[11px] font-medium select-none"
              >
                <span>+ Thêm phòng {comparisonRooms.length + idx + 1}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </aside>
  );
};
