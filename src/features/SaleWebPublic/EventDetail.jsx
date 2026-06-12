import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Spin, Empty, Button, message, Image } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, ShareAltOutlined, FacebookOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { eventApi } from './saleWebApi';
import { formatEventTime, eventStatusLabel, eventTypeLabel } from './EventList';
import '../../SaleWeb.css';

// Countdown hook
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

export const EventDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await eventApi.getById(id);
        if (active) setEvent(data);
        // Load related events
        const relRes = await eventApi.list({ size: 4 }).catch(() => null);
        if (active) {
          setRelatedEvents((relRes?.content || []).filter(e => e.id !== data?.id).slice(0, 3));
        }
      } catch (e) {
        if (active) message.error('Không thể tải chi tiết sự kiện.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const countdown = useCountdown(event?.startTime);
  const isUpcoming = event ? new Date(event.startTime) > new Date() : false;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết sự kiện!');
    } catch {
      message.warning('Trình duyệt không cho phép truy cập clipboard.');
    }
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return <div className="saleweb-container" style={{ padding: '80px 0', textAlign: 'center' }}><Spin size="large" /></div>;
  }
  if (!event) {
    return <div className="saleweb-container" style={{ padding: '60px 0' }}><Empty description="Không tìm thấy sự kiện" /></div>;
  }

  const gallery = event.galleryImages || [];

  return (
    <div className="saleweb-container animate-fade-in-up" style={{ padding: '16px 24px 40px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/events">Sự kiện</Link> },
          { title: event.title },
        ]}
      />

      {/* Hero Banner */}
      <div className="sw-event-detail-hero">
        <img src={event.bannerImage} alt={event.title} />
        <div className="sw-event-detail-hero-overlay">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className={`sw-event-type-badge ${event.eventType?.toLowerCase() || 'general'}`} style={{ position: 'static' }}>
              {eventTypeLabel(event.eventType)}
            </span>
            <span className={`sw-event-status-badge ${event.status?.toLowerCase() || 'upcoming'}`} style={{ position: 'static' }}>
              <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
              {eventStatusLabel(event.status)}
            </span>
          </div>
          <h1>{event.title}</h1>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.9 }}>
            <span><CalendarOutlined style={{ marginRight: '6px' }} />{formatEventTime(event.startTime, event.endTime)}</span>
            <span><EnvironmentOutlined style={{ marginRight: '6px' }} />{event.location}</span>
          </div>
        </div>
      </div>

      {/* Countdown (if upcoming) */}
      {isUpcoming && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', borderRadius: '16px' }}>
          {[
            { v: countdown.days, l: 'Ngày' },
            { v: countdown.hours, l: 'Giờ' },
            { v: countdown.minutes, l: 'Phút' },
            { v: countdown.seconds, l: 'Giây' },
          ].map((u, i) => (
            <div key={i} className="sw-countdown-unit" style={{ minWidth: '80px', padding: '18px 20px' }}>
              <div className="sw-countdown-num" style={{ fontSize: '2.2rem' }}>{u.v}</div>
              <div className="sw-countdown-label">{u.l}</div>
            </div>
          ))}
        </div>
      )}

      <div className="sw-event-detail-flex" style={{ flexWrap: 'wrap' }}>
        {/* Left Column (Content) */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {/* Share Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div className="sw-share-bar">
              <button className="sw-share-btn facebook" onClick={handleShareFacebook}>
                <FacebookOutlined /> Facebook
              </button>
              <button className="sw-share-btn" onClick={handleShare}>
                <LinkOutlined /> Sao chép link
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #e2e8f0', marginBottom: '28px' }}>
            <div
              style={{ padding: '12px 4px', fontWeight: 700, cursor: 'pointer', color: activeTab === 'overview' ? '#1e40af' : '#64748b', borderBottom: activeTab === 'overview' ? '3px solid #1e40af' : '3px solid transparent', fontSize: '0.95rem', transition: 'all 0.2s' }}
              onClick={() => setActiveTab('overview')}
            >
              TỔNG QUAN
            </div>
            {gallery.length > 0 && (
              <div
                style={{ padding: '12px 4px', fontWeight: 700, cursor: 'pointer', color: activeTab === 'gallery' ? '#1e40af' : '#64748b', borderBottom: activeTab === 'gallery' ? '3px solid #1e40af' : '3px solid transparent', fontSize: '0.95rem', transition: 'all 0.2s' }}
                onClick={() => setActiveTab('gallery')}
              >
                THƯ VIỆN ({gallery.length})
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div>
              {/* Description */}
              {event.description ? (
                <div
                  className="sw-article-content"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nội dung sự kiện đang được cập nhật...</p>
                </div>
              )}

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div style={{ marginTop: '48px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #d4af37', display: 'inline-block', paddingBottom: 8, marginBottom: 24, textTransform: 'uppercase' }}>
                    Sự kiện khác
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {relatedEvents.map((ev) => (
                      <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="sw-event-card" style={{ height: '100%' }}>
                          <div className="sw-event-card-img" style={{ height: '160px' }}>
                            <img src={ev.bannerImage} alt={ev.title} />
                            <span className={`sw-event-status-badge ${ev.status?.toLowerCase() || 'upcoming'}`}>
                              <span style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
                              {eventStatusLabel(ev.status)}
                            </span>
                          </div>
                          <div style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <CalendarOutlined style={{ marginRight: '4px' }} />{formatEventTime(ev.startTime)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Image.PreviewGroup>
                {gallery.map((img, idx) => (
                  <Image key={idx} src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', borderRadius: '12px', height: '220px', objectFit: 'cover', cursor: 'pointer' }} />
                ))}
              </Image.PreviewGroup>
            </div>
          )}
        </div>

        {/* Right Column (Info Widget) */}
        <div className="sw-event-detail-sidebar">
          <div className="sw-event-info-widget">
            <h3>📋 Thông tin sự kiện</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 18px', borderRadius: '999px', border: `1px solid ${event.eventType === 'TRAINING' ? '#2563eb' : '#7c3aed'}`, color: event.eventType === 'TRAINING' ? '#2563eb' : '#7c3aed', fontSize: '0.78rem', fontWeight: 700 }}>
                {eventTypeLabel(event.eventType)}
              </div>
              <div style={{ padding: '6px 18px', borderRadius: '999px', border: '1px solid #94a3b8', color: '#475569', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: event.status === 'ENDED' ? '#94a3b8' : event.status === 'ONGOING' ? '#f59e0b' : '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                {eventStatusLabel(event.status)}
              </div>
            </div>

            <div className="sw-event-info-row">
              <div className="sw-event-info-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <CalendarOutlined />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>THỜI GIAN</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {formatEventTime(event.startTime, event.endTime)}
                </div>
              </div>
            </div>

            <div className="sw-event-info-row">
              <div className="sw-event-info-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                <EnvironmentOutlined />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>ĐỊA ĐIỂM</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{event.location || '—'}</div>
              </div>
            </div>

            <div className="sw-event-info-row" style={{ marginBottom: 0 }}>
              <div className="sw-event-info-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                <TeamOutlined />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>QUY MÔ</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {event.participantCount || 0} người tham gia
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="sw-event-stats-grid">
              <div className="sw-event-stat-box">
                <div className="sw-event-stat-num">{event.participantCount ?? 0}</div>
                <div className="sw-event-stat-label">Đăng ký</div>
              </div>
              <div className="sw-event-stat-box">
                <div className="sw-event-stat-num">{event.checkinCount ?? 0}</div>
                <div className="sw-event-stat-label">Đã check-in</div>
              </div>
            </div>

            {/* CTA Button */}
            {event.status !== 'ENDED' && (
              <Button
                type="primary"
                size="large"
                block
                style={{
                  marginTop: '20px',
                  height: '50px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                {event.status === 'ONGOING' ? 'THAM GIA NGAY' : 'ĐĂNG KÝ THAM GIA'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
