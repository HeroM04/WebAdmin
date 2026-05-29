import React, { useContext, useState } from 'react';
import { Tabs, Table, Button, Card, Row, Col, Avatar, Space, Tag, Modal, Input, message, Badge, Tooltip, Progress, Segmented } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  LaptopOutlined,
  ShareAltOutlined,
  GiftOutlined,
  ScanOutlined,
  HistoryOutlined,
  HourglassOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import { scanPostContent } from '../utils/aiScanner';
import confetti from 'canvas-confetti';

export const ApprovalWorkflow = () => {
  const {
    users,
    deals,
    attendance,
    posts,
    meetings,
    currentUser,
    approveDeal,
    rejectDeal,
    approveAttendance,
    rejectAttendance,
    approvePost,
    rejectPost,
    approveMeeting,
    rejectMeeting
  } = useContext(AppContext);

  const [activeTabKey, setActiveTabKey] = useState('attendance');
  const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING or HISTORY

  // Celebratory confetti trigger
  const triggerCelebration = (projectName, agentName) => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    
    // Double burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6']
      });
    }, 250);
  };

  const getAgentName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Nhân viên ẩn danh';
  };

  const getAgentAvatar = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.avatar : '';
  };

  // --- Sub-actions ---
  const handleApproveDeal = (id, projName, agentId) => {
    approveDeal(id, currentUser.name);
    const agentName = getAgentName(agentId);
    triggerCelebration(projName, agentName);
    message.success(`Đã phê duyệt giao dịch "${projName}" cho ${agentName}. Cộng điểm KPI thành công! 🎉`);
  };

  const handleRejectDeal = (id, projName) => {
    rejectDeal(id, currentUser.name);
    message.warning(`Đã bác bỏ giao dịch "${projName}".`);
  };

  const handleApproveAttendance = (id, agentId) => {
    approveAttendance(id, currentUser.name);
    message.success(`Đã xác thực chấm công cho ${getAgentName(agentId)}. (+10 KPI Chấm công)`);
  };

  const handleRejectAttendance = (id) => {
    rejectAttendance(id, currentUser.name);
    message.warning('Từ chối chấm công ngoại tuyến.');
  };

  const handleApprovePost = (id, agentId) => {
    approvePost(id, currentUser.name);
    message.success(`Đã duyệt bài viết truyền thông cho ${getAgentName(agentId)}. (+15 KPI Lan tỏa)`);
  };

  const handleRejectPost = (id) => {
    rejectPost(id, currentUser.name);
    message.warning('Từ chối bài đăng truyền thông.');
  };

  const handleApproveMeeting = (id, agentId) => {
    approveMeeting(id, currentUser.name);
    message.success(`Đã xác nhận báo cáo cuộc gặp khách hàng của ${getAgentName(agentId)}. (+20 KPI Thực chiến)`);
  };

  const handleRejectMeeting = (id) => {
    rejectMeeting(id, currentUser.name);
    message.warning('Đã từ chối báo cáo cuộc gặp.');
  };

  // --- Data Filter Helpers ---
  const getFilteredData = (dataList) => {
    if (filterStatus === 'PENDING') {
      return dataList.filter(item => item.status === 'PENDING');
    } else {
      return dataList.filter(item => item.status === 'APPROVED' || item.status === 'REJECTED');
    }
  };

  // Pending totals for Badges
  const pendingAttendanceCount = attendance.filter(a => a.status === 'PENDING').length;
  const pendingDealsCount = deals.filter(d => d.status === 'PENDING').length;
  const pendingPostsCount = posts.filter(p => p.status === 'PENDING').length;
  const pendingMeetingsCount = meetings.filter(m => m.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Segment controls to toggle Pending vs History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Phê duyệt các yêu cầu và kích hoạt tích lũy điểm KPI tự động cho Nhân sự.
        </span>
        <Segmented
          options={[
            { label: 'Chờ xử lý', value: 'PENDING', icon: <HourglassOutlined /> },
            { label: 'Lịch sử duyệt', value: 'HISTORY', icon: <HistoryOutlined /> }
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ padding: '4px' }}
        />
      </div>

      <div className="premium-card" style={{ padding: '16px' }}>
        <Tabs 
          activeKey={activeTabKey} 
          onChange={setActiveTabKey}
          items={[
            {
              key: 'attendance',
              label: (
                <Badge count={pendingAttendanceCount} size="small" offset={[10, -2]}>
                  <span style={{ paddingRight: '8px' }}>Chấm công</span>
                </Badge>
              ),
              children: (
                <AttendancePane 
                  data={getFilteredData(attendance)}
                  getAgentName={getAgentName}
                  getAgentAvatar={getAgentAvatar}
                  onApprove={handleApproveAttendance}
                  onReject={handleRejectAttendance}
                  isHistory={filterStatus === 'HISTORY'}
                />
              )
            },
            {
              key: 'meetings',
              label: (
                <Badge count={pendingMeetingsCount} size="small" offset={[10, -2]}>
                  <span style={{ paddingRight: '8px' }}>Thực chiến</span>
                </Badge>
              ),
              children: (
                <MeetingsPane 
                  data={getFilteredData(meetings)}
                  getAgentName={getAgentName}
                  getAgentAvatar={getAgentAvatar}
                  onApprove={handleApproveMeeting}
                  onReject={handleRejectMeeting}
                  isHistory={filterStatus === 'HISTORY'}
                />
              )
            },
            {
              key: 'posts',
              label: (
                <Badge count={pendingPostsCount} size="small" offset={[10, -2]}>
                  <span style={{ paddingRight: '8px' }}>Bài đăng</span>
                </Badge>
              ),
              children: (
                <PostsPane 
                  data={getFilteredData(posts)}
                  getAgentName={getAgentName}
                  getAgentAvatar={getAgentAvatar}
                  onApprove={handleApprovePost}
                  onReject={handleRejectPost}
                  isHistory={filterStatus === 'HISTORY'}
                />
              )
            },
            {
              key: 'deals',
              label: (
                <Badge count={pendingDealsCount} size="small" offset={[10, -2]}>
                  <span style={{ paddingRight: '8px' }}>Chốt căn</span>
                </Badge>
              ),
              children: (
                <DealsPane 
                  data={getFilteredData(deals)}
                  getAgentName={getAgentName}
                  getAgentAvatar={getAgentAvatar}
                  onApprove={handleApproveDeal}
                  onReject={handleRejectDeal}
                  isHistory={filterStatus === 'HISTORY'}
                />
              )
            }
          ]}
        />
      </div>

    </div>
  );
};

