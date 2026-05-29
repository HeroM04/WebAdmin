import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Modal, Form, Input, Select, Popconfirm, Card, Row, Col, Divider, message, Drawer, Descriptions, Progress, Upload } from 'antd';
import { AppContext } from '../context/AppContext';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SafetyCertificateOutlined,
  KeyOutlined,
  UserAddOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  TrophyOutlined,
  SearchOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';

// Wait, the React Context import is correct. Let's make sure there is no react-redux import.
// Yes! I'll write the code correctly without react-redux.

export const Personnel = () => {
  const { departments, users, addUser, updateUser, deleteUser } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [form] = Form.useForm();

  // Open Modal for Add
  const showAddModal = () => {
    setEditingUser(null);
    setAvatarUrl(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const showEditModal = (record) => {
    setEditingUser(record);
    setAvatarUrl(record.avatar || record.avatarUrl || null);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      deptId: record.deptId,
      status: record.status
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleOk = () => {
    form
      .validateFields()
      .then(async values => {
        try {
          const payload = { ...values, avatarUrl };
          if (editingUser) {
            await updateUser({ ...editingUser, ...payload });
            message.success('Cập nhật thông tin nhân viên thành công!');
          } else {
            await addUser(payload);
            message.success('Thêm mới nhân viên thành công!');
          }
          setIsModalOpen(false);
        } catch (e) {
          message.error(e.message || 'Lỗi hệ thống');
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const customUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      setUploadingAvatar(true);
      const res = await apiClient.upload('/upload/file', file);
      if (res && res.url) {
        setAvatarUrl(res.url);
        onSuccess("Ok");
        message.success('Tải ảnh lên thành công');
      } else {
        throw new Error('Không nhận được URL ảnh từ server');
      }
    } catch (err) {
      console.error(err);
      onError({ err });
      message.error('Tải ảnh lên thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('Đã xóa nhân viên ra khỏi danh sách hệ thống!');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const filteredUsers = [...users]
    .filter(u => {
      const matchName = !search || 
        String(u.name || '').toLowerCase().includes(search.toLowerCase()) || 
        String(u.id || '').toLowerCase().includes(search.toLowerCase()) || 
        String(u.phone || '').includes(search);
      const matchDept = deptFilter === 'ALL' || u.deptId === deptFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchName && matchDept && matchStatus;
    })
    .sort((a, b) => {
      const deptA = String(a.deptId || 'zzz');
      const deptB = String(b.deptId || 'zzz');
      if (deptA !== deptB) return deptA.localeCompare(deptB);
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  // User columns for Table
  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Tag color="geekblue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{id}</Tag>
    },
    {
      title: 'Nhân viên',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size="default" style={{ border: '2px solid var(--border-color)' }} />
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.name}</span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <span style={{ color: 'var(--text-primary)' }}>{text}</span>
    },
    {
      title: 'Phòng ban',
      dataIndex: 'deptId',
      key: 'deptId',
      render: (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        return <Tag color="blue">{dept ? dept.name : 'Chưa phân phòng'}</Tag>;
      }
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          SALE: 'green',
          TRUONG_PHONG: 'orange',
          ADMIN: 'purple',
          VAN_PHONG: 'blue'
        };
        const color = colors[role] || 'default';

        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {role}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'error'} style={{ borderRadius: 4 }}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => { setDetailUser(record); setDrawerOpen(true); }}>Chi tiết</Button>
          <Button type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc chắn muốn xóa nhân sự này và các lịch sử KPI liên quan?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rolePermissions = [
    {
      role: 'SALE',
      desc: 'Nhân viên kinh doanh trực tiếp tiếp thị và chốt deal',
      permissions: ['Gửi chấm công ngoại tuyến', 'Báo cáo cuộc gặp khách', 'Đăng bài lan tỏa BĐS', 'Gửi Deal chốt căn']
    },
    {
      role: 'TRUONG_PHONG',
      desc: 'Quản lý phòng ban, hỗ trợ chốt deal',
      permissions: ['Xem Dashboard phòng ban', 'Duyệt chấm công & thực chiến', 'Phê duyệt deal của phòng ban']
    },
    {
      role: 'ADMIN',
      desc: 'Quản trị nhân sự toàn hệ thống',
      permissions: ['CRUD tài khoản nhân viên', 'Phê duyệt toàn bộ yêu cầu', 'Reset điểm KPI', 'Quản lý lớp đào tạo']
    },
    {
      role: 'VAN_PHONG',
      desc: 'Nhân viên hành chính văn phòng',
      permissions: ['Xem Dashboard công ty', 'Quản lý hành chính']
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview stats & action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          Quản lý danh sách nhân sự, phân bổ sơ đồ phòng ban và cấp quyền vận hành hệ thống.
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', borderRadius: 8, height: 40 }}
          onClick={showAddModal}
        >
          Thêm Nhân Viên
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Top: Users table */}
        <Col xs={24} xl={24}>
          <div className="premium-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TeamOutlined style={{ color: 'var(--primary-color)', fontSize: 18 }} />
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Nhân sự</h3>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Input.Search placeholder="Tìm mã, tên nhân viên..." allowClear style={{ width: 200 }} onChange={e => setSearch(e.target.value)} />
                <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 160 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...[...departments].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).map(d => ({ value: d.id, label: d.name }))]} />
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, { value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Tạm khóa' }]} />
              </div>
            </div>
            <Table
              dataSource={filteredUsers}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Col>
      </Row>

      {/* Bottom: Permissions & Roles Matrix */}
      <div className="premium-card" style={{ marginTop: 16 }}>
        <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: '16px 20px' }}>
          <SafetyCertificateOutlined style={{ color: 'var(--primary-color)' }} /> Phân Quyền Hệ Thống
        </h3>
        <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />
        
        <Row gutter={[16, 16]} style={{ padding: 20 }}>
          {rolePermissions.map((rp, i) => (
            <Col xs={24} sm={12} xl={6} key={i}>
              <Card 
                bodyStyle={{ padding: 16 }} 
                style={{ 
                  height: '100%',
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  borderRadius: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <KeyOutlined style={{ color: rp.role === 'ADMIN' ? 'purple' : rp.role === 'TRUONG_PHONG' ? 'gold' : rp.role === 'SALE' ? 'green' : 'blue' }} />
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{rp.role}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>{rp.desc}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {rp.permissions.map((p, j) => (
                    <Tag key={j} style={{ fontSize: '11px', borderRadius: 4, margin: 0, backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                      {p}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingUser ? 'Cập Nhật Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingUser ? 'Lưu Thay Đổi' : 'Thêm Mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
          style={{ marginTop: 16 }}
        >
          <Form.Item label="Ảnh Đại Diện" style={{ textAlign: 'center' }}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={customUpload}
              accept="image/*"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div>
                  {uploadingAvatar ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="name"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên nhân viên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>



          <Form.Item
            name="phone"
            label="Số Điện Thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input placeholder="Ví dụ: 0901234567" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai Trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                initialValue="SALE"
              >
                <Select>
                  <Select.Option value="ADMIN">ADMIN</Select.Option>
                  <Select.Option value="TRUONG_PHONG">TRUONG_PHONG</Select.Option>
                  <Select.Option value="SALE">SALE</Select.Option>
                  <Select.Option value="VAN_PHONG">VAN_PHONG</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="deptId"
                label="Phòng Ban"
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
              >
                <Select placeholder="Chọn phòng">
                  {[...departments].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).map(d => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {editingUser && (
            <Form.Item
              name="status"
              label="Trạng thái tài khoản"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
                <Select.Option value="INACTIVE">Tạm khóa (INACTIVE)</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Personnel Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {detailUser && (() => {
          const dept = departments.find(d => d.id === detailUser.deptId);
          const roleColors = { ADMIN: '#8b5cf6', TRUONG_PHONG: '#fbbf24', SALE: '#10b981', VAN_PHONG: '#3b82f6' };
          const roleColor = roleColors[detailUser.role] || '#94a3b8';
          return (
            <div>
              {/* Premium Header */}
              <div style={{ background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}99 100%)`, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Avatar src={detailUser.avatar} size={72} style={{ border: '4px solid rgba(255,255,255,0.5)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{detailUser.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 }}>{detailUser.role}</div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={detailUser.status === 'ACTIVE' ? 'success' : 'error'}>{detailUser.status === 'ACTIVE' ? '● Đang hoạt động' : '○ Tạm khóa'}</Tag>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Contact Info */}
                <div className="premium-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN LIÊN HỆ</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <PhoneOutlined style={{ color: roleColor, fontSize: 16 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Số điện thoại</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailUser.phone || '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <TeamOutlined style={{ color: roleColor, fontSize: 16 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Phòng ban</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept ? dept.name : 'Chưa phân phòng'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role & Permission */}
                <div className="premium-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>VAI TRÒ & QUYỀN HẠN</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${roleColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SafetyCertificateOutlined style={{ color: roleColor, fontSize: 20 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>{detailUser.role}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {detailUser.role === 'HR' ? 'Quản trị hệ thống toàn quyền' :
                          detailUser.role === 'Manager' ? 'Quản lý phòng ban' : 'Nhân viên kinh doanh'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(detailUser.role === 'HR' ?
                      ['CRUD tài khoản', 'Duyệt toàn bộ', 'Reset KPI', 'Quản lý đào tạo'] :
                      detailUser.role === 'Manager' ?
                        ['Xem Dashboard', 'Duyệt chấm công', 'Duyệt thực chiến', 'Duyệt deal phòng ban'] :
                        ['Gửi chấm công', 'Báo cáo thực chiến', 'Đăng bài BĐS', 'Gửi Deal']
                    ).map((perm, i) => (
                      <Tag key={i} color="blue" style={{ fontSize: 11, padding: '3px 8px' }}>
                        ✓ {perm}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* ID Card */}
                <div className="premium-card" style={{ padding: 16, background: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 8 }}>ID HỆ THỐNG</div>
                  <code style={{ fontSize: 12, color: 'var(--primary-color)', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 4 }}>{detailUser.id}</code>
                </div>

                <Space style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ flex: 1, backgroundColor: roleColor, borderColor: roleColor }}
                    onClick={() => { setDrawerOpen(false); showEditModal(detailUser); }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Popconfirm
                    title="Xóa nhân viên này?"
                    onConfirm={() => { handleDelete(detailUser.id); setDrawerOpen(false); }}
                    okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />} style={{ flex: 1 }}>Xóa tài khoản</Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          );
        })()}
      </Drawer>

    </div>
  );
};
