/**
 * Thu nhỏ ảnh ngay trên trình duyệt trước khi tải lên.
 *
 * Ảnh chụp từ điện thoại thường 4000×3000, 5–15 MB. Cloudinary gói miễn phí
 * từ chối ảnh trên 10 MB, máy chủ chặn trên 15 MB — người dùng chỉ thấy "tải
 * lên thất bại". Ảnh đại diện hay ảnh minh họa chỉ cần vài trăm pixel, nên thu
 * nhỏ ở đây: nhanh hơn, không bao giờ chạm trần, và tiết kiệm dung lượng
 * Cloudinary.
 *
 * @param {File} file        ảnh gốc
 * @param {number} maxCanh   cạnh dài tối đa (px), mặc định 1024
 * @param {number} chatLuong JPEG 0–1, mặc định 0.85
 * @returns {Promise<File>}  ảnh JPEG đã thu nhỏ (giữ tên gốc, đổi đuôi .jpg)
 */
export function nenAnh(file, maxCanh = 1024, chatLuong = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Chỉ nhận file ảnh (JPG, PNG, WEBP).'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const tyLe = Math.min(1, maxCanh / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * tyLe));
      c.height = Math.max(1, Math.round(img.height * tyLe));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((blob) => {
        if (!blob) { reject(new Error('Không nén được ảnh này.')); return; }
        const ten = (file.name || 'anh').replace(/\.[^.]+$/, '') + '.jpg';
        resolve(new File([blob], ten, { type: 'image/jpeg', lastModified: Date.now() }));
      }, 'image/jpeg', chatLuong);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Chrome/Edge không đọc được HEIC của iPhone — đây là lý do hay gặp nhất
      reject(new Error('Trình duyệt không đọc được ảnh này. Ảnh HEIC từ iPhone cần đổi sang JPG (mở ảnh → Chia sẻ → Lưu dạng JPG) rồi tải lại.'));
    };
    img.src = url;
  });
}
