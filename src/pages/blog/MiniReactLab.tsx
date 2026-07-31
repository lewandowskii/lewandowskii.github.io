import {
  CodeOutlined,
  CopyOutlined,
  PlayCircleFilled,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Divider,
  message,
  Progress,
  Segmented,
  Space,
  Steps,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';
import BlogShell from './BlogShell';
import CodeBlock from './CodeBlock';
import './styles.css';

const { Paragraph, Text, Title } = Typography;

type Lesson = {
  title: string;
  label: string;
  purpose: string;
  code: string;
  takeaway: string;
  output: string;
};

const lessons: Lesson[] = [
  {
    title: '约定 VNode 形状',
    label: '01 · DATA FIRST',
    purpose: '先不碰 DOM。用普通对象描述“页面想要长什么样”。',
    code: `const text = (value) => ({
  type: 'TEXT_ELEMENT',
  props: { nodeValue: value, children: [] },
});

const h = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.map(child =>
    typeof child === 'object' ? child : text(child)
  )},
});`,
    takeaway: 'VNode 只是数据。它把标签、属性和子节点放进一个可遍历的树结构。',
    output: 'VNode { type: "button", props: { children: [...] } }',
  },
  {
    title: '创建浏览器节点',
    label: '02 · DOM FACTORY',
    purpose: '把 VNode 的 type 翻译成浏览器真正认识的 Element 或 Text。',
    code: `function createDom(vnode) {
  const dom = vnode.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(vnode.type);

  updateDom(dom, {}, vnode.props);
  return dom;
}`,
    takeaway: 'createDom 只负责一个节点；属性与子节点会在后续阶段各自完成。',
    output: 'document.createElement("button")',
  },
  {
    title: '递归挂载整棵树',
    label: '03 · INITIAL RENDER',
    purpose: '让 render 从根节点出发，递归创建并 append 所有子节点。',
    code: `function render(vnode, container) {
  const dom = createDom(vnode);

  vnode.props.children
    .forEach(child => render(child, dom));

  container.appendChild(dom);
}`,
    takeaway: '最小渲染器的核心就是：VNode -> DOM，然后深度优先地把树挂起来。',
    output: '<button>Click me</button>',
  },
  {
    title: '支持函数组件',
    label: '04 · COMPONENTS',
    purpose: '当 type 是函数时，先执行它，得到新的 VNode，再继续渲染。',
    code: `function render(vnode, container) {
  if (typeof vnode.type === 'function') {
    return render(vnode.type(vnode.props), container);
  }

  const dom = createDom(vnode);
  vnode.props.children.forEach(child => render(child, dom));
  container.appendChild(dom);
}`,
    takeaway: '函数组件并不神秘：它只是“输入 props，输出 VNode”的函数。',
    output: 'function Greeting() -> <h2>Hello mini React</h2>',
  },
  {
    title: '记录旧树并做更新',
    label: '05 · RECONCILE',
    purpose: '第二次 render 不能无限 append；保留旧 VNode，比较新旧节点。',
    code: `function commitWork(fiber) {
  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT') {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE') {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }
}`,
    takeaway: '更新的目标不是重建页面，而是把最少的 DOM 变化提交到浏览器。',
    output: 'UPDATE props: { className: "warm" }',
  },
  {
    title: '实现最小 useState',
    label: '06 · STATE LOOP',
    purpose:
      '把 state 放在函数组件对应的 fiber 上；setState 重新创建根工作单元。',
    code: `let wipFiber = null;
let hookIndex = 0;

function useState(initial) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];
  const hook = { state: oldHook?.state ?? initial, queue: [] };
  oldHook?.queue.forEach(action => hook.state = action(hook.state));

  const setState = action => {
    hook.queue.push(action);
    wipRoot = { dom: currentRoot.dom, props: currentRoot.props };
    nextUnitOfWork = wipRoot;
  };
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}`,
    takeaway:
      'Hooks 的关键不是魔法，而是稳定的调用顺序，让每次渲染都能拿回对应状态槽。',
    output: 'count: 0 -> 1 -> 2',
  },
];

const MiniReactLab: React.FC = () => {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [ranThrough, setRanThrough] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const [view, setView] = useState<'dom' | 'vnode'>('dom');
  const [messageApi, contextHolder] = message.useMessage();
  const lesson = lessons[lessonIndex];
  const done = ranThrough.includes(lessonIndex);
  const progress = Math.round((ranThrough.length / lessons.length) * 100);

  const preview = useMemo(() => {
    if (lessonIndex < 2) return null;
    if (lessonIndex === 2)
      return (
        <button className="mini-rendered-button" type="button">
          Click me
        </button>
      );
    if (lessonIndex < 5)
      return <h2 className="mini-greeting">Hello mini React</h2>;
    return (
      <div className="mini-counter">
        <span>count</span>
        <strong>{count}</strong>
        <Button type="primary" onClick={() => setCount((value) => value + 1)}>
          + 1
        </Button>
      </div>
    );
  }, [count, lessonIndex]);

  const runLesson = () => {
    setRanThrough((current) =>
      current.includes(lessonIndex)
        ? current
        : [...current, lessonIndex].sort((a, b) => a - b),
    );
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(lesson.code);
    messageApi.success('当前阶段代码已复制');
  };

  return (
    <BlogShell
      compact
      tocItems={[
        { id: 'mini-roadmap', label: '构建地图' },
        { id: 'mini-workbench', label: '逐步实现' },
        { id: 'mini-runtime', label: '运行时观察器' },
        { id: 'mini-finish', label: '你已经构建了什么' },
      ]}
    >
      {contextHolder}
      <main className="mini-lab-shell">
        <header className="mini-lab-hero">
          <div>
            <Text className="section-kicker">JAVASCRIPT BUILD LAB</Text>
            <Title>
              用 JavaScript，
              <em>造一个小小的 React。</em>
            </Title>
            <Paragraph>
              不依赖构建工具，不省略关键步骤。从一个 VNode
              对象开始，最终做出能更新状态的最小运行时。
            </Paragraph>
            <Space wrap>
              <Tag icon={<CodeOutlined />} color="cyan">
                6 个可运行阶段
              </Tag>
              <Tag icon={<ThunderboltOutlined />} color="gold">
                原生 JavaScript
              </Tag>
            </Space>
          </div>
          <div className="mini-hero-graphic" aria-hidden="true">
            <span className="mini-root">ROOT</span>
            <span className="mini-branch branch-a">h()</span>
            <span className="mini-branch branch-b">DOM</span>
            <span className="mini-branch branch-c">STATE</span>
          </div>
        </header>

        <section className="mini-roadmap" id="mini-roadmap">
          <div className="mini-roadmap-meta">
            <span>BUILD PROGRESS</span>
            <b>
              {ranThrough.length} / {lessons.length}
            </b>
          </div>
          <Progress percent={progress} showInfo={false} strokeColor="#20b8c5" />
          <Steps
            current={lessonIndex}
            responsive
            onChange={setLessonIndex}
            items={lessons.map((item, index) => ({
              title: String(index + 1).padStart(2, '0'),
              description: item.title,
              status: ranThrough.includes(index) ? 'finish' : undefined,
            }))}
          />
        </section>

        <section className="mini-workbench" id="mini-workbench">
          <div className="mini-lesson-copy">
            <Text className="section-kicker">{lesson.label}</Text>
            <Title level={2}>{lesson.title}</Title>
            <Paragraph>{lesson.purpose}</Paragraph>
            <Alert
              type="info"
              showIcon
              message="这一段要带走什么"
              description={lesson.takeaway}
            />
            <div className="mini-actions">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleFilled />}
                onClick={runLesson}
              >
                {done ? '已运行此阶段' : '运行这一段'}
              </Button>
              <Button size="large" icon={<CopyOutlined />} onClick={copyCode}>
                复制代码
              </Button>
              {lessonIndex > 0 && (
                <Button
                  type="text"
                  onClick={() => setLessonIndex(lessonIndex - 1)}
                >
                  上一步
                </Button>
              )}
              {lessonIndex < lessons.length - 1 && (
                <Button
                  type="text"
                  onClick={() => setLessonIndex(lessonIndex + 1)}
                >
                  下一步 →
                </Button>
              )}
            </div>
          </div>

          <CodeBlock
            className="mini-code-panel"
            code={lesson.code}
            language="javascript"
            title={done ? 'mini-react.js · executed' : 'mini-react.js'}
            theme="dark"
          />
        </section>

        <section className="mini-runtime" id="mini-runtime">
          <div className="mini-runtime-head">
            <div>
              <Text className="section-kicker">RUNTIME INSPECTOR</Text>
              <Title level={2}>把代码跑成看得见的结果</Title>
            </div>
            <Segmented
              value={view}
              options={[
                { label: 'DOM 结果', value: 'dom' },
                { label: 'VNode 数据', value: 'vnode' },
              ]}
              onChange={(value) => setView(value as 'dom' | 'vnode')}
            />
          </div>
          <div className="mini-runtime-grid">
            <div className="mini-browser">
              <div className="mini-browser-bar">
                <i />
                <i />
                <i />
                <span>localhost:3000</span>
              </div>
              <div className="mini-browser-body">
                {view === 'dom' ? (
                  preview || (
                    <div className="mini-empty">
                      运行第 03 阶段后，真实 DOM 会出现在这里。
                    </div>
                  )
                ) : (
                  <pre>
                    {lessonIndex < 2
                      ? lesson.output
                      : `{
  type: "${lessonIndex === 5 ? 'Counter' : 'h2'}",
  props: { children: "${lessonIndex === 5 ? `count: ${count}` : 'Hello mini React'}" }
}`}
                  </pre>
                )}
              </div>
            </div>
            <div className="mini-trace">
              <Text>本阶段输出</Text>
              <code>{lesson.output}</code>
              <Divider />
              <Text>发生了什么</Text>
              <ol>
                <li className={lessonIndex >= 0 ? 'active' : ''}>构造 VNode</li>
                <li className={lessonIndex >= 1 ? 'active' : ''}>
                  创建或复用 DOM
                </li>
                <li className={lessonIndex >= 2 ? 'active' : ''}>
                  递归处理子节点
                </li>
                <li className={lessonIndex >= 4 ? 'active' : ''}>
                  提交最小变更
                </li>
              </ol>
              {lessonIndex === 5 && (
                <Button icon={<ReloadOutlined />} onClick={() => setCount(0)}>
                  重置 state
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="mini-finish" id="mini-finish">
          <span>YOU BUILT</span>
          <div>
            <b>VNode</b>
            <i>→</i>
            <b>DOM Factory</b>
            <i>→</i>
            <b>Reconciler</b>
            <i>→</i>
            <b>State Loop</b>
          </div>
          <Text>
            这当然不是 React 本身，但它已经把 React
            最值得理解的几层边界放在你手里了。
          </Text>
        </section>
      </main>
    </BlogShell>
  );
};

export default MiniReactLab;
