import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Tag, List } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import '../../SaleWeb.css';

export const MOCK_NEWS = [
  {
    id: 1,
    category: 'Vinhomes Wonder City',
    title: 'CẦU THƯỢNG CÁT KHỞI CÔNG - GIÁ TRỊ VINHOMES WONDER CITY BỨT TỐC',
    description: 'Cầu Thượng Cát chính thức khởi công là bước ngoặt hạ tầng quan trọng của Hà Nội giai đoạn 2025-2030. Cây cầu bắc qua sông Hồng, nối Bắc Từ Liêm - Đông Anh...',
    date: '23 tháng 10, 2025',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600'
  },
  {
    id: 2,
    category: 'Vinhomes Wonder City',
    title: 'GIẢI MÃ "WONDER VISION CODE" - MỞ LỐI TẦM NHÌN ĐẦU TƯ TƯƠNG LAI',
    description: 'Mã khóa "Wonder Vision Code" - Giải mã tầm nhìn và cơ hội đầu tư bền vững tại Vinhomes Wonder City Sự kiện chuyên đề "Wonder Vision Code" sẽ chính thức...',
    date: '23 tháng 10, 2025',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600'
  },
  {
    id: 3,
    category: 'Vinhomes Wonder City',
    title: 'WONDER GRAND DEAL - 50 ƯU ĐÃI CUỐI CÙNG DÀNH CHO CHỦ NHÂN TINH HOA',
    description: 'Wonder Villas - dòng biệt thự vườn độc bản tại Vinhomes Wonder City dành tặng 50 ưu đãi đặc biệt cuối cùng cho những chủ nhân tinh hoa.',
    date: '23 tháng 10, 2025',
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600'
  },
  {
    id: 4,
    category: 'Vinhomes Wonder City',
    title: 'WONDER GRAND DEAL - ĐẶC QUYỀN DÀNH CHO 50 CHỦ NHÂN TINH HOA CUỐI CÙNG',
    description: 'Giữa lòng Hà Nội đang không ngừng chuyển mình, Wonder Villas tại Vinhomes Wonder City mang đến không gian sống xanh hiếm có - nơi thiên nhiên và ph...',
    date: '28 tháng 10, 2025',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600'
  },
  {
    id: 5,
    category: 'Vinhomes Wonder City',
    title: 'WONDER VILLAS BIỆT THỰ VƯỜN ĐỘC BẢN TẠI TÂY HỒ TÂY',
    description: 'Biệt thự vườn Wonder Villas là dấu ấn của phong cách sống tinh hoa - nơi sang trọng, riêng tư và thiên nhiên giao hòa trong từng chi tiết.',
    date: '23 tháng 10, 2025',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600'
  }
];

export const CATEGORIES = [
  { name: 'Phân Tích - Nhận định', count: 427 },
  { name: 'Tin Tức Dự Án', count: 317 },
  { name: 'Thị trường', count: 236 },
  { name: 'VINHOMES GOLDEN CITY', count: 102 },
  { name: 'Vinhomes Royal Island', count: 92 },
  { name: 'Pháp Lý - Chính Sách', count: 54 },
  { name: 'Vinhomes Wonder City', count: 54 },
  { name: 'LUMIÈRE Prime Hills', count: 35 },
  { name: 'Vinhomes The Gallery', count: 27 },
  { name: 'Masteri Grand Avenue', count: 25 },
];

export const TAGS = ['Chung cư cao cấp', 'Đầu tư bất động sản', 'Vinhomes Golden City', 'Vinhomes Royal Island', 'BĐS nghỉ dưỡng ven biển', 'BĐS nghỉ dưỡng', 'Vinhomes Wonder City', 'BĐS Hà Nội', 'Biệt thự', 'Thương mại thấp tầng'];

export const NewsSidebar = () => {
  return (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Categories Widget */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Chuyên mục</h3>
        <List
          dataSource={CATEGORIES}
          renderItem={item => (
            <List.Item style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9' }}>
              <span style={{ color: '#334155', cursor: 'pointer', fontWeight: 500 }}>{item.name}</span>
              <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{item.count}</span>
            </List.Item>
          )}
        />
      </div>

      {/* Tags Widget */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Thẻ</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TAGS.map(tag => (
            <Tag key={tag} style={{ padding: '6px 14px', borderRadius: '16px', margin: 0, cursor: 'pointer', border: '1px solid #cbd5e1', color: '#475569', background: '#fff' }}>
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NewsList = () => {
  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Trang chủ / Danh sách tin tức</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
            Danh sách tin tức
          </h1>
          <Input 
            placeholder="Tìm kiếm tin tức..." 
            prefix={<SearchOutlined />} 
            style={{ width: '300px', borderRadius: '8px' }} 
            size="large"
          />
        </div>
      </div>

      {/* Active Filters */}
      <div style={{ marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
        <span style={{ color: '#64748b' }}>Chuyên mục: <strong style={{ color: '#0f172a' }}>Vinhomes Wonder City</strong></span>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '8px' }}>
          <CloseOutlined style={{ fontSize: '10px', color: '#64748b' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Main Content (News Grid 3 columns) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {MOCK_NEWS.map(news => (
              <div key={news.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={news.image} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#d97706', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px' }}>🏷️</span> {news.category}
                  </div>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.4, textTransform: 'uppercase' }}>{news.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px', flex: 1, lineHeight: 1.6 }}>{news.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{news.date}</span>
                    <Link to={`/news/${news.id}`} style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>Đọc thêm</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <NewsSidebar />
      </div>
    </div>
  );
};
