import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { apiClient } from './apiClient';
import { thangKpi } from './thangKpi';

/**
 * Tháng đang xem trên các trang KPI: mặc định là tháng KPI ĐANG CHẤM, giữ
 * nguyên đến khi tháng đó kết thúc (hết Chủ nhật của tuần cuối) rồi mới tự
 * sang tháng mới — kể cả khi trang để mở qua đêm Chủ nhật → thứ Hai.
 * Người dùng tự chọn tháng khác thì giữ tháng đã chọn; chọn lại đúng tháng
 * đang chấm thì trở về chế độ tự chuyển.
 */
export const useThangKpiTuDong = () => {
  const [chon, setChon] = useState(null); // null = theo tháng KPI đang chấm
  const [hienTai, setHienTai] = useState(() => thangKpi());
  useEffect(() => {
    const id = setInterval(() => setHienTai(thangKpi()), 60_000);
    return () => clearInterval(id);
  }, []);
  const doiThang = (t) => setChon(!t || t === thangKpi() ? null : t);
  return [chon ?? hienTai, doiThang];
};

/**
 * Điểm KPI của một tháng KPI ('YYYY-MM').
 *
 * Dữ liệu chung (AppContext.kpiScores) chỉ có tháng KPI hiện tại vì GET
 * /kpi-scores không kèm tháng. Tháng đó thì dùng luôn — duyệt xong là số tự
 * cập nhật; tháng khác thì tải riêng /kpi-scores?month=. Trước đây các trang
 * lọc thẳng kpiScores theo tháng được chọn nên lật sang tháng cũ là toàn 0.
 */
export const useDiemKpiThang = (thang) => {
  const { kpiScores } = useContext(AppContext);
  // Kết quả tải riêng gắn với tháng của nó: đổi tháng là taiRieng.thang lệch
  // ngay → đang tải, khỏi đặt cờ trong effect.
  const [taiRieng, setTaiRieng] = useState({ thang: null, ds: [] });

  const coSan = kpiScores.some(s => s.month === thang);
  useEffect(() => {
    if (coSan) return;
    let huy = false;
    apiClient.get(`/kpi-scores?month=${thang}`)
      .then(d => { if (!huy) setTaiRieng({ thang, ds: Array.isArray(d) ? d : [] }); })
      .catch(() => { if (!huy) setTaiRieng({ thang, ds: [] }); });
    return () => { huy = true; };
  }, [thang, coSan]);

  const ds = useMemo(() => (coSan ? kpiScores.filter(s => s.month === thang)
                                  : (taiRieng.thang === thang ? taiRieng.ds : [])),
                     [coSan, kpiScores, thang, taiRieng]);
  const dangTai = !coSan && taiRieng.thang !== thang;
  return { ds, dangTai };
};
