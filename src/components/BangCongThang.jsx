import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Select, Space, Spin, Tag, Tooltip, message, Empty } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../utils/apiClient';
import { khopTen } from '../utils/locBang';

/*
 * BẢNG CÔNG THÁNG — lưới người × ngày.
 *
 * Danh sách chấm công là danh sách sự kiện, trăm người một tháng là vài nghìn
 * dòng; không ai đọc chấm công theo cách đó. Kế toán, nhân sự đọc theo lưới:
 * mỗi người một hàng, mỗi ngày một ô, một ký hiệu — cả công ty một tháng nằm
 * trong một màn hình, cuộn dọc theo người, cuộn ngang theo ngày.
 *
 * Dữ liệu đã gộp sẵn ở máy chủ (/attendance/monthly-sheet); ở đây chỉ vẽ.
 */

const KY_HIEU = {
  V:  { chu: '✓', mau: '#16a34a', nen: 'rgba(22,163,74,.12)',  ten: 'Đúng giờ' },
  M:  { chu: 'M', mau: '#d97706', nen: 'rgba(217,119,6,.14)',  ten: 'Đi muộn' },
  '?': { chu: '?', mau: '#2563eb', nen: 'rgba(37,99,235,.12)',  ten: 'Ngoài văn phòng, chờ duyệt' },
  R:  { chu: 'R', mau: '#9ca3af', nen: 'rgba(156,163,175,.16)', ten: 'Chấm công bị từ chối' },
  P:  { chu: 'P', mau: '#0891b2', nen: 'rgba(8,145,178,.12)',  ten: 'Vắng có phép' },
  X:  { chu: '✗', mau: '#dc2626', nen: 'rgba(220,38,38,.14)',  ten: 'Vắng không phép' },
  '-': { chu: '·', mau: '#cbd5e1', nen: 'transparent',          ten: 'Chủ nhật' },
  '':  { chu: '',  mau: 'transparent', nen: 'transparent',      ten: '' },
};

const VAI_TRO = { SALE: 'CV', TRUONG_PHONG: 'TP', VAN_PHONG: 'VP', ADMIN: 'AD' };

