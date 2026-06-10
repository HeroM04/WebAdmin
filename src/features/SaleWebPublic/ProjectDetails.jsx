import React, { useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Table, Timeline, Checkbox, List } from 'antd';
import { 
  HomeOutlined, 
  ShareAltOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  PictureOutlined,
  TableOutlined,
  CameraOutlined,
  FileDoneOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  CloudDownloadOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { CompareContext } from '../../context/CompareContext';
import '../../SaleWeb.css';

const TABS = [
  { id: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
  { id: 'location', icon: <EnvironmentOutlined />, label: 'Vị trí' },
  { id: 'training', icon: <PlayCircleOutlined />, label: 'Đào tạo' },
  { id: 'masterplan', icon: <PictureOutlined />, label: 'Mặt bằng' },
  { id: 'buildings', icon: <HomeOutlined />, label: 'Tòa nhà' },
  { id: 'inventory', icon: <TableOutlined />, label: 'Bảng hàng' },
  { id: 'fund', icon: <HomeOutlined />, label: 'Quỹ căn' },
  { id: '360', icon: <CameraOutlined />, label: 'Ảnh 360º' },
  { id: 'policy', icon: <FileDoneOutlined />, label: 'Chính sách bán hàng' },
  { id: 'progress', icon: <FieldTimeOutlined />, label: 'Tiến độ' },
  { id: 'docs', icon: <FileTextOutlined />, label: 'Tài liệu' },
  { id: 'news', icon: <ReadOutlined />, label: 'Tin tức' }
];

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useContext(CompareContext);

  const handleCheckboxChange = (record, checked) => {
    if (checked) {
      // Map table data to apartment structure for CompareContext
      const apartment = {
        id: record.key,
        apartmentCode: record.code,
        price: record.price,
        type: record.type,
        direction: record.direction,
        floor: record.floor,
        area: record.area,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=400', // Mock image
        // Add fake details
        landArea: record.area,
        buildArea: record.area,
        status: 'Còn hàng',
        zone: record.zone,
        axis: record.axis
      };
      addToCompare(apartment, { name: 'LUMIÈRE HANOI SEASONS GARDEN' });
    } else {
      removeFromCompare(record.key);
    }
  };

  // MOCK DATA TABLE QUỸ CĂN
  const columns = [
    { title: 'Mã căn', dataIndex: 'code', key: 'code', render: text => <span style={{color: '#ef4444', fontWeight: 'bold'}}>{text}</span> },
    { title: 'Giá bán', dataIndex: 'price', key: 'price' },
    { title: 'Loại hình', dataIndex: 'type', key: 'type' },
    { title: 'Hướng', dataIndex: 'direction', key: 'direction' },
    { title: 'Tầng', dataIndex: 'floor', key: 'floor' },
    { title: 'Trục', dataIndex: 'axis', key: 'axis' },
    { title: 'DT xây dựng', dataIndex: 'area', key: 'area' },
    { title: 'Phân khu', dataIndex: 'zone', key: 'zone' },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: () => <span style={{color: '#10b981', border: '1px solid #10b981', background: '#d1fae5', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold'}}>Còn hàng</span> },
    { 
      title: 'Chọn căn', 
      dataIndex: 'action', 
      key: 'action', 
      render: (_, record) => {
        const isChecked = compareList.some(item => item.id === record.key);
        return <Checkbox checked={isChecked} onChange={(e) => handleCheckboxChange(record, e.target.checked)} />
      } 
    },
  ];

  const dataInventory = [
    { key: 'AS85-24', code: 'AS85-24', price: '6.21 tỷ', type: 'LIỀN KỀ', direction: 'ĐÔNG BẮC', floor: 1, axis: '24', area: '144.2 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS84-36', code: 'AS84-36', price: '6.25 tỷ', type: 'LIỀN KỀ', direction: 'ĐÔNG BẮC', floor: 1, axis: '36', area: '144.2 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS82-18', code: 'AS82-18', price: '6.35 tỷ', type: 'LIỀN KỀ', direction: 'ĐÔNG BẮC', floor: 1, axis: '18', area: '150.1 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS83-05', code: 'AS83-05', price: '7.13 tỷ', type: 'LIỀN KỀ', direction: 'TÂY NAM', floor: 1, axis: '05', area: '184.1 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS82-11', code: 'AS82-11', price: '7.19 tỷ', type: 'LIỀN KỀ', direction: 'TÂY NAM', floor: 1, axis: '11', area: '184.2 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS81-16', code: 'AS81-16', price: '7.26 tỷ', type: 'LIỀN KỀ', direction: 'ĐÔNG BẮC', floor: 1, axis: '16', area: '150.1 m²', zone: 'IVY PARK', building: 'L1' },
    { key: 'AS81-31', code: 'AS81-31', price: '8.40 tỷ', type: 'LIỀN KỀ', direction: 'TÂY NAM', floor: 1, axis: '31', area: '185.4 m²', zone: 'IVY PARK', building: 'L1' },
  ];

  return (
    <div className="saleweb-container" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/projects">Danh sách dự án</Link></Breadcrumb.Item>
            <Breadcrumb.Item>LUMIÈRE HANOI SEASONS GARDEN</Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>LUMIÈRE HANOI SEASONS GARDEN</h1>
          <p style={{ color: '#475569', marginTop: '8px' }}>
            Theo dõi thông tin chi tiết về bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán hàng dự án LUMIÈRE HANOI SEASONS GARDEN.
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
                  <li>Tên dự án: Lumière Hanoi Seasons Garden</li>
                  <li>Chủ đầu tư: Masterise Homes</li>
                  <li>Vị trí: 233 – 235 Nguyễn Trãi, Thanh Xuân, Hà Nội</li>
                  <li>Vốn đầu tư: ~2.3 tỷ USD</li>
                  <li>Quy mô: ~1080 ha</li>
                  <li>Sản phẩm: Căn hộ cao cấp hạng sang</li>
                  <li>Kết nối giao thông: Tuyến Metro Cát Linh - Hà Đông, Vành Đai 3, Vành Đai 2.5</li>
                </ul>
                <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.9 }}>
                  Nơi giao thoa của những giá trị sống tinh hoa nhất giữa lòng thủ đô.
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
              <h3 style={{ color: '#0f172a', marginBottom: '32px' }}>LUMIÈRE HANOI SEASONS GARDEN</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ lineHeight: '1.8', fontSize: '1rem', color: '#334155' }}>
                <p>
                  Tọa lạc tại 233 – 235 Nguyễn Trãi, Masteri Cao Xà Lá sở hữu vị trí kim cương ngay trong khu vực nội đô Hà Nội. Dự án nằm trên trục Nguyễn Trãi – tuyến giao thông huyết mạch kết nối Thanh Xuân, Đống Đa và Hà Đông, nhờ đó vừa thuận tiện cho nhu cầu di chuyển hàng ngày, vừa hưởng lợi trực tiếp từ mạng lưới hạ tầng và giao thông công cộng đang ngày càng hoàn thiện. Đây là một trong những yếu tố quan trọng tạo nên giá trị an cư bền vững và tiềm năng tăng giá dài hạn cho dự án.
                </p>
                <h4 style={{ fontWeight: 800, marginTop: '24px', marginBottom: '16px', color: '#0f172a' }}>Các điểm kết nối nổi bật của Masteri Cao Xà Lá:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Cách Ngã Tư Sở khoảng 500m, dễ dàng tiếp cận nút giao lớn của khu Tây Nam Hà Nội.</li>
                  <li>01 phút đến Ga Thượng Đình, Tuyến Metro Cát Linh - Hà Đông</li>
                  <li>02 phút đến Vinhomes Royal City - KĐT sôi động bậc nhất phía Tây Hà Nội</li>
                  <li>03 phút tới Ngã Tư Sở, Vành Đai 2, Vành Đai 2.5 và Vành Đai 3 - các trục giao thông huyết mạch của Thủ Đô</li>
                  <li>08 phút tới Hồ Tây, tận hưởng hoàng hôn Hồ Tây thơ mộng.</li>
                  <li>10 phút tới Hồ Hoàn Kiếm, hòa mình vào nhịp sống phố Cổ.</li>
                  <li>30 phút tới sân bay Nội Bài, sẵn sàng cho mọi chuyến bay</li>
                  <li>Hưởng lợi từ quy hoạch các tuyến metro tương lai, góp phần gia tăng giá trị bất động sản theo thời gian.</li>
                </ul>
              </div>
              <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x3135ac90c642fc01%3A0x6aab5a22f55b8220!2zMjMzIE5ndXnhu4VuIFRyw6NpLCBUaMaw4bujbmcgxJDDrG5oLCBUaGFuaCBYdcOibiwgSMOgIE7hu5lpLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                  width="100%" 
                  height="500" 
                  style={{ border: 0, display: 'block' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location"
                ></iframe>
              </div>
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
            </div>
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600" alt="Masterplan" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div>
             <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800 }}>DANH SÁCH TÒA NHÀ</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[1, 2, 3, 4].map(num => (
                <div key={num} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <HomeOutlined style={{ fontSize: '48px', color: '#d4af37', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tòa L{num}</h3>
                  <p style={{ color: '#64748b' }}>Phân khu THE BLOOM</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                    <div><strong style={{ color: '#1e40af' }}>35</strong> tầng</div>
                    <div><strong style={{ color: '#1e40af' }}>210</strong> căn hộ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
             <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800 }}>BẢNG HÀNG</h2>
            </div>
            <div style={{ width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600" alt="Inventory Map" style={{ width: '100%', display: 'block', opacity: 0.8 }} />
              <div style={{ position: 'absolute', top: '40%', left: '50%', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                📍 TÒA L1
              </div>
              <div style={{ position: 'absolute', top: '60%', left: '65%', background: '#a855f7', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                📍 TÒA L2
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fund' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800, margin: 0 }}>BẢNG HÀNG (QUỸ CĂN)</h2>
              <div>
                <Button>Bộ lọc</Button>
              </div>
            </div>
            <Table 
              columns={columns} 
              dataSource={dataInventory} 
              pagination={false} 
              bordered 
            />
          </div>
        )}

        {activeTab === '360' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800 }}>TOÀN CẢNH DỰ ÁN</h2>
            </div>
            <div style={{ width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '600px', background: '#000' }}>
              <img src="https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=1600" alt="360 Panorama" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Fake 360 interactive marker */}
              <div style={{ position: 'absolute', top: '40%', left: '50%', background: 'rgba(6, 78, 59, 0.9)', color: '#fff', padding: '16px', borderRadius: '8px', minWidth: '200px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '8px' }}>THÔNG TIN TỔNG QUAN</div>
                <div style={{ fontSize: '12px', lineHeight: '2' }}>
                  🏢 Dự án: Lumiere Seasons Garden<br/>
                  📍 Vị trí: Nguyễn Trãi, Hà Nội<br/>
                  📐 Tổng diện tích: 30.000 m²<br/>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '8px 16px', borderRadius: '4px' }}>INFO [ ]</div>
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800 }}>CHÍNH SÁCH BÁN HÀNG VƯỢT TRỘI</h2>
            </div>
            <div style={{ background: '#13352c', padding: '60px 40px', borderRadius: '16px', color: '#fff', textAlign: 'center' }}>
              <h3 style={{ color: '#d4af37', fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '2px' }}>MIỄN PHÍ PHÍ QUẢN LÝ</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '40px' }}>
                <div>
                  <div style={{ fontSize: '5rem', fontWeight: 900, color: '#fcd34d', lineHeight: '1' }}>24</div>
                  <div style={{ fontSize: '1.2rem', color: '#fde68a' }}>Tháng (Khách mới)</div>
                </div>
                <div style={{ width: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div>
                  <div style={{ fontSize: '5rem', fontWeight: 900, color: '#fcd34d', lineHeight: '1' }}>48</div>
                  <div style={{ fontSize: '1.2rem', color: '#fde68a' }}>Tháng (Cư dân cũ)</div>
                </div>
              </div>
              <h3 style={{ color: '#d4af37', fontSize: '1.8rem', fontWeight: 700, border: '1px solid #d4af37', display: 'inline-block', padding: '12px 32px', borderRadius: '99px' }}>
                THANH TOÁN TIẾN ĐỘ CHUẨN
              </h3>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '32px' }}>TIẾN ĐỘ DỰ ÁN</h2>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ width: '250px' }}>
                <Timeline items={[
                  { color: '#1e40af', children: <div style={{background: '#f1f5f9', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold'}}>14/4/2026</div> },
                  { color: '#cbd5e1', children: <div style={{background: '#f8fafc', padding: '8px 16px', borderRadius: '4px', color: '#64748b'}}>7/4/2026</div> },
                  { color: '#cbd5e1', children: <div style={{background: '#f8fafc', padding: '8px 16px', borderRadius: '4px', color: '#64748b'}}>1/4/2026</div> },
                ]} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '16px' }}>Hình ảnh tiến độ (14/4/2026)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[1,2,3,4,5,6].map(img => (
                    <div key={img} style={{ width: '100%', aspectRatio: '4/3', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={`https://images.unsplash.com/photo-1541888087405-eb81b2383c44?q=80&w=400&auto=format&fit=crop&sig=${img}`} alt="Progress" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
             <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '24px' }}>TÀI LIỆU DỰ ÁN</h2>
             <List
                itemLayout="horizontal"
                dataSource={[
                  { title: 'Brochure Dự Án (Bản chuẩn 2026)', size: '12 MB' },
                  { title: 'Mặt bằng phân lô L1, L2', size: '5 MB' },
                  { title: 'Chính sách bán hàng T4/2026', size: '2 MB' },
                  { title: 'Bảng vật liệu bàn giao', size: '3.5 MB' },
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[<Button type="primary" icon={<CloudDownloadOutlined />}>Tải xuống</Button>]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{fontSize: '32px', color: '#ef4444'}} />}
                      title={<a style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{item.title}</a>}
                      description={`PDF Format • ${item.size}`}
                    />
                  </List.Item>
                )}
              />
          </div>
        )}

        {activeTab === 'news' && (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '24px' }}>TIN TỨC CẬP NHẬT</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200" alt="News" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>Lễ ra mắt phân khu The Bloom</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sự kiện mở bán chính thức phân khu đẹp nhất dự án với hàng ngàn ưu đãi...</p>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>12/04/2026</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=200" alt="News" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>Cất nóc tháp L1 vượt tiến độ 30 ngày</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nhà thầu Coteccons chính thức làm lễ cất nóc đánh dấu cột mốc quan trọng...</p>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>05/04/2026</div>
                  </div>
                </div>
             </div>
           </div>
        )}
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>
              <span style={{ marginRight: '8px' }}>🏢</span>
              So sánh căn hộ <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{compareList.length}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {compareList.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '120px', position: 'relative' }}>
                  <div style={{ background: '#1e293b', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: '12px' }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>{item.apartmentCode}</div>
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.price}</div>
                  </div>
                  <CloseOutlined 
                    onClick={() => removeFromCompare(item.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Chọn 2 căn hộ trở lên để bắt đầu so sánh</span>
            <Button onClick={clearCompare}>Hủy</Button>
            <Button 
              type="primary" 
              disabled={compareList.length < 2}
              onClick={() => navigate('/compare')}
              style={{ background: compareList.length >= 2 ? '#3b82f6' : '#cbd5e1', fontWeight: 'bold' }}
            >
              Đi đến so sánh ({compareList.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
