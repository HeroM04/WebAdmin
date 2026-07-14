import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Select, Badge, Popover, List, Avatar, Space, Tooltip } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  QrcodeOutlined,
  MessageOutlined,
  BulbOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  PoweroffOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FileImageOutlined,
  HomeOutlined,
  BookOutlined,
  BankOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Header, Sider, Content, Footer } = Layout;

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    deals, attendance, posts, meetings, feedbacks,
    theme, setTheme, currentUser, users, resetAllData, logout
  } = useContext(AppContext);

  const routeMap = {
    '/admin/dashboard': 'dashboard',
    '/admin/nhan-su': 'personnel',
    '/admin/cham-cong': 'manage_attendance',
    '/admin/thuc-chien': 'manage_meetings',
    '/admin/lan-toa': 'manage_posts',
    '/admin/dao-tao': 'manage_training',
    '/admin/chot-can': 'manage_deals',
    '/admin/gop-y': 'feedback',
    '/admin/phong-ban': 'departments',
    '/admin/kpi': 'manage_kpi',
    '/admin/vinh-danh': 'leaderboard',
  };

  const activeTab = routeMap[location.pathname] || 'dashboard';

  const handleMenuClick = ({ key }) => {
    const pathToNavigate = Object.keys(routeMap).find(path => routeMap[path] === key);
    if (pathToNavigate) {
      navigate(pathToNavigate);
    }
  };

  const [notiVisible, setNotiVisible] = useState(false);

  const pendingAttendance = attendance.filter(a => a.status === 'PENDING').length;
  const pendingDeals = deals.filter(d => d.status === 'PENDING').length;
  const pendingPosts = posts.filter(p => p.status === 'PENDING').length;
  const pendingMeetings = meetings.filter(m => m.status === 'PENDING').length;
  const totalPending = pendingAttendance + pendingDeals + pendingPosts + pendingMeetings;
  const pendingFeedbacks = feedbacks.filter(f => f.status === 'PENDING' || f.status === 'UNREAD').length;

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUserChange = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const getNotifications = () => {
    const list = [];
    
    deals.filter(d => d.status === 'PENDING').forEach(d => {
      const agent = users.find(u => u.id === d.userId)?.name || 'Nhân viên';
      list.push({
        id: d.id,
        title: `Deal mới cần duyệt - ${d.projectName}`,
        desc: `${agent} vừa chốt deal ${d.price.toLocaleString('vi-VN')} đ`,
        type: 'deal',
        time: new Date(d.submittedAt)
      });
    });

    attendance.filter(a => a.status === 'PENDING').forEach(a => {
      const agent = users.find(u => u.id === a.userId)?.name || 'Nhân viên';
      list.push({
        id: a.id,
        title: `Chấm công ngoại tuyến mới`,
        desc: `${agent} yêu cầu duyệt chấm công lúc ${new Date(a.checkinTime).toLocaleTimeString('vi-VN')}`,
        type: 'att',
        time: new Date(a.checkinTime)
      });
    });
    

    posts.filter(p => p.status === 'PENDING').forEach(p => {
      const agent = users.find(u => u.id === p.userId)?.name || 'Nhân viên';
      list.push({
        id: p.id,
        title: `Bài đăng lan tỏa BĐS mới`,
        desc: `${agent} chia sẻ bài đăng trên ${p.platform}`,
        type: 'post',
        time: new Date(p.submittedAt)
      });
    });

    meetings.filter(m => m.status === 'PENDING').forEach(m => {
      const agent = users.find(u => u.id === m.userId)?.name || 'Nhân viên';
      list.push({
        id: m.id,
        title: `Báo cáo thực chiến mới`,
        desc: `${agent} báo cáo cuộc gặp khách hàng ${m.clientName}`,
        type: 'meet',
        time: new Date(m.submittedAt)
      });
    });

    return list.sort((a, b) => b.time - a.time);
  };

  const notifications = getNotifications();

  const PAGE_TITLES = {
    dashboard: 'Tổng quan Dashboard KPI',
    personnel: 'Quản lý Nhân sự',
    manage_attendance: 'Quản lý Danh sách Chấm công',
    manage_meetings: 'Quản lý Danh sách Thực chiến',
    manage_posts: 'Quản lý Danh sách Bài đăng',
    manage_training: 'Quản lý Danh sách Đào tạo',
    manage_deals: 'Quản lý Danh sách Chốt căn',
    feedback: 'Ý kiến & Góp ý Nhân sự',
    salary_estimator: 'Dự toán Lương',
    departments: 'Quản lý Phòng ban',
    manage_kpi: 'Chấm KPI & Hậu kiểm',
    leaderboard: 'Bảng Vinh Danh',
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Tổng quan Dashboard</Link>
    },
    ...(currentUser?.role === 'ADMIN' ? [
      {
        key: 'personnel',
        icon: <TeamOutlined />,
        label: <Link to="/admin/nhan-su">Quản lý Nhân sự</Link>
      },
      {
        key: 'departments',
        icon: <BankOutlined />,
        label: <Link to="/admin/phong-ban">Quản lý Phòng ban</Link>
      }
    ] : []),
    {
      type: 'group',
      label: (
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
          TÍNH NĂNG KPI
        </span>
      ),
      children: [
        {
          key: 'manage_attendance',
          icon: (
            <Badge count={pendingAttendance} size="small" offset={[8, 0]}>
              <ClockCircleOutlined style={{ color: pendingAttendance > 0 ? '#fbbf24' : 'inherit' }} />
            </Badge>
          ),
          label: 'Chấm công'
        },
        {
          key: 'manage_meetings',
          icon: (
            <Badge count={pendingMeetings} size="small" offset={[8, 0]}>
              <SolutionOutlined style={{ color: pendingMeetings > 0 ? '#fbbf24' : 'inherit' }} />
            </Badge>
          ),
          label: 'Thực chiến'
        },
        {
          key: 'manage_posts',
          icon: (
            <Badge count={pendingPosts} size="small" offset={[8, 0]}>
              <FileImageOutlined style={{ color: pendingPosts > 0 ? '#fbbf24' : 'inherit' }} />
            </Badge>
          ),
          label: 'Bài đăng'
        },
        {
          key: 'manage_training',
          icon: <BookOutlined />,
          label: 'Đào tạo'
        },
        {
          key: 'manage_deals',
          icon: (
            <Badge count={pendingDeals} size="small" offset={[8, 0]}>
              <HomeOutlined style={{ color: pendingDeals > 0 ? '#fbbf24' : 'inherit' }} />
            </Badge>
          ),
          label: 'Chốt căn'
        },
        {
          key: 'manage_kpi',
          icon: <TrophyOutlined />,
          label: 'Chấm KPI'
        },
        {
          key: 'feedback',
          icon: (
            <Badge count={pendingFeedbacks} size="small" offset={[8, 0]}>
              <MessageOutlined style={{ color: pendingFeedbacks > 0 ? '#fbbf24' : 'inherit' }} />
            </Badge>
          ),
          label: <Link to="/admin/gop-y">Góp ý Nhân sự</Link>
        },
        {
          key: 'leaderboard',
          icon: <TrophyOutlined style={{ color: '#fbbf24' }} />,
          label: <Link to="/admin/vinh-danh">Bảng vinh danh</Link>
        }
      ]
    },
  ];

  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';
  const filteredMenuItems = isAdmin 
    ? menuItems 
    : menuItems.filter(item => item.type === 'group');

  const notificationContent = (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '8px 16px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Thông báo ({notifications.length})</span>
        {notifications.length > 0 && (
          <span style={{ color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer' }} onClick={() => navigate('/admin/cham-cong')}>
            Xem ngay
          </span>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Không có thông báo chờ duyệt mới.
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item 
              style={{ cursor: 'pointer', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}
              onClick={() => {
                const tabMap = { deal: '/admin/chot-can', att: '/admin/cham-cong', post: '/admin/lan-toa', meet: '/admin/thuc-chien' };
                navigate(tabMap[item.type] || '/admin/dashboard');
                setNotiVisible(false);
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: item.type === 'deal' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                      color: item.type === 'deal' ? 'var(--success-color)' : 'var(--info-color)'
                    }} 
                    icon={item.type === 'deal' ? <HomeOutlined /> : <BellOutlined />} 
                  />
                }
                title={<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>}
                description={<span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.desc}</span>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="dark" style={{ borderRight: '1px solid var(--border-color)', position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 100, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border-color)', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Sale Hub" style={{ height: 40, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; document.getElementById('sidebar-fallback-logo').style.display = 'block'; }} />
          <div id="sidebar-fallback-logo" style={{ display: 'none', color: '#fbbf24', fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
            SALE <span style={{ color: 'var(--text-primary)' }}>HUB</span>
          </div>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          items={filteredMenuItems}
          style={{ marginTop: 8, paddingBottom: 80, background: 'transparent' }}
        />
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header style={{ 
          height: 64, position: 'sticky', top: 0, zIndex: 99, 
          width: '100%', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', padding: '0 24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {PAGE_TITLES[activeTab] || 'Sale Hub Admin'}
            </h2>
            {totalPending > 0 && (
              <Badge 
                count={`${totalPending} chờ duyệt`} 
                style={{ backgroundColor: 'var(--warning-color)', fontSize: '11px' }} 
              />
            )}
          </div>

          <Space size="middle">
            <Tooltip title="Khởi động lại dữ liệu mẫu">
              <Button 
                type="text" 
                icon={<ReloadOutlined style={{ color: 'var(--text-secondary)' }} />} 
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu hệ thống về trạng thái ban đầu?')) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
              />
            </Tooltip>


            <Popover
              content={notificationContent}
              trigger="click"
              open={notiVisible}
              onOpenChange={setNotiVisible}
              placement="bottomRight"
            >
              <Badge count={totalPending} size="small" style={{ backgroundColor: 'var(--warning-color)' }}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 18, color: 'var(--text-primary)' }} />}
                />
              </Badge>
            </Popover>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, paddingLeft: 16, borderLeft: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</span>
              <Button 
                type="primary" 
                danger 
                icon={<PoweroffOutlined />} 
                onClick={logout}
                style={{ borderRadius: 8, marginLeft: 8 }}
              >
                Đăng xuất
              </Button>
            </div>
          </Space>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px - 62px)', overflowY: 'auto' }}>
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: 'var(--bg-container)', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
          Sale Hub Admin ©{new Date().getFullYear()} - Hệ thống Quản lý Bất động sản
        </Footer>
      </Layout>
    </Layout>
  );
};
