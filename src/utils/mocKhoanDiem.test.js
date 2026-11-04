import { describe, it, expect } from 'vitest';
import { mocKhoanDiem } from './mocKhoanDiem';

// Giờ địa phương, không kèm múi — test chạy ở máy nào cũng ra cùng chuỗi
describe('mốc hiện cạnh khoản điểm', () => {
  it('hiện lúc ghi, không phải lúc phát sinh', () => {
    expect(mocKhoanDiem({ createdAt: '2026-11-04T09:12:00', occurredAt: '2026-11-04T08:41:00' }))
      .toBe('09:12 · 04/11');
  });

  it('ghi vào ngày khác ngày được tính thì nói rõ ngày được tính', () => {
    expect(mocKhoanDiem({ createdAt: '2026-11-04T09:12:00', occurredAt: '2026-11-03T08:40:00' }))
      .toBe('09:12 · 04/11 · cho ngày 03/11');
  });

  it('thiếu lúc ghi (dữ liệu cũ) thì quay về lúc phát sinh', () => {
    expect(mocKhoanDiem({ occurredAt: '2026-11-03T20:26:00' })).toBe('20:26 · 03/11');
    expect(mocKhoanDiem({})).toBe('');
  });
});
