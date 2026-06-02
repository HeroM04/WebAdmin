import React, { useContext, useState } from 'react';
import { Table, Button, Space, Avatar, Tag, Input, Select, DatePicker, Row, Col, Progress, Popconfirm, message, Drawer, Tooltip, Divider } from 'antd';
import {
  SearchOutlined, FlagOutlined, TrophyOutlined,
  CheckCircleOutlined, WarningOutlined, EyeOutlined,
  HomeOutlined, StarOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Search } = Input;

export const ManageKPI = () => {
  const {
    users, kpiScores, departments, deals, attendance, posts, meetings, trainingSessions, flagKpiRecord
  } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState(() => dayjs().format('YYYY-MM'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const getMaxKpiForMonth = (monthStr) => {
    try {
      const year = parseInt(monthStr.split('-')[0]);
      const month = parseInt(monthStr.split('-')[1]) - 1; // 0-indexed
      let mondays = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        if (new Date(year, month, i).getDay() === 1) { // 1 is Monday
          mondays++;
        }
      }
      return mondays * 100;
    } catch (e) {
      return 400; // fallback
    }
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Chưa phân phòng';
  };

  // Lấy KPI từ API Backend trả về (được lưu trong kpiScores)
  const getKpiRecord = (userId, month) => {
    // API trả về kpiScores chứa { attendance, meeting, post, deal, total, weeklyTotal, isFlagged }
    const record = kpiScores.find(s => s.userId === userId && s.month === month);
    if (record) {
      return {
        ...record,
        displayTotal: record.total,
        hasDeal: record.deal > 0,
        weeklyTotal: record.weeklyTotal,
        components: {
          att: record.attendance,
          meet: record.meeting,
          post: record.post,
          train: 0 // Đào tạo được tính chung vào attendance hoặc meeting từ backend
        }
      };
    }
    return {
      attendance: 0,
      meeting: 0,
      post: 0,
      deal: 0,
      total: 0,
      weeklyTotal: 0,
      displayTotal: 0,
      isFlagged: false,
      hasDeal: false,
      components: { att: 0, meet: 0, post: 0, train: 0 }
    };
  };

  const calculateWeeklyKPI = (userId) => {
    const record = getKpiRecord(userId, monthFilter);
    return {
      total: record.weeklyTotal,
      hasDeal: record.hasDeal,
      components: record.components
    };
  };

  const getMonthlyKPI = (userId, month) => {
    return getKpiRecord(userId, month);
  };

  const handleFlag = (userId) => {
    flagKpiRecord(userId, monthFilter);
    message.success('Đã thay đổi cờ trạng thái KPI cho nhân sự!');
  };

  const filteredUsers = users.filter(u => {
    const matchName = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || u.deptId === deptFilter;
    return matchName && matchDept;
  });

  const isFutureMonth = dayjs(monthFilter, 'YYYY-MM').isAfter(dayjs(), 'month');
  const tableData = isFutureMonth ? [] : filteredUsers;

  const columns = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} style={{ border: '2px solid var(--border-color)' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.name} <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 'normal' }}>({record.id})</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{getDeptName(record.deptId)}</div>
          </div>
        </Space>
      )
    },
    {
      title: dayjs(monthFilter, 'YYYY-MM').isSame(dayjs(), 'month') ? 'KPI Tuần (7 ngày qua)' : 'KPI Tuần cuối tháng',
      key: 'weeklyKpi',
      render: (_, record) => {
        const weekData = calculateWeeklyKPI(record.id);
        const kpiMonthly = getMonthlyKPI(record.id, monthFilter);
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Progress 
                type="circle" 
                percent={weekData.total} 
                size={45} 
                strokeColor={weekData.hasDeal ? '#ec4899' : (weekData.total >= 100 ? '#10b981' : weekData.total >= 50 ? '#fbbf24' : '#3b82f6')}
                format={() => ''}
              />
              <div style={{ position: 'absolute', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {weekData.hasDeal ? <StarOutlined style={{ color: '#ec4899' }} /> : weekData.total}
              </div>
            </div>
            <div>
              {weekData.hasDeal ? (
                <Tag color="magenta" style={{ border: 'none', margin: 0, fontWeight: 600 }}>100% (Chốt căn)</Tag>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{weekData.total} / 100 pts</span>
              )}
              {kpiMonthly.isFlagged && <Tag color="error" style={{ marginLeft: 8, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>CỜ ĐỎ</Tag>}
            </div>
          </div>
        );
      }
    },
    {
      title: 'KPI Tháng',
      key: 'monthlyKpi',
      width: 250,
      render: (_, record) => {
        const monthData = getMonthlyKPI(record.id, monthFilter);
        const maxKpi = getMaxKpiForMonth(monthFilter);
        const percent = Math.min(100, Math.round((monthData.displayTotal / maxKpi) * 100));
        
        return (
          <div style={{ paddingRight: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {monthData.hasDeal ? 'Hoàn thành 100%' : `${monthData.displayTotal} / ${maxKpi} pts`}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{percent}%</span>
            </div>
            <Progress 
              percent={percent} 
              showInfo={false} 
              strokeColor={monthData.hasDeal ? 'linear-gradient(to right, #ec4899, #f43f5e)' : monthData.isFlagged ? '#ef4444' : percent >= 100 ? '#10b981' : '#3b82f6'}
              trailColor="var(--bg-secondary)"
              size="small"
            />
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const monthData = getMonthlyKPI(record.id, monthFilter);
        return (
          <Space>
            <Button size="small" type="text" icon={<EyeOutlined style={{ color: 'var(--info-color)' }} />} onClick={() => { setDetailUser(record); setDrawerOpen(true); }}>
              Chi tiết
            </Button>
            <Tooltip title={monthData.isFlagged ? "Gỡ cờ đỏ" : "Gắn cờ đỏ gian lận"}>
              <Popconfirm 
                title={monthData.isFlagged ? "Bạn muốn gỡ cờ đỏ cho nhân sự này?" : "Gắn cờ đỏ sẽ đánh dấu KPI tháng này có dấu hiệu gian lận. Tiếp tục?"}
                onConfirm={() => handleFlag(record.id)}
                okText="Đồng ý" cancelText="Hủy"
              >
                <Button size="small" type="text" danger={!monthData.isFlagged} icon={<FlagOutlined style={{ color: monthData.isFlagged ? '#ef4444' : 'var(--text-secondary)' }} />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>TỔNG NHÂN SỰ</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{users.length}</div>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>ĐẠT KPI TUẦN</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
              {users.filter(u => calculateWeeklyKPI(u.id).total >= 100).length}
            </div>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="premium-card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>CỜ ĐỎ VI PHẠM</div>
            <div className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>
              {kpiScores.filter(s => s.month === monthFilter && s.isFlagged).length}
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Table */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrophyOutlined style={{ color: 'var(--primary-color)', fontSize: 18 }} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bảng chấm KPI</h3>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Search placeholder="Tìm mã, tên nhân viên..." allowClear style={{ width: 220 }} onChange={e => setSearch(e.target.value)} />
            <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 160 }} options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
            <DatePicker 
              picker="month" 
              value={dayjs(monthFilter, 'YYYY-MM')} 
              onChange={(d, ds) => setMonthFilter(ds)} 
              disabledDate={current => current && current > dayjs().endOf('month')}
              style={{ width: 130 }} 
              allowClear={false} 
            />
          </div>
        </div>
        
        {isFutureMonth ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Chưa có dữ liệu cho tháng này (chưa tới).
          </div>
        ) : (
          <Table 
            dataSource={tableData} 
            columns={columns} 
            rowKey="id" 
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Chưa có dữ liệu' }}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={450}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {detailUser && (() => {
          const mData = getMonthlyKPI(detailUser.id, monthFilter);
          const wData = calculateWeeklyKPI(detailUser.id);
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ 
                background: mData.isFlagged ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : (mData.hasDeal ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'), 
                padding: '32px 28px', position: 'relative', overflow: 'hidden' 
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Space size={16} align="center">
                  <Avatar src={detailUser.avatar} size={64} style={{ border: '3px solid rgba(255,255,255,0.3)' }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{detailUser.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{detailUser.id} • {getDeptName(detailUser.deptId)}</div>
                  </div>
                </Space>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
                
                {mData.isFlagged && (
                  <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <WarningOutlined style={{ color: '#ef4444', fontSize: 18, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>Tài khoản đang bị Cờ Đỏ</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Admin đã đánh dấu gian lận trong các báo cáo tháng này. Chế tài: Reset KPI hoặc Tước thưởng.</div>
                    </div>
                  </div>
                )}

                {mData.hasDeal && (
                  <div style={{ padding: '12px 16px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <HomeOutlined style={{ color: '#ec4899', fontSize: 20 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#ec4899', fontSize: 14 }}>Đặc quyền Chốt Căn</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Đã chốt thành công ít nhất 1 căn. Auto 100% KPI.</div>
                    </div>
                  </div>
                )}

                {/* Phân tích Tuần */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                    TỔNG HỢP TUẦN NÀY
                  </div>
                  <div className="premium-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Điểm đạt được</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: wData.hasDeal ? '#ec4899' : '#10b981', lineHeight: 1, marginTop: 4 }}>
                          {wData.hasDeal ? '100' : wData.total} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>/ 100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tác phong (Chấm công)</span>
                          <span style={{ fontWeight: 600 }}>{wData.components.att} đ</span>
                        </div>
                        <Progress percent={Math.min(100, (wData.components.att / 100) * 100)} showInfo={false} strokeColor="#3b82f6" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Thực chiến (Gặp KH)</span>
                          <span style={{ fontWeight: 600 }}>{wData.components.meet} đ</span>
                        </div>
                        <Progress percent={Math.min(100, (wData.components.meet / 100) * 100)} showInfo={false} strokeColor="#10b981" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Lan tỏa (Mạng xã hội)</span>
                          <span style={{ fontWeight: 600 }}>{wData.components.post} đ</span>
                        </div>
                        <Progress percent={Math.min(100, (wData.components.post / 100) * 100)} showInfo={false} strokeColor="#8b5cf6" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Đào tạo (Tham gia)</span>
                          <span style={{ fontWeight: 600 }}>{wData.components.train} đ</span>
                        </div>
                        <Progress percent={Math.min(100, (wData.components.train / 100) * 100)} showInfo={false} strokeColor="#f59e0b" size="small" />
                      </div>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: 0 }} />

                {/* Phân tích Tháng */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                    TỔNG HỢP THÁNG NÀY ({monthFilter})
                  </div>
                  <div className="premium-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Điểm đạt được</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1, marginTop: 4 }}>
                          {mData.displayTotal} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>/ 400</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Chốt căn ({mData.deal} đ)</span>
                        </div>
                        <Progress percent={Math.min(100, (mData.deal / 100) * 100)} showInfo={false} strokeColor="#ec4899" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Chấm công & Điểm danh ({mData.attendance} đ)</span>
                        </div>
                        <Progress percent={Math.min(100, (mData.attendance / 100) * 100)} showInfo={false} strokeColor="#3b82f6" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Thực chiến ({mData.meeting} đ)</span>
                        </div>
                        <Progress percent={Math.min(100, (mData.meeting / 100) * 100)} showInfo={false} strokeColor="#10b981" size="small" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Lan tỏa ({mData.post} đ)</span>
                        </div>
                        <Progress percent={Math.min(100, (mData.post / 100) * 100)} showInfo={false} strokeColor="#8b5cf6" size="small" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};
