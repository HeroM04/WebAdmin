import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, Popconfirm, message, Row, Col, Drawer, Modal, Form, DatePicker, TimePicker, Progress, Tabs } from 'antd';
import dayjs from 'dayjs';
import {
  SearchOutlined, DeleteOutlined, ClockCircleOutlined, QrcodeOutlined,
  PlusOutlined, EditOutlined, EyeOutlined, BookOutlined, TeamOutlined,
  CalendarOutlined, EnvironmentOutlined, UserAddOutlined, UserDeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  YoutubeOutlined, LinkOutlined, FacebookOutlined,
  FullscreenOutlined, FullscreenExitOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { TrainingRsvpRequests } from './TrainingRsvpRequests';
import { DaoTao1Kem1 } from './DaoTao1Kem1';
import { rowClick } from '../utils/tableRow';
import { exportToCSV } from '../utils/exportCsv';
import { khopTen } from '../utils/locBang';

const { Search } = Input;

// Regex validate URL YouTube hợp lệ (youtube.com hoặc youtu.be)
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w\-]{11})(.*)?$/;
// Link Facebook: video trên trang/nhóm, fb.watch, link chia sẻ, link rút gọn
const FACEBOOK_URL_REGEX = /^(https?:\/\/)?(www\.|m\.|web\.|mbasic\.)?(facebook\.com|fb\.com|fb\.watch)\/.+$/i;

/**
 * Ảnh mã QR theo kích thước mong muốn.
 *
 * Ảnh lấy từ dịch vụ ngoài nên phải xin đúng số điểm ảnh cần dùng: phóng một
 * ảnh 180px lên nửa màn hình máy chiếu thì các ô vuông nhòe, điện thoại cuối
 * phòng không bắt được.
 */
