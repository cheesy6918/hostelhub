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
import { DistrictRoomListView } from './views/DistrictRoomListView';

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
// 1. Lưu và khôi phục view hiện tại (tránh bị reset khi Provider re-render)
  const [currentView, setCurrentView] = useState<string>(() => {
    return localStorage.getItem('hostelhub_current_view') || 'home';
  });

  useEffect(() => {
    localStorage.setItem('hostelhub_current_view', currentView);
  }, [currentView]);

  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Quận Cầu Giấy');
  const [roomsData, setRoomsData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRoomsData(data.data);
        }
      })
      .catch(() => { });
  }, []);

  const isAuthPage = currentView === 'login' || currentView === 'register';

  // 2. Lưu và khôi phục ID phòng đang xem
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(() => {
    return localStorage.getItem('hostelhub_selected_room_id') || null;
  });

  const [previousView, setPreviousView] = useState<string>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<string>('Tất cả bài viết');

  const handleNavigateGuideCategory = (categoryName: string) => {
    setSelectedGuideCategory(categoryName);
    setSelectedArticleId(null);
    setCurrentView('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFromHome = (view: string, param?: string) => {
    if (view === 'room-detail' && param) {
      navigateToRoomDetail(param);
      return;
    }
    setCurrentView(view);
    if (view === 'guide') {
      setSelectedArticleId(param || null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateDistrict = (districtName: string) => {
    setSelectedDistrictName(districtName);
    setCurrentView('district-rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    localStorage.setItem('hostelhub_selected_room_id', roomId);
    setPreviousView(currentView);
    setCurrentView('room-detail');
  };

  // Auto-redirect if logged in and on login/register
  // Auto-redirect if logged in and on login/register or home
  useEffect(() => {
    if (!loading && user) {
      if (currentView === 'login' || currentView === 'register') {
        if (user.VaiTro === 'SinhVien') setCurrentView('home');
        else if (user.VaiTro === 'ChuTro') setCurrentView('landlord-rooms');
        else if (user.VaiTro === 'Admin') setCurrentView('admin-dashboard');
      }

      // Chặn Chủ trọ và Admin vào trang Home tìm kiếm phòng
      if (currentView === 'home') {
        if (user.VaiTro === 'ChuTro') setCurrentView('landlord-rooms');
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
  }, [user, loading, currentView]);

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

      case 'district-rooms':
        return (
          <DistrictRoomListView
            district={selectedDistrictName}
            rooms={roomsData}
            onSelectRoom={navigateToRoomDetail}
            onNavigateDistrict={(districtName) => {
              setSelectedDistrictName(districtName);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => setCurrentView('home')}
          />
        );

      case 'home':
        if (user?.VaiTro === 'ChuTro') {
          return (
            <LandlordManageView
              onNavigateToCreate={() => setCurrentView('landlord-create-room')}
              onViewRoomDetail={navigateToRoomDetail}
              initialTab="rooms"
            />
          );
        }
        // 👉 TRUYỀN THÊM onSelectRoom vào HomeLandingView:
        return (
          <HomeLandingView
            onNavigate={handleNavigateFromHome}
            onSelectRoom={navigateToRoomDetail}
          />
        );

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
        return (
          <GuideView
            initialArticleId={selectedArticleId}
            onClearInitialArticle={() => setSelectedArticleId(null)}
            initialCategory={selectedGuideCategory}
          />
        );
      case 'roommate':
        return <RoommateView onNavigate={setCurrentView} />;

      case 'map':
        return <MapView onSelectRoomDetail={navigateToRoomDetail} />;

      case 'landlord-rooms':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab="rooms"
          />
        );
      case 'landlord-contracts':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab="contracts"
          />
        );
      case 'landlord-appointments':
      case 'landlord-inquiries':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab="appointments"
          />
        );
      case 'landlord-deposits':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab="deposits"
          />
        );
      case 'landlord-messages':
        return (
          <LandlordManageView
            onNavigateToCreate={() => setCurrentView('landlord-create-room')}
            onViewRoomDetail={navigateToRoomDetail}
            initialTab="inquiries"
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
      {!isAuthPage && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onSelectDistrict={handleNavigateDistrict}
          onSelectGuideCategory={handleNavigateGuideCategory}
        />
      )}

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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white text-xs font-semibold rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chỉ hiển thị nút Trợ lý AI cho Sinh viên hoặc khách chưa đăng nhập, ẩn với Chủ trọ */}
      {!isAuthPage && user?.VaiTro !== 'ChuTro' && (
        <ChatWidget
          onViewRoomDetail={navigateToRoomDetail}
          onNavigate={setCurrentView}
        />
      )}

      <main className="flex-1 flex flex-col justify-center">
        {renderView()}
      </main>

      {/* Chỉ hiển thị chân trang Footer khi KHÔNG PHẢI trang đăng nhập/đăng ký VÀ KHÔNG PHẢI Chủ trọ */}
      {!isAuthPage && user?.VaiTro !== 'ChuTro' && <Footer onSelectView={setCurrentView} />}
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
