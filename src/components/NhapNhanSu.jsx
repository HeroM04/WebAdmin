import React, { useContext, useMemo, useState } from 'react';
import { Modal, Upload, Button, Table, Tag, Space, Input, DatePicker, Checkbox, Progress, Alert, Typography, message } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// Không có plugin này, dayjs bỏ qua chuỗi định dạng và đọc "01/07/2026" kiểu Mỹ
// thành 7 tháng 1 — cả trăm người vào làm nhầm tháng mà không ai thấy lỗi.
dayjs.extend(customParseFormat);
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';
import { boDau } from '../utils/locBang';
// Quy tắc đọc cột (vai trò, SĐT, tên phòng) nằm riêng để kiểm thử được
import { docVaiTro, chuanSdt, cuoi9, khoaPhong, timCot } from '../utils/nhapNhanSu';

const { Text } = Typography;

/*
 * NHẬP NHÂN SỰ HÀNG LOẠT TỪ EXCEL
 *
 * Tạo từng người bằng form thì 100 người là 100 lần bấm. File Excel có 5 cột:
 * Họ và tên · Số điện thoại · Phòng ban · Vai trò · Ngày vào làm (tùy chọn).
 * Tiêu đề cột nhận không phân biệt dấu/hoa thường, thứ tự cột tùy ý.
 *
 * Người dùng xem trước từng dòng (sẽ tạo / bỏ qua vì đã có / lỗi) rồi mới bấm
 * Nhập. Việc tạo chạy trong phiên đăng nhập của Admin, qua đúng API POST /users
 * đang dùng cho form thêm tay — không có đường tắt nào khác.
 */


