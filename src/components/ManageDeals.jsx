import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, Divider, DatePicker } from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined,
  ClockCircleOutlined, HomeOutlined, GiftOutlined, DollarOutlined,
  PlusOutlined, EditOutlined, EyeOutlined, UserOutlined, PhoneOutlined,
  TrophyOutlined, FireOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import confetti from 'canvas-confetti';

const { Search } = Input;

const StatusTag = ({ status }) => {
  if (status === 'APPROVED') return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
  return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
};

const triggerCelebration = () => {
  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#3b82f6'] }), 250);
};

export const ManageDeals = () => {
  const { deals, users, departments, currentUser, approveDeal, rejectDeal, deleteDeal, updateDeal, addDeal } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [detailRecord, setDetailRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const getUserById = (id) => users.find(u => u.id === id);
  const getDeptName = (deptId) => {
    const dept = departments?.find(d => d.id === deptId);
    return dept ? dept.name : 'Chưa phân phòng';
  };

  const filtered = deals.filter(item => {
    const user = getUserById(item.userId);
    const matchName = !search
      || (user?.name || '').toLowerCase().includes(search.toLowerCase())
      || (item.projectName || '').toLowerCase().includes(search.toLowerCase())
      || (item.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchDept = deptFilter === 'ALL' || (user && user.deptId === deptFilter);
    let matchDate = true;
    if (dateRange && dateRange[0] && dateRange[1] && item.submittedAt) {
      const itemDateStr = item.submittedAt.substring(0, 10);
      matchDate = itemDateStr >= dateRange[0] && itemDateStr <= dateRange[1];
    }
    return matchName && matchStatus && matchDept && matchDate;
  });

  const stats = {
    total: deals.length,
    pending: deals.filter(d => d.status === 'PENDING').length,
    approved: deals.filter(d => d.status === 'APPROVED').length,
    totalRevenue: deals.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + d.price, 0),
  };

  const openDetail = (record) => { setDetailRecord(record); setDrawerOpen(true); };

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ userId: users.find(u => u.role === 'Nhân viên')?.id || users[0]?.id, status: 'PENDING', kpiTriggered: 100 });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      userId: record.userId,
      projectName: record.projectName,
      price: record.price,
      commission: record.commission,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      kpiTriggered: record.kpiTriggered,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        if (editingRecord) {
          const price = Number(values.price);
          const commission = values.commission ? Number(values.commission) : Math.round(price * 0.03);
          await updateDeal({ ...editingRecord, ...values, price, commission });
        } else {
          const price = Number(values.price);
          const commission = values.commission ? Number(values.commission) : Math.round(price * 0.03);
          await addDeal({ ...values, price, commission });
        }
        message.success(editingRecord ? 'Đã cập nhật giao dịch!' : 'Đã thêm giao dịch mới!');
        setModalOpen(false);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeal(id);
      message.success('Đã xóa giao dịch.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDeal(id, currentUser.name);
      triggerCelebration();
      message.success('🎉 Deal đã được phê duyệt!');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDeal(id, currentUser.name);
      message.warning('Đã bác bỏ giao dịch.');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'user',
      width: 150,
      render: (_, record) => {
        const user = getUserById(record.userId);
        return (
          <Space>
            <Avatar src={user?.avatar} size="default" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user?.name || 'Ẩn danh'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{getDeptName(user?.deptId)}</div>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Dự án / BĐS',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{text}</span>
    },
    {
      title: 'Giá trị',
      key: 'price',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#ec4899', fontSize: 14 }}><DollarOutlined style={{ marginRight: 4 }} />{(record.price / 1e9).toFixed(1)} Tỷ</div>
          <div style={{ fontSize: 11, color: 'var(--success-color)' }}>HH: {record.commission.toLocaleString('vi-VN')}đ</div>
        </div>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{record.customerName}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{record.customerPhone}</div>
        </div>
      )
    },
    {
      title: 'KPI',
      key: 'kpi',
      width: 90,
      align: 'center',
      render: (_, record) => <Tag color="purple" icon={<GiftOutlined />} style={{ fontWeight: 700 }}>+{record.kpiTriggered}</Tag>
    },
    {
      title: 'Ngày chốt',
      key: 'date',
      width: 120,
      render: (_, record) => {
        const date = record.submittedAt ? new Date(record.submittedAt) : new Date();
        return (
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
              {date.toLocaleDateString('vi-VN')}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => (
        <div>
          <StatusTag status={record.status} />
          {record.approvedBy && <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>bởi {record.approvedBy}</div>}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openDetail(record)}>Chi tiết</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record)}>Sửa</Button>
          {record.status === 'PENDING' && (
            <>
              <Button size="small" danger ghost icon={<CloseCircleOutlined />} onClick={() => { rejectDeal(record.id, currentUser.name); message.warning('Đã bác bỏ.'); }} />
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleApprove(record.id)} />
            </>
          )}
          <Popconfirm title="Xóa giao dịch này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const detailUser = detailRecord ? getUserById(detailRecord.userId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tổng giao dịch</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{stats.total}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Chờ duyệt</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{stats.pending}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Deal thành công</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.approved}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Doanh số đã duyệt</div>
            <div className="outfit-font" style={{ fontSize: 22, fontWeight: 800, color: '#ec4899' }}>{(stats.totalRevenue / 1e9).toFixed(1)} Tỷ</div>
          </div>
        </Col>
      </Row>

      <div className="premium-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search placeholder="Tìm nhân sự, dự án, khách hàng..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />} />
            <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 160 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...(departments || []).map(d => ({ value: d.id, label: d.name }))]} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, { value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
            <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} onChange={(dates, dateStrings) => setDateRange(dateStrings)} style={{ width: 220 }} />
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={openAdd}>Thêm Deal</Button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HomeOutlined style={{ color: '#ec4899', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Giao dịch Chốt căn</h3>
          <Tag color="pink" style={{ marginLeft: 8, fontSize: 11 }}>🎉 Pháo hoa khi duyệt</Tag>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8 }} scroll={{ x: 'max-content' }} style={{ padding: '8px' }} />
      </div>

      {/* Detail Drawer */}
      <Drawer title={null} placement="right" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }}>
        {detailRecord && detailUser && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 8 }}>GIAO DỊCH BẤT ĐỘNG SẢN</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>{detailRecord.projectName}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{(detailRecord.price / 1e9).toFixed(2)} Tỷ đồng</div>
              <div style={{ marginTop: 10 }}><StatusTag status={detailRecord.status} /></div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Agent Info */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>NHÂN SỰ THỰC HIỆN</div>
                <Space size={12}>
                  <Avatar src={detailUser.avatar} size={48} style={{ border: '2px solid var(--primary-color)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>{detailUser.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{detailUser.role} · {getDeptName(detailUser.deptId)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{detailUser.email}</div>
                  </div>
                </Space>
              </div>

              {/* Financial Info */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN TÀI CHÍNH</div>
                <Row gutter={[12, 12]}>
                  {[
                    { label: 'Giá giao dịch', value: `${(detailRecord.price / 1e9).toFixed(2)} Tỷ`, color: '#ec4899' },
                    { label: 'Hoa hồng (3%)', value: `${(detailRecord.commission / 1e6).toFixed(0)} Triệu`, color: '#10b981' },
                    { label: 'KPI Trigger', value: `+${detailRecord.kpiTriggered} pts`, color: '#8b5cf6' },
                  ].map((item, i) => (
                    <Col span={8} key={i}>
                      <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
                        <div className="outfit-font" style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Customer Info */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN KHÁCH HÀNG</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10 }}><UserOutlined style={{ color: 'var(--primary-color)' }} /><div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Tên khách hàng</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.customerName}</div></div></div>
                  <div style={{ display: 'flex', gap: 10 }}><PhoneOutlined style={{ color: 'var(--primary-color)' }} /><div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Điện thoại</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.customerPhone}</div></div></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>LỊCH SỬ GIAO DỊCH</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24', flexShrink: 0 }} />
                    <div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ngày gửi</div><div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{new Date(detailRecord.submittedAt).toLocaleString('vi-VN')}</div></div>
                  </div>
                  {detailRecord.approvedAt && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
                      <div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ngày duyệt (bởi {detailRecord.approvedBy})</div><div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{new Date(detailRecord.approvedAt).toLocaleString('vi-VN')}</div></div>
                    </div>
                  )}
                </div>
              </div>

              {detailRecord.status === 'PENDING' && (
                <Space style={{ width: '100%' }}>
                  <Button danger ghost icon={<CloseCircleOutlined />} style={{ flex: 1 }} onClick={() => handleReject(detailRecord.id)}>Bác bỏ</Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} style={{ flex: 1, backgroundColor: '#ec4899', borderColor: '#ec4899' }} onClick={() => handleApprove(detailRecord.id)}>Duyệt Deal 🎉</Button>
                </Space>
              )}
              <Button icon={<EditOutlined />} block onClick={() => { setDrawerOpen(false); openEdit(detailRecord); }}>Chỉnh sửa</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal title={editingRecord ? 'Chỉnh sửa Giao dịch' : 'Thêm Giao dịch Chốt căn Mới'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText={editingRecord ? 'Lưu' : 'Thêm'} cancelText="Hủy" okButtonProps={{ style: { backgroundColor: '#ec4899', borderColor: '#ec4899' } }} width={560}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="Nhân sự thực hiện" rules={[{ required: true }]}>
            <Select options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="projectName" label="Tên dự án / BĐS" rules={[{ required: true }]}>
                <Input placeholder="Vinhomes Grand Park..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Mã căn/lô" rules={[{ required: true }]}>
                <Input placeholder="S1.01-01" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Giá trị giao dịch (VNĐ)" rules={[{ required: true }]}>
                <Input type="number" placeholder="4500000000" prefix={<DollarOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="commission" label="Hoa hồng (VNĐ)">
                <Input type="number" placeholder="Để trống = tự tính 3%" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn X" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Điện thoại khách hàng">
                <Input placeholder="09xx..." prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="kpiTriggered" label="KPI Trigger (điểm)">
                <Input type="number" placeholder="100" prefix={<GiftOutlined />} />
              </Form.Item>
            </Col>
            {editingRecord && (
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select options={[{ value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
