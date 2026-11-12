/**
 * "Chỉ tính công": Admin giữ ngày công nhưng không cho điểm đúng giờ của lượt
 * vào — ví dụ người làm KPI chấm công ở cửa lúc 08:45, lên tới nơi đã muộn.
 * Máy chủ: PUT /attendance/{id}/chi-tinh-cong?cheDo=KHONG_DIEM|DI_MUON|BO&lyDo=...
 */
import { ngayVN } from './ngayCong';

export const CHE_DO_CHI_TINH_CONG = {
  KHONG_DIEM: { nhan: '0 điểm', moTa: 'Không cộng điểm đúng giờ, không trừ đi muộn.' },
  DI_MUON: { nhan: 'Tính đi muộn (−5)', moTa: 'Trừ như đi muộn, bảng công ghi M.' },
};

/** Vai trò có điểm KPI — văn phòng, Admin chỉ tính công nên không cần nút này. */
export const laNguoiLamKpi = (user) => user?.role === 'SALE' || user?.role === 'TRUONG_PHONG';

/** Thứ Bảy theo giờ Việt Nam — ngày này không có điểm đúng giờ / đi muộn. */
const laThuBay = (iso) => {
  const ngay = ngayVN(iso);
  return !!ngay && new Date(`${ngay}T12:00:00Z`).getUTCDay() === 6;
};

/**
 * Hiện nút "Chỉ tính công" cho lượt này không: lượt VÀO chưa bị từ chối, của
 * người làm KPI, không phải thứ Bảy. Máy chủ vẫn kiểm lại (lượt vào đầu ngày…).
 */
export const coTheChiTinhCong = (user, luot) =>
  !!luot && laNguoiLamKpi(user)
  && luot.actionType !== 'CHECK_OUT'
  && luot.status !== 'REJECTED'
  && !laThuBay(luot.checkinTime);

/** Nhãn ngắn của chế độ đang đặt, ví dụ "Chỉ tính công · 0 điểm". */
export const nhanChiTinhCong = (luot) =>
  luot?.chiTinhCong && CHE_DO_CHI_TINH_CONG[luot.chiTinhCong]
    ? `Chỉ tính công · ${CHE_DO_CHI_TINH_CONG[luot.chiTinhCong].nhan}`
    : null;

/** Đường gọi máy chủ; cheDo null = bỏ chỉ tính công. */
export const duongChiTinhCong = (id, cheDo, lyDo) => {
  const q = new URLSearchParams({ cheDo: cheDo || 'BO' });
  if (lyDo) q.set('lyDo', lyDo);
  return `/attendance/${id}/chi-tinh-cong?${q.toString()}`;
};
