import React, { useContext, useEffect, lazy, Suspense } from 'react';
import { ConfigProvider, theme as antdTheme, message, Spin } from 'antd';
import { AppProvider, AppContext } from './context/AppContext';
import { AppLayout } from './components/Layout';
import { Login } from './components/Login';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Mỗi trang tải riêng khi người dùng bấm vào, thay vì gộp hết vào một gói.
// Trước đây toàn bộ web nằm trong một file 2 MB, ai mở lần đầu cũng phải tải
// đủ cả mười trang mới thấy được màn hình đăng nhập.
//
// Trang đăng nhập và khung giao diện vẫn nạp thẳng vì luôn cần tới ngay.
const Dashboard        = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Personnel        = lazy(() => import('./components/Personnel').then(m => ({ default: m.Personnel })));
const ManageAttendance = lazy(() => import('./components/ManageAttendance').then(m => ({ default: m.ManageAttendance })));
const ManageMeetings   = lazy(() => import('./components/ManageMeetings').then(m => ({ default: m.ManageMeetings })));
const ManagePosts      = lazy(() => import('./components/ManagePosts').then(m => ({ default: m.ManagePosts })));
const ManageTraining   = lazy(() => import('./components/ManageTraining').then(m => ({ default: m.ManageTraining })));
const ManageDeals      = lazy(() => import('./components/ManageDeals').then(m => ({ default: m.ManageDeals })));
const Feedback         = lazy(() => import('./components/Feedback').then(m => ({ default: m.Feedback })));
const Departments      = lazy(() => import('./components/Departments').then(m => ({ default: m.Departments })));
const ManageKPI        = lazy(() => import('./components/ManageKPI').then(m => ({ default: m.ManageKPI })));
const Leaderboard      = lazy(() => import('./components/Leaderboard'));

/** Hiện trong lúc trang đang được tải về lần đầu. */
const DangTai = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
    <Spin size="large" tip="Đang tải trang..." />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useContext(AppContext);
  const thieuQuyen = isAuthenticated && currentUser
    && allowedRoles && !allowedRoles.includes(currentUser.role);

  // Báo lỗi phải nằm trong useEffect, không được gọi khi đang dựng giao diện:
  // message.error() làm đổi trạng thái của antd ngay giữa lượt render, React
  // coi đó là lỗi và nếu việc chuyển hướng lại quay về đúng route bị chặn thì
  // thành vòng lặp bắn ra hàng nghìn thông báo.
  useEffect(() => {
    if (thieuQuyen) message.error('Bạn không có quyền truy cập vào trang này!');
  }, [thieuQuyen]);

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }
  if (thieuQuyen) {
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
      <Suspense fallback={<DangTai />}>
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
      </Suspense>
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
