/**
 * Mermaid rendering using the actual mermaid-vibes NPM package
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';
import { preprocessChart } from './preprocessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Renders a Mermaid diagram to a JPEG buffer using the mermaid-vibes package
 */
export async function renderMermaidToJPEG(chartContent: string): Promise<Buffer> {
  // Create temp directory
  const tempDir = path.join(process.cwd(), '.tmp');
  await fs.mkdir(tempDir, { recursive: true });

  const tempId = `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const htmlFile = path.join(tempDir, `${tempId}.html`);

  try {
    // Preprocess chart to handle custom actor images
    const { cleanedChart, imageMappings } = preprocessChart(chartContent);

    // Create HTML that uses the mermaid-vibes package
    const html = createMermaidVibesHTML(cleanedChart, imageMappings);
    await fs.writeFile(htmlFile, html, 'utf-8');

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    // Set viewport to high resolution
    await page.setViewport({
      width: 2400,
      height: 1800,
      deviceScaleFactor: 2,
    });

    // Load the HTML file
    await page.goto(`file://${htmlFile}`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Wait for the mermaid-vibes component to render
    await page.waitForSelector('#mermaid-output svg', { timeout: 60000 });

    // Give time for animations and images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the element to screenshot
    const element = await page.$('#mermaid-output');
    if (!element) {
      throw new Error('Mermaid output element not found');
    }

    // Take screenshot
    const screenshotBuffer = await element.screenshot({
      type: 'jpeg',
      quality: 95,
    });

    await browser.close();

    // Convert to Node.js Buffer
    const buffer = Buffer.from(screenshotBuffer);

    return buffer;
  } finally {
    // Cleanup
    try {
      await fs.unlink(htmlFile).catch(() => {});
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Creates HTML that uses the mermaid-vibes NPM package
 */
function createMermaidVibesHTML(chartContent: string, imageMappings: Map<string, string>): string {
  // Escape the chart content for embedding in JavaScript
  const escapedChart = chartContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/</g, '\\x3C')
    .replace(/>/g, '\\x3E');

  // Convert imageMappings to JSON
  const imageMappingsJSON = JSON.stringify(Object.fromEntries(imageMappings));

  // Get the path to mermaid-vibes package
  const mermaidVibesPath = path.join(process.cwd(), 'node_modules', 'mermaid-vibes');

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
      padding: 20px;
    }

    #mermaid-output {
      display: inline-block;
    }
  </style>

  <!-- Load mermaid-vibes from CDN or local build -->
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <div id="mermaid-output"></div>

  <script type="module">
    // Import mermaid (already loaded globally)
    const mermaidLib = window.mermaid;

    // Initialize mermaid with config matching mermaid-vibes
    mermaidLib.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: 'rgba(23, 152, 149, 0.1)',
        primaryBorderColor: '#179895',
        primaryTextColor: '#1A202C',
        secondaryColor: '#D9F5EA',
        secondaryBorderColor: '#679b9a',
        secondaryTextColor: '#1A202C',
        tertiaryColor: '#F4FFFB',
        tertiaryBorderColor: '#179895',
        tertiaryTextColor: '#1A202C',
        background: '#F7F6F2',
        mainBkg: 'rgba(23, 152, 149, 0.1)',
        secondBkg: '#D9F5EA',
        tertiaryBkg: '#F4FFFB',
        noteBkgColor: '#FFF6A8',
        noteBorderColor: '#179895',
        noteTextColor: '#1A202C',
        actorBkg: '#FFFFFF',
        actorBorder: '#179895',
        actorTextColor: '#1A202C',
        actorLineColor: '#179895',
        sequenceNumberColor: '#FFFFFF',
        labelBoxBkgColor: '#FFFFFF',
        labelBoxBorderColor: '#179895',
        labelTextColor: '#1A202C',
        nodeTextColor: '#1A202C',
        nodeBorder: '#179895',
        lineColor: '#179895',
        edgeLabelBackground: '#FFFFFF',
        gridColor: '#679b9a',
        classText: '#1A202C',
        attributeBackgroundColorOdd: '#FFFFFF',
        attributeBackgroundColorEven: '#EDF2F7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
        fontSize: '16px',
      },
      flowchart: {
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
        curve: 'basis',
        htmlLabels: true,
      },
      sequence: {
        actorMargin: 50,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        useMaxWidth: false,
      },
    });

    const chartDefinition = \`${escapedChart}\`;
    const imageMappings = ${imageMappingsJSON};

    // Render the diagram
    mermaidLib.render('mermaid-diagram', chartDefinition)
      .then(result => {
        const outputDiv = document.getElementById('mermaid-output');

        // Create container with mermaid-vibes styling
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.cssText = \`
          background: linear-gradient(135deg, #F7F6F2 0%, #F4FFFB 50%, #F7F6F2 100%);
          padding: 6rem;
          border-radius: 12px;
          display: inline-block;
        \`;

        container.innerHTML = result.svg;
        outputDiv.appendChild(container);

        // Apply mermaid-vibes styles to the SVG
        const svg = container.querySelector('svg');
        if (svg) {
          // Apply styles
          applyMermaidVibesStyles(svg);

          // Add actor images if any
          if (Object.keys(imageMappings).length > 0) {
            addActorImages(svg, imageMappings);
          }
        }
      })
      .catch(error => {
        console.error('Failed to render diagram:', error);
        document.getElementById('mermaid-output').innerHTML = '<p style="color: red;">Failed to render diagram: ' + error.message + '</p>';
      });

    function applyMermaidVibesStyles(svg) {
      // Node styling
      svg.querySelectorAll('.node rect, .node polygon, .node circle, .node ellipse').forEach(el => {
        el.style.stroke = '#179895';
        el.style.strokeWidth = '3px';
        el.style.fill = 'rgba(23, 152, 149, 0.1)';
        if (el.tagName === 'rect' || el.tagName === 'polygon') {
          el.setAttribute('rx', '12');
          el.setAttribute('ry', '12');
        }
      });

      // Edge styling
      svg.querySelectorAll('.edgePath path, .flowchart-link').forEach(el => {
        el.style.stroke = '#179895';
        el.style.strokeWidth = '3px';
      });

      // Edge labels
      svg.querySelectorAll('.edgeLabel rect').forEach(el => {
        el.style.fill = '#FFFFFF';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2.5px';
        el.setAttribute('rx', '10');
        el.setAttribute('ry', '10');
      });

      // Text styling
      svg.querySelectorAll('.nodeLabel, .edgeLabel, text').forEach(el => {
        el.style.fill = '#1A202C';
        el.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif';
        el.style.fontWeight = '500';
        el.style.fontSize = '16px';
      });

      // Actor styling
      svg.querySelectorAll('.actor, .actor rect').forEach(el => {
        el.style.stroke = '#179895';
        el.style.strokeWidth = '3px';
        el.style.fill = '#FFFFFF';
        if (el.tagName === 'rect') {
          el.setAttribute('rx', '12');
          el.setAttribute('ry', '12');
        }
      });

      // Actor lines
      svg.querySelectorAll('.actor-line').forEach(el => {
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2px';
      });

      // Activation boxes
      svg.querySelectorAll('.activation0, .activation1, .activation2').forEach(el => {
        el.style.fill = 'rgba(23, 152, 149, 0.2)';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2px';
      });

      // Notes
      svg.querySelectorAll('.note').forEach(el => {
        el.style.fill = '#FFF6A8';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2px';
        el.setAttribute('rx', '10');
        el.setAttribute('ry', '10');
      });

      // Arrow markers
      svg.querySelectorAll('marker path').forEach(el => {
        el.style.fill = '#179895';
        el.style.stroke = '#179895';
      });

      // Label boxes
      svg.querySelectorAll('.labelBox').forEach(el => {
        el.style.fill = '#FFFFFF';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2px';
        el.setAttribute('rx', '10');
        el.setAttribute('ry', '10');
      });

      // Clusters
      svg.querySelectorAll('.cluster rect').forEach(el => {
        el.style.fill = 'rgba(23, 152, 149, 0.05)';
        el.style.stroke = '#679b9a';
        el.style.strokeWidth = '2px';
        el.setAttribute('rx', '12');
        el.setAttribute('ry', '12');
      });

      // Class diagrams
      svg.querySelectorAll('.classGroup rect').forEach(el => {
        el.style.fill = '#FFFFFF';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '3px';
        el.setAttribute('rx', '12');
        el.setAttribute('ry', '12');
      });

      svg.querySelectorAll('.classGroup line').forEach(el => {
        el.style.stroke = '#179895';
        el.style.strokeWidth = '2px';
      });

      // State diagrams
      svg.querySelectorAll('.stateGroup rect').forEach(el => {
        el.style.fill = 'rgba(23, 152, 149, 0.1)';
        el.style.stroke = '#179895';
        el.style.strokeWidth = '3px';
        el.setAttribute('rx', '12');
        el.setAttribute('ry', '12');
      });
    }

    function addActorImages(svg, imageMappings) {
      const actorGroups = Array.from(svg.querySelectorAll('g')).filter(g => {
        const hasRect = g.querySelector('rect') !== null;
        const hasText = g.querySelector('text') !== null;
        const className = g.getAttribute('class') || '';
        return hasRect && hasText && (className.includes('actor') || g.querySelector('line'));
      });

      actorGroups.forEach(actor => {
        const textElement = actor.querySelector('text');
        const rect = actor.querySelector('rect');
        if (!textElement || !rect) return;

        const actorName = textElement.textContent?.trim() || '';
        const imgPath = imageMappings[actorName];
        if (!imgPath) return;

        const x = parseFloat(rect.getAttribute('x') || '0');
        const y = parseFloat(rect.getAttribute('y') || '0');
        const height = parseFloat(rect.getAttribute('height') || '0');

        const logoSize = 48;
        const padding = 20;
        const imageX = x + padding;
        const imageY = y + (height - logoSize) / 2;
        const borderRadius = 8;

        // Create clipPath
        const clipPathId = 'actor-logo-clip-' + Math.random().toString(36).substr(2, 9);
        let defs = svg.querySelector('defs');
        if (!defs) {
          defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          svg.insertBefore(defs, svg.firstChild);
        }

        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipPathId);

        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', imageX.toString());
        clipRect.setAttribute('y', imageY.toString());
        clipRect.setAttribute('width', logoSize.toString());
        clipRect.setAttribute('height', logoSize.toString());
        clipRect.setAttribute('rx', borderRadius.toString());
        clipRect.setAttribute('ry', borderRadius.toString());

        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);

        // Create image element
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', imgPath);
        image.setAttribute('x', imageX.toString());
        image.setAttribute('y', imageY.toString());
        image.setAttribute('width', logoSize.toString());
        image.setAttribute('height', logoSize.toString());
        image.setAttribute('clip-path', 'url(#' + clipPathId + ')');
        image.setAttribute('preserveAspectRatio', 'xMidYMid slice');

        actor.appendChild(image);

        // Adjust text position
        const textX = parseFloat(textElement.getAttribute('x') || '0');
        textElement.setAttribute('x', (textX + logoSize / 2 + padding / 2).toString());
      });
    }
  </script>
</body>
</html>`;
}
