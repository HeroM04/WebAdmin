import React, { useContext, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { CompareContext } from '../../context/CompareContext';
import '../../SaleWeb.css';
import { Modal, Form, Input, Button, message, Badge, Dropdown, Avatar } from 'antd';
import { 
  MailOutlined, PhoneOutlined, EnvironmentOutlined, FacebookFilled, YoutubeFilled, TikTokOutlined, ArrowUpOutlined,
  MessageOutlined, BellOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HeartOutlined, CommentOutlined, LogoutOutlined,
  MenuOutlined, CloseOutlined
} from '@ant-design/icons';

export const SaleWebLayout = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AppContext);
  const { compareList } = useContext(CompareContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TRUONG_PHONG';

  const navLinkStyle = ({ isActive }) => ({
    transition: 'color 0.3s, text-decoration 0.3s',
    textTransform: 'uppercase',
    color: isActive ? '#d4af37' : 'var(--text-primary)',
    textDecoration: isActive ? 'underline' : 'none',
    textUnderlineOffset: '4px',
    textDecorationThickness: '2px',
    whiteSpace: 'nowrap',
    fontSize: '13px',
  });

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="saleweb-glass saleweb-header">
        <div className="saleweb-header-inner">
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: '#d4af37' }}>TRÍ LONG</span> <span style={{ color: '#1B2C6B' }}>LAND</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="saleweb-nav-desktop">
            <NavLink to="/" end style={navLinkStyle}>GIỚI THIỆU</NavLink>
            <NavLink to="/projects" style={navLinkStyle}>DỰ ÁN</NavLink>
            <NavLink to="/news" style={navLinkStyle}>TIN TỨC</NavLink>
            <NavLink to="/events" style={navLinkStyle}>SỰ KIỆN</NavLink>
            <NavLink to="/compare" style={navLinkStyle}>
              <Badge count={compareList.length} size="small" color="#d4af37" offset={[10, 0]}>
                <span style={{ color: 'inherit' }}>SO SÁNH CĂN HỘ</span>
              </Badge>
            </NavLink>
            <NavLink to="/guide" style={navLinkStyle}>HƯỚNG DẪN</NavLink>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated && isAdmin && (
              <button 
                className="saleweb-btn saleweb-btn-admin-hidden-mobile" 
                onClick={() => navigate('/admin/dashboard')}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
              >
                Quản Trị
              </button>
            )}
            
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge count={2} size="small" offset={[2, -2]}>
                  <MessageOutlined className="saleweb-icon-hidden-mobile" style={{ fontSize: '18px', color: '#475569', cursor: 'pointer' }} />
                </Badge>
                <Badge count={5} size="small" offset={[2, -2]}>
                  <BellOutlined className="saleweb-icon-hidden-mobile" style={{ fontSize: '18px', color: '#475569', cursor: 'pointer' }} />
                </Badge>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click', 'hover']}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d4af37' }} size="small" />
                    <span className="saleweb-username-hidden-mobile" style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{currentUser.username}</span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/sign-in')} 
                className="saleweb-btn saleweb-btn-primary" 
                style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}
              >
                Đăng nhập
              </button>
            )}

            {/* Hamburger Button */}
            <button className="saleweb-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="saleweb-nav-mobile">
            <NavLink to="/" end style={navLinkStyle} onClick={handleNavClick}>GIỚI THIỆU</NavLink>
            <NavLink to="/projects" style={navLinkStyle} onClick={handleNavClick}>DỰ ÁN</NavLink>
            <NavLink to="/news" style={navLinkStyle} onClick={handleNavClick}>TIN TỨC</NavLink>
            <NavLink to="/events" style={navLinkStyle} onClick={handleNavClick}>SỰ KIỆN</NavLink>
            <NavLink to="/compare" style={navLinkStyle} onClick={handleNavClick}>
              SO SÁNH CĂN HỘ ({compareList.length})
            </NavLink>
            <NavLink to="/guide" style={navLinkStyle} onClick={handleNavClick}>HƯỚNG DẪN SỬ DỤNG</NavLink>
          </div>
        )}
      </header>

      <main style={{ flex: 1, padding: '20px 0' }}>
        <Outlet />
      </main>

      <footer className="saleweb-footer">
        <div className="saleweb-footer-container">
          <div className="saleweb-footer-grid">
            {/* Column 1: Brand & Contact */}
            <div className="saleweb-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>
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

    </div>
  );
};
