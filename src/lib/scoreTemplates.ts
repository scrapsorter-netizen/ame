/**
 * Score Templates & Key Signature Management Utilities
 */

export interface KeyConfig {
  fifths: number; // -7 to +7
  mode?: string;  // major, minor, or maqam name
  maqamName?: string;
  arabicMaqamName?: string;
  quarterTones?: {
    step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
    alter: number; // -0.5, 0.5, etc.
    accidental: 'slash-flat' | 'quarter-flat' | 'quarter-sharp';
  }[];
  measureNumber?: number; // default 1
}

export interface NewDocumentConfig {
  title: string;
  arabicTitle: string;
  composer: string;
  instrumentName: string;
  timeSignature: { beats: number; beatType: number };
  tempo: number;
  keyConfig: KeyConfig;
  measuresCount: number;
  starterNotesType: 'empty' | 'scale' | 'exercise';
}

/**
 * Standard Western Key Signatures (-7 to +7 fifths)
 */
export const STANDARD_KEY_SIGNATURES = [
  { fifths: -7, major: 'C♭ Major', minor: 'A♭ Minor', accidentals: '7 Flats (B♭ E♭ A♭ D♭ G♭ C♭ F♭)' },
  { fifths: -6, major: 'G♭ Major', minor: 'E♭ Minor', accidentals: '6 Flats (B♭ E♭ A♭ D♭ G♭ C♭)' },
  { fifths: -5, major: 'D♭ Major', minor: 'B♭ Minor', accidentals: '5 Flats (B♭ E♭ A♭ D♭ G♭)' },
  { fifths: -4, major: 'A♭ Major', minor: 'F Minor', accidentals: '4 Flats (B♭ E♭ A♭ D♭)' },
  { fifths: -3, major: 'E♭ Major', minor: 'C Minor (Nahawand on C)', accidentals: '3 Flats (B♭ E♭ A♭)' },
  { fifths: -2, major: 'B♭ Major', minor: 'G Minor (Kurd on G)', accidentals: '2 Flats (B♭ E♭)' },
  { fifths: -1, major: 'F Major', minor: 'D Minor (Bayati / Kurd on D)', accidentals: '1 Flat (B♭)' },
  { fifths: 0, major: 'C Major (Ajam)', minor: 'A Minor', accidentals: 'Natural / No accidentals' },
  { fifths: 1, major: 'G Major (Yakah)', minor: 'E Minor', accidentals: '1 Sharp (F♯)' },
  { fifths: 2, major: 'D Major', minor: 'B Minor', accidentals: '2 Sharps (F♯ C♯)' },
  { fifths: 3, major: 'A Major', minor: 'F♯ Minor', accidentals: '3 Sharps (F♯ C♯ G♯)' },
  { fifths: 4, major: 'E Major', minor: 'C♯ Minor', accidentals: '4 Sharps (F♯ C♯ G♯ D♯)' },
  { fifths: 5, major: 'B Major', minor: 'G♯ Minor', accidentals: '5 Sharps (F♯ C♯ G♯ D♯ A♯)' },
  { fifths: 6, major: 'F♯ Major', minor: 'D♯ Minor', accidentals: '6 Sharps (F♯ C♯ G♯ D♯ A♯ E♯)' },
  { fifths: 7, major: 'C♯ Major', minor: 'A♯ Minor', accidentals: '7 Sharps (F♯ C♯ G♯ D♯ A♯ E♯ B♯)' },
];

/**
 * Arabic Maqam Key Signature Presets
 */
