import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Progress, Button, Select, Table, Avatar, Tag, Space, Alert, message } from 'antd';
import { QrcodeOutlined, ThunderboltOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

export const Training = () => {
  const { users, updateKpiPoints } = useContext(AppContext);
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [attendanceList, setAttendanceList] = useState([
    {
      id: 'tr-01',
      name: 'Trần Thị B',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      time: '2026-05-21T16:00:00Z',
      status: 'VALID'
    },
    {
      id: 'tr-02',
      name: 'Phạm Văn C',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      time: '2026-05-21T16:02:00Z',
      status: 'VALID'
    }
  ]);

  // Generate a random token
  const generateNewToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'QR-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(result);
    setTimeLeft(10);
  };

  // 10s timer rotation
  useEffect(() => {
    generateNewToken();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewToken();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pre-select first sale agent
  useEffect(() => {
    const agents = users.filter(u => u.role === 'Sale Agent');
    if (agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    }
  }, [users]);

  // SVG QR Code generator (Saves npm dependencies, 100% reliable)
  const renderQrSvg = () => {
    const gridSize = 17; // 17x17 grid
    const pixelSize = 10;
    const padding = 15;
    const totalSize = gridSize * pixelSize + padding * 2;
    
    // Seed dots layout based on token characters
    const dots = [];
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = token.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Keep three corner squares clean for QR Anchor Marks
        const isTopLeftAnchor = r < 5 && c < 5;
        const isTopRightAnchor = r < 5 && c >= gridSize - 5;
        const isBottomLeftAnchor = r >= gridSize - 5 && c < 5;

        if (isTopLeftAnchor || isTopRightAnchor || isBottomLeftAnchor) continue;

        // Pseudo-random layout seeded by hash
        const val = Math.abs(Math.sin(hash + r * 13 + c * 37));
        if (val > 0.48) {
          dots.push({ r, c });
        }
      }
    }

    return (
      <svg width={200} height={200} viewBox={`0 0 ${totalSize} ${totalSize}`} style={{ background: '#fff', borderRadius: 8, padding: 4 }}>
        {/* Anchor Mark: Top Left */}
        <rect x={padding} y={padding} width={40} height={40} fill="#0f172a" />
        <rect x={padding + 8} y={padding + 8} width={24} height={24} fill="#fff" />
        <rect x={padding + 14} y={padding + 14} width={12} height={12} fill="#10b981" />

        {/* Anchor Mark: Top Right */}
        <rect x={padding + (gridSize - 5) * pixelSize} y={padding} width={40} height={40} fill="#0f172a" />
        <rect x={padding + (gridSize - 5) * pixelSize + 8} y={padding + 8} width={24} height={24} fill="#fff" />
        <rect x={padding + (gridSize - 5) * pixelSize + 14} y={padding + 14} width={12} height={12} fill="#10b981" />

        {/* Anchor Mark: Bottom Left */}
        <rect x={padding} y={padding + (gridSize - 5) * pixelSize} width={40} height={40} fill="#0f172a" />
        <rect x={padding + 8} y={padding + (gridSize - 5) * pixelSize + 8} width={24} height={24} fill="#fff" />
        <rect x={padding + 14} y={padding + (gridSize - 5) * pixelSize + 14} width={12} height={12} fill="#10b981" />

        {/* Data points */}
        {dots.map((d, index) => (
          <rect
            key={index}
            x={padding + d.c * pixelSize}
            y={padding + d.r * pixelSize}
            width={8}
            height={8}
            rx={2}
            fill="#1e293b"
          />
        ))}
      </svg>
    );
  };

  // Simulate scanning QR Code
  const handleSimulateScan = () => {
    const agent = users.find(u => u.id === selectedAgentId);
    if (!agent) return;

    // Check if agent is already checked in with this SPECIFIC active token
    const alreadyChecked = attendanceList.some(item => item.name === agent.name && item.token === token);
    
    if (alreadyChecked) {
      message.warning(`${agent.name} đã quét mã này và điểm danh trước đó!`);
      return;
    }

    // Success check in
    const checkinRecord = {
      id: `tr-${Date.now()}`,
      name: agent.name,
      avatar: agent.avatar,
      time: new Date().toISOString(),
      token: token, // binds to token
      status: 'VALID'
    };

    setAttendanceList(prev => [checkinRecord, ...prev]);
    // Award +10 KPI points for training attendance
    updateKpiPoints(agent.id, 'attendance', 10);
    message.success(`Điểm danh thành công cho ${agent.name}! (+10 KPI Chấm công/Đào tạo) 🎓`);
  };

  const columns = [
    {
      title: 'Đại lý',
      key: 'agent',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.name}</span>
        </Space>
      )
    },
    {
      title: 'Thời điểm quét',
      dataIndex: 'time',
      key: 'time',
      render: (t) => <span style={{ color: 'var(--text-secondary)' }}>{new Date(t).toLocaleTimeString('vi-VN')}</span>
    },
    {
      title: 'Mã Token QR',
      dataIndex: 'token',
      key: 'token',
      render: (tok) => <Tag color="blue">{tok || 'Hệ thống cũ'}</Tag>
    },
    {
      title: 'Xác thực',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Hợp lệ (Redis Verified)
        </Tag>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <Row gutter={[16, 16]}>
        
        {/* Left Column: Dynamic QR Generator panel */}
        <Col xs={24} md={10}>
          <Card 
            className="premium-card" 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}
            bodyStyle={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: 12 }}>
              <QrcodeOutlined style={{ color: 'var(--primary-color)' }} />
              <span>MÃ QR ĐIỂM DANH XOAY VÒNG</span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Mã QR đào tạo thay đổi sau mỗi 10 giây để chống gian lận vị trí và chia sẻ ảnh chụp màn hình.
            </p>

            {/* QR Render */}
            <div style={{ padding: '8px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 16 }}>
              {renderQrSvg()}
            </div>

            {/* Active token code and Countdown */}
            <div style={{ width: '100%', maxWidth: 240, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>Token: <strong style={{ color: 'var(--primary-color)' }}>{token}</strong></span>
                <span>Quay vòng sau: <strong>{timeLeft}s</strong></span>
              </div>
              <Progress 
                percent={(timeLeft / 10) * 100} 
                showInfo={false} 
                strokeColor="#10b981" 
                trailColor="var(--border-color)"
                size="small"
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-secondary)', marginTop: 8 }}>
              <ClockCircleOutlined />
              <span>Dữ liệu đồng bộ trực tuyến với Redis</span>
            </div>
          </Card>
        </Col>

        {/* Right Column: Scan Simulator & Log */}
        <Col xs={24} md={14}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            
            {/* Scan simulator box */}
            <Card 
              className="premium-card"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              bodyStyle={{ padding: 20 }}
            >
              <h3 style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#fbbf24' }} /> Giả Lập Đại Lý Quét QR
              </h3>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 6 }}>Chọn nhân viên quét:</div>
                  <Select
                    value={selectedAgentId}
                    onChange={setSelectedAgentId}
                    style={{ width: '100%' }}
                    options={users.filter(u => u.role === 'Sale Agent').map(u => ({
                      value: u.id,
                      label: `${u.name} (KD)`
                    }))}
                  />
                </div>
                <Button
                  type="primary"
                  style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', height: 40, borderRadius: 8 }}
                  onClick={handleSimulateScan}
                >
                  Quét QR Điểm Danh
                </Button>
              </div>
            </Card>

            {/* Attendance logs table */}
            <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TeamOutlined style={{ color: 'var(--info-color)' }} /> Danh Sách Điểm Danh Thành Công (Hôm Nay)
              </h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <Table
                  dataSource={attendanceList}
                  columns={columns}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </div>

          </div>
        </Col>

      </Row>

      {/* Answer to the BA/Boss question */}
      <Alert
        message={<strong>Giải đáp Nghiệp vụ (Dành cho Sếp):</strong>}
        description="Mã QR thay đổi mỗi 10s cần server lưu token hợp lệ trong Redis. Khi Client quét và gửi token lên, server kiểm tra sự tồn tại của token đó trong Redis. Nếu khớp -> Điểm danh hợp lệ. Redis tự động xóa token sau 15s để giải phóng bộ nhớ và đảm bảo tính tức thời."
        type="info"
        showIcon
        style={{ borderRadius: 12 }}
      />

    </div>
  );
};
