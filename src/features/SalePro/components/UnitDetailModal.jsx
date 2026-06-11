import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Tag, Popover, Radio, message, ConfigProvider, Input, List, Spin } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  MessageOutlined,
  SwapOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ExportOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  CloseOutlined,
  HomeOutlined,
  CompassOutlined,
  ExpandOutlined,
  PictureOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { CompareContext } from '../../../context/CompareContext';
import { saleProApi } from '../api/saleProApi';
import LoanCalculatorModal, { SALEPRO_LIGHT_THEME } from './LoanCalculatorModal';
import {
  getStatusMeta,
  formatDirection,
  formatApartmentType,
  formatBillion,
  formatVnd,
  formatArea,
  formatDateTime,
  unitPricePerM2,
  toCompareItem,
} from './saleProFormat';
import './UnitDetail.css';

const FAV_KEY = 'salepro_favorites';

const readFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
};

const Section = ({ title, extra, children }) => (
  <div className="sw-unit-section">
    <div className="sw-unit-section-head">
      <h4>{title}</h4>
      {extra && <div className="sw-unit-section-extra">{extra}</div>}
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, danger, children }) => (
  <div className="sw-unit-row">
    <span className="sw-unit-row-label">{label}</span>
    <span className={`sw-unit-row-value${danger ? ' danger' : ''}`}>{children}</span>
  </div>
);

