import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Modal, Form,
  message, Popconfirm, Row, Col, Upload, Image, Spin, DatePicker
} from 'antd';
import dayjs from 'dayjs';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  EyeOutlined, FileTextOutlined, UploadOutlined, ReloadOutlined
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

// API layer cho admin quản lý tin tức
const newsAdminApi = {
  list: (params = {}) => apiClient.get(`/news${qs(params)}`),
  getById: (id) => apiClient.get(`/news/${id}`),
  create: (body) => apiClient.post('/news', body),
  update: (id, body) => apiClient.put(`/news/${id}`, body),
  delete: (id) => apiClient.delete(`/news/${id}`),
  categories: () => apiClient.get('/news/categories'),
  tags: () => apiClient.get('/news/tags'),
  // Category CRUD
  createCategory: (body) => apiClient.post('/news/categories', body),
  updateCategory: (id, body) => apiClient.put(`/news/categories/${id}`, body),
  deleteCategory: (id) => apiClient.delete(`/news/categories/${id}`),
};

const STATUS_CONFIG = {
  PUBLISHED: { color: 'success', label: 'Đã xuất bản' },
  DRAFT: { color: 'default', label: 'Bản nháp' },
  ARCHIVED: { color: 'warning', label: 'Lưu trữ' },
};

const PAGE_SIZE = 10;

