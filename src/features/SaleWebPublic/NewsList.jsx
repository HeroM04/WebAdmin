import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Tag, List, Spin, Empty, Pagination, message } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
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

export const NewsSidebar = ({ categories: categoriesProp, tags: tagsProp, onSelectCategory, selectedCategoryId }) => {
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
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Categories Widget */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Chuyên mục</h3>
        <List
          dataSource={categories}
          locale={{ emptyText: 'Chưa có chuyên mục' }}
          renderItem={(item) => (
            <List.Item
              style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9', cursor: 'pointer' }}
              onClick={() => onSelectCategory && onSelectCategory(item)}
            >
              <span style={{ color: selectedCategoryId === item.id ? '#d97706' : '#334155', fontWeight: 500 }}>{item.name}</span>
              <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{item.articleCount}</span>
            </List.Item>
          )}
        />
      </div>

      {/* Tags Widget */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Thẻ</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map((tag) => (
            <Tag key={tag} style={{ padding: '6px 14px', borderRadius: '16px', margin: 0, cursor: 'pointer', border: '1px solid #cbd5e1', color: '#475569', background: '#fff' }}>
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    newsApi.categories().then((d) => setCategories(d || [])).catch(() => {});
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

  return (
    <div className="saleweb-container" style={{ padding: '16px 24px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Trang chủ / Danh sách tin tức</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
            Danh sách tin tức
          </h1>
          <Input
            placeholder="Tìm kiếm tin tức..."
            prefix={<SearchOutlined />}
            style={{ width: '300px', borderRadius: '8px' }}
            size="large"
            allowClear
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
        </div>
      </div>

      {/* Active Filter */}
      {selectedCategory && (
        <div style={{ marginBottom: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
          <span style={{ color: '#64748b' }}>Chuyên mục: <strong style={{ color: '#0f172a' }}>{selectedCategory.name}</strong></span>
          <div
            style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '8px' }}
            onClick={() => { setPage(1); setSelectedCategory(null); }}
          >
            <CloseOutlined style={{ fontSize: '10px', color: '#64748b' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <Spin spinning={loading}>
            {articles.length === 0 && !loading ? (
              <Empty description="Không có tin tức phù hợp" style={{ padding: '60px 0' }} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {articles.map((news) => (
                  <div key={news.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', height: '180px' }}>
                      <img src={news.thumbnail} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {news.categoryName && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#d97706', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px' }}>🏷️</span> {news.categoryName}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.4, textTransform: 'uppercase' }}>{news.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px', flex: 1, lineHeight: 1.6 }}>{news.summary}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatNewsDate(news.publishedAt)}</span>
                        <Link to={`/news/${news.id}`} style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>Đọc thêm</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Spin>

          {total > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <Pagination current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <NewsSidebar
          categories={categories}
          selectedCategoryId={selectedCategory?.id}
          onSelectCategory={(cat) => { setPage(1); setSelectedCategory(cat); }}
        />
      </div>
    </div>
  );
};
