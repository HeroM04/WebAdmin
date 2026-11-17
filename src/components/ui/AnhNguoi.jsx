import { Avatar } from 'antd';

// Màu nền ảnh đại diện chữ cái: trầm, theo NGƯỜI (id) chứ không theo hạng —
// đổi tháng hay lọc tên thì mỗi người vẫn giữ đúng màu của mình.
const MAU_AVATAR = ['#3F5E7A', '#7C6A46', '#5B6B3F', '#6B4F7A', '#2F6B5E', '#8A4F5C', '#4A5568', '#7A5A3F'];
const chuCai = (ten = '') => ten.trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || '?';

/** Ảnh đại diện nhân sự; chưa có ảnh thì chữ cái cuối của tên trên nền trầm. */
export const AnhNguoi = ({ nguoi, size }) => (
  <Avatar size={size} src={nguoi.avatar || undefined}
          style={{ background: MAU_AVATAR[(nguoi.id || 0) % MAU_AVATAR.length], fontWeight: 600, flex: '0 0 auto' }}>
    {chuCai(nguoi.name)}
  </Avatar>
);
