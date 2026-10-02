import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Table, Avatar, DatePicker, Button, Input, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';
import { exportToCSV } from '../utils/exportCsv';
import { khopTen } from '../utils/locBang';
import { locNguoiChamKpi } from '../utils/vaiTro';
import { thangKpi, diemToiDaThang, khoangThangKpi } from '../utils/thangKpi';
import { DaiSoLieu } from './ui/DaiSoLieu';

// Màu nền ảnh đại diện chữ cái: trầm, theo NGƯỜI (id) chứ không theo hạng —
// đổi tháng hay lọc tên thì mỗi người vẫn giữ đúng màu của mình.
const MAU_AVATAR = ['#3F5E7A', '#7C6A46', '#5B6B3F', '#6B4F7A', '#2F6B5E', '#8A4F5C', '#4A5568', '#7A5A3F'];
const chuCai = (ten = '') => ten.trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || '?';

const AnhNguoi = ({ nguoi, size }) => (
  <Avatar size={size} src={nguoi.avatar || undefined}
          style={{ background: MAU_AVATAR[(nguoi.id || 0) % MAU_AVATAR.length], fontWeight: 600, flex: '0 0 auto' }}>
    {chuCai(nguoi.name)}
  </Avatar>
);

const so = (n) => n.toLocaleString('vi-VN');
const tenPhong = (ten) => ten.replace(/^Phòng\s+/i, '');

/* Bục vinh danh: hạng 1 đứng giữa, cao nhất; luôn ghi số hạng nên không phụ thuộc màu vàng/bạc/đồng.
   Bằng điểm thì bậc ghi đúng hạng thật (hai người cùng 400 đều là hạng 1), người
   cùng hạng không còn chỗ trên bục được ghi chú ở người cuối cùng của hạng đó. */
const BucVinhDanh = ({ top, coDiem }) => (
  <div className="vd-buc">
    {[1, 2, 3].map(h => {
      const r = top[h - 1];
      const conLai = r && top.slice(h).every(x => x.rank !== r.rank)
        ? coDiem.filter(x => x.rank === r.rank && !top.includes(x)).length : 0;
      return (
        <div key={h} className={`vd-cot vd-h${h}`}>
          {r ? (
            <div className="vd-nguoi">
              <div className="vd-vien"><AnhNguoi nguoi={r.user} size={h === 1 ? 76 : 60} /></div>
              <div className="vd-ten" title={r.user.name}>{r.user.name}</div>
              <div className="vd-phong">{tenPhong(r.department)}</div>
              <div className="vd-diem">{so(r.diem)}<span> điểm</span></div>              {r.chotCan && <div className="vd-chot">Có chốt căn</div>}
              {conLai > 0 && <div className="vd-dong-hang">+{conLai} người cùng {so(r.diem)} điểm</div>}
            </div>
          ) : (
            <div className="vd-nguoi vd-trong">Chưa có</div>
          )}
          <div className="vd-bac" aria-label={`Hạng ${r ? r.rank : h}`}>{r ? r.rank : h}</div>
        </div>
      );
    })}
  </div>
);

