import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { DownloadOutlined, RiseOutlined, FallOutlined, MinusOutlined, RightOutlined } from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';
import { exportToCSV } from '../utils/exportCsv';
import { locNguoiChamKpi } from '../utils/vaiTro';
import { thangKpi, khoangThangKpi, diemToiDaThang } from '../utils/thangKpi';
import { useDiemKpiThang, useThangKpiTuDong } from '../utils/useDiemKpiThang';
import { DaiSoLieu } from './ui/DaiSoLieu';
import { AnhNguoi } from './ui/AnhNguoi';

// Navy thương hiệu — màu nhấn duy nhất của trang (thanh điểm, biểu đồ), giống
// thanh tổng điểm ở Bảng vinh danh.
const NAVY = '#0F2C59';
const CHO_LAU_MS = 24 * 60 * 60 * 1000;   // chờ duyệt quá 24 giờ thì tô hổ phách

const so = (n) => (n || 0).toLocaleString('vi-VN');
const tenPhong = (ten = '') => ten.replace(/^Phòng\s+/i, '');

// Ba nhóm điểm 30/40/30 theo bảng tiêu chí công ty (KpiLedgerService.nhanNhom).
// Chốt căn KHÔNG phải nhóm điểm: máy chủ trả `deal` = 1 làm cờ "có chốt căn" và
// nâng `total` lên mức tối đa (KpiScoreResponseDTO) — vẽ nó thành một múi "1 đ"
// là trộn số căn với điểm. Thứ tự cố định để mỗi nhóm giữ một sắc navy qua mọi tháng.
const NHOM_DIEM = [
  { key: 'attendance', ten: 'Phát triển cá nhân', dam: 1 },
  { key: 'meeting',    ten: 'Thực chiến',         dam: 0.45 },
  { key: 'post',       ten: 'Lan tỏa',            dam: 0.15 },
];

/** Phần trăm nguyên, cộng lại đúng 100 (chia phần dư lớn nhất). Tổng 0 thì để trống. */
const chiaPhanTram = (ds) => {
  const tong = ds.reduce((t, v) => t + v, 0);
  if (!tong) return ds.map(() => null);
  const tho = ds.map(v => (v * 100) / tong);
  const nguyen = tho.map(Math.floor);
  const thieu = 100 - nguyen.reduce((t, v) => t + v, 0);
  tho.map((v, i) => ({ i, du: v - nguyen[i] }))
     .sort((a, b) => b.du - a.du)
     .slice(0, thieu)
     .forEach(({ i }) => { nguyen[i] += 1; });
  return nguyen;
};

const thoiGianCho = (ms) => {
  const gio = Math.floor(ms / 3_600_000);
  if (gio < 1) return 'chưa tới 1 giờ';
  if (gio < 24) return `${gio} giờ`;
  return `${Math.floor(gio / 24)} ngày`;
};

/** Dòng so với tháng trước. Số nhỏ (tháng trước dưới 20) so bằng chênh lệch, không bằng %:
 *  từ 3 lên 5 mà ghi +66,7% thì đọc như tăng vọt. */
