import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Tag, Select, message, Row, Col, Modal, Input, Popconfirm, Empty, DatePicker, Tabs, Tooltip } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ReloadOutlined, CalendarOutlined, ExclamationCircleOutlined, TeamOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '../utils/apiClient';
import { khopTen, doiKhoang } from '../utils/locBang';

/*
 * ĐƠN XIN VẮNG & BẢNG VẮNG MẶT
 *
 * Trước đây một bảng chứa cả ĐƠN do người gửi (vài cái một ngày, cần Admin
 * duyệt) lẫn BẢN GHI máy quét đêm sinh ra (mỗi người không chấm công một dòng —
 * công ty trăm người là trăm dòng một đêm), lại tải toàn bộ về trình duyệt.
 * Vài tuần là hàng nghìn dòng, Admin lật 29 trang để tìm 3 đơn cần duyệt.
 *
 * Giờ tách hai tab:
 *   - Đơn xin vắng: chỉ đơn người gửi, phân trang ở máy chủ, lọc ở máy chủ.
 *   - Bảng vắng mặt: bản ghi máy quét GỘP theo người theo tháng — mỗi người
 *     một dòng với số ngày và các ngày cụ thể. 100 dòng thay vì 2.500.
 */

const STATUS_META = {
  PENDING:   { color: 'warning', icon: <ClockCircleOutlined />,  label: 'Chờ duyệt' },
  APPROVED:  { color: 'success', icon: <CheckCircleOutlined />,  label: 'Vắng có phép' },
  REJECTED:  { color: 'error',   icon: <CloseCircleOutlined />,  label: 'Đã từ chối' },
  UNEXCUSED: { color: 'error',   icon: <ExclamationCircleOutlined />, label: 'Vắng không phép' },
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return <Tag color={meta.color} icon={meta.icon}>{meta.label}</Tag>;
};

const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};
const fmtNgayNgan = (d) => { const [, m, day] = String(d).split('-'); return `${day}/${m}`; };
const fmtDateTime = (t) => (t ? new Date(t).toLocaleString('vi-VN') : '—');

const VAI_TRO = { SALE: 'Chuyên viên', TRUONG_PHONG: 'Trưởng phòng', VAN_PHONG: 'Văn phòng', ADMIN: 'Quản trị' };

