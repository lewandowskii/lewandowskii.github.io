declare module 'react-syntax-highlighter' {
  import type React from 'react';

  export const Prism: React.ComponentType<Record<string, unknown>>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneLight: Record<string, unknown>;
  export const vscDarkPlus: Record<string, unknown>;
}
