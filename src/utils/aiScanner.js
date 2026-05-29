// AI Mock Scanner for Real Estate Posts

const REAL_ESTATE_KEYWORDS = [
  'căn hộ',
  'đất nền',
  'nhà phố',
  'biệt thự',
  'shophouse',
  'sổ hồng',
  'sổ đỏ',
  'chiết khấu',
  'vinhomes',
  'masterise',
  'aqua city',
  'chính chủ',
  'bàn giao',
  'vay ngân hàng',
  'thổ cư',
  'lãi suất',
  'chuyển nhượng',
  'mở bán'
];

/**
 * Scans a post caption for real estate keywords and returns a simulated AI recommendation.
 * @param {string} caption 
 * @returns {object} { hasKeywords: boolean, matchedKeywords: string[], score: number, suggestion: 'RECOMMEND'|'REVIEW', reason: string }
 */
export function scanPostContent(caption = '') {
  if (!caption) {
    return {
      hasKeywords: false,
      matchedKeywords: [],
      score: 0,
      suggestion: 'REVIEW',
      reason: 'Bài viết không chứa nội dung văn bản.'
    };
  }

  const lowercaseCaption = caption.toLowerCase();
  const matchedKeywords = REAL_ESTATE_KEYWORDS.filter(keyword => 
    lowercaseCaption.includes(keyword)
  );

  const matchedCount = matchedKeywords.length;
  // Calculate a score: 1 matched keyword = 35%, 2 = 70%, 3+ = 100%
  const score = Math.min(100, matchedCount * 35);
  const hasKeywords = matchedCount > 0;
  
  let suggestion = 'REVIEW';
  let reason = '';

  if (matchedCount >= 2) {
    suggestion = 'RECOMMEND';
    reason = `AI khuyên Duyệt: Tìm thấy ${matchedCount} từ khóa BĐS quan trọng (${matchedKeywords.map(k => `"${k}"`).join(', ')}). Bài đăng truyền thông tốt.`;
  } else if (matchedCount === 1) {
    suggestion = 'RECOMMEND';
    reason = `AI khuyên Duyệt (Xem xét thêm): Chỉ tìm thấy 1 từ khóa BĐS ("${matchedKeywords[0]}").`;
  } else {
    suggestion = 'REVIEW';
    reason = 'AI Cảnh báo: Không phát hiện từ khóa BĐS nào phù hợp với chiến dịch lan tỏa. Vui lòng tự kiểm tra thủ công.';
  }

  return {
    hasKeywords,
    matchedKeywords,
    score,
    suggestion,
    reason
  };
}