/* ───────────────────────── Tab 1: Đơn xin vắng ───────────────────────── */
const TabDonXinVang = ({ onDaXuLy }) => {
  const [rows, setRows] = useState([]);
  const [tong, setTong] = useState(0);
  const [loading, setLoading] = useState(false);
  const [trang, setTrang] = useState(1);
  const [coSo, setCoSo] = useState(20);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [timTre, setTimTre] = useState('');
  const [dateRange, setDateRange] = useState(null);   // [từ, đến] yyyy-mm-dd, theo NGÀY VẮNG
  const [noteModal, setNoteModal] = useState(null);   // { record, action }
  const [note, setNote] = useState('');

  // Gõ tìm liên tục thì chờ ngừng gõ rồi mới hỏi máy chủ
  useEffect(() => { const t = setTimeout(() => setTimTre(search), 350); return () => clearTimeout(t); }, [search]);
  // Đổi bộ lọc thì về trang 1, không thì đang ở trang 5 mà kết quả còn 1 trang là bảng trống
  useEffect(() => { setTrang(1); }, [timTre, statusFilter, dateRange]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(trang - 1), size: String(coSo), loai: 'NGUOI_GUI' });
      if (statusFilter !== 'ALL') q.set('status', statusFilter);
      if (timTre) q.set('search', timTre);
      if (dateRange && dateRange[0] && dateRange[1]) { q.set('from', dateRange[0]); q.set('to', dateRange[1]); }
      const res = await apiClient.getRaw(`/leave-requests?${q.toString()}`);
      setRows(Array.isArray(res?.data) ? res.data : []);
      setTong(res?.page?.totalElements ?? 0);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách đơn xin vắng');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [trang, coSo, statusFilter, timTre, dateRange]);

  useEffect(() => { load(); }, [load]);

  const doReview = async (record, action, reviewNote) => {
    try {
      await apiClient.put(`/leave-requests/${record.id}/${action}`, { note: reviewNote || null });
      message.success(action === 'approve' ? 'Đã duyệt vắng có phép.' : 'Đã từ chối đơn xin vắng.');
      setNoteModal(null);
      setNote('');
      load();
      onDaXuLy?.();
    } catch (e) {
      message.error(e?.message || 'Lỗi hệ thống');
    }
  };

  const columns = [
    {
      title: 'Nhân sự', key: 'user',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{r.userFullName || `#${r.userId}`}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.departmentName || 'Chưa phân phòng'}</div>
        </div>
      )
    },
    { title: 'Ngày vắng', dataIndex: 'leaveDate', width: 110, render: (d) => <span style={{ fontWeight: 600 }}>{fmtDate(d)}</span> },
    { title: 'Lý do', dataIndex: 'reason', ellipsis: true, render: (t) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t || '—'}</span> },
    { title: 'Gửi lúc', dataIndex: 'submittedAt', width: 150, render: (t) => <span style={{ fontSize: 12 }}>{fmtDateTime(t)}</span> },
    {
      title: 'Trạng thái', key: 'status', width: 190,
      render: (_, r) => (
        <div>
          <StatusTag status={r.status} />
          {r.reviewedByFullName && <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>bởi {r.reviewedByFullName}</div>}
          {r.reviewNote && <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>“{r.reviewNote}”</div>}
        </div>
      )
    },
    {
      title: 'Hành động', key: 'actions', width: 170, fixed: 'right', className: 'no-row-click',
      render: (_, r) => {
        if (r.status === 'PENDING') {
          return (
            <Space size={4}>
              <Button size="small" danger ghost icon={<CloseCircleOutlined />}
                      onClick={() => { setNoteModal({ record: r, action: 'reject' }); setNote(''); }}>Từ chối</Button>
              <Popconfirm title="Duyệt vắng có phép?" description="Ngày này được tính là vắng có phép."
                          okText="Duyệt" cancelText="Hủy" onConfirm={() => doReview(r, 'approve')}>
                <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Duyệt</Button>
              </Popconfirm>
            </Space>
          );
        }
        const opposite = r.status === 'APPROVED' ? 'reject' : 'approve';
        return (
          <Button size="small" type="link" onClick={() => { setNoteModal({ record: r, action: opposite }); setNote(r.reviewNote || ''); }}>
            {opposite === 'approve' ? 'Duyệt lại' : 'Thu hồi duyệt'}
          </Button>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Space wrap>
        <Input.Search placeholder="Tìm tên nhân sự..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} />
        <DatePicker.RangePicker placeholder={['Vắng từ ngày', 'Đến ngày']} format="DD/MM/YYYY"
                               onChange={(dates) => setDateRange(doiKhoang(dates))} style={{ width: 240 }} />
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 170 }} options={[
          { value: 'ALL', label: 'Tất cả trạng thái' },
          { value: 'PENDING', label: 'Chờ duyệt' },
          { value: 'APPROVED', label: 'Vắng có phép' },
          { value: 'REJECTED', label: 'Đã từ chối' },
        ]} />
        <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{tong}</strong> đơn
        </span>
      </Space>

      <Table
        dataSource={rows} columns={columns} rowKey="id" size="small" loading={loading}
        pagination={{
          current: trang, pageSize: coSo, total: tong, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100],
          onChange: (p, s) => { if (s !== coSo) { setCoSo(s); setTrang(1); } else setTrang(p); },
          showTotal: (t, r) => `${r[0]}–${r[1]} / ${t}`,
        }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="Không có đơn nào khớp bộ lọc" /> }}
      />

      <Modal
        title={noteModal?.action === 'approve' ? 'Duyệt đơn xin vắng' : 'Từ chối đơn xin vắng'}
        open={!!noteModal}
        onOk={() => doReview(noteModal.record, noteModal.action, note)}
        onCancel={() => { setNoteModal(null); setNote(''); }}
        okText={noteModal?.action === 'approve' ? 'Duyệt' : 'Từ chối'} cancelText="Hủy"
        okButtonProps={noteModal?.action === 'approve'
          ? { style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } } : { danger: true }}
      >
        {noteModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 13 }}><strong>{noteModal.record.userFullName}</strong> xin vắng ngày <strong>{fmtDate(noteModal.record.leaveDate)}</strong></div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid var(--primary-color)', fontSize: 13 }}>
              {noteModal.record.reason}
            </div>
            <Input.TextArea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú của Admin (tùy chọn)" />
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ───────────────────────── Tab 2: Bảng vắng mặt ───────────────────────── */
const TabBangVangMat = ({ thang, setThang, lamMoi }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [chiKhongPhep, setChiKhongPhep] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/leave-requests/absence-summary?month=${thang.format('YYYY-MM')}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error(e?.message || 'Không tải được bảng vắng mặt');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [thang]);

  useEffect(() => { load(); }, [load, lamMoi]);

  const hienThi = useMemo(() => rows.filter(r =>
    khopTen(search, r.fullName, r.departmentName) && (!chiKhongPhep || r.soKhongPhep > 0)), [rows, search, chiKhongPhep]);

  const tongKhongPhep = rows.reduce((a, r) => a + (r.soKhongPhep || 0), 0);

  const Ngay = ({ ds, mau }) => {
    if (!ds || !ds.length) return <span style={{ color: '#cbd5e1' }}>—</span>;
    const dau = ds.slice(0, 6), con = ds.length - dau.length;
    return (
      <span>
        {dau.map(d => <Tag key={d} color={mau} style={{ marginInlineEnd: 4 }}>{fmtNgayNgan(d)}</Tag>)}
        {con > 0 && <Tooltip title={ds.slice(6).map(fmtNgayNgan).join(', ')}><Tag>+{con}</Tag></Tooltip>}
      </span>
    );
  };

  const columns = [
    {
      title: 'Nhân sự', key: 'user', width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
            {r.fullName}{r.status && r.status !== 'ACTIVE' && <Tag style={{ marginLeft: 6, fontSize: 10 }}>đã nghỉ</Tag>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.departmentName || 'Chưa phân phòng'} · {VAI_TRO[r.role] || r.role || ''}</div>
        </div>
      )
    },
    {
      title: 'Không phép', dataIndex: 'soKhongPhep', width: 110, align: 'center',
      sorter: (a, b) => a.soKhongPhep - b.soKhongPhep, defaultSortOrder: 'descend',
      render: (v) => <span style={{ fontWeight: 800, fontSize: 16, color: v > 0 ? 'var(--danger-color)' : '#cbd5e1' }}>{v}</span>
    },
    {
      title: 'Có phép', dataIndex: 'soCoPhep', width: 90, align: 'center', sorter: (a, b) => a.soCoPhep - b.soCoPhep,
      render: (v) => <span style={{ fontWeight: 700, color: v > 0 ? 'var(--success-color)' : '#cbd5e1' }}>{v}</span>
    },
    { title: 'Ngày không phép', dataIndex: 'ngayKhongPhep', render: (ds) => <Ngay ds={ds} mau="error" /> },
    { title: 'Ngày có phép', dataIndex: 'ngayCoPhep', width: 260, render: (ds) => <Ngay ds={ds} mau="success" /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Space wrap>
        <DatePicker picker="month" value={thang} onChange={d => d && setThang(d)} format="MM/YYYY" allowClear={false} />
        <Input.Search placeholder="Tìm tên, phòng ban..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} />
        <Select value={chiKhongPhep ? 'KP' : 'ALL'} onChange={v => setChiKhongPhep(v === 'KP')} style={{ width: 200 }} options={[
          { value: 'KP', label: 'Chỉ người có vắng không phép' },
          { value: 'ALL', label: 'Tất cả người có vắng' },
        ]} />
        <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{hienThi.length}</strong> người · tổng <strong style={{ color: 'var(--danger-color)' }}>{tongKhongPhep}</strong> ngày không phép trong tháng
        </span>
      </Space>

      <Table
        dataSource={hienThi} columns={columns} rowKey="userId" size="small" loading={loading}
        pagination={{ defaultPageSize: 50, showSizeChanger: true, pageSizeOptions: [20, 50, 100, 200] }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="Tháng này chưa có ai vắng" /> }}
      />
    </div>
  );
};

