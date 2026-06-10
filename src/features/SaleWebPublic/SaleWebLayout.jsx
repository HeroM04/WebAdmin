import React, { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { CompareContext } from '../../context/CompareContext';
import '../../SaleWeb.css';
import { Modal, Form, Input, Button, message, Badge, Dropdown, Avatar } from 'antd';
import { 
  MailOutlined, PhoneOutlined, EnvironmentOutlined, FacebookFilled, YoutubeFilled, TikTokOutlined, ArrowUpOutlined,
  MessageOutlined, BellOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HeartOutlined, CommentOutlined, LogoutOutlined
} from '@ant-design/icons';

export const SaleWebLayout = () => {
  const { currentUser, isAuthenticated, loginPublic, logout } = useContext(AppContext);
  const { compareList } = useContext(CompareContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân', onClick: () => navigate('/profile?tab=profile') },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng của tôi', onClick: () => navigate('/profile?tab=orders') },
    { key: 'booking', icon: <UnorderedListOutlined />, label: 'Danh sách booking', onClick: () => navigate('/profile?tab=booking') },
    { key: 'favorites', icon: <HeartOutlined />, label: 'Căn hộ đang quan tâm', onClick: () => navigate('/profile?tab=favorites') },
    { type: 'divider' },
    { 
      key: 'logout', 
      icon: <LogoutOutlined />, 
      label: 'Đăng xuất',
      danger: true,
      onClick: () => {
        logout();
        message.success('Đã đăng xuất');
      }
    },
  ];

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Dùng loginPublic: cho phép mọi role đăng nhập, không ép admin
      const profile = await loginPublic(values.username, values.password);
      setIsLoginOpen(false);
      message.success('Đăng nhập thành công!');
    } catch (err) {
      message.error((err instanceof Error ? err.message : err) || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TRUONG_PHONG';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="saleweb-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
        }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: '#d4af37' }}>TRÍ LONG</span> <span style={{ color: '#1B2C6B' }}>LAND</span>
                </div>
              </div>
            </Link>
          </div>

          <nav style={{ display: 'flex', gap: '24px', fontWeight: 600, fontSize: '14px' }}>
            <Link to="/" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>GIỚI THIỆU</Link>
            <Link to="/projects" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>DỰ ÁN</Link>
            <Link to="/news" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>TIN TỨC</Link>
            <Link to="/events" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>SỰ KIỆN</Link>
            <Link to="/compare" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              <Badge count={compareList.length} size="small" color="#d4af37" offset={[10, 0]}>
                SO SÁNH CĂN HỘ
              </Badge>
            </Link>
            <Link to="/guide" style={{ transition: 'color 0.3s', textTransform: 'uppercase', color: 'var(--text-primary)' }}>HƯỚNG DẪN SỬ DỤNG</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated && isAdmin && (
              <button 
                className="saleweb-btn" 
                onClick={() => navigate('/admin/dashboard')}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}
              >
                Trang Quản Trị
              </button>
            )}
            
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Badge count={2} size="small" offset={[2, -2]}>
                  <MessageOutlined style={{ fontSize: '20px', color: '#475569', cursor: 'pointer' }} />
                </Badge>
                <Badge count={5} size="small" offset={[2, -2]}>
                  <BellOutlined style={{ fontSize: '20px', color: '#475569', cursor: 'pointer' }} />
                </Badge>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click', 'hover']}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d4af37' }} />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentUser.username}</span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)} 
                className="saleweb-btn saleweb-btn-primary" 
                style={{ padding: '8px 20px', borderRadius: '20px' }}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 0' }}>
        <Outlet />
      </main>

      <footer className="saleweb-footer">
        <div className="saleweb-footer-container">
          <div className="saleweb-footer-grid">
            {/* Column 1: Brand & Contact */}
            <div className="saleweb-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: '#d4af37' }}>TRÍ LONG</span> <span style={{ color: '#fff' }}>LAND</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Nền tảng công nghệ hỗ trợ kinh doanh BĐS<br/>hàng đầu Việt Nam
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <MailOutlined style={{ fontSize: '16px' }} />
                  <span>info@trilongland.vn</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <PhoneOutlined style={{ fontSize: '16px' }} />
                  <span>0976 239 891</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <EnvironmentOutlined style={{ fontSize: '16px', marginTop: '4px' }} />
                  <span style={{ lineHeight: 1.5 }}>
                    SB24-30, Sao Biển 24, KĐT Vinhomes Ocean Park,<br/>
                    Xã Gia Lâm, Thành phố Hà Nội, Việt Nam
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="saleweb-footer-col">
              <h4 className="saleweb-footer-title">CÔNG TY</h4>
              <nav className="saleweb-footer-links">
                <Link to="/about">Về chúng tôi</Link>
                <Link to="/services">Dịch vụ</Link>
                <Link to="/news">Tin tức</Link>
                <Link to="/contact">Liên hệ</Link>
              </nav>
            </div>

            {/* Column 3: Information */}
            <div className="saleweb-footer-col">
              <h4 className="saleweb-footer-title">THÔNG TIN</h4>
              <nav className="saleweb-footer-links">
                <Link to="/guide">Hướng dẫn sử dụng</Link>
                <Link to="/terms">Điều khoản dịch vụ</Link>
                <Link to="/privacy">Chính sách bảo mật</Link>
                <Link to="/faq">FAQ</Link>
              </nav>
            </div>

            {/* Column 4: Social */}
            <div className="saleweb-footer-col">
              <h4 className="saleweb-footer-title">KẾT NỐI VỚI CHÚNG TÔI</h4>
              <div className="saleweb-footer-socials">
                <a href="#" className="social-icon"><FacebookFilled /></a>
                <a href="#" className="social-icon"><YoutubeFilled /></a>
                <a href="#" className="social-icon"><TikTokOutlined /></a>
                <a href="#" className="social-icon" style={{ fontSize: '10px', fontWeight: 'bold' }}>Zalo</a>
              </div>
            </div>
          </div>

          <div className="saleweb-footer-bottom">
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                &copy; {new Date().getFullYear()} Công ty Cổ phần Kinh doanh bất động sản Trí Long. All rights reserved.
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                GCNĐKDN số 0110347195 | Bản quyền thuộc về Công ty Cổ phần Kinh doanh bất động sản Trí Long.
              </p>
            </div>
            <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ArrowUpOutlined />
            </button>
          </div>
        </div>
      </footer>

      <Modal
        title={<span style={{ fontSize: '20px', fontWeight: 700 }}>Đăng Nhập</span>}
        open={isLoginOpen}
        onCancel={() => setIsLoginOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: '24px' }}>
          <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: '#d4af37', borderColor: '#d4af37' }}>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
