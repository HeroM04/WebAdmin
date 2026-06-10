import React, { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { CompareContext } from '../../context/CompareContext';
import '../../SaleWeb.css';
import { Modal, Form, Input, Button, message, Badge } from 'antd';

export const SaleWebLayout = () => {
  const { currentUser, isAuthenticated, loginPublic, logout } = useContext(AppContext);
  const { compareList } = useContext(CompareContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
            <Link to="/">
              <h1 className="text-gradient-gold" style={{ fontSize: '24px', margin: 0, fontWeight: 700 }}>TRÍ LONG LAND</h1>
            </Link>
          </div>

          <nav style={{ display: 'flex', gap: '32px', fontWeight: 600 }}>
            <Link to="/projects" style={{ transition: 'color 0.3s' }}>Dự án</Link>
            <Link to="/compare" style={{ transition: 'color 0.3s' }}>
              <Badge count={compareList.length} size="small" color="#d4af37" offset={[10, 0]}>
                So sánh
              </Badge>
            </Link>
            <Link to="/contact" style={{ transition: 'color 0.3s' }}>Liên hệ</Link>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 600 }}>{currentUser.username}</span>
                <button 
                  onClick={() => {
                    logout();
                    message.success('Đã đăng xuất');
                  }} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Đăng xuất
                </button>
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

      <footer style={{
        marginTop: 'auto',
        padding: '40px 0',
        background: '#1e293b',
        color: '#fff',
      }}>
        <div className="saleweb-container" style={{ textAlign: 'center', opacity: 0.8 }}>
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Trí Long Land. Bản quyền thuộc về Hệ thống phân phối BĐS Cao cấp.</p>
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
