import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

export const SignInPage = () => {
  const { loginPublic } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    let isSlow = false;
    const slowTimer = setTimeout(() => {
      isSlow = true;
      message.info('Hệ thống đang khởi động (mất khoảng 30-50s), vui lòng không tắt trang...');
    }, 4000);

    try {
      await loginPublic(values.username, values.password);
      clearTimeout(slowTimer);
      if (isSlow) message.success('Khởi động thành công!');
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      clearTimeout(slowTimer);
      const errorMsg = typeof err === 'string' ? err : (err?.message || err?.error || 'Tài khoản hoặc mật khẩu không chính xác!');
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '900px',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Left Side: Banner */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1B2C6B 0%, #0f172a 100%)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#d4af37' }}>SALE</span> <span style={{ color: '#fff' }}>HUB</span>
          </div>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
            Nền tảng công nghệ hỗ trợ kinh<br/>doanh BĐS hàng đầu Việt Nam
          </p>
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'normal', margin: 0 }}>Đăng nhập để tiếp tục</h2>
          </div>

          <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
            <Form.Item 
              name="username" 
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Tên đăng nhập" 
                size="large"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: '16px' }}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Mật khẩu" 
                size="large"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.9rem' }}>
              <Link to="/password-reset" style={{ color: '#1B2C6B' }}>Quên mật khẩu?</Link>
              <div>Chưa có tài khoản? <Link to="/sign-up" style={{ color: '#1B2C6B', fontWeight: 'bold' }}>Đăng ký ngay!</Link></div>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading} 
              style={{ background: '#d4af37', borderColor: '#d4af37', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}
            >
              Đăng nhập
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};
