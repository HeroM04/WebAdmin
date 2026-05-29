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

const MainAppContent = () => {
  const { theme, isAuthenticated, currentUser, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'ADMIN' ? 'dashboard' : 'manage_attendance');
  const hasInitializedTab = React.useRef(false);

  const { defaultAlgorithm, darkAlgorithm } = antdTheme;

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'VAN_PHONG') {
        logout();
        message.error('Bạn không có quyền truy cập vào trang Quản trị này!');
      } else if (!hasInitializedTab.current) {
        // Automatically switch to default tab based on role upon login (only once)
        setActiveTab(currentUser.role === 'ADMIN' ? 'dashboard' : 'manage_attendance');
        hasInitializedTab.current = true;
      }
    } else {
      hasInitializedTab.current = false;
    }
  }, [isAuthenticated, currentUser, logout]);

  if (!isAuthenticated) {
    return <Login />;
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
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'personnel' && currentUser?.role === 'ADMIN' && <Personnel />}
        {activeTab === 'manage_attendance' && <ManageAttendance />}
        {activeTab === 'manage_meetings' && <ManageMeetings />}
        {activeTab === 'manage_posts' && <ManagePosts />}
        {activeTab === 'manage_training' && <ManageTraining />}
        {activeTab === 'manage_deals' && <ManageDeals />}
        {activeTab === 'feedback' && <Feedback />}
        {activeTab === 'departments' && currentUser?.role === 'ADMIN' && <Departments />}
        {activeTab === 'manage_kpi' && <ManageKPI />}
      </AppLayout>
    </ConfigProvider>
  );
};

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
