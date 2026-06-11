import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { saleProApi } from '../api/saleProApi';

export const AgentsAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setData((await saleProApi.listAgents()) || []);
    } catch (e) {
      message.error('Không tải được danh sách chuyên viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (record) => {
    setEditing(record || null);
    form.resetFields();
    if (record) form.setFieldsValue(record);
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) await saleProApi.updateAgent(editing.id, values);
      else await saleProApi.createAgent(values);
      message.success('Đã lưu chuyên viên.');
      setOpen(false);
      load();
    } catch (e) {
      if (e?.errorFields) return; // lỗi validate form
      message.error(e?.message || 'Lưu thất bại.');
    }
  };

  const onDelete = async (id) => {
    try { await saleProApi.deleteAgent(id); message.success('Đã xóa.'); load(); }
    catch (e) { message.error(e?.message || 'Xóa thất bại.'); }
  };

  const columns = [
    { title: 'Ảnh', dataIndex: 'avatarUrl', width: 70, render: (v) => <Avatar src={v} icon={<UserOutlined />} /> },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Chức danh', dataIndex: 'title' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Thao tác', width: 140, render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm title="Xóa chuyên viên này?" onConfirm={() => onDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý Chuyên viên</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm chuyên viên</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} bordered />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={onSubmit} title={editing ? 'Sửa chuyên viên' : 'Thêm chuyên viên'} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Form.Item name="title" label="Chức danh (vd: MC - Quản lý quỹ căn)"><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="avatarUrl" label="Link ảnh đại diện"><Input /></Form.Item>
          <Form.Item name="zaloLink" label="Link Zalo"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentsAdmin;
