// Helpers dùng chung cho phân hệ SalePro: format hiển thị + tính toán khoản vay.
// Quy ước dữ liệu backend: các trường giá (listedPrice, loanPrice...) lưu theo đơn vị TỶ VNĐ.

export const STATUS_META = {
  CON_HANG: { label: 'Còn hàng', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  DA_BAN: { label: 'Đã bán', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  QUY_DOC_QUYEN: { label: 'Quỹ Độc quyền', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
};

export const getStatusMeta = (status) =>
  STATUS_META[status] || { label: status || 'Không rõ', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };

const DIRECTION_LABELS = {
  DONG: 'Đông', TAY: 'Tây', NAM: 'Nam', BAC: 'Bắc',
  DONG_BAC: 'Đông Bắc', DONG_NAM: 'Đông Nam', TAY_BAC: 'Tây Bắc', TAY_NAM: 'Tây Nam',
};

export const formatDirection = (direction) => DIRECTION_LABELS[direction] || direction || '—';

// '1PN' / '1BR' -> '1 Phòng ngủ', '2BR+' -> '2 Phòng ngủ +'
export const formatApartmentType = (type) => {
  if (!type) return '—';
  const matched = String(type).trim().match(/^(\d+)\s*(BR|PN)\s*(\+?)$/i);
  if (matched) return `${matched[1]} Phòng ngủ${matched[3] ? ' +' : ''}`;
  return type;
};

// 8583581849 -> '8.583.581.849'
export const formatVnd = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(amount));
};

// 7.88 (tỷ) -> '7.88 tỷ'
export const formatBillion = (billion) => {
  if (billion === null || billion === undefined || isNaN(billion)) return '—';
  return `${Number(billion).toFixed(2)} tỷ`;
};

export const formatArea = (area) => {
  if (area === null || area === undefined || isNaN(area)) return '—';
  return `${Number(area)} m²`;
};

// Đơn giá (triệu/m²) tính theo giá thanh toán sớm (TTS), fallback giá niêm yết
export const unitPricePerM2 = (apartment) => {
  const priceBillion = apartment?.earlyPaymentPrice ?? apartment?.listedPrice;
  const area = apartment?.clearanceArea;
  if (!priceBillion || !area) return null;
  return (Number(priceBillion) * 1000) / Number(area);
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/**
 * Tính khoản vay theo phương pháp dư nợ giảm dần, gốc trả đều hàng tháng.
 * Lãi suất ưu đãi áp dụng trong thời gian ưu đãi, sau đó chuyển sang lãi suất thả nổi.
 * @param {object} params
 * @param {number} params.loanPriceVnd  Giá trị tính vay (VNĐ)
 * @param {number} params.ratioPct      Tỷ lệ vay (%)
 * @param {number} params.prefRatePct   Lãi suất ưu đãi (%/năm)
 * @param {number} params.prefYears     Thời gian ưu đãi (năm)
 * @param {number} params.floatRatePct  Lãi suất thả nổi (%/năm)
 * @param {number} params.termYears     Thời hạn vay (năm)
 */
export const calcLoanSchedule = ({ loanPriceVnd, ratioPct, prefRatePct, prefYears, floatRatePct, termYears }) => {
  const months = Math.max(1, Math.round((termYears || 0) * 12));
  const prefMonths = Math.min(months, Math.max(0, Math.round((prefYears || 0) * 12)));
  const loanAmount = (loanPriceVnd || 0) * ((ratioPct || 0) / 100);
  const monthlyPrincipal = loanAmount / months;

  let remaining = loanAmount;
  let totalInterest = 0;
  const schedule = [];
  for (let m = 1; m <= months; m += 1) {
    const yearRatePct = m <= prefMonths ? (prefRatePct || 0) : (floatRatePct || 0);
    const interest = remaining * (yearRatePct / 100 / 12);
    totalInterest += interest;
    schedule.push({
      month: m,
      opening: remaining,
      principal: monthlyPrincipal,
      interest,
      payment: monthlyPrincipal + interest,
      closing: Math.max(0, remaining - monthlyPrincipal),
      ratePct: yearRatePct,
    });
    remaining -= monthlyPrincipal;
  }

  return {
    months,
    loanAmount,
    totalInterest,
    totalPayment: loanAmount + totalInterest,
    avgPrincipal: loanAmount / months,
    avgInterest: totalInterest / months,
    avgTotal: (loanAmount + totalInterest) / months,
    schedule,
  };
};

// Map căn hộ (ApartmentDTO từ API) sang cấu trúc giỏ so sánh mà CompareContext/ComparePage đang dùng
export const toCompareItem = (apartment) => ({
  id: apartment.id,
  apartmentCode: apartment.apartmentCode,
  price: formatBillion(apartment.listedPrice),
  type: formatApartmentType(apartment.apartmentType),
  direction: formatDirection(apartment.direction),
  floor: apartment.floor,
  area: formatArea(apartment.clearanceArea),
  image: apartment.thumbnailUrl,
  landArea: formatArea(apartment.landArea ?? apartment.clearanceArea),
  buildArea: formatArea(apartment.builtUpArea),
  status: getStatusMeta(apartment.status).label,
  zone: apartment.subdivisionName,
  axis: apartment.axis,
});
