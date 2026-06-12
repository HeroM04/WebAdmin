import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, Spin, Empty } from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled, EnvironmentOutlined } from '@ant-design/icons';
import { saleProApi } from '../SalePro/api/saleProApi';
import '../../SaleWeb.css';

const FAV_KEY = 'salepro_project_favorites';
const readFavs = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
};

const TYPE_LABELS = { CAO_TANG: 'DỰ ÁN CAO TẦNG', THAP_TANG: 'DỰ ÁN THẤP TẦNG' };
const STATUS_LABELS = { SAP_MO_BAN: 'Sắp mở bán', DANG_BAN: 'Đang bán', DA_HET_HANG: 'Đã hết hàng' };
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800';

export const SaleWebHome = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(readFavs());

  // Bộ lọc
  const [q, setQ] = useState('');
  const [developer, setDeveloper] = useState(null);
  const [area, setArea] = useState(null);
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;
    saleProApi.getAllProjects()
      .then((d) => { if (active) setProjects(d || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const toggleFav = (id) => {
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  // Option bộ lọc sinh từ dữ liệu thật
  const developerOptions = useMemo(() => {
    const set = new Set(projects.map((p) => p.details?.developer).filter(Boolean));
    return Array.from(set).map((v) => ({ value: v, label: v }));
  }, [projects]);

  const areaOptions = useMemo(() => {
    const set = new Set(
      projects.map((p) => {
        const addr = p.details?.address || '';
        const parts = addr.split(',');
        return parts[parts.length - 1]?.trim();
      }).filter(Boolean)
    );
    return Array.from(set).map((v) => ({ value: v, label: v }));
  }, [projects]);

  const filtered = projects.filter((p) => {
    const d = p.details || {};
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (developer && d.developer !== developer) return false;
    if (area && !(d.address || '').toLowerCase().includes(area.toLowerCase())) return false;
    if (type && p.projectType !== type) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  // Sidebar "Dự án đang bán chạy" — tự sinh từ dữ liệu dự án (admin quản lý qua Quản lý Dự án)
  const selling = projects.filter((p) => p.status !== 'DA_HET_HANG');
  const highRise = selling.filter((p) => p.projectType === 'CAO_TANG').slice(0, 5);
  const lowRise = selling.filter((p) => p.projectType === 'THAP_TANG').slice(0, 5);
  const newest = [...projects].sort((a, b) => b.id - a.id).slice(0, 3);

  const SidebarList = ({ items }) => (
    <ul className="sw-sidebar-list">
      {items.length === 0 && <li style={{ color: '#94a3b8', cursor: 'default' }}>Chưa có dự án</li>}
      {items.map((p) => (
        <li key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>{p.name}</li>
      ))}
    </ul>
  );

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
            allowClear
            onChange={(e) => setQ(e.target.value)}
          />
          <Select placeholder="Chọn chủ đầu tư" style={{ width: 190 }} allowClear options={developerOptions} onChange={setDeveloper} />
          <Select placeholder="Chọn khu vực" style={{ width: 170 }} allowClear options={areaOptions} onChange={setArea} />
          <Select placeholder="Chọn loại hình" style={{ width: 170 }} allowClear onChange={setType}
            options={[{ value: 'CAO_TANG', label: 'Cao tầng' }, { value: 'THAP_TANG', label: 'Thấp tầng' }]} />
          <Select placeholder="Chọn trạng thái" style={{ width: 170 }} allowClear onChange={setStatus}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Column - Grid: 3 dự án / hàng */}
        <div style={{ flex: 1 }}>
          <Spin spinning={loading}>
            {filtered.length === 0 && !loading ? (
              <Empty description="Không có dự án phù hợp" style={{ padding: '60px 0' }} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {filtered.map((p) => {
                  const d = p.details || {};
                  const img = (d.heroImages && d.heroImages[0]) || d.bannerImageUrl || FALLBACK_IMG;
                  return (
                    <div key={p.id} className="sw-project-card">
                      <div className="sw-card-img-wrap">
                        <img src={img} alt={p.name} className="sw-card-img" />
                        <div className="sw-card-badges">
                          <span className={`sw-badge ${p.projectType === 'CAO_TANG' ? 'sw-badge-blue' : 'sw-badge-orange'}`}>
                            {TYPE_LABELS[p.projectType] || p.projectType}
                          </span>
                        </div>
                        <div className="sw-card-fav" onClick={() => toggleFav(p.id)}>
                          {favorites.includes(p.id) ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                        </div>
                        {d.isHot && <div className="sw-badge-hot">🔥 HOT</div>}
                      </div>

                      <div className="sw-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Link to={`/projects/${p.id}`} className="sw-card-title">{p.name}</Link>
                          <Link to={`/projects/${p.id}`} style={{ color: '#d4af37', fontSize: '18px' }}>↗</Link>
                        </div>
                        <p className="sw-card-desc">{d.featureTitle || d.overview || '—'}</p>
                        <div className="sw-card-loc">
                          <EnvironmentOutlined /> {d.address || 'Đang cập nhật'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Spin>
        </div>

        {/* Right Column - Sidebar (tự sinh từ dữ liệu dự án) */}
        <div style={{ width: '300px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ background: '#1e40af', color: '#fff', padding: '14px', fontWeight: 'bold', textAlign: 'center', fontSize: '15px' }}>
            DỰ ÁN ĐANG BÁN CHẠY
          </div>

          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">🏢 Dự án Cao Tầng</div>
            <SidebarList items={highRise} />
          </div>

          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">🏘️ Dự án Thấp Tầng</div>
            <SidebarList items={lowRise} />
          </div>

          <div className="sw-sidebar-group">
            <div className="sw-sidebar-title">⭐ Dự án Mới nhất</div>
            <SidebarList items={newest} />
          </div>
        </div>
      </div>
    </div>
  );
};
