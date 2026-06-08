import React, { useState } from 'react';
import { Button, Descriptions, Tabs, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InventoryMatrix from './InventoryMatrix';
import ApartmentCompare from './ApartmentCompare';

const { TabPane } = Tabs;

const ProjectDetail = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) return null;

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      
      <h2>{project.name}</h2>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tổng quan" key="overview">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Loại hình">{project.projectType}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{project.status}</Descriptions.Item>
          </Descriptions>
          
          <Card title="Chi tiết Tổng quan" style={{ marginTop: 16 }}>
            <div dangerouslySetInnerHTML={{ __html: project.details?.overview || 'Chưa có thông tin tổng quan.' }} />
          </Card>
        </TabPane>
        
        <TabPane tab="Bảng hàng (Inventory)" key="inventory">
          <InventoryMatrix projectId={project.id} />
        </TabPane>

        <TabPane tab="So sánh Căn hộ" key="compare">
          <ApartmentCompare projectId={project.id} />
        </TabPane>
        
        <TabPane tab="Tài liệu & Đào tạo" key="materials">
          <Card title="Tài liệu dự án">
            <ul>
              {project.details?.documents?.map((doc, idx) => <li key={idx}><a href={doc} target="_blank" rel="noreferrer">Tài liệu {idx + 1}</a></li>)}
            </ul>
          </Card>
          <Card title="Tài liệu đào tạo" style={{ marginTop: 16 }}>
            <ul>
              {project.details?.trainingMaterials?.map((doc, idx) => <li key={idx}><a href={doc} target="_blank" rel="noreferrer">Video/Bài giảng {idx + 1}</a></li>)}
            </ul>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
