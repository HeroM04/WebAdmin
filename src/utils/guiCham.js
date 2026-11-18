/**
 * Nhãn cho lượt chấm công gửi chậm do mạng (app từ 18/11/2026).
 *
 * Giờ hiện trên bảng là giờ BẤM chấm công; `guiChamGiay` là số giây từ lúc bấm
 * tới lúc máy chủ nhận được. Gửi chậm tới 30 phút máy chủ tự nhận như thường,
 * quá 30 phút thì để Chờ duyệt. Dưới 1 phút (thời gian tải ảnh) không gắn nhãn.
 */
export const nhanGuiCham = (luot) => {
  const giay = Number(luot?.guiChamGiay);
  if (!Number.isFinite(giay) || giay < 60) return null;
  const phut = Math.round(giay / 60);
  return phut >= 60
    ? `Gửi chậm ${Math.floor(phut / 60)} giờ ${phut % 60 ? `${phut % 60} phút` : ''}`.trim()
    : `Gửi chậm ${phut} phút`;
};

export const goiYGuiCham = 'Bấm chấm công đúng giờ ghi trên bảng nhưng mạng kẹt, máy chủ nhận sau. '
  + 'Giờ chấm công tính theo lúc bấm. Chậm quá 30 phút thì phải duyệt.';
