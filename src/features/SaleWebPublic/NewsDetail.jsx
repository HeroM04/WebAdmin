import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Spin, Empty, message } from 'antd';
import { ShareAltOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { NewsSidebar, formatNewsDate } from './NewsList';
import { newsApi } from './saleWebApi';
import '../../SaleWeb.css';

export const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await newsApi.getById(id);
        if (active) setArticle(data);
      } catch (e) {
        if (active) message.error('Không thể tải bài viết.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết bài viết!');
    } catch {
      message.warning('Trình duyệt không cho phép truy cập clipboard.');
    }
  };

  if (loading) {
    return <div className="saleweb-container" style={{ padding: '80px 0', textAlign: 'center' }}><Spin size="large" /></div>;
  }
  if (!article) {
    return <div className="saleweb-container" style={{ padding: '60px 0' }}><Empty description="Không tìm thấy bài viết" /></div>;
  }

  return (
    <div className="saleweb-container" style={{ padding: '16px 24px 24px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
          Trang chủ / <Link to="/news" style={{ color: '#64748b' }}>Danh sách tin tức</Link> / Chi tiết
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 320, paddingRight: '16px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '24px', textTransform: 'uppercase' }}>
              {article.title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarOutlined /> <span>{formatNewsDate(article.publishedAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserOutlined /> <span>{article.author || 'Mayhomes'}</span>
                </div>
              </div>
              <Button type="primary" icon={<ShareAltOutlined />} style={{ background: '#3b82f6', borderRadius: '4px' }} onClick={handleShare}>
                Chia sẻ
              </Button>
            </div>
          </div>

          {article.thumbnail && (
            <img src={article.thumbnail} alt={article.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '24px' }} />
          )}

          <div
            style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#1e293b' }}
            dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.summary || ''}</p>` }}
          />
        </div>

        {/* Sidebar (tự fetch chuyên mục/thẻ) */}
        <NewsSidebar />
      </div>
    </div>
  );
};
