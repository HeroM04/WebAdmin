/**
 * Phiên đăng nhập trên web: giữ token, tự gia hạn khi còn dùng, hết hạn khi bỏ lâu.
 *
 * 20/11/2026: token đăng nhập chỉ sống 1 giờ và web chưa từng dùng refresh token,
 * nên đang làm việc cứ mỗi giờ lại bị đá về trang đăng nhập (DB: phiên admin dài
 * 50–60 phút). Người dùng muốn "theo người đó còn sử dụng web không".
 *
 * Nay:
 * - Đăng nhập lưu thêm refresh token (máy chủ giữ 7 ngày, mỗi lần làm mới lại
 *   tính 7 ngày từ đầu).
 * - Gọi API bị 401 → tự xin token mới rồi gọi lại, người dùng không thấy gì.
 * - Không đụng chuột / bàn phím quá {@link NGHI_TOI_DA_MS} thì KHÔNG gia hạn nữa:
 *   lần hết hạn kế tiếp là về trang đăng nhập. Máy văn phòng bỏ quên qua đêm
 *   không còn mở sẵn trang quản trị.
 * - Bị đăng xuất từ xa (đổi mật khẩu, "đăng xuất mọi thiết bị", khóa tài khoản):
 *   máy chủ đã thu hồi refresh token → xin token mới bị từ chối → về trang đăng
 *   nhập như trước (useKiemTraPhien hỏi mỗi phút).
 */

export const KHOA_TOKEN = 'kpi_access_token';
export const KHOA_LAM_MOI = 'kpi_refresh_token';
export const KHOA_DUNG_CUOI = 'kpi_lan_dung_cuoi';

/** Bỏ web quá 8 giờ không thao tác thì phải đăng nhập lại (qua đêm, cuối tuần…). */
export const NGHI_TOI_DA_MS = 8 * 60 * 60 * 1000;

const doc = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const ghi = (k, v) => { try { localStorage.setItem(k, v); } catch { /* chế độ ẩn danh chặn bộ nhớ */ } };
const xoa = (k) => { try { localStorage.removeItem(k); } catch { /* như trên */ } };

export const layToken = () => doc(KHOA_TOKEN);
export const layRefreshToken = () => doc(KHOA_LAM_MOI);

/** Lưu token từ câu trả lời của /auth/login hoặc /auth/refresh. */
export function luuPhien({ accessToken, refreshToken }) {
  if (accessToken) ghi(KHOA_TOKEN, accessToken);
  if (refreshToken) ghi(KHOA_LAM_MOI, refreshToken);
  ghiNhanDung(true);
}

export function xoaPhien() {
  [KHOA_TOKEN, KHOA_LAM_MOI, KHOA_DUNG_CUOI, 'kpi_is_auth', 'kpi_current_user'].forEach(xoa);
}

let lanGhiDung = 0;
/** Người dùng vừa thao tác. Ghi tối đa 30 giây một lần; các tab dùng chung một mốc. */
export function ghiNhanDung(batBuoc = false, bayGio = Date.now()) {
  if (!batBuoc && bayGio - lanGhiDung < 30_000) return;
  lanGhiDung = bayGio;
  ghi(KHOA_DUNG_CUOI, String(bayGio));
}

/** Đã bỏ web quá lâu chưa. Chưa có mốc (đăng nhập trước bản này) thì coi như vừa dùng. */
export function quaLauKhongDung(bayGio = Date.now()) {
  const moc = Number(doc(KHOA_DUNG_CUOI));
  if (!moc) return false;
  return bayGio - moc > NGHI_TOI_DA_MS;
}

/**
 * Xin token mới bằng refresh token.
 *
 * @param {string} baseUrl
 * @param {string|null} tokenDaHong token vừa bị 401 — tab khác đã kịp đổi token thì dùng luôn của nó
 * @returns {Promise<{token: string} | {hetPhien: true} | {loiTam: true}>}
 *   token: gọi lại được · hetPhien: phải đăng nhập lại · loiTam: mất mạng / máy chủ lỗi, giữ phiên
 */
export function lamMoiToken(baseUrl, tokenDaHong) {
  if (dangLamMoi) return dangLamMoi;
  // Nhiều tab cùng hết hạn một lúc: khóa chung của trình duyệt để từng tab làm
  // lần lượt; tab sau thấy token đã đổi thì khỏi xin nữa (máy chủ xoay refresh
  // token, xin hai lần bằng cùng một cái thì lần sau dựa vào ân hạn 2 phút).
  const chay = () => lamMoiThat(baseUrl, tokenDaHong);
  const khoa = typeof navigator !== 'undefined' && navigator.locks?.request
    ? navigator.locks.request('kpi-lam-moi-token', chay)
    : chay();
  dangLamMoi = Promise.resolve(khoa).finally(() => { dangLamMoi = null; });
  return dangLamMoi;
}
let dangLamMoi = null;

async function lamMoiThat(baseUrl, tokenDaHong) {
  const hienTai = layToken();
  if (hienTai && tokenDaHong && hienTai !== tokenDaHong) return { token: hienTai };

  const refreshToken = layRefreshToken();
  if (!refreshToken) return { hetPhien: true };
  if (quaLauKhongDung()) return { hetPhien: true };

  let res;
  try {
    res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { loiTam: true };
  }
  // 4xx = máy chủ nói rõ phiên không còn (hết 7 ngày, bị thu hồi, tài khoản khóa)
  if (res.status >= 400 && res.status < 500) return { hetPhien: true };
  if (!res.ok) return { loiTam: true };

  const body = await res.json().catch(() => null);
  const d = body?.data || body;
  if (!d?.accessToken) return { loiTam: true };
  ghi(KHOA_TOKEN, d.accessToken);
  if (d.refreshToken) ghi(KHOA_LAM_MOI, d.refreshToken);
  return { token: d.accessToken };
}
