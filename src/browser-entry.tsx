import React from 'react';
import { createRoot } from 'react-dom/client';
import { MermaidVibes } from 'mermaid-vibes';

// The chart content will be injected by the renderer as a global variable
declare global {
  interface Window {
    __CHART_CONTENT__: string;
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(React.createElement(MermaidVibes, { chart: window.__CHART_CONTENT__ }));
