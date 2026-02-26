/**
 * Pre-bundles browser assets at build time so the published package
 * doesn't need esbuild or source files at runtime.
 */
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

// 1. Bundle browser-entry.tsx into a single IIFE for Puppeteer
await esbuild.build({
  entryPoints: ['src/browser-entry.tsx'],
  bundle: true,
  outfile: 'dist/browser-bundle.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  loader: { '.tsx': 'tsx' },
  jsx: 'automatic',
});

// 2. Copy mermaid-vibes CSS into dist/
const cssPath = path.join('node_modules', 'mermaid-vibes', 'dist', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
fs.writeFileSync('dist/mermaid-vibes.css', cssContent);

console.log('✅ Pre-bundled browser-bundle.js and mermaid-vibes.css into dist/');
