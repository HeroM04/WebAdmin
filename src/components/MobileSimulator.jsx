import React, { useContext, useState } from 'react';
import { Card, Row, Col, Form, Input, Button, Select, Tabs, Space, Avatar, Badge, message, Divider } from 'antd';
import {
  MobileOutlined,
  CheckCircleOutlined,
  SendOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  DollarOutlined,
  MessageOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

export const MobileSimulator = ({ setActiveTab }) => {
  const { users, addPendingDeal, addPendingAttendance, addPendingPost, addPendingMeeting } = useContext(AppContext);
  const [mobileAgentId, setMobileAgentId] = useState('user-02'); // Default Trần Thị B (Sale Agent)
  const [formAttendance] = Form.useForm();
  const [formMeeting] = Form.useForm();
  const [formPost] = Form.useForm();
  const [formDeal] = Form.useForm();

  const getAgent = () => users.find(u => u.id === mobileAgentId) || users[1];
  const agent = getAgent();

  // Predefined photo lists for Attendance check-in simulation
  const checkinPhotos = [
    { label: 'Chụp ảnh văn phòng Q1 (Chuẩn)', value: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
    { label: 'Chụp ảnh dự án Vinhomes (Chuẩn)', value: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
    { label: 'Chụp ảnh cafe gặp khách (Chuẩn)', value: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { label: 'Ảnh selfie không rõ mặt (Nghi vấn)', value: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' } // Male photo for female agent
  ];

  // Predefined post templates for AI scanning simulation
  const postTemplates = [
    {
      label: 'Bài đăng quảng cáo BĐS (Đầy đủ từ khóa)',
      caption: 'Chính chủ mở bán căn hộ Vinhomes Grand Park phân khu Beverly, giá tốt nhất thị trường, chiết khấu lên tới 5% và hỗ trợ vay ngân hàng lãi suất 0% trong 18 tháng. Có sổ hồng riêng bàn giao ngay!'
    },
    {
      label: 'Bài đăng giới thiệu đất nền (Có từ khóa)',
      caption: 'Cơ hội đầu tư đất nền thổ cư giá rẻ tại trung tâm TP Thủ Đức, cam kết sổ đỏ chính chủ hỗ trợ vay vốn ngân hàng, chiết khấu cao cho 5 khách hàng liên hệ sớm nhất!'
    },
    {
      label: 'Bài đăng cá nhân đi ăn trưa (Không từ khóa)',
      caption: 'Hôm nay được đi ăn phở Hà Nội chuẩn vị tại Sài Gòn. Quán sạch sẽ, phục vụ nhiệt tình và đồ ăn rất ngon miệng!'
    }
  ];

  // Submit functions
  const handleAttendanceSubmit = (values) => {
    addPendingAttendance(values.photoUrl, values.location, values.note, mobileAgentId);
    message.success('Đã gửi yêu cầu Chấm công (Offline) lên server! Chờ HR duyệt.');
    formAttendance.resetFields();
  };

  const handleMeetingSubmit = (values) => {
    addPendingMeeting(values.clientName, values.clientPhone, values.location, values.summary, mobileAgentId);
    message.success('Đã nộp Báo cáo Thực chiến thành công! Chờ quản lý duyệt.');
    formMeeting.resetFields();
  };

  const handlePostSubmit = (values) => {
    addPendingPost(values.platform, values.link, values.caption, mobileAgentId);
    message.success('Đã gửi bài đăng quảng cáo dự án BĐS! Chờ AI quét & HR duyệt.');
    formPost.resetFields();
  };

  const handleDealSubmit = (values) => {
    addPendingDeal(values.projectName, values.price, values.customerName, values.customerPhone, mobileAgentId);
    message.success('Đã nộp yêu cầu phê duyệt Deal Chốt Căn! Chờ HR duyệt để kích hoạt KPI.');
    formDeal.resetFields();
  };

  // Pre-fill post caption template
  const applyPostTemplate = (text) => {
    formPost.setFieldsValue({ caption: text });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Row gutter={[24, 24]}>
        
        {/* Left Column: Explanation of the simulation flow */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <Card className="premium-card">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Hướng dẫn Giả lập Luồng Nghiệp vụ</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
                Trình giả lập điện thoại di động bên cạnh cho phép bạn đóng vai trò là một <strong>Đại lý (Sale Agent)</strong> đang đi thị trường thực tế. Bạn có thể gửi các yêu cầu nghiệp vụ mô phỏng từ App lên Web Admin:
              </p>
              
              <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong style={{ color: 'var(--primary-color)' }}>Chấm công ngoại tuyến:</strong> Gửi ảnh chụp selfie tại công trình. HR có thể đối chiếu chéo với ảnh đại diện để phát hiện gian lận chấm công hộ.
                </li>
                <li>
                  <strong style={{ color: 'var(--primary-color)' }}>Thực chiến (Gặp khách):</strong> Báo cáo tóm tắt cuộc gặp khách hàng để tích lũy KPI (+20 điểm).
                </li>
                <li>
                  <strong style={{ color: 'var(--primary-color)' }}>Lan tỏa bài post:</strong> Gửi bài đăng. Hãy chọn thử các mẫu content BĐS hoặc content đi chơi để kiểm tra độ nhạy bén của <strong>AI Mock Scanner</strong> bên màn hình Duyệt bài.
                </li>
                <li>
                  <strong style={{ color: 'var(--primary-color)' }}>Chốt căn (Doanh số):</strong> Gửi giao dịch chốt căn giá trị lớn (ví dụ: căn hộ 5 tỷ hoặc shophouse 10 tỷ). Khi HR bấm Duyệt, điểm KPI sẽ nhảy ngay lập tức trên Dashboard.
                </li>
              </ul>

              <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
              
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Chọn Đại lý gửi yêu cầu:</span>
                <Select
                  value={mobileAgentId}
                  onChange={setMobileAgentId}
                  style={{ width: 180 }}
                  options={users.filter(u => u.role === 'Sale Agent').map(u => ({
                    value: u.id,
                    label: u.name
                  }))}
                />
              </div>
            </Card>

            <Button
              type="primary"
              size="large"
              icon={<MobileOutlined />}
              style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', height: 48, borderRadius: 10 }}
              onClick={() => setActiveTab('approvals')}
            >
              Đi Tới Trang HR Duyệt Yêu Cầu
            </Button>

          </div>
        </Col>

        {/* Right Column: Visual smartphone frame */}
        <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="phone-frame">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              
              {/* Phone Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
                <Space>
                  <img src="https://img.icons8.com/fluency/48/emerald.png" alt="App Icon" style={{ width: 24, height: 24 }} />
                  <span style={{ fontWeight: 'bold', fontSize: 13, color: 'var(--primary-color)' }}>AgentApp BĐS</span>
                </Space>
                <Badge status="processing" text="GPS Active" style={{ fontSize: 10, color: 'var(--text-secondary)' }} />
              </div>

              {/* Logged in agent info */}
              <Card size="small" style={{ background: '#1e293b', border: 'none', borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: 10 }}>
                <Space>
                  <Avatar src={agent.avatar} size="small" />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{agent.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--primary-color)' }}>Đại lý kinh doanh &bull; KD 1</div>
                  </div>
                </Space>
              </Card>

              {/* Tab options in phone */}
              <Tabs
                defaultActiveKey="att"
                size="small"
                centered
                tabBarStyle={{ marginBottom: 12 }}
                items={[
                  {
                    key: 'att',
                    label: <span style={{ fontSize: 11 }}>Chấm công</span>,
                    children: (
                      <Form form={formAttendance} onFinish={handleAttendanceSubmit} layout="vertical" size="small">
                        <Form.Item 
                          name="photoUrl" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Ảnh chụp chấm công</span>}
                          initialValue={checkinPhotos[0].value}
                          rules={[{ required: true }]}
                        >
                          <Select options={checkinPhotos} />
                        </Form.Item>
                        <Form.Item 
                          name="location" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>GPS Vị trí thực địa</span>}
                          initialValue="10.7769, 106.7009 (Căn hộ Phú Mỹ Hưng)"
                          rules={[{ required: true }]}
                        >
                          <Input prefix={<EnvironmentOutlined />} />
                        </Form.Item>
                        <Form.Item 
                          name="note" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Ghi chú gửi HR</span>}
                          initialValue="Check-in đi gặp khách hàng sớm tại Phú Mỹ Hưng Quận 7"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                          Gửi Chấm Công (Pending)
                        </Button>
                      </Form>
                    )
                  },
                  {
                    key: 'meet',
                    label: <span style={{ fontSize: 11 }}>Gặp khách</span>,
                    children: (
                      <Form form={formMeeting} onFinish={handleMeetingSubmit} layout="vertical" size="small">
                        <Form.Item 
                          name="clientName" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Tên khách hàng</span>}
                          rules={[{ required: true, message: 'Nhập tên khách!' }]}
                        >
                          <Input placeholder="Ví dụ: Anh Hoàng Lâm" />
                        </Form.Item>
                        <Form.Item 
                          name="clientPhone" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Số điện thoại khách</span>}
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Ví dụ: 0909xxxxxx" />
                        </Form.Item>
                        <Form.Item 
                          name="location" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Địa điểm cuộc gặp</span>}
                          initialValue="Highlands Coffee - Landmark 81"
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item 
                          name="summary" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Nội dung cuộc gặp</span>}
                          rules={[{ required: true, message: 'Nhập báo cáo tóm tắt!' }]}
                        >
                          <Input.TextArea placeholder="Khách hàng quan tâm dự án Vinhomes 3PN..." rows={2} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                          Báo Cáo Thực Chiến
                        </Button>
                      </Form>
                    )
                  },
                  {
                    key: 'post',
                    label: <span style={{ fontSize: 11 }}>Lan tỏa</span>,
                    children: (
                      <Form form={formPost} onFinish={handlePostSubmit} layout="vertical" size="small">
                        <Form.Item 
                          name="platform" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Mạng xã hội</span>}
                          initialValue="Facebook"
                        >
                          <Select>
                            <Select.Option value="Facebook">Facebook</Select.Option>
                            <Select.Option value="Zalo">Zalo</Select.Option>
                            <Select.Option value="TikTok">TikTok</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item 
                          name="link" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Link chia sẻ bài đăng</span>}
                          initialValue="https://facebook.com/tranthib/posts/998877"
                        >
                          <Input />
                        </Form.Item>

                        {/* Templates list inside phone */}
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>Chọn nhanh mẫu viết bài:</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {postTemplates.map((t, idx) => (
                              <Button key={idx} size="small" type="dashed" style={{ fontSize: 9, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => applyPostTemplate(t.caption)}>
                                {t.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Form.Item 
                          name="caption" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Nội dung bài viết</span>}
                          rules={[{ required: true }]}
                        >
                          <Input.TextArea rows={3} placeholder="Soạn nội dung đăng..." />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                          Gửi Bài Đăng (AI Scan)
                        </Button>
                      </Form>
                    )
                  },
                  {
                    key: 'deal',
                    label: <span style={{ fontSize: 11 }}>Chốt căn</span>,
                    children: (
                      <Form form={formDeal} onFinish={handleDealSubmit} layout="vertical" size="small">
                        <Form.Item 
                          name="projectName" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Tên dự án & Căn</span>}
                          initialValue="Vinhomes Grand Park - Căn 3PN view hồ"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item 
                          name="price" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Giá trị giao dịch (VND)</span>}
                          initialValue={4800000000}
                          rules={[{ required: true }]}
                        >
                          <Input type="number" prefix={<DollarOutlined />} />
                        </Form.Item>
                        <Form.Item 
                          name="customerName" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Tên khách hàng mua</span>}
                          rules={[{ required: true, message: 'Nhập tên khách!' }]}
                        >
                          <Input placeholder="Ví dụ: Nguyễn Văn Hải" />
                        </Form.Item>
                        <Form.Item 
                          name="customerPhone" 
                          label={<span style={{ fontSize: 11, color: '#94a3b8' }}>Số điện thoại khách</span>}
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Ví dụ: 0915xxxxxx" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}>
                          Yêu Cầu Duyệt Deal BĐS
                        </Button>
                      </Form>
                    )
                  }
                ]}
              />

            </div>
          </div>
        </Col>

      </Row>

    </div>
  );
};
