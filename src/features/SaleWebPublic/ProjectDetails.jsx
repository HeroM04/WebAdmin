import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Table, Timeline, Checkbox, List, Select, Tag, message, Spin, Empty, Input } from 'antd';
import {
  HomeOutlined, ShareAltOutlined, PlayCircleOutlined, EnvironmentOutlined, ReadOutlined,
  PictureOutlined, TableOutlined, CameraOutlined, FileDoneOutlined, FieldTimeOutlined,
  FileTextOutlined, CloudDownloadOutlined, CloseOutlined, ExportOutlined, EyeOutlined, SearchOutlined,
} from '@ant-design/icons';
import { CompareContext } from '../../context/CompareContext';
import { saleProApi } from '../SalePro/api/saleProApi';
import { newsApi } from './saleWebApi';
import { formatNewsDate } from './NewsList';
import UnitDetailModal from '../SalePro/components/UnitDetailModal';
import BuildingDetailModal from '../SalePro/components/BuildingDetailModal';
import { ProjectOverview } from './ProjectOverview';
import {
  getStatusMeta, formatDirection, formatApartmentType, formatBillion, formatArea, toCompareItem,
} from '../SalePro/components/saleProFormat';
import '../../SaleWeb.css';

const ALL_TABS = [
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
  { id: 'news', icon: <ReadOutlined />, label: 'Tin tức' },
];

