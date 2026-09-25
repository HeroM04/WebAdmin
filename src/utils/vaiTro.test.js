import { describe, it, expect } from 'vitest';
import { duocChamKpi, locNguoiChamKpi } from './vaiTro';

// Phải khớp quy tắc duocChamKpi bên máy chủ (KpiCalculationService)
describe('ai thuộc diện chấm KPI', () => {
  it('chỉ Sale và Trưởng phòng', () => {
    expect(duocChamKpi({ role: 'SALE' })).toBe(true);
    expect(duocChamKpi({ role: 'TRUONG_PHONG' })).toBe(true);
    expect(duocChamKpi({ role: 'VAN_PHONG' })).toBe(false);
    expect(duocChamKpi({ role: 'ADMIN' })).toBe(false);
    expect(duocChamKpi(null)).toBe(false);
  });

  it('Back-Office bị loại khỏi danh sách KPI (bảng vinh danh, chấm KPI, dashboard)', () => {
    const ds = [
      { id: 1, role: 'SALE' }, { id: 2, role: 'VAN_PHONG' },
      { id: 3, role: 'TRUONG_PHONG' }, { id: 4, role: 'ADMIN' },
    ];
    expect(locNguoiChamKpi(ds).map(u => u.id)).toEqual([1, 3]);
    expect(locNguoiChamKpi(undefined)).toEqual([]);
  });
});
