import {
  ArrowDownOutlined,
  BookOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Link } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  Layout,
  Menu,
  Progress,
  Segmented,
  Space,
  Steps,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ROUTE_PATHS } from '../../routes/blogRoutes';
import BlogShell from './BlogShell';
import CodeBlock from './CodeBlock';
import './styles.css';

const { Paragraph, Text, Title } = Typography;
const storageKey = 'react-render-journey-progress';

type Stage = {
  id: number;
  title: string;
  eyebrow: string;
  summary: string;
  concept: React.ReactNode;
  code?: string;
  source?: string;
  callout: string;
  detail: string;
  checkpoint: string;
};

const stages: Stage[] = [
  {
    id: 1,
    title: 'JSX 先被编译',
    eyebrow: 'COMPILE TIME',
    summary: '这一刻还没有 Fiber，更没有 DOM。JSX 只是 JavaScript 的语法糖。',
    concept: (
      <>
        构建工具把标签表达式转换为 JSX runtime 调用，运行时拿到普通 JavaScript
        对象。
      </>
    ),
    code: `// 输入
function App() {
  return <h1 className="title">Hello</h1>;
}

// 自动 JSX runtime 的核心形态
function App() {
  return jsx("h1", {
    className: "title",
    children: "Hello"
  });
}`,
    source: '编译前后对照',
    callout:
      'JSX 编译发生在构建阶段；从 jsx() 调用开始，才进入 React 仓库里的运行时代码。',
    detail:
      '生产环境根据 children 形态选择 jsx 或 jsxs；开发环境走 jsxDEV，并执行额外校验。',
    checkpoint: '我能解释：JSX 不是 ReactElement，也不是 Fiber，更不是 DOM。',
  },
  {
    id: 2,
    title: '生成 ReactElement',
    eyebrow: 'UI DESCRIPTION',
    summary: 'Element 描述“想要什么 UI”，不承担调度与工作状态。',
    concept: (
      <>
        jsxProd 从 config 提取 key 与 props，再由 ReactElement 建立带有 $$typeof
        标记的不可变描述。
      </>
    ),
    code: `export function jsxProd(type, config, maybeKey) {
  // 提取 key，过滤保留字段，收集 props
  return ReactElement(
    type,
    key,
    props,
    getOwner(),
  );
}`,
    source: 'packages/react/src/jsx/ReactJSXElement.js : 291',
    callout:
      'Element 是本次渲染的输入；Fiber 是 React 为这份描述建立、可复用的工作节点。',
    detail:
      '后续 Diff 真正比较的是新 Element 与旧 Fiber，type 和 key 决定节点能否继续复用。',
    checkpoint: '我能说出 ReactElement 中 type、key、props 各自决定什么。',
  },
  {
    id: 3,
    title: '建立渲染根',
    eyebrow: 'ROOT SETUP',
    summary: '容器 DOM、FiberRoot 和 HostRoot Fiber 在这里连成双向结构。',
    concept: (
      <>
        createRoot(container) 不会立刻渲染 App，它先初始化 reconciler root
        和事件系统。
      </>
    ),
    code: `const root = createContainer(container, ...);
markContainerAsRoot(root.current, container);
listenToAllSupportedEvents(container);

return new ReactDOMRoot(root);`,
    source: 'packages/react-dom/src/client/ReactDOMRoot.js : 171',
    callout:
      'FiberRoot.current → HostRoot Fiber，同时 HostRoot.stateNode → FiberRoot。',
    detail: '前者让根找到当前树，后者让任意 HostRoot Fiber 找回自己所属的根。',
    checkpoint:
      '我理解 createRoot 是初始化渲染基础设施，不等于把 App 放进页面。',
  },
  {
    id: 4,
    title: '把更新送上调度轨道',
    eyebrow: 'UPDATE & SCHEDULING',
    summary: 'root.render 把 Element 放入更新队列，并为工作选择优先级。',
    concept: (
      <>
        公开 API 进入 updateContainer，更新携带 lane，随后 scheduleUpdateOnFiber
        标记根并安排工作。
      </>
    ),
    code: `ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root, null, null);
};

// requestUpdateLane → enqueueUpdate
// → scheduleUpdateOnFiber`,
    source: 'packages/react-dom/src/client/ReactDOMRoot.js : 107',
    callout:
      'Lane 是位掩码形式的优先级与工作集合，可以先理解成“这次更新的车道号”。',
    detail:
      '它让 React 合并更新、跳过低优先级工作，并在工作被打断后决定下一批处理内容。',
    checkpoint:
      '我能复述 render → updateContainer → enqueueUpdate → scheduleUpdateOnFiber。',
  },
  {
    id: 5,
    title: '向下构建 Fiber 树',
    eyebrow: 'RENDER PHASE',
    summary: 'Render 阶段可以被打断：计算页面应该变成什么，但不直接修改 DOM。',
    concept: (
      <>
        performUnitOfWork 把 Fiber 当作工作单元，beginWork
        向下处理，completeWork 向上收尾。
      </>
    ),
    code: `function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  let next = beginWork(current, unitOfWork, renderLanes);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}`,
    source: 'packages/react-reconciler/src/ReactFiberWorkLoop.js : 3062',
    callout: 'beginWork 是向下“展开”，completeWork 是向上“收口”。',
    detail:
      '函数组件在 beginWork 中执行；返回的 Element 会继续交给 child reconciler 建立或复用 Fiber。',
    checkpoint: '我能区分 Render 阶段的计算与 Commit 阶段的真实 DOM 变更。',
  },
  {
    id: 6,
    title: '用 key 与 type 做 Diff',
    eyebrow: 'RECONCILIATION',
    summary: '新 Element 与旧 Fiber 在这里对齐，决定复用、插入、移动或删除。',
    concept: (
      <>
        reconcileChildFibers 先看 key，再看 type。两者匹配就复用 Fiber
        与组件状态，否则创建新节点。
      </>
    ),
    code: `if (newChild.key === oldFiber.key) {
  if (newChild.type === oldFiber.elementType) {
    return useFiber(oldFiber, newChild.props);
  }
}

deleteRemainingChildren(returnFiber, oldFiber);
return createFiberFromElement(newChild);`,
    source: 'packages/react-reconciler/src/ReactChildFiber.js',
    callout:
      '稳定 key 的价值不只是性能，它帮助 React 把“同一个组件”的状态跟随到下一次渲染。',
    detail:
      '列表索引会随插入和排序发生变化，可能让状态意外移动到另一个视觉位置。',
    checkpoint: '我能解释 key 和 type 如何共同决定 Fiber 是否可复用。',
  },
  {
    id: 7,
    title: '准备真实 DOM',
    eyebrow: 'COMPLETE WORK',
    summary: 'HostComponent 在向上完成时创建 DOM 实例，并准备属性与子节点。',
    concept: (
      <>
        completeWork 为新宿主 Fiber 调用 createInstance，再把已完成的子 DOM
        追加到实例中。
      </>
    ),
    code: `const instance = createInstance(
  type,
  newProps,
  rootContainerInstance,
  currentHostContext,
  workInProgress,
);

appendAllChildren(instance, workInProgress);
workInProgress.stateNode = instance;`,
    source: 'packages/react-reconciler/src/ReactFiberCompleteWork.js',
    callout: '此时 DOM 节点已经在内存中创建，但还没有插入页面里的容器。',
    detail:
      'Render 阶段保持可中断，浏览器可见树的 mutation 统一留到 Commit 阶段。',
    checkpoint:
      '我理解 createInstance 与 appendChildToContainer 发生在不同阶段。',
  },
  {
    id: 8,
    title: 'Commit 到浏览器',
    eyebrow: 'COMMIT PHASE',
    summary: 'Mutation 阶段不可中断，Placement 等副作用在这里真正写入 DOM。',
    concept: (
      <>
        commitMutationEffects 遍历带 flags 的 Fiber；Placement
        最终进入宿主环境的插入 API。
      </>
    ),
    code: `if (flags & Placement) {
  commitHostPlacement(finishedWork);
  finishedWork.flags &= ~Placement;
}

// 最终调用
appendChildToContainer(parent, stateNode);`,
    source: 'packages/react-reconciler/src/ReactFiberCommitWork.js',
    callout:
      'Render 可以重来，Commit 必须一次完成，避免用户看到只更新了一半的界面。',
    detail:
      'Mutation 后 root.current 切换到 finishedWork，随后执行 layout effects，浏览器再布局与绘制。',
    checkpoint: '我能从 commitRoot 一直追到浏览器 appendChild 的宿主操作。',
  },
];

