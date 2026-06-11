import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Tabs, Table, Tag, Spin, Empty, Progress, ConfigProvider } from 'antd';
import { saleProApi } from '../api/saleProApi';
import { SALEPRO_LIGHT_THEME } from './LoanCalculatorModal';
import {
  getStatusMeta,
  formatBillion,
  formatArea,
  formatDirection,
  formatApartmentType,
} from './saleProFormat';
import './UnitDetail.css';

const InfoLine = ({ label, value }) => (
  <div className="sw-unit-row">
    <span className="sw-unit-row-label">{label}</span>
    <span className="sw-unit-row-value">{value ?? '—'}</span>
  </div>
);

// Ma trận bảng hàng: hàng = tầng, cột = trục
const InventoryGrid = ({ apartments, onSelect }) => {
  const { matrix, floors, axes } = useMemo(() => {
    const m = {};
    const axisSet = new Set();
    apartments.forEach((a) => {
      if (!m[a.floor]) m[a.floor] = {};
      m[a.floor][a.axis] = a;
      axisSet.add(a.axis);
    });
    return {
      matrix: m,
      floors: Object.keys(m).sort((x, y) => String(y).localeCompare(String(x), undefined, { numeric: true })),
      axes: Array.from(axisSet).sort((x, y) => String(x).localeCompare(String(y), undefined, { numeric: true })),
    };
  }, [apartments]);

  if (apartments.length === 0) return <Empty description="Chưa có dữ liệu bảng hàng" />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #e2e8f0', padding: 6, background: '#0f3a6b', color: '#fff' }}>Tầng \ Trục</th>
            {axes.map((ax) => (
              <th key={ax} style={{ border: '1px solid #e2e8f0', padding: 6, background: '#0f3a6b', color: '#fff' }}>{ax}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {floors.map((fl) => (
            <tr key={fl}>
              <td style={{ border: '1px solid #e2e8f0', padding: 6, fontWeight: 700, background: '#f1f5f9' }}>{fl}</td>
              {axes.map((ax) => {
                const apt = matrix[fl][ax];
                const meta = apt ? getStatusMeta(apt.status) : null;
                return (
                  <td
                    key={ax}
                    onClick={() => apt && onSelect(apt)}
                    style={{
                      border: '1px solid #e2e8f0', padding: 6, cursor: apt ? 'pointer' : 'default',
                      background: meta ? meta.bg : '#fff', color: meta ? meta.color : '#cbd5e1', fontWeight: 600,
                    }}
                  >
                    {apt ? apt.apartmentCode.split('-').pop() : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BuildingDetailModal = ({ open, buildingId, onClose, onSelectApartment }) => {
  const [building, setBuilding] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !buildingId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [b, apts] = await Promise.all([
          saleProApi.getBuildingById(buildingId),
          saleProApi.getApartmentsByBuildingId(buildingId),
        ]);
        if (!active) return;
        setBuilding(b);
        setApartments(apts || []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [open, buildingId]);

  const columns = [
    { title: 'Mã căn', dataIndex: 'apartmentCode', key: 'apartmentCode', render: (t, r) => <a style={{ color: '#ef4444', fontWeight: 700 }} onClick={() => onSelectApartment?.(r)}>{t}</a> },
    { title: 'Giá bán', dataIndex: 'listedPrice', key: 'listedPrice', sorter: (a, b) => (a.listedPrice || 0) - (b.listedPrice || 0), render: (v) => formatBillion(v) },
    { title: 'Loại hình', dataIndex: 'apartmentType', key: 'apartmentType', render: (v) => formatApartmentType(v) },
    { title: 'Hướng', dataIndex: 'direction', key: 'direction', render: (v) => formatDirection(v) },
    { title: 'Tầng', dataIndex: 'floor', key: 'floor' },
    { title: 'DT thông thủy', dataIndex: 'clearanceArea', key: 'clearanceArea', render: (v) => formatArea(v) },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status', render: (s) => { const m = getStatusMeta(s); return <Tag style={{ color: m.color, background: m.bg, borderColor: m.border, fontWeight: 700 }}>{m.label}</Tag>; } },
  ];

  const tabItems = building ? [
    {
      key: 'overview', label: 'Tổng quan',
      children: (
        <div>
          {building.imageUrl && <img src={building.imageUrl} alt={building.buildingName} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
          {building.constructionProgress != null && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 600, color: '#334155', marginRight: 12 }}>Tiến độ xây dựng</span>
              <Progress percent={building.constructionProgress} style={{ maxWidth: 320 }} />
            </div>
          )}
          <div className="sw-unit-grid-2">
            <InfoLine label="Phân khu:" value={building.subdivisionName} />
            <InfoLine label="Hình thức sở hữu:" value={building.ownershipType} />
            <InfoLine label="Tiêu chuẩn bàn giao:" value={building.buildingHandoverStandard} />
            <InfoLine label="Tổng diện tích:" value={building.totalArea ? `${building.totalArea} m²` : '—'} />
            <InfoLine label="Số tầng:" value={building.totalFloors} />
            <InfoLine label="Số căn hộ:" value={building.totalApartments} />
            <InfoLine label="Số thang máy:" value={building.elevatorCount} />
            <InfoLine label="Còn hàng:" value={`${building.availableCount}/${building.apartmentCount} căn`} />
          </div>
          {building.description && <p style={{ marginTop: 16, color: '#334155', lineHeight: 1.7 }}>{building.description}</p>}
        </div>
      ),
    },
    {
      key: 'layout', label: 'Layout tòa nhà',
      children: (building.floorPlans && building.floorPlans.length > 0) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {building.floorPlans.map((fp) => (
            <div key={fp.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <img src={fp.imageUrl} alt={fp.floorLabel} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
              <div style={{ padding: 12, fontWeight: 700, color: '#0f172a' }}>{fp.floorLabel}</div>
            </div>
          ))}
        </div>
      ) : <Empty description="Chưa có mặt bằng tầng" />,
    },
    {
      key: 'policy', label: 'Chính sách bán hàng',
      children: building.salesPolicy
        ? <div style={{ color: '#334155', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: building.salesPolicy }} />
        : <Empty description="Chưa có chính sách bán hàng" />,
    },
    {
      key: 'inventory', label: 'Bảng hàng',
      children: <InventoryGrid apartments={apartments} onSelect={(apt) => onSelectApartment?.(apt)} />,
    },
    {
      key: 'fund', label: 'Quỹ căn',
      children: <Table rowKey="id" columns={columns} dataSource={apartments} size="small" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} />,
    },
  ] : [];

  return (
    <ConfigProvider theme={SALEPRO_LIGHT_THEME}>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={1100}
        centered
        destroyOnHidden
        className="sw-unit-modal"
        title={building ? <b>Tòa {building.buildingName} — {building.subdivisionName || ''}</b> : 'Chi tiết tòa nhà'}
      >
        <Spin spinning={loading}>
          {building ? <Tabs items={tabItems} /> : (!loading && <Empty description="Không tải được dữ liệu tòa" />)}
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default BuildingDetailModal;
