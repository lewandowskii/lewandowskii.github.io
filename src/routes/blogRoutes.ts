/**
 * Shared route contracts for the documentation site.
 * Umi uses these definitions to generate its React Router route tree.
 */
export const ROUTE_PATHS = {
  home: '/',
  blog: {
    root: '/blog',
    detail: '/blog/:id',
    byId: (id: string) => `/blog/${encodeURIComponent(id)}`,
  },
  study: {
    root: '/study',
    reactRender: '/study/react-render',
    miniReact: '/study/mini-react',
  },
} as const;

export const STUDY_ANCHORS = {
  ui: `${ROUTE_PATHS.study.reactRender}#stage-1`,
  updates: `${ROUTE_PATHS.study.reactRender}#stage-4`,
  reconciliation: `${ROUTE_PATHS.study.reactRender}#stage-6`,
  state: `${ROUTE_PATHS.study.miniReact}#mini-runtime`,
} as const;