const Leaderboard = () => {
  // activeUsers: người đã xóa mềm không lên bảng vinh danh (xem chú thích ở AppContext)
  const { activeUsers, departments, kpiScores } = useContext(AppContext);
  const [thang, setThang] = useState(() => thangKpi());
  const [search, setSearch] = useState('');
  const [taiRieng, setTaiRieng] = useState({ thang: null, ds: [], dangTai: false });

  // Dữ liệu chung chỉ có tháng KPI hiện tại (GET /kpi-scores không kèm tháng).
  // Tháng khác thì tải riêng — trước đây chọn tháng cũ là cả bảng về 0.
  const coSan = kpiScores.some(s => s.month === thang);
  useEffect(() => {
    if (coSan) return;
    let huy = false;
    setTaiRieng({ thang, ds: [], dangTai: true });
    apiClient.get(`/kpi-scores?month=${thang}`)
      .then(d => { if (!huy) setTaiRieng({ thang, ds: Array.isArray(d) ? d : [], dangTai: false }); })
      .catch(() => { if (!huy) setTaiRieng({ thang, ds: [], dangTai: false }); });
    return () => { huy = true; };
  }, [thang, coSan]);

  const diemThang = useMemo(() => (coSan ? kpiScores.filter(s => s.month === thang)
                                         : (taiRieng.thang === thang ? taiRieng.ds : [])),
                            [coSan, kpiScores, thang, taiRieng]);
  const dangTai = !coSan && (taiRieng.thang !== thang || taiRieng.dangTai);
  const toiDa = diemToiDaThang(thang);
  const { tu, den } = khoangThangKpi(thang);

  // Chỉ khối kinh doanh: Văn phòng và Admin không bị chấm KPI nên không thể
  // đứng chung một bảng xếp hạng — họ luôn 0đ và nằm chót, như thể làm kém.
  const bang = useMemo(() => {
    const ds = locNguoiChamKpi(activeUsers).map(user => {
      const s = diemThang.find(x => x.userId === user.id);
      return {
        key: user.id,
        user,
        department: departments.find(d => d.id === user.deptId)?.name || 'Chưa phân bổ',
        diem: s?.total || 0,
        chamCong: s?.attendance || 0,
        thucChien: s?.meeting || 0,
        lanToa: s?.post || 0,
        chotCan: (s?.deal || 0) > 0,
      };
    }).sort((a, b) => b.diem - a.diem || a.user.name.localeCompare(b.user.name, 'vi'));
    // Bằng điểm thì cùng hạng (1, 1, 3…); 0 điểm thì chưa xếp hạng.
    ds.forEach((r, i) => {
      r.rank = r.diem <= 0 ? null : (i > 0 && ds[i - 1].diem === r.diem ? ds[i - 1].rank : i + 1);
    });
    return ds;
  }, [activeUsers, departments, diemThang]);

  // Lọc SAU khi đánh số hạng: tìm "Liên" phải thấy đúng hạng thật của Liên,
  // không phải hạng 1 vì là người duy nhất còn lại trong danh sách.
  const hienThi = bang.filter(r => khopTen(search, r.user.name, r.department));
  const coDiem = bang.filter(r => r.diem > 0);
  const top = coDiem.slice(0, 3);
  const trungBinh = coDiem.length ? Math.round(coDiem.reduce((t, r) => t + r.diem, 0) / coDiem.length) : 0;

  const cotSo = (title, key) => ({
    title, dataIndex: key, key, align: 'right', width: 104,
    render: (v) => <span className={v ? 'vd-so' : 'vd-so vd-mo'}>{so(v)}</span>,
  });

  const columns = [
    {
      title: 'Hạng', key: 'rank', width: 72, align: 'center',
      render: (_, r) => r.rank
        ? <span className={`vd-hang${r.rank <= 3 ? ` vd-hang-${r.rank}` : ''}`}>{r.rank}</span>
        : <span className="vd-mo">—</span>,
    },
    {
      title: 'Nhân sự', key: 'user',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <AnhNguoi nguoi={r.user} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{tenPhong(r.department)}</div>
          </div>
        </div>
      ),
    },
    cotSo('Chấm công', 'chamCong'),
    cotSo('Thực chiến', 'thucChien'),
    cotSo('Lan tỏa', 'lanToa'),
    {
      title: 'Chốt căn', key: 'chotCan', width: 100, align: 'center',
      render: (_, r) => r.chotCan ? <span className="vd-co-chot">Có</span> : <span className="vd-mo">—</span>,
    },
    {
      title: `Tổng điểm / ${so(toiDa)}`, key: 'diem', width: 260,
      render: (_, r) => (
        <div className="vd-tong">
          <div className="vd-thanh" role="presentation">
            <i style={{ width: `${Math.min(100, (r.diem / toiDa) * 100)}%` }} />
          </div>
          <span className={r.diem ? 'vd-tong-so' : 'vd-tong-so vd-mo'}>{so(r.diem)}</span>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    exportToCSV(
      bang.map(r => ({
        rank: r.rank ?? '', name: r.user.name, phone: r.user.phone, department: r.department,
        chamCong: r.chamCong, thucChien: r.thucChien, lanToa: r.lanToa,
        chotCan: r.chotCan ? 'Có' : '', diem: r.diem,
      })),
      [
        { title: 'Hạng', key: 'rank' }, { title: 'Họ tên', key: 'name' }, { title: 'SĐT', key: 'phone' },
        { title: 'Phòng ban', key: 'department' }, { title: 'Chấm công', key: 'chamCong' },
        { title: 'Thực chiến', key: 'thucChien' }, { title: 'Lan tỏa', key: 'lanToa' },
        { title: 'Chốt căn', key: 'chotCan' }, { title: `Tổng điểm (tối đa ${toiDa})`, key: 'diem' },
      ],
      `Bang_Vinh_Danh_${thang}.csv`,
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="vd-dau">
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: 'var(--text-primary)' }}>Bảng vinh danh</h2>
          <div style={{ marginTop: 2, fontSize: 13, color: 'var(--text-secondary)' }}>
            Tháng KPI {dayjs(thang + '-01').format('MM/YYYY')} · từ {tu.format('DD/MM')} đến {den.format('DD/MM')} · tối đa {so(toiDa)} điểm
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input.Search placeholder="Tìm tên, phòng ban" allowClear style={{ width: 220 }}
                        onChange={e => setSearch(e.target.value)} />
          <DatePicker picker="month" value={dayjs(thang + '-01')} allowClear={false} format="MM/YYYY"
                      onChange={(d) => d && setThang(d.format('YYYY-MM'))} />
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất CSV</Button>
        </div>
      </div>

      {dangTai ? null : coDiem.length === 0 ? (
        <div className="vd-rong">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                 description={`Tháng ${dayjs(thang + '-01').format('MM/YYYY')} chưa có ai được cộng điểm KPI`} />
        </div>
      ) : (
        <BucVinhDanh top={top} coDiem={coDiem} />
      )}

      <div style={{ margin: '16px 0' }}>
        <DaiSoLieu items={[
          { nhan: 'Đã có điểm', giaTri: <>{coDiem.length}<small>/ {bang.length}</small></>, phu: 'nhân sự kinh doanh' },
          { nhan: 'Điểm trung bình', giaTri: so(trungBinh), phu: 'của người đã có điểm' },
          { nhan: 'Cao nhất', giaTri: so(coDiem[0]?.diem || 0), phu: coDiem[0]?.user.name || '—' },
          { nhan: 'Có chốt căn', giaTri: bang.filter(r => r.chotCan).length, ton: 'dat', phu: 'đạt tối đa KPI tháng' },
        ]} />
      </div>

      <div className="vd-khung">
        <Table
          className="vd-bang"
          dataSource={hienThi}
          columns={columns}
          loading={dangTai}
          size="middle"
          scroll={{ x: 860 }}
          pagination={{ defaultPageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], hideOnSinglePage: true }}
        />
      </div>
    </div>
  );
};

export default Leaderboard;
