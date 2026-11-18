/**
 * Chạy [viec] cho từng mã trong [ids], tối đa [song] việc cùng lúc.
 *
 * Dùng cho duyệt hàng loạt: gọi lại đúng API duyệt từng mục (cộng điểm vào tuần
 * đã nộp, báo cho nhân sự) chứ không có đường duyệt riêng. Chạy song song vừa
 * phải — máy chủ gói miễn phí chỉ có 0,1 CPU, dồn cả trăm yêu cầu một lúc là
 * nghẽn. Một mục lỗi không làm dừng các mục khác.
 *
 * [khoa]: hai mục cùng khóa KHÔNG BAO GIỜ chạy cùng lúc. Duyệt là cộng điểm tuần
 * của người nộp; hai lần cộng điểm cho cùng một người chạy chen nhau thì máy chủ
 * báo trùng dòng điểm tuần, hoặc tệ hơn là lần sau ghi đè lần trước (mất điểm).
 * Thử ngày 18/11/2026 đã gặp đúng chuyện này — nên khóa theo người nộp.
 *
 * @param {Array<string|number>} ids
 * @param {(id) => Promise<any>} viec
 * @param {{ song?: number, onTienDo?: (xong: number, tong: number) => void,
 *           dung?: () => boolean, khoa?: (id) => any }} [tuyChon]
 *        dung(): trả true để dừng giữa chừng (các mục chưa chạy giữ nguyên)
 * @returns {Promise<{ duoc: Array, loi: Array<{ id, message: string }>, boQua: Array }>}
 */
export function chayLanLuot(ids, viec, { song = 3, onTienDo, dung, khoa } = {}) {
  const duoc = [];
  const loi = [];
  const cho = [...ids];
  const dangBan = new Set();
  let dangChay = 0;
  let xong = 0;

  return new Promise((resolve) => {
    let daXong = false;
    const ketThuc = () => {
      if (daXong) return;
      daXong = true;
      const daChay = new Set([...duoc, ...loi.map((l) => l.id)]);
      resolve({ duoc, loi, boQua: ids.filter((id) => !daChay.has(id)) });
    };

    const keo = () => {
      const dungLai = !!dung?.();
      while (!dungLai && dangChay < song) {
        // Mục tiếp theo mà người nộp không có mục nào đang chạy
        const i = cho.findIndex((id) => !khoa || !dangBan.has(khoa(id)));
        if (i < 0) break;
        const [id] = cho.splice(i, 1);
        const k = khoa ? khoa(id) : undefined;
        if (khoa) dangBan.add(k);
        dangChay++;
        Promise.resolve()
          .then(() => viec(id))
          .then(
            () => { duoc.push(id); },
            (e) => { loi.push({ id, message: (e && (e.message || e.error)) || String(e) || 'Lỗi không rõ' }); },
          )
          .finally(() => {
            dangChay--;
            if (khoa) dangBan.delete(k);
            xong++;
            onTienDo?.(xong, ids.length);
            keo();
          });
      }
      if (dangChay === 0 && (dungLai || cho.length === 0)) ketThuc();
    };

    keo();
  });
}
