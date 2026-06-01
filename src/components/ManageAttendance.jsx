import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, Divider, Badge, Upload, DatePicker } from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined,
  ClockCircleOutlined, EnvironmentOutlined, FilterOutlined, PlusOutlined,
  EditOutlined, EyeOutlined, ClockCircleFilled, CameraOutlined, UserOutlined, DownloadOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import { exportToCSV } from '../utils/exportCsv';

const { Search } = Input;

const StatusTag = ({ status }) => {
  if (status === 'APPROVED') return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
  return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
};

export const ManageAttendance = () => {
  const { attendance, users, departments, currentUser, approveAttendance, rejectAttendance, deleteAttendance, updateAttendance, addAttendance } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [previewImg, setPreviewImg] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const getUserById = (id) => users.find(u => u.id === id);
  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Chưa phân phòng';
  };

  const baseFiltered = attendance.filter(item => {
    const user = getUserById(item.userId);
    const matchName = !search || (user?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchDept = deptFilter === 'ALL' || (user && user.deptId === deptFilter);
    let matchDate = true;
    if (dateRange && dateRange[0] && dateRange[1] && item.checkinTime) {
      const itemDateStr = item.checkinTime.substring(0, 10);
      matchDate = itemDateStr >= dateRange[0] && itemDateStr <= dateRange[1];
    }
    return matchName && matchStatus && matchDept && matchDate;
  });

  const filtered = Object.values(baseFiltered.reduce((acc, curr) => {
    const dateStr = curr.checkinTime ? curr.checkinTime.substring(0, 10) : '';
    const key = `${curr.userId}_${dateStr}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        userId: curr.userId,
        date: dateStr,
        checkinRecord: null,
        checkoutRecord: null,
        status: curr.status,
        note: curr.note,
        approvedBy: curr.approvedBy
      };
    }
    if (curr.actionType === 'CHECK_OUT') {
      acc[key].checkoutRecord = curr;
      if (curr.note) acc[key].note = curr.note;
    } else {
      acc[key].checkinRecord = curr;
      if (curr.note) acc[key].note = curr.note;
    }
    
    const cIn = acc[key].checkinRecord;
    const cOut = acc[key].checkoutRecord;
    if ((cIn && cIn.status === 'PENDING') || (cOut && cOut.status === 'PENDING')) {
      acc[key].status = 'PENDING';
    } else if ((cIn && cIn.status === 'REJECTED') || (cOut && cOut.status === 'REJECTED')) {
      acc[key].status = 'REJECTED';
    } else {
      acc[key].status = 'APPROVED';
    }
    
    return acc;
  }, {})).sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    total: attendance.length,
    pending: attendance.filter(a => a.status === 'PENDING').length,
    approved: attendance.filter(a => a.status === 'APPROVED').length,
    rejected: attendance.filter(a => a.status === 'REJECTED').length,
  };

  const openDetail = (record) => {
    setDetailRecord(record);
    setDrawerOpen(true);
  };

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      userId: users[0]?.id,
      status: 'PENDING',
      gpsLocation: '10.7769, 106.7009 (Văn phòng Chính)',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      userId: record.userId,
      note: record.note,
      gpsLocation: record.gpsLocation,
      status: record.status,
      photoUrl: record.photoUrl,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        const locStr = values.gpsLocation || "";
        const parts = locStr.split(',');
        const latitude = parseFloat(parts[0]) || 10.7769;
        const longitude = parseFloat(parts[1]) || 106.7009;
        
        const dto = {
          ...values,
          latitude,
          longitude
        };

        if (editingRecord) {
          await updateAttendance({ ...editingRecord, ...dto });
          message.success('Đã cập nhật bản ghi chấm công!');
        } else {
          await addAttendance(dto);
          message.success('Đã thêm bản ghi chấm công mới!');
        }
        setModalOpen(false);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleExport = () => {
    const exportData = filtered.map(r => {
      const user = getUserById(r.userId);
      const cIn = r.checkinRecord;
      const cOut = r.checkoutRecord;
      return {
        name: user?.name || 'Ẩn danh',
        dept: getDeptName(user?.deptId),
        checkInTime: cIn ? new Date(cIn.checkinTime).toLocaleString('vi-VN') : '',
        checkInLocation: cIn?.gpsLocation || cIn?.address || '',
        checkOutTime: cOut ? new Date(cOut.checkinTime).toLocaleString('vi-VN') : '',
        checkOutLocation: cOut?.gpsLocation || cOut?.address || '',
        status: (cIn && cIn.status === 'APPROVED') ? 'Hợp lệ (+10 KPI)' : ((cIn && cIn.status === 'REJECTED') ? 'Từ chối' : 'Chờ duyệt')
      };
    });
    exportToCSV(exportData, [
      { title: 'Nhân sự', key: 'name' },
      { title: 'Phòng ban', key: 'dept' },
      { title: 'Thời gian Check-in', key: 'checkInTime' },
      { title: 'Vị trí Check-in', key: 'checkInLocation' },
      { title: 'Thời gian Check-out', key: 'checkOutTime' },
      { title: 'Vị trí Check-out', key: 'checkOutLocation' },
      { title: 'Trạng thái', key: 'status' }
    ], 'Bao_Cao_Cham_Cong.csv');
  };

  const handleDelete = async (record) => {
    try {
      if (record.checkinRecord) await deleteAttendance(record.checkinRecord.id);
      if (record.checkoutRecord) await deleteAttendance(record.checkoutRecord.id);
      message.success('Đã xóa.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleApprove = async (record) => {
    try {
      if (record.checkinRecord && record.checkinRecord.status === 'PENDING') await approveAttendance(record.checkinRecord.id, currentUser.name);
      if (record.checkoutRecord && record.checkoutRecord.status === 'PENDING') await approveAttendance(record.checkoutRecord.id, currentUser.name);
      message.success('Đã duyệt. (+10 KPI)');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleReject = async (record) => {
    try {
      if (record.checkinRecord && record.checkinRecord.status === 'PENDING') await rejectAttendance(record.checkinRecord.id, currentUser.name);
      if (record.checkoutRecord && record.checkoutRecord.status === 'PENDING') await rejectAttendance(record.checkoutRecord.id, currentUser.name);
      message.warning('Đã từ chối.');
      setDrawerOpen(false);
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (_, record) => {
        const user = getUserById(record.userId);
        return (
          <Space>
            <Avatar src={user?.avatar} size="default" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user?.name || 'Ẩn danh'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{getDeptName(user?.deptId)}</div>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Thời gian Check-in',
      key: 'checkinTime',
      render: (_, record) => {
        const cIn = record.checkinRecord;
        return cIn ? (
          <div>
            <div style={{ color: 'var(--success-color)', fontSize: 13, fontWeight: 600 }}>
              {new Date(cIn.checkinTime).toLocaleString('vi-VN')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              <EnvironmentOutlined style={{ color: '#ef4444', marginRight: 4 }} />{cIn.gpsLocation || cIn.address || 'Không xác định'}
            </div>
          </div>
        ) : <span style={{ color: '#cbd5e1' }}>—</span>;
      }
    },
    {
      title: 'Thời gian Check-out',
      key: 'checkoutTime',
      render: (_, record) => {
        const cOut = record.checkoutRecord;
        return cOut ? (
          <div>
            <div style={{ color: 'var(--info-color)', fontSize: 13, fontWeight: 600 }}>
              {new Date(cOut.checkinTime).toLocaleString('vi-VN')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              <EnvironmentOutlined style={{ color: '#ef4444', marginRight: 4 }} />{cOut.gpsLocation || cOut.address || 'Không xác định'}
            </div>
          </div>
        ) : <span style={{ color: '#cbd5e1' }}>—</span>;
      }
    },
    {
      title: 'Ảnh Check-in',
      key: 'photo',
      width: 100,
      render: (_, record) => {
        const user = getUserById(record.userId);
        const cIn = record.checkinRecord;
        return (
          <Space size={4}>
            <img src={user?.avatar} alt="profile" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '2px solid var(--border-color)', cursor: 'pointer' }} title="Ảnh hồ sơ" onClick={() => setPreviewImg(user?.avatar)} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Avatar'; }} />
            {cIn && cIn.photoUrl ? (
              <img src={cIn.photoUrl} alt="checkin" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '2px solid var(--primary-color)', cursor: 'pointer' }} onClick={() => setPreviewImg(cIn.photoUrl)} title="Ảnh check-in (click xem)" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Photo'; }} />
            ) : <span style={{fontSize: 10, color: '#ccc'}}>—</span>}
          </Space>
        );
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{text || 'Không có'}</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => (
        <div>
          <StatusTag status={record.status} />
          {record.approvedBy && <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>bởi {record.approvedBy}</div>}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openDetail(record)}>Chi tiết</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record.checkinRecord || record.checkoutRecord)}>Sửa</Button>
          {record.status === 'PENDING' && (
            <>
              <Button size="small" danger ghost icon={<CloseCircleOutlined />} onClick={() => handleReject(record)} />
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleApprove(record)} />
            </>
          )}
          <Popconfirm title="Xóa bản ghi này?" onConfirm={() => handleDelete(record)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Detail Drawer content
  const detailUser = detailRecord ? getUserById(detailRecord.userId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <Row gutter={[16, 16]}>
        {[
          { label: 'Tổng bản ghi', value: stats.total, color: '#3b82f6' },
          { label: 'Chờ duyệt', value: stats.pending, color: '#fbbf24' },
          { label: 'Đã duyệt', value: stats.approved, color: '#10b981' },
          { label: 'Đã từ chối', value: stats.rejected, color: '#ef4444' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filter + Add */}
      <div className="premium-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search placeholder="Tìm theo tên nhân sự..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />} />
            <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 160 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, { value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
            <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} onChange={(dates, dateStrings) => setDateRange(dateStrings)} style={{ width: 220 }} />
            <Button type="primary" danger icon={<DownloadOutlined />} onClick={handleExport}>Xuất báo cáo</Button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              Hiển thị <strong style={{ color: 'var(--text-primary)', margin: '0 4px' }}>{filtered.length}</strong> / {attendance.length}
            </span>
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={openAdd}>Thêm Chấm công</Button>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Danh sách Chấm công Ngoại tuyến</h3>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8, showSizeChanger: true }} scroll={{ x: 'max-content' }} style={{ padding: '8px' }} />
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
        {detailRecord && detailUser && (
          <div>
            {/* Gradient Header */}
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <Space size={16} align="start">
                <Avatar src={detailUser.avatar} size={64} style={{ border: '3px solid rgba(255,255,255,0.5)' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{detailUser.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{detailUser.role} • {getDeptName(detailUser.deptId)}</div>
                </div>
              </Space>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {detailRecord.checkinRecord && (
                  <div className="premium-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success-color)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN CHECK-IN</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <ClockCircleOutlined style={{ color: 'var(--primary-color)', marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Thời gian</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(detailRecord.checkinRecord.checkinTime).toLocaleString('vi-VN')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vị trí GPS</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.checkinRecord.gpsLocation || detailRecord.checkinRecord.address || 'Không xác định'}</div>
                        </div>
                      </div>
                      {detailRecord.checkinRecord.note && (
                        <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid var(--primary-color)', fontSize: 13, color: 'var(--text-primary)' }}>
                          {detailRecord.checkinRecord.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {detailRecord.checkoutRecord && (
                  <div className="premium-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--info-color)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN CHECK-OUT</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <ClockCircleOutlined style={{ color: 'var(--primary-color)', marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Thời gian</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(detailRecord.checkoutRecord.checkinTime).toLocaleString('vi-VN')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vị trí GPS</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{detailRecord.checkoutRecord.gpsLocation || detailRecord.checkoutRecord.address || 'Không xác định'}</div>
                        </div>
                      </div>
                      {detailRecord.checkoutRecord.note && (
                        <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid var(--primary-color)', fontSize: 13, color: 'var(--text-primary)' }}>
                          {detailRecord.checkoutRecord.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Photo comparison */}
                {(detailRecord.checkinRecord?.photoUrl || detailRecord.checkoutRecord?.photoUrl) && (
                  <div className="premium-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>SO SÁNH NHẬN DẠNG</div>
                    <Row gutter={12}>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Ảnh hồ sơ</div>
                        <img src={detailUser.avatar} alt="profile" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border-color)', cursor: 'zoom-in' }} onClick={() => setPreviewImg(detailUser.avatar)} />
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--primary-color)', marginBottom: 8, fontWeight: 600 }}>Ảnh Chấm công</div>
                        <img src={detailRecord.checkinRecord?.photoUrl || detailRecord.checkoutRecord?.photoUrl} alt="checkin" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--primary-color)', cursor: 'zoom-in' }} onClick={() => setPreviewImg(detailRecord.checkinRecord?.photoUrl || detailRecord.checkoutRecord?.photoUrl)} />
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Actions */}
                {(detailRecord.checkinRecord?.status === 'PENDING' || detailRecord.checkoutRecord?.status === 'PENDING') && (
                  <Space style={{ width: '100%' }}>
                    <Button danger ghost icon={<CloseCircleOutlined />} style={{ flex: 1 }} onClick={() => handleReject(detailRecord)}>Từ chối</Button>
                    <Button type="primary" icon={<CheckCircleOutlined />} style={{ flex: 1, backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleApprove(detailRecord)}>Phê duyệt</Button>
                  </Space>
                )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa Bản ghi Chấm công' : 'Thêm Bản ghi Chấm công Mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="Nhân sự" rules={[{ required: true }]}>
            <Select options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))} />
          </Form.Item>
          <Form.Item name="actionType" label="Loại chấm công" initialValue="CHECK_IN">
            <Select options={[{ value: 'CHECK_IN', label: 'Check-in' }, { value: 'CHECK_OUT', label: 'Check-out' }]} />
          </Form.Item>
          <Form.Item name="gpsLocation" label="Vị trí GPS">
            <Input placeholder="Ví dụ: 10.7769, 106.7009 (Văn phòng Quận 1)" />
          </Form.Item>
          <Form.Item name="photoUrl" label="URL Ảnh Check-in">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú về lý do chấm công ngoại tuyến..." />
          </Form.Item>
          {editingRecord && (
            <Form.Item name="status" label="Trạng thái">
              <Select options={[{ value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Full-screen image preview */}
      {previewImg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }} onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="preview" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 16, boxShadow: '0 0 60px rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'absolute', top: 24, right: 24, color: '#fff', fontSize: 13, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 20 }}>Nhấp để đóng</div>
        </div>
      )}
    </div>
  );
};
