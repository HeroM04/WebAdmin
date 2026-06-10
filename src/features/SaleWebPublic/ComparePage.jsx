import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Empty } from 'antd';
import { DownloadOutlined, DeleteOutlined, CloseOutlined, ExportOutlined, BlockOutlined } from '@ant-design/icons';
import { CompareContext } from '../../context/CompareContext';
import '../../SaleWeb.css';

export const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useContext(CompareContext);
  const navigate = useNavigate();

  if (!compareList || compareList.length === 0) {
    return (
      <div className="saleweb-container" style={{ padding: '48px 24px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Chưa có căn hộ nào được chọn để so sánh" />
        <Button type="primary" onClick={() => navigate('/projects')} style={{ marginTop: '16px' }}>Quay lại danh sách dự án</Button>
      </div>
    );
  }

  const findBestPrice = () => {
    // Basic logic to find best price (lowest) - assuming price is formatted like "6.21 tỷ"
    if (compareList.length === 0) return null;
    let minPriceVal = parseFloat(compareList[0].price);
    let bestId = compareList[0].id;
    compareList.forEach(item => {
      const val = parseFloat(item.price);
      if (val < minPriceVal) {
        minPriceVal = val;
        bestId = item.id;
      }
    });
    return bestId;
  };

  const bestPriceId = findBestPrice();

  return (
    <div className="saleweb-container" style={{ padding: '24px 0', background: '#fff' }}>
      {/* Header section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
          Trang chủ / <span style={{ color: '#0f172a' }}>So sánh căn hộ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
              SO SÁNH CĂN HỘ
            </h1>
            <div style={{ color: '#64748b', marginTop: '4px' }}>{compareList.length}/5 căn hộ đang được so sánh</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#3b82f6', fontWeight: 'bold' }}>Tải ảnh so sánh</Button>
            <Button icon={<DeleteOutlined />} onClick={clearCompare} style={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 'bold' }}>Xóa tất cả</Button>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ width: '200px', padding: '24px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' }}>TIÊU CHÍ</span>
              </th>
              {compareList.map(item => (
                <th key={item.id} style={{ width: '250px', padding: '16px', background: '#fff', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top', position: 'relative' }}>
                  <CloseOutlined onClick={() => removeFromCompare(item.id)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }} />
                  <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px' }}>{item.apartmentCode}</div>
                  <div style={{ position: 'relative', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <img src={item.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=400"} alt="Apartment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px' }}>
                      <div style={{ background: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><BlockOutlined style={{ color: '#10b981' }} /></div>
                      <div style={{ background: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><ExportOutlined style={{ color: '#3b82f6' }} /></div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}>DỰ ÁN: {item.projectInfo?.name || 'VINHOMES SÀI GÒN PARK'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>GIÁ NY: <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.price}</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.area} - {item.type} - {item.direction}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* GIÁ BÁN */}
            <tr>
              <td colSpan={compareList.length + 1} style={{ background: '#f1f5f9', padding: '12px 24px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                GIÁ BÁN
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Giá niêm yết</td>
              {compareList.map(item => {
                const isBest = item.id === bestPriceId;
                return (
                  <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: isBest ? '#eff6ff' : '#fff' }}>
                    <div style={{ color: isBest ? '#2563eb' : '#0f172a', fontWeight: 'bold' }}>{item.price}</div>
                    {isBest && <div style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '4px' }}>Giá tốt nhất</div>}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Giá vay</td>
              {compareList.map(item => {
                const isBest = item.id === bestPriceId;
                const loanPrice = (parseFloat(item.price) * 0.93).toFixed(2) + ' tỷ';
                return (
                  <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: isBest ? '#eff6ff' : '#fff' }}>
                    <div style={{ color: isBest ? '#2563eb' : '#0f172a', fontWeight: 'bold' }}>{loanPrice}</div>
                    {isBest && <div style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '4px' }}>Giá tốt nhất</div>}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Giá TTS</td>
              {compareList.map(item => {
                const isBest = item.id === bestPriceId;
                const ttsPrice = (parseFloat(item.price) * 0.85).toFixed(2) + ' tỷ';
                return (
                  <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: isBest ? '#eff6ff' : '#fff' }}>
                    <div style={{ color: isBest ? '#2563eb' : '#0f172a', fontWeight: 'bold' }}>{ttsPrice}</div>
                    {isBest && <div style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '4px' }}>Giá tốt nhất</div>}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Giá TTTE</td>
              {compareList.map(item => {
                const isBest = item.id === bestPriceId;
                const tttePrice = (parseFloat(item.price) * 0.98).toFixed(2) + ' tỷ';
                return (
                  <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: isBest ? '#eff6ff' : '#fff' }}>
                    <div style={{ color: isBest ? '#2563eb' : '#0f172a', fontWeight: 'bold' }}>{tttePrice}</div>
                    {isBest && <div style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '4px' }}>Giá tốt nhất</div>}
                  </td>
                );
              })}
            </tr>

            {/* THÔNG TIN CĂN HỘ */}
            <tr>
              <td colSpan={compareList.length + 1} style={{ background: '#f1f5f9', padding: '12px 24px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                THÔNG TIN CĂN HỘ
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Loại hình</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{item.type}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Hướng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{item.direction}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Diện tích</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{item.area}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Tầng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>-</td>)}
            </tr>

            {/* DIỆN TÍCH CHI TIẾT */}
            <tr>
              <td colSpan={compareList.length + 1} style={{ background: '#f1f5f9', padding: '12px 24px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                DIỆN TÍCH CHI TIẾT
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>DT đất</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{item.landArea || item.area}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>DT xây dựng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{item.buildArea || item.area}</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>DT thông thuỷ</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>-</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>DT tim tường</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>-</td>)}
            </tr>

            {/* TÀI CHÍNH & CHÍNH SÁCH */}
            <tr>
              <td colSpan={compareList.length + 1} style={{ background: '#f1f5f9', padding: '12px 24px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                TÀI CHÍNH & CHÍNH SÁCH
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Ngân hàng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>-</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>CSBH áp dụng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>06/06/2026</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Quà tặng</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>-</td>)}
            </tr>

            {/* BÀN GIAO & PHÁP LÝ */}
            <tr>
              <td colSpan={compareList.length + 1} style={{ background: '#f1f5f9', padding: '12px 24px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                BÀN GIAO & PHÁP LÝ
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Tiêu chuẩn bàn giao</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>Giãn xây</td>)}
            </tr>
            <tr>
              <td style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>Quỹ căn</td>
              {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>Sơ cấp</td>)}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};
