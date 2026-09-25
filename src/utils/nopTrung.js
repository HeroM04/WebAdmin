/**
 * Báo cáo nộp trùng: cùng người, cùng nội dung (bỏ khác biệt hoa thường, dấu
 * cách thừa), nộp cách nhau không quá [khoangCach] — thường do bấm Gửi hai lần
 * hoặc mạng chậm tưởng chưa gửi.
 *
 * Trả về tập id của MỌI báo cáo trong nhóm trùng (không chỉ cái sau), để Admin
 * tự chọn giữ cái nào — có khi cái đã duyệt lại là cái nộp sau.
 */
export function timNopTrung(danhSach, khoangCach = 30 * 60 * 1000) {
  const chuan = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const nhom = new Map();
  (danhSach || []).forEach(o => {
    const k = o.userId + '|' + chuan(o.content);
    if (!nhom.has(k)) nhom.set(k, []);
    nhom.get(k).push(o);
  });
  const trung = new Set();
  nhom.forEach(ds => {
    const theoGio = [...ds].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    for (let i = 1; i < theoGio.length; i++) {
      if (new Date(theoGio[i].submittedAt) - new Date(theoGio[i - 1].submittedAt) <= khoangCach) {
        trung.add(theoGio[i].id);
        trung.add(theoGio[i - 1].id);
      }
    }
  });
  return trung;
}
