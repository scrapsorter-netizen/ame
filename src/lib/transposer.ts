/**
 * MusicXML Transposition Utility
 * Supports semitone, quarter-tone (±0.5 = ±50 cents), and octave shifts
 */

const STEP_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SEMITONE_TO_STEP: { step: string; alter: number }[] = [
  { step: 'C', alter: 0 },
  { step: 'C', alter: 1 }, // or D flat
  { step: 'D', alter: 0 },
  { step: 'E', alter: -1 }, // E flat
  { step: 'E', alter: 0 },
  { step: 'F', alter: 0 },
  { step: 'F', alter: 1 },
  { step: 'G', alter: 0 },
  { step: 'A', alter: -1 }, // A flat
  { step: 'A', alter: 0 },
  { step: 'B', alter: -1 }, // B flat
  { step: 'B', alter: 0 },
];

export function transposeMusicXml(xmlText: string, semitonesDelta: number): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Cannot transpose: Invalid XML');
  }

  const pitchElements = xmlDoc.querySelectorAll('note > pitch');

  pitchElements.forEach((pitchEl) => {
    const stepEl = pitchEl.querySelector('step');
    const octEl = pitchEl.querySelector('octave');
    const alterEl = pitchEl.querySelector('alter');

    if (!stepEl || !octEl) return;

    const currentStep = stepEl.textContent?.trim().toUpperCase() || 'C';
    const currentOct = parseInt(octEl.textContent || '4', 10);
    const currentAlter = alterEl && alterEl.textContent ? parseFloat(alterEl.textContent) : 0;

    const stepBase = STEP_TO_SEMITONE[currentStep] ?? 0;
    // Fractional MIDI pitch:
    const currentMidi = (currentOct + 1) * 12 + stepBase + currentAlter;
    const newMidi = currentMidi + semitonesDelta;

    // Separate octave and chroma
    const newTotalSemitones = Math.round(newMidi * 2) / 2; // snap to nearest quarter-tone (0.5)
    const newOctave = Math.floor(newTotalSemitones / 12) - 1;
    let chroma = newTotalSemitones % 12;
    if (chroma < 0) chroma += 12;

    // Check if integer or quarter-tone (e.g. 4.5)
    const isQuarterTone = Math.abs(chroma - Math.round(chroma)) > 0.2;

    let targetStep = 'C';
    let targetAlter = 0;

    if (!isQuarterTone) {
      const nearestInt = Math.round(chroma) % 12;
      const mapping = SEMITONE_TO_STEP[nearestInt] || { step: 'C', alter: 0 };
      targetStep = mapping.step;
      targetAlter = mapping.alter;
    } else {
      // Quarter-tone: base on lower or upper integer
      const lowerInt = Math.floor(chroma);
      const upperInt = Math.ceil(chroma) % 12;

      // Prefer half-flats (Sikah convention: -0.5 on E, B, A, D)
      const mappingUpper = SEMITONE_TO_STEP[upperInt] || { step: 'D', alter: 0 };
      targetStep = mappingUpper.step;
      targetAlter = -0.5;
    }

    stepEl.textContent = targetStep;
    octEl.textContent = String(newOctave);

    if (targetAlter !== 0) {
      if (!alterEl) {
        const newAlterEl = xmlDoc.createElement('alter');
        newAlterEl.textContent = String(targetAlter);
        pitchEl.appendChild(newAlterEl);
      } else {
        alterEl.textContent = String(targetAlter);
      }
    } else if (alterEl) {
      pitchEl.removeChild(alterEl);
    }

    // Update or set accidental element if present on parent note
    const parentNote = pitchEl.parentElement;
    if (parentNote) {
      let accidentalEl = parentNote.querySelector('accidental');
      if (targetAlter === -0.5) {
        if (!accidentalEl) {
          accidentalEl = xmlDoc.createElement('accidental');
          parentNote.appendChild(accidentalEl);
        }
        accidentalEl.textContent = 'slash-flat';
      } else if (targetAlter === 0.5) {
        if (!accidentalEl) {
          accidentalEl = xmlDoc.createElement('accidental');
          parentNote.appendChild(accidentalEl);
        }
        accidentalEl.textContent = 'slash-sharp';
      } else if (targetAlter === -1) {
        if (!accidentalEl) {
          accidentalEl = xmlDoc.createElement('accidental');
          parentNote.appendChild(accidentalEl);
        }
        accidentalEl.textContent = 'flat';
      } else if (targetAlter === 1) {
        if (!accidentalEl) {
          accidentalEl = xmlDoc.createElement('accidental');
          parentNote.appendChild(accidentalEl);
        }
        accidentalEl.textContent = 'sharp';
      } else if (accidentalEl) {
        parentNote.removeChild(accidentalEl);
      }
    }
  });

  const serializer = new XMLSerializer();
  let result = serializer.serializeToString(xmlDoc);

  if (!result.startsWith('<?xml')) {
    result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result;
  }

  return result;
}
