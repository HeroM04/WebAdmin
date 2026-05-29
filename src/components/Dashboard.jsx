import React, { useContext } from 'react';
import { Row, Col, Table, Avatar, Space, Progress, Tag } from 'antd';
import {
  FireOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { calcSalary, formatVND } from '../utils/salaryUtils';

// Premium gradient stat card component
const StatCard = ({ label, value, subtext, color, icon, gradient, onClick, clickable }) => (
  <div
    className="premium-card"
    onClick={onClick}
    style={{
      padding: '20px 24px',
      cursor: clickable ? 'pointer' : 'default',
      background: gradient || 'var(--glass-bg)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(20px)'
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{label}</div>
        <div className="outfit-font" style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>
          {value}
        </div>
        {subtext && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{subtext}</div>}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: color, opacity: 0.15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: 13 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.fill || p.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.value} pts</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard = ({ setActiveTab }) => {
  const {
    departments,
    users,
    kpiScores,
    deals,
    attendance,
    posts,
    meetings
  } = useContext(AppContext);

  const currentMonth = '2026-05';
  const scoresMay = kpiScores.filter(s => s.month === currentMonth);
  const totalKpiPoints = scoresMay.reduce((sum, s) => sum + (s.total || 0), 0);

  const approvedDeals = deals.filter(d => d.status === 'APPROVED');
  const totalRevenue = approvedDeals.reduce((sum, d) => sum + d.price, 0);

  const totalPending = 
    attendance.filter(a => a.status === 'PENDING').length +
    deals.filter(d => d.status === 'PENDING').length +
    posts.filter(p => p.status === 'PENDING').length +
    meetings.filter(m => m.status === 'PENDING').length;

  const activeStaff = users.filter(u => u.status?.toUpperCase() === 'ACTIVE').length;

  const totalCompanySalary = users.reduce((sum, user) => {
    const userDeals = deals.filter(d => d.userId === user.id && d.status === 'APPROVED').length;
    const userScore = kpiScores.find(s => s.userId === user.id && s.month === currentMonth)?.total || 0;
    const salaryData = calcSalary({ staffType: 'OLD', monthType: '4WEEKS', workDays: 26, standardDays: 26, deals: userDeals, kpiPoints: userScore });
    return sum + salaryData.total;
  }, 0);

  // KPI breakdown data by department
  const deptKpiData = departments.map(dept => {
    const deptUsers = users.filter(u => u.deptId === dept.id);
    const userIds = deptUsers.map(u => u.id);
    const scores = kpiScores.filter(s => s.month === currentMonth && userIds.includes(s.userId));
    const att = scores.reduce((sum, s) => sum + (s.attendance || 0), 0);
    const meet = scores.reduce((sum, s) => sum + (s.meeting || 0), 0);
    const post = scores.reduce((sum, s) => sum + (s.post || 0), 0);
    const deal = scores.reduce((sum, s) => sum + (s.deal || 0), 0);
    return {
      name: dept.name.replace('Phòng ', ''),
      'Chấm công': att, 'Thực chiến': meet, 'Bài post': post, 'Chốt căn': deal
    };
  });

  // Pie chart data
  const sumAtt = scoresMay.reduce((sum, s) => sum + (s.attendance || 0), 0);
  const sumMeet = scoresMay.reduce((sum, s) => sum + (s.meeting || 0), 0);
  const sumPost = scoresMay.reduce((sum, s) => sum + (s.post || 0), 0);
  const sumDeal = scoresMay.reduce((sum, s) => sum + (s.deal || 0), 0);

  const pieData = [
    { name: 'Chấm công', value: sumAtt || 10, color: '#1e293b' },
    { name: 'Thực chiến', value: sumMeet || 10, color: '#3b82f6' },
    { name: 'Bài post', value: sumPost || 10, color: '#0ea5e9' },
    { name: 'Chốt căn', value: sumDeal || 10, color: '#14b8a6' }
  ];

  // Trend data
  const trendData = departments.map(dept => {
    const deptUsers = users.filter(u => u.deptId === dept.id);
    const userIds = deptUsers.map(u => u.id);
    const scoresApril = kpiScores.filter(s => s.month === '2026-04' && userIds.includes(s.userId));
    const scoresMayArr = kpiScores.filter(s => s.month === '2026-05' && userIds.includes(s.userId));
    return {
      name: dept.name.replace('Phòng ', ''),
      'Tháng 4': scoresApril.reduce((sum, s) => sum + (s.total || 0), 0),
      'Tháng 5': scoresMayArr.reduce((sum, s) => sum + (s.total || 0), 0)
    };
  });

  // Leaderboard
  const leaderboardData = users
    .map(user => {
      const score = kpiScores.find(s => s.userId === user.id && s.month === currentMonth) || { attendance: 0, meeting: 0, post: 0, deal: 0, total: 0 };
      const dept = departments.find(d => d.id === user.deptId);
      const agentDeals = deals.filter(d => d.userId === user.id && d.status === 'APPROVED');
      const agentDealsValue = agentDeals.reduce((sum, d) => sum + d.price, 0);
      return {
        key: user.id, user, deptName: dept ? dept.name : 'Chưa phân phòng',
        dealsCount: agentDeals.length, dealsValue: agentDealsValue,
        kpi: score.total, breakdown: score
      };
    })
    .sort((a, b) => b.kpi - a.kpi);

  const leaderboardColumns = [
    {
      title: '#',
      key: 'rank', width: 56, align: 'center',
      render: (_, __, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return index < 3
          ? <span style={{ fontSize: 20 }}>{medals[index]}</span>
          : <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 14 }}>{index + 1}</span>;
      }
    },
    {
      title: 'Nhân sự',
      key: 'user',
      render: (user) => (
        <Space>
          <Avatar src={user.user.avatar} size="default" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user.user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.user.role} · {user.deptName.replace('Phòng ', '')}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Deal thành công',
      key: 'deals',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.dealsCount} căn</span>
          <div style={{ fontSize: 11, color: 'var(--success-color)' }}>
            {record.dealsValue > 0 ? `+${(record.dealsValue / 1e9).toFixed(1)} Tỷ` : '—'}
          </div>
        </div>
      )
    },
    {
      title: 'KPI Tháng 5',
      key: 'kpi',
      render: (_, record) => {
        const percent = Math.min(100, (record.kpi / 500) * 100);
        return (
          <div style={{ minWidth: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="outfit-font" style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: 16 }}>
                {record.kpi}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>/ 500 pts</span>
            </div>
            <Progress
              percent={percent} size="small" showInfo={false}
              strokeColor={{ '0%': '#10b981', '100%': '#3b82f6' }}
              railColor="var(--border-color)"
            />
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* 1. Metric Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <StatCard
            label="Tổng Điểm KPI Tháng 5"
            value={totalKpiPoints.toLocaleString()}
            subtext="Từ toàn bộ nhân sự"
            color="#10b981"
            icon={<FireOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <StatCard
            label="Doanh số Chốt căn"
            value={`${(totalRevenue / 1e9).toFixed(1)} Tỷ`}
            subtext={`${approvedDeals.length} giao dịch`}
            color="#ec4899"
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <StatCard
            label="Yêu cầu chờ duyệt"
            value={totalPending}
            subtext={totalPending > 0 ? 'Click để xử lý ngay' : 'Tất cả đã duyệt ✓'}
            color={totalPending > 0 ? '#fbbf24' : '#10b981'}
            icon={<ClockCircleOutlined />}
            clickable={totalPending > 0}
            onClick={() => totalPending > 0 && setActiveTab('manage_attendance')}
          />
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <StatCard
            label="Nhân sự"
            value={activeStaff}
            subtext={`Hoạt động`}
            color="#3b82f6"
            icon={<TeamOutlined />}
          />
        </Col>
      </Row>

      {/* 2. Charts Row */}
      <Row gutter={[16, 16]}>
        
        {/* KPI composition by Department - Stacked Bar */}
        <Col xs={24} lg={16}>
          <div className="premium-card" style={{ height: 380 }}>
            <h3 style={{ marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <ThunderboltOutlined style={{ color: 'var(--primary-color)' }} /> 
              Cơ cấu Điểm KPI theo Phòng ban
              <Tag color="blue" style={{ marginLeft: 'auto', fontSize: 11 }}>Tháng 5/2026</Tag>
            </h3>
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptKpiData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Chấm công" stackId="a" fill="#1e293b" radius={[0,0,0,0]} />
                  <Bar dataKey="Thực chiến" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Bài post" stackId="a" fill="#0ea5e9" />
                  <Bar dataKey="Chốt căn" stackId="a" fill="#14b8a6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* KPI Category Donut */}
        <Col xs={24} lg={8}>
          <div className="premium-card" style={{ height: 380 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', fontWeight: 700 }}>Phân bổ Trọng số KPI</h3>
            <div style={{ height: 220, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)', borderRadius: 8
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span className="outfit-font" style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-color)', display: 'block' }}>KPI</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>T5/2026</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pieData.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.value} pts</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. Trend + Leaderboard */}
      <Row gutter={[16, 16]}>
        
        {/* Trend Area Chart */}
        <Col xs={24} md={10}>
          <div className="premium-card" style={{ height: 400 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiseOutlined style={{ color: '#10b981' }} /> Tăng trưởng KPI theo Tháng
            </h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApril" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorMay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="Tháng 4" stroke="#94a3b8" fill="url(#colorApril)" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8' }} />
                  <Area type="monotone" dataKey="Tháng 5" stroke="#10b981" fill="url(#colorMay)" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Leaderboard */}
        <Col xs={24} md={14}>
          <div className="premium-card" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrophyOutlined style={{ color: '#fbbf24' }} /> Bảng Xếp hạng KPI Nhân sự
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Table
                dataSource={leaderboardData}
                columns={leaderboardColumns}
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: 'max-content' }}
                rowClassName={(record, index) => index === 0 ? 'leaderboard-top-row' : ''}
              />
            </div>
          </div>
        </Col>
      </Row>

    </div>
  );
};
