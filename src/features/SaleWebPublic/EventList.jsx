import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, DatePicker, Button, Spin, Empty, Pagination, message } from 'antd';
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { eventApi } from './saleWebApi';
import { transformDriveUrl } from '../SalePro/components/saleProFormat';
import '../../SaleWeb.css';

const { Option } = Select;

const PAGE_SIZE = 9;

export const formatEventTime = (start, end) => {
  const fmt = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const p = (x) => String(x).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const s = fmt(start);
  const e = fmt(end);
  return e ? `${s} - ${e}` : s;
};

export const eventStatusLabel = (status) => {
  const map = { UPCOMING: 'SẮP DIỄN RA', ONGOING: 'ĐANG DIỄN RA', ENDED: 'ĐÃ KẾT THÚC' };
  return map[status] || status;
};
export const eventTypeLabel = (type) => (type === 'TRAINING' ? 'ĐÀO TẠO' : 'SỰ KIỆN CHUNG');

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

// Hero component cho sự kiện upcoming gần nhất
const EventHero = ({ event }) => {
  const countdown = useCountdown(event.startTime);
  const isUpcoming = new Date(event.startTime) > new Date();

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="sw-event-hero">
        <img src={transformDriveUrl(event.bannerImage)} alt={event.title} />
        <div className="sw-event-hero-overlay">
          <div className="sw-event-hero-content">
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <span className={`sw-event-status-badge ${event.status?.toLowerCase() || 'upcoming'}`} style={{ position: 'static' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }}></span>
                {eventStatusLabel(event.status)}
              </span>
              <span className={`sw-event-type-badge ${event.eventType?.toLowerCase() || 'general'}`} style={{ position: 'static' }}>
                {eventTypeLabel(event.eventType)}
              </span>
            </div>
            <h2>{event.title}</h2>
            <p style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <span><CalendarOutlined style={{ marginRight: '6px' }} />{formatEventTime(event.startTime, event.endTime)}</span>
              <span><EnvironmentOutlined style={{ marginRight: '6px' }} />{event.location}</span>
              {event.participantCount > 0 && <span><TeamOutlined style={{ marginRight: '6px' }} />{event.participantCount} người tham gia</span>}
            </p>
          </div>

          {isUpcoming && (
            <div className="sw-event-countdown">
              <div className="sw-countdown-unit">
                <div className="sw-countdown-num">{countdown.days}</div>
                <div className="sw-countdown-label">Ngày</div>
              </div>
              <div className="sw-countdown-unit">
                <div className="sw-countdown-num">{countdown.hours}</div>
                <div className="sw-countdown-label">Giờ</div>
              </div>
              <div className="sw-countdown-unit">
                <div className="sw-countdown-num">{countdown.minutes}</div>
                <div className="sw-countdown-label">Phút</div>
              </div>
              <div className="sw-countdown-unit">
                <div className="sw-countdown-num">{countdown.seconds}</div>
                <div className="sw-countdown-label">Giây</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Mini countdown cho card
const MiniCountdown = ({ targetDate }) => {
  const countdown = useCountdown(targetDate);
  if (!targetDate || new Date(targetDate) <= new Date()) return null;
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
      {[
        { v: countdown.days, l: 'ngày' },
        { v: countdown.hours, l: 'giờ' },
        { v: countdown.minutes, l: 'phút' },
      ].map((u, i) => (
        <div key={i} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '48px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1' }}>{u.v}</div>
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{u.l}</div>
        </div>
      ))}
    </div>
  );
};

// Strip HTML for plain text preview
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').substring(0, 150);
};

