import { PageContainer } from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { Card, theme } from 'antd';
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
import './styles.css';

const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // 提取 path 参数
  const [mdContent, setMdContent] = useState('');
  const [navVisible, setNavVisible] = useState(true);

  console.log('Blog path:', id);
  useEffect(() => {
    fetch('/md/' + id + '.md')
      .then((res) => res.text())
      .then((text) => setMdContent(text));
  }, [id]); // 添加 path 作为依赖

  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  return (
    <PageContainer header={{ title: '', breadcrumb: undefined }}>
      <Card
        style={{
          borderRadius: 8,
        }}
        styles={{
          body: {
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          },
        }}
      >
        <div className="App">
          <div className="article-container">
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath, remarkGemoji]}
              rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
            >
              {mdContent}
            </Markdown>
          </div>
          <div className={`nav-container ${navVisible ? 'show' : 'hide'}`}>
            <div
              className="toggle-btn"
              onClick={() => {
                setNavVisible(!navVisible);
              }}
            >
              {navVisible ? 'MENU →' : '← MENU'}
            </div>
            <MarkNav source={mdContent} />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Blog;