const anhQR = (roomCode, token, size) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${roomCode}:${token}&bgcolor=ffffff&color=0b0f19&qzone=1&margin=0&format=png`;

const loaiLink = (url) => {
  const u = String(url || '').trim();
  if (!u) return '';
  if (YOUTUBE_URL_REGEX.test(u)) return 'youtube';
  if (FACEBOOK_URL_REGEX.test(u)) return 'facebook';
  return 'khac';
};

/**
 * Ô nhập link video bài giảng — dùng chung cho form thêm và form sửa.
 *
 * Nhận cả YouTube lẫn Facebook. Trước đây chỉ nhận YouTube nên quyết định
 * "đăng video lên nhóm Facebook công ty" không thực hiện được: dán link vào là
 * bị báo "không hợp lệ", trong khi app điện thoại và máy chủ đều đã nhận
 * Facebook từ lâu.
 *
 * Nhóm Facebook là nhóm KÍN, chỉ thành viên xem được — nên khi nhận ra link
 * Facebook thì nhắc ngay dưới ô, để người nhập nhớ kiểm tra nhân sự mới đã
 * được thêm vào nhóm chưa. Đây là lỗi lộ ra ở máy nhân viên ("nội dung không
 * khả dụng"), admin không nhìn thấy được, nên phải nhắc ở chỗ nhập.
 */
const VideoLinkField = ({ form }) => {
  const url = Form.useWatch('videoUrl', form);
  const loai = loaiLink(url);
  const goiY = {
    facebook: {
      mau: '#b45309',
      chu: 'Link Facebook — nếu là nhóm kín thì chỉ THÀNH VIÊN nhóm xem được. Nhân sự mới phải được thêm vào nhóm trước, không thì họ mở ra chỉ thấy "Nội dung không khả dụng".',
    },
    youtube: {
      mau: 'var(--text-secondary)',
      chu: 'Link YouTube — nên để chế độ "Không công khai" (Unlisted): ai có link đều xem được, không cần đăng nhập, không hiện khi tìm kiếm.',
    },
    khac: {
      mau: 'var(--danger-color)',
      chu: 'Chỉ nhận link YouTube (youtube.com, youtu.be) hoặc Facebook (facebook.com, fb.watch).',
    },
  }[loai];

  return (
    <Form.Item
      name="videoUrl"
      label={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <YoutubeOutlined style={{ color: '#ff0000', fontSize: 16 }} />
          Link Video Bài Giảng (YouTube hoặc Facebook)
        </span>
      }
      extra={goiY ? <span style={{ fontSize: 12, color: goiY.mau }}>{goiY.chu}</span> : null}
      rules={[
        {
          validator: (_, value) => {
            const l = loaiLink(value);
            if (l === '' || l === 'youtube' || l === 'facebook') return Promise.resolve();
            return Promise.reject(new Error('Link không hợp lệ. Nhập URL YouTube (youtube.com / youtu.be) hoặc Facebook (facebook.com / fb.watch).'));
          }
        }
      ]}
    >
      <Input
        placeholder="https://www.youtube.com/watch?v=... hoặc https://www.facebook.com/..."
        prefix={<LinkOutlined style={{ color: 'var(--text-secondary)' }} />}
        allowClear
      />
    </Form.Item>
  );
};

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

  const [searchParams] = useSearchParams();
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
  // Chiếu QR lên máy chiếu: cả phòng quét cùng lúc nên mã phải thật to.
  const [toanManHinh, setToanManHinh] = useState(false);
  const khungToanManHinh = useRef(null);

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

  /*
   * TOÀN MÀN HÌNH CHO MÃ QR
   *
   * Dùng Fullscreen API của trình duyệt để che cả thanh địa chỉ và thanh tác vụ
   * — chiếu lên máy chiếu thì mọi pixel đều dành cho mã QR. Trình duyệt chặn
   * (iframe, hoặc người dùng chưa cho phép) thì vẫn phủ kín cửa sổ bằng CSS,
   * không báo lỗi gì cho người đang đứng lớp.
   *
   * Thoát bằng phím Esc là chuyện của trình duyệt; sự kiện fullscreenchange
   * dưới đây đưa state về đúng để nút bấm và giao diện khớp trạng thái thật.
   */
  useEffect(() => {
    const dongBo = () => { if (!document.fullscreenElement) setToanManHinh(false); };
    document.addEventListener('fullscreenchange', dongBo);
    return () => document.removeEventListener('fullscreenchange', dongBo);
  }, []);

  // Không có Fullscreen API thì lớp phủ CSS vẫn kín cửa sổ, nên Esc phải tự bắt.
  useEffect(() => {
    if (!toanManHinh) return;
    const nhanPhim = (e) => { if (e.key === 'Escape') thoatToanManHinh(); };
    window.addEventListener('keydown', nhanPhim);
    return () => window.removeEventListener('keydown', nhanPhim);
  }, [toanManHinh]);

  const moToanManHinh = () => {
    setToanManHinh(true);
    // Đợi React vẽ lớp phủ rồi mới xin toàn màn hình cho đúng phần tử đó
    requestAnimationFrame(() => {
      khungToanManHinh.current?.requestFullscreen?.().catch(() => { /* vẫn phủ kín bằng CSS */ });
    });
  };

  const thoatToanManHinh = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setToanManHinh(false);
  };

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
      durationMinutes: session.durationMinutes ?? 120,
      trainingType: session.trainingType || 'SKILL',
      skillGroup: session.skillGroup || '',
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
        // Ghép ngày + giờ thành 1 mốc theo múi giờ địa phương, gửi kèm offset (vd +07:00)
        // — KHÔNG gắn cứng "Z" (UTC) để tránh lệch +7h khiến buổi tối nhảy sang hôm sau.
        const baseDate = values.date ? dayjs(values.date) : dayjs();
        const timePart = values.startTime ? dayjs(values.startTime) : dayjs().startOf('day');
        const combinedStartTime = baseDate
          .hour(timePart.hour())
          .minute(timePart.minute())
          .second(0)
          .millisecond(0)
          .format('YYYY-MM-DDTHH:mm:ssZ');

        const dto = {
          title: values.title,
          description: values.topic || '',
          presenter: values.trainer || '',
          roomCode: "ROOM-" + Math.floor(Math.random() * 10000),
          startTime: combinedStartTime,
          location: values.location || '',
          maxSlots: values.maxSlots || 50,
          durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : 120,
          trainingType: values.trainingType || 'SKILL',
          skillGroup: values.skillGroup?.trim() || null,
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
        // Ghép thành 1 mốc theo giờ địa phương, gửi kèm offset (vd +07:00) — KHÔNG gắn cứng "Z".
        const baseDate = values.date ? dayjs(values.date) : dayjs();
        const timePart = values.startTime ? dayjs(values.startTime) : dayjs().startOf('day');
        const combinedStartTime = baseDate
          .hour(timePart.hour())
          .minute(timePart.minute())
          .second(0)
          .millisecond(0)
          .format('YYYY-MM-DDTHH:mm:ssZ');

        const dto = {
          title: values.title,
          description: values.topic || '',
          presenter: values.trainer || '',
          roomCode: editingSession.roomCode || "ROOM-" + Math.floor(Math.random() * 10000),
          startTime: combinedStartTime,
          location: values.location || '',
          maxSlots: values.maxSlots || 50,
          durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : 120,
          trainingType: values.trainingType || 'SKILL',
          skillGroup: values.skillGroup?.trim() || '',
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
    message.success('Điểm danh thành công!');
  };

  const columns = [
    {
      title: 'Buổi đào tạo',
      key: 'title',
      width: 300,
      render: (_, record) => (
        // Ngày giờ và địa điểm gộp vào một dòng phụ để dòng bảng còn hai dòng
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.title}>
            {record.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <CalendarOutlined style={{ marginRight: 3 }} />
            {record.startTime ? new Date(record.startTime).toLocaleString('vi-VN') : 'Chưa xếp lịch'}
            <EnvironmentOutlined style={{ color: '#ef4444', margin: '0 3px 0 8px' }} />
            {record.location}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              <TeamOutlined style={{ marginRight: 4, color: 'var(--primary-color)' }} />{attendeesCount}/{record.maxSlots}
            </span>
            <Progress percent={pct} size="small" showInfo={false} strokeColor="var(--primary-color)" railColor="var(--border-color)" style={{ flex: 1, margin: 0, minWidth: 40 }} />
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
          {/* Nút đổi màu theo nơi đăng để admin nhìn là biết video này ai xem được:
              Facebook (nhóm kín, cần là thành viên) hay YouTube (ai có link đều xem). */}
          <Button
            size="small"
            style={{
              backgroundColor: loaiLink(record.videoUrl) === 'facebook' ? '#1877f2' : '#ff0000',
              borderColor: loaiLink(record.videoUrl) === 'facebook' ? '#1877f2' : '#cc0000',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            icon={loaiLink(record.videoUrl) === 'facebook' ? <FacebookOutlined style={{ fontSize: 14 }} /> : <YoutubeOutlined style={{ fontSize: 14 }} />}
          >
            {loaiLink(record.videoUrl) === 'facebook' ? 'Xem trên Facebook' : 'Xem Video'}
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
      className: 'no-row-click',
      render: (_, record) => (
        <Space size={4} wrap>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'var(--primary-color)' }} />} onClick={() => openEdit(record)}>Sửa</Button>
          <Button size="small" type="primary" icon={<QrcodeOutlined />} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => setQrSessionId(record.id === qrSessionId ? null : record.id)}>QR</Button>
          <Popconfirm title="Xóa buổi đào tạo?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" type="text" icon={<DeleteOutlined style={{ color: 'var(--danger-color)' }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Số báo cáo 1-1 chờ duyệt — gắn lên nhãn tab cho khỏi nằm im không ai biết
  const soCho1Kem1 = oneOnOneTrainings.filter(o => o.status === 'PENDING').length;

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
                <div
                  style={{ display: 'inline-block', background: '#fff', borderRadius: 16, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '4px solid var(--primary-color)', cursor: 'zoom-in' }}
                  onClick={moToanManHinh}
                  title="Bấm để phóng to toàn màn hình"
                >
                  <img
                    src={anhQR(session.roomCode, qrToken, 180)}
                    alt="QR Code điểm danh"
                    style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
                  />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Mã QR thay đổi sau <strong style={{ color: 'var(--primary-color)' }}>{qrCountdown}s</strong></div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: 2, background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 20 }}>TOKEN: {qrToken}</div>
                  <Progress percent={Math.round((qrCountdown / 10) * 100)} showInfo={false} size="small" style={{ width: 160 }} strokeColor={{ '0%': '#10b981', '100%': '#3b82f6' }} railColor="var(--border-color)" />
                  <Button icon={<FullscreenOutlined />} onClick={moToanManHinh} style={{ marginTop: 4 }}>
                    Phóng to toàn màn hình
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Điểm danh thủ công (Mô phỏng)</h4>
                <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
                  <Select
                    value={scanUserId || undefined}
                    onChange={setScanUserId}
                    style={{ flex: 1 }}
                    placeholder="Gõ tên để tìm nhân viên..."
                    // Gõ không dấu vẫn ra: "linh" → "Bùi Thị Linh"
                    showSearch={{ filterOption: (nhap, o) => khopTen(nhap, o?.label) }}
                    allowClear
                    options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                  />
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

      {/* Mã QR toàn màn hình — chiếu lên máy chiếu cho cả lớp quét */}
      {toanManHinh && qrSessionId && (() => {
        const session = trainingSessions.find(s => s.id === qrSessionId);
        if (!session) return null;
        const daDiemDanh = (session.attendees || []).length;
        return (
          <div
            ref={khungToanManHinh}
            onClick={thoatToanManHinh}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000, background: '#ffffff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 'min(2vh, 20px)', cursor: 'zoom-out', padding: '2vh 2vw',
            }}
          >
            <div style={{ fontSize: 'clamp(18px, 3.2vh, 40px)', fontWeight: 800, color: '#0b0f19', textAlign: 'center', lineHeight: 1.2 }}>
              {session.title}
            </div>
            {/* Cạnh mã QR bám theo cạnh NGẮN của màn hình để không tràn ra ngoài
                dù máy chiếu ngang hay dọc. */}
            <img
              src={anhQR(session.roomCode, qrToken, 1000)}
              alt="QR Code điểm danh"
              style={{ width: 'min(66vh, 78vw)', height: 'min(66vh, 78vw)', imageRendering: 'pixelated' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 32px)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: 'clamp(14px, 2.2vh, 26px)', color: '#475569' }}>
                Đổi mã sau <strong style={{ color: '#10b981' }}>{qrCountdown}s</strong>
              </span>
              <span style={{ fontSize: 'clamp(16px, 2.6vh, 32px)', fontFamily: 'monospace', letterSpacing: 4, fontWeight: 700, color: '#0b0f19', background: '#f1f5f9', padding: '0.4em 0.8em', borderRadius: 12 }}>
                {qrToken}
              </span>
              <span style={{ fontSize: 'clamp(14px, 2.2vh, 26px)', color: '#475569' }}>
                Đã điểm danh <strong style={{ color: '#10b981' }}>{daDiemDanh}</strong>
              </span>
            </div>
            <Button
              icon={<FullscreenExitOutlined />}
              size="large"
              onClick={(e) => { e.stopPropagation(); thoatToanManHinh(); }}
              style={{ position: 'fixed', top: 16, right: 16 }}
            >
              Thoát (Esc)
            </Button>
          </div>
        );
      })()}

      <Tabs
        type="card"
        style={{ marginTop: 20 }}
        // ?tab=oneOnOne — bấm thông báo "báo cáo 1-1 chờ duyệt" là vào thẳng tab đó
        key={searchParams.get('tab') || 'class'}
        defaultActiveKey={searchParams.get('tab') || 'class'}
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
                  size="small"
                  onRow={rowClick(openDetail)}
                  pagination={{ defaultPageSize: 15, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100] }}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            )
          },
          {
            key: 'oneOnOne',
            label: <><TeamOutlined /> Đào tạo 1-1{soCho1Kem1 > 0 && <Tag color="warning" style={{ marginLeft: 8 }}>{soCho1Kem1}</Tag>}</>,
            children: <DaoTao1Kem1 />
          },
          {
            key: 'rsvp',
            label: <><UserDeleteOutlined /> Đơn xin vắng đào tạo</>,
            children: <TrainingRsvpRequests />
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
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>{detailSession.title}</div>
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
          <VideoLinkField form={addForm} />
          <Row gutter={16}>
            <Col span={12}><Form.Item name="maxSlots" label="Số slot tối đa" initialValue={20}><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Thời lượng (phút)" initialValue={120}
                         tooltip="Dùng để biết lúc nào buổi học tự chuyển từ Đang diễn ra sang Đã kết thúc.">
                <Input type="number" min={15} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trainingType" label="Loại đào tạo" initialValue="SKILL">
                <Select options={[
                  { value: 'SKILL', label: 'Đào tạo kỹ năng' },
                  { value: 'PROJECT', label: 'Đào tạo dự án' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="skillGroup" label="Nhóm kỹ năng"
                         tooltip="Các buổi dạy cùng một kỹ năng thì đặt chung mã này. Ai học một buổi trong nhóm là xong cả nhóm, các buổi còn lại tự điểm danh và không cộng điểm thêm.">
                <Input placeholder="VD: CHOT_SALE — để trống nếu buổi đứng riêng" />
              </Form.Item>
            </Col>
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
          <VideoLinkField form={editForm} />
          <Row gutter={16}>
            <Col span={12}><Form.Item name="maxSlots" label="Số slot tối đa"><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Thời lượng (phút)"
                         tooltip="Dùng để biết lúc nào buổi học tự chuyển từ Đang diễn ra sang Đã kết thúc.">
                <Input type="number" min={15} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trainingType" label="Loại đào tạo">
                <Select options={[
                  { value: 'SKILL', label: 'Đào tạo kỹ năng' },
                  { value: 'PROJECT', label: 'Đào tạo dự án' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="skillGroup" label="Nhóm kỹ năng"
                         tooltip="Các buổi dạy cùng một kỹ năng thì đặt chung mã này. Ai học một buổi trong nhóm là xong cả nhóm.">
                <Input placeholder="VD: CHOT_SALE — để trống nếu buổi đứng riêng" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Trạng thái"
                     tooltip="Đến giờ học hệ thống tự chuyển sang Đang diễn ra, hết giờ tự chuyển sang Đã kết thúc. Ô này chỉ dùng khi cần đóng sớm hoặc hủy buổi.">
            <Select options={[{ value: 'UPCOMING', label: 'Sắp diễn ra' }, { value: 'COMPLETED', label: 'Đã hoàn thành' }, { value: 'CANCELLED', label: 'Đã hủy' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