const UnitDetailModal = ({ open, onClose, apartment, projectName, onStatusUpdated }) => {
  const { addToCompare } = useContext(CompareContext);

  const [loanOpen, setLoanOpen] = useState(false);
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [liked, setLiked] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaForm, setQaForm] = useState({ fullName: '', phone: '', content: '' });
  const [qaSubmitting, setQaSubmitting] = useState(false);

  useEffect(() => {
    if (apartment?.id) setLiked(readFavorites().includes(apartment.id));
  }, [apartment?.id]);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('kpi_current_user'));
    } catch {
      return null;
    }
  }, [open]);
  const isAdmin = currentUser?.role === 'ADMIN';

  if (!apartment) return null;

  const statusMeta = getStatusMeta(apartment.status);
  const imageUrl = apartment.thumbnailUrl && /^https?:\/\//i.test(apartment.thumbnailUrl)
    ? apartment.thumbnailUrl
    : null;
  const pricePerM2 = unitPricePerM2(apartment);

  const toggleFavorite = () => {
    const favorites = readFavorites();
    const next = liked ? favorites.filter((id) => id !== apartment.id) : [...favorites, apartment.id];
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
    setLiked(!liked);
    message.success(liked ? 'Đã bỏ quan tâm căn hộ.' : `Đã thêm ${apartment.apartmentCode} vào danh sách quan tâm!`);
  };

  const handleShare = async () => {
    const text = `${apartment.apartmentCode} – ${projectName || 'Trí Long Land'} – Giá NY: ${formatBillion(apartment.listedPrice)}\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      message.success('Đã sao chép thông tin căn hộ để chia sẻ!');
    } catch {
      message.warning('Trình duyệt không cho phép truy cập clipboard.');
    }
  };

  const handleCompare = () => {
    addToCompare(toCompareItem(apartment), { name: projectName });
  };

  const openLightbox = () => {
    if (imageUrl) setLightboxOpen(true);
    else message.info('Căn hộ này chưa được cập nhật ảnh layout.');
  };

  const handleDownload = () => {
    if (imageUrl) window.open(imageUrl, '_blank', 'noopener');
    else message.info('Căn hộ này chưa được cập nhật ảnh layout.');
  };

  const openQa = async () => {
    setQaOpen(true);
    setQaLoading(true);
    try {
      setQuestions((await saleProApi.getApartmentQuestions(apartment.id)) || []);
    } catch {
      /* danh sách trống nếu lỗi */
    } finally {
      setQaLoading(false);
    }
  };

  const submitQa = async () => {
    if (!qaForm.content?.trim()) {
      message.warning('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    setQaSubmitting(true);
    try {
      await saleProApi.createApartmentQuestion(apartment.id, qaForm);
      message.success('Đã gửi câu hỏi! Quản lý quỹ căn sẽ phản hồi sớm.');
      setQaForm({ fullName: '', phone: '', content: '' });
      setQuestions((await saleProApi.getApartmentQuestions(apartment.id)) || []);
    } catch (e) {
      message.error(e?.message || 'Gửi câu hỏi thất bại (có thể cần đăng nhập).');
    } finally {
      setQaSubmitting(false);
    }
  };

  const handleBookingLock = () => {
    if (isAdmin) {
      setNewStatus(apartment.status);
      setBookingOpen(true);
    } else {
      message.info('Trạng thái quỹ căn do quản trị viên cập nhật thủ công. Vui lòng liên hệ quản lý quỹ căn để khóa căn này.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === apartment.status) {
      setBookingOpen(false);
      return;
    }
    setUpdating(true);
    try {
      const updated = await saleProApi.updateApartmentStatus(apartment.id, newStatus);
      message.success(`Đã cập nhật trạng thái căn ${apartment.apartmentCode}!`);
      onStatusUpdated?.(updated);
      setBookingOpen(false);
    } catch (e) {
      message.error(e?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const policyContent = (
    <div style={{ maxWidth: 320 }}>
      <p style={{ margin: 0 }}><b>CSBH áp dụng:</b> {apartment.salesPolicyApplied || '—'}</p>
      <p style={{ margin: '8px 0 0' }}><b>Quà tặng:</b> {apartment.giftsPromotions || '—'}</p>
    </div>
  );

  return (
    <ConfigProvider theme={SALEPRO_LIGHT_THEME}>
      <Modal
        open={open}
        onCancel={onClose}
        width={1150}
        centered
        destroyOnHidden
        className="sw-unit-modal"
        title={(
          <div className="sw-unit-header">
            <span className="sw-unit-code">{apartment.apartmentCode}</span>
            <div className="sw-unit-listed">
              <div className="sw-unit-listed-line">
                Giá NY:
                <span className="sw-unit-listed-price">{formatBillion(apartment.listedPrice)}</span>
              </div>
              <small>(Giá gồm VAT và KPBT)</small>
            </div>
          </div>
        )}
        footer={(
          <div className="sw-unit-footer">
            <button type="button" className="sw-booking-btn" onClick={handleBookingLock}>
              <CalendarOutlined /> BOOKING LOCK
            </button>
          </div>
        )}
      >
        <div className="sw-unit-body">
          {/* ===== Cột trái: ảnh layout + thông số nhanh ===== */}
          <div>
            <div className="sw-unit-media" onClick={openLightbox}>
              {apartment.status === 'QUY_DOC_QUYEN' && (
                <div className="sw-unit-ribbon" style={{ background: '#dc2626' }}>Quỹ Độc quyền</div>
              )}
              <div className="sw-unit-media-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="sw-unit-glass-btn" title="Xem toàn màn hình" onClick={openLightbox}>
                  <FullscreenOutlined />
                </button>
                <button type="button" className="sw-unit-glass-btn" title="Mở ảnh gốc" onClick={handleDownload}>
                  <DownloadOutlined />
                </button>
                <button type="button" className="sw-unit-glass-btn" title="Chia sẻ" onClick={handleShare}>
                  <ExportOutlined />
                </button>
              </div>
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt={`Layout ${apartment.apartmentCode}`} />
                  <div className="sw-unit-media-hint">Nhấn để xem toàn màn hình</div>
                </>
              ) : (
                <div className="sw-unit-media-fallback">
                  <PictureOutlined />
                  <span>Chưa có ảnh layout cho căn này</span>
                  {apartment.viewDescription && <span style={{ color: '#cbd5e1' }}>{apartment.viewDescription}</span>}
                </div>
              )}
              <button type="button" className="sw-unit-compare-chip" onClick={(e) => { e.stopPropagation(); handleCompare(); }}>
                <SwapOutlined /> So sánh
              </button>
            </div>

            <div className="sw-unit-stats">
              <div className="sw-unit-stat">
                <div className="sw-unit-stat-label"><HomeOutlined /> Loại hình</div>
                <div className="sw-unit-stat-value">{formatApartmentType(apartment.apartmentType)}</div>
              </div>
              <div className="sw-unit-stat">
                <div className="sw-unit-stat-label"><CompassOutlined /> Hướng</div>
                <div className="sw-unit-stat-value">{formatDirection(apartment.direction)}</div>
              </div>
              <div className="sw-unit-stat">
                <div className="sw-unit-stat-label"><ExpandOutlined /> Diện tích</div>
                <div className="sw-unit-stat-value">{formatArea(apartment.clearanceArea)}</div>
              </div>
            </div>

            <div className="sw-unit-quick-actions">
              <Button icon={liked ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />} onClick={toggleFavorite}>
                Quan tâm
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>Chia sẻ</Button>
              <Button icon={<MessageOutlined />} onClick={openQa}>
                Hỏi đáp{apartment.questionCount ? ` (${apartment.questionCount})` : ''}
              </Button>
            </div>
          </div>

          {/* ===== Cột phải: thông tin chi tiết ===== */}
          <div className="sw-unit-info">
            <Section
              title="Giá"
              extra={(
                <>
                  <Button size="small" icon={<ExportOutlined />} iconPlacement="end" onClick={() => setPriceSheetOpen(true)}>
                    Phiếu tính giá
                  </Button>
                  <Button size="small" icon={<CalculatorOutlined />} iconPlacement="end" onClick={() => setLoanOpen(true)}>
                    Tính lãi vay
                  </Button>
                </>
              )}
            >
              <div className="sw-unit-grid-2">
                <InfoRow label="Giá vay:">{formatBillion(apartment.loanPrice)}</InfoRow>
                <InfoRow label="Giá TTTĐ:">{formatBillion(apartment.progressPaymentPrice)}</InfoRow>
                <InfoRow label="Giá TTS:">{formatBillion(apartment.earlyPaymentPrice)}</InfoRow>
                <InfoRow label="Đơn giá:">{pricePerM2 ? `${pricePerM2.toFixed(2)} triệu/m²` : '—'}</InfoRow>
              </div>
              <InfoRow label="Ngân hàng:">{apartment.supportedBanks || '—'}</InfoRow>
            </Section>

            <Section
              title="Diện tích"
              extra={(
                <Button size="small" icon={<ExportOutlined />} iconPlacement="end" onClick={openLightbox}>
                  Layout
                </Button>
              )}
            >
              <div className="sw-unit-grid-2">
                <InfoRow label="DT thông thủy:">{formatArea(apartment.clearanceArea)}</InfoRow>
                <InfoRow label="DT tim tường:">{formatArea(apartment.builtUpArea)}</InfoRow>
              </div>
            </Section>

            <Section
              title="CSBH & Quà tặng"
              extra={(
                <>
                  <Popover content={policyContent} title="Tóm tắt CSBH" trigger="click">
                    <Button size="small" icon={<ExportOutlined />} iconPlacement="end">Tóm tắt</Button>
                  </Popover>
                  <Button size="small" icon={<ExportOutlined />} iconPlacement="end" onClick={() => setPolicyOpen(true)}>
                    Chi tiết
                  </Button>
                </>
              )}
            >
              <InfoRow label="CSBH áp dụng:">{apartment.salesPolicyApplied || '—'}</InfoRow>
              <InfoRow label="Quà tặng:">{apartment.giftsPromotions || '—'}</InfoRow>
            </Section>

            <Section title="Thông tin bàn giao">
              <InfoRow label="Tầng:">{apartment.floor || '—'}</InfoRow>
              <InfoRow label="View:">{apartment.viewDescription || '—'}</InfoRow>
              <InfoRow label="Tiêu chuẩn bàn giao:">{apartment.handoverStandard || '—'}</InfoRow>
              <InfoRow label="Quỹ căn:">{apartment.fundType || '—'}</InfoRow>
            </Section>

            <Section
              title="Trạng thái"
              extra={(
                <Tag
                  style={{
                    color: statusMeta.color,
                    background: statusMeta.bg,
                    borderColor: statusMeta.border,
                    fontWeight: 700,
                    borderRadius: 6,
                    margin: 0,
                  }}
                >
                  {statusMeta.label}
                </Tag>
              )}
            >
              <InfoRow label="Check gần nhất:">{formatDateTime(apartment.updatedAt)}</InfoRow>
            </Section>

            {apartment.agentName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #eef2f7', marginTop: 8 }}>
                <img
                  src={apartment.agentAvatarUrl || 'https://i.pravatar.cc/100'}
                  alt={apartment.agentName}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{apartment.agentName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{apartment.agentTitle || 'Chuyên viên'} · Quản lý</div>
                </div>
                {apartment.agentPhone && (
                  <a href={`tel:${apartment.agentPhone}`} title="Gọi điện"
                     style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneOutlined />
                  </a>
                )}
                <button type="button" title="Hỏi đáp" onClick={openQa}
                        style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageOutlined />
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Lightbox xem ảnh toàn màn hình */}
      {lightboxOpen && imageUrl && (
        <div className="sw-unit-lightbox" onClick={() => setLightboxOpen(false)}>
          <CloseOutlined className="sw-unit-lightbox-close" />
          <img src={imageUrl} alt={`Layout ${apartment.apartmentCode}`} />
        </div>
      )}

      {/* Công cụ tính lãi vay */}
      <LoanCalculatorModal open={loanOpen} onClose={() => setLoanOpen(false)} apartment={apartment} />

      {/* Phiếu tính giá */}
      <Modal
        open={priceSheetOpen}
        onCancel={() => setPriceSheetOpen(false)}
        footer={null}
        width={520}
        centered
        className="sw-unit-modal"
        title={<b>Phiếu tính giá — {apartment.apartmentCode}</b>}
      >
        <InfoRow label="Giá niêm yết (gồm VAT & KPBT):" danger>{formatBillion(apartment.listedPrice)}</InfoRow>
        <InfoRow label="Giá thanh toán sớm (TTS):">{formatBillion(apartment.earlyPaymentPrice)}</InfoRow>
        <InfoRow label="Giá thanh toán tiến độ (TTTĐ):">{formatBillion(apartment.progressPaymentPrice)}</InfoRow>
        <InfoRow label="Giá vay:">{formatBillion(apartment.loanPrice)}</InfoRow>
        <InfoRow label="Đơn giá (theo TTS):">{pricePerM2 ? `${pricePerM2.toFixed(2)} triệu/m²` : '—'}</InfoRow>
        <InfoRow label="Diện tích thông thủy:">{formatArea(apartment.clearanceArea)}</InfoRow>
        <InfoRow label="Ngân hàng hỗ trợ vay:">{apartment.supportedBanks || '—'}</InfoRow>
        {apartment.loanPrice && (
          <InfoRow label="Quy đổi giá vay:">{formatVnd(Number(apartment.loanPrice) * 1e9)} VNĐ</InfoRow>
        )}
      </Modal>

      {/* Chi tiết CSBH & Quà tặng */}
      <Modal
        open={policyOpen}
        onCancel={() => setPolicyOpen(false)}
        footer={null}
        width={520}
        centered
        className="sw-unit-modal"
        title={<b>CSBH & Quà tặng — {apartment.apartmentCode}</b>}
      >
        <Section title="Chính sách bán hàng áp dụng">
          <p style={{ margin: 0, color: '#334155' }}>{apartment.salesPolicyApplied || 'Chưa có thông tin.'}</p>
        </Section>
        <Section title="Quà tặng & Khuyến mãi">
          <p style={{ margin: 0, color: '#334155' }}>{apartment.giftsPromotions || 'Chưa có thông tin.'}</p>
        </Section>
      </Modal>

      {/* BOOKING LOCK — admin cập nhật trạng thái thủ công */}
      <Modal
        open={bookingOpen}
        onCancel={() => setBookingOpen(false)}
        onOk={handleUpdateStatus}
        confirmLoading={updating}
        okText="Xác nhận cập nhật"
        cancelText="Hủy"
        width={460}
        centered
        className="sw-unit-modal"
        title={<b>Cập nhật trạng thái — {apartment.apartmentCode}</b>}
      >
        <p style={{ color: '#64748b', marginTop: 0 }}>
          Hệ thống không hỗ trợ đặt cọc online. Trạng thái quỹ căn do quản trị viên cập nhật thủ công.
        </p>
        <Radio.Group
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {['CON_HANG', 'QUY_DOC_QUYEN', 'DA_BAN'].map((key) => {
            const meta = getStatusMeta(key);
            return (
              <Radio key={key} value={key}>
                <Tag style={{ color: meta.color, background: meta.bg, borderColor: meta.border, fontWeight: 600 }}>
                  {meta.label}
                </Tag>
              </Radio>
            );
          })}
        </Radio.Group>
      </Modal>

      {/* Hỏi đáp */}
      <Modal
        open={qaOpen}
        onCancel={() => setQaOpen(false)}
        footer={null}
        width={560}
        centered
        className="sw-unit-modal"
        title={<b>Hỏi đáp — {apartment.apartmentCode}</b>}
      >
        <Spin spinning={qaLoading}>
          <List
            dataSource={questions}
            locale={{ emptyText: 'Chưa có câu hỏi nào. Hãy là người đầu tiên!' }}
            style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}
            renderItem={(q) => (
              <List.Item style={{ display: 'block' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {q.fullName || 'Khách'} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 12 }}>· {formatDateTime(q.createdAt)}</span>
                </div>
                <div style={{ color: '#334155', margin: '4px 0' }}>{q.content}</div>
                {q.answer && (
                  <div style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', padding: '8px 12px', borderRadius: 6, color: '#166534' }}>
                    <b>{q.answeredBy || 'Quản lý'}:</b> {q.answer}
                  </div>
                )}
              </List.Item>
            )}
          />
        </Spin>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Input placeholder="Họ tên" value={qaForm.fullName} onChange={(e) => setQaForm((f) => ({ ...f, fullName: e.target.value }))} />
          <Input placeholder="Số điện thoại" value={qaForm.phone} onChange={(e) => setQaForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <Input.TextArea rows={3} placeholder="Nội dung câu hỏi..." value={qaForm.content} onChange={(e) => setQaForm((f) => ({ ...f, content: e.target.value }))} style={{ marginBottom: 12 }} />
        <Button type="primary" block loading={qaSubmitting} onClick={submitQa}>Gửi câu hỏi</Button>
      </Modal>
    </ConfigProvider>
  );
};

export default UnitDetailModal;
