import { describe, it, expect, vi } from 'vitest';
import { taoKiemTraPhien } from './useKiemTraPhien';

const tao = (ghiDe = {}) => {
  let t = 1_000_000;
  const p = {
    hoi: vi.fn().mockResolvedValue({}),
    dangHien: () => true,
    coToken: () => true,
    bayGio: () => t,
    ...ghiDe,
  };
  return { kiemTra: taoKiemTraPhien(p), p, troi: (ms) => { t += ms; } };
};

describe('tự kiểm tra phiên đăng nhập', () => {
  it('tab đang hiện và có token → hỏi máy chủ', async () => {
    const { kiemTra, p } = tao();
    expect(await kiemTra()).toBe(true);
    expect(p.hoi).toHaveBeenCalledTimes(1);
  });

  it('tab đang ẩn → không hỏi (quay lại tab mới hỏi)', async () => {
    const { kiemTra, p } = tao({ dangHien: () => false });
    expect(await kiemTra()).toBe(false);
    expect(p.hoi).not.toHaveBeenCalled();
  });

  it('không có token → không hỏi', async () => {
    const { kiemTra, p } = tao({ coToken: () => false });
    expect(await kiemTra()).toBe(false);
    expect(p.hoi).not.toHaveBeenCalled();
  });

  it('focus và visibilitychange bắn cùng lúc → chỉ hỏi một lần; phút sau hỏi tiếp', async () => {
    const { kiemTra, p, troi } = tao();
    await kiemTra();
    troi(50);
    expect(await kiemTra()).toBe(false);
    troi(60_000);
    expect(await kiemTra()).toBe(true);
    expect(p.hoi).toHaveBeenCalledTimes(2);
  });

  it('đang chờ máy chủ trả lời thì không hỏi chồng thêm', async () => {
    let xong;
    const { kiemTra, p, troi } = tao({ hoi: vi.fn(() => new Promise((r) => { xong = r; })) });
    const lan1 = kiemTra();
    troi(60_000);
    expect(await kiemTra()).toBe(false);
    xong();
    await lan1;
    expect(p.hoi).toHaveBeenCalledTimes(1);
  });

  it('mất mạng / máy chủ lỗi → nuốt lỗi, không làm hỏng trang, lần sau vẫn hỏi', async () => {
    const { kiemTra, p, troi } = tao({ hoi: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) });
    await expect(kiemTra()).resolves.toBe(true);
    troi(60_000);
    await expect(kiemTra()).resolves.toBe(true);
    expect(p.hoi).toHaveBeenCalledTimes(2);
  });
});
