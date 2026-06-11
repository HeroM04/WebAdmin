import React, { useMemo, useState } from 'react';
import { Modal, Slider, InputNumber, Input, Table, ConfigProvider, theme as antdTheme } from 'antd';
import { calcLoanSchedule, formatVnd } from './saleProFormat';
import './UnitDetail.css';

// Modal SalePro luôn dùng giao diện sáng (theo thiết kế mẫu), độc lập với dark theme của app KPI
export const SALEPRO_LIGHT_THEME = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#2563eb',
    colorLink: '#2563eb',
    borderRadius: 8,
    fontFamily: "'Roboto', sans-serif",
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
  },
};

const ResultCard = ({ label, value, color, widthPct }) => (
  <div className="sw-loan-result-card">
    <div className="sw-loan-result-label">{label}</div>
    <div className="sw-loan-result-value">
      {formatVnd(value)}
      <small>VNĐ</small>
    </div>
    <div className="sw-loan-bar-track">
      <div className="sw-loan-bar-fill" style={{ width: `${widthPct}%`, background: color }} />
    </div>
  </div>
);

const scheduleColumns = [
  { title: 'Tháng', dataIndex: 'month', key: 'month', width: 70, align: 'center' },
  { title: 'Dư nợ đầu kỳ', dataIndex: 'opening', key: 'opening', align: 'right', render: (v) => formatVnd(v) },
  { title: 'Gốc trả', dataIndex: 'principal', key: 'principal', align: 'right', render: (v) => formatVnd(v) },
  { title: 'Lãi trả', dataIndex: 'interest', key: 'interest', align: 'right', render: (v) => formatVnd(v) },
  {
    title: 'Gốc + Lãi', dataIndex: 'payment', key: 'payment', align: 'right',
    render: (v) => <b style={{ color: '#0f172a' }}>{formatVnd(v)}</b>,
  },
  { title: 'Dư nợ cuối kỳ', dataIndex: 'closing', key: 'closing', align: 'right', render: (v) => formatVnd(v) },
  { title: 'LS (%/năm)', dataIndex: 'ratePct', key: 'ratePct', width: 90, align: 'center' },
];

