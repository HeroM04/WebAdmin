import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  KHOA_DUNG_CUOI, KHOA_LAM_MOI, KHOA_TOKEN, NGHI_TOI_DA_MS,
  lamMoiToken, luuPhien, quaLauKhongDung, xoaPhien,
} from './phienDangNhap';
import { fetchCoToken } from './apiClient';

const kho = new Map();
globalThis.localStorage = {
  getItem: (k) => (kho.has(k) ? kho.get(k) : null),
  setItem: (k, v) => kho.set(k, String(v)),
  removeItem: (k) => kho.delete(k),
};

const traLoi = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const BASE = 'http://may-chu/api/v1';

beforeEach(() => {
  kho.clear();
  globalThis.fetch = vi.fn();
  luuPhien({ accessToken: 'cu', refreshToken: 'lm-cu' });
});

describe('còn dùng web không', () => {
  it('chưa có mốc (đăng nhập trước bản này) → coi như vừa dùng', () => {
    kho.delete(KHOA_DUNG_CUOI);
    expect(quaLauKhongDung()).toBe(false);
  });

  it('thao tác 1 giờ trước → còn dùng; quá 8 giờ → bỏ lâu', () => {
    const bayGio = Date.now();
    kho.set(KHOA_DUNG_CUOI, String(bayGio - 60 * 60 * 1000));
    expect(quaLauKhongDung(bayGio)).toBe(false);
    kho.set(KHOA_DUNG_CUOI, String(bayGio - NGHI_TOI_DA_MS - 1000));
    expect(quaLauKhongDung(bayGio)).toBe(true);
  });
});

describe('tự gia hạn token', () => {
  it('máy chủ cấp token mới → lưu cả hai token', async () => {
    fetch.mockResolvedValue(traLoi(200, { status: 'SUCCESS', data: { accessToken: 'moi', refreshToken: 'lm-moi' } }));
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ token: 'moi' });
    expect(fetch).toHaveBeenCalledWith(`${BASE}/auth/refresh`, expect.objectContaining({ body: JSON.stringify({ refreshToken: 'lm-cu' }) }));
    expect(kho.get(KHOA_TOKEN)).toBe('moi');
    expect(kho.get(KHOA_LAM_MOI)).toBe('lm-moi');
  });

  it('máy chủ từ chối (bị đăng xuất từ xa, hết 7 ngày) → hết phiên', async () => {
    fetch.mockResolvedValue(traLoi(400, { message: 'Refresh token đã hết hạn hoặc bị thu hồi' }));
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ hetPhien: true });
  });

  it('mất mạng hoặc máy chủ đang khởi động (5xx) → lỗi tạm, không đăng xuất', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ loiTam: true });
    fetch.mockResolvedValueOnce(traLoi(503, null));
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ loiTam: true });
    expect(kho.get(KHOA_LAM_MOI)).toBe('lm-cu');
  });

  it('bỏ web quá 8 giờ → không gia hạn, không cả hỏi máy chủ', async () => {
    kho.set(KHOA_DUNG_CUOI, String(Date.now() - NGHI_TOI_DA_MS - 1000));
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ hetPhien: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('tab khác vừa đổi token → dùng luôn, không xin lần nữa', async () => {
    kho.set(KHOA_TOKEN, 'tab-khac-vua-lay');
    expect(await lamMoiToken(BASE, 'cu')).toEqual({ token: 'tab-khac-vua-lay' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('nhiều yêu cầu cùng hết hạn → chỉ xin token một lần', async () => {
    fetch.mockResolvedValue(traLoi(200, { status: 'SUCCESS', data: { accessToken: 'moi', refreshToken: 'lm-moi' } }));
    const kq = await Promise.all([lamMoiToken(BASE, 'cu'), lamMoiToken(BASE, 'cu'), lamMoiToken(BASE, 'cu')]);
    expect(kq.map((k) => k.token)).toEqual(['moi', 'moi', 'moi']);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('đăng xuất xóa hết token và mốc', () => {
    xoaPhien();
    expect(kho.get(KHOA_TOKEN)).toBeUndefined();
    expect(kho.get(KHOA_LAM_MOI)).toBeUndefined();
    expect(kho.get(KHOA_DUNG_CUOI)).toBeUndefined();
  });
});

describe('gọi API khi token hết hạn', () => {
  const tokenGui = (lan) => new Headers(fetch.mock.calls[lan][1].headers).get('Authorization');

  it('401 → gia hạn → gọi lại bằng token mới, người dùng không thấy gì', async () => {
    fetch
      .mockResolvedValueOnce(traLoi(401, null))
      .mockResolvedValueOnce(traLoi(200, { status: 'SUCCESS', data: { accessToken: 'moi', refreshToken: 'lm-moi' } }))
      .mockResolvedValueOnce(traLoi(200, { status: 'SUCCESS', data: [1, 2] }));
    const res = await fetchCoToken('http://may-chu/api/v1/users', { method: 'GET' });
    expect(res.status).toBe(200);
    expect(tokenGui(0)).toBe('Bearer cu');
    expect(tokenGui(2)).toBe('Bearer moi');
  });

  it('gia hạn bị từ chối → trả nguyên 401 để về trang đăng nhập', async () => {
    fetch.mockResolvedValueOnce(traLoi(401, null)).mockResolvedValueOnce(traLoi(400, {}));
    const res = await fetchCoToken('http://may-chu/api/v1/users');
    expect(res.status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('mất mạng lúc gia hạn → báo lỗi, không đăng xuất', async () => {
    fetch.mockResolvedValueOnce(traLoi(401, null)).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(fetchCoToken('http://may-chu/api/v1/users')).rejects.toThrow(/Mất kết nối/);
    expect(kho.get(KHOA_LAM_MOI)).toBe('lm-cu');
  });

  it('không có token → không thử gia hạn', async () => {
    kho.delete(KHOA_TOKEN);
    fetch.mockResolvedValueOnce(traLoi(401, null));
    const res = await fetchCoToken('http://may-chu/api/v1/auth/login', { method: 'POST' });
    expect(res.status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
