import React, { useContext, useState } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Row, Col, Drawer, Modal, Form, Avatar, Select } from 'antd';
import {
  SearchOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
  EyeOutlined, BankOutlined, TeamOutlined, UserDeleteOutlined, UserAddOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Search } = Input;

export const Departments = () => {
  const {
    departments, users,
    addDepartment, updateDepartment, deleteDepartment,
    assignUserToDepartment, removeUserFromDepartment
  } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [detailDept, setDetailDept] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const [form] = Form.useForm();

  // Danh sách các phòng ban đã lọc
  const filteredDepartments = departments.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  const getDeptUsers = (deptId) => users.filter(u => u.deptId === deptId);
  const getUnassignedUsers = () => users.filter(u => !u.deptId);

  const openDetail = (dept) => {
    setDetailDept(dept);
    setSelectedUserToAdd(null);
    setDrawerOpen(true);
  };

  const openAdd = () => {
    setEditingDept(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    form.setFieldsValue({
      name: dept.name,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        if (editingDept) {
          await updateDepartment({ ...editingDept, ...values });
          message.success('Đã cập nhật phòng ban!');
        } else {
          await addDepartment(values);
          message.success('Đã thêm phòng ban mới!');
        }
        setModalOpen(false);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleDelete = async (deptId) => {
    try {
      await deleteDepartment(deptId);
      message.success('Đã xóa phòng ban. Các nhân sự thuộc phòng ban này đã được chuyển về "Chưa phân phòng".');
      if (detailDept?.id === deptId) setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserToAdd) return;
    try {
      await assignUserToDepartment(selectedUserToAdd, detailDept.id);
      message.success('Đã thêm nhân sự vào phòng ban!');
      setSelectedUserToAdd(null);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUserFromDepartment(userId);
      message.success('Đã gỡ nhân sự khỏi phòng ban!');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const columns = [
    {
      title: 'Tên Phòng ban',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
      defaultSortOrder: 'ascend',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
    },
    {
      title: 'Số nhân sự',
      key: 'usersCount',
      render: (_, record) => {
        const count = getDeptUsers(record.id).length;
        return <span style={{ color: 'var(--text-secondary)' }}><TeamOutlined style={{ marginRight: 6 }} />{count} nhân sự</span>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openDetail(record)}>Chi tiết</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa phòng ban này?" description="Nhân sự trong phòng sẽ chuyển về 'Chưa phân phòng'." onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Cột cho danh sách nhân sự trong Drawer chi tiết
  const deptUsersColumns = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{record.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{record.role}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Popconfirm title="Đưa nhân sự này ra khỏi phòng?" onConfirm={() => handleRemoveUser(record.id)} okText="Đồng ý" cancelText="Hủy">
          <Button size="small" danger type="text" icon={<UserDeleteOutlined />}>Gỡ</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tổng số phòng ban</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{departments.length}</div>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Chưa phân phòng</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{getUnassignedUsers().length}</div>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tổng nhân sự</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{users.length}</div>
          </div>
        </Col>
      </Row>

      <div className="premium-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Search placeholder="Tìm tên phòng ban..." allowClear style={{ width: 260 }} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />} />
          <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={openAdd}>Thêm Phòng ban</Button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BankOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Phòng ban</h3>
        </div>
        <Table dataSource={filteredDepartments} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8 }} />
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {detailDept && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{detailDept.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
                <TeamOutlined style={{ marginRight: 6 }} /> {getDeptUsers(detailDept.id).length} nhân sự
              </div>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
              
              {/* Thêm nhân sự */}
              <div className="premium-card" style={{ padding: 16, backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserAddOutlined /> THÊM NHÂN SỰ VÀO PHÒNG
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select
                    showSearch
                    placeholder="Chọn từ nhóm 'Chưa phân phòng'"
                    value={selectedUserToAdd}
                    onChange={setSelectedUserToAdd}
                    style={{ flex: 1 }}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getUnassignedUsers().map(u => ({
                      value: u.id,
                      label: `${u.name} (${u.role})`
                    }))}
                    notFoundContent="Không có nhân sự nào chưa phân phòng"
                  />
                  <Button type="primary" onClick={handleAddUser} disabled={!selectedUserToAdd}>Thêm</Button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                  * Lưu ý: Chỉ hiển thị các nhân sự đang ở trạng thái <strong>"Chưa phân phòng"</strong>. Để chuyển phòng ban, cần gỡ nhân sự khỏi phòng ban cũ trước.
                </div>
              </div>

              {/* Danh sách nhân sự */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  DANH SÁCH NHÂN SỰ
                </div>
                <Table
                  dataSource={getDeptUsers(detailDept.id)}
                  columns={deptUsersColumns}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Chưa có nhân sự nào trong phòng ban này' }}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDept ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingDept ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}>
            <Input placeholder="Ví dụ: Phòng Kinh Doanh 1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
