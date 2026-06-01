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
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const MainAppContent = () => {
  const { theme, isAuthenticated, currentUser, logout } = useContext(AppContext);
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'VAN_PHONG') {
        logout();
        message.error('Bạn không có quyền truy cập vào trang Quản trị này!');
      } else if (window.location.pathname === '/' || window.location.pathname === '/login') {
        navigate(currentUser.role === 'ADMIN' ? '/dashboard' : '/cham-cong');
      }
    }
  }, [isAuthenticated, currentUser, logout, navigate]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

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
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nhan-su" element={currentUser?.role === 'ADMIN' ? <Personnel /> : <Navigate to="/cham-cong" />} />
          <Route path="/cham-cong" element={<ManageAttendance />} />
          <Route path="/thuc-chien" element={<ManageMeetings />} />
          <Route path="/lan-toa" element={<ManagePosts />} />
          <Route path="/dao-tao" element={<ManageTraining />} />
          <Route path="/chot-can" element={<ManageDeals />} />
          <Route path="/gop-y" element={<Feedback />} />
          <Route path="/vinh-danh" element={<Leaderboard />} />
          <Route path="/phong-ban" element={currentUser?.role === 'ADMIN' ? <Departments /> : <Navigate to="/cham-cong" />} />
          <Route path="/kpi" element={<ManageKPI />} />
          <Route path="*" element={<Navigate to={currentUser?.role === 'ADMIN' ? "/dashboard" : "/cham-cong"} replace />} />
        </Routes>
      </AppLayout>
    </ConfigProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
