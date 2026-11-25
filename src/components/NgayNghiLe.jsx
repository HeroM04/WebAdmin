import { useCallback, useState } from 'react';
import { Button, DatePicker, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { CalendarOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '../utils/apiClient';

/**
 * Ngày nghỉ lễ của công ty (Tết, Quốc khánh, ngày nghỉ toàn quốc đột xuất…).
 *
 * Ngày lễ thì máy không chốt vắng không phép (−15đ) cuối ngày, bảng công ghi "L".
 * Trước đây không có danh sách này: 24/11/2026 nghỉ toàn quốc mà cả công ty bị
 * trừ điểm. Thêm một ngày ĐÃ QUA thì máy chủ hoàn ngay điểm đã trừ của ngày đó.
 */
const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const NutNgayNghiLe = ({ onDoi }) => {
  const [mo, setMo] = useState(false);
  const [ds, setDs] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [ngay, setNgay] = useState(null);
  const [ten, setTen] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const tai = useCallback(async () => {
    setDangTai(true);
    try {
      setDs((await apiClient.get('/ngay-nghi-le')) || []);
    } catch (e) {
      message.error(e?.message || 'Không tải được danh sách ngày nghỉ lễ');
    } finally {
      setDangTai(false);
    }
  }, []);

  const luu = async () => {
    try {
      setDangLuu(true);
      const kq = await apiClient.post('/ngay-nghi-le', { ngay: ngay.format('YYYY-MM-DD'), ten: ten.trim() || null });
      message.success(kq?.soNguoiHoan > 0
        ? `Đã thêm ngày nghỉ lễ ${ngay.format('DD/MM/YYYY')}, hoàn điểm vắng cho ${kq.soNguoiHoan} nhân sự (tổng ${kq.tongDiemHoan}đ).`
        : `Đã thêm ngày nghỉ lễ ${ngay.format('DD/MM/YYYY')}.`, 6);
      setNgay(null);
      setTen('');
      await tai();
      onDoi?.();
    } catch (e) {
      message.error(e?.message || 'Không thêm được ngày nghỉ lễ');
    } finally {
      setDangLuu(false);
    }
  };

  const them = () => {
    if (!ngay) { message.warning('Chọn ngày nghỉ.'); return; }
    if (!ngay.isAfter(dayjs(), 'day')) {
      Modal.confirm({
        title: `Thêm ${ngay.format('DD/MM/YYYY')} làm ngày nghỉ lễ?`,
        content: 'Ngày này đã qua (hoặc là hôm nay). Máy chủ sẽ hủy "vắng không phép" của ngày này cho mọi người '
          + 'và hoàn đúng số điểm đã trừ; nhân sự nhận thông báo hoàn điểm.',
        okText: 'Thêm và hoàn điểm',
        cancelText: 'Hủy',
        onOk: luu,
      });
      return;
    }
    luu();
  };

  const xoa = async (r) => {
    try {
      await apiClient.delete(`/ngay-nghi-le/${r.ngay}`);
      message.success('Đã xóa ngày nghỉ lễ.');
      await tai();
      onDoi?.();
    } catch (e) {
      message.error(e?.message || 'Không xóa được');
    }
  };

  return (
    <>
      <Button icon={<CalendarOutlined />} onClick={() => { setMo(true); tai(); }}>Ngày nghỉ lễ</Button>
      <Modal title="Ngày nghỉ lễ của công ty" open={mo} onCancel={() => setMo(false)} footer={null} width={560}>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Ngày nghỉ lễ thì cuối ngày máy không chốt vắng không phép, bảng công ghi <b>L</b>. Ai vẫn đi làm thì vẫn hiện công như thường.
        </p>
        <Space.Compact style={{ width: '100%', marginBottom: 14 }}>
          <DatePicker value={ngay} onChange={setNgay} format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: 160 }} />
          <Input value={ten} onChange={(e) => setTen(e.target.value)} placeholder="Tên (vd. Tết Dương lịch)" maxLength={200} />
          <Button type="primary" icon={<PlusOutlined />} loading={dangLuu} onClick={them}
            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Thêm</Button>
        </Space.Compact>
        <Table
          size="small"
          rowKey="ngay"
          loading={dangTai}
          dataSource={[...ds].sort((a, b) => (a.ngay < b.ngay ? 1 : -1))}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          locale={{ emptyText: 'Chưa có ngày nghỉ lễ nào' }}
          columns={[
            { title: 'Ngày', dataIndex: 'ngay', width: 150, render: (v) => `${dayjs(v).format('DD/MM/YYYY')} (${THU[dayjs(v).day()]})` },
            { title: 'Tên', dataIndex: 'ten' },
            {
              title: '', width: 50, render: (_, r) => (
                <Popconfirm title="Xóa ngày nghỉ lễ này?"
                  description="Ngày đã qua không bị trừ lại điểm; chỉ là từ nay ngày đó không còn được miễn chốt vắng."
                  okText="Xóa" cancelText="Hủy" onConfirm={() => xoa(r)}>
                  <Button size="small" danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};