export const BangCongThang = () => {
  const { departments } = useContext(AppContext);
  const [thang, setThang] = useState(() => dayjs());
  const [dept, setDept] = useState('ALL');
  const [search, setSearch] = useState('');
  const [du, setDu] = useState(null);       // { thang, ngay: [...], hang: [...] }
  const [loading, setLoading] = useState(false);
  const [dangXuat, setDangXuat] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ month: thang.format('YYYY-MM') });
      if (dept !== 'ALL') q.set('departmentId', String(dept));
      const d = await apiClient.get(`/attendance/monthly-sheet?${q.toString()}`);
      setDu(d && d.hang ? d : { ngay: [], hang: [] });
    } catch (e) {
      message.error(e?.message || 'Không tải được bảng công');
      setDu({ ngay: [], hang: [] });
    } finally {
      setLoading(false);
    }
  }, [thang, dept]);

  useEffect(() => { load(); }, [load]);

  const hang = useMemo(() => (du?.hang || []).filter(h => khopTen(search, h.fullName, h.departmentName)), [du, search]);
  const ngay = du?.ngay || [];

  const tongCty = useMemo(() => hang.reduce((a, h) => ({
    cong: a.cong + (h.tong?.cong || 0), muon: a.muon + (h.tong?.muon || 0),
    khongPhep: a.khongPhep + (h.tong?.khongPhep || 0), choDuyet: a.choDuyet + (h.tong?.choDuyet || 0),
  }), { cong: 0, muon: 0, khongPhep: 0, choDuyet: 0 }), [hang]);

  // Xuất Excel: máy chủ đã có sẵn báo cáo tháng (mỗi người một sheet) ở
  // /api/reports/attendance — nằm ngoài /api/v1 nên phải cắt hậu tố.
  const xuatExcel = async () => {
    setDangXuat(true);
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || 'https://kpi-backend-4xex.onrender.com/api/v1').replace(/\/v1\/?$/, '');
      const token = localStorage.getItem('kpi_access_token');
      const res = await fetch(`${base}/reports/attendance?year=${thang.year()}&month=${thang.month() + 1}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Máy chủ trả lỗi ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `BangCong_${thang.format('MM-YYYY')}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      message.error(e?.message || 'Không xuất được Excel');
    } finally {
      setDangXuat(false);
    }
  };

  const O = ({ cell, cn, homNay }) => {
    const k = cell?.k ?? '';
    const m = KY_HIEU[k] || KY_HIEU[''];
    const tip = [m.ten, cell?.vao ? `Vào ${cell.vao}` : null, cell?.ra ? `Ra ${cell.ra}` : null].filter(Boolean).join(' · ');
    const o = (
      <div style={{
        width: 26, height: 24, lineHeight: '24px', textAlign: 'center', borderRadius: 5, fontSize: 12, fontWeight: 700,
        color: m.mau, background: cn ? 'rgba(148,163,184,.08)' : m.nen,
        outline: homNay ? '2px solid var(--primary-color)' : 'none', outlineOffset: -2, cursor: tip ? 'default' : 'inherit',
      }}>{m.chu}</div>
    );
    return tip ? <Tooltip title={tip} mouseEnterDelay={0.2}>{o}</Tooltip> : o;
  };

  const thuNgan = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Space wrap>
        <DatePicker picker="month" value={thang} onChange={d => d && setThang(d)} format="MM/YYYY" allowClear={false} />
        <Select value={dept} onChange={setDept} style={{ width: 190 }}
                options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...(departments || []).map(d => ({ value: d.id, label: d.name }))]} />
        <Input.Search placeholder="Tìm tên..." allowClear style={{ width: 200 }} onChange={e => setSearch(e.target.value)} />
        <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
        <Button icon={<DownloadOutlined />} loading={dangXuat} onClick={xuatExcel}>Xuất Excel</Button>
      </Space>

      <Space wrap size={[14, 6]} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {['V', 'M', '?', 'P', 'X', 'R', '-'].map(k => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <O cell={{ k }} /> {KY_HIEU[k].ten}
          </span>
        ))}
        <span style={{ marginLeft: 8 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{hang.length}</strong> người ·
          công <strong style={{ color: 'var(--text-primary)' }}>{tongCty.cong}</strong> ·
          muộn <strong style={{ color: '#d97706' }}>{tongCty.muon}</strong> ·
          không phép <strong style={{ color: '#dc2626' }}>{tongCty.khongPhep}</strong>
          {tongCty.choDuyet > 0 && <> · <Tag color="processing" style={{ marginLeft: 4 }}>{tongCty.choDuyet} chờ duyệt</Tag></>}
        </span>
      </Space>

      <Spin spinning={loading}>
        {!loading && hang.length === 0 ? (
          <Empty description="Không có ai khớp bộ lọc" />
        ) : (
          <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 330px)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
            <table className="bang-cong" style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: 12, minWidth: '100%' }}>
              <thead>
                <tr>
                  <th className="bc-ten" style={{ zIndex: 3 }}>Nhân sự</th>
                  {ngay.map(n => (
                    <th key={n.ngay} style={{ textAlign: 'center', padding: '4px 2px', color: n.cn ? '#cbd5e1' : 'var(--text-secondary)', fontWeight: 600, minWidth: 30 }}>
                      <div>{n.ngay}</div>
                      <div style={{ fontSize: 9, fontWeight: 500 }}>{thuNgan[n.thu]}</div>
                    </th>
                  ))}
                  <th className="bc-tong" title="Số ngày có chấm công được duyệt">Công</th>
                  <th className="bc-tong" title="Số lần đi muộn">Muộn</th>
                  <th className="bc-tong" title="Số ngày vắng không phép">Vắng</th>
                  <th className="bc-tong" title="Số ngày vắng có phép">Phép</th>
                </tr>
              </thead>
              <tbody>
                {hang.map(h => (
                  <tr key={h.userId}>
                    <td className="bc-ten">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{h.fullName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {(h.departmentName || 'Chưa phân phòng').replace('Phòng ', '')} · {VAI_TRO[h.role] || h.role}
                      </div>
                    </td>
                    {ngay.map(n => (
                      <td key={n.ngay} style={{ padding: '2px 2px', textAlign: 'center' }}>
                        <O cell={h.o?.[String(n.ngay)]} cn={n.cn} homNay={n.homNay} />
                      </td>
                    ))}
                    <td className="bc-tong" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{h.tong?.cong ?? 0}</td>
                    <td className="bc-tong" style={{ fontWeight: 700, color: h.tong?.muon ? '#d97706' : '#cbd5e1' }}>{h.tong?.muon ?? 0}</td>
                    <td className="bc-tong" style={{ fontWeight: 700, color: h.tong?.khongPhep ? '#dc2626' : '#cbd5e1' }}>{h.tong?.khongPhep ?? 0}</td>
                    <td className="bc-tong" style={{ fontWeight: 700, color: h.tong?.coPhep ? '#0891b2' : '#cbd5e1' }}>{h.tong?.coPhep ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default BangCongThang;
