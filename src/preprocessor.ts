/**
 * Chart preprocessing utilities
 *
 * Handles extraction of custom actor images and other preprocessing tasks
 */

/**
 * Preprocesses chart string to extract image references and clean for Mermaid
 * Returns cleaned chart and image mappings
 *
 * Syntax: participant img:path/to/image.png ActorName
 */
export function preprocessChart(chart: string): {
  cleanedChart: string;
  imageMappings: Map<string, string>;
} {
  const imageMappings = new Map<string, string>();

  // Extract and remove img: references from participant definitions
  // Matches patterns like: participant img:/path/to/image.png ActorName
  const cleanedChart = chart.replace(
    /participant\s+img:([^\s]+)\s+([^\n]+)/g,
    (match, imgPath, actorName) => {
      const trimmedName = actorName.trim();
      imageMappings.set(trimmedName, imgPath);
      return `participant ${actorName}`;
    }
  );

  return { cleanedChart, imageMappings };
}

/**
 * Adds images to actor boxes based on mappings
 */
export function addActorImages(
  svgElement: SVGElement,
  imageMappings: Map<string, string>,
  document: Document
): void {
  if (imageMappings.size === 0) {
    return;
  }

  const allGroups = svgElement.querySelectorAll('g');

  // Try to find actor groups by their content
  const actorCandidates = Array.from(allGroups).filter((g) => {
    const hasRect = g.querySelector('rect') !== null;
    const hasText = g.querySelector('text') !== null;
    const className = g.getAttribute('class') || '';
    return (
      hasRect &&
      hasText &&
      (className.includes('actor') || g.querySelector('line'))
    );
  });

  actorCandidates.forEach((actor) => {
    // Look for text anywhere in the actor (not just direct children)
    const textElement = actor.querySelector('text');
    // Look for rect anywhere in the actor
    const rect = actor.querySelector('rect');

    if (!textElement || !rect) {
      return;
    }

    const actorName = textElement.textContent?.trim() || '';
    const imgPath = imageMappings.get(actorName);

    if (imgPath) {
      // Get the rect dimensions and position
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');

      const logoSize = 48;
      const padding = 20;
      const imageX = x + padding;
      const imageY = y + (height - logoSize) / 2;
      const borderRadius = 8;

      // Create a unique ID for this clip path
      const clipPathId = `actor-logo-clip-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create clip path with rounded rectangle
      const defs =
        svgElement.querySelector('defs') ||
        svgElement.insertBefore(
          document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
          svgElement.firstChild
        );

      const clipPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'clipPath'
      );
      clipPath.setAttribute('id', clipPathId);

      const clipRect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      clipRect.setAttribute('x', imageX.toString());
      clipRect.setAttribute('y', imageY.toString());
      clipRect.setAttribute('width', logoSize.toString());
      clipRect.setAttribute('height', logoSize.toString());
      clipRect.setAttribute('rx', borderRadius.toString());
      clipRect.setAttribute('ry', borderRadius.toString());

      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);

      // Create the image element
      const image = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'image'
      );
      image.setAttribute('href', imgPath);
      image.setAttribute('x', imageX.toString());
      image.setAttribute('y', imageY.toString());
      image.setAttribute('width', logoSize.toString());
      image.setAttribute('height', logoSize.toString());
      image.setAttribute('clip-path', `url(#${clipPathId})`);
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');

      // Add the image to the actor group
      actor.appendChild(image);

      // Adjust text position to make room for logo
      const textX = parseFloat(textElement.getAttribute('x') || '0');
      textElement.setAttribute('x', (textX + logoSize / 2 + padding / 2).toString());
    }
  });
}
