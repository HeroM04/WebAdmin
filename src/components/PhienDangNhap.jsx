import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Table, Tag, Button, Popconfirm, Alert, Space, message } from 'antd';
import { LaptopOutlined, ReloadOutlined, LogoutOutlined, DesktopOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';

/*
 * AI ĐANG ĐĂNG NHẬP TÀI KHOẢN NÀY
 *
 * Đăng nhập ở máy người khác rồi quên đăng xuất là chuyện thường. Trước đây
 * không có cách nào biết, cũng không có cách nào cắt — chỉ còn nước đổi mật
 * khẩu và chờ token hết hạn.
 *
 * Bảng này liệt kê mọi phiên còn hiệu lực. "Hoạt động cuối" mới là thứ đáng
 * nhìn: máy nào vừa gọi máy chủ vài phút trước tức là ĐANG có người dùng, khác
 * hẳn với máy chỉ từng đăng nhập tuần trước rồi bỏ đó.
 */

const gioVN = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

/** "3 phút trước", "2 giờ trước" — dễ đọc hơn mốc giờ tuyệt đối khi truy vết. */
const khoangCach = (s) => {
  const d = gioVN(s);
  if (!d) return '—';
  const giay = Math.round((Date.now() - d.getTime()) / 1000);
  if (giay < 90) return 'vừa xong';
  const phut = Math.round(giay / 60);
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.round(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  return `${Math.round(gio / 24)} ngày trước`;
};

const dayDu = (s) => {
  const d = gioVN(s);
  return d ? d.toLocaleString('vi-VN') : '—';
};

export const PhienDangNhap = ({ open, onClose, userId, userName }) => {
  const [dsPhien, setDsPhien] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [dangCat, setDangCat] = useState(false);

  const tai = useCallback(async () => {
    if (!userId) return;
    setDangTai(true);
    try {
      const d = await apiClient.get(`/users/${userId}/sessions`);
      setDsPhien(Array.isArray(d) ? d : []);
    } catch (e) {
      message.error(e?.message || 'Không đọc được danh sách phiên đăng nhập');
    } finally {
      setDangTai(false);
    }
  }, [userId]);

  useEffect(() => { if (open) tai(); }, [open, tai]);

  const dangXuatTatCa = async () => {
    setDangCat(true);
    try {
      const r = await apiClient.post(`/users/${userId}/logout-all`, {});
      message.success(r?.message || 'Đã đăng xuất khỏi mọi thiết bị.');
      await tai();
    } catch (e) {
      message.error(e?.message || 'Không đăng xuất được');
    } finally {
      setDangCat(false);
    }
  };

  const goMotMay = async (phienId) => {
    try {
      await apiClient.delete(`/users/${userId}/sessions/${phienId}`);
      message.success('Đã gỡ thiết bị khỏi tài khoản.');
      await tai();
    } catch (e) {
      message.error(e?.message || 'Không gỡ được thiết bị');
    }
  };

  const cot = [
    {
      title: 'Thiết bị',
      dataIndex: 'thietBi',
      render: (v, r) => (
        <Space size={6}>
          <DesktopOutlined style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 600 }}>{v}</span>
          {r.phienHienTai && <Tag color="success">Máy bạn đang dùng</Tag>}
        </Space>
      ),
    },
    { title: 'Địa chỉ IP', dataIndex: 'ipAddress', width: 140, render: (v) => v || '—' },
    {
      title: 'Đăng nhập lúc',
      dataIndex: 'dangNhapLuc',
      width: 170,
      render: (v) => <span style={{ fontSize: 12 }}>{dayDu(v)}</span>,
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'hoatDongCuoi',
      width: 150,
      render: (v) => {
        const d = gioVN(v);
        const moi = d && Date.now() - d.getTime() < 15 * 60 * 1000;
        return (
          <span title={dayDu(v)} style={{ fontSize: 12, color: moi ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: moi ? 700 : 400 }}>
            {khoangCach(v)}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'thaoTac',
      width: 90,
      align: 'right',
      render: (_, r) => (
        <Popconfirm
          title="Gỡ thiết bị này?"
          description="Máy đó sẽ phải đăng nhập lại. Các máy khác giữ nguyên."
          okText="Gỡ" cancelText="Hủy" okButtonProps={{ danger: true }}
          onConfirm={() => goMotMay(r.id)}
        >
          <Button size="small" danger type="text">Gỡ</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={<Space><LaptopOutlined style={{ color: 'var(--primary-color)' }} />Thiết bị đang đăng nhập — {userName}</Space>}
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="tai" icon={<ReloadOutlined />} onClick={tai} loading={dangTai}>Tải lại</Button>,
        <Popconfirm
          key="all"
          title="Đăng xuất khỏi mọi thiết bị?"
          description={<span>Tất cả máy tính và điện thoại đang dùng tài khoản <b>{userName}</b> sẽ bị đăng xuất ngay<br />và phải đăng nhập lại bằng mật khẩu — <b>kể cả máy bạn đang ngồi</b>.</span>}
          okText="Đăng xuất tất cả" cancelText="Hủy" okButtonProps={{ danger: true }}
          onConfirm={dangXuatTatCa}
        >
          <Button danger type="primary" icon={<LogoutOutlined />} loading={dangCat}>
            Đăng xuất khỏi mọi thiết bị
          </Button>
        </Popconfirm>,
        <Button key="dong" onClick={onClose}>Đóng</Button>,
      ]}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        title="Cột “Hoạt động cuối” cho biết máy nào còn đang dùng thật"
        description="Máy vừa hoạt động vài phút trước là đang có người ngồi trước màn hình. Thấy thiết bị hoặc địa chỉ IP lạ thì gỡ riêng máy đó, hoặc đăng xuất tất cả rồi đổi mật khẩu."
      />
      <Table
        dataSource={dsPhien}
        columns={cot}
        rowKey="id"
        size="small"
        loading={dangTai}
        pagination={false}
        locale={{ emptyText: 'Không có thiết bị nào đang đăng nhập tài khoản này.' }}
      />
    </Modal>
  );
};

export default PhienDangNhap;
