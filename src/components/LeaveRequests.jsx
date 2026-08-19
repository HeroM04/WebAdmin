import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, message, Row, Col, Modal, Input, Popconfirm, Empty } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ReloadOutlined, CalendarOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';

const STATUS_META = {
  PENDING:   { color: 'warning', icon: <ClockCircleOutlined />,  label: 'Chờ duyệt' },
  APPROVED:  { color: 'success', icon: <CheckCircleOutlined />,  label: 'Vắng có phép (−10đ)' },
  REJECTED:  { color: 'error',   icon: <CloseCircleOutlined />,  label: 'Đã từ chối' },
  UNEXCUSED: { color: 'error',   icon: <ExclamationCircleOutlined />, label: 'Vắng không phép (−15đ)' },
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return <Tag color={meta.color} icon={meta.icon}>{meta.label}</Tag>;
};

const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const fmtDateTime = (t) => (t ? new Date(t).toLocaleString('vi-VN') : '—');

export const LeaveRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [noteModal, setNoteModal] = useState(null); // { record, action }
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/leave-requests');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách đơn xin vắng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doReview = async (record, action, reviewNote) => {
    try {
      await apiClient.put(`/leave-requests/${record.id}/${action}`, { note: reviewNote || null });
      message.success(action === 'approve'
        ? 'Đã duyệt vắng có phép (−10đ KPI).'
        : 'Đã từ chối đơn xin vắng.');
      setNoteModal(null);
      setNote('');
      load();
    } catch (e) {
      message.error(e?.message || 'Lỗi hệ thống');
    }
  };

  const closeDay = async () => {
    try {
      const res = await apiClient.post('/leave-requests/close-day', {});
      message.success(`Đã chốt hôm nay: ${res?.unexcusedCount ?? 0} nhân sự vắng không phép.`);
      load();
    } catch (e) {
      message.error(e?.message || 'Không chốt được ngày hôm nay');
    }
  };

  const filtered = rows.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  const stats = {
    pending:   rows.filter(r => r.status === 'PENDING').length,
    approved:  rows.filter(r => r.status === 'APPROVED').length,
    unexcused: rows.filter(r => r.status === 'UNEXCUSED').length,
    rejected:  rows.filter(r => r.status === 'REJECTED').length,
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{r.userFullName || `#${r.userId}`}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.departmentName || 'Chưa phân phòng'}</div>
        </div>
      )
    },
    {
      title: 'Ngày vắng',
      dataIndex: 'leaveDate',
      key: 'leaveDate',
      width: 120,
      sorter: (a, b) => (a.leaveDate || '').localeCompare(b.leaveDate || ''),
      defaultSortOrder: 'descend',
      render: (d) => <span style={{ fontWeight: 600 }}>{fmtDate(d)}</span>
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (t) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t || '—'}</span>
    },
    {
      title: 'Gửi lúc',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      render: (t) => <span style={{ fontSize: 12 }}>{fmtDateTime(t)}</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 190,
      render: (_, r) => (
        <div>
          <StatusTag status={r.status} />
          {r.reviewedByFullName && (
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>bởi {r.reviewedByFullName}</div>
          )}
          {r.reviewNote && (
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>“{r.reviewNote}”</div>
          )}
        </div>
      )
    },
    {
      title: 'KPI',
      dataIndex: 'kpiPoints',
      key: 'kpiPoints',
      width: 80,
      align: 'center',
      render: (p) => p ? <span style={{ fontWeight: 700, color: 'var(--danger-color)' }}>{p}đ</span>
                       : <span style={{ color: '#cbd5e1' }}>—</span>
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_, r) => {
        if (r.status === 'UNEXCUSED') {
          return <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Hệ thống tự chấm</span>;
        }
        if (r.status === 'PENDING') {
          return (
            <Space size={4}>
              <Button size="small" danger ghost icon={<CloseCircleOutlined />}
                      onClick={() => { setNoteModal({ record: r, action: 'reject' }); setNote(''); }}>
                Từ chối
              </Button>
              <Popconfirm title="Duyệt vắng có phép?" description="Nhân sự sẽ bị trừ 10đ KPI tuần đó."
                          okText="Duyệt" cancelText="Hủy" onConfirm={() => doReview(r, 'approve')}>
                <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                  Duyệt
                </Button>
              </Popconfirm>
            </Space>
          );
        }
        // Đã duyệt / đã từ chối → cho phép đổi quyết định
        const opposite = r.status === 'APPROVED' ? 'reject' : 'approve';
        return (
          <Button size="small" type="link"
                  onClick={() => { setNoteModal({ record: r, action: opposite }); setNote(r.reviewNote || ''); }}>
            {opposite === 'approve' ? 'Duyệt lại' : 'Thu hồi duyệt'}
          </Button>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        {[
          { label: 'Chờ duyệt', value: stats.pending, color: '#fbbf24' },
          { label: 'Vắng có phép', value: stats.approved, color: '#10b981' },
          { label: 'Vắng không phép', value: stats.unexcused, color: '#ef4444' },
          { label: 'Đã từ chối', value: stats.rejected, color: '#94a3b8' },
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
          <Space wrap>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }} options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'APPROVED', label: 'Vắng có phép' },
              { value: 'UNEXCUSED', label: 'Vắng không phép' },
              { value: 'REJECTED', label: 'Đã từ chối' },
            ]} />
            <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {rows.length}
            </span>
          </Space>
          <Popconfirm
            title="Chốt chấm công hôm nay?"
            description="Ai không chấm công và không có đơn được duyệt sẽ bị trừ 15đ (vắng không phép). Hệ thống vẫn tự chạy lúc 23:30 mỗi ngày."
            okText="Chốt ngay" cancelText="Hủy" onConfirm={closeDay}>
            <Button icon={<CalendarOutlined />}>Chốt vắng mặt hôm nay</Button>
          </Popconfirm>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Đơn xin vắng &amp; Vắng mặt</h3>
        </div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
          style={{ padding: 8 }}
          locale={{ emptyText: <Empty description="Chưa có đơn xin vắng nào" /> }}
        />
      </div>

      <Modal
        title={noteModal?.action === 'approve' ? 'Duyệt đơn xin vắng' : 'Từ chối đơn xin vắng'}
        open={!!noteModal}
        onOk={() => doReview(noteModal.record, noteModal.action, note)}
        onCancel={() => { setNoteModal(null); setNote(''); }}
        okText={noteModal?.action === 'approve' ? 'Duyệt (−10đ KPI)' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={noteModal?.action === 'approve'
          ? { style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }
          : { danger: true }}
      >
        {noteModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 13 }}>
              <strong>{noteModal.record.userFullName}</strong> xin vắng ngày{' '}
              <strong>{fmtDate(noteModal.record.leaveDate)}</strong>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid var(--primary-color)', fontSize: 13 }}>
              {noteModal.record.reason}
            </div>
            <Input.TextArea rows={3} value={note} onChange={e => setNote(e.target.value)}
                            placeholder="Ghi chú của Admin (tùy chọn)" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveRequests;