// ==========================================
// Sub-pane 1: Chấm công (Attendance Pane)
// ==========================================
const AttendancePane = ({ data, getAgentName, getAgentAvatar, onApprove, onReject, isHistory }) => {
  if (data.length === 0) {
    return <EmptyPlaceholder text={isHistory ? "Chưa có lịch sử chấm công nào." : "Tất cả yêu cầu chấm công đã được duyệt."} />;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
      {data.map((att) => {
        const agentName = getAgentName(att.userId);
        const agentAvatar = getAgentAvatar(att.userId);
        return (
          <Col xs={24} md={12} key={att.id}>
            <Card 
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 12 }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Space>
                  <Avatar src={agentAvatar} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{agentName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Yêu cầu lúc: {new Date(att.checkinTime).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </Space>
                {isHistory ? (
                  <StatusBadge status={att.status} />
                ) : (
                  <Tag color="orange">Chờ duyệt ảnh</Tag>
                )}
              </div>

              {/* Side-by-side Photo Comparison for fraud check */}
              <Row gutter={8} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 4 }}>Ảnh hồ sơ (Avatar)</div>
                  <img 
                    src={agentAvatar} 
                    alt="Profile Avatar" 
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} 
                  />
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 4 }}>Ảnh Chụp Check-in</div>
                  <img 
                    src={att.photoUrl} 
                    alt="Check-in offline" 
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--primary-color)' }} 
                  />
                </Col>
              </Row>

              <div style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 0', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', marginBottom: 12 }}>
                <div>
                  <EnvironmentOutlined style={{ color: 'var(--danger-color)', marginRight: 4 }} />
                  <strong>Vị trí: </strong> {att.gpsLocation}
                </div>
                {att.note && (
                  <div>
                    <InfoCircleOutlined style={{ color: 'var(--info-color)', marginRight: 4 }} />
                    <strong>Ghi chú: </strong> {att.note}
                  </div>
                )}
                {isHistory && att.approvedBy && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Duyệt bởi: <strong>{att.approvedBy}</strong> {att.approvedAt && `lúc ${new Date(att.approvedAt).toLocaleDateString('vi-VN')}`}
                  </div>
                )}
              </div>

              {!isHistory && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button size="small" type="primary" danger ghost icon={<CloseCircleOutlined />} onClick={() => onReject(att.id)}>Từ chối</Button>
                  <Button size="small" type="primary" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} icon={<CheckCircleOutlined />} onClick={() => onApprove(att.id, att.userId)}>Duyệt Check-in</Button>
                </div>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

