import dayjs from 'dayjs';

/**
 * Buổi đào tạo (ngày + giờ bắt đầu + thời lượng phút) đã kết thúc chưa.
 *
 * Dùng ở form Thêm buổi: buổi đã kết thúc là buổi Admin lên lịch bù sau khi lớp
 * học xong — phải chọn luôn người đã dự (POST /training-sessions/nhap-bu), không
 * tạo trơn rồi điểm danh tay từng người. Khớp điều kiện của máy chủ: giờ kết thúc
 * KHÔNG sau thời điểm hiện tại. Thiếu ngày hoặc giờ thì chưa kết luận.
 */
export const buoiDaKetThuc = (ngay, gio, phut, bayGio = dayjs()) => {
  if (!ngay || !gio) return false;
  const d = dayjs(ngay);
  const g = dayjs(gio);
  const batDau = d.hour(g.hour()).minute(g.minute()).second(0).millisecond(0);
  const thoiLuong = Number(phut) > 0 ? Number(phut) : 120;
  return !batDau.add(thoiLuong, 'minute').isAfter(bayGio);
};
