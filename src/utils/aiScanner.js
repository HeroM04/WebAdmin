// AI Scanner — chấm điểm bài đăng truyền thông BĐS.
//
// Web KHÔNG gọi thẳng Google nữa. Mọi lời gọi đi qua backend
// (POST /api/v1/ai/scan-post), nơi giữ API key Gemini.
//
// Vì sao: key để ở frontend thì Vite nướng thẳng vào file JS khi build —
// ai mở DevTools cũng lấy được. Trước đây key bị lộ lên GitHub và Google
// đã đình chỉ cả project. Giờ key nằm trên server, trình duyệt không thấy.

import { apiClient } from './apiClient';

/**
 * Nhờ backend chấm điểm một bài đăng bằng AI.
 * @param {string} caption       Nội dung bài đăng
 * @param {string} screenshotUrl Link ảnh chụp màn hình (tùy chọn)
 * @returns {Promise<{score:number, suggestion:'RECOMMEND'|'REVIEW', reason:string}>}
 */
export async function scanPostContent(caption = '', screenshotUrl = '') {
  if (!caption && !screenshotUrl) {
    return { score: 0, suggestion: 'REVIEW', reason: 'Không có dữ liệu bài đăng.' };
  }

  try {
    // apiClient tự gắn token và bóc sẵn phần `data` khi status = SUCCESS
    const data = await apiClient.post('/ai/scan-post', { caption, screenshotUrl });

    return {
      score: data?.score ?? 0,
      suggestion: data?.suggestion === 'RECOMMEND' ? 'RECOMMEND' : 'REVIEW',
      reason: data?.reason || 'Đã phân tích nội dung thành công.'
    };
  } catch (error) {
    console.error('AI Scan Error:', error);
    // Lỗi có thể là chuỗi, hoặc object { status, message } do backend trả về
    const msg =
      (typeof error === 'string' && error) ||
      error?.message ||
      'không kết nối được máy chủ';
    return {
      score: 0,
      suggestion: 'REVIEW',
      reason: `Không gọi được AI Scanner: ${msg}.`
    };
  }
}
