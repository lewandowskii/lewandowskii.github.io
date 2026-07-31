import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, message, Tooltip } from 'antd';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneLight,
  vscDarkPlus,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodeLanguage = 'javascript' | 'jsx' | 'json';

type CodeBlockProps = {
  code: string;
  language?: CodeLanguage;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
  theme?: 'light' | 'dark';
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  title,
  className,
  showLineNumbers = true,
  theme = 'light',
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    message.success('代码已复制');
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className={`code-block ${className ?? ''}`.trim()}>
      <header className="code-block-toolbar">
        <span>{title ?? language}</span>
        <Tooltip title={copied ? '已复制' : '复制代码'}>
          <Button
            type="text"
            size="small"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            aria-label="复制代码"
            onClick={copy}
          />
        </Tooltip>
      </header>
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? vscDarkPlus : oneLight}
        showLineNumbers={showLineNumbers}
        wrapLongLines
        customStyle={{ margin: 0, background: 'transparent' }}
        lineNumberStyle={{
          color: '#a2aab7',
          minWidth: '2.75em',
          paddingRight: '1.2em',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </section>
  );
};

export default CodeBlock;
