import {
  ArrowRightOutlined,
  CodeOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Link } from '@umijs/max';
import { Alert, Button, Card, Divider, Space, Tag, Typography } from 'antd';
import React from 'react';
import { ROUTE_PATHS } from '../../routes/blogRoutes';
import BlogShell from './BlogShell';
import CodeBlock from './CodeBlock';
import './styles.css';

const { Paragraph, Text, Title } = Typography;

const starterCode = `function MyButton() {
  return (
    <button>
      我是一个按钮
    </button>
  );
}

export default function MyApp() {
  return (
    <>
      <h1>从理解 React 开始</h1>
      <MyButton />
    </>
  );
}`;

const Home: React.FC = () => (
  <BlogShell
    compact
    tocItems={[
      { id: 'overview', label: '概览' },
      { id: 'start-here', label: '你将会学到' },
      { id: 'components', label: '创建和嵌套组件' },
      { id: 'courses', label: '继续学习' },
    ]}
  >
    <main className="docs-article docs-home-article">
      <div className="docs-breadcrumb">
        学习 REACT <span>›</span>
      </div>
      <div className="docs-page-tools">
        <Button icon={<CopyOutlined />}>复制页面</Button>
      </div>
      <section id="overview">
        <Title>快速入门</Title>
        <Paragraph className="docs-lead">
          欢迎来到 Miao React
          文档！从这里开始，我们会把源码、渲染和组件模型拆成可以亲手验证的小步骤。
        </Paragraph>
      </section>

      <Card className="docs-learning-card" id="start-here">
        <Title level={2}>你将会学习到</Title>
        <ul>
          <li>如何从 JSX 与 ReactElement 建立正确的心智模型</li>
          <li>如何沿着 Fiber、调度与 Commit 阅读 React 源码</li>
          <li>如何用原生 JavaScript 实现一个 Mini React</li>
          <li>如何理解组件、状态、更新与 Diff 之间的关系</li>
        </ul>
      </Card>

      <section id="components">
        <Title level={2}>创建和嵌套组件</Title>
        <Paragraph>
          React 应用程序是由 <strong>组件</strong> 组成的。组件是 UI
          的一部分，它拥有自己的逻辑和外观。
          组件可以小到一个按钮，也可以大到整页学习工作台。
        </Paragraph>
        <Paragraph>React 组件是返回标签的 JavaScript 函数：</Paragraph>
        <CodeBlock code={starterCode} language="jsx" title="App.jsx" />
      </section>

      <section id="courses" className="docs-next-section">
        <Text className="docs-section-label">继续学习</Text>
        <Title level={2}>从阅读原理，到亲手实现</Title>
        <div className="docs-course-grid">
          <Link
            to={ROUTE_PATHS.study.reactRender}
            className="docs-course-link cyan"
          >
            <CodeOutlined />
            <div>
              <b>React Render Journey</b>
              <span>沿调用链理解 JSX 如何变成 DOM</span>
            </div>
            <ArrowRightOutlined />
          </Link>
          <Link
            to={ROUTE_PATHS.study.miniReact}
            className="docs-course-link purple"
          >
            <CodeOutlined />
            <div>
              <b>Mini React Lab</b>
              <span>用 JavaScript 实现最小渲染运行时</span>
            </div>
            <ArrowRightOutlined />
          </Link>
        </div>
        <Alert
          showIcon
          type="info"
          message="学习建议"
          description="先进入 React 渲染之旅建立地图，再到 Mini React Lab 把关键机制写出来。"
        />
      </section>
      <Divider />
      <Space wrap>
        <Tag color="blue">React 19</Tag>
        <Tag>源码阅读</Tag>
        <Tag>JavaScript</Tag>
      </Space>
    </main>
  </BlogShell>
);

export default Home;
