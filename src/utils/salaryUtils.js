// src/utils/salaryUtils.js

export const calcSalary = ({ staffType, monthType, workDays, standardDays, deals, kpiPoints }) => {
  const workRatio = standardDays > 0 ? Math.min(workDays / standardDays, 1) : 0;

  // P1: Base Salary
  const P1 = 1_000_000 * workRatio;

  // P3: Sales Commission
  let P3 = 0;
  if (deals === 1) P3 = 3_000_000;
  else if (deals === 2) P3 = 6_000_000;
  else if (deals >= 3) P3 = 9_000_000;

  // P2: KPI Salary
  let P2 = 0;
  let p2Level = 0; // 0%, 50%, 100%
  let p2Reason = '';

  if (deals >= 1) {
    // Priority: if sold >= 1 unit, P2 = 5M regardless of KPI
    P2 = 5_000_000;
    p2Level = 100;
    p2Reason = 'Ưu tiên: Đã chốt căn → P2 = 100%';
  } else {
    // No deals - calculate based on KPI
    if (staffType === 'NEW') {
      if (kpiPoints < 200) { P2 = 0; p2Level = 0; p2Reason = 'Nhân sự mới: Điểm < 200 → P2 = 0%'; }
      else if (kpiPoints < 255) { P2 = 2_500_000; p2Level = 50; p2Reason = 'Nhân sự mới: 200 ≤ Điểm < 255 → P2 = 50%'; }
      else { P2 = 5_000_000; p2Level = 100; p2Reason = 'Nhân sự mới: Điểm ≥ 255 → P2 = 100%'; }
    } else {
      if (monthType === '4WEEKS') {
        if (kpiPoints < 250) { P2 = 0; p2Level = 0; p2Reason = 'NS cũ 4 tuần: Điểm < 250 → P2 = 0%'; }
        else if (kpiPoints < 320) { P2 = 2_500_000; p2Level = 50; p2Reason = 'NS cũ 4 tuần: 250 ≤ Điểm < 320 → P2 = 50%'; }
        else { P2 = 5_000_000; p2Level = 100; p2Reason = 'NS cũ 4 tuần: Điểm ≥ 320 → P2 = 100%'; }
      } else {
        if (kpiPoints < 310) { P2 = 0; p2Level = 0; p2Reason = 'NS cũ 5 tuần: Điểm < 310 → P2 = 0%'; }
        else if (kpiPoints < 400) { P2 = 2_500_000; p2Level = 50; p2Reason = 'NS cũ 5 tuần: 310 ≤ Điểm < 400 → P2 = 50%'; }
        else { P2 = 5_000_000; p2Level = 100; p2Reason = 'NS cũ 5 tuần: Điểm ≥ 400 → P2 = 100%'; }
      }
    }
  }

  const P2Final = P2 * workRatio;
  const total = P1 + P2Final + P3;

  return { P1, P2, P2Final, P3, total, workRatio, p2Level, p2Reason };
};

export const getThresholds = (staffType, monthType) => {
  if (staffType === 'NEW') return { t1: 200, t2: 255, max: 300 };
  if (monthType === '4WEEKS') return { t1: 250, t2: 320, max: 400 };
  return { t1: 310, t2: 400, max: 500 };
};

export const formatVND = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)} Triệu`
    : n.toLocaleString('vi-VN') + ' đ';
