import React, { useContext } from 'react';
import { CompareContext } from '../../context/CompareContext';
import { Table, Button, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

export const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useContext(CompareContext);

  if (compareList.length === 0) {
    return (
      <div className="saleweb-container animate-fade-in-up" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty 
          description={<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Giỏ so sánh của bạn đang trống.</span>} 
        />
        <Link to="/projects">
          <button className="saleweb-btn saleweb-btn-primary" style={{ marginTop: '24px' }}>
            Quay lại Danh sách Dự án
          </button>
        </Link>
      </div>
    );
  }

  // Calculate Best Values
  const getBestValues = () => {
    let minPrice = Infinity;
    let maxClearance = 0;
    let maxBuiltUp = 0;

    compareList.forEach(apt => {
      if (apt.listedPrice && apt.listedPrice < minPrice) minPrice = apt.listedPrice;
      if (apt.clearanceArea && apt.clearanceArea > maxClearance) maxClearance = apt.clearanceArea;
      if (apt.builtUpArea && apt.builtUpArea > maxBuiltUp) maxBuiltUp = apt.builtUpArea;
    });

    return { minPrice, maxClearance, maxBuiltUp };
  };

  const bestValues = getBestValues();

  // Create columns based on compareList length
  const columns = [
    {
      title: 'Thông số So sánh',
      dataIndex: 'feature',
      key: 'feature',
      fixed: 'left',
      width: 200,
      render: (text) => <strong style={{ color: 'var(--text-secondary)' }}>{text}</strong>
    },
    ...compareList.map((apt) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 700 }}>{apt.apartmentCode}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{apt.projectInfo?.name || 'Dự án'}</div>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            size="small" 
            style={{ marginTop: '8px' }}
            onClick={() => removeFromCompare(apt.id)}
          >
            Xóa
          </Button>
        </div>
      ),
      dataIndex: `apt_${apt.id}`,
      key: `apt_${apt.id}`,
      align: 'center',
      width: 220,
    }))
  ];

  const dataSource = [
    {
      key: 'status',
      feature: 'Trạng thái',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: <span className={`glass-badge ${apt.status === 'TRONG' ? 'glass-badge-approved' : 'glass-badge-pending'}`}>{apt.status === 'TRONG' ? 'Đang Trống' : apt.status}</span> }), {})
    },
    {
      key: 'price',
      feature: 'Giá Niêm Yết',
      ...compareList.reduce((acc, apt) => {
        const isBest = apt.listedPrice === bestValues.minPrice;
        return { 
          ...acc, 
          [`apt_${apt.id}`]: (
            <div style={isBest ? { color: '#ef4444', fontWeight: 800, fontSize: '1.2rem', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' } : { fontWeight: 600 }}>
              {apt.listedPrice ? `${apt.listedPrice.toLocaleString('vi-VN')} Tỷ` : 'Liên hệ'}
              {isBest && <div style={{ fontSize: '10px', marginTop: '4px' }}>🔥 RẺ NHẤT</div>}
            </div>
          ) 
        };
      }, {})
    },
    {
      key: 'clearanceArea',
      feature: 'DT Thông Thủy',
      ...compareList.reduce((acc, apt) => {
        const isBest = apt.clearanceArea === bestValues.maxClearance;
        return { 
          ...acc, 
          [`apt_${apt.id}`]: (
            <div style={isBest ? { color: 'var(--primary-color)', fontWeight: 800, padding: '8px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', border: '1px solid var(--primary-color)' } : { fontWeight: 500 }}>
              {apt.clearanceArea ? `${apt.clearanceArea} m²` : '-'}
              {isBest && <div style={{ fontSize: '10px', marginTop: '4px' }}>⭐ RỘNG NHẤT</div>}
            </div>
          ) 
        };
      }, {})
    },
    {
      key: 'type',
      feature: 'Loại căn hộ',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: apt.apartmentType || '-' }), {})
    },
    {
      key: 'floor',
      feature: 'Tầng',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: apt.floor || '-' }), {})
    },
    {
      key: 'direction',
      feature: 'Hướng',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: apt.direction || '-' }), {})
    },
    {
      key: 'handover',
      feature: 'Bàn giao',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: apt.handoverStandard || 'Tiêu chuẩn' }), {})
    },
    {
      key: 'policy',
      feature: 'Chính sách',
      ...compareList.reduce((acc, apt) => ({ ...acc, [`apt_${apt.id}`]: apt.salesPolicyApplied || '-' }), {})
    }
  ];

  return (
    <div className="saleweb-container animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="text-gradient-gold" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Ma Trận So Sánh</h2>
        <Button danger onClick={clearCompare}>Xóa toàn bộ Giỏ</Button>
      </div>
      
      <div className="saleweb-glass" style={{ padding: '24px', overflow: 'hidden' }}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          pagination={false}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </div>
    </div>
  );
};
