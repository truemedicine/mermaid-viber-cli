/**
 * Mermaid rendering using the actual mermaid-vibes NPM package
 *
 * Browser assets (JS bundle + CSS) are pre-built at build time by
 * scripts/bundle.mjs and live alongside this file in dist/.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let bundleCache: string | null = null;
let cssBundleCache: string | null = null;

/**
 * Read the pre-built browser bundle (cached across renders)
 */
async function getBrowserBundle(): Promise<string> {
  if (bundleCache) return bundleCache;
  const bundlePath = path.join(__dirname, 'browser-bundle.js');
  bundleCache = await fs.readFile(bundlePath, 'utf-8');
  return bundleCache;
}

/**
 * Read the pre-built mermaid-vibes CSS (cached)
 */
async function getMermaidVibesCSS(): Promise<string> {
  if (cssBundleCache) return cssBundleCache;
  const cssPath = path.join(__dirname, 'mermaid-vibes.css');
  cssBundleCache = await fs.readFile(cssPath, 'utf-8');
  return cssBundleCache;
}

/**
 * Renders a Mermaid diagram to a JPEG buffer using the mermaid-vibes React component
 */
export async function renderMermaidToJPEG(chartContent: string): Promise<Buffer> {
  const tempDir = path.join(process.cwd(), '.tmp');
  await fs.mkdir(tempDir, { recursive: true });

  const tempId = `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const htmlFile = path.join(tempDir, `${tempId}.html`);

  try {
    const [bundle, css] = await Promise.all([getBrowserBundle(), getMermaidVibesCSS()]);
    const html = createHTML(chartContent, bundle, css);
    await fs.writeFile(htmlFile, html, 'utf-8');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 2400,
      height: 1800,
      deviceScaleFactor: 2,
    });

    await page.goto(`file://${htmlFile}`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Wait for the MermaidVibes component to render
    await page.waitForSelector('.mermaid-container svg', { timeout: 60000 });

    // Give time for animations and images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const element = await page.$('.mermaid-container');
    if (!element) {
      throw new Error('Mermaid container not found');
    }

    const screenshotBuffer = await element.screenshot({
      type: 'jpeg',
      quality: 95,
    });

    await browser.close();

    return Buffer.from(screenshotBuffer);
  } finally {
    try {
      await fs.unlink(htmlFile).catch(() => {});
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Creates a self-contained HTML page with the bundled JS and CSS inlined
 */
function createHTML(chartContent: string, bundle: string, css: string): string {
  // JSON-encode the chart content for safe embedding
  const chartJSON = JSON.stringify(chartContent);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #F7F6F2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
    }

    #root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
  <style>${css}</style>
</head>
<body>
  <div id="root"></div>
  <script>window.__CHART_CONTENT__ = ${chartJSON};</script>
  <script>${bundle}</script>
</body>
</html>`;
}