export const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all-type');
  const [status, setStatus] = useState('all-status');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await eventApi.list({
          q: q || undefined,
          type: type === 'all-type' ? undefined : type,
          status: status === 'all-status' ? undefined : status,
          from: from ? from.format('YYYY-MM-DD') : undefined,
          to: to ? to.format('YYYY-MM-DD') : undefined,
          page: page - 1,
          size: PAGE_SIZE,
        });
        if (!active) return;
        setEvents(res?.content || []);
        setTotal(res?.totalElements || 0);
      } catch (e) {
        if (active) message.error('Không thể tải danh sách sự kiện.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [q, type, status, from, to, page]);

  // Hero = sự kiện UPCOMING gần nhất (chỉ trang 1, không filter)
  const showHero = page === 1 && !q && type === 'all-type' && status === 'all-status' && !from && !to;
  const heroEvent = showHero ? events.find(e => e.status === 'UPCOMING' || e.status === 'ONGOING') : null;
  const gridEvents = heroEvent ? events.filter(e => e.id !== heroEvent.id) : events;

  return (
    <div className="saleweb-container animate-fade-in-up" style={{ padding: '16px 24px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link> / Sự kiện
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Sự kiện <span style={{ color: '#d4af37' }}>nổi bật</span>
        </h1>
      </div>

      {/* Hero Event */}
      {heroEvent && heroEvent.bannerImage && (
        <EventHero event={heroEvent} />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#fff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <Input
          placeholder="Tìm kiếm sự kiện..."
          prefix={<SearchOutlined />}
          style={{ flex: 1, minWidth: 200, borderRadius: '8px' }}
          allowClear
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <Select value={type} style={{ width: '180px' }} onChange={(v) => { setPage(1); setType(v); }}>
          <Option value="all-type">Tất cả loại</Option>
          <Option value="GENERAL">Sự kiện chung</Option>
          <Option value="TRAINING">Đào tạo</Option>
        </Select>
        <Select value={status} style={{ width: '180px' }} onChange={(v) => { setPage(1); setStatus(v); }}>
          <Option value="all-status">Tất cả trạng thái</Option>
          <Option value="UPCOMING">Sắp diễn ra</Option>
          <Option value="ONGOING">Đang diễn ra</Option>
          <Option value="ENDED">Đã kết thúc</Option>
        </Select>
        <DatePicker placeholder="Từ ngày" style={{ width: '160px' }} format="DD/MM/YYYY" onChange={(d) => { setPage(1); setFrom(d); }} />
        <DatePicker placeholder="Đến ngày" style={{ width: '160px' }} format="DD/MM/YYYY" onChange={(d) => { setPage(1); setTo(d); }} />
      </div>

      {/* Event Cards Grid */}
      <Spin spinning={loading}>
        {gridEvents.length === 0 && !loading ? (
          <Empty description="Không có sự kiện phù hợp" style={{ padding: '60px 0' }} />
        ) : (
          <div className="sw-event-grid">
            {gridEvents.map((event) => (
              <div key={event.id} className="sw-event-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                <div className="sw-event-card-img">
                  <img src={transformDriveUrl(event.thumbnail || event.bannerImage)} alt={event.title} />
                  <span className={`sw-event-status-badge ${event.status?.toLowerCase() || 'upcoming'}`}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
                    {eventStatusLabel(event.status)}
                  </span>
                  <span className={`sw-event-type-badge ${event.eventType?.toLowerCase() || 'general'}`}>
                    {eventTypeLabel(event.eventType)}
                  </span>
                </div>

                <div className="sw-event-card-body">
                  <h3 className="sw-event-card-title">
                    {event.title}
                  </h3>

                  <div className="sw-event-card-info">
                    <CalendarOutlined style={{ marginTop: '3px', color: '#3b82f6', flexShrink: 0 }} />
                    <span>{formatEventTime(event.startTime, event.endTime)}</span>
                  </div>

                  <div className="sw-event-card-info">
                    <EnvironmentOutlined style={{ marginTop: '3px', color: '#ef4444', flexShrink: 0 }} />
                    <span>{event.location}</span>
                  </div>

                  {/* Description preview */}
                  {event.description && (
                    <div className="sw-event-card-desc">
                      {stripHtml(event.description)}
                    </div>
                  )}

                  {/* Countdown for upcoming */}
                  {(event.status === 'UPCOMING' || event.status === 'ONGOING') && (
                    <MiniCountdown targetDate={event.startTime} />
                  )}

                  <Link to={`/events/${event.id}`} style={{ marginTop: 'auto' }}>
                    <Button block size="large" style={{
                      background: event.status === 'ENDED' ? '#94a3b8' : event.status === 'ONGOING' ? '#f59e0b' : '#10b981',
                      color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}>
                      {event.status === 'ENDED' ? 'XEM CHI TIẾT' : event.status === 'ONGOING' ? 'ĐANG DIỄN RA' : 'XEM & ĐĂNG KÝ'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
          <Pagination current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} onChange={setPage} />
        </div>
      )}
    </div>
  );
};
