import React, { useCallback, useEffect, useState } from 'react';
import { Segmented, Button, Empty, Spin, Tag, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';

/**
 * Nhật ký điểm KPI của một nhân sự — từng khoản được cộng và bị trừ, kèm lý do.
 *
 * Dùng khi nhân sự thắc mắc "vì sao điểm tôi có bấy nhiêu": bảng tổng chỉ cho
 * con số cuối cùng, còn đây kể lại được từng bước đã ghép nên con số đó.
 */

const MAU_NHOM = {
  attendance: '#3b82f6',
  meeting:    '#10b981',
  post:       '#8b5cf6',
  deal:       '#ec4899',
};

// Tự ghép chuỗi thay vì dùng toLocaleString: bộ định dạng vi-VN trả về dạng
// "11:30 21-08", lệch với "11:30 · 21/08" mà ứng dụng đang hiển thị.
const fmtLuc = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hai = (n) => String(n).padStart(2, '0');
    return `${hai(d.getHours())}:${hai(d.getMinutes())} · ${hai(d.getDate())}/${hai(d.getMonth() + 1)}`;
  } catch { return ''; }
};

export const KpiLedger = ({ userId }) => {
  const [loai, setLoai] = useState('week');
  const [lui, setLui] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loi, setLoi] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoi(null);
    try {
      const d = await apiClient.get(`/kpi-ledger/user/${userId}?type=${loai}&offset=${lui}`);
      setData(d);
    } catch (e) {
      setLoi(e?.message || 'Không tải được nhật ký điểm');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, loai, lui]);

  useEffect(() => { load(); }, [load]);

  // Đổi cách xem thì quay về kỳ hiện tại, tránh lạc sang một kỳ không có gì
  const doiLoai = (v) => { setLoai(v); setLui(0); };

  const items = data?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Segmented
          size="small"
          value={loai}
          onChange={doiLoai}
          options={[{ label: 'Theo tuần', value: 'week' }, { label: 'Theo tháng', value: 'month' }]}
        />
        <Button size="small" type="text" icon={<ReloadOutlined />} onClick={load} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tooltip title={data?.hasOlder ? 'Kỳ trước' : 'Không còn kỳ cũ hơn'}>
          <Button size="small" icon={<LeftOutlined />} disabled={!data?.hasOlder}
                  onClick={() => setLui(lui + 1)} />
        </Tooltip>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
            {data?.periodLabel || '—'}
          </div>
          {data?.isCurrent && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Kỳ hiện tại</div>
          )}
        </div>
        <Tooltip title={data?.isCurrent ? 'Đang ở kỳ mới nhất' : 'Kỳ sau'}>
          <Button size="small" icon={<RightOutlined />} disabled={lui === 0}
                  onClick={() => setLui(lui - 1)} />
        </Tooltip>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : loi ? (
        <Empty description={loi} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          <div className="premium-card" style={{ padding: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Điểm kỳ này</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1.2 }}>
                {data?.periodScore ?? 0}
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}> / {data?.periodMax ?? 0}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Tag color="success" style={{ margin: 0 }}>+{data?.totalPlus ?? 0}đ</Tag>
              <Tag color={data?.totalMinus ? 'error' : 'default'} style={{ margin: 0 }}>{data?.totalMinus ?? 0}đ</Tag>
            </div>
          </div>

          {items.length === 0 ? (
            <Empty description="Kỳ này không có biến động điểm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((it) => {
                const thuc = it.effectivePoints ?? 0;
                const mau = thuc > 0 ? '#16a34a' : (thuc < 0 ? '#dc2626' : '#94a3b8');
                return (
                  <div key={it.id} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                  }}>
                    <span style={{
                      width: 4, alignSelf: 'stretch', borderRadius: 2,
                      background: MAU_NHOM[it.category] || '#94a3b8',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {it.reason}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {it.categoryLabel} · {fmtLuc(it.occurredAt)}
                      </div>
                      {it.capped && (
                        <div style={{ fontSize: 11, color: '#9a3412', marginTop: 4 }}>
                          {thuc === 0
                            ? `Nhóm đã kịch trần tuần nên khoản ${it.points}đ không cộng thêm được`
                            : `Quy định ${it.points}đ, nhóm sắp đầy nên chỉ vào được ${thuc}đ`}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: mau, whiteSpace: 'nowrap' }}>
                      {thuc > 0 ? '+' : ''}{thuc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
