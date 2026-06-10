import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, DatePicker, TimePicker, Progress, Tabs, Image } from 'antd';
import dayjs from 'dayjs';
import {
  SearchOutlined, DeleteOutlined, ClockCircleOutlined, QrcodeOutlined,
  PlusOutlined, EditOutlined, EyeOutlined, BookOutlined, TeamOutlined,
  CalendarOutlined, EnvironmentOutlined, UserAddOutlined, UserDeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  YoutubeOutlined, LinkOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import { exportToCSV } from '../utils/exportCsv';

const { Search } = Input;

// Regex validate URL YouTube hợp lệ (youtube.com hoặc youtu.be)
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w\-]{11})(.*)?$/;

const generateQRToken = () => {
  const now = Math.floor(Date.now() / 10000);
  return (now * 31337 % 999999).toString().padStart(6, '0');
};

const STATUS_CONFIG = {
  UPCOMING: { color: 'blue', label: 'Sắp diễn ra' },
  ONGOING: { color: 'gold', label: 'Đang diễn ra' },
  COMPLETED: { color: 'success', label: 'Đã hoàn thành' },
};

export const ManageTraining = () => {
  const {
    trainingSessions, oneOnOneTrainings, users,
    addTrainingSession, updateTrainingSession, deleteTrainingSession,
    addAttendeeToSession, removeAttendeeFromSession
  } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [qrSessionId, setQrSessionId] = useState(null);
  const [qrToken, setQrToken] = useState(generateQRToken());
  const [qrCountdown, setQrCountdown] = useState(10);
  const [scanUserId, setScanUserId] = useState('');
  const [detailSession, setDetailSession] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!qrSessionId) return;
    setQrToken(generateQRToken());
    setQrCountdown(10);
    timerRef.current = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) { setQrToken(generateQRToken()); return 10; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qrSessionId]);

  const getUserById = (id) => users.find(u => u.id === id);

  const filtered = trainingSessions.filter(item => {
    const matchTitle = !search || item.title.toLowerCase().includes(search.toLowerCase()) || (item.presenter || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    let matchDate = true;
    if (dateRange && dateRange[0] && dateRange[1] && item.startTime) {
      const sessionDate = item.startTime.substring(0, 10);
      matchDate = sessionDate >= dateRange[0] && sessionDate <= dateRange[1];
    }
    return matchTitle && matchStatus && matchDate;
  });

  const stats = {
    total: trainingSessions.length,
    upcoming: trainingSessions.filter(s => s.status === 'UPCOMING').length,
    completed: trainingSessions.filter(s => s.status === 'COMPLETED').length,
    totalAttendees: trainingSessions.reduce((sum, s) => sum + (s.attendees || []).length, 0),
  };

  const openDetail = (session) => {
    setDetailSession(session);
    setDrawerOpen(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    // Parse startTime từ server (ISO string) thành dayjs objects
    let dateVal = null;
    let startTimeVal = null;
    if (session.startTime) {
      const dt = dayjs(session.startTime);
      if (dt.isValid()) {
        dateVal = dt;
        startTimeVal = dt;
      }
    }
    editForm.setFieldsValue({
      title: session.title,
      trainer: session.presenter,
      location: session.location,
      topic: session.description,
      maxSlots: session.maxSlots,
      status: session.status,
      videoUrl: session.videoUrl || '',
      date: dateVal,
      startTime: startTimeVal,
    });
    setIsEditModalOpen(true);
  };

  const handleAddSession = () => {
    addForm.validateFields().then(async values => {
      try {
        const dateStr = values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0];
        const timeStr = values.startTime ? values.startTime.format('HH:mm') : '00:00';
        const combinedStartTime = `${dateStr}T${timeStr}:00Z`;

        const dto = {
          title: values.title,
          description: values.topic || '',
          presenter: values.trainer || '',
          roomCode: "ROOM-" + Math.floor(Math.random() * 10000),
          startTime: combinedStartTime,
          location: values.location || '',
          maxSlots: values.maxSlots || 50,
          photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
          videoUrl: values.videoUrl || null
        };

        await addTrainingSession(dto);
        message.success('Đã thêm buổi đào tạo mới!');
        setIsAddModalOpen(false);
        addForm.resetFields();
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleEditSession = () => {
    editForm.validateFields().then(async values => {
      try {
        // values.date và values.startTime luôn là dayjs objects từ DatePicker/TimePicker
        const dateStr = values.date ? dayjs(values.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        const timeStr = values.startTime ? dayjs(values.startTime).format('HH:mm') : '00:00';
        const combinedStartTime = `${dateStr}T${timeStr}:00Z`;

        const dto = {
          title: values.title,
          description: values.topic || '',
          presenter: values.trainer || '',
          roomCode: editingSession.roomCode || "ROOM-" + Math.floor(Math.random() * 10000),
          startTime: combinedStartTime,
          location: values.location || '',
          maxSlots: values.maxSlots || 50,
          status: values.status || editingSession.status,
          photoUrl: editingSession.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
          videoUrl: values.videoUrl ? values.videoUrl.trim() : ""
        };

        // Gọi thêm API cập nhật status riêng biệt để đảm bảo luôn thành công
        // (Do backend trên Render chưa update code mới nhất có chứa status trong DTO)
        if (dto.status && dto.status !== editingSession.status) {
          try {
            const token = localStorage.getItem('kpi_access_token');
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://kpi-backend-4xex.onrender.com/api/v1';
            await fetch(`${apiUrl}/training-sessions/${editingSession.id}/status?status=${dto.status}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (err) {
            console.error("Lỗi update status", err);
          }
        }

        await updateTrainingSession(editingSession.id, dto);

        // Optimistic update cho detailSession (nếu đang mở Drawer)
        if (detailSession && detailSession.id === editingSession.id) {
          setDetailSession({
            ...detailSession,
            ...dto
          });
        }

        message.success('Đã cập nhật buổi đào tạo!');
        setIsEditModalOpen(false);
        setEditingSession(null);
      } catch (e) {
        message.error(e.message || 'Lỗi hệ thống');
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTrainingSession(id);
      message.success('Đã xóa.');
    } catch (e) {
      message.error(e.message || 'Lỗi hệ thống');
    }
  };

  const handleSimulateScan = (sessionId) => {
    if (!scanUserId) { message.error('Vui lòng chọn nhân viên!'); return; }
    const session = trainingSessions.find(s => s.id === sessionId);
    if ((session?.attendees || []).some(a => a.userId === scanUserId)) { message.warning('Nhân viên đã điểm danh rồi!'); return; }
    addAttendeeToSession(sessionId, scanUserId);
    message.success('Điểm danh thành công! (+5 KPI)');
  };

  const columns = [
    {
      title: 'Buổi đào tạo',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 2 }}>{record.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />{record.startTime ? new Date(record.startTime).toLocaleString('vi-VN') : 'Chưa xếp lịch'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            <EnvironmentOutlined style={{ color: '#ef4444', marginRight: 4 }} />{record.location}
          </div>
        </div>
      )
    },
    { title: 'Giảng viên', dataIndex: 'presenter', key: 'presenter', width: 150, render: t => <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t}</span> },
    {
      title: 'Điểm danh',
      key: 'attendees',
      width: 120,
      render: (_, record) => {
        const attendeesCount = (record.attendees || []).length;
        const pct = record.maxSlots > 0 ? Math.round((attendeesCount / record.maxSlots) * 100) : 0;
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}><TeamOutlined style={{ marginRight: 4, color: 'var(--primary-color)' }} />{attendeesCount}/{record.maxSlots}</div>
            <Progress percent={pct} size="small" showInfo={false} strokeColor="var(--primary-color)" railColor="var(--border-color)" />
          </div>
        );
      }
    },
    {
      title: 'Video Bài Giảng',
      key: 'videoUrl',
      width: 160,
      render: (_, record) => record.videoUrl ? (
        <a href={record.videoUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="small"
            style={{
              backgroundColor: '#ff0000',
              borderColor: '#cc0000',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            icon={<YoutubeOutlined style={{ fontSize: 14 }} />}
          >
            Xem Video
          </Button>
        </a>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa cập nhật video</span>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => <Tag color={STATUS_CONFIG[record.status]?.color || 'default'}>{STATUS_CONFIG[record.status]?.label || record.status}</Tag>
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} wrap>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => openDetail(record)}>Chi tiết</Button>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record)}>Sửa</Button>
          <Button size="small" type="primary" icon={<QrcodeOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => setQrSessionId(record.id === qrSessionId ? null : record.id)}>QR</Button>
          <Popconfirm title="Xóa buổi đào tạo?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const oneOnOneColumns = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (_, record) => {
        const u = getUserById(record.userId);
        return (
          <Space>
            <Avatar src={u?.avatar || record.userAvatar} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u?.name || record.userName}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u?.phone}</span>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Nội dung Đào tạo',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (url) => url ? <Image src={url} width={60} style={{ borderRadius: 6 }} /> : 'Không có ảnh'
    },
    {
      title: 'Thời gian',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => <Tag color="success">Đã duyệt (+5 KPI)</Tag>
    }
  ];

  const handleExportSession = () => {
    const exportData = filteredSessions.map(s => ({
      title: s.title,
      presenter: s.presenter,
      attendees: `${s.attendees?.length || 0}/${s.maxSlots}`,
      status: STATUS_CONFIG[s.status]?.label || s.status,
      startTime: new Date(s.startTime).toLocaleString(),
      location: s.location
    }));
    exportToCSV(exportData, [
      { title: 'Tên buổi đào tạo', key: 'title' },
      { title: 'Giảng viên', key: 'presenter' },
      { title: 'Sĩ số', key: 'attendees' },
      { title: 'Trạng thái', key: 'status' },
      { title: 'Thời gian', key: 'startTime' },
      { title: 'Địa điểm', key: 'location' }
    ], 'Bao_Cao_Lop_Dao_Tao.csv');
  };


  const handleExportOneOnOne = () => {
    const exportData = oneOnOneTrainings.map(o => ({
      userName: o.userName,
      content: o.content,
      submittedAt: new Date(o.submittedAt).toLocaleString(),
      status: 'Đã duyệt (+5 KPI)'
    }));
    exportToCSV(exportData, [
      { title: 'Nhân sự', key: 'userName' },
      { title: 'Nội dung', key: 'content' },
      { title: 'Thời gian', key: 'submittedAt' },
      { title: 'Trạng thái', key: 'status' }
    ], 'Bao_Cao_Dao_Tao_1_1.csv');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={[16, 16]}>
        {[
          { label: 'Tổng buổi học', value: stats.total, color: '#3b82f6' },
          { label: 'Sắp diễn ra', value: stats.upcoming, color: '#fbbf24' },
          { label: 'Đã hoàn thành', value: stats.completed, color: '#10b981' },
          { label: 'Lượt tham dự', value: stats.totalAttendees, color: '#8b5cf6' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* QR Panel */}
      {qrSessionId && (() => {
        const session = trainingSessions.find(s => s.id === qrSessionId);
        if (!session) return null;
        return (
          <div className="premium-card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={11} style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, fontSize: 14 }}>
                  <QrcodeOutlined style={{ color: 'var(--primary-color)', marginRight: 8 }} />QR Điểm danh — <span style={{ color: 'var(--primary-color)' }}>{session.title}</span>
                </h3>
                <div style={{ display: 'inline-block', background: '#fff', borderRadius: 16, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '4px solid var(--primary-color)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${session.roomCode}:${qrToken}&bgcolor=ffffff&color=0b0f19&qzone=1&margin=0&format=png`}
                    alt="QR Code điểm danh"
                    style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
                  />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Mã QR thay đổi sau <strong style={{ color: 'var(--primary-color)' }}>{qrCountdown}s</strong></div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: 2, background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 20 }}>TOKEN: {qrToken}</div>
                  <Progress percent={Math.round((qrCountdown / 10) * 100)} showInfo={false} size="small" style={{ width: 160 }} strokeColor={{ '0%': '#10b981', '100%': '#3b82f6' }} railColor="var(--border-color)" />
                </div>
              </Col>
              <Col xs={24} md={14}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Điểm danh thủ công (Mô phỏng)</h4>
                <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
                  <Select value={scanUserId || undefined} onChange={setScanUserId} style={{ flex: 1 }} placeholder="Chọn nhân viên..." options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))} />
                  <Button type="primary" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => handleSimulateScan(qrSessionId)}>Xác nhận</Button>
                </Space.Compact>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Đã điểm danh ({(session.attendees || []).length}):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(session.attendees || []).length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa có nhân viên nào.</span>
                  ) : (session.attendees || []).map(att => {
                    const u = getUserById(att.userId || att);
                    return u ? (
                      <Tag key={att.userId || att} closable onClose={() => removeAttendeeFromSession(qrSessionId, att.userId || att)} color="success" style={{ padding: '4px 10px', borderRadius: 20 }}>
                        <Avatar src={u.avatar} size={14} style={{ marginRight: 4 }} />{u.name}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </Col>
            </Row>
          </div>
        );
      })()}

      <Tabs
        type="card"
        style={{ marginTop: 20 }}
        items={[
          {
            key: 'class',
            label: <><BookOutlined /> Lớp Đào tạo Tập trung</>,
            children: (
              <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <BookOutlined style={{ fontSize: 20, color: 'var(--primary-color)' }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Danh sách Buổi Đào tạo</span>
                  </div>
                  <Space wrap>
                    <Search placeholder="Tìm theo tên buổi học, diễn giả..." allowClear onSearch={setSearch} style={{ width: 280 }} />
                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
                      <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                      <Select.Option value="UPCOMING">Sắp diễn ra</Select.Option>
                      <Select.Option value="ONGOING">Đang diễn ra</Select.Option>
                      <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
                    </Select>
                    <DatePicker.RangePicker onChange={setDateRange} format="DD/MM/YYYY" style={{ width: 240 }} />
                    <Button type="primary" danger icon={<DownloadOutlined />} onClick={handleExportSession}>Xuất báo cáo</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>Thêm buổi đào tạo</Button>
                  </Space>
                </div>
                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            )
          },
          {
            key: 'oneOnOne',
            label: <><TeamOutlined /> Đào tạo 1-1</>,
            children: (
              <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <TeamOutlined style={{ fontSize: 20, color: '#ec4899' }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Báo cáo Đào tạo 1-1</span>
                  </div>
                  <Button type="primary" danger icon={<DownloadOutlined />} onClick={handleExportOneOnOne}>Xuất báo cáo</Button>
                </div>
                <Table
                  columns={oneOnOneColumns}
                  dataSource={oneOnOneTrainings}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            )
          }
        ]}
      />

      {/* Detail Drawer */}
      <Drawer title={null} placement="right" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }}>
        {detailSession && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 8 }}>BUỔI ĐÀO TẠO</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: 6 }}>{detailSession.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Giảng viên: <strong>{detailSession.trainer}</strong></div>
              <div style={{ marginTop: 10 }}>
                <Tag color={STATUS_CONFIG[detailSession.status]?.color || 'default'}>{STATUS_CONFIG[detailSession.status]?.label}</Tag>
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>THÔNG TIN LỊCH HỌC</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: <CalendarOutlined style={{ color: '#8b5cf6' }} />, label: 'Ngày học', value: detailSession.date },
                    { icon: <ClockCircleOutlined style={{ color: '#fbbf24' }} />, label: 'Thời gian', value: `${detailSession.startTime} – ${detailSession.endTime}` },
                    { icon: <EnvironmentOutlined style={{ color: '#ef4444' }} />, label: 'Địa điểm', value: detailSession.location },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ marginTop: 2 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detailSession.topic && (
                <div className="premium-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>CHỦ ĐỀ</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '3px solid #8b5cf6' }}>
                    {detailSession.topic}
                  </div>
                </div>
              )}

              {/* Video Section */}
              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>VIDEO BÀI GIẢNG</div>
                {detailSession.videoUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid rgba(255,0,0,0.2)' }}>
                      <YoutubeOutlined style={{ fontSize: 20, color: '#ff0000', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all', flex: 1 }}>{detailSession.videoUrl}</span>
                    </div>
                    <a href={detailSession.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <Button
                        type="primary"
                        icon={<YoutubeOutlined />}
                        style={{
                          width: '100%',
                          backgroundColor: '#ff0000',
                          borderColor: '#cc0000',
                          fontWeight: 700,
                          height: 40,
                          fontSize: 14,
                          boxShadow: '0 4px 15px rgba(255,0,0,0.3)'
                        }}
                      >
                        Xem Video trên YouTube
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <YoutubeOutlined style={{ fontSize: 32, color: 'var(--border-color)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa cập nhật video cho buổi đào tạo này</span>
                  </div>
                )}
              </div>

              <div className="premium-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>
                    DANH SÁCH THAM DỰ ({(detailSession.attendees || []).length}/{detailSession.maxSlots})
                  </div>
                  <Progress percent={Math.round(((detailSession.attendees || []).length / detailSession.maxSlots) * 100)} size="small" style={{ width: 80 }} strokeColor="#8b5cf6" railColor="var(--border-color)" />
                </div>
                {(detailSession.attendees || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: 13 }}>Chưa có nhân viên tham dự</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(detailSession.attendees || []).map((att, i) => {
                      const u = getUserById(att.userId || att);
                      return u ? (
                        <div key={att.userId || att} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, justifyContent: 'space-between' }}>
                          <Space>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>{i + 1}</div>
                            <Avatar src={u.avatar} size={28} />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.role}</div>
                            </div>
                          </Space>
                          <Button size="small" type="text" danger icon={<UserDeleteOutlined />} onClick={() => { removeAttendeeFromSession(detailSession.id, att.userId || att); setDetailSession(prev => ({ ...prev, attendees: prev.attendees.filter(a => (a.userId || a) !== (att.userId || att)) })); }} />
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <Space style={{ width: '100%' }}>
                <Button icon={<QrcodeOutlined />} type="primary" style={{ flex: 1, backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => { setDrawerOpen(false); setQrSessionId(detailSession.id); }}>Mở QR Điểm danh</Button>
                <Button icon={<EditOutlined />} style={{ flex: 1 }} onClick={() => { setDrawerOpen(false); openEdit(detailSession); }}>Chỉnh sửa</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Modal */}
      <Modal title="Thêm Buổi Đào tạo Mới" open={isAddModalOpen} onOk={handleAddSession} onCancel={() => { setIsAddModalOpen(false); addForm.resetFields(); }} okText="Thêm mới" cancelText="Hủy" okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }} width={540}>
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tên buổi đào tạo" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Kỹ năng Chốt deal Cao cấp" />
          </Form.Item>
          <Form.Item name="trainer" label="Giảng viên" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="date" label="Ngày" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item></Col>
            <Col span={8}><Form.Item name="startTime" label="Bắt đầu"><TimePicker style={{ width: '100%' }} format="HH:mm" /></Form.Item></Col>
            <Col span={8}><Form.Item name="endTime" label="Kết thúc"><TimePicker style={{ width: '100%' }} format="HH:mm" /></Form.Item></Col>
          </Row>
          <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
            <Input placeholder="Phòng họp lớn - Tầng 5" />
          </Form.Item>
          <Form.Item name="topic" label="Nội dung chủ đề">
            <Input.TextArea rows={2} placeholder="Mô tả nội dung..." />
          </Form.Item>
          <Form.Item
            name="videoUrl"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <YoutubeOutlined style={{ color: '#ff0000', fontSize: 16 }} />
                Link Video Bài Giảng (YouTube)
              </span>
            }
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') return Promise.resolve();
                  if (YOUTUBE_URL_REGEX.test(value.trim())) return Promise.resolve();
                  return Promise.reject(new Error('Link không hợp lệ. Vui lòng nhập URL YouTube (youtube.com hoặc youtu.be).'));
                }
              }
            ]}
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
              prefix={<LinkOutlined style={{ color: 'var(--text-secondary)' }} />}
              allowClear
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="maxSlots" label="Số slot tối đa" initialValue={20}><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="Trạng thái" initialValue="UPCOMING"><Select options={[{ value: 'UPCOMING', label: 'Sắp diễn ra' }, { value: 'ONGOING', label: 'Đang diễn ra' }, { value: 'COMPLETED', label: 'Đã hoàn thành' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Chỉnh sửa Buổi Đào tạo" open={isEditModalOpen} onOk={handleEditSession} onCancel={() => { setIsEditModalOpen(false); setEditingSession(null); }} okText="Lưu thay đổi" cancelText="Hủy" okButtonProps={{ style: { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } }} width={540}>
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tên buổi đào tạo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="trainer" label="Giảng viên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
            <Col span={8}><Form.Item name="startTime" label="Bắt đầu"><TimePicker style={{ width: '100%' }} format="HH:mm" /></Form.Item></Col>
            <Col span={8}><Form.Item name="endTime" label="Kết thúc"><TimePicker style={{ width: '100%' }} format="HH:mm" /></Form.Item></Col>
          </Row>
          <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="topic" label="Nội dung chủ đề">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="videoUrl"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <YoutubeOutlined style={{ color: '#ff0000', fontSize: 16 }} />
                Link Video Bài Giảng (YouTube)
              </span>
            }
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') return Promise.resolve();
                  if (YOUTUBE_URL_REGEX.test(value.trim())) return Promise.resolve();
                  return Promise.reject(new Error('Link không hợp lệ. Vui lòng nhập URL YouTube (youtube.com hoặc youtu.be).'));
                }
              }
            ]}
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              prefix={<LinkOutlined style={{ color: 'var(--text-secondary)' }} />}
              allowClear
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="maxSlots" label="Số slot tối đa"><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="Trạng thái"><Select options={[{ value: 'UPCOMING', label: 'Sắp diễn ra' }, { value: 'ONGOING', label: 'Đang diễn ra' }, { value: 'COMPLETED', label: 'Đã hoàn thành' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
