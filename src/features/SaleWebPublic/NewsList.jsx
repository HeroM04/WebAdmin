import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Tag, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../../SaleWeb.css';

const MOCK_NEWS = [
  {
    id: 1,
    category: 'Thị trường',
    title: 'Giải mã sức hút của Vinhomes Sài Gòn Park: "Tài sản lỗi" được trả lực từ tiến độ thần tốc',
    description: 'Xu hướng dòng tiền trên thị trường bất động sản đang có sự dịch chuyển mạnh mẽ vào nhóm "tài sản lỗi" có giá trị thực, minh chứng bằng kỷ lục 7.778 booking...',
    date: '09 tháng 6, 2026',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600'
  },
  {
    id: 2,
    category: 'Phân tích - Nhận định',
    title: 'Đến Trước Bình Minh - Đón Đầu Vận Hội Cùng Prima Bay Hạ Long',
    description: 'Prima Bay Hạ Long sở hữu vị trí đắc địa bên vịnh di sản, kiến tạo chuẩn sống thượng lưu và mở ra cơ hội đầu tư đón đầu chu kỳ tăng trưởng mới.',
    date: '05 tháng 6, 2026',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600'
  },
  {
    id: 3,
    category: 'Thị trường',
    title: 'Nút giao Phú Thứ chính thức thông xe, Sun Urban City đón đầu hạ tầng mạnh mẽ',
    description: 'Ngày 01/06/2026, nút giao Phú Thứ trên tuyến cao tốc Cầu Giẽ - Ninh Bình chính thức được đưa vào khai thác. Đây không chỉ là tin vui đối với người dân địa phương...',
    date: '03 tháng 6, 2026',
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600'
  },
  {
    id: 4,
    category: 'Thị trường',
    title: 'Vinhomes Sài Gòn Park khuấy đảo thị trường với 3 dòng sản phẩm chiến lược',
    description: 'Sau những cột mốc bứt phá về quy mô và hạ tầng tại cực tăng trưởng Tây Bắc TP.HCM, Vinhomes Sài Gòn Park tiếp tục là tâm điểm thu hút dòng vốn...',
    date: '01 tháng 6, 2026',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600'
  }
];

const CATEGORIES = [
  { name: 'Phân Tích - Nhận định', count: 427 },
  { name: 'Tin Tức Dự Án', count: 317 },
  { name: 'Thị trường', count: 236 },
  { name: 'VINHOMES GOLDEN CITY', count: 102 },
  { name: 'Vinhomes Royal Island', count: 92 },
  { name: 'Pháp Lý - Chính Sách', count: 54 },
];

const TAGS = ['Chung cư cao cấp', 'Đầu tư bất động sản', 'Vinhomes Golden City', 'Vinhomes Royal Island', 'BĐS nghỉ dưỡng ven biển', 'BĐS nghỉ dưỡng', 'Vinhomes Wonder City', 'BĐS Hà Nội', 'Biệt thự'];

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

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Main Content (News Grid) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {MOCK_NEWS.map(news => (
              <div key={news.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={news.image} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#d97706', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    🏷️ {news.category}
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', lineHeight: 1.4 }}>{news.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>{news.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{news.date}</span>
                    <Link to={`/news/${news.id}`} style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'underline' }}>Đọc thêm</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
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
                <Tag key={tag} style={{ padding: '4px 12px', borderRadius: '16px', margin: 0, cursor: 'pointer', border: '1px solid #cbd5e1', color: '#475569' }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
