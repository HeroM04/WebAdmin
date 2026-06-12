import React, { useState } from 'react';
import { Carousel, Empty } from 'antd';
import { PlayCircleOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';
import { transformDriveUrl } from '../SalePro/components/saleProFormat';

/**
 * Trang "Tổng quan" của chi tiết dự án — layout kiểu landing (bám sát salepro.com).
 * Mọi dữ liệu lấy từ project.details (JSONB) + buildings + managingAgent.
 */
export const ProjectOverview = ({ details = {}, buildings = [], agent, projectName }) => {
  const heroImages = (details.heroImages && details.heroImages.length)
    ? details.heroImages
    : [details.bannerImageUrl].filter(Boolean);
  const products = details.products || [];
  const amenities = details.amenities || [];
  const bullets = details.overviewBullets || [];

  const mpTabs = (details.masterplanTabs && details.masterplanTabs.length)
    ? details.masterplanTabs
    : [
        ...(details.masterplanImageUrl ? [{ label: 'Mặt bằng tổng thể', image: details.masterplanImageUrl }] : []),
        ...buildings.filter((b) => b.imageUrl).map((b) => ({ label: `MB Tòa ${b.buildingName}`, image: b.imageUrl })),
      ];
  const [mpIdx, setMpIdx] = useState(0);

  const overviewBg = details.masterplanImageUrl || details.bannerImageUrl
    || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600';

  const SectionTitle = ({ title, sub }) => (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h2>
      {sub && <div style={{ color: '#94a3b8', marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      {/* 1. Hero carousel */}
      {heroImages.length > 0 && (
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.25)' }}>
          <Carousel autoplay arrows dots>
            {heroImages.map((img, i) => (
              <div key={i}>
                <div style={{ height: 460, width: '100%' }}>
                  <img src={transformDriveUrl(img)} alt={`hero-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}

      {/* 2. 3 thẻ số liệu */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          { icon: '🏢', label: 'Sản phẩm', value: details.productCount || '—' },
          { icon: '📜', label: 'Sở hữu', value: details.ownership || '—' },
          { icon: '📐', label: 'Diện tích', value: details.totalProjectArea || '—' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7f1d1d' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Tổng quan dự án (overlay xanh trên ảnh) */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 320 }}>
        <img src={transformDriveUrl(overviewBg)} alt="overview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'relative', background: 'rgba(6,46,38,0.82)', color: '#fff', padding: '40px 44px', minHeight: 320 }}>
          <h2 style={{ color: '#fbbf24', fontSize: '1.6rem', fontWeight: 800, marginTop: 0, marginBottom: 20 }}>Tổng quan dự án</h2>
          {bullets.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: '1rem', lineHeight: 1.6 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>›</span> {b}
                </li>
              ))}
            </ul>
          ) : (details.overview && <p style={{ lineHeight: 1.8 }}>{details.overview}</p>)}
        </div>
      </div>

      {/* 4. Mặt bằng */}
      {mpTabs.length > 0 && (
        <div>
          <SectionTitle title="Mặt bằng" sub="Thiết kế tổ chức kiến trúc" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            {mpTabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setMpIdx(i)}
                style={{
                  padding: '8px 20px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
                  border: '1px solid #d4af37',
                  background: i === mpIdx ? 'linear-gradient(135deg,#d4af37,#bda028)' : '#fff',
                  color: i === mpIdx ? '#fff' : '#7c5e10',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img src={transformDriveUrl(mpTabs[mpIdx]?.image)} alt="masterplan" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      )}

      {/* 5. Sản phẩm */}
      {products.length > 0 && (
        <div>
          <SectionTitle title="Sản phẩm" sub="Đa dạng loại căn hộ mọi nhu cầu" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {products.map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: (p.images || []).length > 1 ? '1fr 1fr' : '1fr', gap: 4, padding: 8, background: '#f8fafc' }}>
                  {(p.images || []).slice(0, 4).map((img, j) => (
                    <img key={j} src={transformDriveUrl(img)} alt={`${p.name}-${j}`} style={{ width: '100%', height: 120, objectFit: 'contain', background: '#fff', borderRadius: 6 }} />
                  ))}
                </div>
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  {p.areaRange && <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>Diện tích: {p.areaRange}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Banner video đặc trưng */}
      {(details.featureTitle || details.featureImage || details.featureVideoUrl) && (
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', background: '#0b3a2e', borderRadius: 16, overflow: 'hidden', padding: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, color: '#fff' }}>
            <h3 style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase', marginTop: 0 }}>
              {details.featureTitle || projectName}
            </h3>
            {details.featureDescription && <p style={{ lineHeight: 1.8, opacity: 0.92 }}>{details.featureDescription}</p>}
          </div>
          <div style={{ flex: 1, minWidth: 280, position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
            {details.featureImage && <img src={transformDriveUrl(details.featureImage)} alt="feature" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
            {details.featureVideoUrl && (
              <a href={details.featureVideoUrl} target="_blank" rel="noreferrer"
                 style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 56 }}>
                <PlayCircleOutlined />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 7. Tiện ích */}
      {amenities.length > 0 && (
        <div>
          <SectionTitle title="Tiện ích" sub="Hệ thống tiện ích đẳng cấp" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {amenities.map((a, i) => (
              <div key={i} style={{ position: 'relative', height: 180, borderRadius: 12, overflow: 'hidden' }}>
                <img src={transformDriveUrl(a.image)} alt={a.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,46,38,0.85), rgba(6,46,38,0.05))' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, color: '#fff', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', fontSize: '0.85rem' }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Liên hệ tư vấn */}
      {agent && (
        <div>
          <SectionTitle title="Liên hệ tư vấn" sub="Đội ngũ chuyên viên sẵn sàng hỗ trợ bạn 24/7" />
          <div style={{ maxWidth: 360, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <img src={agent.avatarUrl || 'https://i.pravatar.cc/120'} alt={agent.fullName}
                 style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4af37' }} />
            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 12 }}>{agent.fullName}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{agent.title || 'Chuyên viên tư vấn'}</div>
            {agent.phone && <div style={{ fontWeight: 800, color: '#7f1d1d', fontSize: '1.3rem', margin: '12px 0' }}>{agent.phone}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="saleweb-btn saleweb-btn-primary" style={{ padding: '8px 20px' }}>
                  <PhoneOutlined /> &nbsp;Liên hệ
                </a>
              )}
              {agent.zaloLink && (
                <a href={agent.zaloLink} target="_blank" rel="noreferrer" className="saleweb-btn" style={{ padding: '8px 20px', background: '#2563eb', color: '#fff' }}>
                  <MessageOutlined /> &nbsp;Zalo
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {heroImages.length === 0 && bullets.length === 0 && products.length === 0 && amenities.length === 0 && (
        <Empty description="Chưa có nội dung tổng quan cho dự án này" />
      )}
    </div>
  );
};

export default ProjectOverview;
