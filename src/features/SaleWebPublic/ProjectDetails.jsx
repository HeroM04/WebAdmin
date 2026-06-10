import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Tabs, Select, Empty, Button, message } from 'antd';
import { apiClient } from '../../utils/apiClient';
import { CompareContext } from '../../context/CompareContext';
import { CheckOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Option } = Select;

export const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingApts, setLoadingApts] = useState(false);

  const { compareList, addToCompare, removeFromCompare } = useContext(CompareContext);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projData = await apiClient.get(`/salepro/projects/${id}`);
      setProject(projData);

      const bldData = await apiClient.get(`/salepro/projects/${id}/buildings`);
      setBuildings(bldData || []);
      
      if (bldData && bldData.length > 0) {
        setSelectedBuilding(bldData[0].id);
        fetchApartments(bldData[0].id);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết dự án.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async (bldId) => {
    setLoadingApts(true);
    try {
      const aptData = await apiClient.get(`/salepro/buildings/${bldId}/apartments`);
      setApartments(aptData || []);
    } catch (error) {
      message.error('Không thể tải danh sách căn hộ.');
    } finally {
      setLoadingApts(false);
    }
  };

  const handleBuildingChange = (val) => {
    setSelectedBuilding(val);
    fetchApartments(val);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  if (!project) {
    return <Empty description="Không tìm thấy dự án" style={{ marginTop: '100px' }} />;
  }

  const items = [
    {
      key: 'overview',
      label: <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tổng quan</span>,
      children: (
        <div className="saleweb-glass animate-fade-in-up" style={{ padding: '32px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Giới thiệu Dự án</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{project.details?.overview || 'Đang cập nhật...'}</p>
          
          <h3 style={{ fontSize: '1.5rem', marginTop: '32px', marginBottom: '16px' }}>Tài liệu Đào tạo</h3>
          <p>{project.details?.trainingMaterials || 'Đang cập nhật...'}</p>
        </div>
      )
    },
    {
      key: 'inventory',
      label: <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quỹ Căn / Bảng Hàng</span>,
      children: (
        <div className="animate-fade-in-up" style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: 600 }}>Chọn Tòa / Phân khu:</span>
            <Select 
              value={selectedBuilding} 
              onChange={handleBuildingChange} 
              style={{ width: 250 }}
              size="large"
            >
              {buildings.map(b => (
                <Option key={b.id} value={b.id}>{b.name} - {b.totalFloors} tầng</Option>
              ))}
            </Select>
          </div>

          {loadingApts ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><Spin /></div>
          ) : apartments.length === 0 ? (
            <Empty description="Tòa nhà này chưa có căn hộ nào trên hệ thống." />
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '24px' 
            }}>
              {apartments.map(apt => {
                const isSelected = compareList.some(item => item.id === apt.id);
                
                return (
                  <div key={apt.id} className="saleweb-glass" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--primary-color)' }}>
                        {apt.apartmentCode}
                      </h4>
                      <span className={`glass-badge ${apt.status === 'TRONG' ? 'glass-badge-approved' : 'glass-badge-pending'}`}>
                        {apt.status === 'TRONG' ? 'Đang trống' : apt.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                      <div><span style={{ fontWeight: 600 }}>Tầng:</span> {apt.floor}</div>
                      <div><span style={{ fontWeight: 600 }}>Loại:</span> {apt.apartmentType}</div>
                      <div><span style={{ fontWeight: 600 }}>Hướng:</span> {apt.direction}</div>
                    </div>

                    <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>DT Thông thủy:</span>
                        <span style={{ fontWeight: 600 }}>{apt.clearanceArea} m²</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Giá niêm yết:</span>
                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1.1rem' }}>
                          {apt.listedPrice ? `${apt.listedPrice.toLocaleString('vi-VN')} Tỷ` : 'Liên hệ'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      type={isSelected ? "primary" : "default"}
                      danger={isSelected}
                      icon={isSelected ? <MinusOutlined /> : <PlusOutlined />}
                      block
                      size="large"
                      onClick={() => isSelected ? removeFromCompare(apt.id) : addToCompare(apt, project)}
                      style={!isSelected ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}
                    >
                      {isSelected ? 'Xóa khỏi Giỏ So Sánh' : 'Thêm vào So Sánh'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="saleweb-container animate-fade-in-up">
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
        borderRadius: '24px', 
        padding: '48px', 
        color: '#fff',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', right: '-10%', top: '-50%', width: '400px', height: '400px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <span className="glass-badge glass-badge-approved" style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.2)' }}>
          {project.status === 'DANG_BAN' ? 'Đang Mở Bán' : project.status}
        </span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 16px 0', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {project.name}
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '800px' }}>
          {project.details?.locationMap || 'Vị trí đắc địa, tiềm năng sinh lời cao.'}
        </p>
      </div>

      <Tabs defaultActiveKey="inventory" items={items} size="large" />
    </div>
  );
};
