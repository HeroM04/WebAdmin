import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Empty, Modal, Input, message, Row, Col } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';
import { rowClick } from '../utils/tableRow';

/**
 * Duyệt đơn xin không tham gia buổi đào tạo dự án.
 *
 * Đào tạo dự án bắt buộc mọi người dự, trừ ai không bán dự án đó. Hệ thống
 * không biết ai bán dự án nào nên để nhân sự tự khai lý do, Admin xét ở đây.
 * Duyệt thì họ được tính có điểm danh và vẫn được điểm đào tạo; từ chối thì
 * coi như vắng buổi đó.
 */

const fmtLuc = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const hai = (n) => String(n).padStart(2, '0');
    return `${hai(d.getHours())}:${hai(d.getMinutes())} · ${hai(d.getDate())}/${hai(d.getMonth() + 1)}`;
  } catch { return '—'; }
};

export const TrainingRsvpRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dangXet, setDangXet] = useState(null);   // đơn đang mở hộp thoại
  const [chapNhan, setChapNhan] = useState(true);
  const [ghiChu, setGhiChu] = useState('');
  const [dangGui, setDangGui] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiClient.get('/training-sessions/rsvp/pending');
      setRows(Array.isArray(d) ? d : []);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách đơn xin vắng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moHopThoai = (record, dongY) => {
    setDangXet(record);
    setChapNhan(dongY);
    setGhiChu('');
  };

  const guiQuyetDinh = async () => {
    setDangGui(true);
    try {
      const q = new URLSearchParams({ approve: String(chapNhan) });
      if (ghiChu.trim()) q.set('note', ghiChu.trim());
      await apiClient.put(`/training-sessions/rsvp/${dangXet.id}?${q.toString()}`);
      message.success(chapNhan
        ? `Đã duyệt. ${dangXet.userFullName || 'Nhân sự'} được tính điểm danh buổi này.`
        : 'Đã từ chối. Nhân sự vẫn cần tham gia và quét mã điểm danh.');
      setDangXet(null);
      load();
    } catch (e) {
      message.error(e?.message || 'Không gửi được quyết định');
    } finally {
      setDangGui(false);
    }
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'user',
      width: 180,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {r.userFullName || `#${r.userId}`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {r.departmentName || 'Chưa phân phòng'}
          </div>
        </div>
      )
    },
    {
      title: 'Buổi đào tạo',
      key: 'session',
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {r.sessionTitle || `#${r.sessionId}`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {fmtLuc(r.sessionStartTime)}
          </div>
        </div>
      )
    },
    {
      title: 'Lý do xin vắng',
      dataIndex: 'reason',
      key: 'reason',
      render: (t) => (
        <div title={t} style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
          {t || '—'}
        </div>
      )
    },
    {
      title: 'Gửi lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (t) => <span style={{ fontSize: 12 }}>{fmtLuc(t)}</span>
    },
    {
      title: 'Quyết định',
      key: 'actions',
      width: 190,
      fixed: 'right',
      className: 'no-row-click',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" danger ghost icon={<CloseCircleOutlined />}
                  onClick={() => moHopThoai(r, false)}>
            Từ chối
          </Button>
          <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                  onClick={() => moHopThoai(r, true)}>
            Duyệt
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Đào tạo dự án bắt buộc mọi người tham gia. Ai không bán dự án đó thì gửi lý do ở
            ứng dụng và chờ duyệt tại đây. <strong style={{ color: 'var(--text-primary)' }}>Duyệt</strong> thì
            nhân sự được tính có điểm danh và vẫn được điểm đào tạo;{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Từ chối</strong> thì họ vẫn phải dự và quét mã.
          </div>
        </Col>
        <Col>
          <Tag color={rows.length ? 'warning' : 'default'} icon={<ClockCircleOutlined />}>
            {rows.length} đơn chờ duyệt
          </Tag>
        </Col>
        <Col>
          <Button size="small" icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
        </Col>
      </Row>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="id"
          size="small"
          loading={loading}
          onRow={rowClick((r) => moHopThoai(r, true))}
          pagination={{ defaultPageSize: 15, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100] }}
          scroll={{ x: 'max-content' }}
          style={{ padding: 8 }}
          locale={{ emptyText: <Empty description="Không có đơn nào chờ duyệt" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </div>

      <Modal
        title={chapNhan ? 'Duyệt đơn xin vắng' : 'Từ chối đơn xin vắng'}
        open={!!dangXet}
        onCancel={() => setDangXet(null)}
        onOk={guiQuyetDinh}
        okText={chapNhan ? 'Duyệt' : 'Từ chối'}
        cancelText="Hủy"
        confirmLoading={dangGui}
        okButtonProps={chapNhan
          ? { style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }
          : { danger: true }}
      >
        {dangXet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <div style={{ fontSize: 13 }}>
              <strong>{dangXet.userFullName || `#${dangXet.userId}`}</strong> xin không tham gia
              buổi <strong>{dangXet.sessionTitle || `#${dangXet.sessionId}`}</strong>.
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--bg-subtle, rgba(0,0,0,0.03))', borderRadius: 8, fontSize: 13 }}>
              “{dangXet.reason}”
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {chapNhan
                ? 'Duyệt xong nhân sự được ghi điểm danh buổi này và vẫn được điểm đào tạo.'
                : 'Từ chối thì không ghi điểm danh — nhân sự vẫn cần dự buổi học và quét mã.'}
            </div>
            <Input.TextArea
              rows={2}
              maxLength={300}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú gửi kèm cho nhân sự (không bắt buộc)"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
