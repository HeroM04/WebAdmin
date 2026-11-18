import { useMemo, useRef, useState } from 'react';
import { Button, Modal, Progress, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { chayLanLuot } from '../../utils/duyetHangLoat';

/**
 * Tick chọn nhiều mục đang chờ duyệt rồi duyệt một lần.
 *
 * 18/11/2026 đang tồn ~1.200 bài đăng, thực chiến, đào tạo 1-1 chờ duyệt (phần
 * lớn quá 7 ngày) vì mỗi mục phải bấm duyệt riêng. Điểm chỉ cộng khi duyệt nên
 * nhân sự thấy KPI thấp hơn thực tế.
 *
 * Duyệt hàng loạt gọi lại đúng API duyệt từng mục — cộng điểm vào đúng tuần đã
 * nộp, báo cho nhân sự, y như bấm duyệt tay — vài mục một lúc, có tiến độ, dừng
 * được, xong mới tải lại danh sách một lần.
 *
 * @param {object} p
 * @param {Array}  p.rows          các dòng đang hiện (đã qua bộ lọc)
 * @param {string} p.tenMuc        "bài đăng", "báo cáo thực chiến"...
 * @param {(id) => Promise} p.duyetMot   gọi API duyệt một mục
 * @param {() => Promise}   p.taiLai     tải lại danh sách + KPI khi xong
 * @param {(row) => string|null} [p.lyDoKhongChon]  có lý do thì không cho tick (vd. nộp trùng)
 * @returns {{ rowSelection: object, thanh: React.ReactNode, dangChay: boolean }}
 */
export function useDuyetHangLoat({ rows, tenMuc, duyetMot, taiLai, lyDoKhongChon }) {
  const [daChon, setChon] = useState([]);
  const [chay, setChay] = useState(null); // { xong, tong } khi đang duyệt
  const dungRef = useRef(false);

  const choDuyet = rows.filter((r) => r.status === 'PENDING');
  const duocChon = choDuyet.filter((r) => !lyDoKhongChon?.(r));
  const soKhongChon = choDuyet.length - duocChon.length;
  // Chỉ dựng lại tập mã khi danh sách mục chọn được thật sự đổi (bảng lọc lại mỗi lần vẽ)
  const khoaDuocChon = duocChon.map((r) => r.id).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const idDuocChon = useMemo(() => new Set(duocChon.map((r) => r.id)), [khoaDuocChon]);

  // Đổi bộ lọc / vừa duyệt xong: chỉ tính những mục còn chọn được
  const chon = daChon.filter((id) => idDuocChon.has(id));

  const rowSelection = {
    selectedRowKeys: chon,
    onChange: (keys) => setChon(keys.filter((id) => idDuocChon.has(id))),
    getCheckboxProps: (r) => ({
      disabled: !!chay || !idDuocChon.has(r.id),
      title: r.status !== 'PENDING' ? 'Đã xử lý' : (lyDoKhongChon?.(r) || undefined),
    }),
    columnWidth: 40,
  };

  const chayDuyet = async (ids) => {
    dungRef.current = false;
    setChay({ xong: 0, tong: ids.length });
    // Mỗi người nộp chỉ một mục đang duyệt tại một lúc — xem chayLanLuot
    const nguoiNop = new Map(rows.map((r) => [r.id, r.userId ?? r.user?.id ?? r.id]));
    const kq = await chayLanLuot(ids, duyetMot, {
      song: 3,
      khoa: (id) => nguoiNop.get(id) ?? id,
      onTienDo: (xong, tong) => setChay({ xong, tong }),
      dung: () => dungRef.current,
    });
    try { await taiLai(); } catch { /* danh sách tự tải lại lần sau */ }
    setChay(null);
    setChon((c) => c.filter((id) => !kq.duoc.includes(id)));

    if (kq.loi.length === 0 && kq.boQua.length === 0) {
      message.success(`Đã duyệt ${kq.duoc.length} ${tenMuc}. Điểm đã cộng vào đúng tuần nộp.`);
      return;
    }
    Modal.warning({
      title: `Đã duyệt ${kq.duoc.length}/${ids.length} ${tenMuc}`,
      width: 520,
      content: (
        <div style={{ lineHeight: 1.6 }}>
          {kq.boQua.length > 0 && <p>Đã dừng: <b>{kq.boQua.length}</b> mục chưa duyệt, vẫn đang được chọn.</p>}
          {kq.loi.length > 0 && (
            <>
              <p><b>{kq.loi.length}</b> mục không duyệt được (vẫn ở Chờ duyệt):</p>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {kq.loi.slice(0, 8).map((l) => <li key={l.id}>#{l.id}: {l.message}</li>)}
                {kq.loi.length > 8 && <li>… và {kq.loi.length - 8} mục khác</li>}
              </ul>
            </>
          )}
        </div>
      ),
    });
  };

  const batDau = () => {
    const ids = chon.filter((id) => idDuocChon.has(id));
    if (!ids.length) return;
    Modal.confirm({
      title: `Duyệt ${ids.length} ${tenMuc}?`,
      width: 480,
      content: 'Mỗi mục được cộng điểm vào đúng tuần đã nộp và nhân sự nhận thông báo, như khi duyệt từng mục. '
        + 'Đang chạy vẫn bấm Dừng được.',
      okText: `Duyệt ${ids.length} mục`,
      cancelText: 'Xem lại',
      onOk: () => { chayDuyet(ids); },
    });
  };

  const thanh = (choDuyet.length === 0 && !chay) ? null : (
    <div className="no-row-click" style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 20px',
      borderBottom: '1px solid var(--border-color)', background: chon.length || chay ? 'rgba(15, 44, 89, 0.04)' : 'transparent',
    }}>
      {chay ? (
        <>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Đang duyệt {chay.xong}/{chay.tong}…</span>
          <Progress percent={Math.round((chay.xong * 100) / Math.max(chay.tong, 1))} size="small" style={{ width: 220, margin: 0 }} />
          <Button size="small" onClick={() => { dungRef.current = true; }}>Dừng</Button>
        </>
      ) : (
        <>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {chon.length
              ? <>Đã chọn <b style={{ color: 'var(--text-primary)' }}>{chon.length}</b> mục</>
              : 'Tick ô đầu dòng để chọn nhiều mục chờ duyệt'}
            {soKhongChon > 0 && ` · ${soKhongChon} mục nộp trùng không chọn được, xử lý riêng`}
          </span>
          {chon.length < duocChon.length && (
            <Button size="small" onClick={() => setChon(duocChon.map((r) => r.id))}>
              Chọn cả {duocChon.length} mục chờ duyệt đang lọc
            </Button>
          )}
          {chon.length > 0 && <Button size="small" onClick={() => setChon([])}>Bỏ chọn</Button>}
          <Button type="primary" size="small" icon={<CheckCircleOutlined />} disabled={!chon.length} onClick={batDau}
            style={chon.length ? { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : undefined}>
            Duyệt {chon.length || ''} mục đã chọn
          </Button>
        </>
      )}
    </div>
  );

  return { rowSelection, thanh, dangChay: !!chay };
}
