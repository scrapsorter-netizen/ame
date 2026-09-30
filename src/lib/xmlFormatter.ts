/**
 * Clean 2-space MusicXML Code Formatter & Beautifier
 */
export function formatMusicXml(xmlText: string): string {
  const clean = xmlText.trim();
  const PADDING = '  ';
  let formatted = '';
  let pad = 0;

  // Split tokens by tags
  const tokens = clean
    .replace(/>\s*</g, '><')
    .replace(/<([^/][^>]*?)>/g, '\n<$1>')
    .replace(/(<\/[^>]+?>)/g, '\n$1\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  tokens.forEach((rawLine) => {
    const line = rawLine.trim();

    // Check tag type
    const isXmlDeclaration = line.startsWith('<?') || line.startsWith('<!');
    const isClosing = line.startsWith('</');
    const isSelfClosing = line.endsWith('/>') || (line.startsWith('<') && line.includes('</'));

    if (isClosing) {
      pad = Math.max(0, pad - 1);
    }

    // Add extra newline before measure tags for great readability
    if (line.startsWith('<measure ') || line.startsWith('<part-list>') || line.startsWith('<part id=')) {
      formatted += '\n';
    }

    formatted += PADDING.repeat(pad) + line + '\n';

    if (!isClosing && !isSelfClosing && !isXmlDeclaration && line.startsWith('<')) {
      pad++;
    }
  });

  return formatted.trim() + '\n';
}
