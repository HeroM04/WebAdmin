import { describe, it, expect } from 'vitest';
import { chayLanLuot } from './duyetHangLoat';

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

describe('duyệt hàng loạt — chạy lần lượt từng mục', () => {
  it('chạy hết mọi mục, báo tiến độ tới đủ tổng', async () => {
    const daChay = [];
    const tienDo = [];
    const kq = await chayLanLuot([1, 2, 3, 4, 5], async (id) => { await cho(2); daChay.push(id); },
      { song: 2, onTienDo: (x, t) => tienDo.push(`${x}/${t}`) });
    expect(kq.duoc.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(kq.loi).toEqual([]);
    expect(tienDo.at(-1)).toBe('5/5');
  });

  it('không chạy quá số việc song song cho phép', async () => {
    let dangChay = 0;
    let caoNhat = 0;
    await chayLanLuot([...Array(12).keys()], async () => {
      dangChay++;
      caoNhat = Math.max(caoNhat, dangChay);
      await cho(3);
      dangChay--;
    }, { song: 3 });
    expect(caoNhat).toBe(3);
  });

  it('một mục lỗi không làm dừng các mục khác, giữ lời lỗi của máy chủ', async () => {
    const kq = await chayLanLuot([1, 2, 3], async (id) => {
      if (id === 2) throw { status: 'ERROR', message: 'Bài đăng đã được duyệt trước đó' };
    });
    expect(kq.duoc.sort()).toEqual([1, 3]);
    expect(kq.loi).toEqual([{ id: 2, message: 'Bài đăng đã được duyệt trước đó' }]);
  });

  it('bấm dừng giữa chừng → các mục chưa chạy để nguyên', async () => {
    let dung = false;
    const kq = await chayLanLuot([1, 2, 3, 4, 5, 6], async (id) => {
      await cho(2);
      if (id === 2) dung = true;
    }, { song: 1, dung: () => dung });
    expect(kq.duoc).toEqual([1, 2]);
    expect(kq.boQua).toEqual([3, 4, 5, 6]);
  });

  it('hai mục của cùng một người không bao giờ chạy cùng lúc (cộng điểm chen nhau là mất điểm)', async () => {
    // 6 mục của 2 người, cho chạy tối đa 3 việc một lúc
    const nguoi = { 1: 'An', 2: 'An', 3: 'An', 4: 'Bình', 5: 'Bình', 6: 'Bình' };
    const dangChay = new Set();
    let chenNhau = false;
    let caoNhat = 0;
    const kq = await chayLanLuot([1, 2, 3, 4, 5, 6], async (id) => {
      if (dangChay.has(nguoi[id])) chenNhau = true;
      dangChay.add(nguoi[id]);
      caoNhat = Math.max(caoNhat, dangChay.size);
      await cho(3);
      dangChay.delete(nguoi[id]);
    }, { song: 3, khoa: (id) => nguoi[id] });
    expect(chenNhau).toBe(false);
    expect(caoNhat).toBe(2);   // vẫn song song giữa hai người khác nhau
    expect(kq.duoc.sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('danh sách rỗng → không gọi gì', async () => {
    const kq = await chayLanLuot([], async () => { throw new Error('không được gọi'); });
    expect(kq).toEqual({ duoc: [], loi: [], boQua: [] });
  });
});
