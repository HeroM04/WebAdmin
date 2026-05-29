import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, List, Avatar, Button, Input, Space, Tag, Badge, notification, Select, Rate, Divider } from 'antd';
import { 
  MessageOutlined, SendOutlined, PlayCircleOutlined, PauseCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SmileOutlined, ToolOutlined,
  BuildOutlined, DollarOutlined, ExclamationCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

// Mock feedback bank removed

const CATEGORY_CONFIG = {
  'Công cụ làm việc': { icon: <ToolOutlined />, color: 'blue' },
  'Chính sách thưởng': { icon: <DollarOutlined />, color: 'gold' },
  'Cơ sở vật chất': { icon: <BuildOutlined />, color: 'orange' },
  'Tài liệu bán hàng': { icon: <MessageOutlined />, color: 'cyan' },
  'Môi trường làm việc': { icon: <SmileOutlined />, color: 'green' },
  'Khác': { icon: <ExclamationCircleOutlined />, color: 'default' },
};

export const Feedback = () => {
  const { feedbacks, addFeedback, replyToFeedback, deleteFeedback, currentUser } = useContext(AppContext);
  const [replyInputs, setReplyInputs] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stats
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'PENDING' || f.status === 'UNREAD').length,
    resolved: feedbacks.filter(f => f.status === 'RESOLVED').length,
    avgRating: feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : '0.0'
  };

  const handleReply = async (id) => {
    const replyText = replyInputs[id];
    if (!replyText || !replyText.trim()) {
      message.error('Vui lòng nhập nội dung phản hồi!');
      return;
    }
    try {
      await replyToFeedback(id, replyText, currentUser.name);
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      notification.success({ message: 'Đã phản hồi góp ý nhân sự!', duration: 2 });
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      message.success('Đã xóa góp ý.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchCategory && matchStatus;
  });

  const allCategories = [...new Set(feedbacks.map(f => f.category).filter(Boolean))];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
            Ý kiến & Góp ý Nhân sự
            <Tag color="orange" style={{ borderRadius: 12 }}>{stats.pending} chờ duyệt</Tag>
          </h2>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <div className="premium-card hover-lift" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Tổng góp ý</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-color)' }}>{stats.total}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="premium-card hover-lift" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Chờ xử lý</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning-color)' }}>{stats.pending}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="premium-card hover-lift" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Đã giải quyết</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success-color)' }}>{stats.resolved}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="premium-card hover-lift" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Mức độ hài lòng TB</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning-color)' }}>{stats.avgRating}<span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>/5</span></div>
            </div>
          </Col>
        </Row>

        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'PENDING', label: '🟡 Chờ xử lý' },
              { value: 'RESOLVED', label: '🟢 Đã giải quyết' },
            ]} />
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}
            options={[
              { value: 'ALL', label: 'Tất cả danh mục' },
              ...allCategories.map(c => ({ value: c, label: c }))
            ]} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)', margin: '0 4px' }}>{filteredFeedbacks.length}</strong> / {feedbacks.length} góp ý
          </span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageOutlined style={{ color: 'var(--primary-color)' }} /> Ý kiến & Góp ý của Nhân sự
          </h3>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <SmileOutlined style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }} />
            <p>Chưa có góp ý nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={filteredFeedbacks}
            pagination={{ pageSize: 5, showSizeChanger: false }}
            renderItem={(fb) => {
              const catConfig = CATEGORY_CONFIG[fb.category] || CATEGORY_CONFIG['Khác'];
              return (
                <List.Item
                  key={fb.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Space size="middle">
                      <Avatar style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--primary-color)', fontWeight: 700, fontSize: 16 }} size={42}>
                        {(fb.senderFullName || fb.senderName || '?').charAt(0)}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{fb.senderFullName || fb.senderName || 'Ẩn danh'}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fb.senderRole || 'Nhân viên'}</span>
                          <span style={{ color: 'var(--border-color)' }}>•</span>
                          <Tag color={catConfig.color} icon={catConfig.icon} style={{ fontSize: 10, margin: 0 }}>
                            {fb.category}
                          </Tag>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {new Date(fb.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </Space>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Rate disabled defaultValue={fb.rating} style={{ fontSize: 14, color: '#fbbf24' }} />
                      <Tag color={fb.status === 'RESOLVED' ? 'success' : 'warning'}
                        icon={fb.status === 'RESOLVED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      >
                        {fb.status === 'RESOLVED' ? 'Đã xử lý' : 'Chờ xử lý'}
                      </Tag>
                      <Button
                        size="small" type="text"
                        icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />}
                        onClick={() => handleDelete(fb.id)}
                        title="Xóa góp ý"
                      />
                    </div>
                  </div>

                  {/* Message content */}
                  <div style={{
                    color: 'var(--text-primary)', fontSize: 13, marginLeft: 58,
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '12px 16px', borderRadius: 10,
                    borderLeft: '3px solid var(--primary-color)',
                    marginBottom: 12, lineHeight: 1.6
                  }}>
                    "{fb.content || fb.message}"
                  </div>

                  {/* Admin reply or reply form */}
                  {fb.adminReply ? (
                    <div style={{
                      marginLeft: 58, padding: '10px 14px',
                      background: 'rgba(16, 185, 129, 0.06)',
                      borderRadius: 8, borderLeft: '3px solid var(--success-color)',
                      fontSize: 12
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-color)', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        Phản hồi từ {fb.resolvedByFullName || fb.resolvedBy || 'Admin'}:
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{fb.adminReply}</div>
                      {fb.resolvedAt && (
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                          {new Date(fb.resolvedAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginLeft: 58, display: 'flex', gap: 8 }}>
                      <Input
                        placeholder="Nhập phản hồi cho nhân sự..."
                        size="small"
                        value={replyInputs[fb.id] || ''}
                        onChange={e => setReplyInputs(prev => ({ ...prev, [fb.id]: e.target.value }))}
                        onPressEnter={() => handleReply(fb.id)}
                        style={{ fontSize: '12px', flex: 1 }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                        onClick={() => handleReply(fb.id)}
                      />
                    </div>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};
