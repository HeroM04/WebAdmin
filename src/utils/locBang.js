/**
 * Bộ lọc dùng chung cho các bảng: tìm theo tên + khoảng ngày.
 *
 * Dùng một chỗ để mọi trang lọc giống nhau — gõ "lien" phải ra "Liên", chọn
 * 01/09–10/09 phải lấy cả ngày 10/09. Mỗi trang tự viết lại là mỗi trang một
 * kiểu, lệch nhau lúc nào không biết.
 */

/** Bỏ dấu tiếng Việt và hạ chữ thường để so sánh: "Đàm Mai Liên" → "dam mai lien". */
export const boDau = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

/**
 * Từ khóa có nằm trong một trong các trường không (không phân biệt hoa thường,
 * không phân biệt dấu). Từ khóa rỗng = khớp tất cả.
 */
export const khopTen = (tuKhoa, ...cacTruong) => {
  const k = boDau(tuKhoa);
  if (!k) return true;
  return cacTruong.some((t) => boDau(t).includes(k));
};

/**
 * Đổi giá trị RangePicker (cặp dayjs hoặc null) thành cặp chuỗi ISO yyyy-mm-dd.
 * Dùng cho onChange để state luôn là chuỗi ISO, bất kể format hiển thị là gì —
 * nhờ vậy RangePicker hiện được DD/MM/YYYY mà phần so sánh không phải đổi.
 */
export const doiKhoang = (dates) => {
  if (!dates || !dates[0] || !dates[1]) return null;
  return [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')];
};

/** Ngày theo giờ máy người dùng, dạng yyyy-mm-dd. Rỗng nếu không đọc được. */
const ngayCuaMay = (d) => {
  if (isNaN(d)) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * Giá trị ngày (ISO datetime, yyyy-mm-dd, hoặc Date) có nằm trong khoảng không.
 * Khoảng null = không lọc. So theo NGÀY, bỏ giờ — chọn tới 10/09 thì lấy cả
 * 10/09 23:59, không chỉ 10/09 00:00.
 *
 * Quy về ngày theo giờ máy người dùng chứ không cắt 10 ký tự đầu: máy chủ có
 * thể trả giờ UTC ("…T18:30:00Z" = 01:30 sáng hôm sau ở Việt Nam), cắt chuỗi
 * thì rơi nhầm sang ngày trước. Chuỗi thuần "2026-09-10" vẫn ra đúng 10/09.
 */
export const khopNgay = (khoang, giaTri) => {
  if (!khoang || !khoang[0] || !khoang[1]) return true;
  if (!giaTri) return false;
  const ngay = /^\d{4}-\d{2}-\d{2}$/.test(String(giaTri))
    ? String(giaTri)
    : ngayCuaMay(giaTri instanceof Date ? giaTri : new Date(giaTri));
  return ngay !== '' && ngay >= khoang[0] && ngay <= khoang[1];
};
