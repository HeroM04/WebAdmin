import React, { useContext, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

export const Login = () => {
  const { login } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Đăng nhập thành công!');
    } catch (err) {
      message.error(typeof err === 'string' ? err : (err.message || 'Sai tên đăng nhập hoặc mật khẩu!'));
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
      background: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80") center/cover no-repeat',
      position: 'relative'
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)',
        backdropFilter: 'blur(8px)'
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <img src="/logo.png" alt="Trí Long Land" style={{ height: 80, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; document.getElementById('fallback-logo').style.display = 'block'; }} />
          <div id="fallback-logo" style={{ display: 'none' }}>
            <h2 className="outfit-font" style={{ color: '#fbbf24', fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: 1, textTransform: 'uppercase' }}>
              TRÍ LONG <span style={{ color: '#fff' }}>LAND</span>
            </h2>
            <div style={{ color: '#3b82f6', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
              Kiến tạo sự bền vững
            </div>
          </div>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 32, fontSize: 14 }}>
          Đăng nhập hệ thống quản trị
        </p>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
              placeholder="Tên đăng nhập (admin / hr)" 
              style={{
                background: '#000000',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 12
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input 
              type="password"
              prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
              placeholder="Mật khẩu (admin123)" 
              style={{
                background: '#000000',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 12
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{
                width: '100%',
                height: 48,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              Đăng nhập <RightOutlined style={{ fontSize: 12 }} />
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Tài khoản demo: <strong>admin/admin123</strong> hoặc <strong>hr/123456</strong>
        </div>
      </div>
    </div>
  );
};
