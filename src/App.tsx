import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { ComparisonProvider, useComparison } from './context/ComparisonContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoomComparisonDock } from './components/RoomComparisonDock';
import { RoomComparisonModal } from './components/RoomComparisonModal';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { StudentFindRoomView } from './views/StudentFindRoomView';
import { LandlordManageView } from './views/LandlordManageView';
import { LandlordCreateRoomView } from './views/LandlordCreateRoomView';
import { RoomDetailView } from './views/RoomDetailView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { ProfileView } from './views/ProfileView';
import { HomeLandingView } from './views/HomeLandingView';
import { StudentHistoryView } from './views/StudentHistoryView';
import { NotificationsView } from './views/NotificationsView';
import { ChatWidget } from './components/ChatWidget';
import { Heart, CheckCircle2, ArrowLeftRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { toastMessage, clearToast } = useFavorites();
  const {
    isComparisonModalOpen,
    closeComparisonModal,
    openComparisonModal,
    compareToast,
    clearCompareToast
  } = useComparison();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<string>('home');

  const navigateToRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    setPreviousView(currentView);
    setCurrentView('room-detail');
  };

  // Auto-redirect if logged in and on home/login/register
  useEffect(() => {
    if (!loading && user) {
      if (currentView === 'home' || currentView === 'login' || currentView === 'register') {
        if (user.VaiTro === 'SinhVien') setCurrentView('student-rooms');
        else if (user.VaiTro === 'ChuTro') setCurrentView('landlord-rooms');
        else if (user.VaiTro === 'Admin') setCurrentView('admin-dashboard');
      }
    } else if (!loading && !user) {
      // If logged out and on protected view, go to login
      const protectedViews = [
        'student-rooms',
        'student-favorites',
        'student-inquiries',
        'student-history',
        'landlord-rooms',
        'landlord-create-room',
        'landlord-inquiries',
        'admin-dashboard',
        'admin-users',
        'admin-rooms',
        'profile',
        'notifications',
      ];
      if (protectedViews.includes(currentView)) {
        setCurrentView('login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Đang khởi tạo HostelHub...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeLandingView onNavigate={setCurrentView} />;
      
      case 'find-rooms-public':
      case 'student-rooms':
      case 'student-inquiries':
        return <StudentFindRoomView onSelectRoomDetail={navigateToRoomDetail} />;

      case 'student-favorites':
        return <StudentFindRoomView onSelectRoomDetail={navigateToRoomDetail} initialTab="favorites" />;

      case 'student-history':
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} />;

      case 'landlord-rooms':
      case 'landlord-inquiries':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
          />
        );

      case 'landlord-create-room':
        return (
          <LandlordCreateRoomView
            onBack={() => setCurrentView('landlord-rooms')}
            onSuccess={() => setCurrentView('landlord-rooms')}
          />
        );

      case 'room-detail':
        return selectedRoomId ? (
          <RoomDetailView
            roomId={selectedRoomId}
            onBack={() => setCurrentView(previousView || (user?.VaiTro === 'ChuTro' ? 'landlord-rooms' : 'student-rooms'))}
            onNavigate={setCurrentView}
          />
        ) : (
          <StudentFindRoomView onSelectRoomDetail={navigateToRoomDetail} />
        );

      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-rooms':
        return <AdminDashboardView onViewRoomDetail={navigateToRoomDetail} />;

      case 'profile':
        return <ProfileView />;

      case 'notifications':
        return <NotificationsView onNavigate={setCurrentView} onViewRoomDetail={navigateToRoomDetail} />;

      case 'login':
        return <LoginView onNavigate={setCurrentView} />;

      case 'register':
        return <RegisterView onNavigate={setCurrentView} />;

      case 'about':
        return (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
              <h1 className="text-2xl font-bold text-slate-900">Về nền tảng HostelHub</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                HostelHub là hệ thống công nghệ kết nối trực tiếp sinh viên và chủ nhà trọ tại các khu vực làng đại học trọng điểm trên toàn quốc. Sứ mệnh của chúng tôi là xóa bỏ vấn nạn lừa đảo tiền cọc, chèo kéo giá ảo và môi giới trung gian bất hợp pháp.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <div className="font-bold text-blue-900 text-sm">Xác thực chính chủ</div>
                  <p className="text-xs text-slate-500 mt-1">100% tin đăng được kiểm duyệt số điện thoại và địa chỉ thực tế.</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <div className="font-bold text-emerald-900 text-sm">Ví cọc bảo đảm</div>
                  <p className="text-xs text-slate-500 mt-1">Sinh viên được bảo lưu tiền cọc cho tới khi kiểm tra phòng ưng ý.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl">
                  <div className="font-bold text-purple-900 text-sm">Miễn phí hoàn toàn</div>
                  <p className="text-xs text-slate-500 mt-1">Không thu bất kỳ phụ phí dịch vụ nào từ phía sinh viên.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setCurrentView(user ? (user.VaiTro === 'ChuTro' ? 'landlord-rooms' : 'student-rooms') : 'login')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700"
                >
                  Bắt đầu trải nghiệm ngay
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <HomeLandingView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white relative">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Floating Room Comparison Dock */}
      <RoomComparisonDock onOpenModal={openComparisonModal} />

      {/* Side-by-Side Room Comparison Modal */}
      <RoomComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
        onSelectRoomDetail={navigateToRoomDetail}
      />

      {/* Global Toast for Comparison */}
      {compareToast && (
        <div className="fixed bottom-24 sm:bottom-28 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/60 animate-in fade-in slide-in-from-bottom-5">
          <ArrowLeftRight className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{compareToast}</span>
          <button
            type="button"
            onClick={clearCompareToast}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Toast for Favorites & Quick actions */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-24 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/60 animate-in fade-in slide-in-from-bottom-5">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={clearToast}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating AI Chatbot Assistant Widget */}
      <ChatWidget
        onViewRoomDetail={navigateToRoomDetail}
        onNavigate={setCurrentView}
      />

      <main className="flex-1">
        {renderView()}
      </main>
      <Footer onSelectView={setCurrentView} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <ComparisonProvider>
            <MainContent />
          </ComparisonProvider>
        </FavoritesProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
