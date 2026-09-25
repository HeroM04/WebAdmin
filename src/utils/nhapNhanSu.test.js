import { describe, it, expect } from 'vitest';
import { docVaiTro, chuanSdt, cuoi9, khoaPhong, timCot } from './nhapNhanSu';

// Dữ liệu thật từ Google Form tuyển dụng — đọc sai một cột là cả trăm người
// vào nhầm phòng, nhầm vai trò, hoặc có tài khoản không đăng nhập được.

describe('đọc vai trò', () => {
  it('chuyên viên kinh doanh / sale / để trống → SALE', () => {
    expect(docVaiTro('Chuyên viên kinh doanh')).toBe('SALE');
    expect(docVaiTro('sale')).toBe('SALE');
    expect(docVaiTro('')).toBe('SALE');
    expect(docVaiTro(undefined)).toBe('SALE');
  });

  it('trưởng phòng, TPKD, giám đốc kinh doanh → TRUONG_PHONG', () => {
    expect(docVaiTro('Trưởng phòng')).toBe('TRUONG_PHONG');
    expect(docVaiTro('TPKD')).toBe('TRUONG_PHONG');
    expect(docVaiTro('GĐKD')).toBe('TRUONG_PHONG');
  });

  it('kế toán, hành chính, Back Office → VAN_PHONG (không bị chấm KPI)', () => {
    expect(docVaiTro('Kế toán')).toBe('VAN_PHONG');
    expect(docVaiTro('Hành chính nhân sự')).toBe('VAN_PHONG');
    expect(docVaiTro('Back Office')).toBe('VAN_PHONG');
  });

  it('mã vai trò viết sẵn được giữ nguyên', () => {
    expect(docVaiTro('VAN_PHONG')).toBe('VAN_PHONG');
    expect(docVaiTro('truong_phong')).toBe('TRUONG_PHONG');
  });
});

describe('chuẩn hóa số điện thoại', () => {
  it('Excel cắt mất số 0 đầu → thêm lại', () => {
    expect(chuanSdt(912345678)).toBe('0912345678');
  });

  it('+84 / 84 đầu → 0', () => {
    expect(chuanSdt('+84 912 345 678')).toBe('0912345678');
    expect(chuanSdt('84912345678')).toBe('0912345678');
  });

  it('bỏ dấu cách, chấm, gạch', () => {
    expect(chuanSdt('0912.345.678')).toBe('0912345678');
    expect(chuanSdt(' 0912-345-678 ')).toBe('0912345678');
  });

  it('9 số cuối để so trùng, bỏ qua khác biệt 0/84', () => {
    expect(cuoi9('0912345678')).toBe(cuoi9('84912345678'));
  });
});

describe('khóa tên phòng', () => {
  it('mọi cách ghi phòng kinh doanh 5 về cùng một khóa', () => {
    const k = khoaPhong('Phòng Kinh Doanh 5');
    expect(k).toBe('kd5');
    expect(khoaPhong('KD05')).toBe(k);
    expect(khoaPhong('PKD5')).toBe(k);
    expect(khoaPhong('kinh doanh 05')).toBe(k);
  });

  it('KD5 và KD50 là hai phòng khác nhau', () => {
    expect(khoaPhong('KD5')).not.toBe(khoaPhong('KD50'));
  });

  it('Back-Office viết kiểu nào cũng nhận', () => {
    expect(khoaPhong('Phòng Back-Office')).toBe('backoffice');
    expect(khoaPhong('back office')).toBe('backoffice');
  });
});

describe('tìm cột theo tiêu đề', () => {
  const tieuDe = ['Dấu thời gian', 'Họ và tên', 'Số điện thoại', 'Phòng - chức vụ'];

  it('không phân biệt dấu, hoa thường, thứ tự cột', () => {
    expect(timCot(tieuDe, 'ho va ten', 'ten')).toBe(1);
    expect(timCot(tieuDe, 'so dien thoai', 'sdt')).toBe(2);
    expect(timCot(tieuDe, 'phong')).toBe(3);
  });

  it('không có cột → -1', () => {
    expect(timCot(tieuDe, 'ngay vao')).toBe(-1);
  });
});
