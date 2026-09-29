/**
 * Khoảng cách từ chỗ chấm công tới văn phòng phòng ban, do máy chủ tính lúc
 * chấm công (trường distanceToOffice, đơn vị mét).
 *
 * Trước đây bảng chấm công không hiện số này: bán kính phòng đặt 3000 m thì
 * người chấm công ở nhà cách 2 km vẫn được tự duyệt mà Admin không nhìn ra.
 */

/** Xa hơn mức này thì tô cam, kể cả khi đã được duyệt. */
export const NGUONG_XA_MET = 500;

/** 45 → "45 m", 2345 → "2,3 km"; không có số → null. */
export const docKhoangCach = (met) => {
  if (met === null || met === undefined || met === '' || !Number.isFinite(Number(met))) return null;
  const m = Math.max(0, Number(met));
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`;
};

export const laXa = (met, nguong = NGUONG_XA_MET) =>
  Number.isFinite(Number(met)) && met !== null && met !== '' && Number(met) > nguong;
