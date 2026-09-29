import { describe, it, expect } from 'vitest';
import { docKhoangCach, laXa, NGUONG_XA_MET } from './khoangCach';

describe('hiện khoảng cách chấm công tới văn phòng', () => {
  it('dưới 1 km hiện mét, làm tròn', () => {
    expect(docKhoangCach(0)).toBe('0 m');
    expect(docKhoangCach(45.6)).toBe('46 m');
    expect(docKhoangCach(999)).toBe('999 m');
  });

  it('từ 1 km hiện km, một chữ số thập phân kiểu Việt Nam', () => {
    expect(docKhoangCach(1000)).toBe('1 km');
    expect(docKhoangCach(2345)).toBe('2,3 km');
  });

  it('bản ghi cũ không có khoảng cách → không hiện gì', () => {
    expect(docKhoangCach(null)).toBeNull();
    expect(docKhoangCach(undefined)).toBeNull();
    expect(docKhoangCach('')).toBeNull();
  });
});

describe('đánh dấu chấm công ở xa', () => {
  it(`xa hơn ${NGUONG_XA_MET} m thì cảnh báo, kể cả khi đã tự duyệt`, () => {
    expect(laXa(2300)).toBe(true);
    expect(laXa(NGUONG_XA_MET + 1)).toBe(true);
  });

  it('trong văn phòng hoặc không có số liệu thì không cảnh báo', () => {
    expect(laXa(40)).toBe(false);
    expect(laXa(NGUONG_XA_MET)).toBe(false);
    expect(laXa(null)).toBe(false);
    expect(laXa(undefined)).toBe(false);
  });
});
