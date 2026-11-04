// Tự ghép chuỗi thay vì dùng toLocaleString: bộ định dạng vi-VN trả về dạng
// "11:30 21-08", lệch với "11:30 · 21/08" mà ứng dụng đang hiển thị.
const hai = (n) => String(n).padStart(2, '0');

const docNgay = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtLuc = (iso) => {
  const d = docNgay(iso);
  return d ? `${hai(d.getHours())}:${hai(d.getMinutes())} · ${hai(d.getDate())}/${hai(d.getMonth() + 1)}` : '';
};

/**
 * Mốc hiện cạnh một khoản điểm trong nhật ký.
 *
 * Là lúc khoản đó được GHI — cùng mốc máy chủ dùng để xếp, nên đọc từ trên
 * xuống thì giờ lùi dần. Trước đây hiện lúc phát sinh: Admin thu hồi hay thêm
 * chấm công tay mang giờ của lượt chấm công cũ, nhìn như xếp lộn xộn.
 * Khoản ghi vào một ngày khác ngày nó được tính (Admin duyệt muộn, thêm tay cho
 * hôm trước) thì ghi thêm ngày được tính.
 */
export const mocKhoanDiem = ({ createdAt, occurredAt } = {}) => {
  const ghi = docNgay(createdAt);
  const phatSinh = docNgay(occurredAt);
  if (!ghi) return fmtLuc(occurredAt);
  if (!phatSinh || ghi.toDateString() === phatSinh.toDateString()) return fmtLuc(createdAt);
  return `${fmtLuc(createdAt)} · cho ngày ${hai(phatSinh.getDate())}/${hai(phatSinh.getMonth() + 1)}`;
};
