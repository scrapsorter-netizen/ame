import JSZip from 'jszip';

/**
 * Extracts raw MusicXML string from either an uncompressed .xml / .musicxml file
 * or a compressed .mxl container (zip format).
 */
export async function extractMusicXmlFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // If already standard text XML
  if (fileName.endsWith('.xml') || fileName.endsWith('.musicxml')) {
    return await file.text();
  }

  // Handle .mxl (Compressed MusicXML ZIP format)
  if (fileName.endsWith('.mxl')) {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Standard MusicXML .mxl container has META-INF/container.xml specifying the rootfile path
    const containerFile = zip.file('META-INF/container.xml');
    let rootPath: string | null = null;

    if (containerFile) {
      const containerXml = await containerFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(containerXml, 'text/xml');
      const rootfileEl = doc.querySelector('rootfiles > rootfile');
      if (rootfileEl) {
        rootPath = rootfileEl.getAttribute('full-path');
      }
    }

    if (rootPath && zip.file(rootPath)) {
      return await zip.file(rootPath)!.async('text');
    }

    // Fallback: look for the first non-META-INF .xml file in the archive
    const files = Object.keys(zip.files);
    const xmlEntryName = files.find(
      (path) => !path.startsWith('META-INF/') && (path.endsWith('.xml') || path.endsWith('.musicxml'))
    );

    if (xmlEntryName && zip.file(xmlEntryName)) {
      return await zip.file(xmlEntryName)!.async('text');
    }

    throw new Error('Could not find a valid MusicXML file inside this .mxl container.');
  }

  // Otherwise try reading as text
  return await file.text();
}

/**
 * Creates a compressed .mxl container from a MusicXML string.
 */
export async function createMxlArchive(musicXmlContent: string, scoreName = 'score'): Promise<Blob> {
  const zip = new JSZip();

  // 1. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <rootfiles>
    <rootfile full-path="${scoreName}.xml" media-type="application/vnd.recordare.musicxml+xml"/>
  </rootfiles>
</container>`;

  zip.folder('META-INF')?.file('container.xml', containerXml);

  // 2. The score XML
  zip.file(`${scoreName}.xml`, musicXmlContent);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.recordare.musicxml',
    compression: 'DEFLATE',
  });
}
