import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Select, DatePicker, Button, Spin, Empty, Pagination, message } from 'antd';
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { eventApi } from './saleWebApi';
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

export const eventStatusLabel = (status) => (status === 'UPCOMING' ? 'SẮP DIỄN RA' : 'ĐÃ KẾT THÚC');
export const eventTypeLabel = (type) => (type === 'TRAINING' ? 'ĐÀO TẠO' : 'SỰ KIỆN CHUNG');

export const EventList = () => {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // antd Pagination is 1-based
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

  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Trang chủ / Sự kiện</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
          SỰ KIỆN
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
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
          <Option value="ENDED">Đã kết thúc</Option>
        </Select>
        <DatePicker placeholder="Từ ngày" style={{ width: '160px' }} format="DD/MM/YYYY" onChange={(d) => { setPage(1); setFrom(d); }} />
        <DatePicker placeholder="Đến ngày" style={{ width: '160px' }} format="DD/MM/YYYY" onChange={(d) => { setPage(1); setTo(d); }} />
      </div>

      <Spin spinning={loading}>
        {events.length === 0 && !loading ? (
          <Empty description="Không có sự kiện phù hợp" style={{ padding: '60px 0' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {events.map((event) => (
              <div key={event.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', height: '220px' }}>
                  <img src={event.bannerImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', background: event.status === 'ENDED' ? '#94a3b8' : '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                    {eventStatusLabel(event.status)}
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: event.eventType === 'TRAINING' ? '#2563eb' : '#7c3aed', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {eventTypeLabel(event.eventType)}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/events/${event.id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.4, minHeight: '46px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.title}
                    </h3>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' }}>
                    <CalendarOutlined style={{ marginTop: '3px', color: '#3b82f6' }} />
                    <span>{formatEventTime(event.startTime, event.endTime)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
                    <EnvironmentOutlined style={{ marginTop: '3px', color: '#ef4444' }} />
                    <span>{event.location}</span>
                  </div>

                  <Link to={`/events/${event.id}`}>
                    <Button block size="large" style={{ background: event.status === 'ENDED' ? '#94a3b8' : '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
                      {eventStatusLabel(event.status)}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Pagination current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} onChange={setPage} />
        </div>
      )}
    </div>
  );
};
