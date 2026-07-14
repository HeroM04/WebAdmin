import React, { useContext } from 'react';
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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

const RootEntry = () => {
  const { isAuthenticated, currentUser } = useContext(AppContext);
  if (isAuthenticated && currentUser) {
    return <Navigate to="/admin/cham-cong" replace />;
  }
  return <Login />;
};

const MainAppContent = () => {
  const { defaultAlgorithm } = antdTheme;

  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorPrimary: '#10b981',
          colorLink: '#10b981',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          colorBgBase: '#f8fafc',
          colorBgContainer: '#ffffff',
          colorBorder: '#e2e8f0'
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
            colorHeaderBg: '#f1f5f9',
            colorHeaderColor: '#475569'
          },
          Tabs: {
            colorBorderSecondary: 'transparent'
          }
        }
      }}
    >
      <Routes>
        {/* ĐĂNG NHẬP */}
        <Route path="/" element={<RootEntry />} />

        {/* KHU VỰC QUẢN TRỊ - WEBADMIN */}
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
        <MainAppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
