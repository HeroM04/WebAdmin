import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Alert } from 'antd';
import { PhoneOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';

export const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      message.success('Mã OTP đã được gửi!');
    } catch (err) {
      message.error('Gửi mã thất bại!');
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
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 'bold', margin: '0 0 8px 0' }}>Quên mật khẩu?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Đừng lo lắng! Nhập số điện thoại đã đăng ký và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </p>
          </div>

          <Form layout="vertical" onFinish={handleSendOTP} requiredMark={false}>
            <Form.Item 
              name="phone" 
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Số điện thoại" 
                size="large"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
              />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading} 
              icon={<SendOutlined />}
              style={{ background: '#1B2C6B', borderColor: '#1B2C6B', fontWeight: 'bold', borderRadius: '8px', marginBottom: '16px' }}
            >
              Gửi mã OTP
            </Button>

            <Link to="/sign-in" style={{ display: 'block', textAlign: 'center' }}>
              <Button type="text" block size="large" style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 600, borderRadius: '8px', marginBottom: '24px' }}>
                <ArrowLeftOutlined /> Quay lại đăng nhập
              </Button>
            </Link>

            <Alert 
              message="Bạn sẽ nhận được mã OTP qua tin nhắn SMS trong vòng 1-2 phút" 
              type="info" 
              showIcon 
              style={{ background: '#eff6ff', border: 'none', color: '#1e40af', borderRadius: '8px' }}
            />
          </Form>
        </div>
      </div>
    </div>
  );
};
