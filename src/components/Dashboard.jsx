import React, { useContext, useState } from 'react';
import { Row, Col, Table, Avatar, Space, Progress, Tag, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import {
  FireOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
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
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../utils/exportCsv';

// Premium CRM Stat Card
const StatCard = ({ label, value, trend, trendColor, color, icon, onClick, clickable }) => (
  <div
    className="premium-card"
    onClick={onClick}
    style={{
      padding: '16px',
      cursor: clickable ? 'pointer' : 'default',
      background: 'var(--glass-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color
      }}>
        {icon}
      </div>
      {trend && (
        <div style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
          {trend.startsWith('+') ? <RiseOutlined style={{ marginRight: 2 }} /> : <RiseOutlined style={{ marginRight: 2, transform: 'rotate(180deg)' }} />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <div className="outfit-font" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
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

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    departments,
    users,
    kpiScores,
    deals,
    attendance,
    posts,
    meetings
  } = useContext(AppContext);

  const [selectedMonth, setSelectedMonth] = useState(() => dayjs());
  const currentMonthStr = selectedMonth.format('YYYY-MM');
  const previousMonthStr = selectedMonth.subtract(1, 'month').format('YYYY-MM');
  
  const currentMonthLabel = `Tháng ${selectedMonth.format('M/YYYY')}`;
  const prevMonthLabel = `Tháng ${selectedMonth.subtract(1, 'month').format('M')}`;
  const currMonthLabel = `Tháng ${selectedMonth.format('M')}`;

  // Stat Calculations with Trends
  const filterByMonth = (arr, monthStr) => arr.filter(item => item.submittedAt && item.submittedAt.startsWith(monthStr));

  const scoresCurr = kpiScores.filter(s => s.month === currentMonthStr);
  const scoresPrev = kpiScores.filter(s => s.month === previousMonthStr);
  const kpiCurr = scoresCurr.reduce((sum, s) => sum + (s.total || 0), 0);
  const kpiPrev = scoresPrev.reduce((sum, s) => sum + (s.total || 0), 0);

  const dealsCurr = filterByMonth(deals.filter(d => d.status === 'APPROVED'), currentMonthStr);
  const dealsPrev = filterByMonth(deals.filter(d => d.status === 'APPROVED'), previousMonthStr);
  
  const postsCurr = filterByMonth(posts.filter(p => p.status === 'APPROVED'), currentMonthStr);
  const postsPrev = filterByMonth(posts.filter(p => p.status === 'APPROVED'), previousMonthStr);

  const meetingsCurr = filterByMonth(meetings, currentMonthStr);
  const meetingsPrev = filterByMonth(meetings, previousMonthStr);

  const attCurr = filterByMonth(attendance, currentMonthStr);
  const attPrev = filterByMonth(attendance, previousMonthStr);

  const calcTrend = (curr, prev) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };
  
  const getTrendColor = (curr, prev) => curr >= prev ? 'var(--success-color)' : 'var(--danger-color)';

  const totalPending = 
    attendance.filter(a => a.status === 'PENDING').length +
    deals.filter(d => d.status === 'PENDING').length +
    posts.filter(p => p.status === 'PENDING').length +
    meetings.filter(m => m.status === 'PENDING').length;

  // Pie chart data (Cơ cấu KPI)
  const sumAtt = scoresCurr.reduce((sum, s) => sum + (s.attendance || 0), 0);
  const sumMeet = scoresCurr.reduce((sum, s) => sum + (s.meeting || 0), 0);
  const sumPost = scoresCurr.reduce((sum, s) => sum + (s.post || 0), 0);
  const sumDeal = scoresCurr.reduce((sum, s) => sum + (s.deal || 0), 0);

  const pieData = [
    { name: 'Chấm công', value: sumAtt || 10, color: '#64748b' },
    { name: 'Thực chiến', value: sumMeet || 10, color: '#f59e0b' },
    { name: 'Bài post', value: sumPost || 10, color: '#3b82f6' },
    { name: 'Chốt căn', value: sumDeal || 10, color: '#ef4444' } // Red to match design
  ];

  // Combo Chart Data (Doanh số & hoạt động)
  const comboChartData = departments.map(dept => {
    const deptUsers = users.filter(u => u.deptId === dept.id);
    const userIds = deptUsers.map(u => u.id);
    const scoresCurrDept = kpiScores.filter(s => s.month === currentMonthStr && userIds.includes(s.userId));
    return {
      name: dept.name.replace('Phòng ', ''),
      'Chấm công': scoresCurrDept.reduce((sum, s) => sum + (s.attendance || 0), 0),
      'Thực chiến': scoresCurrDept.reduce((sum, s) => sum + (s.meeting || 0), 0),
      'Bài post': scoresCurrDept.reduce((sum, s) => sum + (s.post || 0), 0),
      'Tổng KPI (Line)': scoresCurrDept.reduce((sum, s) => sum + (s.total || 0), 0)
    };
  });

  // Pending Tasks List
  const pendingTasks = [
    ...deals.filter(d => d.status === 'PENDING').map(d => ({ ...d, type: 'Chốt căn', time: d.submittedAt, desc: `Mã: ${d.propertyCode}` })),
    ...attendance.filter(a => a.status === 'PENDING').map(a => ({ ...a, type: 'Chấm công', time: a.submittedAt, desc: a.location })),
    ...posts.filter(p => p.status === 'PENDING').map(p => ({ ...p, type: 'Bài post', time: p.submittedAt, desc: p.caption?.substring(0, 20) })),
    ...meetings.filter(m => m.status === 'PENDING').map(m => ({ ...m, type: 'Thực chiến', time: m.submittedAt, desc: m.meetingType }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  const taskColumns = [
    {
      title: 'Nhân sự',
      key: 'user',
      render: (record) => {
        const u = users.find(user => user.id === record.userId);
        return (
          <Space>
            <Avatar src={u?.avatar} size="small" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u?.name || record.userId}</span>
          </Space>
        );
      }
    },
    {
      title: 'Loại việc',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{type}</span>
      )
    },
    {
      title: 'Chi tiết',
      dataIndex: 'desc',
      key: 'desc',
      render: (text) => <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{text || '—'}</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="warning" style={{ borderRadius: 12 }}>Chờ xử lý</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: () => (
        <Button size="small" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => navigate('/cham-cong')}>Chi tiết</Button>
      )
    }
  ];

  // Leaderboard
  const leaderboardData = users
    .map(user => {
      const score = kpiScores.find(s => s.userId === user.id && s.month === currentMonthStr) || { attendance: 0, meeting: 0, post: 0, deal: 0, total: 0 };
      const dept = departments.find(d => d.id === user.deptId);
      const agentDeals = deals.filter(d => d.userId === user.id && d.status === 'APPROVED' && d.submittedAt && d.submittedAt.startsWith(currentMonthStr));
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
      title: `KPI ${currMonthLabel}`,
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Tổng quan {currentMonthLabel}</h2>
        <Space>
          <DatePicker.MonthPicker 
            value={selectedMonth} 
            onChange={(date) => date && setSelectedMonth(date)} 
            allowClear={false} 
            format="MM/YYYY" 
            size="middle"
            style={{ width: 140 }}
          />
          <Button type="primary" danger icon={<DownloadOutlined />} onClick={() => {
            const exportData = [
              { metric: 'Tổng Điểm KPI', value: kpiCurr, trend: calcTrend(kpiCurr, kpiPrev) },
              { metric: 'Bài viết PR', value: postsCurr.length, trend: calcTrend(postsCurr.length, postsPrev.length) },
              { metric: 'Thực chiến', value: meetingsCurr.length, trend: calcTrend(meetingsCurr.length, meetingsPrev.length) },
              { metric: 'Deal thành công', value: dealsCurr.length, trend: calcTrend(dealsCurr.length, dealsPrev.length) },
              { metric: 'Lượt chấm công', value: attCurr.length, trend: calcTrend(attCurr.length, attPrev.length) }
            ];
            exportToCSV(exportData, [{ title: 'Chỉ số', key: 'metric' }, { title: 'Giá trị', key: 'value' }, { title: 'Tăng trưởng (%)', key: 'trend' }], `Bao_Cao_Tong_Quan_${currentMonthStr}.csv`);
          }}>Xuất báo cáo</Button>
        </Space>
      </div>

      {/* 1. Metric Summary Cards (6 Cards) */}
      <Row gutter={[12, 12]}>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Tổng Điểm KPI"
            value={kpiCurr.toLocaleString()}
            trend={calcTrend(kpiCurr, kpiPrev)}
            trendColor={getTrendColor(kpiCurr, kpiPrev)}
            color="#10b981"
            icon={<FireOutlined />}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Bài viết PR"
            value={postsCurr.length}
            trend={calcTrend(postsCurr.length, postsPrev.length)}
            trendColor={getTrendColor(postsCurr.length, postsPrev.length)}
            color="#3b82f6"
            icon={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Thực chiến"
            value={meetingsCurr.length}
            trend={calcTrend(meetingsCurr.length, meetingsPrev.length)}
            trendColor={getTrendColor(meetingsCurr.length, meetingsPrev.length)}
            color="#f59e0b"
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Deal thành công"
            value={dealsCurr.length}
            trend={calcTrend(dealsCurr.length, dealsPrev.length)}
            trendColor={getTrendColor(dealsCurr.length, dealsPrev.length)}
            color="#ec4899"
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Lượt chấm công"
            value={attCurr.length}
            trend={calcTrend(attCurr.length, attPrev.length)}
            trendColor={getTrendColor(attCurr.length, attPrev.length)}
            color="#8b5cf6"
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <StatCard
            label="Việc cần xử lý"
            value={totalPending}
            color={totalPending > 0 ? '#ef4444' : '#10b981'}
            icon={<ThunderboltOutlined />}
            clickable={totalPending > 0}
            onClick={() => totalPending > 0 && navigate('/cham-cong')}
          />
        </Col>
      </Row>

      {/* 2. Charts Row */}
      <Row gutter={[16, 16]}>
        
        {/* Combo Chart (Doanh số & hoạt động) */}
        <Col xs={24} lg={10}>
          <div className="premium-card" style={{ height: 380, padding: 20 }}>
            <h3 style={{ marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16 }}>
              Doanh số & hoạt động tư vấn
            </h3>
            <div style={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={comboChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Chấm công" stackId="a" fill="#64748b" barSize={12} />
                  <Bar dataKey="Thực chiến" stackId="a" fill="#f59e0b" barSize={12} />
                  <Bar dataKey="Bài post" stackId="a" fill="#ef4444" barSize={12} radius={[4,4,0,0]} />
                  <Line type="monotone" dataKey="Tổng KPI (Line)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* KPI Category Donut */}
        <Col xs={24} lg={6}>
          <div className="premium-card" style={{ height: 380, padding: 20 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>Cơ cấu Lead (KPI)</h3>
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
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{currentMonthLabel}</span>
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
        {/* Leaderboard */}
        <Col xs={24} lg={8}>
          <div className="premium-card" style={{ height: 380, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#ef4444', padding: '12px 20px', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FireOutlined /> Khách nóng / Top nhân sự hôm nay
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
              <Table
                dataSource={leaderboardData}
                columns={leaderboardColumns}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
                showHeader={false}
                rowClassName="hoverable-row"
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. Tasks Table Row */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="premium-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: 'var(--text-secondary)' }} /> Việc cần xử lý 
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>(Mới nhất)</span>
              </h3>
            </div>
            <Table
              dataSource={pendingTasks}
              columns={taskColumns}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Col>
      </Row>

    </div>
  );
};
