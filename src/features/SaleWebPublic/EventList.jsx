import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import '../../SaleWeb.css';

const { Option } = Select;

const MOCK_EVENTS = [
  {
    id: 1,
    status: 'ĐÃ KẾT THÚC',
    type: 'SỰ KIỆN CHUNG',
    title: 'SỰ KIỆN MỞ BÁN DỰ ÁN VINHOMES HẢI VÂN BAY "HEIR TO THE GEMS - NGƯỜI KẾ THỪA NGỌC BẢO"',
    time: '08:00 31/05/2026 - 12:00 31/05/2026',
    location: 'Trống Đồng Palace, Lãng Yên, Hà Nội',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800'
  },
  {
    id: 2,
    status: 'ĐÃ KẾT THÚC',
    type: 'SỰ KIỆN CHUNG',
    title: 'SỰ KIỆN TRẢI NGHIỆM: HÀNH TRÌNH DIỆU KỲ - WONDER PLANET CẬP BẾN WONDERLAND!',
    time: '14:30 30/05/2026 - 21:30 30/05/2026',
    location: 'Công viên Wonderland, Vinhomes Global Gate, xã Cổ Loa, Đông Anh, Hà Nội',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800'
  },
  {
    id: 3,
    status: 'ĐÃ KẾT THÚC',
    type: 'SỰ KIỆN CHUNG',
    title: 'SỰ KIỆN TRI ÂN: ĐÁNH THỨC KỲ QUAN XANH VINHOMES GREEN PARADISE',
    time: '13:30 30/05/2026 - 16:30 30/05/2026',
    location: 'VinPalace Cổ Loa, Đông Anh, Hà Nội và The Adora Premium, Q7, TP.HCM',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800'
  },
  {
    id: 4,
    status: 'ĐÃ KẾT THÚC',
    type: 'SỰ KIỆN CHUNG',
    title: 'RA MẮT SIÊU PHẨM BIỆT THỰ ĐẢO: ĐÁNH THỨC TÂM ĐIỂM',
    time: '08:30 25/05/2026 - 11:30 25/05/2026',
    location: 'Khách sạn JW Marriott, Đỗ Đức Dục, Nam Từ Liêm, Hà Nội',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800'
  },
  {
    id: 5,
    status: 'ĐÃ KẾT THÚC',
    type: 'SỰ KIỆN CHUNG',
    title: 'TALKSHOW GIẢI MÃ VĨ MÔ & CHIẾN LƯỢC ĐẦU TƯ BẤT ĐỘNG SẢN 2026',
    time: '09:00 20/05/2026 - 12:00 20/05/2026',
    location: 'Trung tâm Hội nghị Quốc gia, Phạm Hùng, Mễ Trì, Hà Nội',
    image: 'https://images.unsplash.com/photo-1475721025505-23fa15b145fa?q=80&w=800'
  },
  {
    id: 6,
    status: 'SẮP DIỄN RA',
    type: 'ĐÀO TẠO',
    title: 'ĐÀO TẠO CHUYÊN SÂU DỰ ÁN VINHOMES ROYAL ISLAND DÀNH CHO CHUYÊN VIÊN TƯ VẤN',
    time: '14:00 15/06/2026 - 17:00 15/06/2026',
    location: 'Hội trường Tầng 3, Tòa nhà Symphony, Vinhomes Riverside, Hà Nội',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800'
  }
];

export const EventList = () => {
  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Trang chủ / Sự kiện</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
          SỰ KIỆN
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <Input 
          placeholder="Tìm kiếm sự kiện..." 
          prefix={<SearchOutlined />} 
          style={{ flex: 1, borderRadius: '8px' }} 
        />
        <Select defaultValue="all-type" style={{ width: '180px' }}>
          <Option value="all-type">Tất cả loại</Option>
          <Option value="general">Sự kiện chung</Option>
          <Option value="training">Đào tạo</Option>
        </Select>
        <Select defaultValue="all-status" style={{ width: '180px' }}>
          <Option value="all-status">Tất cả trạng thái</Option>
          <Option value="upcoming">Sắp diễn ra</Option>
          <Option value="ended">Đã kết thúc</Option>
        </Select>
        <DatePicker placeholder="Từ ngày (mm/dd/yyyy)" style={{ width: '180px' }} format="MM/DD/YYYY" />
        <DatePicker placeholder="Đến ngày (mm/dd/yyyy)" style={{ width: '180px' }} format="MM/DD/YYYY" />
      </div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {MOCK_EVENTS.map(event => (
          <div key={event.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative', height: '220px' }}>
              <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: event.status === 'ĐÃ KẾT THÚC' ? '#94a3b8' : '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                {event.status}
              </div>
              
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: event.type === 'SỰ KIỆN CHUNG' ? '#7c3aed' : '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {event.type}
              </div>
            </div>
            
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Link to={`/events/${event.id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.4, minHeight: '46px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.title}
                </h3>
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' }}>
                <CalendarOutlined style={{ marginTop: '3px', color: '#3b82f6' }} />
                <span>{event.time}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
                <EnvironmentOutlined style={{ marginTop: '3px', color: '#ef4444' }} />
                <span>{event.location}</span>
              </div>
              
              <Button 
                block 
                size="large" 
                style={{ 
                  background: event.status === 'ĐÃ KẾT THÚC' ? '#94a3b8' : '#10b981', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 'bold',
                  borderRadius: '8px'
                }}
              >
                {event.status}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
