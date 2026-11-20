import { useEffect } from 'react';
import { apiClient } from './apiClient';

/**
 * Web tự hỏi máy chủ xem phiên đăng nhập còn dùng được không.
 *
 * 20/11/2026: đổi mật khẩu admin xong, máy chủ đã chặn token của máy kia ngay
 * (xem PhienDangNhapService.dangXuatMoiThietBi), nhưng trang trên máy đó vẫn hiện
 * dữ liệu đã tải và vẫn chuyển qua lại các mục được — web chỉ biết mình bị đăng
 * xuất khi gọi máy chủ, mà xem dữ liệu đã tải thì không gọi. Trông như "không bị
 * đăng xuất".
 *
 * Nay: tab đang hiện thì cứ mỗi phút hỏi một lần, và hỏi ngay khi người dùng quay
 * lại tab. Máy chủ trả 401 thì apiClient xóa token và đưa về trang đăng nhập như
 * mọi lần hết phiên khác. Tab ẩn thì không hỏi (khỏi tốn yêu cầu), quay lại là hỏi.
 */

/** Mỗi phút một lần — trùng nhịp máy chủ ghi "hoạt động cuối" của phiên, không tốn thêm lệnh ghi DB. */
export const NHIP_KIEM_TRA_MS = 60_000;

/** Bấm vào tab bắn cả "focus" lẫn "visibilitychange" — gộp thành một lần hỏi. */
const CACH_TOI_THIEU_MS = 10_000;

/**
 * Tạo hàm kiểm tra phiên. Tách khỏi hook để test được không cần trình duyệt.
 *
 * @param {object} p
 * @param {() => Promise} p.hoi       gọi một API cần đăng nhập
 * @param {() => boolean} p.dangHien  tab có đang hiện trên màn hình không
 * @param {() => boolean} p.coToken   có token để hỏi không
 * @param {() => number}  [p.bayGio]
 * @returns {() => Promise<boolean>}  true nếu lần này có hỏi máy chủ
 */
export function taoKiemTraPhien({ hoi, dangHien, coToken, bayGio = () => Date.now() }) {
  let lanCuoi = -Infinity;
  let dangHoi = false;

  return async function kiemTra() {
    if (dangHoi || !dangHien() || !coToken()) return false;
    const t = bayGio();
    if (t - lanCuoi < CACH_TOI_THIEU_MS) return false;
    lanCuoi = t;
    dangHoi = true;
    try {
      await hoi();
    } catch {
      // 401: apiClient đã đưa về trang đăng nhập.
      // Mất mạng / máy chủ khởi động lại: không đăng xuất ai cả, phút sau hỏi lại.
    } finally {
      dangHoi = false;
    }
    return true;
  };
}

/** Bật khi đã đăng nhập; tắt (gỡ hẹn giờ, gỡ lắng nghe) khi đăng xuất. */
export function useKiemTraPhien(batDau) {
  useEffect(() => {
    if (!batDau) return undefined;

    const kiemTra = taoKiemTraPhien({
      hoi: () => apiClient.get('/auth/me'),
      dangHien: () => document.visibilityState === 'visible',
      coToken: () => !!localStorage.getItem('kpi_access_token'),
    });

    const id = setInterval(kiemTra, NHIP_KIEM_TRA_MS);
    document.addEventListener('visibilitychange', kiemTra);
    window.addEventListener('focus', kiemTra);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', kiemTra);
      window.removeEventListener('focus', kiemTra);
    };
  }, [batDau]);
}
