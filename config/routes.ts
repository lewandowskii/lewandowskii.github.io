import { ROUTE_PATHS } from '../src/routes/blogRoutes';

export default [
  {
    path: ROUTE_PATHS.home,
    layout: false,
    component: './blog/Home',
  },
  {
    path: ROUTE_PATHS.blog.root,
    layout: false,
    routes: [
      {
        path: ROUTE_PATHS.blog.detail,
        component: './blog/Blog',
      },
    ],
  },
  {
    path: ROUTE_PATHS.study.root,
    layout: false,
    routes: [
      {
        path: ROUTE_PATHS.study.reactRender,
        component: './blog/ReactJourney',
      },
      {
        path: ROUTE_PATHS.study.miniReact,
        component: './blog/MiniReactLab',
      },
    ],
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
