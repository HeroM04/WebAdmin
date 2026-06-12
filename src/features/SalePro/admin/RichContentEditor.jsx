import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Space, Tooltip, Upload, message } from 'antd';
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  FontSizeOutlined, PictureOutlined, AlignLeftOutlined, EyeOutlined, EyeInvisibleOutlined,
  OrderedListOutlined, UnorderedListOutlined, UploadOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../../utils/apiClient';

const { TextArea } = Input;

/**
 * Trình soạn nội dung theo KHỐI (đoạn văn / tiêu đề / ảnh / quote / list xen kẽ) cho admin.
 * - Tương thích antd Form.Item: nhận value (chuỗi HTML) + onChange(html).
 * - Xuất HTML chuẩn hóa: <p>, <h3>, <figure><img/><figcaption/></figure>, <blockquote>, <ul>/<ol>.
 * - Mở bài cũ: parse HTML về khối (phần không nhận dạng được sẽ thành khối HTML thô).
 * - Hỗ trợ upload ảnh trực tiếp qua API.
 */

let uid = 0;
const newId = () => `blk_${Date.now()}_${uid++}`;

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const blocksToHtml = (blocks) =>
  blocks
    .map((b) => {
      if (b.type === 'h3') return b.text?.trim() ? `<h3>${esc(b.text.trim())}</h3>` : '';
      if (b.type === 'img') {
        if (!b.src?.trim()) return '';
        const cap = b.caption?.trim() ? `<figcaption>${esc(b.caption.trim())}</figcaption>` : '';
        return `<figure><img src="${b.src.trim()}" alt="${esc(b.caption || '')}" />${cap}</figure>`;
      }
      if (b.type === 'quote') {
        return b.text?.trim() ? `<blockquote><p>${esc(b.text.trim())}</p></blockquote>` : '';
      }
      if (b.type === 'ul') {
        const items = (b.text || '').split('\n').map(l => l.trim()).filter(Boolean);
        if (!items.length) return '';
        return `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
      }
      if (b.type === 'ol') {
        const items = (b.text || '').split('\n').map(l => l.trim()).filter(Boolean);
        if (!items.length) return '';
        return `<ol>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
      }
      if (b.type === 'raw') return b.html || '';
      // 'p': mỗi dòng xuống hàng thành 1 đoạn
      return (b.text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${esc(line)}</p>`)
        .join('');
    })
    .filter(Boolean)
    .join('\n');

const htmlToBlocks = (html) => {
  if (!html || !html.trim()) return [{ id: newId(), type: 'p', text: '' }];
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out = [];
    let pBuf = [];
    const flushP = () => {
      if (pBuf.length) {
        out.push({ id: newId(), type: 'p', text: pBuf.join('\n') });
        pBuf = [];
      }
    };
    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        if (t) pBuf.push(t);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName;
      if (tag === 'P') {
        // <p> chứa ảnh -> tách ảnh riêng
        const img = node.querySelector('img');
        if (img) {
          flushP();
          out.push({ id: newId(), type: 'img', src: img.getAttribute('src') || '', caption: '' });
          const t = node.textContent.trim();
          if (t) pBuf.push(t);
        } else {
          const t = node.textContent.trim();
          if (t) pBuf.push(t);
        }
      } else if (tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4') {
        flushP();
        out.push({ id: newId(), type: 'h3', text: node.textContent.trim() });
      } else if (tag === 'IMG') {
        flushP();
        out.push({ id: newId(), type: 'img', src: node.getAttribute('src') || '', caption: '' });
      } else if (tag === 'FIGURE') {
        flushP();
        const img = node.querySelector('img');
        const cap = node.querySelector('figcaption');
        out.push({
          id: newId(), type: 'img',
          src: img ? img.getAttribute('src') || '' : '',
          caption: cap ? cap.textContent.trim() : '',
        });
      } else if (tag === 'BLOCKQUOTE') {
        flushP();
        out.push({ id: newId(), type: 'quote', text: node.textContent.trim() });
      } else if (tag === 'UL') {
        flushP();
        const items = Array.from(node.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);
        out.push({ id: newId(), type: 'ul', text: items.join('\n') });
      } else if (tag === 'OL') {
        flushP();
        const items = Array.from(node.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);
        out.push({ id: newId(), type: 'ol', text: items.join('\n') });
      } else if (tag === 'BR') {
        // bỏ qua
      } else {
        flushP();
        out.push({ id: newId(), type: 'raw', html: node.outerHTML });
      }
    });
    flushP();
    return out.length ? out : [{ id: newId(), type: 'p', text: '' }];
  } catch {
    return [{ id: newId(), type: 'raw', html }];
  }
};

const BLOCK_META = {
  p: { label: 'Đoạn văn', icon: <AlignLeftOutlined />, color: '#3b82f6' },
  h3: { label: 'Tiêu đề mục', icon: <FontSizeOutlined />, color: '#8b5cf6' },
  img: { label: 'Ảnh', icon: <PictureOutlined />, color: '#f59e0b' },
  quote: { label: 'Trích dẫn', icon: <FontSizeOutlined style={{ fontStyle: 'italic' }} />, color: '#d97706' },
  ul: { label: 'Danh sách', icon: <UnorderedListOutlined />, color: '#10b981' },
  ol: { label: 'Danh sách đánh số', icon: <OrderedListOutlined />, color: '#06b6d4' },
  raw: { label: 'HTML', icon: <FontSizeOutlined />, color: '#64748b' },
};

export const RichContentEditor = ({ value, onChange, minBlocks = 1 }) => {
  // Khởi tạo blocks từ value (chỉ parse lần đầu hoặc khi value đổi từ bên ngoài hẳn — vd mở modal sửa bài khác)
  const [blocks, setBlocks] = useState(() => htmlToBlocks(value));
  const lastEmitted = React.useRef(null);
  const [preview, setPreview] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState(null);

  useEffect(() => {
    // Nếu value thay đổi không phải do chính editor phát ra -> re-parse (mở record khác)
    if (value !== lastEmitted.current) {
      setBlocks(htmlToBlocks(value));
    }
  }, [value]);

  const emit = (next) => {
    setBlocks(next);
    const html = blocksToHtml(next);
    lastEmitted.current = html;
    onChange?.(html);
  };

  const update = (id, patch) => emit(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id) => {
    const next = blocks.filter((b) => b.id !== id);
    emit(next.length >= minBlocks ? next : [{ id: newId(), type: 'p', text: '' }]);
  };
  const move = (idx, dir) => {
    const next = [...blocks];
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= next.length) return;
    [next[idx], next[tgt]] = [next[tgt], next[idx]];
    emit(next);
  };
  const add = (type) => emit([...blocks, { id: newId(), type, text: '', src: '', caption: '', html: '' }]);

  // Upload ảnh cho block img
  const handleUploadImage = async (blockId, file) => {
    setUploadingBlockId(blockId);
    try {
      const result = await apiClient.upload('/upload/image', file);
      const url = result?.url || result;
      update(blockId, { src: url });
      message.success('Upload ảnh thành công!');
    } catch (e) {
      message.error('Upload ảnh thất bại.');
    } finally {
      setUploadingBlockId(null);
    }
  };

  const previewHtml = useMemo(() => blocksToHtml(blocks), [blocks]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 10, padding: 14, background: 'var(--bg-secondary, #fafafa)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8c8c8c', lineHeight: 1.4 }}>
          💡 Soạn nội dung theo khối — chèn ảnh xen kẽ giữa các đoạn văn như trang tin chuyên nghiệp.
        </span>
        <Button size="small" icon={preview ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => setPreview(!preview)} type={preview ? 'primary' : 'default'}>
          {preview ? 'Đóng xem trước' : 'Xem trước'}
        </Button>
      </div>

      {preview ? (
        <div className="sw-article-content" style={{ background: '#fff', borderRadius: 10, padding: 20, maxHeight: 500, overflowY: 'auto', border: '1px solid #e2e8f0' }}
          dangerouslySetInnerHTML={{ __html: previewHtml || '<i style="color:#94a3b8">Chưa có nội dung</i>' }} />
      ) : (
        <>
          {blocks.map((b, idx) => {
            const meta = BLOCK_META[b.type] || BLOCK_META.raw;
            return (
              <div key={b.id} style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 10, padding: 12, marginBottom: 8, borderLeft: `3px solid ${meta.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {meta.icon} {meta.label} #{idx + 1}
                  </span>
                  <Space size={2}>
                    <Tooltip title="Lên"><Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => move(idx, -1)} /></Tooltip>
                    <Tooltip title="Xuống"><Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)} /></Tooltip>
                    <Tooltip title="Xóa khối"><Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(b.id)} /></Tooltip>
                  </Space>
                </div>

                {b.type === 'p' && (
                  <TextArea rows={3} placeholder="Nội dung đoạn văn (mỗi dòng = 1 đoạn)..." value={b.text}
                    onChange={(e) => update(b.id, { text: e.target.value })} />
                )}
                {b.type === 'h3' && (
                  <Input placeholder="Tiêu đề mục (vd: Tăng cường ion âm – Vitamin của không khí)" value={b.text}
                    onChange={(e) => update(b.id, { text: e.target.value })} style={{ fontWeight: 700, fontSize: 15 }} />
                )}
                {b.type === 'img' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Upload
                        showUploadList={false}
                        beforeUpload={(file) => { handleUploadImage(b.id, file); return false; }}
                        accept="image/*"
                      >
                        <Button
                          icon={uploadingBlockId === b.id ? <LoadingOutlined /> : <UploadOutlined />}
                          loading={uploadingBlockId === b.id}
                          type="primary"
                          ghost
                          size="small"
                        >
                          {uploadingBlockId === b.id ? 'Đang tải...' : 'Upload ảnh'}
                        </Button>
                      </Upload>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>hoặc</span>
                    </div>
                    <Input placeholder="Nhập URL ảnh (https://...)" value={b.src} onChange={(e) => update(b.id, { src: e.target.value })} />
                    <Input placeholder="Chú thích ảnh (tuỳ chọn)" value={b.caption} onChange={(e) => update(b.id, { caption: e.target.value })} />
                    {b.src && (
                      <img src={b.src} alt="" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'cover', borderRadius: 8, alignSelf: 'flex-start', border: '1px solid #e2e8f0' }} />
                    )}
                  </div>
                )}
                {b.type === 'quote' && (
                  <TextArea
                    rows={2}
                    placeholder="Nội dung trích dẫn (blockquote)..."
                    value={b.text}
                    onChange={(e) => update(b.id, { text: e.target.value })}
                    style={{ borderLeft: '3px solid #d4af37', fontStyle: 'italic', background: '#fefce8' }}
                  />
                )}
                {(b.type === 'ul' || b.type === 'ol') && (
                  <TextArea
                    rows={3}
                    placeholder={`Mỗi dòng = 1 mục trong danh sách...\nVí dụ:\nHồ bơi vô cực\nPhòng gym hiện đại\nCông viên nội khu`}
                    value={b.text}
                    onChange={(e) => update(b.id, { text: e.target.value })}
                  />
                )}
                {b.type === 'raw' && (
                  <TextArea rows={3} placeholder="HTML..." value={b.html} onChange={(e) => update(b.id, { html: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                )}
              </div>
            );
          })}

          {/* Add block buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, padding: '8px 0', borderTop: '1px dashed #e2e8f0' }}>
            <Button size="small" icon={<PlusOutlined />} onClick={() => add('p')} style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Đoạn văn</Button>
            <Button size="small" icon={<FontSizeOutlined />} onClick={() => add('h3')} style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}>Tiêu đề mục</Button>
            <Button size="small" icon={<PictureOutlined />} onClick={() => add('img')} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>Ảnh</Button>
            <Button size="small" icon={<FontSizeOutlined />} onClick={() => add('quote')} style={{ borderColor: '#d97706', color: '#d97706' }}>Trích dẫn</Button>
            <Button size="small" icon={<UnorderedListOutlined />} onClick={() => add('ul')} style={{ borderColor: '#10b981', color: '#10b981' }}>Danh sách</Button>
            <Button size="small" icon={<OrderedListOutlined />} onClick={() => add('ol')} style={{ borderColor: '#06b6d4', color: '#06b6d4' }}>Danh sách số</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RichContentEditor;
