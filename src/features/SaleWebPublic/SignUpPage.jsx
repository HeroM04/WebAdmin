import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Row, Col, Select, Checkbox } from 'antd';
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đăng ký thành công!');
      navigate('/sign-in');
    } catch (err) {
      message.error('Đăng ký thất bại!');
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
        maxWidth: '1000px',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Left Side: Banner */}
        <div style={{
          flex: '0 0 380px',
          background: 'linear-gradient(135deg, #1B2C6B 0%, #0f172a 100%)',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#d4af37' }}>TRÍ LONG</span> <span style={{ color: '#fff' }}>LAND</span>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
            Nền tảng công nghệ hỗ trợ kinh<br/>doanh BĐS hàng đầu Việt Nam
          </p>
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <Link to="/sign-in" style={{ color: '#1B2C6B', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>

          <Form layout="vertical" onFinish={handleRegister} requiredMark={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fullname" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Họ và tên" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" rules={[{ required: true, message: 'Chọn giới tính!' }]}>
                  <Select placeholder={<><UserOutlined style={{ color: '#94a3b8', marginRight: '8px' }}/> Giới tính</>} size="large" style={{ borderRadius: '8px' }}>
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="phone" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                  <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="Số điện thoại" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}>
                  <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mật khẩu" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="confirmPassword" dependencies={['password']} rules={[
                  { required: true, message: 'Xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Xác nhận mật khẩu" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="workplace" rules={[{ required: true, message: 'Chọn nơi làm việc!' }]}>
                  <Select placeholder={<><EnvironmentOutlined style={{ color: '#94a3b8', marginRight: '8px' }}/> Nơi làm việc</>} size="large" style={{ borderRadius: '8px' }}>
                    <Option value="hanoi">Hà Nội</Option>
                    <Option value="hcm">TP. Hồ Chí Minh</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="referral">
                  <Input prefix={<TeamOutlined style={{ color: '#94a3b8' }} />} placeholder="Người giới thiệu" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="agreement" valuePropName="checked" rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản!')) }
            ]}>
              <Checkbox style={{ fontSize: '0.85rem' }}>
                Tôi đồng ý với <Link to="/terms" style={{ color: '#1B2C6B', fontWeight: 'bold' }}>Điều khoản dịch vụ</Link> và <Link to="/privacy" style={{ color: '#1B2C6B', fontWeight: 'bold' }}>Chính sách bảo mật</Link> của Trí Long Land
              </Checkbox>
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading} 
              style={{ background: '#94a3b8', borderColor: '#94a3b8', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}
            >
              Đăng ký
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};
