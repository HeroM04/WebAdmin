// Chuẩn hóa URL ảnh để hiển thị được trong <img>.
// Đặc biệt: link chia sẻ Google Drive (/file/d/ID/view, open?id=ID, uc?id=ID) KHÔNG hiển thị trực tiếp
// trong thẻ <img> -> đổi sang dạng thumbnail trực tiếp.

export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const u = url.trim();
  let id = null;
  let m = u.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) id = m[1];
  if (!id) { m = u.match(/[?&]id=([a-zA-Z0-9_-]{10,})/); if (m) id = m[1]; }
  if (!id) { m = u.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/); if (m) id = m[1]; }
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
  return u;
};

// Chuyển toàn bộ link Drive trong chuỗi HTML (vd nội dung tin tức) sang link ảnh hiển thị được.
export const resolveHtmlImages = (html) => {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/<img([^>]*?)src=["']([^"']+)["']/gi, (full, pre, src) => {
    const fixed = resolveImageUrl(src);
    return `<img${pre}src="${fixed}"`;
  });
};

// Xây URL nhúng Google Maps (iframe) không cần API key, từ embed-url / lat,lng / địa chỉ.
export const buildMapEmbed = ({ mapEmbedUrl, latitude, longitude, address } = {}) => {
  if (mapEmbedUrl) {
    let m = mapEmbedUrl;
    if (m.includes('<iframe')) {
      const match = m.match(/src=["']([^"']+)["']/i);
      if (match) m = match[1];
    }
    m = m.replace(/&amp;/g, '&').trim();
    // Chỉ iframe được khi là URL embed thật (maps/embed?pb=... hoặc output=embed)
    if (m.includes('/maps/embed') || m.includes('output=embed')) return m;
  }
  if (latitude && longitude) {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=vi&z=15&output=embed`;
  }
  if (address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=vi&z=15&output=embed`;
  }
  return null;
};
