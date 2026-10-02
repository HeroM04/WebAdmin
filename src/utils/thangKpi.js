import dayjs from 'dayjs';

/**
 * Tháng KPI — khớp KpiCalculationService.monthOfWeek ở máy chủ: cả tuần (thứ
 * Hai → Chủ nhật) tính vào tháng của NGÀY THỨ HAI đầu tuần. Thứ Sáu 02/10/2026
 * vẫn thuộc tháng KPI 09/2026 vì tuần đó bắt đầu 28/09.
 *
 * Lấy tháng dương lịch (dayjs().format('YYYY-MM')) thì mấy ngày đầu tháng mọi
 * người đều 0 điểm: máy chủ chưa có dòng điểm nào của tháng mới.
 */
const thuHaiDauTuan = (ngay) => {
  const d = dayjs(ngay).startOf('day');
  return d.subtract((d.day() + 6) % 7, 'day');
};

export const thangKpi = (ngay = new Date()) => thuHaiDauTuan(ngay).format('YYYY-MM');

/** Các thứ Hai của tháng KPI 'YYYY-MM' — mỗi tuần tối đa 100 điểm. */
const cacThuHai = (thang) => {
  const dau = dayjs(thang + '-01');
  const ds = [];
  for (let d = dau; d.month() === dau.month(); d = d.add(1, 'day')) {
    if (d.day() === 1) ds.push(d);
  }
  return ds;
};

/** Điểm tối đa của tháng = số thứ Hai × 100 (như getMaxKpiForMonth ở máy chủ). */
export const diemToiDaThang = (thang) => cacThuHai(thang).length * 100;

/** Ngày đầu – ngày cuối của tháng KPI: từ thứ Hai đầu tiên đến Chủ nhật sau thứ Hai cuối. */
export const khoangThangKpi = (thang) => {
  const ds = cacThuHai(thang);
  return { tu: ds[0], den: ds[ds.length - 1].add(6, 'day') };
};
