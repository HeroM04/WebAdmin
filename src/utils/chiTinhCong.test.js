import { describe, it, expect } from 'vitest';
import { coTheChiTinhCong, duongChiTinhCong, nhanChiTinhCong } from './chiTinhCong';

const sale = { role: 'SALE' };
const luot = (extra = {}) => ({ id: 5, actionType: 'CHECK_IN', status: 'APPROVED', checkinTime: '2026-10-12T01:45:10Z', ...extra });

describe('Chỉ tính công', () => {
  it('lượt vào của Sale / Trưởng phòng, đã duyệt hoặc chờ duyệt → có nút', () => {
    expect(coTheChiTinhCong(sale, luot())).toBe(true);
    expect(coTheChiTinhCong({ role: 'TRUONG_PHONG' }, luot({ status: 'PENDING' }))).toBe(true);
  });

  it('văn phòng, lượt ra, lượt bị từ chối, thứ Bảy (giờ VN) → không có nút', () => {
    expect(coTheChiTinhCong({ role: 'VAN_PHONG' }, luot())).toBe(false);
    expect(coTheChiTinhCong(sale, luot({ actionType: 'CHECK_OUT' }))).toBe(false);
    expect(coTheChiTinhCong(sale, luot({ status: 'REJECTED' }))).toBe(false);
    expect(coTheChiTinhCong(sale, luot({ checkinTime: '2026-10-17T01:45:00Z' }))).toBe(false);
    // 23:30 thứ Sáu UTC = 06:30 sáng thứ Bảy VN
    expect(coTheChiTinhCong(sale, luot({ checkinTime: '2026-10-16T23:30:00Z' }))).toBe(false);
    expect(coTheChiTinhCong(sale, null)).toBe(false);
  });

  it('nhãn và đường gọi máy chủ', () => {
    expect(nhanChiTinhCong(luot({ chiTinhCong: 'DI_MUON' }))).toBe('Chỉ tính công · Tính đi muộn (−5)');
    expect(nhanChiTinhCong(luot())).toBeNull();
    expect(duongChiTinhCong(5, 'KHONG_DIEM', 'Chấm ở cửa'))
      .toBe('/attendance/5/chi-tinh-cong?cheDo=KHONG_DIEM&lyDo=Ch%E1%BA%A5m+%E1%BB%9F+c%E1%BB%ADa');
    expect(duongChiTinhCong(5, null)).toBe('/attendance/5/chi-tinh-cong?cheDo=BO');
  });
});
