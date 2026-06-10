import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Button } from 'antd';
import { 
  HomeOutlined, 
  ShareAltOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import '../../SaleWeb.css';

const TABS = [
  { id: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
  { id: 'location', icon: <EnvironmentOutlined />, label: 'Vị trí' },
  { id: 'training', icon: <PlayCircleOutlined />, label: 'Đào tạo' },
  { id: 'masterplan', icon: <PictureOutlined />, label: 'Mặt bằng' },
  { id: 'buildings', icon: <HomeOutlined />, label: 'Tòa nhà' },
  { id: 'inventory', icon: <ReadOutlined />, label: 'Quỹ căn' },
  { id: 'docs', icon: <ReadOutlined />, label: 'Tài liệu' }
];

export const ProjectDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="saleweb-container" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/projects">Danh sách dự án</Link></Breadcrumb.Item>
            <Breadcrumb.Item>VINHOMES SÀI GÒN PARK</Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>VINHOMES SÀI GÒN PARK</h1>
          <p style={{ color: '#475569', marginTop: '8px' }}>
            Theo dõi thông tin chi tiết về bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán hàng dự án VINHOMES SÀI GÒN PARK.
          </p>
        </div>
        <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
      </div>

      {/* Tabs */}
      <div className="sw-detail-tabs">
        {TABS.map(tab => (
          <div 
            key={tab.id}
            className={`sw-detail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sw-tab-content animate-fade-in-up">
        {activeTab === 'overview' && (
          <div>
            <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600" alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="sw-info-grid">
              <div className="sw-info-card">
                <div className="sw-info-icon">🏢</div>
                <div>
                  <div className="sw-info-label">Quy mô</div>
                  <div className="sw-info-value">1080 ha</div>
                </div>
              </div>
              <div className="sw-info-card">
                <div className="sw-info-icon">💰</div>
                <div>
                  <div className="sw-info-label">Vốn</div>
                  <div className="sw-info-value">2,3 tỷ USD</div>
                </div>
              </div>
              <div className="sw-info-card">
                <div className="sw-info-icon">👥</div>
                <div>
                  <div className="sw-info-label">Cư dân</div>
                  <div className="sw-info-value">135.000 cư dân</div>
                </div>
              </div>
            </div>

            <div className="sw-overview-card">
              <div className="sw-overview-content">
                <div className="sw-overview-title">Tổng quan dự án</div>
                <ul className="sw-overview-list">
                  <li>Tên dự án: Vinhomes Sài Gòn Park</li>
                  <li>Chủ đầu tư: Tập đoàn Vingroup (Vinhomes)</li>
                  <li>Vị trí: Xã Tân Thới Nhì và Xã Xuân Thới Sơn, Huyện Hóc Môn, TP. Hồ Chí Minh</li>
                  <li>Vốn đầu tư: ~2.3 tỷ USD</li>
                  <li>Quy mô: ~1080 ha</li>
                  <li>Sản phẩm: Nhà phố hiện đại, biệt thự sang lập, biệt thự độc lập</li>
                  <li>Kết nối giao thông: Trực tiếp Quốc lộ 22, đường Tỉnh lộ 8, Vành đai 3 và Metro số 2</li>
                </ul>
                <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.9 }}>
                  Trái tim sinh thái mới Tây Bắc TP.HCM – “Lá phổi xanh” kết nối công nghệ...
                </p>
              </div>
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800" alt="Overview" className="sw-overview-img" />
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#7f1d1d', fontWeight: 800 }}>BẢN ĐỒ VỊ TRÍ</h2>
              <h3 style={{ color: '#0f172a' }}>VINHOMES SAIGON PARK</h3>
            </div>
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600" alt="Location Map" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800 }}>LUMIÈRE HANOI SEASONS GARDEN</h2>
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000" alt="Video Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '64px', color: '#fff', cursor: 'pointer' }}>
                <PlayCircleOutlined />
              </div>
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                [TOÀN CẢNH BĐS T04.2026] TOP 6 LÝ DO NÊN SỞ HỮU BĐS NGAY!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'masterplan' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#7f1d1d', fontWeight: 800 }}>Mặt bằng</h2>
              <p>Thiết kế không gian sống mở</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                <Button type="primary" style={{ background: '#d4af37', borderColor: '#d4af37' }}>MỌI TIỆN ÍCH</Button>
                <Button>TÌM TIỆN ÍCH</Button>
                <Button>TÌM TIỆN ÍCH KHU 1, KHU 2</Button>
              </div>
            </div>
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600" alt="Masterplan" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>MẶT BẰNG QUỸ CĂN</h2>
            <div style={{ width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600" alt="Inventory Map" style={{ width: '100%', display: 'block' }} />
              <div style={{ position: 'absolute', top: '40%', left: '50%', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid #fff' }}>
                TÒA L1
              </div>
              <div style={{ position: 'absolute', top: '60%', left: '65%', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid #fff' }}>
                TÒA L2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
