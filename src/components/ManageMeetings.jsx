import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, Tooltip, Divider, DatePicker } from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined,
  ClockCircleOutlined, EnvironmentOutlined, FileTextOutlined, PlusOutlined,
  EditOutlined, EyeOutlined, SolutionOutlined, PhoneOutlined, CalendarOutlined, UserOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Search } = Input;

const StatusTag = ({ status }) => {
  if (status === 'APPROVED') return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
  return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
};

export const ManageMeetings = () => {
  const { meetings, users, departments, currentUser, approveMeeting, rejectMeeting, deleteMeeting, updateMeeting, addMeeting } = useContext(AppContext);
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

  const filtered = meetings.filter(item => {
    const user = getUserById(item.userId);
    const matchName = !search || (user?.name || '').toLowerCase().includes(search.toLowerCase());
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
    total: meetings.length,
    pending: meetings.filter(m => m.status === 'PENDING').length,
    approved: meetings.filter(m => m.status === 'APPROVED').length,
    rejected: meetings.filter(m => m.status === 'REJECTED').length,
  };

  const openDetail = (record) => { setDetailRecord(record); setDrawerOpen(true); };

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ userId: users.find(u => u.role === 'Nhân viên')?.id || users[0]?.id, status: 'PENDING', submittedAt: new Date().toISOString().slice(0, 16) });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({ userId: record.userId, submittedAt: record.submittedAt?.slice(0, 16), project: record.project, content: record.content, status: record.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        const dto = {
          ...values,
          project: values.project,
          content: values.content,
        };
        if (editingRecord) {
          await updateMeeting({ ...editingRecord, ...dto });
        } else {
          await addMeeting(dto);
        }
        message.success(editingRecord ? 'Đã cập nhật báo cáo!' : 'Đã thêm báo cáo thực chiến!');
        setModalOpen(false);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteMeeting(id);
      message.success('Đã xóa.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveMeeting(id, currentUser.name);
      message.success('Đã duyệt. (+20 KPI)');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMeeting(id, currentUser.name);
      message.warning('Đã từ chối.');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'user',
      width: 160,
      render: (_, record) => {
        const user = getUserById(record.userId);
        return (
          <Space>
            <Avatar src={user?.avatar} size="small" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user?.name || 'Ẩn danh'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{getDeptName(user?.deptId)}</div>
            </div>
          </Space>
        );
      }
    },

    {
      title: 'Thời gian & Địa điểm',
      key: 'submittedAt',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{new Date(record.submittedAt).toLocaleString('vi-VN')}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}><EnvironmentOutlined style={{ color: '#ef4444', marginRight: 4 }} />{record.location || record.project}</div>
        </div>
      )
    },
    {
      title: 'Nội dung báo cáo',
      dataIndex: 'content',
      key: 'content',
      width: 220,
      render: (text) => (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal', wordBreak: 'break-word' }}>
          <FileTextOutlined style={{ marginRight: 4, color: 'var(--primary-color)', flexShrink: 0 }} />{text}
        </div>
      )
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openDetail(record)}>Chi tiết</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record)}>Sửa</Button>
          {record.status === 'PENDING' && (
            <>
              <Button size="small" danger ghost icon={<CloseCircleOutlined />} onClick={() => handleReject(record.id)} />
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleApprove(record.id)} />
            </>
          )}
          <Popconfirm title="Xóa báo cáo này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
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
        {[
          { label: 'Tổng báo cáo', value: stats.total, color: '#3b82f6' },
          { label: 'Chờ duyệt', value: stats.pending, color: '#fbbf24' },
          { label: 'Đã duyệt', value: stats.approved, color: '#10b981' },
          { label: 'Đã từ chối', value: stats.rejected, color: '#ef4444' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="premium-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search placeholder="Tìm theo tên nhân sự hoặc khách hàng..." allowClear style={{ width: 260 }} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />} />
            <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 160 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...(departments || []).map(d => ({ value: d.id, label: d.name }))]} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, { value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
            <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} onChange={(dates, dateStrings) => setDateRange(dateStrings)} style={{ width: 220 }} />
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={openAdd}>Thêm Báo cáo</Button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SolutionOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Báo cáo Thực chiến</h3>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8 }} scroll={{ x: 'max-content' }} style={{ padding: '8px' }} />
      </div>

      {/* Detail Drawer */}
      <Drawer title={null} placement="right" width={500} open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }}>
        {detailRecord && detailUser && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <Space size={16} align="start">
                <Avatar src={detailUser.avatar} size={60} style={{ border: '3px solid rgba(255,255,255,0.5)' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{detailUser.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Báo cáo thực chiến</div>
                  <div style={{ marginTop: 8 }}><StatusTag status={detailRecord.status} /></div>
                </div>
              </Space>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>


              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN CUỘC GẶP</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <CalendarOutlined style={{ color: '#8b5cf6' }} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Thời gian</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(detailRecord.submittedAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <EnvironmentOutlined style={{ color: '#ef4444' }} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Địa điểm</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.location || detailRecord.project}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>NỘI DUNG BÁO CÁO</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, borderLeft: '3px solid #8b5cf6' }}>
                  {detailRecord.content}
                </div>
              </div>

              {/* ẢNH MINH CHỨNG */}
              {detailRecord.photoUrl && (
                <div className="premium-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>
                    📷 ẢNH MINH CHỨNG THỰC ĐỊA
                  </div>
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                    <img
                      src={detailRecord.photoUrl}
                      alt="Ảnh minh chứng thực chiến"
                      style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                      onClick={() => window.open(detailRecord.photoUrl, '_blank')}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-secondary)', fontSize: 13, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      ⚠️ Không thể tải ảnh
                    </div>
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>
                      Nhấn để xem đầy đủ
                    </div>
                  </div>
                </div>
              )}

              {detailRecord.approvedBy && (
                <div className="premium-card" style={{ padding: 16, background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-color)', letterSpacing: 1, marginBottom: 8 }}>DUYỆT BỞI</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.approvedBy}</div>
                  {detailRecord.approvedAt && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(detailRecord.approvedAt).toLocaleString('vi-VN')}</div>}
                </div>
              )}

              {detailRecord.status === 'PENDING' && (
                <Space style={{ width: '100%' }}>
                  <Button danger ghost icon={<CloseCircleOutlined />} style={{ flex: 1 }} onClick={() => handleReject(detailRecord.id)}>Từ chối</Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} style={{ flex: 1, backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleApprove(detailRecord.id)}>Phê duyệt</Button>
                </Space>
              )}
              <Button icon={<EditOutlined />} block onClick={() => { setDrawerOpen(false); openEdit(detailRecord); }}>Chỉnh sửa</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal title={editingRecord ? 'Chỉnh sửa Báo cáo Thực chiến' : 'Thêm Báo cáo Thực chiến Mới'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText={editingRecord ? 'Lưu' : 'Thêm'} cancelText="Hủy" okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }} width={540}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="Nhân sự thực hiện" rules={[{ required: true }]}>
            <Select options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="submittedAt" label="Thời gian cuộc gặp" rules={[{ required: true }]}>
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project" label="Địa điểm" rules={[{ required: true }]}>
                <Input placeholder="Cà phê/Văn phòng..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="Nội dung báo cáo" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Mô tả nội dung cuộc gặp, kết quả đạt được..." />
          </Form.Item>
          {editingRecord && (
            <Form.Item name="status" label="Trạng thái">
              <Select options={[{ value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
