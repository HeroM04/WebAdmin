import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import '../../SaleWeb.css';

export const EventDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/events">Sự kiện</Link></Breadcrumb.Item>
        <Breadcrumb.Item>SỰ KIỆN MỞ BÁN DỰ ÁN VINHOMES HẢI VÂN BAY</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
        <img 
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600" 
          alt="Event Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        {/* Left Column (Content) */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.3, marginBottom: '24px', textTransform: 'uppercase' }}>
            SỰ KIỆN MỞ BÁN DỰ ÁN VINHOMES HẢI VÂN BAY "HEIR TO THE GEMS - NGƯỜI KẾ THỪA NGỌC BẢO"
          </h1>

          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div 
              style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'overview' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent' }}
              onClick={() => setActiveTab('overview')}
            >
              TỔNG QUAN
            </div>
            <div 
              style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'gallery' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'gallery' ? '2px solid #2563eb' : '2px solid transparent' }}
              onClick={() => setActiveTab('gallery')}
            >
              THƯ VIỆN
            </div>
          </div>

          {activeTab === 'overview' && (
            <div style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.05rem' }}>
              <h3 style={{ color: '#2563eb', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                💎 HEIR TO THE GEMS - NGƯỜI KẾ THỪA NGỌC BẢO 💎
              </h3>
              
              <p>Giữa tuyệt tác vịnh biển nguyên sơ,<br/>một biểu tượng tinh hoa đang dần lộ diện...</p>
              
              <p>Sự kiện mở bán đặc biệt "HEIR TO THE GEMS - Người Kế Thừa Ngọc Bảo" chính thức diễn ra, mở ra cơ hội sở hữu những giá trị xứng tầm dành cho những chủ nhân tiên phong - những người đủ bản lĩnh để kế thừa chuẩn sống tinh anh giữa trung tâm di sản biển đảo.</p>
              
              <p>✨ Không chỉ là một bất động sản,<br/>Đảo Ngọc là "viên bảo ngọc" dành cho thế hệ chủ nhân mới - nơi hội tụ nghỉ dưỡng, đầu tư và di sản truyền đời.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', marginBottom: '24px', fontWeight: 'bold' }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444' }}>📍</span> Thời gian: 08:00 | 31.05.2026
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444' }}>📍</span> Địa điểm: Trống Đồng Palace, Lãng Yên, Hà Nội
                </li>
              </ul>
              
              <p>Tại sự kiện, Quý Khách hàng sẽ được:</p>
              <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
                <li>Khám phá tổng thể dự án Vinhomes Hải Vân Bay</li>
                <li>Cập nhật chính sách & cơ hội đầu tư đặc biệt khu Đảo Ngọc</li>
                <li>Trực tiếp tư vấn cùng đội ngũ chuyên gia</li>
                <li>Thưởng thức các tiết mục nghệ thuật đặc sắc</li>
                <li>Tham gia chương trình bốc thăm may mắn hấp dẫn</li>
              </ul>
              
              <p>🌊 Một "báu vật" không dành cho số đông.<br/>💚 Và người kế thừa xứng đáng chính là Quý vị!</p>

              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" 
                alt="Event Content" 
                style={{ width: '100%', borderRadius: '12px', marginTop: '24px' }} 
              />
            </div>
          )}

          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[1, 2, 3, 4].map(img => (
                <img key={img} src={`https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&sig=${img}`} alt="Gallery" style={{ width: '100%', borderRadius: '8px', height: '200px', objectFit: 'cover' }} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Info Widget) */}
        <div style={{ width: '350px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase' }}>THÔNG TIN SỰ KIỆN:</h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <div style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid #7c3aed', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 'bold' }}>SỰ KIỆN CHUNG</div>
              <div style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid #94a3b8', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', display: 'inline-block' }}></span>
                ĐÃ KẾT THÚC
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', marginBottom: '16px', fontSize: '0.95rem' }}>
              <CalendarOutlined style={{ marginTop: '4px', color: '#3b82f6' }} />
              <div>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Thời gian:</span> 08:00 31/05/2026 - 12:00 31/05/2026
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', marginBottom: '24px', fontSize: '0.95rem' }}>
              <EnvironmentOutlined style={{ marginTop: '4px', color: '#ef4444' }} />
              <div>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Địa điểm:</span> Trống Đồng Palace, Lãng Yên, Hà Nội
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>10</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginTop: '4px' }}>NGƯỜI THAM GIA</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>0</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginTop: '4px' }}>ĐÃ CHECK-IN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
