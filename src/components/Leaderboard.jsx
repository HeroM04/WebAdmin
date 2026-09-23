import React, { useContext, useState } from 'react';
import { Table, Avatar, Typography, DatePicker, Button, Space, Tag, Input } from 'antd';
import { TrophyOutlined, FireOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { exportToCSV } from '../utils/exportCsv';
import { khopTen } from '../utils/locBang';
import { locNguoiChamKpi } from '../utils/vaiTro';

const { Title, Text } = Typography;

const Leaderboard = () => {
  // activeUsers: người đã xóa mềm không lên bảng vinh danh (xem chú thích ở AppContext)
  const { activeUsers, departments, kpiScores } = useContext(AppContext);
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs());
  const [search, setSearch] = useState('');
  const currentMonthStr = selectedMonth.format('YYYY-MM');

  // Tính tổng điểm cho từng user trong tháng.
  // Chỉ khối kinh doanh: Văn phòng và Admin không bị chấm KPI nên không thể
  // đứng chung một bảng xếp hạng — họ luôn 0đ và nằm chót, như thể làm kém.
  const leaderboardData = locNguoiChamKpi(activeUsers)
    .map(user => {
      const score = kpiScores.find(s => s.userId === user.id && s.month === currentMonthStr);
      return {
        key: user.id,
        user: user,
        department: departments.find(d => d.id === user.deptId)?.name || 'Chưa phân bổ',
        totalPoints: score?.total || 0,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  // Lọc SAU khi đánh số hạng: tìm "Liên" phải thấy đúng hạng thật của Liên,
  // không phải hạng 1 vì là người duy nhất còn lại trong danh sách.
  const hienThi = leaderboardData.filter(r => khopTen(search, r.user.name, r.department));

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => {
        let color = '#64748b';
        let icon = null;
        if (rank === 1) { color = '#f59e0b'; icon = <TrophyOutlined style={{ marginRight: 4 }} />; }
        if (rank === 2) color = '#94a3b8';
        if (rank === 3) color = '#b45309';
        
        return (
          <div style={{ fontWeight: 800, color, fontSize: rank <= 3 ? 18 : 14, display: 'flex', alignItems: 'center' }}>
            {icon} #{rank}
          </div>
        );
      }
    },
    {
      title: 'Nhân sự',
      key: 'user',
      render: (record) => (
        <Space>
          <Avatar src={record.user.avatar} size="large" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{record.user.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{record.user.phone}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text.replace('Phòng ', '')}</Tag>
    },
    {
      title: 'Tổng điểm KPI',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      align: 'right',
      render: (points) => (
        <span className="outfit-font" style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary-color)' }}>
          {points.toLocaleString()} pts
        </span>
      )
    }
  ];

  const handleExport = () => {
    // Map to export format
    const exportData = leaderboardData.map(item => ({
      rank: item.rank,
      name: item.user.name,
      phone: item.user.phone,
      department: item.department,
      totalPoints: item.totalPoints
    }));
    const exportCols = [
      { title: 'Hạng', key: 'rank' },
      { title: 'Họ tên', key: 'name' },
      { title: 'SĐT', key: 'phone' },
      { title: 'Phòng ban', key: 'department' },
      { title: 'Tổng điểm KPI', key: 'totalPoints' }
    ];
    exportToCSV(exportData, exportCols, `Bang_Vinh_Danh_${currentMonthStr}.csv`);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#ef4444' }} /> Bảng Vinh Danh
        </h2>
        <Space>
          <Input.Search placeholder="Tìm tên nhân sự, phòng ban..." allowClear style={{ width: 230 }}
                        onChange={e => setSearch(e.target.value)} />
          <DatePicker.MonthPicker 
            value={selectedMonth} 
            onChange={(date) => date && setSelectedMonth(date)} 
            allowClear={false} 
            format="MM/YYYY" 
            size="middle"
          />
          <Button type="primary" danger icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          dataSource={hienThi}
          columns={columns}
          pagination={{ defaultPageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100] }}
          rowClassName={(record) => record.rank <= 3 ? 'leaderboard-top-row' : ''}
        />
      </div>
    </div>
  );
};

export default Leaderboard;
