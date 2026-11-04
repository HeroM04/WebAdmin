import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Table, DatePicker, Button, Popconfirm, Alert, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { apiClient } from '../utils/apiClient';
import { khoangThangKpi } from '../utils/thangKpi';

const { RangePicker } = DatePicker;

/**
 * Tăng ca mỗi ngày chỉ tính MỘT lần. Trước 04/11/2026 ai chấm công ra hai lần
 * sau 20:00 (bấm Xác nhận hai lần, ra về rồi chấm lại) được +5 hai lần, và
 * Admin thu hồi lượt về cũng không lấy lại điểm. Hộp này liệt kê các ngày bị
 * tính thừa để Admin xem trước, rồi mới bấm thu lại — máy chủ chỉ thu đúng
 * phần thừa đã thực vào, ghi thêm khoản trừ vào nhật ký, chạy lại không trùng.
 */
export const TangCaTrung = ({ open, thang, onClose, onDaThuLai }) => {
  const [khoang, setKhoang] = useState(null);
  const [ds, setDs] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [dangThu, setDangThu] = useState(false);

  // Mở hộp: mặc định là tháng KPI đang xem trên trang, không vượt quá hôm nay
  useEffect(() => {
    if (!open) return;
    const { tu, den } = khoangThangKpi(thang);
    setKhoang([tu, den.isAfter(dayjs()) ? dayjs() : den]);
  }, [open, thang]);

  const thamSo = khoang ? `tu=${khoang[0].format('YYYY-MM-DD')}&den=${khoang[1].format('YYYY-MM-DD')}` : '';

  const tai = useCallback(async () => {
    if (!thamSo) return;
    setDangTai(true);
    try {
      const d = await apiClient.get(`/kpi-scores/tang-ca-trung?${thamSo}`);
      setDs(Array.isArray(d) ? d : []);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách tăng ca tính trùng');
      setDs([]);
    } finally {
      setDangTai(false);
    }
  }, [thamSo]);

  useEffect(() => { if (open) tai(); }, [open, tai]);

  const thuLai = async () => {
    setDangThu(true);
    try {
      const d = await apiClient.post(`/kpi-scores/tang-ca-trung/thu-lai?${thamSo}`);
      const tong = (Array.isArray(d) ? d : []).reduce((s, t) => s + (t.thua || 0), 0);
      message.success(`Đã thu lại ${tong}đ tăng ca tính thừa.`);
      onDaThuLai?.();
      await tai();
    } catch (e) {
      message.error(e?.message || 'Thu lại không thành công');
    } finally {
      setDangThu(false);
    }
  };

  const tongThua = ds.reduce((s, t) => s + (t.thua || 0), 0);

  const columns = [
    { title: 'Ngày', dataIndex: 'ngay', width: 100, render: (v) => dayjs(v).format('DD/MM/YYYY') },
    {
      title: 'Nhân sự', dataIndex: 'fullName',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          {r.phong && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.phong}</div>}
        </div>
      ),
    },
    { title: 'Đang có', dataIndex: 'dangCo', width: 80, align: 'right', render: (v) => `${v}đ` },
    { title: 'Đúng ra', dataIndex: 'dungRa', width: 80, align: 'right', render: (v) => `${v}đ` },
    { title: 'Thu lại', dataIndex: 'thua', width: 80, align: 'right', render: (v) => <b style={{ color: '#dc2626' }}>−{v}đ</b> },
    {
      title: 'Lý do', dataIndex: 'lyDo',
      render: (v, r) => <Tag color={r.dungRa === 0 ? 'orange' : 'blue'} style={{ whiteSpace: 'normal' }}>{v}</Tag>,
    },
  ];

  return (
    <Modal
      title="Tăng ca tính trùng"
      open={open}
      onCancel={onClose}
      width={760}
      footer={[
        <Button key="dong" onClick={onClose}>Đóng</Button>,
        <Popconfirm
          key="thu"
          title={`Thu lại ${tongThua}đ của ${ds.length} lượt ngày?`}
          description="Mỗi người thấy khoản trừ này trong mục Thông báo trên ứng dụng."
          okText="Thu lại"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={thuLai}
          disabled={!ds.length}
        >
          <Button type="primary" danger disabled={!ds.length} loading={dangThu}>
            {ds.length ? `Thu lại ${tongThua}đ` : 'Không có gì để thu'}
          </Button>
        </Popconfirm>,
      ]}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        title="Tăng ca (về từ 20:00, thứ Hai – Sáu) mỗi ngày chỉ được +5 một lần."
        description="Danh sách dưới đây là các ngày bị cộng quá một lần, hoặc vẫn còn điểm tăng ca dù lượt về đã bị từ chối. Xem kỹ rồi mới bấm Thu lại; khoản đã thu không bị thu lần nữa."
      />
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Khoảng ngày:</span>
        <RangePicker
          value={khoang}
          format="DD/MM/YYYY"
          allowClear={false}
          disabledDate={(d) => d && d > dayjs().endOf('day')}
          onChange={(v) => v && setKhoang(v)}
        />
      </div>
      <Table
        dataSource={ds}
        columns={columns}
        rowKey={(r) => `${r.userId}-${r.ngay}`}
        size="small"
        loading={dangTai}
        pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: 'Không có ngày nào bị tính tăng ca thừa trong khoảng này.' }}
      />
    </Modal>
  );
};
