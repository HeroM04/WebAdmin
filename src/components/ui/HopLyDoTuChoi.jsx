import React, { useCallback, useState } from 'react';
import { Modal, Input, Typography } from 'antd';

/**
 * Hộp nhập lý do khi Admin bấm Từ chối một yêu cầu (chấm công, xin vắng, thực
 * chiến, bài đăng, đào tạo 1-1, chốt căn, gieo hạt, xin không tham gia đào tạo).
 *
 * Bắt buộc ghi lý do: nhân sự lọc "Bị từ chối" trong Lịch sử trên app và bấm
 * vào là thấy đúng câu này. Máy chủ cũng chặn từ chối không có lý do.
 *
 * Dùng qua {@link useHopLyDoTuChoi}: một trang gọi hook một lần, đặt `hop`
 * vào JSX, rồi `hoiLyDo({ tieuDe, moTa, guiDi })` ở nút Từ chối. `guiDi(lyDo)`
 * gọi API; lỗi thì hộp vẫn mở và hiện lỗi ngay dưới ô nhập.
 */
function HopLyDoTuChoi({ open, tieuDe, moTa, lyDoCu, onOk, onCancel }) {
  // Mỗi lần mở là một lần dựng mới (key ở useHopLyDoTuChoi) nên giá trị đầu lấy thẳng từ lyDoCu
  const [lyDo, setLyDo] = useState(lyDoCu || '');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  const xacNhan = async () => {
    const s = lyDo.trim();
    if (!s) {
      setLoi('Nhập lý do để nhân sự biết vì sao bị từ chối.');
      return;
    }
    setDangGui(true);
    try {
      await onOk(s);
    } catch (e) {
      setLoi((typeof e === 'string' ? e : e?.message) || 'Không từ chối được, thử lại.');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <Modal
      open={open}
      title={tieuDe || 'Từ chối yêu cầu'}
      okText="Từ chối"
      cancelText="Hủy"
      okButtonProps={{ danger: true, loading: dangGui }}
      onOk={xacNhan}
      onCancel={onCancel}
      destroyOnHidden
    >
      {moTa && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{moTa}</div>}
      <Input.TextArea
        rows={3}
        maxLength={500}
        showCount
        autoFocus
        value={lyDo}
        status={loi ? 'error' : undefined}
        placeholder="Ví dụ: Ảnh chụp không thấy tên dự án — chụp lại rồi gửi lại."
        onChange={(e) => { setLyDo(e.target.value); if (loi) setLoi(''); }}
      />
      {loi && <Typography.Text type="danger" style={{ display: 'block', marginTop: 6 }}>{loi}</Typography.Text>}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
        Nhân sự sẽ thấy lý do này trong mục Lịch sử trên app.
      </div>
    </Modal>
  );
}

/** Trả về [hoiLyDo, hop]. Xem {@link HopLyDoTuChoi}. */
export function useHopLyDoTuChoi() {
  const [cauHinh, setCauHinh] = useState(null);
  const [lanMo, setLanMo] = useState(0);
  const hoiLyDo = useCallback((c) => { setLanMo((n) => n + 1); setCauHinh(c); }, []);
  const hop = (
    <HopLyDoTuChoi
      key={lanMo}
      open={!!cauHinh}
      tieuDe={cauHinh?.tieuDe}
      moTa={cauHinh?.moTa}
      lyDoCu={cauHinh?.lyDoCu}
      onOk={async (lyDo) => {
        await cauHinh.guiDi(lyDo);
        setCauHinh(null);
      }}
      onCancel={() => setCauHinh(null)}
    />
  );
  return [hoiLyDo, hop];
}

/** Dòng "Lý do từ chối" hiện trong khung chi tiết của Admin. */
export function DongLyDoTuChoi({ lyDo }) {
  if (!lyDo) return null;
  return (
    <div className="premium-card" style={{ padding: 14, background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger-color)', marginBottom: 6 }}>LÝ DO TỪ CHỐI</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{lyDo}</div>
    </div>
  );
}

export default HopLyDoTuChoi;