export const ARABIC_KEY_PRESETS: { id: string; name: string; arabicName: string; config: KeyConfig }[] = [
  {
    id: 'rast-c',
    name: 'Maqam Rast on C',
    arabicName: 'راست على الدو',
    config: {
      fifths: 0,
      mode: 'major',
      maqamName: 'Rast',
      arabicMaqamName: 'راست',
      quarterTones: [
        { step: 'E', alter: -0.5, accidental: 'slash-flat' },
        { step: 'B', alter: -0.5, accidental: 'slash-flat' },
      ],
    },
  },
  {
    id: 'bayati-d',
    name: 'Maqam Bayati on D',
    arabicName: 'بياتي على الري',
    config: {
      fifths: -1,
      mode: 'minor',
      maqamName: 'Bayati',
      arabicMaqamName: 'بياتي',
      quarterTones: [
        { step: 'E', alter: -0.5, accidental: 'slash-flat' },
      ],
    },
  },
  {
    id: 'hijaz-d',
    name: 'Maqam Hijaz on D',
    arabicName: 'حجاز على الري',
    config: {
      fifths: -1,
      mode: 'minor',
      maqamName: 'Hijaz',
      arabicMaqamName: 'حجاز',
      quarterTones: [],
    },
  },
  {
    id: 'saba-d',
    name: 'Maqam Saba on D',
    arabicName: 'صبا على الري',
    config: {
      fifths: -1,
      mode: 'minor',
      maqamName: 'Saba',
      arabicMaqamName: 'صبا',
      quarterTones: [
        { step: 'E', alter: -0.5, accidental: 'slash-flat' },
      ],
    },
  },
  {
    id: 'sikah-e',
    name: 'Maqam Sikah on E𝄳',
    arabicName: 'سيكاه على السيكاه',
    config: {
      fifths: 0,
      mode: 'major',
      maqamName: 'Sikah',
      arabicMaqamName: 'سيكاه',
      quarterTones: [
        { step: 'E', alter: -0.5, accidental: 'slash-flat' },
        { step: 'B', alter: -0.5, accidental: 'slash-flat' },
      ],
    },
  },
  {
    id: 'nahawand-c',
    name: 'Maqam Nahawand on C',
    arabicName: 'نهاوند على الدو',
    config: {
      fifths: -3,
      mode: 'minor',
      maqamName: 'Nahawand',
      arabicMaqamName: 'نهاوند',
      quarterTones: [],
    },
  },
  {
    id: 'kurd-d',
    name: 'Maqam Kurd on D',
    arabicName: 'كرد على الري',
    config: {
      fifths: -1,
      mode: 'minor',
      maqamName: 'Kurd',
      arabicMaqamName: 'كرد',
      quarterTones: [],
    },
  },
  {
    id: 'ajam-c',
    name: 'Maqam Ajam on C (C Major)',
    arabicName: 'عجم على الدو',
    config: {
      fifths: 0,
      mode: 'major',
      maqamName: 'Ajam',
      arabicMaqamName: 'عجم',
      quarterTones: [],
    },
  },
];

/**
 * Generate a complete, valid MusicXML document with custom title, meter, tempo, and key signature.
 */
