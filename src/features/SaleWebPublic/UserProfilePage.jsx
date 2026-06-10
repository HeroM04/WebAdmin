import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tabs, Input, Select, Button, Table, Row, Col, Card } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ShareAltOutlined, 
  EditOutlined, 
  BarChartOutlined, 
  InboxOutlined,
  FilterOutlined
} from '@ant-design/icons';
import '../../SaleWeb.css';

const { Option } = Select;

export const UserProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  // --- MOCK DATA FOR TABLES ---
  const orderColumns = [
    { title: 'Mã căn', dataIndex: 'code', key: 'code', align: 'center' },
    { title: 'Hành động', dataIndex: 'action', key: 'action', align: 'center' },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status', align: 'center' },
    { title: 'Ngày tạo', dataIndex: 'createDate', key: 'createDate', align: 'center' },
    { title: 'Ngày lock', dataIndex: 'lockDate', key: 'lockDate', align: 'center' },
    { title: 'Ngày ghi nhận DT', dataIndex: 'revenueDate', key: 'revenueDate', align: 'center' },
    { title: 'Giá nhà', dataIndex: 'price', key: 'price', align: 'center' },
    { title: 'Tòa nhà/ dãy nhà', dataIndex: 'building', key: 'building', align: 'center' },
    { title: 'Phân khu', dataIndex: 'zone', key: 'zone', align: 'center' },
    { title: 'Dự án', dataIndex: 'project', key: 'project', align: 'center' },
  ];

  const bookingColumns = [
    { title: 'Mã căn', dataIndex: 'code', key: 'code', align: 'center' },
    { title: 'Dự án', dataIndex: 'project', key: 'project', align: 'center' },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status', align: 'center' },
    { title: 'Lý do từ chối', dataIndex: 'reason', key: 'reason', align: 'center' },
    { title: 'Thời gian yêu cầu', dataIndex: 'time', key: 'time', align: 'center' },
    { title: 'Người phụ trách', dataIndex: 'pic', key: 'pic', align: 'center' },
  ];

  const favoriteColumns = [
    { title: 'Mã căn', dataIndex: 'code', key: 'code', align: 'center' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
    { title: 'Giá nhà', dataIndex: 'price', key: 'price', align: 'center' },
    { title: 'Loại căn', dataIndex: 'type', key: 'type', align: 'center' },
    { title: 'Tòa nhà/ dãy nhà', dataIndex: 'building', key: 'building', align: 'center' },
    { title: 'Phân khu', dataIndex: 'zone', key: 'zone', align: 'center' },
    { title: 'Dự án', dataIndex: 'project', key: 'project', align: 'center' },
  ];

  const EmptyState = () => (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
      <InboxOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }} />
      <div>Không có dữ liệu</div>
    </div>
  );

  return (
    <div className="saleweb-container" style={{ padding: '0 0 40px 0' }}>
      
      {/* Header Profile */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px', paddingTop: '24px' }}>
        <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Logo S fake avatar */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#f8fafc" />
              <polygon points="30,25 70,25 50,45" fill="#1e3a8a" />
              <polygon points="70,75 30,75 50,55" fill="#14b8a6" />
              <polygon points="20,40 40,40 30,60" fill="#1e3a8a" />
              <polygon points="80,60 60,60 70,40" fill="#14b8a6" />
            </svg>
          </div>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0, marginBottom: '8px' }}>
            Nguyễn mạnh hùng
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined /> Người dùng Online 1
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneOutlined /> 0869933166
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MailOutlined /> hunghot041103@gmail.com
            </div>
          </div>
          <Button type="primary" icon={<ShareAltOutlined />} style={{ background: '#3b82f6', marginTop: '12px', borderRadius: '4px' }}>
            Giới thiệu bạn bè
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        tabBarStyle={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}
        items={[
          {
            key: 'profile',
            label: <span style={{ fontWeight: 600, fontSize: '1rem', color: activeTab === 'profile' ? '#3b82f6' : '#64748b' }}>Thông tin cá nhân</span>,
            children: (
              <div>
                {/* Form Thông tin cá nhân */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '24px', background: '#fff' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>Thông tin cá nhân</h3>
                    <div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#64748b', cursor: 'pointer' }}>
                      <EditOutlined />
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    <Row gutter={[24, 24]} align="middle">
                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>Avatar</Col>
                      <Col span={20}>
                        <div style={{ width: '80px', height: '80px', position: 'relative' }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <polygon points="30,25 70,25 50,45" fill="#1e3a8a" />
                            <polygon points="70,75 30,75 50,55" fill="#14b8a6" />
                            <polygon points="20,40 40,40 30,60" fill="#1e3a8a" />
                            <polygon points="80,60 60,60 70,40" fill="#14b8a6" />
                          </svg>
                          <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#fff', borderRadius: '50%', padding: '4px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <EditOutlined style={{ fontSize: '10px', color: '#64748b' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>Ảnh hợp lệ: png, jpg, jpeg.</div>
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>Họ và tên</Col>
                      <Col span={20}>
                        <Input value="Nguyễn mạnh hùng" style={{ borderRadius: '4px' }} />
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>Email</Col>
                      <Col span={20}>
                        <Input value="hunghot041103@gmail.com" style={{ borderRadius: '4px' }} />
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>Ngày sinh</Col>
                      <Col span={20}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <Select placeholder="Ngày" style={{ flex: 1 }} />
                          <Select placeholder="Tháng" style={{ flex: 1 }} />
                          <Select placeholder="Năm" style={{ flex: 1 }} />
                        </div>
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>SĐT liên hệ <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '4px', background: '#e2e8f0', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>?</span></Col>
                      <Col span={20}>
                        <Input value="0869933166" style={{ borderRadius: '4px' }} />
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>SĐT người giới thiệu <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '4px', background: '#e2e8f0', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>?</span></Col>
                      <Col span={20}>
                        <Input placeholder="Chưa cập nhật" style={{ borderRadius: '4px' }} disabled />
                      </Col>

                      <Col span={4} style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu</Col>
                      <Col span={20}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <Input.Password value="password123" style={{ flex: 1, borderRadius: '4px' }} />
                          <div style={{ fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>Đổi mật khẩu</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Thống kê cá nhân */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>Thống kê cá nhân</h3>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Bao gồm toàn bộ doanh thu trên hệ thống</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.9rem' }}>Bạn chưa có đơn hàng nào</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Hãy cố gắng lên nhé!</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    <Row gutter={24} style={{ marginBottom: '32px' }}>
                      {/* Box 1 */}
                      <Col span={8}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#a855f7' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Đang cập nhật</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Doanh thu tháng</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#10b981' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>0</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Căn hộ/tháng</div>
                          </div>
                        </div>
                      </Col>

                      {/* Box 2 */}
                      <Col span={8}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#ef4444' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Đang cập nhật</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Doanh thu quý</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>0</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Căn hộ/quý</div>
                          </div>
                        </div>
                      </Col>

                      {/* Box 3 */}
                      <Col span={8}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#f43f5e' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Đang cập nhật</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Doanh thu năm</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <BarChartOutlined style={{ fontSize: '24px', color: '#eab308' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>0</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Căn hộ/năm</div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Fake Chart Area */}
                    <div style={{ position: 'relative', height: '200px', borderLeft: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', marginLeft: '24px' }}>
                      <div style={{ position: 'absolute', bottom: '100%', left: '-20px', color: '#94a3b8', fontSize: '12px' }}>3</div>
                      <div style={{ position: 'absolute', bottom: '83%', left: '-24px', color: '#94a3b8', fontSize: '12px' }}>2.5</div>
                      <div style={{ position: 'absolute', bottom: '66%', left: '-20px', color: '#94a3b8', fontSize: '12px' }}>2</div>
                      <div style={{ position: 'absolute', bottom: '50%', left: '-24px', color: '#94a3b8', fontSize: '12px' }}>1.5</div>
                      <div style={{ position: 'absolute', bottom: '33%', left: '-20px', color: '#94a3b8', fontSize: '12px' }}>1</div>
                      <div style={{ position: 'absolute', bottom: '16%', left: '-24px', color: '#94a3b8', fontSize: '12px' }}>0.5</div>
                      <div style={{ position: 'absolute', bottom: '0', left: '-20px', color: '#94a3b8', fontSize: '12px' }}>0</div>
                      
                      {/* Grid lines */}
                      <div style={{ position: 'absolute', bottom: '16%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                      <div style={{ position: 'absolute', bottom: '33%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                      <div style={{ position: 'absolute', bottom: '50%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                      <div style={{ position: 'absolute', bottom: '66%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                      <div style={{ position: 'absolute', bottom: '83%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                      <div style={{ position: 'absolute', bottom: '100%', width: '100%', borderTop: '1px dashed #f1f5f9' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'orders',
            label: <span style={{ fontWeight: 600, fontSize: '1rem', color: activeTab === 'orders' ? '#3b82f6' : '#64748b' }}>Đơn hàng của tôi</span>,
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                  <Select defaultValue="all" style={{ width: '180px' }}>
                    <Option value="all">Chọn tình trạng</Option>
                  </Select>
                  <Button icon={<FilterOutlined />} style={{ background: '#f8fafc', color: '#0f172a' }}>Bộ lọc</Button>
                </div>
                <Table 
                  columns={orderColumns} 
                  dataSource={[]} 
                  locale={{ emptyText: <EmptyState /> }}
                  pagination={false}
                  bordered={false}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            )
          },
          {
            key: 'booking',
            label: <span style={{ fontWeight: 600, fontSize: '1rem', color: activeTab === 'booking' ? '#3b82f6' : '#64748b' }}>Danh sách booking</span>,
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                  <Select defaultValue="all" style={{ width: '180px' }}>
                    <Option value="all">Chọn tình trạng</Option>
                  </Select>
                  <Button icon={<FilterOutlined />} style={{ background: '#f8fafc', color: '#0f172a' }}>Bộ lọc</Button>
                </div>
                <Table 
                  columns={bookingColumns} 
                  dataSource={[]} 
                  locale={{ emptyText: <EmptyState /> }}
                  pagination={false}
                  bordered={false}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            )
          },
          {
            key: 'favorites',
            label: <span style={{ fontWeight: 600, fontSize: '1rem', color: activeTab === 'favorites' ? '#3b82f6' : '#64748b' }}>Căn hộ đang quan tâm</span>,
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                  <Select defaultValue="available" style={{ width: '180px' }}>
                    <Option value="available">Khả dụng</Option>
                  </Select>
                  <Button icon={<FilterOutlined />} style={{ background: '#f8fafc', color: '#0f172a' }}>Bộ lọc</Button>
                </div>
                <Table 
                  columns={favoriteColumns} 
                  dataSource={[]} 
                  locale={{ emptyText: <EmptyState /> }}
                  pagination={false}
                  bordered={false}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
