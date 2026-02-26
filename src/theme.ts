/**
 * Theme configuration for Mermaid diagrams
 * Matches the styling from mermaid-app
 */

import type { MermaidConfig } from 'mermaid';

/**
 * Color theme constants - Truemed Design System
 */
export const PRIMARY = {
  teal: '#179895',
  tealLight: '#679b9a',
  cyanDark: '#183B43',
} as const;

export const ACCENT = {
  yellow: '#FFF6A8',
  red: '#E43028',
  cyanLight: '#D9F5EA',
  cyanSoft: '#F4FFFB',
} as const;

export const BACKGROUND = {
  primary: '#F7F6F2',
  white: '#FFFFFF',
  gray100: '#EDF2F7',
} as const;

export const TEXT = {
  body: '#1A202C',
  subtle: '#4A5568',
  placeholder: '#718096',
} as const;

/**
 * Returns Mermaid configuration with custom theme
 */
export function getMermaidConfig(): MermaidConfig {
  return {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      // Primary colors
      primaryColor: 'rgba(23, 152, 149, 0.1)',
      primaryBorderColor: PRIMARY.teal,
      primaryTextColor: TEXT.body,

      // Secondary colors
      secondaryColor: ACCENT.cyanLight,
      secondaryBorderColor: PRIMARY.tealLight,
      secondaryTextColor: TEXT.body,

      // Tertiary colors
      tertiaryColor: ACCENT.cyanSoft,
      tertiaryBorderColor: PRIMARY.teal,
      tertiaryTextColor: TEXT.body,

      // Background
      background: BACKGROUND.primary,
      mainBkg: 'rgba(23, 152, 149, 0.1)',
      secondBkg: ACCENT.cyanLight,
      tertiaryBkg: ACCENT.cyanSoft,

      // Notes
      noteBkgColor: ACCENT.yellow,
      noteBorderColor: PRIMARY.teal,
      noteTextColor: TEXT.body,

      // Actor (sequence diagrams)
      actorBkg: BACKGROUND.white,
      actorBorder: PRIMARY.teal,
      actorTextColor: TEXT.body,
      actorLineColor: PRIMARY.teal,

      // Sequence numbers
      sequenceNumberColor: BACKGROUND.white,

      // Labels
      labelBoxBkgColor: BACKGROUND.white,
      labelBoxBorderColor: PRIMARY.teal,
      labelTextColor: TEXT.body,

      // Flowchart
      nodeTextColor: TEXT.body,
      nodeBorder: PRIMARY.teal,

      // Lines/edges
      lineColor: PRIMARY.teal,
      edgeLabelBackground: BACKGROUND.white,

      // Grid
      gridColor: PRIMARY.tealLight,

      // Class diagrams
      classText: TEXT.body,

      // ER diagrams
      attributeBackgroundColorOdd: BACKGROUND.white,
      attributeBackgroundColorEven: BACKGROUND.gray100,

      // Git graph
      git0: PRIMARY.teal,
      git1: PRIMARY.tealLight,
      git2: ACCENT.cyanLight,
      git3: PRIMARY.cyanDark,

      // Font
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
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
      useMaxWidth: true,
    },
    gantt: {
      titleTopMargin: 25,
      barHeight: 20,
      barGap: 4,
      topPadding: 50,
    },
  };
}

/**
 * Returns CSS stylesheet for enhanced styling
 */
export function getStylesheet(): string {
  return `
    .mermaid-container {
      background: linear-gradient(135deg, ${BACKGROUND.primary} 0%, ${ACCENT.cyanSoft} 50%, ${BACKGROUND.primary} 100%);
      padding: 6rem;
      border-radius: 12px;
    }

    /* Node styling */
    .node rect,
    .node polygon,
    .node circle,
    .node ellipse {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
      fill: rgba(23, 152, 149, 0.1) !important;
      rx: 12px !important;
      ry: 12px !important;
    }

    /* Edge styling */
    .edgePath path,
    .flowchart-link {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
    }

    /* Edge labels */
    .edgeLabel rect {
      fill: ${BACKGROUND.white} !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2.5px !important;
      rx: 10px !important;
      ry: 10px !important;
      min-width: 90px !important;
      min-height: 50px !important;
    }

    .edgeLabel {
      background-color: ${BACKGROUND.white} !important;
    }

    /* Text styling */
    .nodeLabel,
    .edgeLabel,
    text {
      fill: ${TEXT.body} !important;
      color: ${TEXT.body} !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif !important;
      font-weight: 500 !important;
      font-size: 16px !important;
    }

    /* Actor styling (sequence diagrams) */
    .actor {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
      fill: ${BACKGROUND.white} !important;
    }

    .actor-line {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }

    /* Activation boxes */
    .activation0,
    .activation1,
    .activation2 {
      fill: rgba(23, 152, 149, 0.2) !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }

    /* Note styling */
    .note {
      fill: ${ACCENT.yellow} !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }

    /* Arrow heads */
    marker path {
      fill: ${PRIMARY.teal} !important;
      stroke: ${PRIMARY.teal} !important;
    }

    /* Label boxes */
    .labelBox {
      fill: ${BACKGROUND.white} !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }

    /* Cluster/subgraph styling */
    .cluster rect {
      fill: rgba(23, 152, 149, 0.05) !important;
      stroke: ${PRIMARY.tealLight} !important;
      stroke-width: 2px !important;
      rx: 12px !important;
      ry: 12px !important;
    }

    /* Class diagram styling */
    .classGroup rect {
      fill: ${BACKGROUND.white} !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
    }

    .classGroup line {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }

    /* State diagram styling */
    .stateGroup rect {
      fill: rgba(23, 152, 149, 0.1) !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
      rx: 12px !important;
      ry: 12px !important;
    }

    /* ER diagram styling */
    .er.entityBox {
      fill: ${BACKGROUND.white} !important;
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 3px !important;
    }

    .er.relationshipLine {
      stroke: ${PRIMARY.teal} !important;
      stroke-width: 2px !important;
    }
  `;
}
