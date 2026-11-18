import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { buoiDaKetThuc } from './buoiDaoTao';

// 18/11/2026 10:00 giờ máy
const bayGio = dayjs('2026-11-18T10:00:00');

describe('buoiDaKetThuc — form Thêm buổi chuyển sang Nhập bù khi buổi đã học xong', () => {
  it('buổi tuần trước (tuần 46) → đã kết thúc', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-11'), dayjs('2026-11-18T09:00:00'), 120, bayGio)).toBe(true);
  });

  it('sáng nay 7:00, học 120 phút → đã xong lúc 9:00', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-18'), dayjs('2000-01-01T07:00:00'), 120, bayGio)).toBe(true);
  });

  it('đang diễn ra (9:00, 120 phút, bây giờ 10:00) → chưa kết thúc, tạo buổi bình thường để quét QR', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-18'), dayjs('2000-01-01T09:00:00'), 120, bayGio)).toBe(false);
  });

  it('buổi sắp tới → chưa kết thúc', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-20'), dayjs('2000-01-01T09:00:00'), 120, bayGio)).toBe(false);
  });

  it('chưa chọn giờ → chưa kết luận (không tự coi 00:00 là đã qua)', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-11'), null, 120, bayGio)).toBe(false);
    expect(buoiDaKetThuc(null, dayjs('2000-01-01T09:00:00'), 120, bayGio)).toBe(false);
  });

  it('thời lượng trống → mặc định 120 phút như máy chủ', () => {
    expect(buoiDaKetThuc(dayjs('2026-11-18'), dayjs('2000-01-01T08:00:00'), '', bayGio)).toBe(true);   // xong 10:00
    expect(buoiDaKetThuc(dayjs('2026-11-18'), dayjs('2000-01-01T08:30:00'), undefined, bayGio)).toBe(false);
  });
});
