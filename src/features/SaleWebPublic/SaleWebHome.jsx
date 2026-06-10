import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { apiClient } from '../../utils/apiClient';

export const SaleWebHome = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get('/salepro/projects');
      setProjects(data || []);
    } catch (error) {
      console.warn('Failed to fetch projects, might be unauthorized if backend not open');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saleweb-container animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="text-gradient-gold" style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 800 }}>Dự Án Nổi Bật</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá những dự án bất động sản đẳng cấp với khả năng sinh lời vượt trội, được phân phối độc quyền bởi Trí Long Land.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
        </div>
      ) : projects.length === 0 ? (
        <div className="saleweb-glass" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Hiện chưa có dự án nào đang mở bán.</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {projects.map(project => (
            <div key={project.id} className="saleweb-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{
                height: '220px',
                background: 'linear-gradient(135deg, #d4af37, #eab308)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 700,
                textAlign: 'center',
                padding: '20px'
              }}>
                {project.name}
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="glass-badge glass-badge-approved">
                    {project.status === 'DANG_BAN' ? 'Đang Mở Bán' : project.status}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {project.projectType}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 700 }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>
                  {project.details?.locationMap || 'Vị trí đắc địa, tiềm năng sinh lời cao.'}
                </p>
                <Link to={`/projects/${project.id}`} style={{ width: '100%' }}>
                  <button className="saleweb-btn saleweb-btn-primary" style={{ width: '100%' }}>
                    Xem Bảng Hàng Chi Tiết
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
