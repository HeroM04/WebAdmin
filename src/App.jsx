import React, { useState, useContext, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme, message } from 'antd';
import { AppProvider, AppContext } from './context/AppContext';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Personnel } from './components/Personnel';
import { ManageAttendance } from './components/ManageAttendance';
import { ManageMeetings } from './components/ManageMeetings';
import { ManagePosts } from './components/ManagePosts';
import { ManageTraining } from './components/ManageTraining';
import { ManageDeals } from './components/ManageDeals';
import { Feedback } from './components/Feedback';
import { Departments } from './components/Departments';
import { ManageKPI } from './components/ManageKPI';
import { Login } from './components/Login';
import Leaderboard from './components/Leaderboard';
import { SaleProPage } from './features/SalePro/SaleProPage';
import { ManageNews } from './features/SalePro/components/ManageNews';
import { ManageEvents } from './features/SalePro/components/ManageEvents';
import { SaleWebHome } from './features/SaleWebPublic/SaleWebHome';
import { SaleWebLayout } from './features/SaleWebPublic/SaleWebLayout';
import { ProjectDetails } from './features/SaleWebPublic/ProjectDetails';
import { ComparePage } from './features/SaleWebPublic/ComparePage';
import { CompareProvider } from './context/CompareContext';
import { LandingPage } from './features/LandingPage/LandingPage';
import { NewsList } from './features/SaleWebPublic/NewsList';
import { NewsDetail } from './features/SaleWebPublic/NewsDetail';
import { EventList } from './features/SaleWebPublic/EventList';
import { EventDetail } from './features/SaleWebPublic/EventDetail';
import { UserProfilePage } from './features/SaleWebPublic/UserProfilePage';
import { SignInPage } from './features/SaleWebPublic/SignInPage';
import { SignUpPage } from './features/SaleWebPublic/SignUpPage';
import { PasswordResetPage } from './features/SaleWebPublic/PasswordResetPage';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useContext(AppContext);
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    message.error('Bạn không có quyền truy cập vào trang này!');
    return <Navigate to="/admin/cham-cong" replace />;
  }
  return children;
};

const MainAppContent = () => {
  const { theme } = useContext(AppContext);
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#10b981',
          colorLink: '#10b981',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          colorBgBase: theme === 'dark' ? '#0b0f19' : '#f8fafc',
          colorBgContainer: theme === 'dark' ? '#151e2e' : '#ffffff',
          colorBorder: theme === 'dark' ? '#1f293d' : '#e2e8f0'
        },
        components: {
          Menu: {
            itemHoverColor: '#10b981',
            itemSelectedColor: '#10b981',
            itemSelectedBg: 'rgba(16, 185, 129, 0.12)',
            darkItemBg: 'transparent',
            darkItemBgSelected: 'rgba(16, 185, 129, 0.15)',
            darkItemText: '#94a3b8',
            darkItemTextSelected: '#10b981',
            darkItemTextHover: '#10b981'
          },
          Table: {
            colorHeaderBg: theme === 'dark' ? '#111827' : '#f1f5f9',
            colorHeaderColor: theme === 'dark' ? '#94a3b8' : '#475569'
          },
          Tabs: {
            colorBorderSecondary: 'transparent'
          }
        }
      }}
    >
      <Routes>
        {/* STANDALONE AUTH ROUTES */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* PUBLIC ROUTES - SALEWEB */}
        <Route path="/" element={<SaleWebLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="projects" element={<SaleWebHome />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id" element={<EventDetail />} />
        </Route>

        {/* PRIVATE ROUTES - WEBADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'VAN_PHONG', 'TRUONG_PHONG', 'NHAN_VIEN']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
          <Route path="nhan-su" element={<ProtectedRoute allowedRoles={['ADMIN']}><Personnel /></ProtectedRoute>} />
          <Route path="cham-cong" element={<ManageAttendance />} />
          <Route path="thuc-chien" element={<ManageMeetings />} />
          <Route path="lan-toa" element={<ManagePosts />} />
          <Route path="dao-tao" element={<ManageTraining />} />
          <Route path="chot-can" element={<ManageDeals />} />
          <Route path="gop-y" element={<Feedback />} />
          <Route path="vinh-danh" element={<Leaderboard />} />
          <Route path="phong-ban" element={<ProtectedRoute allowedRoles={['ADMIN']}><Departments /></ProtectedRoute>} />
          <Route path="kpi" element={<ManageKPI />} />
          <Route path="salepro" element={<ProtectedRoute allowedRoles={['ADMIN', 'TRUONG_PHONG']}><SaleProPage /></ProtectedRoute>} />
          <Route path="tin-tuc" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageNews /></ProtectedRoute>} />
          <Route path="su-kien" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageEvents /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="cham-cong" replace />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CompareProvider>
          <MainAppContent />
        </CompareProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
