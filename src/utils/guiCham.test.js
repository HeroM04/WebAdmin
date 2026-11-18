import { describe, it, expect } from 'vitest';
import { nhanGuiCham } from './guiCham';

describe('nhãn gửi chậm do mạng', () => {
  it('dưới 1 phút (tải ảnh) hoặc app cũ → không gắn nhãn', () => {
    expect(nhanGuiCham({ guiChamGiay: 20 })).toBeNull();
    expect(nhanGuiCham({ guiChamGiay: null })).toBeNull();
    expect(nhanGuiCham({})).toBeNull();
    expect(nhanGuiCham(null)).toBeNull();
  });
  it('vài phút', () => {
    expect(nhanGuiCham({ guiChamGiay: 180 })).toBe('Gửi chậm 3 phút');
    expect(nhanGuiCham({ guiChamGiay: 2400 })).toBe('Gửi chậm 40 phút');
  });
  it('quá một giờ', () => {
    expect(nhanGuiCham({ guiChamGiay: 3600 })).toBe('Gửi chậm 1 giờ');
    expect(nhanGuiCham({ guiChamGiay: 5400 })).toBe('Gửi chậm 1 giờ 30 phút');
  });
});
