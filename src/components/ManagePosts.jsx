import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, Progress, Divider, DatePicker } from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined,
  ClockCircleOutlined, ShareAltOutlined, ScanOutlined, PlusOutlined, EditOutlined,
  EyeOutlined, FileImageOutlined, LinkOutlined, RobotOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import { scanPostContent } from '../utils/aiScanner';

const { Search } = Input;

const StatusTag = ({ status }) => {
  if (status === 'APPROVED') return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
  return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
};

const PLATFORM_COLORS = { Facebook: '#1877f2', Zalo: '#0068ff', TikTok: '#010101', Instagram: '#e1306c' };
const PLATFORM_TAG_COLORS = { Facebook: 'blue', Zalo: 'cyan', TikTok: 'purple', Instagram: 'volcano' };

export const ManagePosts = () => {
  const { posts, users, departments, currentUser, approvePost, rejectPost, deletePost, updatePost, addPost } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
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
    return dept ? dept.name : '';
  };

  const filtered = posts.filter(item => {
    const user = getUserById(item.userId);
    const matchName = !search || (user?.name || '').toLowerCase().includes(search.toLowerCase())
      || (item.caption || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchPlatform = platformFilter === 'ALL' || item.platform === platformFilter;
    const matchDept = deptFilter === 'ALL' || (user && user.deptId === deptFilter);
    let matchDate = true;
    if (dateRange && dateRange[0] && dateRange[1] && item.submittedAt) {
      const itemDateStr = item.submittedAt.substring(0, 10);
      matchDate = itemDateStr >= dateRange[0] && itemDateStr <= dateRange[1];
    }
    return matchName && matchStatus && matchPlatform && matchDept && matchDate;
  });

  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === 'PENDING').length,
    approved: posts.filter(p => p.status === 'APPROVED').length,
    rejected: posts.filter(p => p.status === 'REJECTED').length,
  };

  const openDetail = (record) => { setDetailRecord(record); setDrawerOpen(true); };

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ userId: users.find(u => u.role === 'Nhân viên')?.id || users[0]?.id, platform: 'Facebook', status: 'PENDING' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({ userId: record.userId, platform: record.platform, link: record.link, caption: record.caption, status: record.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        if (editingRecord) {
          await updatePost({ ...editingRecord, ...values });
        } else {
          await addPost(values);
        }
        message.success(editingRecord ? 'Đã cập nhật bài đăng!' : 'Đã thêm bài đăng mới!');
        setModalOpen(false);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      message.success('Đã xóa.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approvePost(id, currentUser.name);
      message.success('Đã duyệt. (+15 KPI)');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectPost(id, currentUser.name);
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
      width: 150,
      render: (_, record) => {
        const user = getUserById(record.userId);
        return (
          <Space>
            <Avatar src={user?.avatar} size="small" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user?.name || 'Ẩn danh'}</div>
              <Tag color={PLATFORM_TAG_COLORS[record.platform] || 'default'} style={{ fontSize: 10, marginTop: 2 }}>{record.platform}</Tag>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Nội dung bài đăng',
      key: 'caption',
      width: 240,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal', wordBreak: 'break-word', marginBottom: 4 }}>
            {record.caption}
          </div>
          <a href={record.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--primary-color)' }}>
            <LinkOutlined style={{ marginRight: 4 }} />Xem bài gốc
          </a>
        </div>
      )
    },
    {
      title: 'AI Scan',
      key: 'ai',
      width: 150,
      render: (_, record) => {
        const result = scanPostContent(record.caption);
        return (
          <div style={{ minWidth: 130 }}>
            <Tag color={result.suggestion === 'RECOMMEND' ? 'success' : 'error'} icon={result.suggestion === 'RECOMMEND' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} style={{ fontSize: 10, marginBottom: 4, display: 'block' }}>
              {result.suggestion === 'RECOMMEND' ? 'KHUYÊN DUYỆT' : 'CẦN XEM XÉT'}
            </Tag>
            <Progress percent={result.score} size="small" showInfo={false} strokeColor={result.suggestion === 'RECOMMEND' ? '#10b981' : '#f87171'} railColor="var(--border-color)" />
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
          <Popconfirm title="Xóa bài đăng này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const detailUser = detailRecord ? getUserById(detailRecord.userId) : null;
  const detailAI = detailRecord ? scanPostContent(detailRecord.caption) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        {[
          { label: 'Tổng bài đăng', value: stats.total, color: '#3b82f6' },
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
            <Search placeholder="Tìm theo nhân sự hoặc nội dung..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />} />
            <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 150 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...(departments || []).map(d => ({ value: d.id, label: d.name }))]} />
            <Select value={platformFilter} onChange={setPlatformFilter} style={{ width: 130 }} options={[{ value: 'ALL', label: 'Tất cả nền tảng' }, { value: 'Facebook', label: 'Facebook' }, { value: 'Zalo', label: 'Zalo' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Instagram', label: 'Instagram' }]} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }} options={[{ value: 'ALL', label: 'Trạng thái' }, { value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Từ chối' }]} />
            <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} onChange={(dates, dateStrings) => setDateRange(dateStrings)} style={{ width: 220 }} />
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={openAdd}>Thêm Bài đăng</Button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileImageOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Bài đăng Lan tỏa BĐS</h3>
          <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}><ScanOutlined /> AI Scanner</Tag>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 6 }} scroll={{ x: 800 }} style={{ padding: '8px' }} />
      </div>

      {/* Detail Drawer */}
      <Drawer title={null} placement="right" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }}>
        {detailRecord && detailUser && detailAI && (
          <div>
            {/* Header with platform color */}
            <div style={{ background: `linear-gradient(135deg, ${PLATFORM_COLORS[detailRecord.platform] || '#3b82f6'} 0%, #8b5cf6 100%)`, padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <Space size={14} align="start">
                <Avatar src={detailUser.avatar} size={56} style={{ border: '3px solid rgba(255,255,255,0.5)' }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{detailUser.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Chia sẻ trên <strong>{detailRecord.platform}</strong></div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{new Date(detailRecord.submittedAt).toLocaleString('vi-VN')}</div>
                  <div style={{ marginTop: 8 }}><StatusTag status={detailRecord.status} /></div>
                </div>
              </Space>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Post content */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>NỘI DUNG BÀI ĐĂNG</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `3px solid ${PLATFORM_COLORS[detailRecord.platform] || '#3b82f6'}` }}>
                  {detailRecord.caption}
                </div>
                <div style={{ marginTop: 10 }}>
                  <a href={detailRecord.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontSize: 12 }}>
                    <LinkOutlined style={{ marginRight: 6 }} />Xem bài viết gốc trên {detailRecord.platform}
                  </a>
                </div>
              </div>

              {/* AI Result */}
              <div className="premium-card" style={{ padding: 16, background: detailAI.suggestion === 'RECOMMEND' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderColor: detailAI.suggestion === 'RECOMMEND' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <RobotOutlined style={{ color: detailAI.suggestion === 'RECOMMEND' ? 'var(--success-color)' : 'var(--danger-color)', fontSize: 18 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Kết quả AI Mock Scanner</div>
                </div>
                <Tag color={detailAI.suggestion === 'RECOMMEND' ? 'success' : 'error'} icon={detailAI.suggestion === 'RECOMMEND' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} style={{ fontSize: 13, padding: '4px 12px', fontWeight: 700, marginBottom: 10, display: 'inline-flex' }}>
                  {detailAI.suggestion === 'RECOMMEND' ? '✅ KHUYÊN DUYỆT' : '❌ CẦN XEM XÉT'}
                </Tag>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>Độ tương quan từ khóa BĐS:</span><strong style={{ color: 'var(--text-primary)' }}>{detailAI.score}%</strong>
                  </div>
                  <Progress percent={detailAI.score} strokeColor={detailAI.suggestion === 'RECOMMEND' ? '#10b981' : '#f87171'} railColor="var(--border-color)" size="small" showInfo={false} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{detailAI.reason}</div>
              </div>

              {detailRecord.approvedBy && (
                <div className="premium-card" style={{ padding: 14, background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-color)', marginBottom: 6 }}>DUYỆT BỞI</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailRecord.approvedBy}</strong>
                  {detailRecord.approvedAt && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(detailRecord.approvedAt).toLocaleString('vi-VN')}</div>}
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
      <Modal title={editingRecord ? 'Chỉnh sửa Bài đăng' : 'Thêm Bài đăng Mới'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText={editingRecord ? 'Lưu' : 'Thêm'} cancelText="Hủy" okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }} width={540}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="Nhân sự" rules={[{ required: true }]}>
            <Select options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="platform" label="Nền tảng" rules={[{ required: true }]}>
                <Select options={[{ value: 'Facebook', label: 'Facebook' }, { value: 'Zalo', label: 'Zalo' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Instagram', label: 'Instagram' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {editingRecord && (
                <Form.Item name="status" label="Trạng thái">
                  <Select options={[{ value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
                </Form.Item>
              )}
            </Col>
          </Row>
          <Form.Item name="link" label="Link bài viết" rules={[{ required: true }]}>
            <Input placeholder="https://facebook.com/..." prefix={<LinkOutlined />} />
          </Form.Item>
          <Form.Item name="caption" label="Nội dung caption" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="Nhập nội dung bài đăng về BĐS..." showCount maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
