import { useCallback, useState } from 'react';
import { Modal, Input, Radio, Typography } from 'antd';
import { CHE_DO_CHI_TINH_CONG } from '../../utils/chiTinhCong';

/**
 * Hộp "Chỉ tính công" cho một lượt vào: chọn 0 điểm hoặc tính đi muộn, ghi lý
 * do (bắt buộc — nhân sự thấy trong Lịch sử trên app). Ngày công giữ nguyên,
 * giờ chấm thật giữ nguyên. Lượt đang chờ duyệt thì bấm là duyệt luôn.
 *
 * Dùng qua {@link useHopChiTinhCong}: gọi hook một lần, đặt `hop` vào JSX, rồi
 * `hoi({ tieuDe, duyet, cheDoCu, lyDoCu, guiDi })`. `guiDi(cheDo, lyDo)` gọi
 * API; lỗi thì hộp vẫn mở và hiện lỗi dưới ô nhập.
 */
function HopChiTinhCong({ open, tieuDe, duyet, cheDoCu, lyDoCu, onOk, onCancel }) {
  const [cheDo, setCheDo] = useState(cheDoCu || 'KHONG_DIEM');
  const [lyDo, setLyDo] = useState(lyDoCu || '');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  const xacNhan = async () => {
    const s = lyDo.trim();
    if (!s) {
      setLoi('Nhập lý do để nhân sự biết vì sao không được điểm đúng giờ.');
      return;
    }
    setDangGui(true);
    try {
      await onOk(cheDo, s);
    } catch (e) {
      setLoi((typeof e === 'string' ? e : e?.message) || 'Không lưu được, thử lại.');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <Modal
      open={open}
      title={tieuDe || 'Chỉ tính công'}
      okText={duyet ? 'Duyệt chỉ tính công' : 'Lưu'}
      cancelText="Hủy"
      okButtonProps={{ loading: dangGui, style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
      onOk={xacNhan}
      onCancel={onCancel}
      destroyOnHidden
    >
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Vẫn tính ngày công và giữ giờ chấm thật, chỉ không cho điểm đúng giờ.
      </div>
      <Radio.Group value={cheDo} onChange={(e) => setCheDo(e.target.value)} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {Object.entries(CHE_DO_CHI_TINH_CONG).map(([ma, c]) => (
          <Radio key={ma} value={ma}>
            <b>{c.nhan}</b>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.moTa}</div>
          </Radio>
        ))}
      </Radio.Group>
      <Input.TextArea
        rows={3}
        maxLength={500}
        showCount
        autoFocus
        value={lyDo}
        status={loi ? 'error' : undefined}
        placeholder="Ví dụ: Chấm công ở cửa lúc 08:45, lên tới công ty đã muộn."
        onChange={(e) => { setLyDo(e.target.value); if (loi) setLoi(''); }}
      />
      {loi && <Typography.Text type="danger" style={{ display: 'block', marginTop: 6 }}>{loi}</Typography.Text>}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
        Nhân sự thấy lý do này trong Lịch sử chấm công trên app; khoản điểm hiện trong Thông báo.
      </div>
    </Modal>
  );
}

/** Trả về [hoi, hop]. Xem {@link HopChiTinhCong}. */
export function useHopChiTinhCong() {
  const [cauHinh, setCauHinh] = useState(null);
  const [lanMo, setLanMo] = useState(0);
  const hoi = useCallback((c) => { setLanMo((n) => n + 1); setCauHinh(c); }, []);
  const hop = (
    <HopChiTinhCong
      key={lanMo}
      open={!!cauHinh}
      tieuDe={cauHinh?.tieuDe}
      duyet={cauHinh?.duyet}
      cheDoCu={cauHinh?.cheDoCu}
      lyDoCu={cauHinh?.lyDoCu}
      onOk={async (cheDo, lyDo) => {
        await cauHinh.guiDi(cheDo, lyDo);
        setCauHinh(null);
      }}
      onCancel={() => setCauHinh(null)}
    />
  );
  return [hoi, hop];
}

export default HopChiTinhCong;
