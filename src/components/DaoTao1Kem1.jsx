import React, { useContext, useMemo, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Image, Popconfirm, message } from 'antd';
import { TeamOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';
import { exportToCSV } from '../utils/exportCsv';
import { khopTen } from '../utils/locBang';

/*
 * DUYỆT BÁO CÁO ĐÀO TẠO 1-1
 *
 * Trước đây app nộp là máy chủ tự duyệt và cộng 5đ ngay; bảng này chỉ để xem,
 * cột trạng thái còn ghi cứng "Đã duyệt" bất kể dữ liệu. Giờ báo cáo vào CHỜ
 * DUYỆT, Admin duyệt thì mới cộng điểm — cùng một luồng với Thực chiến.
 *
 * Báo cáo tự duyệt đời cũ vẫn hiện "Đã duyệt"; bấm Từ chối là thu hồi 5đ đã
 * cộng, nên Admin rà lại được cả những báo cáo lọt qua trước đây.
 */

const TRANG_THAI = {
  PENDING:  { mau: 'warning', icon: <ClockCircleOutlined />, chu: 'Chờ duyệt' },
  APPROVED: { mau: 'success', icon: <CheckCircleOutlined />, chu: 'Đã duyệt' },
  REJECTED: { mau: 'error',   icon: <CloseCircleOutlined />, chu: 'Từ chối' },
};

export const DaoTao1Kem1 = () => {
  const { oneOnOneTrainings, users, refresh } = useContext(AppContext);
  // Mặc định mở ra là thấy việc cần làm; không còn đơn chờ thì tự nhiên trống
  const [locTrangThai, setLocTrangThai] = useState('PENDING');
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangXuLy, setDangXuLy] = useState(null);   // id đang duyệt/từ chối

  const nguoi = (id) => users.find(u => u.id === id);
  const soCho = oneOnOneTrainings.filter(o => o.status === 'PENDING').length;

  const hienThi = useMemo(() => oneOnOneTrainings.filter(o =>
    (locTrangThai === 'ALL' || o.status === locTrangThai)
    && khopTen(tuKhoa, nguoi(o.userId)?.name || o.userName, o.content)
  ), [oneOnOneTrainings, locTrangThai, tuKhoa, users]);

  const xuLy = async (o, hanhDong) => {
    setDangXuLy(o.id);
    try {
      await apiClient.put(`/training/1-on-1/${o.id}/${hanhDong}`, {});
      const ten = nguoi(o.userId)?.name || o.userName;
      message.success(hanhDong === 'approve'
        ? `Đã duyệt, cộng 5đ Thực chiến cho ${ten}.`
        : (o.status === 'APPROVED' ? `Đã từ chối và thu hồi 5đ của ${ten}.` : `Đã từ chối báo cáo của ${ten}.`));
      await refresh('oneOnOne', 'kpi');
    } catch (e) {
      message.error(e?.message || 'Không xử lý được báo cáo');
    } finally {
      setDangXuLy(null);
    }
  };

  const cot = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (_, r) => {
        const u = nguoi(r.userId);
        return (
          <Space>
            <Avatar src={u?.avatar || r.userAvatar} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u?.name || r.userName}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u?.phone}</span>
            </div>
          </Space>
        );
      },
    },
    { title: 'Nội dung đào tạo', dataIndex: 'content', key: 'content', render: (v) => <span style={{ whiteSpace: 'normal' }}>{v}</span> },
    {
      title: 'Hình ảnh',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (url) => url ? <Image src={url} width={60} style={{ borderRadius: 6 }} /> : <span style={{ color: 'var(--text-secondary)' }}>Không có ảnh</span>,
    },
    {
      title: 'Nộp lúc',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (t) => t ? new Date(t).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => {
        const tt = TRANG_THAI[r.status] || TRANG_THAI.PENDING;
        return <Tag color={tt.mau} icon={tt.icon}>{tt.chu}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 190,
      render: (_, r) => (
        <Space size={4}>
          {r.status !== 'APPROVED' && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} loading={dangXuLy === r.id}
                    style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                    onClick={() => xuLy(r, 'approve')}>
              Duyệt
            </Button>
          )}
          {r.status !== 'REJECTED' && (
            <Popconfirm
              title="Từ chối báo cáo này?"
              description={r.status === 'APPROVED'
                ? 'Báo cáo đã được duyệt — từ chối sẽ thu hồi 5đ đã cộng.'
                : 'Nhân sự sẽ nhận thông báo báo cáo không được duyệt.'}
              okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}
              onConfirm={() => xuLy(r, 'reject')}
            >
              <Button size="small" danger icon={<CloseCircleOutlined />} loading={dangXuLy === r.id}>Từ chối</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const xuatBaoCao = () => {
    exportToCSV(hienThi.map(o => ({
      userName: nguoi(o.userId)?.name || o.userName,
      content: o.content,
      submittedAt: o.submittedAt ? new Date(o.submittedAt).toLocaleString('vi-VN') : '',
      status: (TRANG_THAI[o.status] || TRANG_THAI.PENDING).chu,
    })), [
      { title: 'Nhân sự', key: 'userName' },
      { title: 'Nội dung', key: 'content' },
      { title: 'Thời gian', key: 'submittedAt' },
      { title: 'Trạng thái', key: 'status' },
    ], 'Bao_Cao_Dao_Tao_1_1.csv');
  };

  return (
    <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <TeamOutlined style={{ fontSize: 20, color: '#ec4899' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Báo cáo Đào tạo 1-1</span>
          {soCho > 0 && <Tag color="warning">{soCho} chờ duyệt</Tag>}
        </div>
        <Space wrap>
          <Input placeholder="Tìm theo tên, nội dung..." allowClear prefix={<SearchOutlined />} style={{ width: 240 }}
                 onChange={e => setTuKhoa(e.target.value)} />
          <Select value={locTrangThai} onChange={setLocTrangThai} style={{ width: 160 }} options={[
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'APPROVED', label: 'Đã duyệt' },
            { value: 'REJECTED', label: 'Từ chối' },
            { value: 'ALL', label: 'Tất cả trạng thái' },
          ]} />
          <Button type="primary" danger icon={<DownloadOutlined />} onClick={xuatBaoCao}>Xuất báo cáo</Button>
        </Space>
      </div>
      <Table
        columns={cot}
        dataSource={hienThi}
        rowKey="id"
        pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 30, 50, 100] }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: locTrangThai === 'PENDING' && oneOnOneTrainings.length > 0
          ? <div style={{ padding: '24px 0', color: 'var(--text-secondary)' }}>
              Không có báo cáo nào chờ duyệt.
              <div style={{ marginTop: 8 }}><Button size="small" onClick={() => setLocTrangThai('ALL')}>Xem tất cả</Button></div>
            </div>
          : undefined }}
      />
    </div>
  );
};

export default DaoTao1Kem1;