export const NhapNhanSu = ({ open, onClose }) => {
  const { users, departments, refreshData } = useContext(AppContext);

  const [dong, setDong] = useState([]);           // dòng đã đọc & phân loại
  const [tenFile, setTenFile] = useState('');
  const [matKhau, setMatKhau] = useState('123456');
  const [ngayMacDinh, setNgayMacDinh] = useState(dayjs('2026-07-01'));
  const [chamChuoc9h, setChamChuoc9h] = useState(false);
  // Tọa độ + bán kính gán cho phòng ban TẠO MỚI trong lượt nhập — công ty một
  // văn phòng nên điền sẵn Khu đô thị Trung Văn, Đại Mỗ (Plus Code XQRP+RWX).
  const [toaDo, setToaDo] = useState({ lat: 20.9921125, lng: 105.7873594, banKinh: 5000 });
  const [dangNhap, setDangNhap] = useState(false);
  const [tienDo, setTienDo] = useState({ xong: 0, tong: 0 });
  const [ketQua, setKetQua] = useState(null);

  // Tra nhanh SĐT đã có trong hệ thống (kể cả người đã nghỉ — SĐT là khóa duy nhất)
  const sdtDaCo = useMemo(() => {
    const m = new Map();
    users.forEach(u => { const k = cuoi9(u.phone || u.phoneNumber); if (k) m.set(k, u); });
    return m;
  }, [users]);
  const phongTheoKhoa = useMemo(() => {
    const m = new Map();
    departments.forEach(d => m.set(khoaPhong(d.name), d));
    return m;
  }, [departments]);

  const docFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        // Ưu tiên sheet tên "Nhập" (file làm sạch sẵn), không có thì sheet đầu
        const tenSheet = wb.SheetNames.find(n => boDau(n) === 'nhap') || wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[tenSheet], { header: 1, defval: '' });
        if (rows.length < 2) { message.error('File không có dòng dữ liệu nào.'); return; }

        const tieuDe = rows[0].map(String);
        const cTen   = timCot(tieuDe, 'ho va ten', 'ho ten', 'ten');
        const cSdt   = timCot(tieuDe, 'so dien thoai', 'sdt', 'dien thoai', 'phone');
        const cPhong = timCot(tieuDe, 'phong');
        const cVai   = timCot(tieuDe, 'vai tro', 'chuc vu', 'role');
        const cNgay  = timCot(tieuDe, 'ngay vao', 'ngay bat dau');
        if (cTen < 0 || cSdt < 0) {
          message.error('Không tìm thấy cột "Họ và tên" và "Số điện thoại" trong dòng tiêu đề.');
          return;
        }

        const trongFile = new Set();
        const ds = rows.slice(1).filter(r => r.some(c => String(c).trim() !== '')).map((r, i) => {
          const ten   = String(r[cTen] ?? '').trim().replace(/\s+/g, ' ');
          const sdt   = chuanSdt(r[cSdt]);
          const phong = cPhong >= 0 ? String(r[cPhong] ?? '').trim() : '';
          const vaiTro = docVaiTro(cVai >= 0 ? r[cVai] : '');
          let ngay = null;
          if (cNgay >= 0 && r[cNgay] !== '') {
            const v = r[cNgay];
            const d = typeof v === 'number'
              ? dayjs(new Date(Math.round((v - 25569) * 86400 * 1000)))      // số ngày Excel
              : dayjs(String(v), ['DD/MM/YYYY', 'YYYY-MM-DD', 'D/M/YYYY'], true);
            if (d.isValid()) ngay = d.format('YYYY-MM-DD');
          }

          const loi = [];
          if (!ten) loi.push('Thiếu họ tên');
          if (!/^0\d{9}$/.test(sdt)) loi.push('SĐT không hợp lệ');
          const phongCo = phong ? phongTheoKhoa.get(khoaPhong(phong)) : null;
          if (!phong) loi.push('Thiếu phòng ban');

          let trangThai = 'tao', ghiChu = '';
          if (loi.length) { trangThai = 'loi'; ghiChu = loi.join(' · '); }
          else if (sdtDaCo.has(cuoi9(sdt))) {
            trangThai = 'boqua';
            const u = sdtDaCo.get(cuoi9(sdt));
            ghiChu = 'SĐT đã có: ' + (u.name || u.fullName) + (u.status && u.status !== 'ACTIVE' ? ' (đã nghỉ)' : '');
          } else if (trongFile.has(cuoi9(sdt))) { trangThai = 'boqua'; ghiChu = 'Trùng SĐT với dòng trên trong file'; }
          else if (!phongCo) { ghiChu = 'Phòng chưa có → sẽ tạo "' + phong + '"'; }
          if (trangThai !== 'loi') trongFile.add(cuoi9(sdt));

          return { key: i, ten, sdt, phong, phongId: phongCo ? phongCo.id : null, phongTen: phongCo ? phongCo.name : phong,
                   vaiTro, ngay, trangThai, ghiChu };
        });
        setDong(ds);
        setKetQua(null);
        setTenFile(file.name);
      } catch (err) {
        message.error('Không đọc được file: ' + (err?.message || err));
      }
    };
    reader.readAsArrayBuffer(file);
    return false;   // chặn antd tự upload
  };

  const seTao = dong.filter(d => d.trangThai === 'tao');
  const phongMoi = [...new Set(seTao.filter(d => !d.phongId).map(d => d.phong))];

  const nhap = async () => {
    if (!seTao.length) return;
    if (!matKhau || matKhau.length < 6) { message.error('Mật khẩu ban đầu phải từ 6 ký tự.'); return; }
    setDangNhap(true);
    setTienDo({ xong: 0, tong: seTao.length });
    const kq = { tao: [], loi: [], phongTao: [] };

    // 1) Tạo các phòng còn thiếu — chỉ có tên; tọa độ văn phòng và bán kính
    //    chấm công Admin bổ sung sau ở trang Phòng ban.
    const idPhong = new Map(departments.map(d => [khoaPhong(d.name), d.id]));
    for (const tenPhong of phongMoi) {
      try {
        const p = await apiClient.post('/departments', { name: tenPhong, officeLat: toaDo.lat, officeLng: toaDo.lng, allowedRadius: toaDo.banKinh });
        idPhong.set(khoaPhong(tenPhong), p?.id ?? p?.data?.id);
        kq.phongTao.push(tenPhong);
      } catch (e) {
        kq.loi.push({ ten: '(phòng) ' + tenPhong, sdt: '', ly_do: e?.message || 'Không tạo được phòng' });
      }
    }

    // 2) Tạo người, tuần tự để máy chủ không bị dồn và lỗi dòng nào biết dòng đó
    let xong = 0;
    for (const d of seTao) {
      const departmentId = d.phongId ?? idPhong.get(khoaPhong(d.phong));
      if (!departmentId) {
        kq.loi.push({ ten: d.ten, sdt: d.sdt, ly_do: 'Không có phòng "' + d.phong + '" (tạo phòng thất bại)' });
      } else {
        try {
          await apiClient.post('/users', {
            fullName: d.ten,
            phoneNumber: d.sdt,
            password: matKhau,
            role: d.vaiTro,
            departmentId,
            joinedDate: d.ngay || ngayMacDinh.format('YYYY-MM-DD'),
            allowCheckinUntil9: chamChuoc9h,
            avatarUrl: null,
            referrerId: null,
          });
          kq.tao.push(d);
        } catch (e) {
          kq.loi.push({ ten: d.ten, sdt: d.sdt, ly_do: e?.message || 'Máy chủ từ chối' });
        }
      }
      xong++;
      setTienDo({ xong, tong: seTao.length });
    }

    setKetQua(kq);
    setDangNhap(false);
    try { await refreshData?.(); } catch (_) { /* danh sách sẽ tự tải lại lần sau */ }
  };

  const dong_ = () => { if (dangNhap) return; setDong([]); setTenFile(''); setKetQua(null); onClose(); };

  const nhan = { tao: ['success', <CheckCircleOutlined />, 'Sẽ tạo'], boqua: ['default', <WarningOutlined />, 'Bỏ qua'], loi: ['error', <CloseCircleOutlined />, 'Lỗi'] };
  const cot = [
    { title: '#', dataIndex: 'key', width: 48, render: (v) => v + 1 },
    { title: 'Họ và tên', dataIndex: 'ten', width: 200, render: (v) => <b>{v || '—'}</b> },
    { title: 'SĐT', dataIndex: 'sdt', width: 120 },
    { title: 'Phòng ban', dataIndex: 'phongTen', width: 170, render: (v, r) => r.phongId ? v : <span style={{ color: '#b45309' }}>{v} (mới)</span> },
    { title: 'Vai trò', dataIndex: 'vaiTro', width: 130 },
    { title: 'Ngày vào', dataIndex: 'ngay', width: 100, render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : <Text type="secondary">mặc định</Text> },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 110, render: (v) => <Tag color={nhan[v][0]} icon={nhan[v][1]}>{nhan[v][2]}</Tag> },
    { title: 'Ghi chú', dataIndex: 'ghiChu', ellipsis: true, render: (v) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span> },
  ];

  const demTT = (t) => dong.filter(d => d.trangThai === t).length;

  return (
    <Modal
      title={<Space><FileExcelOutlined style={{ color: '#217346' }} />Nhập nhân sự từ Excel</Space>}
      open={open} onCancel={dong_} width={1100} maskClosable={!dangNhap}
      footer={[
        <Button key="dong" onClick={dong_} disabled={dangNhap}>{ketQua ? 'Đóng' : 'Hủy'}</Button>,
        !ketQua && <Button key="nhap" type="primary" loading={dangNhap} disabled={!seTao.length} onClick={nhap}
                           style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
          Nhập {seTao.length} người
        </Button>,
      ]}
    >
      {!dong.length && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert type="info" showIcon message="File Excel cần 4 cột: Họ và tên · Số điện thoại · Phòng ban · Vai trò (thêm cột Ngày vào làm nếu muốn khác mặc định). Thứ tự cột tùy ý, tiêu đề không cần dấu."
                 description="Phòng ban ghi 'KD05', 'Phòng Kinh Doanh 5' hay 'Kinh doanh 05' đều nhận. Vai trò ghi 'Sale', 'Chuyên viên kinh doanh', 'Trưởng phòng' đều nhận; để trống là Sale." />
          <Upload.Dragger accept=".xlsx,.xls,.csv" beforeUpload={docFile} showUploadList={false} multiple={false}>
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">Kéo file vào đây hoặc bấm để chọn</p>
          </Upload.Dragger>
        </div>
      )}

      {dong.length > 0 && !ketQua && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Space wrap size={[16, 8]} style={{ alignItems: 'center' }}>
            <Text strong>{tenFile}</Text>
            <Tag color="success">{demTT('tao')} sẽ tạo</Tag>
            <Tag>{demTT('boqua')} bỏ qua</Tag>
            <Tag color="error">{demTT('loi')} lỗi</Tag>
            {phongMoi.length > 0 && <Tag color="warning">{phongMoi.length} phòng sẽ tạo mới: {phongMoi.join(', ')}</Tag>}
            <Button size="small" onClick={() => { setDong([]); setTenFile(''); }} disabled={dangNhap}>Chọn file khác</Button>
          </Space>

          <Space wrap size={[16, 8]} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <span>Mật khẩu ban đầu <Input.Password value={matKhau} onChange={e => setMatKhau(e.target.value)} style={{ width: 130 }} size="small" /></span>
            <span>Ngày vào làm mặc định <DatePicker value={ngayMacDinh} onChange={d => d && setNgayMacDinh(d)} format="DD/MM/YYYY" allowClear={false} size="small" /></span>
            <Checkbox checked={chamChuoc9h} onChange={e => setChamChuoc9h(e.target.checked)}>Cho phép đến 09:00 mới tính đi muộn</Checkbox>
          </Space>
          {phongMoi.length > 0 && (
            <Space wrap size={[16, 8]} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Phòng tạo mới nhận tọa độ:</span>
              <span>Vĩ độ <Input value={toaDo.lat} onChange={e => setToaDo({ ...toaDo, lat: parseFloat(e.target.value) || 0 })} style={{ width: 120 }} size="small" /></span>
              <span>Kinh độ <Input value={toaDo.lng} onChange={e => setToaDo({ ...toaDo, lng: parseFloat(e.target.value) || 0 })} style={{ width: 120 }} size="small" /></span>
              <span>Bán kính (m) <Input value={toaDo.banKinh} onChange={e => setToaDo({ ...toaDo, banKinh: parseInt(e.target.value, 10) || 0 })} style={{ width: 80 }} size="small" /></span>
            </Space>
          )}

          {dangNhap && <Progress percent={Math.round(tienDo.xong / Math.max(tienDo.tong, 1) * 100)} status="active"
                                 format={() => tienDo.xong + ' / ' + tienDo.tong} />}

          <Table dataSource={dong} columns={cot} size="small" rowKey="key" scroll={{ x: 'max-content', y: 420 }}
                 pagination={false} rowClassName={(r) => r.trangThai === 'loi' ? 'nhap-loi' : ''} />
        </div>
      )}

      {ketQua && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert type={ketQua.loi.length ? 'warning' : 'success'} showIcon
                 message={`Đã tạo ${ketQua.tao.length} nhân sự` + (ketQua.phongTao.length ? `, ${ketQua.phongTao.length} phòng ban mới` : '') + (ketQua.loi.length ? `, ${ketQua.loi.length} dòng lỗi` : '')}
                 description={ketQua.phongTao.length
                   ? 'Phòng mới đã nhận tọa độ và bán kính đặt ở trên. Muốn đổi thì vào Quản lý Phòng ban → Sửa.'
                   : null} />
          {ketQua.loi.length > 0 && (
            <Table size="small" pagination={false} rowKey={(r, i) => i} dataSource={ketQua.loi}
                   columns={[{ title: 'Họ và tên', dataIndex: 'ten', width: 220 }, { title: 'SĐT', dataIndex: 'sdt', width: 120 },
                             { title: 'Lý do', dataIndex: 'ly_do' }]} />
          )}
        </div>
      )}
    </Modal>
  );
};

export default NhapNhanSu;
