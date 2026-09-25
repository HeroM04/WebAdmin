import { describe, it, expect, beforeAll } from 'vitest';

// So ngày theo giờ máy người dùng — chạy test theo giờ Việt Nam như máy Admin
beforeAll(() => { process.env.TZ = 'Asia/Ho_Chi_Minh'; });

import { boDau, khopTen, doiKhoang, khopNgay } from './locBang';

describe('tìm theo tên không dấu', () => {
  it('bỏ dấu và hạ chữ thường', () => {
    expect(boDau('Đàm Mai Liên')).toBe('dam mai lien');
    expect(boDau(null)).toBe('');
  });

  it('gõ "lien" ra "Liên"; gõ tên phòng cũng tìm được', () => {
    expect(khopTen('lien', 'Đàm Mai Liên')).toBe(true);
    expect(khopTen('kinh doanh 8', 'Nguyễn A', 'Phòng Kinh Doanh 8')).toBe(true);
    expect(khopTen('hung', 'Đàm Mai Liên')).toBe(false);
  });

  it('ô tìm kiếm trống → khớp tất cả', () => {
    expect(khopTen('', 'bất kỳ')).toBe(true);
    expect(khopTen('   ', 'bất kỳ')).toBe(true);
  });
});

describe('lọc theo khoảng ngày', () => {
  it('chọn 01/09–10/09 lấy cả ngày 10/09 (tới 23:59)', () => {
    const k = ['2026-09-01', '2026-09-10'];
    expect(khopNgay(k, '2026-09-10')).toBe(true);
    expect(khopNgay(k, new Date(2026, 8, 10, 23, 59))).toBe(true);
    expect(khopNgay(k, '2026-09-11')).toBe(false);
  });

  it('giờ UTC từ máy chủ quy về ngày theo giờ VN (18:30Z = 01:30 sáng hôm sau)', () => {
    const k = ['2026-09-11', '2026-09-11'];
    expect(khopNgay(k, '2026-09-10T18:30:00Z')).toBe(true);
  });

  it('chưa chọn khoảng → không lọc; có khoảng mà bản ghi không có ngày → loại', () => {
    expect(khopNgay(null, '2026-09-10')).toBe(true);
    expect(khopNgay(['2026-09-01', '2026-09-10'], null)).toBe(false);
  });

  it('đổi giá trị ô chọn ngày thành chuỗi ISO', () => {
    const d = (s) => ({ format: () => s });
    expect(doiKhoang([d('2026-09-01'), d('2026-09-10')])).toEqual(['2026-09-01', '2026-09-10']);
    expect(doiKhoang(null)).toBeNull();
    expect(doiKhoang([d('2026-09-01'), null])).toBeNull();
  });
});
