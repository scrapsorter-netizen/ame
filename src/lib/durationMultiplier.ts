/**
 * Duration Multiplier Engine for MusicXML
 * Allows scaling note lengths (halving, doubling, custom multiplier)
 * for selected notes, measures, or the entire score.
 */

const NOTE_TYPES = [
  '1024th',
  '512th',
  '256th',
  '128th',
  '64th',
  '32nd',
  '16th',
  'eighth',
  'quarter',
  'half',
  'whole',
  'breve',
  'long',
] as const;

export type NoteTypeString = (typeof NOTE_TYPES)[number];

/**
 * Calculates new note type when multiplied by a power-of-two factor
 */
export function getShiftedNoteType(currentType: string, multiplier: number): string {
  const cleanType = currentType.trim().toLowerCase();
  const idx = NOTE_TYPES.indexOf(cleanType as NoteTypeString);
  if (idx === -1) return currentType;

  // Multiplier of 2 shifts up (quarter -> half)
  // Multiplier of 0.5 shifts down (quarter -> eighth)
  let steps = 0;
  if (multiplier === 2) steps = 1;
  else if (multiplier === 4) steps = 2;
  else if (multiplier === 8) steps = 3;
  else if (multiplier === 0.5) steps = -1;
  else if (multiplier === 0.25) steps = -2;
  else if (multiplier === 0.125) steps = -3;
  else {
    // Check log2 for other powers of 2
    const log2 = Math.log2(multiplier);
    if (Number.isInteger(log2)) {
      steps = log2;
    }
  }

  const targetIdx = Math.max(0, Math.min(NOTE_TYPES.length - 1, idx + steps));
  return NOTE_TYPES[targetIdx];
}

export interface DurationScaleOptions {
  multiplier: number;
  scope: 'selection' | 'all' | 'measures';
  selectedXmlSnippet?: string;
  measureStart?: number;
  measureEnd?: number;
  adjustTimeSignature?: boolean;
}

export interface DurationScaleResult {
  updatedXml: string;
  notesModifiedCount: number;
}

/**
 * Apply duration multiplier to a standalone XML snippet (e.g. selected code in editor)
 */
export function scaleSnippetDuration(
  snippetXml: string,
  multiplier: number
): { resultXml: string; notesCount: number } {
  // If snippet does not have a single root tag, wrap it temporarily in a container
  const wrapped = `<root>${snippetXml}</root>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(wrapped, 'text/xml');

  if (doc.querySelector('parsererror')) {
    // If not valid standalone XML, fallback to regex replacement on <duration> and <type>
    return scaleSnippetRegex(snippetXml, multiplier);
  }

  const notes = doc.querySelectorAll('note');
  let count = 0;

  notes.forEach((note) => {
    const durEl = note.querySelector('duration');
    if (durEl && durEl.textContent) {
      const origDur = parseFloat(durEl.textContent);
      if (!isNaN(origDur)) {
        const newDur = Math.max(1, Math.round(origDur * multiplier));
        durEl.textContent = String(newDur);
        count++;
      }
    }

    const typeEl = note.querySelector('type');
    if (typeEl && typeEl.textContent) {
      const origType = typeEl.textContent;
      typeEl.textContent = getShiftedNoteType(origType, multiplier);
    }
  });

  // Extract inner children without <root> wrapper
  let inner = '';
  doc.documentElement.childNodes.forEach((node) => {
    inner += new XMLSerializer().serializeToString(node);
  });

  return { resultXml: inner, notesCount: count };
}

/**
 * Fallback regex replacement for partial XML selections
 */
function scaleSnippetRegex(snippet: string, multiplier: number): { resultXml: string; notesCount: number } {
  let count = 0;

  // Replace <duration>X</duration>
  let modified = snippet.replace(/<duration>(\d+(?:\.\d+)?)<\/duration>/g, (_, durStr) => {
    const val = parseFloat(durStr);
    if (isNaN(val)) return `<duration>${durStr}</duration>`;
    count++;
    const newVal = Math.max(1, Math.round(val * multiplier));
    return `<duration>${newVal}</duration>`;
  });

  // Replace <type>Y</type>
  modified = modified.replace(/<type>([a-zA-Z0-9]+)<\/type>/g, (_, typeStr) => {
    const newType = getShiftedNoteType(typeStr, multiplier);
    return `<type>${newType}</type>`;
  });

  return { resultXml: modified, notesCount: count };
}

/**
 * Scale note durations across full MusicXML document
 */
export function scaleScoreDurations(
  xmlContent: string,
  options: DurationScaleOptions
): DurationScaleResult {
  const { multiplier, scope, measureStart, measureEnd, adjustTimeSignature } = options;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('MusicXML syntax is invalid. Please fix syntax errors first.');
  }

  let notesModifiedCount = 0;

  // If adjusting time signature and scope is 'all'
  if (adjustTimeSignature && (scope === 'all' || !measureStart)) {
    const timeElements = doc.querySelectorAll('time');
    timeElements.forEach((timeEl) => {
      const beatsEl = timeEl.querySelector('beats');
      const beatTypeEl = timeEl.querySelector('beat-type');
      if (beatsEl && beatTypeEl) {
        const beats = parseInt(beatsEl.textContent || '4', 10);
        const beatType = parseInt(beatTypeEl.textContent || '4', 10);

        if (multiplier === 0.5) {
          // Halving: 4/4 -> 2/4 or 4/8
          // E.g. beat-type doubles (4 -> 8) or beats halve (4 -> 2)
          if (beats % 2 === 0) {
            beatsEl.textContent = String(beats / 2);
          } else {
            beatTypeEl.textContent = String(beatType * 2);
          }
        } else if (multiplier === 2) {
          // Doubling: 2/4 -> 4/4 or 4/8 -> 4/4
          if (beatType % 2 === 0 && beatType > 2) {
            beatTypeEl.textContent = String(beatType / 2);
          } else {
            beatsEl.textContent = String(beats * 2);
          }
        }
      }
    });
  }

  const measures = doc.querySelectorAll('measure');

  measures.forEach((measure) => {
    const mNumAttr = measure.getAttribute('number');
    const mNum = mNumAttr ? parseInt(mNumAttr, 10) : NaN;

    if (scope === 'measures' && measureStart !== undefined && measureEnd !== undefined) {
      if (isNaN(mNum) || mNum < measureStart || mNum > measureEnd) {
        return;
      }
    }

    const notes = measure.querySelectorAll('note');
    notes.forEach((note) => {
      const durEl = note.querySelector('duration');
      if (durEl && durEl.textContent) {
        const val = parseFloat(durEl.textContent);
        if (!isNaN(val)) {
          const newVal = Math.max(1, Math.round(val * multiplier));
          durEl.textContent = String(newVal);
          notesModifiedCount++;
        }
      }

      const typeEl = note.querySelector('type');
      if (typeEl && typeEl.textContent) {
        typeEl.textContent = getShiftedNoteType(typeEl.textContent, multiplier);
      }
    });
  });

  const serializer = new XMLSerializer();
  let updatedXml = serializer.serializeToString(doc);

  if (!updatedXml.startsWith('<?xml')) {
    updatedXml = '<?xml version="1.0" encoding="UTF-8"?>\n' + updatedXml;
  }

  return { updatedXml, notesModifiedCount };
}