const XuHuong = ({ nay, truoc }) => {
  if (nay === truoc) return <span className="tq-xu tq-bang"><MinusOutlined /> Không đổi</span>;
  const tang = nay > truoc;
  const chenh = truoc < 20
    ? so(Math.abs(nay - truoc))
    : `${((Math.abs(nay - truoc) / truoc) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
  return (
    <span className={`tq-xu ${tang ? 'tq-tang' : 'tq-giam'}`}>
      {tang ? <RiseOutlined /> : <FallOutlined />} {chenh}
    </span>
  );
};

const The = ({ ten, phu, hanhDong, className = '', children }) => (
  <section className={`tq-the ${className}`}>
    <header className="tq-the-dau">
      <h3 className="tq-the-ten">{ten}</h3>
      {phu != null && <span className="tq-the-phu">{phu}</span>}
      {hanhDong}
    </header>
    {children}
  </section>
);

/** Khung chờ đúng hình dòng thật (tên + thanh), trong lúc tải điểm của tháng khác. */
const KhungCho = ({ dong }) => (
  <ul className="tq-khung" aria-busy="true">
    {Array.from({ length: dong }, (_, i) => (
      <li key={i}>
        <i style={{ width: `${[42, 58, 34, 50, 38][i % 5]}%` }} />
        <i />
      </li>
    ))}
    <span className="tq-an" role="status">Đang tải điểm KPI</span>
  </ul>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    departments,
    users,          // đầy đủ, kể cả người đã nghỉ — chỉ để tra tên trên việc cũ
    activeUsers,    // người đang làm — dùng cho xếp hạng và theo phòng
    // điểm KPI lấy theo tháng qua useDiemKpiThang, không lọc thẳng kpiScores
    deals,
    attendance,     // chỉ các lượt chấm công đang chờ duyệt (/attendance/pending)
    posts,
    meetings,
    oneOnOneTrainings
  } = useContext(AppContext);

  // Mặc định THÁNG KPI đang chấm chứ không phải tháng dương lịch: 1–4/10/2026
  // vẫn là KPI tháng 9 (trước đây mở ra là tháng 10, toàn 0 và -100%); hết
  // Chủ nhật 04/10 mới tự sang tháng 10.
  const [thangChon, setThangChon] = useThangKpiTuDong();
  const selectedMonth = dayjs(thangChon + '-01');
  const currentMonthStr = selectedMonth.format('YYYY-MM');
  const previousMonthStr = selectedMonth.subtract(1, 'month').format('YYYY-MM');
  const khoangThang = khoangThangKpi(currentMonthStr);
  const toiDaThang = diemToiDaThang(currentMonthStr);

  // "Bây giờ" để tính việc chờ bao lâu — nhích mỗi phút, không gọi Date.now() khi render.
  const [bayGio, setBayGio] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setBayGio(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Việc thuộc tháng KPI nào theo tuần của nó (utils/thangKpi), khớp cách máy chủ cộng điểm
  const filterByMonth = (arr, monthStr) => arr.filter(item => item.submittedAt && thangKpi(item.submittedAt) === monthStr);

  const { ds: scoresCurr, dangTai } = useDiemKpiThang(currentMonthStr);
  const { ds: scoresPrev, dangTai: dangTaiTruoc } = useDiemKpiThang(previousMonthStr);
  const kpiCurr = scoresCurr.reduce((sum, s) => sum + (s.total || 0), 0);
  const kpiPrev = scoresPrev.reduce((sum, s) => sum + (s.total || 0), 0);

  const dealsCurr = filterByMonth(deals.filter(d => d.status === 'APPROVED'), currentMonthStr);
  const dealsPrev = filterByMonth(deals.filter(d => d.status === 'APPROVED'), previousMonthStr);

  const postsCurr = filterByMonth(posts.filter(p => p.status === 'APPROVED'), currentMonthStr);
  const postsPrev = filterByMonth(posts.filter(p => p.status === 'APPROVED'), previousMonthStr);

  const meetingsCurr = filterByMonth(meetings, currentMonthStr);
  const meetingsPrev = filterByMonth(meetings, previousMonthStr);

  // Chấm công do máy chủ đếm: trình duyệt không còn giữ cả bảng để đếm tay.
  // Lấy theo đúng khoảng ngày của tháng KPI đang chọn (from/to) — tham số
  // month của máy chủ là tháng dương lịch, lệch với các ô khác trên trang.
  // Chỉ còn dùng cho file CSV (hàng số liệu giữ bốn ô cho chia đều).
  const [soChamCong, setSoChamCong] = useState(null);
  useEffect(() => {
    let conHieuLuc = true;
    const dem = async (m) => {
      const { tu, den } = khoangThangKpi(m);
      const r = await apiClient.getRaw(`/attendance?size=1&from=${tu.format('YYYY-MM-DD')}&to=${den.format('YYYY-MM-DD')}`).catch(() => null);
      return r?.stats?.total ?? 0;
    };
    Promise.all([dem(currentMonthStr), dem(previousMonthStr)]).then(([nay, truoc]) => {
      if (conHieuLuc) setSoChamCong({ nay, truoc });
    });
    return () => { conHieuLuc = false; };
  }, [currentMonthStr, previousMonthStr]);

  const attCurrSo = soChamCong?.nay ?? 0;
  const attPrevSo = soChamCong?.truoc ?? 0;

  // Dùng cho file CSV xuất ra (giữ nguyên định dạng cũ)
  const calcTrend = (curr, prev) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  // Biểu đồ theo phòng và xếp hạng chỉ tính khối kinh doanh — Văn phòng và
  // Admin không bị chấm KPI, đưa vào thì phòng nào có họ cũng bị kéo tụt.
  const nhanSuKpi = useMemo(() => locNguoiChamKpi(activeUsers), [activeUsers]);
  const diemCua = (ds, userId) => ds.find(s => s.userId === userId)?.total || 0;
  const trungBinh = (ds) => nhanSuKpi.length
    ? Math.round(nhanSuKpi.reduce((t, u) => t + diemCua(ds, u.id), 0) / nhanSuKpi.length)
    : 0;
  const tbNay = trungBinh(scoresCurr);
  const tbTruoc = trungBinh(scoresPrev);

  // Điểm trung bình mỗi người theo phòng — trung bình chứ không cộng dồn, để
  // phòng đông người không tự nhiên đứng đầu. Phòng thấp nhất nằm cuối.
  const theoPhong = departments
    .map(dept => {
      const nguoi = nhanSuKpi.filter(u => u.deptId === dept.id);
      if (!nguoi.length) return null;
      const diem = nguoi.map(u => diemCua(scoresCurr, u.id));
      return {
        id: dept.id,
        ten: tenPhong(dept.name),
        soNguoi: nguoi.length,
        chuaCoDiem: diem.filter(d => d <= 0).length,
        tb: Math.round(diem.reduce((t, d) => t + d, 0) / nguoi.length),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.tb - a.tb || a.ten.localeCompare(b.ten, 'vi'));

  // Xếp hạng — bằng điểm thì cùng hạng (1, 1, 3…), 0 điểm thì chưa xếp hạng (như Bảng vinh danh)
  const bang = useMemo(() => {
    const ds = nhanSuKpi.map(user => {
      const s = scoresCurr.find(x => x.userId === user.id);
      return {
        user,
        phong: tenPhong(departments.find(d => d.id === user.deptId)?.name || 'Chưa phân phòng'),
        diem: s?.total || 0,
        chotCan: (s?.deal || 0) > 0,
      };
    }).sort((a, b) => b.diem - a.diem || (a.user.name || '').localeCompare(b.user.name || '', 'vi'));
    ds.forEach((r, i) => {
      r.hang = r.diem <= 0 ? null : (i > 0 && ds[i - 1].diem === r.diem ? ds[i - 1].hang : i + 1);
    });
    return ds;
  }, [nhanSuKpi, scoresCurr, departments]);
  const coDiem = bang.filter(r => r.diem > 0);
  const top5 = coDiem.slice(0, 5);
  const chuaCoDiem = bang.filter(r => r.diem <= 0);

  // Cơ cấu điểm KPI. Trước đây mỗi nhóm có `|| 10` để biểu đồ không trống — số
  // bịa trên dashboard quản trị là thứ tệ nhất có thể có; trống thì nói là trống.
  const coCau = NHOM_DIEM.map(n => ({ ...n, value: scoresCurr.reduce((t, s) => t + (s[n.key] || 0), 0) }));
  const tongHoatDong = coCau.reduce((t, n) => t + n.value, 0);
  const phanTram = chiaPhanTram(coCau.map(n => n.value));
  const coCauTrong = !tongHoatDong;
  const soChotCan = scoresCurr.filter(s => (s.deal || 0) > 0).length;

  // Việc chờ duyệt — đúng năm nhóm của ô đếm trên thanh menu và chuông thông
  // báo; bấm là mở thẳng trang duyệt của nhóm đó.
  const nhomCho = [
    { ten: 'Chấm công',   ds: attendance,              trang: '/admin/cham-cong' },
    { ten: 'Thực chiến',  ds: meetings,                trang: '/admin/thuc-chien' },
    { ten: 'Bài đăng',    ds: posts,                   trang: '/admin/lan-toa' },
    { ten: 'Đào tạo 1-1', ds: oneOnOneTrainings || [], trang: '/admin/dao-tao?tab=oneOnOne' },
    { ten: 'Chốt căn',    ds: deals,                   trang: '/admin/chot-can' },
  ].map(nhom => {
    const cho = nhom.ds.filter(x => x.status === 'PENDING');
    const cuNhat = cho.reduce((c, x) => {
      const t = new Date(x.submittedAt || x.checkinTime).getTime();
      return Number.isFinite(t) && (!c || t < c.t) ? { t, x } : c;
    }, null);
    return { ...nhom, soCho: cho.length, cuNhat };
  }).filter(n => n.soCho > 0);
  const tongCho = nhomCho.reduce((t, n) => t + n.soCho, 0);

  const xuatBaoCao = () => {
    const exportData = [
      { metric: 'Tổng Điểm KPI', value: kpiCurr, trend: calcTrend(kpiCurr, kpiPrev) },
      { metric: 'Bài viết PR', value: postsCurr.length, trend: calcTrend(postsCurr.length, postsPrev.length) },
      { metric: 'Thực chiến', value: meetingsCurr.length, trend: calcTrend(meetingsCurr.length, meetingsPrev.length) },
      { metric: 'Deal thành công', value: dealsCurr.length, trend: calcTrend(dealsCurr.length, dealsPrev.length) },
      { metric: 'Ngày công', value: attCurrSo, trend: calcTrend(attCurrSo, attPrevSo) }
    ];
    exportToCSV(exportData, [{ title: 'Chỉ số', key: 'metric' }, { title: 'Giá trị', key: 'value' }, { title: 'Tăng trưởng (%)', key: 'trend' }], `Bao_Cao_Tong_Quan_${currentMonthStr}.csv`);
  };

  // Ô chưa có số kỳ trước (đang tải) giữ một dòng trống cho các ô cao bằng nhau
  const giuDong = ' ';

  return (
    <div className="tq">
      <div className="tq-dau">
        <div>
          <h2 className="tq-ten">Tháng KPI {selectedMonth.format('M/YYYY')}</h2>
          <div className="tq-mo-ta">
            {khoangThang.tu.format('DD/MM')} – {khoangThang.den.format('DD/MM/YYYY')} · tối đa {so(toiDaThang)} điểm/người
          </div>
        </div>
        <div className="tq-nut">
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => date && setThangChon(date.format('YYYY-MM'))}
            allowClear={false}
            format="MM/YYYY"
            style={{ width: 132 }}
          />
          <Button icon={<DownloadOutlined />} onClick={xuatBaoCao}>Xuất báo cáo</Button>
        </div>
      </div>

      <div>
        <div className="tq-so-voi">So với tháng KPI {selectedMonth.subtract(1, 'month').format('M/YYYY')}</div>
        <DaiSoLieu items={[
          {
            nhan: 'Điểm trung bình',
            giaTri: dangTai ? '—' : <>{so(tbNay)}<small>/ {so(toiDaThang)}</small></>,
            phu: dangTai || dangTaiTruoc ? giuDong : <XuHuong nay={tbNay} truoc={tbTruoc} />,
          },
          { nhan: 'Thực chiến', giaTri: so(meetingsCurr.length), phu: <XuHuong nay={meetingsCurr.length} truoc={meetingsPrev.length} /> },
          { nhan: 'Bài đăng',   giaTri: so(postsCurr.length),    phu: <XuHuong nay={postsCurr.length} truoc={postsPrev.length} /> },
          { nhan: 'Chốt căn',   giaTri: so(dealsCurr.length),    phu: <XuHuong nay={dealsCurr.length} truoc={dealsPrev.length} /> },
        ]} />
      </div>

      <div className="tq-luoi">
        <div className="tq-cot">
          <The ten="Điểm trung bình theo phòng" className="tq-the-phong">
            {dangTai ? <KhungCho dong={4} /> : theoPhong.length === 0 ? (
              <p className="tq-trong">Chưa có phòng nào có nhân sự kinh doanh được chấm KPI.</p>
            ) : coDiem.length === 0 ? (
              // Cả tháng chưa ai có điểm: một câu, không phải mỗi phòng một dòng "0 / 500 · N chưa có điểm"
              <p className="tq-trong">Chưa phòng nào được cộng điểm trong tháng KPI {selectedMonth.format('M/YYYY')}.</p>
            ) : (
              <ul className="tq-phong">
                {theoPhong.map(p => (
                  <li key={p.id}>
                    <div className="tq-dong">
                      <span className="tq-dong-ten" title={p.ten}>{p.ten}</span>
                      <span className="tq-dong-so">{so(p.tb)}<small> / {so(toiDaThang)}</small></span>
                    </div>
                    <div className="tq-thanh" role="progressbar" aria-label={`Điểm trung bình ${p.ten}`}
                         aria-valuenow={p.tb} aria-valuemin={0} aria-valuemax={toiDaThang}>
                      <i style={{ width: `${Math.min(100, (p.tb / toiDaThang) * 100)}%` }} />
                    </div>
                    <div className="tq-phu">
                      {p.soNguoi} người
                      {p.chuaCoDiem > 0 && <> · <span className="tq-chu-y">{p.chuaCoDiem} chưa có điểm</span></>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </The>

          <The
            ten="Xếp hạng tháng"
            className="tq-the-hang"
            hanhDong={<button type="button" className="tq-lien" onClick={() => navigate('/admin/vinh-danh')}>Bảng vinh danh</button>}
          >
            {dangTai ? <KhungCho dong={5} /> : coDiem.length === 0 ? (
              <p className="tq-trong">Tháng KPI {selectedMonth.format('M/YYYY')} chưa có ai được cộng điểm.</p>
            ) : (
              <>
                <ol className="tq-hang">
                  {top5.map(r => (
                    <li key={r.user.id}>
                      <span className={`vd-hang${r.hang <= 3 ? ` vd-hang-${r.hang}` : ''}`}>{r.hang}</span>
                      <AnhNguoi nguoi={r.user} size={36} />
                      <div className="tq-hang-nguoi">
                        <div className="tq-dong-ten" title={r.user.name}>{r.user.name}</div>
                        <div className="tq-phu">
                          {r.phong}{r.chotCan && <> · <span className="tq-chot">có chốt căn</span></>}
                        </div>
                      </div>
                      <div className="tq-thanh" role="presentation">
                        <i style={{ width: `${Math.min(100, (r.diem / toiDaThang) * 100)}%` }} />
                      </div>
                      <span className="tq-dong-so">{so(r.diem)}</span>
                    </li>
                  ))}
                </ol>
                {chuaCoDiem.length > 0 && (
                  <div className="tq-nhac">
                    <div className="tq-nhac-dau">
                      <i className="tq-cham-chu-y" aria-hidden="true" />
                      <span className="tq-chu-y">{chuaCoDiem.length} người chưa có điểm</span>
                    </div>
                    <div className="tq-nhac-ten">
                      {chuaCoDiem.slice(0, 8).map(r => r.user.name).join(', ')}
                      {chuaCoDiem.length > 8 && ` và ${chuaCoDiem.length - 8} người khác`}
                    </div>
                  </div>
                )}
              </>
            )}
          </The>
        </div>

        <div className="tq-cot">
          <The ten="Chờ duyệt" phu={tongCho > 0 ? `${so(tongCho)} việc` : null} className="tq-the-ds">
            {nhomCho.length === 0 ? (
              <p className="tq-trong">Không có việc nào chờ duyệt.</p>
            ) : (
              <ul className="tq-cho">
                {nhomCho.map(n => {
                  const daCho = n.cuNhat ? bayGio - n.cuNhat.t : 0;
                  const nguoi = n.cuNhat && (users.find(u => u.id === n.cuNhat.x.userId)?.name || n.cuNhat.x.userName);
                  return (
                    <li key={n.ten}>
                      <button type="button" onClick={() => navigate(n.trang)}>
                        <div className="tq-cho-chu">
                          <div className="tq-dong-ten">{n.ten}</div>
                          {n.cuNhat && (
                            <div className="tq-phu tq-cat">
                              Cũ nhất <span className={daCho > CHO_LAU_MS ? 'tq-chu-y' : undefined}>chờ {thoiGianCho(daCho)}</span>
                              {nguoi && ` · ${nguoi}`}
                            </div>
                          )}
                        </div>
                        <span className="tq-cho-so">{so(n.soCho)}</span>
                        <RightOutlined className="tq-cho-mui" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </The>

          <The ten="Cơ cấu điểm KPI" className="tq-the-cocau">
            <div className="tq-vong">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coCauTrong ? [{ value: 1 }] : coCau}
                    dataKey="value"
                    innerRadius="72%" outerRadius="100%"
                    startAngle={90} endAngle={-270}
                    paddingAngle={coCauTrong ? 0 : 1}
                    stroke="#fff" strokeWidth={coCauTrong ? 0 : 1}
                    isAnimationActive={false}
                  >
                    {coCauTrong
                      ? <Cell fill="rgba(15, 23, 42, 0.06)" />
                      : coCau.map(n => <Cell key={n.key} fill={NAVY} fillOpacity={n.dam} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="tq-vong-giua">
                <span className="tq-vong-so">{dangTai ? '—' : so(tongHoatDong)}</span>
                <span className="tq-vong-nhan">điểm</span>
              </div>
            </div>
            <ul className="tq-chu-giai">
              {coCau.map((n, i) => (
                <li key={n.key}>
                  <i className="tq-cham" style={{ background: NAVY, opacity: n.dam }} aria-hidden="true" />
                  <span className="tq-cg-ten" title={n.ten}>{n.ten}</span>
                  <span className="tq-cg-so">{so(n.value)}</span>
                  <span className="tq-cg-pt">{phanTram[i] == null ? '' : `${phanTram[i]}%`}</span>
                </li>
              ))}
            </ul>
            {soChotCan > 0 && (
              <p className="tq-ghi-chu">
                Chưa tính chốt căn: {soChotCan} người có chốt căn được tính đủ {so(toiDaThang)} điểm.
              </p>
            )}
          </The>
        </div>
      </div>
    </div>
  );
};
