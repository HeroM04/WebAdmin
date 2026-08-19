import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, message, Row, Col, Modal, Input, Popconfirm, Empty, Form, DatePicker } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ReloadOutlined, GiftOutlined, PhoneOutlined, UserAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';

const STATUS_META = {
  PENDING:  { color: 'warning', icon: <ClockCircleOutlined />, label: 'Chờ duyệt' },
  APPROVED: { color: 'success', icon: <CheckCircleOutlined />, label: 'Đã duyệt · đã mở tài khoản' },
  REJECTED: { color: 'error',   icon: <CloseCircleOutlined />, label: 'Đã từ chối' },
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return <Tag color={meta.color} icon={meta.icon}>{meta.label}</Tag>;
};

const fmtDateTime = (t) => (t ? new Date(t).toLocaleString('vi-VN') : '—');
const fmtDate = (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—');

export const ReferralSubmissions = () => {
  const { departments, refreshData } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/referral-submissions');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách đơn giới thiệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openApprove = (record) => {
    setApproving(record);
    form.resetFields();
    form.setFieldsValue({
      departmentId: departments[0]?.id,
      role: 'SALE',
      joinedDate: dayjs(),
      password: '',
    });
  };

  const doApprove = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        departmentId: values.departmentId,
        role: values.role,
        joinedDate: values.joinedDate ? values.joinedDate.format('YYYY-MM-DD') : null,
        password: values.password || null,
        note: values.note || null,
      };
      const created = await apiClient.put(`/referral-submissions/${approving.id}/approve`, payload);
      message.success(`Đã mở tài khoản cho ${created?.fullName || approving.candidateName}.`);
      setApproving(null);
      load();
      refreshData?.();
    } catch (e) {
      if (e?.errorFields) return; // lỗi validate form, antd đã hiện sẵn
      message.error(e?.message || 'Không duyệt được đơn');
    }
  };

  const doReject = async () => {
    try {
      await apiClient.put(`/referral-submissions/${rejecting.id}/reject`, { note: rejectNote || null });
      message.success('Đã từ chối đơn giới thiệu.');
      setRejecting(null);
      setRejectNote('');
      load();
    } catch (e) {
      message.error(e?.message || 'Không từ chối được đơn');
    }
  };

  const filtered = rows.filter(r => statusFilter === 'ALL' || r.status === statusFilter);
  const stats = {
    pending:  rows.filter(r => r.status === 'PENDING').length,
    approved: rows.filter(r => r.status === 'APPROVED').length,
    rewarded: rows.filter(r => r.rewardGranted).length,
    rejected: rows.filter(r => r.status === 'REJECTED').length,
  };

  const columns = [
    {
      title: 'Người giới thiệu',
      key: 'referrer',
      width: 180,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {r.referrerFullName || `#${r.referrerId}`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {r.referrerDepartmentName || 'Chưa phân phòng'}
          </div>
        </div>
      )
    },
    {
      title: 'Ứng viên',
      key: 'candidate',
      width: 190,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{r.candidateName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />{r.candidatePhone}
          </div>
        </div>
      )
    },
    {
      title: 'Ghi chú của người giới thiệu',
      dataIndex: 'note',
      key: 'note',
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
      width: 220,
      render: (_, r) => (
        <div>
          <StatusTag status={r.status} />
          {r.status === 'APPROVED' && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
              Vào làm {fmtDate(r.joinedDate)}
            </div>
          )}
          {r.reviewNote && (
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>“{r.reviewNote}”</div>
          )}
        </div>
      )
    },
    {
      title: 'Điểm gieo hạt',
      key: 'reward',
      width: 170,
      render: (_, r) => {
        if (r.status !== 'APPROVED') return <span style={{ color: '#cbd5e1' }}>—</span>;
        if (r.rewardGranted) {
          return <Tag color="success">Đã cộng +15đ</Tag>;
        }
        return (
          <Tag color="processing">
            Chờ đủ tháng {fmtDate(r.rewardDate)}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 190,
      fixed: 'right',
      render: (_, r) => {
        if (r.status !== 'PENDING') {
          return <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {r.reviewedByFullName ? `bởi ${r.reviewedByFullName}` : '—'}
          </span>;
        }
        return (
          <Space size={4}>
            <Button size="small" danger ghost icon={<CloseCircleOutlined />}
                    onClick={() => { setRejecting(r); setRejectNote(''); }}>
              Từ chối
            </Button>
            <Button size="small" type="primary" icon={<UserAddOutlined />}
                    style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                    onClick={() => openApprove(r)}>
              Duyệt &amp; mở tài khoản
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        {[
          { label: 'Chờ duyệt', value: stats.pending, color: '#fbbf24' },
          { label: 'Đã mở tài khoản', value: stats.approved, color: '#10b981' },
          { label: 'Đã cộng +15đ', value: stats.rewarded, color: '#c026d3' },
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
        <Space wrap>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 220 }} options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'APPROVED', label: 'Đã duyệt' },
            { value: 'REJECTED', label: 'Đã từ chối' },
          ]} />
          <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {rows.length}
          </span>
        </Space>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Đơn giới thiệu nhân sự mới</h3>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            — Sale gửi trên app, duyệt là mở tài khoản luôn
          </span>
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
          locale={{ emptyText: <Empty description="Chưa có đơn giới thiệu nào" /> }}
        />
      </div>

      {/* Duyệt & mở tài khoản */}
      <Modal
        title="Duyệt đơn và mở tài khoản nhân sự mới"
        open={!!approving}
        onOk={doApprove}
        onCancel={() => setApproving(null)}
        okText="Duyệt & tạo tài khoản"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
        width={560}
      >
        {approving && (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid var(--primary-color)', marginBottom: 16 }}>
              <div style={{ fontSize: 13 }}>
                <strong>{approving.referrerFullName}</strong> giới thiệu{' '}
                <strong>{approving.candidateName}</strong> — {approving.candidatePhone}
              </div>
              {approving.note && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{approving.note}</div>
              )}
            </div>

            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Chọn phòng ban' }]}>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={[...departments]
                        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                        .map(d => ({ value: d.id, label: d.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                    <Select options={[
                      { value: 'SALE', label: 'SALE' },
                      { value: 'TRUONG_PHONG', label: 'TRUONG_PHONG' },
                      { value: 'VAN_PHONG', label: 'VAN_PHONG' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="joinedDate"
                    label="Ngày vào làm"
                    rules={[{ required: true, message: 'Chọn ngày vào làm' }]}
                    tooltip="Người giới thiệu được +15đ sau ngày này đúng một tháng, nếu nhân sự mới vẫn còn làm."
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="password" label="Mật khẩu ban đầu">
                    <Input.Password placeholder="Để trống = 123456" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="note" label="Ghi chú của Admin">
                <Input.TextArea rows={2} placeholder="Tùy chọn" />
              </Form.Item>
            </Form>

            <Form.Item noStyle shouldUpdate>
              {() => {
                const d = form.getFieldValue('joinedDate');
                return d ? (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {approving.referrerFullName} sẽ được <strong>+15đ Lan tỏa</strong> từ ngày{' '}
                    <strong>{d.add(1, 'month').format('DD/MM/YYYY')}</strong> nếu {approving.candidateName} vẫn còn làm.
                  </div>
                ) : null;
              }}
            </Form.Item>
          </div>
        )}
      </Modal>

      {/* Từ chối */}
      <Modal
        title="Từ chối đơn giới thiệu"
        open={!!rejecting}
        onOk={doReject}
        onCancel={() => { setRejecting(null); setRejectNote(''); }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {rejecting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 13 }}>
              <strong>{rejecting.referrerFullName}</strong> giới thiệu{' '}
              <strong>{rejecting.candidateName}</strong> ({rejecting.candidatePhone})
            </div>
            <Input.TextArea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                            placeholder="Lý do từ chối (người giới thiệu sẽ thấy trên app)" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReferralSubmissions;
