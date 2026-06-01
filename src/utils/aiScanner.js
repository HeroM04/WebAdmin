// Real AI Scanner using Google Gemini API

const GEMINI_API_KEY = 'AIzaSyA0Ooq6m9fbTfuo6Pj0pKqPYStFlVNcV7Y';

/**
 * Scans a post caption and screenshot with Google Gemini API
 * @param {string} caption 
 * @param {string} screenshotUrl 
 * @returns {Promise<object>} { score: number, suggestion: 'RECOMMEND'|'REVIEW', reason: string }
 */
export async function scanPostContent(caption = '', screenshotUrl = '') {
  try {
    if (!caption && !screenshotUrl) {
      return { score: 0, suggestion: 'REVIEW', reason: 'Không có dữ liệu bài đăng.' };
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: `Bạn là trợ lý AI kiểm duyệt bài đăng mạng xã hội của nhân viên môi giới Bất Động Sản. 
Yêu cầu: Đánh giá xem bài đăng này có đáp ứng tốt việc quảng bá dự án Bất Động Sản không (chứa thông tin bán nhà, dự án, đất nền, vị trí, giá bán, tiện ích...).
Đánh giá theo thang điểm từ 0-100.
Nếu bài đăng rất tốt, hãy Khuyên duyệt (RECOMMEND). Nếu bài đăng lạc đề (ví dụ đi chơi, ăn uống cá nhân) hoặc không có thông tin rõ ràng, hãy Cần xem xét (REVIEW).
Caption bài đăng: "${caption}"

Vui lòng trả về kết quả dưới định dạng JSON hợp lệ (chỉ trả về chuỗi JSON, không kèm markdown block):
{
  "score": <số điểm từ 0-100>,
  "suggestion": "RECOMMEND" hoặc "REVIEW",
  "reason": "<Giải thích phân tích ngắn gọn bằng tiếng Việt>"
}` }
          ]
        }
      ]
    };

    if (screenshotUrl) {
      try {
        const response = await fetch(screenshotUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.error) return reject(reader.error);
            resolve(reader.result.split(',')[1]);
          };
        });
        reader.readAsDataURL(blob);
        const base64Data = await base64Promise;

        payload.contents[0].parts.unshift({
          inline_data: {
            mime_type: blob.type || 'image/jpeg',
            data: base64Data
          }
        });
      } catch (imgError) {
        console.warn("Could not fetch image for AI, proceeding with text only", imgError);
      }
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini API returned no candidates');
    }

    let textResult = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown block if present
    textResult = textResult.trim();
    if (textResult.startsWith('```json')) {
      textResult = textResult.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (textResult.startsWith('```')) {
      textResult = textResult.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(textResult);
    return {
      score: parsed.score || 0,
      suggestion: parsed.suggestion || 'REVIEW',
      reason: parsed.reason || 'Đã phân tích nội dung thành công.'
    };
  } catch (error) {
    console.error("AI Scan Error:", error);
    return {
      score: 0,
      suggestion: 'REVIEW',
      reason: 'Đã xảy ra lỗi khi gọi AI Scanner thực tế.'
    };
  }
}