const LoanCalculatorModal = ({ open, onClose, apartment }) => {
  // Giá vay lấy theo căn hộ thật (đơn vị tỷ VNĐ trong DB -> quy ra VNĐ)
  const loanPriceVnd = (Number(apartment?.loanPrice ?? apartment?.listedPrice) || 0) * 1e9;

  const [ratioPct, setRatioPct] = useState(80);
  const [prefRatePct, setPrefRatePct] = useState(6.5);
  const [prefYears, setPrefYears] = useState(3);
  const [floatRatePct, setFloatRatePct] = useState(10);
  const [termYears, setTermYears] = useState(20);
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(
    () => calcLoanSchedule({ loanPriceVnd, ratioPct, prefRatePct, prefYears, floatRatePct, termYears }),
    [loanPriceVnd, ratioPct, prefRatePct, prefYears, floatRatePct, termYears],
  );

  const maxAvg = Math.max(result.avgTotal, 1);

  return (
    <ConfigProvider theme={SALEPRO_LIGHT_THEME}>
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnHidden
      className="sw-loan-modal"
      title={<div className="sw-loan-title">Công cụ tính lãi vay</div>}
    >
      <div className="sw-loan-body">
        {/* Cột trái: thông tin khoản vay */}
        <div>
          <div className="sw-loan-col-title">Thông tin khoản vay</div>

          <div className="sw-loan-field">
            <label className="sw-loan-field-label">Giá vay</label>
            <Input value={formatVnd(loanPriceVnd)} disabled suffix="VND" />
          </div>

          <div className="sw-loan-field">
            <label className="sw-loan-field-label">Tỷ lệ vay (%)</label>
            <div className="sw-loan-slider-row">
              <Slider min={0} max={100} step={5} value={ratioPct} onChange={setRatioPct} />
              <div className="sw-loan-ratio-badge">{ratioPct}%</div>
            </div>
            <div className="sw-loan-field-hint">Điều chỉnh tỷ lệ vay dựa trên giá trị căn hộ</div>
          </div>

          <div className="sw-loan-field">
            <label className="sw-loan-field-label">Số tiền vay</label>
            <Input value={formatVnd(result.loanAmount)} disabled suffix="VND" />
          </div>

          <div className="sw-loan-grid-2">
            <div className="sw-loan-field">
              <label className="sw-loan-field-label">Lãi suất ưu đãi<span className="req">*</span></label>
              <InputNumber min={0} max={30} step={0.1} value={prefRatePct} onChange={(v) => setPrefRatePct(v ?? 0)} suffix="%/năm" style={{ width: '100%' }} />
            </div>
            <div className="sw-loan-field">
              <label className="sw-loan-field-label">Thời gian ưu đãi<span className="req">*</span></label>
              <InputNumber min={0} max={termYears} step={1} value={prefYears} onChange={(v) => setPrefYears(v ?? 0)} suffix="năm" style={{ width: '100%' }} />
            </div>
            <div className="sw-loan-field">
              <label className="sw-loan-field-label">Lãi suất thả nổi<span className="req">*</span></label>
              <InputNumber min={0} max={30} step={0.1} value={floatRatePct} onChange={(v) => setFloatRatePct(v ?? 0)} suffix="%/năm" style={{ width: '100%' }} />
            </div>
            <div className="sw-loan-field">
              <label className="sw-loan-field-label">Thời hạn vay<span className="req">*</span></label>
              <InputNumber min={1} max={35} step={1} value={termYears} onChange={(v) => setTermYears(v ?? 1)} suffix="năm" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Cột phải: kết quả phân tích */}
        <div>
          <div className="sw-loan-col-title">Kết quả phân tích</div>
          <ResultCard
            label="Trung bình lãi/tháng"
            value={result.avgInterest}
            color="linear-gradient(90deg, #fbbf24, #f59e0b)"
            widthPct={(result.avgInterest / maxAvg) * 100}
          />
          <ResultCard
            label="Trung bình gốc/tháng"
            value={result.avgPrincipal}
            color="linear-gradient(90deg, #8b5cf6, #6d28d9)"
            widthPct={(result.avgPrincipal / maxAvg) * 100}
          />
          <ResultCard
            label="Trung bình gốc + lãi/tháng"
            value={result.avgTotal}
            color="linear-gradient(90deg, #4ade80, #16a34a)"
            widthPct={100}
          />
          <div className="sw-loan-note">
            Lưu ý: Công cụ tính toán này chỉ hỗ trợ cho việc ước tính khoản vay, không phải là sự
            đảm bảo về khoản vay của Trí Long Land.
          </div>
        </div>
      </div>

      {showSchedule && (
        <>
          <div className="sw-loan-summary-chips">
            <div className="sw-loan-summary-chip">Tổng lãi phải trả:<b>{formatVnd(result.totalInterest)} VNĐ</b></div>
            <div className="sw-loan-summary-chip">Tổng gốc + lãi:<b>{formatVnd(result.totalPayment)} VNĐ</b></div>
            <div className="sw-loan-summary-chip">Số kỳ trả:<b>{result.months} tháng</b></div>
          </div>
          <Table
            size="small"
            rowKey="month"
            columns={scheduleColumns}
            dataSource={result.schedule}
            pagination={{ pageSize: 12, showSizeChanger: false }}
            scroll={{ x: 760 }}
          />
        </>
      )}

      <div className="sw-loan-footer" style={{ marginTop: showSchedule ? 8 : 16 }}>
        <button type="button" className="sw-loan-detail-btn" onClick={() => setShowSchedule((s) => !s)}>
          {showSchedule ? 'Ẩn chi tiết lãi vay theo tháng' : 'Xem chi tiết lãi vay theo tháng'}
        </button>
      </div>
    </Modal>
    </ConfigProvider>
  );
};

export default LoanCalculatorModal;
