import { describe, it, expect } from 'vitest';
import { gopNgayCong, ngayVN, trangThaiNgay } from './ngayCong';

const luot = (id, userId, actionType, checkinTime, status, extra = {}) =>
  ({ id, userId, actionType, checkinTime, status, ...extra });

describe('gộp lượt chấm công thành ngày công', () => {
  it('trường hợp 30/09: lượt ra đã duyệt + lượt ra khác đang chờ → cả hai đều còn, ngày là Chờ duyệt', () => {
    // Máy chủ trả mới nhất trước
    const [ngay] = gopNgayCong([
      luot(2, 7, 'CHECK_OUT', '2026-09-25T10:30:00Z', 'PENDING'),   // 17:30 VN
      luot(1, 7, 'CHECK_OUT', '2026-09-25T07:56:05Z', 'APPROVED'),  // 14:56 VN
    ]);
    expect(ngay.records.map((r) => r.id)).toEqual([1, 2]);
    expect(ngay.checkoutRecord.id).toBe(2);            // ra muộn nhất
    expect(ngay.khac.map((r) => r.id)).toEqual([1]);
    expect(ngay.status).toBe('PENDING');
  });

  it('hai lượt vào: hiện lượt vào sớm nhất, lượt kia vẫn còn và được đếm là đang chờ', () => {
    const [ngay] = gopNgayCong([
      luot(5, 9, 'CHECK_IN', '2026-09-25T06:10:00Z', 'PENDING'),    // 13:10 VN
      luot(4, 9, 'CHECK_IN', '2026-09-25T01:46:44Z', 'APPROVED'),   // 08:46 VN
    ]);
    expect(ngay.checkinRecord.id).toBe(4);
    expect(ngay.checkoutRecord).toBeNull();
    expect(ngay.soChoKhac).toBe(1);
    expect(ngay.status).toBe('PENDING');
  });

  it('một vào một ra bình thường → không có lượt khác', () => {
    const [ngay] = gopNgayCong([
      luot(11, 3, 'CHECK_OUT', '2026-09-30T10:24:05Z', 'APPROVED'),
      luot(10, 3, 'CHECK_IN', '2026-09-30T01:50:56Z', 'APPROVED'),
    ]);
    expect(ngay.checkinRecord.id).toBe(10);
    expect(ngay.checkoutRecord.id).toBe(11);
    expect(ngay.khac).toEqual([]);
    expect(ngay.status).toBe('APPROVED');
  });

  it('chấm công trước 7 giờ sáng (giờ UTC còn là hôm trước) vẫn vào đúng ngày Việt Nam', () => {
    expect(ngayVN('2026-09-24T23:30:00Z')).toBe('2026-09-25');   // 06:30 ngày 25/09 VN
    const ds = gopNgayCong([
      luot(1, 1, 'CHECK_IN', '2026-09-24T23:30:00Z', 'APPROVED'),
      luot(2, 1, 'CHECK_OUT', '2026-09-25T10:00:00Z', 'APPROVED'),
    ]);
    expect(ds).toHaveLength(1);
    expect(ds[0].date).toBe('2026-09-25');
  });

  it('tách theo người và theo ngày, ngày mới nhất lên đầu', () => {
    const ds = gopNgayCong([
      luot(1, 1, 'CHECK_IN', '2026-09-24T02:00:00Z', 'APPROVED'),
      luot(2, 2, 'CHECK_IN', '2026-09-25T02:00:00Z', 'APPROVED'),
      luot(3, 1, 'CHECK_IN', '2026-09-25T02:00:00Z', 'APPROVED'),
    ]);
    expect(ds.map((d) => d.id)).toEqual(['2_2026-09-25', '1_2026-09-25', '1_2026-09-24']);
  });

  it('ghi chú ưu tiên lượt đang chờ', () => {
    const [ngay] = gopNgayCong([
      luot(1, 1, 'CHECK_IN', '2026-09-25T02:00:00Z', 'APPROVED', { note: 'ci park city' }),
      luot(2, 1, 'CHECK_OUT', '2026-09-25T10:00:00Z', 'PENDING', { note: 'gặp khách Vista' }),
    ]);
    expect(ngay.note).toBe('gặp khách Vista');
  });
});

describe('trạng thái cả ngày (khớp cách máy chủ đếm)', () => {
  it('còn lượt chờ → chờ; có lượt từ chối → từ chối; còn lại → đã duyệt', () => {
    expect(trangThaiNgay([{ status: 'APPROVED' }, { status: 'PENDING' }])).toBe('PENDING');
    expect(trangThaiNgay([{ status: 'APPROVED' }, { status: 'REJECTED' }])).toBe('REJECTED');
    expect(trangThaiNgay([{ status: 'APPROVED' }])).toBe('APPROVED');
  });
});
