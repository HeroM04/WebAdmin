import { describe, it, expect } from 'vitest';
import { timNopTrung } from './nopTrung';

const bc = (id, userId, content, submittedAt) => ({ id, userId, content, submittedAt });

describe('báo cáo đào tạo 1-1 nộp trùng', () => {
  it('cùng người, cùng nội dung, cách nhau vài giây → gắn nhãn cả hai', () => {
    const ds = [
      bc(1, 7, 'cách học dự án', '2026-09-23T09:00:22+07:00'),
      bc(2, 7, 'cách học dự án', '2026-09-23T09:00:26+07:00'),
    ];
    expect([...timNopTrung(ds)].sort()).toEqual([1, 2]);
  });

  it('khác hoa thường / thừa dấu cách vẫn tính là trùng', () => {
    const ds = [
      bc(1, 7, 'Đào tạo KD14', '2026-09-23T11:51:12+07:00'),
      bc(2, 7, '  đào tạo   kd14 ', '2026-09-23T11:54:54+07:00'),
    ];
    expect(timNopTrung(ds).size).toBe(2);
  });

  it('khác người, khác nội dung, hoặc cách nhau quá 30 phút → không trùng', () => {
    const ds = [
      bc(1, 7, 'tele sales', '2026-09-23T09:00:00+07:00'),
      bc(2, 8, 'tele sales', '2026-09-23T09:00:05+07:00'),     // người khác
      bc(3, 7, 'pháp lý dự án', '2026-09-23T09:00:10+07:00'),  // nội dung khác
      bc(4, 7, 'tele sales', '2026-09-23T10:00:00+07:00'),     // cách 1 giờ
    ];
    expect(timNopTrung(ds).size).toBe(0);
  });

  it('danh sách rỗng không lỗi', () => {
    expect(timNopTrung([]).size).toBe(0);
    expect(timNopTrung(undefined).size).toBe(0);
  });
});
