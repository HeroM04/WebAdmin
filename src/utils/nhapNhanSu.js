import { boDau } from './locBang';

/*
 * Quy tắc đọc file Excel nhân sự — tách khỏi màn hình nhập để kiểm thử được.
 *
 * File thật đến từ Google Form nên ghi đủ kiểu: "Chuyên viên kinh doanh",
 * "TPKD", "KD05", "Phòng Kinh Doanh 5", SĐT mất số 0 đầu vì Excel coi là số…
 * Đọc sai một cột là cả trăm người vào nhầm phòng, nhầm vai trò.
 */

export const VAI_TRO = {
  SALE: 'SALE', TRUONG_PHONG: 'TRUONG_PHONG', VAN_PHONG: 'VAN_PHONG', ADMIN: 'ADMIN',
};

/** "Chuyên viên kinh doanh", "sale", "Trưởng phòng", "TPKD"… → mã vai trò. */
export function docVaiTro(v) {
  const t = boDau(v);
  if (!t) return VAI_TRO.SALE;
  if (/^(sale|truong_phong|van_phong|admin)$/.test(t)) return t.toUpperCase();
  if (/truong phong|tpkd|\btp\b|giam doc|gdkd/.test(t)) return VAI_TRO.TRUONG_PHONG;
  if (/van phong|hanh chinh|ke toan|nhan su|back ?office/.test(t)) return VAI_TRO.VAN_PHONG;
  if (/quan tri|admin/.test(t)) return VAI_TRO.ADMIN;
  return VAI_TRO.SALE;
}

/** SĐT: chỉ số; 9 số → thêm 0 đầu (Excel hay cắt số 0); 84xxxxxxxxx → 0xxxxxxxxx. */
export function chuanSdt(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('84')) d = '0' + d.slice(2);
  if (d.length === 9 && !d.startsWith('0')) d = '0' + d;
  return d;
}

/** 9 số cuối của SĐT — khóa so trùng, bỏ qua khác biệt 0/84 ở đầu. */
export const cuoi9 = (sdt) => String(sdt ?? '').replace(/\D/g, '').slice(-9);

/**
 * Khóa so khớp tên phòng: "Phòng Kinh Doanh 5", "KD05", "PKD5", "kinh doanh 05"
 * đều về "kd5"; "Phòng Back-Office" / "back office" về "backoffice".
 * Không khớp mẫu nào thì so nguyên chuỗi đã bỏ dấu.
 */
export function khoaPhong(ten) {
  const t = boDau(ten).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const m = t.match(/(?:^|[^a-z])(?:p?kd|kinh doanh)\s*0*(\d{1,3})/);
  if (m) return 'kd' + parseInt(m[1], 10);
  if (/back ?office/.test(t)) return 'backoffice';
  return t.replace(/^phong /, '').replace(/\s/g, '');
}

/** Tìm chỉ số cột theo tiêu đề, không phân biệt dấu/hoa thường. */
export function timCot(tieuDe, ...mau) {
  const ds = tieuDe.map(boDau);
  for (const m of mau) {
    const i = ds.findIndex(h => h.includes(m));
    if (i >= 0) return i;
  }
  return -1;
}
