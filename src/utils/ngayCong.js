/**
 * Gộp các lượt chấm công thành từng NGÀY CÔNG (một người, một ngày) để hiện
 * thành một dòng trên bảng.
 *
 * Một ngày có thể có nhiều lượt vào/ra (đi gặp khách rồi chấm lại, bấm hai
 * lần…). Trước đây mỗi ngày chỉ giữ MỘT lượt vào và MỘT lượt ra, lượt còn lại
 * bị ghi đè và biến mất: lượt đó đang chờ duyệt thì máy chủ vẫn xếp ngày vào
 * "Chờ duyệt", còn web hiện "Đã duyệt" và không có nút nào duyệt được nó —
 * ngày công kẹt mãi ở danh sách chờ (30/09/2026).
 *
 * Nay: giữ đủ mọi lượt trong `records`; dòng hiện lượt VÀO sớm nhất và lượt RA
 * muộn nhất; trạng thái tính trên MỌI lượt, khớp cách máy chủ đếm.
 */

const VN = 'Asia/Ho_Chi_Minh';

/** Ngày theo giờ Việt Nam (YYYY-MM-DD) — máy chủ có thể trả giờ UTC. */
export const ngayVN = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-CA', { timeZone: VN });
};

const luc = (r) => new Date(r.checkinTime || 0).getTime() || 0;

/** Trạng thái của cả ngày: còn lượt chờ → chờ; có lượt bị từ chối → từ chối; còn lại đã duyệt. */
export const trangThaiNgay = (records) => {
  if (records.some((r) => r.status === 'PENDING')) return 'PENDING';
  if (records.some((r) => r.status === 'REJECTED')) return 'REJECTED';
  return 'APPROVED';
};

export const gopNgayCong = (rows) => {
  const theoNgay = {};
  for (const r of rows || []) {
    const date = ngayVN(r.checkinTime);
    const key = `${r.userId}_${date}`;
    (theoNgay[key] ||= { id: key, userId: r.userId, date, records: [] }).records.push(r);
  }

  return Object.values(theoNgay).map((n) => {
    const records = [...n.records].sort((a, b) => luc(a) - luc(b));
    const vao = records.filter((r) => r.actionType !== 'CHECK_OUT');
    const ra = records.filter((r) => r.actionType === 'CHECK_OUT');
    const checkinRecord = vao[0] || null;                 // vào sớm nhất
    const checkoutRecord = ra[ra.length - 1] || null;     // ra muộn nhất
    const khac = records.filter((r) => r !== checkinRecord && r !== checkoutRecord);
    const status = trangThaiNgay(records);
    // Ghi chú: ưu tiên lượt đang chờ (đó là thứ người duyệt cần đọc), rồi lượt mới nhất có ghi chú
    const coGhiChu = records.filter((r) => r.note && String(r.note).trim());
    const ghiChu = coGhiChu.find((r) => r.status === 'PENDING') || coGhiChu[coGhiChu.length - 1];
    return {
      ...n,
      records,
      checkinRecord,
      checkoutRecord,
      khac,
      soChoKhac: khac.filter((r) => r.status === 'PENDING').length,
      status,
      note: ghiChu ? ghiChu.note : '',
      approvedBy: (checkinRecord || checkoutRecord || {}).approvedBy,
    };
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
};
