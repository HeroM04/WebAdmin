/**
 * Dải số liệu tổng quan đầu trang.
 *
 * Một thẻ duy nhất chia ô bằng vạch mảnh, thay cho 3–4 thẻ to rời nhau với
 * chữ số 28px tô đủ màu xanh, vàng, tím, đỏ. Con số giữ màu chữ thường; ô nào
 * mang nghĩa TRẠNG THÁI (chờ, đã duyệt, từ chối) thì có chấm màu cạnh nhãn —
 * màu luôn đi kèm chữ, không đứng một mình.
 *
 * items: [{ nhan, giaTri, phu?, ton?: 'cho' | 'dat' | 'loi' | 'thongtin' | 'trung' }]
 */
export const DaiSoLieu = ({ items }) => (
  <div className="dai-so-lieu" role="list">
    {items.map((it, i) => (
      <div className="dsl-o" role="listitem" key={i}>
        <div className="dsl-nhan">
          {it.ton && <i className={`dsl-cham dsl-${it.ton}`} aria-hidden="true" />}
          {it.nhan}
        </div>
        <div className="dsl-so">{it.giaTri ?? 0}</div>
        {it.phu && <div className="dsl-phu">{it.phu}</div>}
      </div>
    ))}
  </div>
);
