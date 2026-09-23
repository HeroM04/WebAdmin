/**
 * Ai thuộc diện chấm KPI.
 *
 * Bảng tiêu chí 30/40/30 là của khối kinh doanh. Văn phòng (Back-Office) và
 * Admin vẫn chấm công, vẫn bị ghi vắng mặt để tính công — nhưng KHÔNG có điểm
 * KPI. Máy chủ đã chặn ở khâu cộng điểm, nhưng các màn hình KPI lại tự dựng
 * danh sách từ toàn bộ nhân sự, nên họ vẫn hiện ra với 0đ: xếp chót bảng vinh
 * danh và kéo tụt điểm trung bình của phòng, dù không hề bị chấm.
 *
 * Giữ một chỗ duy nhất để lọc, đúng bằng quy tắc `duocChamKpi` bên máy chủ
 * (KpiCalculationService). Sửa quy tắc thì phải sửa cả hai nơi.
 */
export const duocChamKpi = (u) => u?.role === 'SALE' || u?.role === 'TRUONG_PHONG';

/** Lọc nhanh một danh sách nhân sự xuống còn người thuộc diện chấm KPI. */
export const locNguoiChamKpi = (ds) => (ds || []).filter(duocChamKpi);
