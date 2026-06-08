import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { saleProApi } from '../api/saleProApi';

const ProjectList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await saleProApi.getAllProjects();
      setProjects(data || []);
    } catch (error) {
      message.error(error.message || 'Lỗi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên Dự án', dataIndex: 'name', key: 'name' },
    { title: 'Loại hình', dataIndex: 'projectType', key: 'projectType' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'SAP_MO_BAN') color = 'warning';
        if (status === 'DANG_BAN') color = 'success';
        if (status === 'DA_HET_HANG') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => onSelectProject(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Danh sách Dự án Bất động sản</h2>
      <Table 
        dataSource={projects} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
      />
    </div>
  );
};

export default ProjectList;
