import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Tag, List, Spin, Empty, Pagination, message } from 'antd';
import { SearchOutlined, CloseOutlined, EyeOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { newsApi } from './saleWebApi';
import '../../SaleWeb.css';

const PAGE_SIZE = 9;

export const formatNewsDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const NewsSidebar = ({ categories: categoriesProp, tags: tagsProp, onSelectCategory, selectedCategoryId, popularArticles }) => {
  const [categories, setCategories] = useState(categoriesProp || []);
  const [tags, setTags] = useState(tagsProp || []);

  useEffect(() => {
    if (categoriesProp) { setCategories(categoriesProp); return; }
    newsApi.categories().then((d) => setCategories(d || [])).catch(() => {});
  }, [categoriesProp]);

  useEffect(() => {
    if (tagsProp) { setTags(tagsProp); return; }
    newsApi.tags().then((d) => setTags(d || [])).catch(() => {});
  }, [tagsProp]);

  return (
    <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0 }}>
      {/* Popular Articles Widget */}
      {popularArticles && popularArticles.length > 0 && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '18px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: '2px solid #d4af37', display: 'inline-block' }}>🔥 Tin nổi bật</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {popularArticles.map((article, idx) => (
              <Link key={article.id} to={`/news/${article.id}`} style={{ display: 'flex', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx < 3 ? '#ef4444' : '#e2e8f0', color: idx < 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }}>{article.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '10px' }}>
                    <span><EyeOutlined /> {article.viewCount || 0}</span>
                    <span>{formatNewsDate(article.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories Widget */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '18px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: '2px solid #d4af37', display: 'inline-block' }}>Chuyên mục</h3>
        <List
          dataSource={categories}
          locale={{ emptyText: 'Chưa có chuyên mục' }}
          renderItem={(item) => (
            <List.Item
              style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onSelectCategory && onSelectCategory(item)}
            >
              <span style={{ color: selectedCategoryId === item.id ? '#d97706' : '#334155', fontWeight: selectedCategoryId === item.id ? 700 : 500, transition: 'all 0.2s' }}>{item.name}</span>
              <span style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 'bold', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem' }}>{item.articleCount}</span>
            </List.Item>
          )}
        />
      </div>

      {/* Tags Widget */}
      {tags.length > 0 && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '18px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: '2px solid #d4af37', display: 'inline-block' }}>Thẻ</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tags.map((tag) => (
              <span key={tag} className="sw-tag-chip">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    newsApi.categories().then((d) => setCategories(d || [])).catch(() => {});
    // Lấy top bài viết cho sidebar "Tin nổi bật"
    newsApi.list({ size: 10, sort: 'viewCount,desc' }).then((res) => setAllArticles(res?.content || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await newsApi.list({
          q: q || undefined,
          categoryId: selectedCategory?.id,
          page: page - 1,
          size: PAGE_SIZE,
        });
        if (!active) return;
        setArticles(res?.content || []);
        setTotal(res?.totalElements || 0);
      } catch (e) {
        if (active) message.error('Không thể tải danh sách tin tức.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [q, selectedCategory, page]);

  // Featured = bài đầu tiên (nếu đang trang 1, không filter)
  const showFeatured = page === 1 && !q && !selectedCategory;
  const featured = showFeatured && articles.length > 0 ? articles[0] : null;
  const featuredSide = showFeatured && articles.length > 1 ? articles.slice(1, 4) : [];
  const gridArticles = showFeatured ? articles.slice(featured ? 4 : 0) : articles;

  // Popular for sidebar
  const popular = allArticles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

  return (
    <div className="saleweb-container animate-fade-in-up" style={{ padding: '16px 24px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Trang chủ</Link> / Tin tức
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
            Tin tức <span style={{ color: '#d4af37' }}>bất động sản</span>
          </h1>
          <Input
            placeholder="Tìm kiếm tin tức..."
            prefix={<SearchOutlined />}
            style={{ width: '320px', borderRadius: '8px' }}
            size="large"
            allowClear
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
        </div>
      </div>

      {/* Active Filter */}
      {selectedCategory && (
        <div style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chuyên mục: <strong style={{ color: '#0f172a' }}>{selectedCategory.name}</strong></span>
          <div
            style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px', transition: 'background 0.2s' }}
            onClick={() => { setPage(1); setSelectedCategory(null); }}
          >
            <CloseOutlined style={{ fontSize: '10px', color: '#64748b' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '36px', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Spin spinning={loading}>
            {articles.length === 0 && !loading ? (
              <Empty description="Không có tin tức phù hợp" style={{ padding: '60px 0' }} />
            ) : (
              <>
                {/* Featured Section */}
                {featured && (
                  <div className="sw-news-featured">
                    <Link to={`/news/${featured.id}`} className="sw-news-featured-main">
                      <img src={featured.thumbnail} alt={featured.title} />
                      <div className="sw-news-featured-overlay">
                        {featured.categoryName && (
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ background: '#d97706', padding: '3px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>{featured.categoryName}</span>
                          </div>
                        )}
                        <h2>{featured.title}</h2>
                        <p>{featured.summary}</p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', opacity: 0.75, marginTop: '6px' }}>
                          <span><UserOutlined /> {featured.author || 'Mayhomes'}</span>
                          <span><CalendarOutlined /> {formatNewsDate(featured.publishedAt)}</span>
                          <span><EyeOutlined /> {featured.viewCount || 0} lượt xem</span>
                        </div>
                      </div>
                    </Link>

                    {featuredSide.length > 0 && (
                      <div className="sw-news-featured-side">
                        {featuredSide.map((news) => (
                          <Link key={news.id} to={`/news/${news.id}`} className="sw-news-featured-side-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <img src={news.thumbnail} alt={news.title} />
                            <div className="sw-side-content">
                              {news.categoryName && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>{news.categoryName}</span>
                              )}
                              <h4>{news.title}</h4>
                              <span>{formatNewsDate(news.publishedAt)}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Grid Cards */}
                {gridArticles.length > 0 && (
                  <>
                    {featured && (
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #d4af37', display: 'inline-block', textTransform: 'uppercase' }}>Tin mới nhất</h2>
                    )}
                    <div className="sw-news-grid">
                      {gridArticles.map((news) => (
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
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span><CalendarOutlined /> {formatNewsDate(news.publishedAt)}</span>
                                {news.viewCount > 0 && <span>• <EyeOutlined /> {news.viewCount}</span>}
                              </div>
                              <Link to={`/news/${news.id}`}>Đọc thêm →</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </Spin>

          {total > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
              <Pagination current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <NewsSidebar
          categories={categories}
          selectedCategoryId={selectedCategory?.id}
          onSelectCategory={(cat) => { setPage(1); setSelectedCategory(cat); }}
          popularArticles={popular}
        />
      </div>
    </div>
  );
};
