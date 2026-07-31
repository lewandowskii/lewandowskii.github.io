import {
  GithubOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from '@umijs/max';
import { Button, Drawer, Input, Layout, Space, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import { ROUTE_PATHS, STUDY_ANCHORS } from '../../routes/blogRoutes';
import './styles.css';

export type TocItem = { id: string; label: string };

const learningNav = [
  { path: ROUTE_PATHS.home, label: '快速入门' },
  { path: ROUTE_PATHS.study.reactRender, label: 'React 渲染之旅' },
  { path: ROUTE_PATHS.study.miniReact, label: '手写 Mini React' },
];

const guideNav = [
  { path: STUDY_ANCHORS.ui, label: '描述 UI' },
  { path: STUDY_ANCHORS.updates, label: '更新界面' },
  { path: STUDY_ANCHORS.reconciliation, label: '协调与 Diff' },
  { path: STUDY_ANCHORS.state, label: '实现状态' },
];

const AtomMark = () => (
  <span className="atom-mark" aria-hidden="true">
    <i />
    <i />
    <i />
    <b />
  </span>
);

const BlogShell: React.FC<
  React.PropsWithChildren<{
    compact?: boolean;
    tocItems?: TocItem[];
    showToc?: boolean;
  }>
> = ({ children, compact = false, tocItems = [], showToc = true }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return learningNav;
    return learningNav.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [query]);

  const isActive = (path: string) =>
    path === ROUTE_PATHS.home
      ? location.pathname === ROUTE_PATHS.home
      : location.pathname === path;

  const navigation = (
    <nav className="docs-sidebar-nav" aria-label="学习导航">
      <p className="docs-nav-heading">起步</p>
      <div className="docs-nav-list">
        {filtered.map((item) => (
          <Link
            className={
              isActive(item.path) ? 'docs-nav-link active' : 'docs-nav-link'
            }
            key={item.path}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <p className="docs-nav-heading docs-nav-divider">学习 React</p>
      <div className="docs-nav-list">
        {guideNav.map((item) => (
          <a className="docs-nav-link" href={item.path} key={item.label}>
            {item.label}
            <span>›</span>
          </a>
        ))}
      </div>
    </nav>
  );

  return (
    <Layout
      className={compact ? 'react-docs-shell is-document' : 'react-docs-shell'}
    >
      <header className="react-docs-header">
        <Link
          className="react-docs-brand"
          to={ROUTE_PATHS.home}
          aria-label="Miao Devlog 首页"
        >
          <AtomMark />
          <b>Miao React</b>
          <small>v0.1</small>
        </Link>
        <Input
          className="docs-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="搜索"
          suffix={<kbd>⌘ K</kbd>}
        />
        <nav className="docs-top-links" aria-label="主导航">
          <Link
            className={location.pathname === ROUTE_PATHS.home ? 'active' : ''}
            to={ROUTE_PATHS.home}
          >
            教程
          </Link>
          <a href="#courses">课程</a>
          <Link to={ROUTE_PATHS.study.reactRender}>源码</Link>
          <a
            href="https://github.com/lewandowskii"
            target="_blank"
            rel="noreferrer"
          >
            社区
          </a>
        </nav>
        <Space className="docs-header-actions" size={4}>
          <Tooltip title="切换主题">
            <Button type="text" shape="circle" icon={<MoonOutlined />} />
          </Tooltip>
          <Tooltip title="语言">
            <Button type="text" shape="circle" icon={<TranslationOutlined />} />
          </Tooltip>
          <Tooltip title="GitHub">
            <Button
              href="https://github.com/lewandowskii"
              target="_blank"
              type="text"
              shape="circle"
              icon={<GithubOutlined />}
            />
          </Tooltip>
          <Button
            className="docs-mobile-menu"
            type="text"
            shape="circle"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        </Space>
      </header>

      {compact ? (
        <div className="docs-page-grid">
          <aside className="docs-left-sidebar">{navigation}</aside>
          <Layout.Content className="docs-main-content">
            {children}
          </Layout.Content>
          {showToc && tocItems.length > 0 && (
            <aside className="docs-right-toc">
              <p>目录</p>
              <nav>
                {tocItems.map((item, index) => (
                  <a
                    className={index === 0 ? 'active' : ''}
                    href={`#${item.id}`}
                    key={item.id}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      ) : (
        <Layout.Content>{children}</Layout.Content>
      )}

      <Drawer
        title="学习 React"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {navigation}
      </Drawer>
    </Layout>
  );
};

export default BlogShell;