export function generateNewMusicXml(config: NewDocumentConfig): string {
  const {
    title,
    arabicTitle,
    composer,
    instrumentName,
    timeSignature,
    tempo,
    keyConfig,
    measuresCount,
    starterNotesType,
  } = config;

  const combinedTitle = arabicTitle ? `${title} - ${arabicTitle}` : title;
  const divisions = 2; // 2 ticks per quarter note
  const beatsPerMeasure = timeSignature.beats;
  const beatType = timeSignature.beatType;

  // Build key signature XML
  let keyXml = `        <key>
          <fifths>${keyConfig.fifths}</fifths>
          <mode>${keyConfig.mode || 'major'}</mode>`;

  if (keyConfig.quarterTones && keyConfig.quarterTones.length > 0) {
    keyConfig.quarterTones.forEach((qt) => {
      keyXml += `\n          <key-step>${qt.step}</key-step>
          <key-alter>${qt.alter}</key-alter>
          <key-accidental>${qt.accidental}</key-accidental>`;
    });
  }
  keyXml += `\n        </key>`;

  // Build measures
  let measuresXml = '';
  const totalMeasures = Math.max(1, measuresCount || 4);

  for (let m = 1; m <= totalMeasures; m++) {
    const isFirstMeasure = m === 1;
    const isLastMeasure = m === totalMeasures;

    measuresXml += `    <!-- Measure ${m} -->\n    <measure number="${m}">\n`;

    if (isFirstMeasure) {
      measuresXml += `      <attributes>
        <divisions>${divisions}</divisions>
${keyXml}
        <time>
          <beats>${beatsPerMeasure}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${tempo}"/>
      </direction>\n`;
    }

    // Measure contents
    if (isFirstMeasure && starterNotesType === 'scale' && keyConfig.maqamName === 'Rast') {
      // 4 quarter notes in Rast: C4, D4, E half-flat, F4
      measuresXml += `      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><alter>-0.5</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>\n`;
    } else if (isFirstMeasure && starterNotesType === 'scale' && keyConfig.maqamName === 'Bayati') {
      // 4 quarter notes in Bayati: D4, E half-flat, F4, G4
      measuresXml += `      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><alter>-0.5</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>\n`;
    } else {
      // Whole measure rest or full rest matching time signature
      const restDuration = Math.round((beatsPerMeasure * divisions * 4) / beatType);
      measuresXml += `      <note>
        <rest/>
        <duration>${restDuration}</duration>
        <type>${beatsPerMeasure === 4 && beatType === 4 ? 'whole' : 'quarter'}</type>
      </note>\n`;
    }

    if (isLastMeasure) {
      measuresXml += `      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>\n`;
    }

    measuresXml += `    </measure>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${combinedTitle}</work-title>
  </work>
  <identification>
    <creator type="composer">${composer || 'Anonymous'}</creator>
    <creator type="arranger">Arr. for Violin (كمان)</creator>
    <rights>Public Domain</rights>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>${instrumentName || 'Violin'}</part-name>
      <part-abbreviation>Vln.</part-abbreviation>
      <score-instrument id="P1-I1">
        <instrument-name>${instrumentName || 'Violin'}</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>41</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
${measuresXml}  </part>
</score-partwise>`;
}

/**
 * Parses existing MusicXML and updates or inserts the <key> signature element.
 */
export function updateKeySignatureInXml(xmlText: string, keyConfig: KeyConfig): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('Cannot update key signature: existing MusicXML is malformed. Please check your XML syntax.');
  }

  const targetMeasureNum = keyConfig.measureNumber || 1;
  const measures = doc.querySelectorAll('part > measure');
  if (measures.length === 0) {
    throw new Error('No measures found in score.');
  }

  // Find target measure
  let targetMeasure: Element | null = null;
  measures.forEach((m, idx) => {
    const num = parseInt(m.getAttribute('number') || `${idx + 1}`, 10);
    if (num === targetMeasureNum) {
      targetMeasure = m;
    }
  });

  if (!targetMeasure) {
    targetMeasure = measures[0];
  }

  // Ensure <attributes> exists in target measure
  let attributesEl = targetMeasure.querySelector('attributes');
  if (!attributesEl) {
    attributesEl = doc.createElement('attributes');
    targetMeasure.insertBefore(attributesEl, targetMeasure.firstChild);
  }

  // Find or create <key> element
  let keyEl = attributesEl.querySelector('key');
  if (!keyEl) {
    keyEl = doc.createElement('key');
    // Insert after <divisions> if present
    const divEl = attributesEl.querySelector('divisions');
    if (divEl && divEl.nextSibling) {
      attributesEl.insertBefore(keyEl, divEl.nextSibling);
    } else {
      attributesEl.appendChild(keyEl);
    }
  }

  // Clear existing key child nodes
  while (keyEl.firstChild) {
    keyEl.removeChild(keyEl.firstChild);
  }

  // 1. Add <fifths>
  const fifthsEl = doc.createElement('fifths');
  fifthsEl.textContent = `${keyConfig.fifths}`;
  keyEl.appendChild(fifthsEl);

  // 2. Add <mode> if provided
  if (keyConfig.mode) {
    const modeEl = doc.createElement('mode');
    modeEl.textContent = keyConfig.mode;
    keyEl.appendChild(modeEl);
  }

  // 3. Add quarter-tone accidental tags if provided
  if (keyConfig.quarterTones && keyConfig.quarterTones.length > 0) {
    keyConfig.quarterTones.forEach((qt) => {
      const stepEl = doc.createElement('key-step');
      stepEl.textContent = qt.step;
      keyEl!.appendChild(stepEl);

      const alterEl = doc.createElement('key-alter');
      alterEl.textContent = `${qt.alter}`;
      keyEl!.appendChild(alterEl);

      const accEl = doc.createElement('key-accidental');
      accEl.textContent = qt.accidental;
      keyEl!.appendChild(accEl);
    });
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/**
 * Extract currently active key signature from MusicXML.
 */
export function getCurrentKeySignatureFromXml(xmlText: string): KeyConfig {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const keyEl = doc.querySelector('part > measure:first-of-type > attributes > key') ||
                doc.querySelector('part > measure > attributes > key');

  if (!keyEl) {
    return { fifths: 0, mode: 'major' };
  }

  const fifthsEl = keyEl.querySelector('fifths');
  const modeEl = keyEl.querySelector('mode');
  const fifths = fifthsEl && fifthsEl.textContent ? parseInt(fifthsEl.textContent, 10) : 0;
  const mode = modeEl && modeEl.textContent ? modeEl.textContent.trim() : 'major';

  // Check quarter tones
  const quarterTones: KeyConfig['quarterTones'] = [];
  const steps = keyEl.querySelectorAll('key-step');
  const alters = keyEl.querySelectorAll('key-alter');
  const accidentals = keyEl.querySelectorAll('key-accidental');

  for (let i = 0; i < steps.length; i++) {
    const step = (steps[i]?.textContent?.trim() || 'C') as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
    const alter = alters[i]?.textContent ? parseFloat(alters[i].textContent) : 0;
    const accidental = (accidentals[i]?.textContent?.trim() || 'slash-flat') as 'slash-flat' | 'quarter-flat' | 'quarter-sharp';
    quarterTones.push({ step, alter, accidental });
  }

  return { fifths, mode, quarterTones };
}