/* ───────────────────────── Khung ngoài ───────────────────────── */
export const LeaveRequests = () => {
  const [tab, setTab] = useState('don');
  const [thang, setThang] = useState(() => dayjs());
  const [soChoDuyet, setSoChoDuyet] = useState(0);
  const [lamMoi, setLamMoi] = useState(0);

  const demChoDuyet = useCallback(async () => {
    try {
      const d = await apiClient.get('/leave-requests/pending');
      setSoChoDuyet(Array.isArray(d) ? d.length : 0);
    } catch (_) { /* huy hiệu là phụ */ }
  }, []);
  useEffect(() => { demChoDuyet(); }, [demChoDuyet, lamMoi]);

  const closeDay = async () => {
    try {
      const res = await apiClient.post('/leave-requests/close-day', {});
      message.success(`Đã chốt hôm nay: ${res?.unexcusedCount ?? 0} nhân sự vắng không phép.`);
      setLamMoi(x => x + 1);
    } catch (e) {
      message.error(e?.message || 'Không chốt được ngày hôm nay');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Đơn xin vắng</strong> là việc Admin phải duyệt.{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Bảng vắng mặt</strong> là kết quả hệ thống tự chốt lúc 23:30 mỗi ngày (trừ Chủ nhật), gộp theo người để nhìn cả tháng một lượt.
          </div>
        </Col>
        <Col>
          <Popconfirm
            title="Chốt chấm công hôm nay?"
            description="Ai không chấm công và không có đơn được duyệt sẽ bị ghi vắng không phép. Hệ thống vẫn tự chạy lúc 23:30 mỗi ngày."
            okText="Chốt ngay" cancelText="Hủy" onConfirm={closeDay}>
            <Button icon={<CalendarOutlined />}>Chốt vắng mặt hôm nay</Button>
          </Popconfirm>
        </Col>
      </Row>

      <div className="premium-card" style={{ padding: '8px 20px 16px' }}>
        <Tabs activeKey={tab} onChange={setTab} items={[
          {
            key: 'don',
            label: <span><FileTextOutlined /> Đơn xin vắng{soChoDuyet > 0 && <Tag color="warning" style={{ marginLeft: 8 }}>{soChoDuyet} chờ duyệt</Tag>}</span>,
            children: <TabDonXinVang onDaXuLy={() => setLamMoi(x => x + 1)} />,
          },
          {
            key: 'bang',
            label: <span><TeamOutlined /> Bảng vắng mặt</span>,
            children: <TabBangVangMat thang={thang} setThang={setThang} lamMoi={lamMoi} />,
          },
        ]} />
      </div>
    </div>
  );
};

export default LeaveRequests;