const ReactJourney: React.FC = () => {
  const [completed, setCompleted] = useState<number[]>([]);
  const [active, setActive] = useState('stage-1');
  const [mode, setMode] = useState<'guide' | 'source'>('guide');
  const [diffStep, setDiffStep] = useState(0);
  useEffect(() => {
    try {
      setCompleted(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch {
      setCompleted([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>('[data-stage]'),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px' },
    );
    sections.forEach((section) => {
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const progress = Math.round((completed.length / stages.length) * 100);
  const menuItems = useMemo(
    () =>
      stages.map((stage) => ({
        key: `stage-${stage.id}`,
        label: (
          <div className="journey-nav-label">
            <span>{String(stage.id).padStart(2, '0')}</span>
            <b>{stage.title.replace('先被', '').replace('把更新送上', '')}</b>
            <Checkbox
              checked={completed.includes(stage.id)}
              aria-label={`完成${stage.title}`}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleStage(stage.id)}
            />
          </div>
        ),
      })),
    [completed],
  );

  const toggleStage = (id: number) => {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id].sort(),
    );
  };

  const scrollToStage = (key: string) => {
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' });
  };

  const diffStates = [
    {
      title: '初始列表',
      old: ['A', 'B', 'C'],
      next: ['A', 'B', 'C'],
      note: '两棵树完全一致，Fiber 全部复用。',
    },
    {
      title: '在开头插入 X',
      old: ['A', 'B', 'C'],
      next: ['X', 'A', 'B', 'C'],
      note: '有稳定 key 时，只为 X 创建新 Fiber。',
    },
    {
      title: '移动 C 到开头',
      old: ['A', 'B', 'C'],
      next: ['C', 'A', 'B'],
      note: 'C 的 Fiber 与状态被复用，仅记录 Placement。',
    },
  ];
  const diff = diffStates[diffStep];

  return (
    <BlogShell
      compact
      tocItems={[
        { id: 'journey-map', label: '概览' },
        { id: 'stage-1', label: 'JSX 与 ReactElement' },
        { id: 'stage-3', label: '建立渲染根' },
        { id: 'stage-5', label: 'Render 阶段' },
        { id: 'stage-6', label: 'Diff 与复用' },
        { id: 'stage-8', label: 'Commit 上屏' },
      ]}
    >
      <Layout className="journey-layout">
        <Layout.Sider className="journey-sider" width={280} theme="light">
          <div className="journey-sider-head">
            <Link to={ROUTE_PATHS.home} className="back-blog">
              ← 返回博客
            </Link>
            <div className="journey-mark">R</div>
            <Title level={3}>Render Journey</Title>
            <Text type="secondary">React 源码阅读工作台</Text>
          </div>
          <div className="journey-progress">
            <div>
              <Text strong>阅读进度</Text>
              <Text>{completed.length} / 8</Text>
            </div>
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor="#e5483f"
            />
          </div>
          <Menu
            selectedKeys={[active]}
            items={menuItems}
            onClick={({ key }) => scrollToStage(key)}
          />
          <div className="journey-version">LOCAL SOURCE · REACT 19.3.0</div>
        </Layout.Sider>

        <Layout.Content className="journey-content">
          <header className="journey-hero">
            <Text className="section-kicker">SOURCE-GUIDED LEARNING MAP</Text>
            <Title>
              一段 JSX，如何变成
              <em>浏览器里的像素？</em>
            </Title>
            <Paragraph>
              从编译产物开始，跟随 ReactElement、Fiber、调度器、Diff 和 Commit，
              把每一次函数跳转都落到 React 19 的真实源码入口。
            </Paragraph>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={<ArrowDownOutlined />}
                onClick={() => scrollToStage('journey-map')}
              >
                开始沿链路阅读
              </Button>
              <Button
                size="large"
                icon={<DeleteOutlined />}
                onClick={() => setCompleted([])}
              >
                重置进度
              </Button>
            </Space>
            <div className="react-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
              <b>React</b>
            </div>
          </header>

          <section className="pipeline-section" id="journey-map">
            <Text className="section-kicker">THE WHOLE TRIP</Text>
            <Title level={2}>先建立一张完整地图</Title>
            <Steps
              className="pipeline-steps"
              current={-1}
              responsive
              items={stages.map((stage) => ({
                title: stage.title,
                description: stage.eyebrow.split(' ')[0],
              }))}
            />
          </section>

          <div className="journey-mode">
            <Text>建议先用导读模式建立心智模型，再切源码模式追函数。</Text>
            <Segmented
              value={mode}
              options={[
                { label: '导读模式', value: 'guide', icon: <BookOutlined /> },
                { label: '源码模式', value: 'source', icon: <LinkOutlined /> },
              ]}
              onChange={(value) => setMode(value as 'guide' | 'source')}
            />
          </div>

          {stages.map((stage) => (
            <section
              className={`journey-stage mode-${mode}`}
              id={`stage-${stage.id}`}
              data-stage
              key={stage.id}
            >
              <div className="stage-heading">
                <span className="stage-number">
                  {String(stage.id).padStart(2, '0')}
                </span>
                <div>
                  <Text className="section-kicker">{stage.eyebrow}</Text>
                  <Title level={2}>{stage.title}</Title>
                </div>
                <Paragraph>{stage.summary}</Paragraph>
              </div>
              <div className="stage-body">
                <Paragraph className="stage-concept">{stage.concept}</Paragraph>

                {stage.id === 1 && (
                  <div className="shape-grid">
                    <div>
                      <b>你写的</b>
                      <code>&lt;App /&gt;</code>
                      <code>&lt;h1&gt;Hello&lt;/h1&gt;</code>
                    </div>
                    <div>
                      <b>编译后</b>
                      <code>jsx(App, {'{}'})</code>
                      <code>children: "Hello"</code>
                    </div>
                    <div>
                      <b>还没有</b>
                      <code>Fiber 节点</code>
                      <code>真实 DOM</code>
                    </div>
                  </div>
                )}

                {stage.code && (
                  <CodeBlock
                    className="source-block"
                    code={stage.code}
                    language="javascript"
                    title={stage.source}
                    theme="dark"
                  />
                )}

                {stage.id === 6 && (
                  <div className="diff-lab">
                    <div className="diff-lab-head">
                      <span>
                        <ExperimentOutlined /> DIFF 实验台
                      </span>
                      <Button
                        onClick={() =>
                          setDiffStep((diffStep + 1) % diffStates.length)
                        }
                      >
                        下一种变化
                      </Button>
                    </div>
                    <Title level={4}>{diff.title}</Title>
                    <div className="diff-board">
                      <div>
                        <Text>旧 Fiber</Text>
                        <Space>
                          {diff.old.map((item) => (
                            <Tag key={item}>{item}</Tag>
                          ))}
                        </Space>
                      </div>
                      <ArrowDownOutlined />
                      <div>
                        <Text>新 Element</Text>
                        <Space>
                          {diff.next.map((item) => (
                            <Tag
                              color={diff.old.includes(item) ? 'cyan' : 'red'}
                              key={item}
                            >
                              {item}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                    <Paragraph>{diff.note}</Paragraph>
                  </div>
                )}

                <Alert
                  className="stage-alert"
                  type="info"
                  showIcon
                  message="这一段最值得记住"
                  description={stage.callout}
                />
                <Collapse
                  ghost
                  items={[
                    {
                      key: 'detail',
                      label: mode === 'guide' ? '展开深入理解' : '源码阅读提示',
                      children: stage.detail,
                    },
                  ]}
                />
                <div className="stage-checkpoint">
                  <Checkbox
                    checked={completed.includes(stage.id)}
                    onChange={() => toggleStage(stage.id)}
                  >
                    <span>
                      <b>检查点</b>
                      {stage.checkpoint}
                    </span>
                  </Checkbox>
                  {completed.includes(stage.id) && <CheckOutlined />}
                </div>
              </div>
            </section>
          ))}

          <section className="journey-quiz">
            <Tag icon={<BookOutlined />}>SELF CHECK</Tag>
            <Title level={2}>离开页面前，试着回答</Title>
            <Collapse
              accordion
              items={[
                {
                  key: '1',
                  label: 'ReactElement 和 Fiber 最本质的职责区别是什么？',
                  children:
                    'Element 是 UI 输入描述；Fiber 是可复用、承载状态并参与调度的工作节点。',
                },
                {
                  key: '2',
                  label: '为什么函数组件执行了，却可能暂时看不到 DOM 变化？',
                  children:
                    '组件执行属于可中断的 Render 阶段；DOM mutation 要等到 Commit 阶段。',
                },
                {
                  key: '3',
                  label: '稳定 key 是怎样帮助 React 保住组件状态的？',
                  children:
                    'key 和 type 标识可复用的旧 Fiber，而 Hook 状态保存在 Fiber 链表上。',
                },
              ]}
            />
          </section>
        </Layout.Content>
      </Layout>
    </BlogShell>
  );
};

export default ReactJourney;
