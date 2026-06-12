import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Select } from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled, EnvironmentOutlined } from '@ant-design/icons';
import '../../SaleWeb.css';

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'VINHOMES SÀI GÒN PARK',
    type: 'DỰ ÁN THẤP TẦNG',
    isHot: true,
    location: 'Xã Tân Thới Nhì và Xã Xuân Thới Sơn, Huyện Hóc Môn, TP. Hồ Chí Minh',
    desc: 'Vinhomes Hóc Môn - Thành phố công viên tri thức hàng đầu Châu Á',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800',
  },
  {
    id: 2,
    name: 'LUMIÈRE HANOI SEASONS GARDEN',
    type: 'DỰ ÁN CAO TẦNG',
    isHot: true,
    location: 'Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
    desc: 'MASTERISE CAO XÀ LÁ - Mảnh vườn nuôi dưỡng giá trị thời gian trân quý',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800',
  },
  {
    id: 3,
    name: 'VINHOMES OCEAN PARK 2',
    type: 'DỰ ÁN THẤP TẦNG',
    isHot: false,
    location: 'Văn Giang, Hưng Yên',
    desc: 'Vinhomes Ocean Park 2 - "Quận ăn, quận chơi" của Thành phố điểm đến Ocean City',
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800',
  },
  {
    id: 4,
    name: 'VINHOMES OCEAN PARK 3',
    type: 'DỰ ÁN THẤP TẦNG',
    isHot: false,
    location: 'Văn Lâm & Văn Giang, Hưng Yên',
    desc: 'Vinhomes Ocean Park 3 - "Quận nghỉ dưỡng" của Thành phố điểm đến Ocean City',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
  },
  {
    id: 5,
    name: 'VINHOMES GLOBAL GATE HẠ LONG',
    type: 'DỰ ÁN THẤP TẦNG',
    isHot: false,
    location: 'Đông Anh, Hà Nội',
    desc: 'Thành phố giao thương toàn cầu',
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800',
  },
  {
    id: 6,
    name: 'VINHOMES GREEN PARADISE',
    type: 'DỰ ÁN THẤP TẦNG',
    isHot: false,
    location: 'Mễ Trì, Nam Từ Liêm, Hà Nội',
    desc: 'Thiên đường xanh giữa lòng phố thị',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
  }
];

export const SaleWebHome = () => {
  const [favorites, setFavorites] = useState([1, 2]);

  const toggleFav = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(x => x !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="saleweb-container animate-fade-in-up" style={{ padding: '16px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 12px' }}>Danh sách dự án</h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm dự án..."
            prefix={<SearchOutlined />}
            style={{ width: 280, borderRadius: '8px' }}
          />
          <Select placeholder="Chọn chủ đầu tư" style={{ width: 190 }} />
          <Select placeholder="Chọn khu vực" style={{ width: 170 }} />
          <Select placeholder="Chọn loại hình" style={{ width: 170 }} />
          <Select placeholder="Chọn trạng thái" style={{ width: 170 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Column - Grid: cố định 3 dự án / hàng như salepro.com */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            {MOCK_PROJECTS.map(p => (
              <div key={p.id} className="sw-project-card">
                <div className="sw-card-img-wrap">
                  <img src={p.img} alt={p.name} className="sw-card-img" />
                  <div className="sw-card-badges">
                    <span className={`sw-badge ${p.type.includes('CAO') ? 'sw-badge-blue' : 'sw-badge-orange'}`}>{p.type}</span>
                  </div>
                  <div className="sw-card-fav" onClick={() => toggleFav(p.id)}>
                    {favorites.includes(p.id) ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                  </div>
                  {p.isHot && <div className="sw-badge-hot">🔥 HOT</div>}
                </div>
                
                <div className="sw-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link to={`/projects/${p.id}`} className="sw-card-title">{p.name}</Link>
                    <Link to={`/projects/${p.id}`} style={{ color: '#d4af37', fontSize: '18px' }}>
                      ↗
                    </Link>
                  </div>
                  <p className="sw-card-desc">{p.desc}</p>
                  <div className="sw-card-loc">
                    <EnvironmentOutlined /> {p.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ width: '320px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ background: '#1e40af', color: '#fff', padding: '16px', fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>
            DỰ ÁN ĐANG BÁN CHẠY
          </div>
          
          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">🏢 Dự án Cao Tầng</div>
            <ul className="sw-sidebar-list">
              <li>LUMIÈRE HANOI SEASONS GARDEN</li>
              <li>VINHOMES STAR CITY</li>
              <li>IMPERIA OCEAN CITY - THE PARKLAND</li>
              <li>CHARMORA CITY_CT</li>
              <li>MASTERI GRAND COAST</li>
            </ul>
          </div>

          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">🏘️ Dự án Thấp Tầng</div>
            <ul className="sw-sidebar-list">
              <li>VINHOMES GLOBAL GATE HẠ LONG</li>
              <li>VINHOMES HẢI VÂN BAY</li>
              <li>VINHOMES SÀI GÒN PARK</li>
              <li>VINHOMES GREEN PARADISE</li>
              <li>VINHOMES OCEAN PARK 2</li>
            </ul>
          </div>
          
          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">⭐ Dự án Mới nhất</div>
            <ul className="sw-sidebar-list">
              <li>VINHOMES SÀI GÒN PARK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
