import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Spin, Empty, message } from 'antd';
import { ShareAltOutlined, CalendarOutlined, UserOutlined, EyeOutlined, CopyOutlined, FacebookOutlined, LinkOutlined, TagOutlined } from '@ant-design/icons';
import { NewsSidebar, formatNewsDate } from './NewsList';
import { newsApi } from './saleWebApi';
import { transformDriveUrl } from '../SalePro/components/saleProFormat';
import '../../SaleWeb.css';

// Ước tính thời gian đọc
const estimateReadTime = (html) => {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // ~200 từ/phút
};

// Auto-generate TOC từ headings trong content
const extractTOC = (html) => {
  if (!html) return [];
  const items = [];
  const regex = /<(h[2-3])[^>]*>(.*?)<\/\1>/gi;
  let match;
  let idx = 0;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    if (text.trim()) {
      items.push({ id: `heading-${idx}`, text: text.trim(), level: match[1].toLowerCase() });
      idx++;
    }
  }
  return items;
};

// Inject IDs vào headings cho scroll
const injectHeadingIds = (html) => {
  if (!html) return html;
  let idx = 0;
  return html.replace(/<(h[2-3])([^>]*)>/gi, (match, tag, attrs) => {
    const id = `heading-${idx}`;
    idx++;
    return `<${tag}${attrs} id="${id}">`;
  });
};

export const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await newsApi.getById(id);
        if (!active) return;
        setArticle(data);
        // Tin tức cùng chuyên mục (loại trừ bài hiện tại)
        if (data?.categoryId) {
          const rel = await newsApi.list({ categoryId: data.categoryId, size: 7 }).catch(() => null);
          if (active) setRelated((rel?.content || []).filter((a) => a.id !== data.id).slice(0, 6));
        } else {
          setRelated([]);
        }
      } catch (e) {
        if (active) message.error('Không thể tải bài viết.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const toc = useMemo(() => extractTOC(article?.content), [article?.content]);
  const contentWithIds = useMemo(() => injectHeadingIds(article?.content), [article?.content]);
  const readTime = useMemo(() => estimateReadTime(article?.content), [article?.content]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết bài viết!');
    } catch {
      message.warning('Trình duyệt không cho phép truy cập clipboard.');
    }
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return <div className="saleweb-container" style={{ padding: '80px 0', textAlign: 'center' }}><Spin size="large" /></div>;
  }
  if (!article) {
    return <div className="saleweb-container" style={{ padding: '60px 0' }}><Empty description="Không tìm thấy bài viết" /></div>;
  }

  return (
    <div className="saleweb-container animate-fade-in-up" style={{ padding: '16px 24px 40px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link>{' / '}
          <Link to="/news" style={{ color: '#64748b', textDecoration: 'none' }}>Tin tức</Link>{' / '}
          <span style={{ color: '#0f172a' }}>Chi tiết</span>
        </div>
      </div>

      {/* Hero Banner */}
      {article.thumbnail && (
        <div className="sw-news-detail-hero">
          <img src={transformDriveUrl(article.thumbnail)} alt={article.title} />
          <div className="sw-news-detail-hero-overlay">
            {article.categoryName && (
              <div style={{ marginBottom: '10px' }}>
                <span className="sw-news-card-category" style={{ position: 'static' }}>{article.categoryName}</span>
              </div>
            )}
            <h1>{article.title}</h1>
            <div className="sw-news-detail-meta">
              <div className="meta-item">
                <CalendarOutlined /> {formatNewsDate(article.publishedAt)}
              </div>
              <div className="meta-item">
                <UserOutlined /> {article.author || 'Mayhomes'}
              </div>
              <div className="meta-item">
                <EyeOutlined /> {article.viewCount || 0} lượt xem
              </div>
              <div className="meta-item">
                🕐 {readTime} phút đọc
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nếu không có thumbnail, hiển thị title riêng */}
      {!article.thumbnail && (
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '16px', textTransform: 'uppercase' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.88rem', color: '#64748b' }}>
            <span><CalendarOutlined /> {formatNewsDate(article.publishedAt)}</span>
            <span><UserOutlined /> {article.author || 'Mayhomes'}</span>
            <span><EyeOutlined /> {article.viewCount || 0} lượt xem</span>
            <span>🕐 {readTime} phút đọc</span>
          </div>
        </div>
      )}

      <div className="sw-page-flex" style={{ flexWrap: 'wrap' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {/* Share Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div className="sw-share-bar">
              <button className="sw-share-btn facebook" onClick={handleShareFacebook}>
                <FacebookOutlined /> Facebook
              </button>
              <button className="sw-share-btn" onClick={handleShare}>
                <LinkOutlined /> Sao chép link
              </button>
            </div>
          </div>

          {/* Summary */}
          {article.summary && (
            <div className="sw-news-detail-summary">
              <strong>Tóm tắt:</strong> {article.summary}
            </div>
          )}

          {/* Article Content */}
          <div
            className="sw-article-content"
            dangerouslySetInnerHTML={{ __html: contentWithIds || `<p>${article.summary || ''}</p>` }}
          />

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="sw-tags-section">
              <TagOutlined style={{ color: '#64748b', fontSize: '14px', marginTop: '3px' }} />
              {article.tags.map(t => (
                <span key={t} className="sw-tag-chip">{t}</span>
              ))}
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #d4af37', display: 'inline-block', paddingBottom: 8, marginBottom: 24, textTransform: 'uppercase' }}>
                Tin tức liên quan
              </h2>
              <div className="sw-news-grid">
                {related.map((news) => (
                  <div key={news.id} className="sw-news-card">
                    <div className="sw-news-card-img-wrap">
                      <img src={news.thumbnail} alt={news.title} />
                      {news.categoryName && (
                        <div className="sw-news-card-category">{news.categoryName}</div>
                      )}
                    </div>
                    <div className="sw-news-card-body">
                      <Link to={`/news/${news.id}`} className="sw-news-card-title" style={{ textDecoration: 'none' }}>{news.title}</Link>
                      <div className="sw-news-card-summary">{news.summary}</div>
                      <div className="sw-news-card-meta">
                        <span><CalendarOutlined /> {formatNewsDate(news.publishedAt)}</span>
                        <Link to={`/news/${news.id}`}>Đọc thêm →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with TOC + Categories + Tags */}
        <div className="sw-page-sidebar">
          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="sw-toc">
              <h4>Mục lục bài viết</h4>
              <ul className="sw-toc-list">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: item.level === 'h3' ? '16px' : 0 }}>
                    <a href={`#${item.id}`} onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Auto-fetch sidebar */}
          <NewsSidebar />
        </div>
      </div>
    </div>
  );
};