const PAGE_SIZE = 10;

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useContext(CompareContext);

  const [project, setProject] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  // Quỹ căn (server-side paging/filter/sort)
  const [apts, setApts] = useState([]);
  const [aptTotal, setAptTotal] = useState(0);
  const [aptLoading, setAptLoading] = useState(false);
  const [aptPage, setAptPage] = useState(1);
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [codeSearch, setCodeSearch] = useState('');
  const [sortBy, setSortBy] = useState('apartmentCode');
  const [sortDir, setSortDir] = useState('asc');

  // Lazy data theo tab
  const [progress, setProgress] = useState([]);
  const [progressIdx, setProgressIdx] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [projectNews, setProjectNews] = useState([]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      try {
        const [proj, blds] = await Promise.all([
          saleProApi.getProjectById(id),
          saleProApi.getBuildingsByProjectId(id),
        ]);
        if (!active) return;
        setProject(proj);
        setBuildings(blds || []);
      } catch (e) {
        if (active) message.error('Không thể tải dữ liệu dự án từ máy chủ.');
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const projectName = project?.name || 'Đang tải...';
  const details = project?.details || {};
  const isLowRise = project?.projectType === 'THAP_TANG';
  const tabs = ALL_TABS.filter((t) => !(t.id === 'buildings' && isLowRise));

  // ===== Quỹ căn fetch =====
  const fetchApartments = useCallback(async () => {
    if (!id) return;
    setAptLoading(true);
    try {
      const res = await saleProApi.searchApartments(id, {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        buildingId: buildingFilter === 'ALL' ? undefined : buildingFilter,
        q: codeSearch || undefined,
        page: aptPage - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      });
      setApts(res?.content || []);
      setAptTotal(res?.totalElements || 0);
    } catch (e) {
      message.error('Không thể tải quỹ căn.');
    } finally {
      setAptLoading(false);
    }
  }, [id, statusFilter, buildingFilter, codeSearch, aptPage, sortBy, sortDir]);

  useEffect(() => {
    if (activeTab === 'fund') fetchApartments();
  }, [activeTab, fetchApartments]);

  // ===== Lazy load các tab khác =====
  useEffect(() => {
    if (!id) return;
    if (activeTab === 'progress' && progress.length === 0) {
      saleProApi.getProjectProgress(id).then((d) => setProgress(d || [])).catch(() => {});
    }
    if (activeTab === 'docs' && documents.length === 0) {
      saleProApi.getProjectDocuments(id).then((d) => setDocuments(d || [])).catch(() => {});
    }
    if (activeTab === 'news' && projectNews.length === 0) {
      newsApi.list({ projectId: id, size: 12 }).then((d) => setProjectNews(d?.content || [])).catch(() => {});
    }
  }, [activeTab, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdated = (updated) => {
    setApts((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    setSelectedApartment((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const handleCheckboxChange = (record, checked) => {
    if (checked) addToCompare(toCompareItem(record), { name: projectName });
    else removeFromCompare(record.id);
  };

  const columns = [
    { title: 'Mã căn', dataIndex: 'apartmentCode', key: 'apartmentCode', sorter: true,
      render: (text, record) => <span style={{ color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setSelectedApartment(record)}>{text}</span> },
    { title: 'Giá bán', dataIndex: 'listedPrice', key: 'listedPrice', sorter: true, render: (v) => <b>{formatBillion(v)}</b> },
    { title: 'Loại hình', dataIndex: 'apartmentType', key: 'apartmentType', render: (v) => formatApartmentType(v) },
    { title: 'Hướng', dataIndex: 'direction', key: 'direction', render: (v) => formatDirection(v) },
    { title: 'Tầng', dataIndex: 'floor', key: 'floor' },
    { title: 'DT đất', dataIndex: 'landArea', key: 'landArea', render: (v) => formatArea(v) },
    { title: 'DT xây dựng', dataIndex: 'constructionArea', key: 'constructionArea', render: (v) => formatArea(v) },
    { title: 'Tòa / Phân khu', key: 'building', render: (_, r) => `${r.buildingName || ''}${r.subdivisionName ? ` · ${r.subdivisionName}` : ''}` },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: (status) => { const m = getStatusMeta(status); return <Tag style={{ color: m.color, background: m.bg, borderColor: m.border, fontWeight: 'bold', borderRadius: 6 }}>{m.label}</Tag>; } },
    { title: 'Chi tiết', key: 'detail', render: (_, record) => <Button size="small" onClick={() => setSelectedApartment(record)}>Chi tiết</Button> },
    { title: 'So sánh', key: 'action', align: 'center', render: (_, record) => <Checkbox checked={compareList.some((i) => i.id === record.id)} onChange={(e) => handleCheckboxChange(record, e.target.checked)} /> },
  ];

  const onTableChange = (pagination, _filters, sorter) => {
    if (pagination?.current) setAptPage(pagination.current);
    if (sorter && sorter.field) {
      setSortBy(sorter.field);
      setSortDir(sorter.order === 'descend' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="saleweb-container" style={{ padding: '14px 24px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <Breadcrumb
            style={{ marginBottom: '8px' }}
            items={[
              { title: <Link to="/">Trang chủ</Link> },
              { title: <Link to="/projects">Danh sách dự án</Link> },
              { title: projectName },
            ]}
          />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{projectName}</h1>
          <p style={{ color: '#475569', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Theo dõi thông tin chi tiết về bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán hàng dự án {projectName}.
          </p>
        </div>
        <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
      </div>

      {/* Tabs */}
      <div className="sw-detail-tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`sw-detail-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      <div className="sw-tab-content animate-fade-in-up">
        {/* ===== TỔNG QUAN ===== */}
        {activeTab === 'overview' && (
          <ProjectOverview details={details} buildings={buildings} agent={project?.managingAgent} projectName={projectName} />
        )}

        {/* ===== VỊ TRÍ ===== */}
        {activeTab === 'location' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#7f1d1d', fontWeight: 800 }}>BẢN ĐỒ VỊ TRÍ</h2>
              <h3 style={{ color: '#0f172a' }}>{projectName}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {details.locationDescription && <p style={{ lineHeight: 1.8, color: '#334155' }}>{details.locationDescription}</p>}
              {(details.connectionPoints || []).length > 0 && (
                <div className="sw-pd-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {details.connectionPoints.map((cp, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d4af37' }}>{cp.time}'</div>
                      <div style={{ color: '#334155', fontWeight: 600 }}>{cp.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {(() => {
                let mapUrl = details.mapEmbedUrl;
                let externalLink = null;
                if (mapUrl) {
                  if (mapUrl.includes('<iframe')) {
                    const match = mapUrl.match(/src=["']([^"']+)["']/i);
                    if (match) mapUrl = match[1];
                  }
                  mapUrl = mapUrl.replace(/&amp;/g, '&').trim();
                  
                  // Check if pb is clearly invalid (too short)
                  if (mapUrl.includes('pb=') && mapUrl.length < 50) {
                    mapUrl = null;
                  } else if (mapUrl && !mapUrl.includes('embed')) {
                    // Not an embed URL (e.g. google.com/maps/place/...), iframe will be blocked
                    externalLink = mapUrl;
                    mapUrl = null;
                  }
                }
                
                if (mapUrl) {
                  return (
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <iframe src={mapUrl} width="100%" height="500" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Map" />
                    </div>
                  );
                }
                if (details.latitude && details.longitude) {
                  const q = `${details.latitude},${details.longitude}`;
                  return (
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <iframe src={`https://maps.google.com/maps?q=${q}&hl=vi&z=15&output=embed`} width="100%" height="500" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Map" />
                    </div>
                  );
                }
                if (details.mapImageUrl) {
                  return (
                    <div>
                      <img src={details.mapImageUrl} alt="Map" style={{ width: '100%', borderRadius: 16, border: '1px solid #e2e8f0' }} />
                      {externalLink && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                          <a href={externalLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#e2e8f0', color: '#0f172a', borderRadius: 8, fontWeight: 600 }}>Xem bản đồ trên Google Maps</a>
                        </div>
                      )}
                    </div>
                  );
                }
                if (externalLink) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                      <p style={{ color: '#64748b', marginBottom: 16 }}>Bản đồ không thể hiển thị trực tiếp trên web do giới hạn từ Google.</p>
                      <a href={externalLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 24px', background: '#d4af37', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Mở bản đồ trên Google Maps</a>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {/* ===== ĐÀO TẠO ===== */}
        {activeTab === 'training' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#0f172a', fontWeight: 800 }}>{projectName}</h2></div>
            {details.trainingVideoUrl ? (
              <div style={{ maxWidth: 900, margin: '0 auto', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden' }}>
                <iframe src={details.trainingVideoUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen title="Training" />
              </div>
            ) : <Empty description="Chưa có tài liệu đào tạo" />}
          </div>
        )}

        {/* ===== MẶT BẰNG ===== */}
        {activeTab === 'masterplan' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#7f1d1d', fontWeight: 800 }}>MẶT BẰNG QUỸ CĂN</h2></div>
            {details.masterplanImageUrl ? (
              <div style={{ position: 'relative' }}>
                <img src={details.masterplanImageUrl} alt="Masterplan" style={{ width: '100%', borderRadius: 16, border: '1px solid #e2e8f0', display: 'block' }} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                  {buildings.map((b) => (
                    <button key={b.id} className="saleweb-btn saleweb-btn-primary" style={{ padding: '8px 16px' }} onClick={() => setSelectedBuildingId(b.id)}>
                      📍 Tòa {b.buildingName}
                    </button>
                  ))}
                </div>
              </div>
            ) : <Empty description="Chưa có mặt bằng" />}
          </div>
        )}

        {/* ===== TÒA NHÀ ===== */}
        {activeTab === 'buildings' && !isLowRise && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#0f172a', fontWeight: 800 }}>DANH SÁCH TÒA NHÀ</h2></div>
            {buildings.length === 0 ? <Empty description="Chưa có dữ liệu tòa nhà." /> : (
              <div className="sw-pd-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {buildings.map((b) => (
                  <div key={b.id} onClick={() => setSelectedBuildingId(b.id)}
                    style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: 180, background: '#e2e8f0' }}>
                      {b.imageUrl && <img src={b.imageUrl} alt={b.buildingName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>TÒA NHÀ</div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 12px' }}>{b.buildingName}</h3>
                      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PHÂN KHU</span>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.subdivisionName || '—'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>SỐ TẦNG</span>
                          <div style={{ fontWeight: 700, color: '#1e40af' }}>{b.totalFloors ?? '—'}</div>
                        </div>
                        <div style={{ flex: 1, background: '#dcfce7', borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>CÒN HÀNG</span>
                          <div style={{ fontWeight: 700, color: '#16a34a' }}>{b.availableCount ?? 0}/{b.apartmentCount ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== BẢNG HÀNG (project-level: mặt bằng + chọn tòa) ===== */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#0f172a', fontWeight: 800 }}>BẢNG HÀNG</h2></div>
            {details.masterplanImageUrl && (
              <img src={details.masterplanImageUrl} alt="Inventory map" style={{ width: '100%', borderRadius: 16, border: '1px solid #e2e8f0', display: 'block', marginBottom: 16 }} />
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {buildings.map((b) => (
                <button key={b.id} className="saleweb-btn saleweb-btn-primary" style={{ padding: '8px 16px' }} onClick={() => setSelectedBuildingId(b.id)}>
                  📍 Bảng hàng Tòa {b.buildingName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== QUỸ CĂN ===== */}
        {activeTab === 'fund' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800, margin: 0 }}>BẢNG HÀNG (QUỸ CĂN)</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Input placeholder="Tìm mã căn..." prefix={<SearchOutlined />} allowClear style={{ width: 180 }}
                  onChange={(e) => { setAptPage(1); setCodeSearch(e.target.value); }} />
                <Select value={buildingFilter} onChange={(v) => { setAptPage(1); setBuildingFilter(v); }} style={{ width: 200 }}
                  options={[{ value: 'ALL', label: 'Tất cả tòa nhà' }, ...buildings.map((b) => ({ value: b.id, label: `Tòa ${b.buildingName}${b.subdivisionName ? ` · ${b.subdivisionName}` : ''}` }))]} />
                <Select value={statusFilter} onChange={(v) => { setAptPage(1); setStatusFilter(v); }} style={{ width: 180 }}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'CON_HANG', label: 'Còn hàng' },
                    { value: 'QUY_DOC_QUYEN', label: 'Quỹ Độc quyền' },
                    { value: 'DA_BAN', label: 'Đã bán' },
                  ]} />
              </div>
            </div>
            <Table rowKey="id" columns={columns} dataSource={apts} loading={aptLoading} bordered scroll={{ x: 1200 }}
              pagination={{ current: aptPage, pageSize: PAGE_SIZE, total: aptTotal, showSizeChanger: false }}
              onChange={onTableChange} />
          </div>
        )}

        {/* ===== ẢNH 360 ===== */}
        {activeTab === '360' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#0f172a', fontWeight: 800 }}>TOÀN CẢNH DỰ ÁN</h2></div>
            <div className="sw-pd-flex-wrap" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 320 }}>
                {(details.images360 || []).length > 0 ? (
                  <div className="sw-pd-grid-2">
                    {details.images360.map((img, i) => (
                      <img key={i} src={img} alt={`360-${i}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    ))}
                  </div>
                ) : <Empty description="Chưa có ảnh 360" />}
              </div>
              <div className="sw-pd-sidebar" style={{ flex: 1, minWidth: 280, background: '#064e3b', color: '#fff', borderRadius: 12, padding: 24, height: 'fit-content' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8, marginBottom: 12 }}>THÔNG TIN TỔNG QUAN</div>
                <div style={{ fontSize: 13, lineHeight: 2.2 }}>
                  🏢 Tên dự án: {projectName}<br />
                  🏗 Nhà phát triển: {details.developer || '—'}<br />
                  📍 Vị trí: {details.address || '—'}<br />
                  📐 Tổng diện tích: {details.totalProjectArea || '—'}<br />
                  🏢 Quy mô: {details.scaleDescription || '—'}<br />
                  📊 Mật độ xây dựng: {details.constructionDensity || '—'}<br />
                  🏠 Loại hình: {details.apartmentTypes || '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CHÍNH SÁCH BÁN HÀNG ===== */}
        {activeTab === 'policy' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><h2 style={{ color: '#0f172a', fontWeight: 800 }}>CHÍNH SÁCH BÁN HÀNG</h2></div>
            {details.salesPolicy ? (
              <div style={{ background: '#13352c', padding: '40px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', lineHeight: 1.9 }}
                dangerouslySetInnerHTML={{ __html: details.salesPolicy }} />
            ) : <Empty description="Chưa có chính sách bán hàng" />}
          </div>
        )}

        {/* ===== TIẾN ĐỘ ===== */}
        {activeTab === 'progress' && (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '32px' }}>TIẾN ĐỘ DỰ ÁN</h2>
            {progress.length === 0 ? <Empty description="Chưa có dữ liệu tiến độ" /> : (
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ width: '260px' }}>
                  <Timeline
                    items={progress.map((p, i) => ({
                      color: i === progressIdx ? '#1e40af' : '#cbd5e1',
                      children: (
                        <div onClick={() => setProgressIdx(i)} style={{ cursor: 'pointer', background: i === progressIdx ? '#f1f5f9' : '#f8fafc', padding: '8px 16px', borderRadius: '4px', fontWeight: i === progressIdx ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span>{p.title}</span>
                          <span style={{ display: 'flex', gap: 8 }}>
                            <EyeOutlined onClick={() => setProgressIdx(i)} />
                            {p.externalUrl && <a href={p.externalUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><ExportOutlined /></a>}
                          </span>
                        </div>
                      ),
                    }))}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 320 }}>
                  <h3 style={{ marginBottom: '16px' }}>Hình ảnh tiến độ {progress[progressIdx]?.title ? `(${progress[progressIdx].title})` : ''}</h3>
                  <div className="sw-pd-grid-3">
                    {(progress[progressIdx]?.images || []).map((img, i) => (
                      <div key={i} style={{ width: '100%', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={img} alt="Progress" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TÀI LIỆU ===== */}
        {activeTab === 'docs' && (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>TÀI LIỆU DỰ ÁN</h2>
            {documents.length === 0 ? <Empty description="Chưa có tài liệu" /> : (
              <div className="sw-pd-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {documents.map((doc, i) => (
                  <a key={doc.id} href={doc.driveUrl} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: '#0f172a' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ background: '#d4af37', color: '#fff', width: 28, height: 28, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{doc.sortOrder ?? i + 1}</span>
                      <b>{doc.label}</b>
                    </span>
                    <ExportOutlined style={{ color: '#94a3b8' }} />
                  </a>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, color: '#92400e' }}>
              ⓘ Lưu ý: Tài liệu dự án có thể được cập nhật, chỉnh sửa theo từng đợt.
            </div>
          </div>
        )}

        {/* ===== TIN TỨC DỰ ÁN ===== */}
        {activeTab === 'news' && (
          <div>
            <h2 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '24px' }}>TIN TỨC DỰ ÁN</h2>
            {projectNews.length === 0 ? <Empty description="Chưa có tin tức cho dự án này" /> : (
              <div className="sw-pd-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {projectNews.map((news) => (
                  <div key={news.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative', height: 180 }}>
                      <img src={news.thumbnail} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {news.categoryName && <div style={{ position: 'absolute', top: 12, left: 12, background: '#d97706', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 'bold' }}>🏷️ {news.categoryName}</div>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>{news.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 12 }}>{news.summary}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatNewsDate(news.publishedAt)}</span>
                        <Link to={`/news/${news.id}`} style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>Đọc thêm</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
              <span style={{ marginRight: 8 }}>🏢</span>So sánh căn hộ
              <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: 8 }}>{compareList.length}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {compareList.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: 120, position: 'relative' }}>
                  <div style={{ background: '#1e293b', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', marginRight: 12 }}>{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>{item.apartmentCode}</div>
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.price}</div>
                  </div>
                  <CloseOutlined onClick={() => removeFromCompare(item.id)} style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: '#94a3b8', cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Chọn 2 căn hộ trở lên để so sánh</span>
            <Button onClick={clearCompare}>Hủy</Button>
            <Button type="primary" disabled={compareList.length < 2} onClick={() => navigate('/compare')} style={{ background: compareList.length >= 2 ? '#3b82f6' : '#cbd5e1', fontWeight: 'bold' }}>
              Đi đến so sánh ({compareList.length})
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UnitDetailModal open={!!selectedApartment} apartment={selectedApartment} projectName={projectName} onClose={() => setSelectedApartment(null)} onStatusUpdated={handleStatusUpdated} />
      <BuildingDetailModal open={!!selectedBuildingId} buildingId={selectedBuildingId} onClose={() => setSelectedBuildingId(null)} onSelectApartment={(apt) => { setSelectedBuildingId(null); setSelectedApartment(apt); }} />
    </div>
  );
};
