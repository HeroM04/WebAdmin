import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Modal, Form,
  message, Popconfirm, Row, Col, Upload, Image, DatePicker
} from 'antd';
import dayjs from 'dayjs';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  EyeOutlined, CalendarOutlined, EnvironmentOutlined, UploadOutlined,
  ReloadOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { apiClient } from '../../../utils/apiClient';

const { Search } = Input;
const { TextArea } = Input;

// Build query string helper
const qs = (params = {}) => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

// API layer cho admin quản lý sự kiện
const eventAdminApi = {
  list: (params = {}) => apiClient.get(`/events${qs(params)}`),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (body) => apiClient.post('/events', body),
  update: (id, body) => apiClient.put(`/events/${id}`, body),
  delete: (id) => apiClient.delete(`/events/${id}`),
};

const STATUS_CONFIG = {
  UPCOMING: { color: 'blue', label: 'Sắp diễn ra' },
  ONGOING: { color: 'gold', label: 'Đang diễn ra' },
  ENDED: { color: 'default', label: 'Đã kết thúc' },
};

const TYPE_CONFIG = {
  GENERAL: { color: 'purple', label: 'Sự kiện chung' },
  TRAINING: { color: 'blue', label: 'Đào tạo' },
};

const PAGE_SIZE = 10;