// ==========================================
// Sub-pane 2: Thực chiến (Meetings Pane)
// ==========================================
const MeetingsPane = ({ data, getAgentName, getAgentAvatar, onApprove, onReject, isHistory }) => {
  if (data.length === 0) {
    return <EmptyPlaceholder text={isHistory ? "Chưa có lịch sử báo cáo thực chiến nào." : "Tất cả báo cáo thực chiến đã được duyệt."} />;
  }

  const columns = [
    {
      title: 'Nhân sự',
      key: 'agent',
      render: (_, record) => (
        <Space>
          <Avatar src={getAgentAvatar(record.userId)} size="small" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getAgentName(record.userId)}</span>
        </Space>
      )
    },
    {
      title: 'Khách hàng',
      key: 'client',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{record.clientName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{record.clientPhone}</div>
        </div>
      )
    },
    {
      title: 'Thời gian & Địa điểm',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            {new Date(record.dateTime).toLocaleString('vi-VN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <EnvironmentOutlined style={{ color: 'var(--danger-color)', marginRight: 2 }} /> {record.location}
          </div>
        </div>
      )
    },
    {
      title: 'Báo cáo tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <FileTextOutlined style={{ marginRight: 4 }} /> {text}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        isHistory ? (
          <div>
            <StatusBadge status={record.status} />
            {record.approvedBy && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: 4 }}>
                {record.approvedBy}
              </div>
            )}
          </div>
        ) : (
          <Tag color="orange">Chờ duyệt</Tag>
        )
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        !isHistory && (
          <Space>
            <Button size="small" type="primary" danger ghost onClick={() => onReject(record.id)}>Từ chối</Button>
            <Button size="small" type="primary" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => onApprove(record.id, record.userId)}>Duyệt</Button>
          </Space>
        )
      )
    }
  ];

  return (
    <div style={{ marginTop: '8px' }}>
      <Table 
        dataSource={data}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

// ==========================================
// Sub-pane 3: Bài đăng (Posts Pane)
// ==========================================
const PostsPane = ({ data, getAgentName, getAgentAvatar, onApprove, onReject, isHistory }) => {
  if (data.length === 0) {
    return <EmptyPlaceholder text={isHistory ? "Chưa có lịch sử duyệt bài đăng nào." : "Tất cả bài viết truyền thông đã được duyệt."} />;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
      {data.map((post) => {
        const agentName = getAgentName(post.userId);
        const agentAvatar = getAgentAvatar(post.userId);
        
        // Scan post caption through simulated AI Scanner
        const aiScanResult = scanPostContent(post.caption);
        
        return (
          <Col xs={24} key={post.id}>
            <Card 
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 12 }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[16, 16]}>
                
                {/* Left Column: Post Details */}
                <Col xs={24} md={14}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Space>
                      <Avatar src={agentAvatar} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{agentName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Chia sẻ qua: <Tag color={post.platform === 'Facebook' ? 'blue' : post.platform === 'Zalo' ? 'cyan' : 'black'}>{post.platform}</Tag>
                        </div>
                      </div>
                    </Space>
                    
                    {isHistory ? (
                      <StatusBadge status={post.status} />
                    ) : (
                      <Tag color="orange">Đang phân tích AI</Tag>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)', marginBottom: 10, whiteSpace: 'pre-wrap' }}>
                    {post.caption}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <ShareAltOutlined /> <strong>Link bài viết:</strong> <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>{post.link}</a>
                  </div>
                  
                  {isHistory && post.approvedBy && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 8 }}>
                      Người duyệt: <strong>{post.approvedBy}</strong> {post.approvedAt && `lúc ${new Date(post.approvedAt).toLocaleDateString('vi-VN')}`}
                    </div>
                  )}
                </Col>

                {/* Right Column: AI Scanner Result Panel */}
                <Col xs={24} md={10}>
                  <div style={{ 
                    height: '100%', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                    borderRadius: 12, 
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 180
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 12 }}>
                        <ScanOutlined style={{ color: 'var(--primary-color)' }} />
                        <span>KẾT QUẢ AI MOCK SCANNER</span>
                      </div>
                      
                      {/* Recommendations tag */}
                      <div style={{ marginBottom: 12 }}>
                        {aiScanResult.suggestion === 'RECOMMEND' ? (
                          <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                            KHUYÊN DUYỆT (MATCH)
                          </Tag>
                        ) : (
                          <Tag color="error" icon={<CloseCircleOutlined />} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                            CẦN XEM XÉT THÊM
                          </Tag>
                        )}
                      </div>

                      {/* Score Indicator */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 2 }}>
                          <span>Độ tương quan từ khóa:</span>
                          <strong>{aiScanResult.score}%</strong>
                        </div>
                        <Progress percent={aiScanResult.score} size="small" showInfo={false} strokeColor={aiScanResult.suggestion === 'RECOMMEND' ? '#10b981' : '#f87171'} />
                      </div>

                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 12 }}>
                        {aiScanResult.reason}
                      </p>
                    </div>

                    {!isHistory && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <Button style={{ flex: 1 }} size="small" type="primary" danger ghost onClick={() => onReject(post.id)}>
                          Bác bỏ
                        </Button>
                        <Button style={{ flex: 1, backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} size="small" type="primary" onClick={() => onApprove(post.id, post.userId)}>
                          Phê Duyệt
                        </Button>
                      </div>
                    )}
                  </div>
                </Col>

              </Row>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

// ==========================================
// Sub-pane 4: Chốt căn (Deals Pane)
// ==========================================
const DealsPane = ({ data, getAgentName, getAgentAvatar, onApprove, onReject, isHistory }) => {
  if (data.length === 0) {
    return <EmptyPlaceholder text={isHistory ? "Chưa có lịch sử duyệt deal nào." : "Tất cả yêu cầu chốt căn đã được duyệt."} />;
  }

  const columns = [
    {
      title: 'Nhân sự chốt',
      key: 'agent',
      render: (_, record) => (
        <Space>
          <Avatar src={getAgentAvatar(record.userId)} size="small" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getAgentName(record.userId)}</span>
        </Space>
      )
    },
    {
      title: 'Tên dự án / BĐS',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
    },
    {
      title: 'Giá trị giao dịch',
      dataIndex: 'price',
      key: 'price',
      render: (val) => (
        <span style={{ fontWeight: 'bold', color: '#ec4899' }}>
          {val.toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      title: 'Hoa hồng nhân viên (3%)',
      dataIndex: 'commission',
      key: 'commission',
      render: (val) => (
        <span style={{ color: 'var(--success-color)', fontWeight: 500 }}>
          + {val.toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      title: 'Khách hàng mua',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{record.customerName}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{record.customerPhone}</div>
        </div>
      )
    },
    {
      title: 'Điểm KPI',
      dataIndex: 'kpiTriggered',
      key: 'kpiTriggered',
      align: 'center',
      render: (kpi) => (
        <Tag color="purple" icon={<GiftOutlined />} style={{ fontWeight: 'bold', padding: '2px 8px' }}>
          +{kpi} pts
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        isHistory ? (
          <div>
            <StatusBadge status={record.status} />
            {record.approvedBy && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: 4 }}>
                Duyệt: {record.approvedBy}
              </div>
            )}
          </div>
        ) : (
          <Tag color="orange">Chờ Deal Approved</Tag>
        )
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        !isHistory && (
          <Space>
            <Button size="small" type="primary" danger ghost onClick={() => onReject(record.id, record.projectName)}>
              Bác bỏ
            </Button>
            <Button size="small" type="primary" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} onClick={() => onApprove(record.id, record.projectName, record.userId)}>
              Duyệt Deal
            </Button>
          </Space>
        )
      )
    }
  ];

  return (
    <div style={{ marginTop: '8px' }}>
      <Table 
        dataSource={data}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

// Shared Helper UI components
const EmptyPlaceholder = ({ text }) => (
  <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
    <LaptopOutlined style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }} />
    <p>{text}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === 'APPROVED') {
    return <span className="glass-badge glass-badge-approved"><CheckCircleOutlined /> Đã Duyệt</span>;
  }
  if (status === 'REJECTED') {
    return <span className="glass-badge glass-badge-rejected"><CloseCircleOutlined /> Đã Hủy</span>;
  }
  return <span className="glass-badge glass-badge-pending">Đang chờ</span>;
};
