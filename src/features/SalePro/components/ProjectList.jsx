import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, Popconfirm } from 'antd';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { saleProApi } from '../api/saleProApi';
import { AppContext } from '../../../context/AppContext';

const { Option } = Select;

const ProjectList = ({ onSelectProject }) => {
  const { currentUser } = useContext(AppContext);
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await saleProApi.getAllProjects();
      setProjects(data?.data || data || []);
    } catch (error) {
      message.error(error.message || 'Lỗi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingId(record?.id || null);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await saleProApi.updateProject(editingId, values);
        message.success('Cập nhật dự án thành công');
      } else {
        await saleProApi.createProject(values);
        message.success('Thêm dự án thành công');
      }
      setIsModalVisible(false);
      fetchProjects();
    } catch (error) {
      message.error(error.message || 'Lỗi khi lưu dự án');
    }
  };

  const handleDelete = async (id) => {
    try {
      await saleProApi.deleteProject(id);
      message.success('Xóa dự án thành công');
      fetchProjects();
    } catch (error) {
      message.error(error.message || 'Lỗi khi xóa dự án');
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
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => onSelectProject(record)}
          >
            Chi tiết
          </Button>
          {isAdmin && (
            <>
              <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
              <Popconfirm
                title="Bạn có chắc muốn xóa dự án này?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Danh sách Dự án Bất động sản</h2>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm Dự án
          </Button>
        )}
      </div>
      <Table 
        dataSource={projects} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? "Sửa Dự án" : "Thêm Dự án"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên Dự án" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="projectType" label="Loại hình">
            <Input placeholder="VD: Chung cư cao cấp, Biệt thự..." />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="SAP_MO_BAN">Sắp mở bán</Option>
              <Option value="DANG_BAN">Đang bán</Option>
              <Option value="DA_HET_HANG">Đã hết hàng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