export const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Preview
  const [previewEvent, setPreviewEvent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventAdminApi.list({
        q: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setEvents(res?.content || []);
      setTotal(res?.totalElements || 0);
    } catch (e) {
      message.error('Không thể tải danh sách sự kiện.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Handlers
  const openAddModal = () => {
    setEditingEvent(null);
    setBannerUrl('');
    form.resetFields();
    form.setFieldsValue({ eventType: 'GENERAL', status: 'UPCOMING' });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setBannerUrl(event.bannerImage || '');
    form.setFieldsValue({
      title: event.title,
      eventType: event.eventType || 'GENERAL',
      status: event.status || 'UPCOMING',
      location: event.location,
      description: event.description,
      bannerImage: event.bannerImage,
      startTime: event.startTime ? dayjs(event.startTime) : null,
      endTime: event.endTime ? dayjs(event.endTime) : null,
      participantCount: event.participantCount,
    });
    setIsModalOpen(true);
  };

  const openPreview = async (event) => {
    try {
      const full = await eventAdminApi.getById(event.id);
      setPreviewEvent(full);
    } catch {
      setPreviewEvent(event);
    }
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const dto = {
        title: values.title,
        eventType: values.eventType || 'GENERAL',
        status: values.status || 'UPCOMING',
        location: values.location || '',
        description: values.description || '',
        bannerImage: bannerUrl || values.bannerImage || '',
        startTime: values.startTime ? values.startTime.toISOString() : null,
        endTime: values.endTime ? values.endTime.toISOString() : null,
        participantCount: values.participantCount || 0,
      };

      if (editingEvent) {
        await eventAdminApi.update(editingEvent.id, dto);
        message.success('Cập nhật sự kiện thành công!');
      } else {
        await eventAdminApi.create(dto);
        message.success('Tạo sự kiện thành công!');
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingEvent(null);
      fetchEvents();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || 'Lỗi hệ thống khi lưu sự kiện.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eventAdminApi.delete(id);
      message.success('Đã xóa sự kiện.');
      fetchEvents();
    } catch (e) {
      message.error(e?.message || 'Lỗi xóa sự kiện.');
    }
  };

  // Upload banner
  const handleUpload = async (info) => {
    const file = info.file;
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.upload('/upload/image', file);
      const url = result?.url || result;
      setBannerUrl(url);
      form.setFieldsValue({ bannerImage: url });
      message.success('Upload ảnh thành công!');
    } catch (e) {
      message.error('Upload ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  // Format time
  const formatTime = (iso) => {
    if (!iso) return '—';
    return dayjs(iso).format('HH:mm DD/MM/YYYY');
  };

  // Stats
  const stats = {
    total: total,
    upcoming: events.filter(e => e.status === 'UPCOMING').length,
    ended: events.filter(e => e.status === 'ENDED').length,
    training: events.filter(e => e.eventType === 'TRAINING').length,
  };

  // Table columns
  const columns = [
    {
      title: 'Sự kiện',
      key: 'event',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {record.bannerImage && (
            <Image
              src={record.bannerImage}
              width={80}
              height={52}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              preview={false}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              {record.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 8 }}>
              <span><EnvironmentOutlined style={{ color: '#ef4444', marginRight: 3 }} />{record.location || '—'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 120,
      render: (type) => {
        const cfg = TYPE_CONFIG[type] || { color: 'default', label: type };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div><ClockCircleOutlined style={{ color: '#10b981', marginRight: 4 }} />{formatTime(record.startTime)}</div>
          {record.endTime && (
            <div style={{ color: 'var(--text-secondary)' }}>
              <ClockCircleOutlined style={{ color: '#ef4444', marginRight: 4 }} />{formatTime(record.endTime)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Người tham dự',
      key: 'participants',
      width: 100,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {record.participantCount || 0}
          {record.checkinCount > 0 && (
            <span style={{ color: '#10b981', fontSize: 11 }}> / {record.checkinCount} checkin</span>
          )}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const cfg = STATUS_CONFIG[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openPreview(record)}>Xem</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEditModal(record)}>Sửa</Button>
          <Popconfirm title="Xóa sự kiện này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {[
          { label: 'Tổng sự kiện', value: stats.total, color: '#3b82f6' },
          { label: 'Sắp diễn ra', value: stats.upcoming, color: '#10b981' },
          { label: 'Đã kết thúc', value: stats.ended, color: '#94a3b8' },
          { label: 'Sự kiện đào tạo', value: stats.training, color: '#8b5cf6' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Main Table */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <CalendarOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Danh sách Sự kiện</span>
          </div>
          <Space wrap>
            <Search
              placeholder="Tìm kiếm sự kiện..."
              allowClear
              onSearch={(val) => { setPage(1); setSearch(val); }}
              style={{ width: 250 }}
            />
            <Select
              value={typeFilter}
              onChange={(val) => { setPage(1); setTypeFilter(val); }}
              style={{ width: 150 }}
              placeholder="Tất cả loại"
              allowClear
              options={[
                { value: 'GENERAL', label: 'Sự kiện chung' },
                { value: 'TRAINING', label: 'Đào tạo' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(val) => { setPage(1); setStatusFilter(val); }}
              style={{ width: 150 }}
              placeholder="Tất cả trạng thái"
              allowClear
              options={[
                { value: 'UPCOMING', label: 'Sắp diễn ra' },
                { value: 'ONGOING', label: 'Đang diễn ra' },
                { value: 'ENDED', label: 'Đã kết thúc' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchEvents}>Tải lại</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Thêm sự kiện</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t) => `Tổng ${t} sự kiện`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Add/Edit Event Modal */}
      <Modal
        title={editingEvent ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện Mới'}
        open={isModalOpen}
        onOk={handleSave}
        confirmLoading={saving}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingEvent(null); setBannerUrl(''); }}
        okText={editingEvent ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
        width={680}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tên sự kiện" rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}>
            <Input placeholder="Ví dụ: Hội thảo BĐS Cao cấp 2026..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="eventType" label="Loại sự kiện" initialValue="GENERAL">
                <Select
                  options={[
                    { value: 'GENERAL', label: '🎉 Sự kiện chung' },
                    { value: 'TRAINING', label: '📚 Đào tạo' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="UPCOMING">
                <Select
                  options={[
                    { value: 'UPCOMING', label: '🔜 Sắp diễn ra' },
                    { value: 'ONGOING', label: '🔴 Đang diễn ra' },
                    { value: 'ENDED', label: '✅ Đã kết thúc' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}>
            <Input placeholder="Ví dụ: Khách sạn Intercontinental, Quận 1, TP.HCM" prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startTime" label="Thời gian bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" placeholder="Bắt đầu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="Thời gian kết thúc">
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" placeholder="Kết thúc" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả sự kiện">
            <TextArea rows={4} placeholder="Mô tả chi tiết nội dung sự kiện..." />
          </Form.Item>

          {/* Banner Upload */}
          <Form.Item label="Ảnh banner sự kiện">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? 'Đang tải...' : 'Upload ảnh'}
                </Button>
              </Upload>
              <Form.Item name="bannerImage" noStyle>
                <Input placeholder="Hoặc nhập URL ảnh..." style={{ flex: 1 }} onChange={(e) => setBannerUrl(e.target.value)} />
              </Form.Item>
            </div>
            {bannerUrl && (
              <div style={{ marginTop: 8 }}>
                <Image src={bannerUrl} width={200} height={100} style={{ borderRadius: 8, objectFit: 'cover' }} />
              </div>
            )}
          </Form.Item>

          <Form.Item name="participantCount" label="Số người tham dự dự kiến">
            <Input type="number" min={0} placeholder="0" style={{ width: 200 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={null}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={700}
      >
        {previewEvent && (
          <div>
            {previewEvent.bannerImage && (
              <img
                src={previewEvent.bannerImage}
                alt={previewEvent.title}
                style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
              />
            )}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{previewEvent.title}</h2>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Tag color={TYPE_CONFIG[previewEvent.eventType]?.color || 'default'}>
                {TYPE_CONFIG[previewEvent.eventType]?.label || previewEvent.eventType}
              </Tag>
              <Tag color={STATUS_CONFIG[previewEvent.status]?.color || 'default'}>
                {STATUS_CONFIG[previewEvent.status]?.label || previewEvent.status}
              </Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: '#3b82f6', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Thời gian</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatTime(previewEvent.startTime)}
                    {previewEvent.endTime && ` → ${formatTime(previewEvent.endTime)}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EnvironmentOutlined style={{ color: '#ef4444', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Địa điểm</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{previewEvent.location || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#8b5cf6', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Người tham dự</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {previewEvent.participantCount || 0} người
                    {previewEvent.checkinCount > 0 && ` (${previewEvent.checkinCount} đã checkin)`}
                  </div>
                </div>
              </div>
            </div>

            {previewEvent.description && (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>MÔ TẢ SỰ KIỆN</div>
                <div dangerouslySetInnerHTML={{ __html: previewEvent.description }} />
              </div>
            )}

            {previewEvent.galleryImages?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>HÌNH ẢNH</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {previewEvent.galleryImages.map((img, i) => (
                    <Image key={i} src={img} width={120} height={80} style={{ borderRadius: 8, objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageEvents;