export const ManageNews = () => {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Preview
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm] = Form.useForm();
  const [editingCat, setEditingCat] = useState(null);
  const [catSaving, setCatSaving] = useState(false);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsAdminApi.list({
        q: search || undefined,
        categoryId: categoryFilter || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setArticles(res?.content || []);
      setTotal(res?.totalElements || 0);
    } catch (e) {
      message.error('Không thể tải danh sách tin tức.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  // Fetch categories & tags
  const fetchMeta = useCallback(async () => {
    try {
      const [cats, tgs] = await Promise.all([
        newsAdminApi.categories().catch(() => []),
        newsAdminApi.tags().catch(() => []),
      ]);
      setCategories(cats || []);
      setTags(tgs || []);
    } catch {}
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  // Handlers
  const openAddModal = () => {
    setEditingArticle(null);
    setThumbnailUrl('');
    form.resetFields();
    form.setFieldsValue({ status: 'DRAFT' });
    setIsModalOpen(true);
  };

  const openEditModal = async (article) => {
    setEditingArticle(article);
    setThumbnailUrl(article.thumbnail || '');
    form.setFieldsValue({
      title: article.title,
      categoryId: article.categoryId,
      summary: article.summary,
      content: article.content,
      author: article.author,
      tags: article.tags || [],
      status: article.status || 'DRAFT',
      thumbnail: article.thumbnail,
      publishedAt: article.publishedAt ? dayjs(article.publishedAt) : null,
    });
    setIsModalOpen(true);
  };

  const openPreview = async (article) => {
    try {
      const full = await newsAdminApi.getById(article.id);
      setPreviewArticle(full);
    } catch {
      setPreviewArticle(article);
    }
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const dto = {
        title: values.title,
        categoryId: values.categoryId || null,
        summary: values.summary || '',
        content: values.content || '',
        author: values.author || '',
        tags: values.tags || [],
        status: values.status || 'DRAFT',
        thumbnail: thumbnailUrl || values.thumbnail || '',
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : null,
      };

      if (editingArticle) {
        await newsAdminApi.update(editingArticle.id, dto);
        message.success('Cập nhật bài viết thành công!');
      } else {
        await newsAdminApi.create(dto);
        message.success('Tạo bài viết thành công!');
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingArticle(null);
      fetchArticles();
    } catch (e) {
      if (e?.errorFields) return; // form validation
      message.error(e?.message || 'Lỗi hệ thống khi lưu bài viết.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await newsAdminApi.delete(id);
      message.success('Đã xóa bài viết.');
      fetchArticles();
    } catch (e) {
      message.error(e?.message || 'Lỗi xóa bài viết.');
    }
  };

  // Upload thumbnail
  const handleUpload = async (info) => {
    const file = info.file;
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.upload('/upload/image', file);
      const url = result?.url || result;
      setThumbnailUrl(url);
      form.setFieldsValue({ thumbnail: url });
      message.success('Upload ảnh thành công!');
    } catch (e) {
      message.error('Upload ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  // Category CRUD
  const openAddCat = () => {
    setEditingCat(null);
    catForm.resetFields();
    setCatModalOpen(true);
  };

  const openEditCat = (cat) => {
    setEditingCat(cat);
    catForm.setFieldsValue({ name: cat.name, sortOrder: cat.sortOrder });
    setCatModalOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      const values = await catForm.validateFields();
      setCatSaving(true);
      if (editingCat) {
        await newsAdminApi.updateCategory(editingCat.id, values);
        message.success('Cập nhật chuyên mục thành công!');
      } else {
        await newsAdminApi.createCategory(values);
        message.success('Tạo chuyên mục thành công!');
      }
      setCatModalOpen(false);
      catForm.resetFields();
      fetchMeta();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || 'Lỗi hệ thống.');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCat = async (id) => {
    try {
      await newsAdminApi.deleteCategory(id);
      message.success('Đã xóa chuyên mục.');
      fetchMeta();
    } catch (e) {
      message.error(e?.message || 'Lỗi xóa chuyên mục.');
    }
  };

  // Stats
  const stats = {
    total: total,
    published: articles.filter(a => a.status === 'PUBLISHED').length,
    draft: articles.filter(a => a.status === 'DRAFT').length,
    categories: categories.length,
  };

  // Table columns
  const columns = [
    {
      title: 'Bài viết',
      key: 'article',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {record.thumbnail && (
            <Image
              src={record.thumbnail}
              width={64}
              height={48}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              preview={false}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>
              {record.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {record.author && <span>✍️ {record.author}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 140,
      render: (text) => text ? (
        <Tag color="blue">{text}</Tag>
      ) : (
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 130,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 90,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val || 0}</span>,
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
          <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
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
          { label: 'Tổng bài viết', value: stats.total, color: '#3b82f6' },
          { label: 'Đã xuất bản', value: stats.published, color: '#10b981' },
          { label: 'Bản nháp', value: stats.draft, color: '#fbbf24' },
          { label: 'Chuyên mục', value: stats.categories, color: '#8b5cf6' },
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
            <FileTextOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Danh sách Tin tức</span>
          </div>
          <Space wrap>
            <Search
              placeholder="Tìm kiếm bài viết..."
              allowClear
              onSearch={(val) => { setPage(1); setSearch(val); }}
              style={{ width: 250 }}
            />
            <Select
              value={categoryFilter}
              onChange={(val) => { setPage(1); setCategoryFilter(val); }}
              style={{ width: 180 }}
              placeholder="Tất cả chuyên mục"
              allowClear
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => { fetchArticles(); fetchMeta(); }}>Tải lại</Button>
            <Button icon={<PlusOutlined />} onClick={openAddCat}>Thêm chuyên mục</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Thêm bài viết</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t) => `Tổng ${t} bài viết`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: 0.5 }}>DANH SÁCH CHUYÊN MỤC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(cat => (
              <Tag
                key={cat.id}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}
                color="blue"
                closable
                onClose={(e) => { e.preventDefault(); handleDeleteCat(cat.id); }}
                onClick={() => openEditCat(cat)}
              >
                {cat.name} ({cat.articleCount || 0})
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Article Modal */}
      <Modal
        title={editingArticle ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết Mới'}
        open={isModalOpen}
        onOk={handleSave}
        confirmLoading={saving}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingArticle(null); setThumbnailUrl(''); }}
        okText={editingArticle ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
        width={680}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Ví dụ: Xu hướng BĐS 2026..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Chuyên mục">
                <Select
                  placeholder="Chọn chuyên mục"
                  allowClear
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="author" label="Tác giả">
                <Input placeholder="Tên tác giả" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="summary" label="Tóm tắt">
            <TextArea rows={2} placeholder="Mô tả ngắn gọn nội dung bài viết..." />
          </Form.Item>

          <Form.Item name="content" label="Nội dung chi tiết">
            <TextArea rows={6} placeholder="Nội dung HTML hoặc text đầy đủ..." />
          </Form.Item>

          {/* Thumbnail Upload */}
          <Form.Item label="Ảnh đại diện (Thumbnail)">
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
              <Form.Item name="thumbnail" noStyle>
                <Input placeholder="Hoặc nhập URL ảnh..." style={{ flex: 1 }} onChange={(e) => setThumbnailUrl(e.target.value)} />
              </Form.Item>
            </div>
            {thumbnailUrl && (
              <div style={{ marginTop: 8 }}>
                <Image src={thumbnailUrl} width={120} height={80} style={{ borderRadius: 8, objectFit: 'cover' }} />
              </div>
            )}
          </Form.Item>

          <Form.Item name="tags" label="Thẻ (Tags)">
            <Select mode="tags" placeholder="Nhập tag và nhấn Enter" tokenSeparators={[',']}>
              {tags.map(t => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="DRAFT">
                <Select
                  options={[
                    { value: 'DRAFT', label: '📝 Bản nháp' },
                    { value: 'PUBLISHED', label: '✅ Xuất bản' },
                    { value: 'ARCHIVED', label: '📦 Lưu trữ' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publishedAt" label="Ngày xuất bản">
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" placeholder="Chọn ngày giờ" />
              </Form.Item>
            </Col>
          </Row>
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
        {previewArticle && (
          <div>
            {previewArticle.thumbnail && (
              <img
                src={previewArticle.thumbnail}
                alt={previewArticle.title}
                style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
              />
            )}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{previewArticle.title}</h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {previewArticle.categoryName && <Tag color="blue">{previewArticle.categoryName}</Tag>}
              <Tag color={STATUS_CONFIG[previewArticle.status]?.color || 'default'}>
                {STATUS_CONFIG[previewArticle.status]?.label || previewArticle.status}
              </Tag>
              {previewArticle.publishedAt && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  📅 {dayjs(previewArticle.publishedAt).format('DD/MM/YYYY HH:mm')}
                </span>
              )}
              {previewArticle.author && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✍️ {previewArticle.author}</span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👁️ {previewArticle.viewCount || 0} lượt xem</span>
            </div>
            {previewArticle.summary && (
              <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16, borderLeft: '3px solid #3b82f6', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                {previewArticle.summary}
              </div>
            )}
            <div
              style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: previewArticle.content || '<i>Chưa có nội dung</i>' }}
            />
            {previewArticle.tags?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {previewArticle.tags.map(t => <Tag key={t} style={{ borderRadius: 16 }}>{t}</Tag>)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Category Add/Edit Modal */}
      <Modal
        title={editingCat ? 'Chỉnh sửa Chuyên mục' : 'Thêm Chuyên mục Mới'}
        open={catModalOpen}
        onOk={handleSaveCat}
        confirmLoading={catSaving}
        onCancel={() => { setCatModalOpen(false); catForm.resetFields(); setEditingCat(null); }}
        okText={editingCat ? 'Lưu' : 'Tạo mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
        width={420}
      >
        <Form form={catForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên chuyên mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Thị trường BĐS" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự sắp xếp" initialValue={0}>
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageNews;
