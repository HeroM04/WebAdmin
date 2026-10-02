import { describe, it, expect } from 'vitest';
import { thangKpi, diemToiDaThang, khoangThangKpi } from './thangKpi';

describe('tháng KPI theo thứ Hai đầu tuần', () => {
  it('đầu tháng chưa qua thứ Hai đầu tiên → vẫn là tháng trước', () => {
    expect(thangKpi('2026-10-02')).toBe('2026-09'); // thứ Sáu, tuần bắt đầu 28/09
    expect(thangKpi('2026-10-04')).toBe('2026-09'); // Chủ nhật cuối tuần đó
  });

  it('từ thứ Hai đầu tiên là sang tháng mới', () => {
    expect(thangKpi('2026-10-05')).toBe('2026-10');
    expect(thangKpi('2026-10-31')).toBe('2026-10');
  });

  it('tuần vắt sang tháng sau vẫn thuộc tháng của thứ Hai', () => {
    expect(thangKpi('2026-11-01')).toBe('2026-10'); // CN, thứ Hai là 26/10
  });
});

describe('điểm tối đa và khoảng ngày của tháng KPI', () => {
  it('số thứ Hai × 100', () => {
    expect(diemToiDaThang('2026-09')).toBe(400);
    expect(diemToiDaThang('2026-08')).toBe(500); // 3, 10, 17, 24, 31/08
  });

  it('từ thứ Hai đầu tiên đến Chủ nhật sau thứ Hai cuối', () => {
    const { tu, den } = khoangThangKpi('2026-09');
    expect(tu.format('DD/MM')).toBe('07/09');
    expect(den.format('DD/MM')).toBe('04/10');
  });
});
