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
import { GuideView } from './views/GuideView';
import { RoommateView } from './views/RoommateView';
import { MapView } from './views/MapView';

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
  const isAuthPage = currentView === 'login' || currentView === 'register';
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
        'student-history-appointments',
        'student-history-deposits',
        'student-history-contracts',
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
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} initialTab="appointments" />;

      case 'student-history-appointments':
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} initialTab="appointments" />;

      case 'student-history-deposits':
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} initialTab="deposits" />;

      case 'student-history-contracts':
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} initialTab="contracts" />;

      case 'student-history-transactions':
        return <StudentHistoryView onViewRoom={navigateToRoomDetail} onNavigate={setCurrentView} initialTab="transactions" />;

      case 'guide':
        return <GuideView />;
      case 'roommate':
        return <RoommateView />;

      case 'map':
        return <MapView onSelectRoomDetail={navigateToRoomDetail} />;

      case 'landlord-rooms':
      case 'landlord-inquiries':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab={currentView === 'landlord-inquiries' ? 'appointments' : 'rooms'}
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

      default:
        return <HomeLandingView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white relative">
      {/* Chỉ hiển thị thanh điều hướng Navbar khi KHÔNG PHẢI trang đăng nhập/đăng ký */}
      {!isAuthPage && <Navbar currentView={currentView} setCurrentView={setCurrentView} />}

      {/* Floating Room Comparison Dock & Modal */}
      {!isAuthPage && <RoomComparisonDock onOpenModal={openComparisonModal} />}
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

      {/* Chỉ hiển thị nút Trợ lý AI khi KHÔNG PHẢI trang đăng nhập/đăng ký */}
      {!isAuthPage && (
        <ChatWidget
          onViewRoomDetail={navigateToRoomDetail}
          onNavigate={setCurrentView}
        />
      )}

      <main className="flex-1 flex flex-col justify-center">
        {renderView()}
      </main>

      {/* Chỉ hiển thị chân trang Footer khi KHÔNG PHẢI trang đăng nhập/đăng ký */}
      {!isAuthPage && <Footer onSelectView={setCurrentView} />}
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
