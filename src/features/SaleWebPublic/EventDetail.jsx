import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Spin, Empty, message } from 'antd';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { eventApi } from './saleWebApi';
import { formatEventTime, eventStatusLabel, eventTypeLabel } from './EventList';
import '../../SaleWeb.css';

export const EventDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await eventApi.getById(id);
        if (active) setEvent(data);
      } catch (e) {
        if (active) message.error('Không thể tải chi tiết sự kiện.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="saleweb-container" style={{ padding: '80px 0', textAlign: 'center' }}><Spin size="large" /></div>;
  }
  if (!event) {
    return <div className="saleweb-container" style={{ padding: '60px 0' }}><Empty description="Không tìm thấy sự kiện" /></div>;
  }

  const gallery = event.galleryImages || [];

  return (
    <div className="saleweb-container" style={{ padding: '16px 24px 24px' }}>
      <Breadcrumb
        style={{ marginBottom: '14px' }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/events">Sự kiện</Link> },
          { title: event.title },
        ]}
      />

      <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
        <img src={event.bannerImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column (Content) */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.3, marginBottom: '24px', textTransform: 'uppercase' }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div
              style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'overview' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent' }}
              onClick={() => setActiveTab('overview')}
            >
              TỔNG QUAN
            </div>
            {gallery.length > 0 && (
              <div
                style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'gallery' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'gallery' ? '2px solid #2563eb' : '2px solid transparent' }}
                onClick={() => setActiveTab('gallery')}
              >
                THƯ VIỆN
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div
              style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.05rem' }}
              dangerouslySetInnerHTML={{ __html: event.description || '<p>Đang cập nhật nội dung sự kiện.</p>' }}
            />
          )}

          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {gallery.map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', borderRadius: '8px', height: '200px', objectFit: 'cover' }} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Info Widget) */}
        <div style={{ width: '350px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase' }}>THÔNG TIN SỰ KIỆN:</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid #7c3aed', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 'bold' }}>{eventTypeLabel(event.eventType)}</div>
              <div style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid #94a3b8', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: event.status === 'ENDED' ? '#94a3b8' : '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                {eventStatusLabel(event.status)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', marginBottom: '16px', fontSize: '0.95rem' }}>
              <CalendarOutlined style={{ marginTop: '4px', color: '#3b82f6' }} />
              <div><span style={{ fontWeight: 'bold', color: '#334155' }}>Thời gian:</span> {formatEventTime(event.startTime, event.endTime)}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', marginBottom: '24px', fontSize: '0.95rem' }}>
              <EnvironmentOutlined style={{ marginTop: '4px', color: '#ef4444' }} />
              <div><span style={{ fontWeight: 'bold', color: '#334155' }}>Địa điểm:</span> {event.location}</div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>{event.participantCount ?? 0}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginTop: '4px' }}>NGƯỜI THAM GIA</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>{event.checkinCount ?? 0}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginTop: '4px' }}>ĐÃ CHECK-IN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
