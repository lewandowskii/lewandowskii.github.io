import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, useParams } from '@umijs/max';
import { Alert, Button, Drawer, Skeleton, Space, Tag, Typography } from 'antd';
import MarkNav from 'markdown-navbar';
import 'markdown-navbar/dist/navbar.css';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGemoji from 'remark-gemoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import BlogShell from './BlogShell';
import './styles.css';
import { ROUTE_PATHS } from '../../routes/blogRoutes';

const { Text } = Typography;

const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/md/${id}.md`)
      .then((response) => {
        if (!response.ok) throw new Error('Not found');
        return response.text();
      })
      .then(setContent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const readingMinutes = Math.max(3, Math.ceil(content.length / 900));
  const outline = <MarkNav source={content} />;

  return (
    <BlogShell compact>
      <main className="reading-shell">
        <header className="reading-header">
          <Link to={ROUTE_PATHS.home}>
            <Button type="text" icon={<ArrowLeftOutlined />}>
              返回文章列表
            </Button>
          </Link>
          <Space wrap>
            <Tag>源码阅读</Tag>
            <Text type="secondary">
              <ClockCircleOutlined /> 约 {readingMinutes} 分钟
            </Text>
          </Space>
          <Button
            className="outline-trigger"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            目录
          </Button>
        </header>

        <div className="reading-grid">
          <article className="markdown-article">
            {loading && <Skeleton active paragraph={{ rows: 12 }} />}
            {error && (
              <Alert
                type="error"
                showIcon
                message="文章没有找到"
                description="这篇文章可能已移动，返回首页看看其他内容吧。"
              />
            )}
            {!loading && !error && (
              <Markdown
                remarkPlugins={[remarkGfm, remarkMath, remarkGemoji]}
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
              >
                {content}
              </Markdown>
            )}
          </article>
          <aside className="article-outline">
            <Text className="outline-label">ON THIS PAGE</Text>
            {outline}
          </aside>
        </div>
      </main>
      <Drawer
        title="文章目录"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {outline}
      </Drawer>
    </BlogShell>
  );
};

export default Blog;
