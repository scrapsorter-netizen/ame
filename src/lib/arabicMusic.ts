import { Maqam, MaqamNote } from '../types';

/**
 * Standard western violin tuning pitches:
 * String 4: G3 (196.00 Hz)
 * String 3: D4 (293.66 Hz)
 * String 2: A4 (440.00 Hz)
 * String 1: E5 (659.25 Hz)
 */
export const VIOLIN_OPEN_STRINGS = [
  { string: 'G' as const, name: 'G3 (4th String)', pitch: 'G3', midi: 55, freq: 196.00 },
  { string: 'D' as const, name: 'D4 (3rd String)', pitch: 'D4', midi: 62, freq: 293.66 },
  { string: 'A' as const, name: 'A4 (2nd String)', pitch: 'A4', midi: 69, freq: 440.00 },
  { string: 'E' as const, name: 'E5 (1st String)', pitch: 'E5', midi: 76, freq: 659.25 },
];

const STEP_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/**
 * Calculate frequency in Hz for standard 12-TET with fractional quarter-tone alter (±0.5 = ±50 cents).
 */
export function calculatePitchFrequency(
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
  octave: number,
  alter = 0,
  a4Ref = 440
): number {
  const stepVal = STEP_TO_SEMITONE[step] ?? 0;
  // MIDI number: C4 is 60, A4 is 69
  const baseMidi = (octave + 1) * 12 + stepVal;
  const fractionalMidi = baseMidi + alter;
  // f = A4 * 2^((midi - 69) / 12)
  return a4Ref * Math.pow(2, (fractionalMidi - 69) / 12);
}

/**
 * Convert alter value to accidental glyph representation
 */
export function getAccidentalGlyph(alter: number): string {
  if (alter === -0.5) return '𝄳'; // Half flat (quarter tone flat / slash flat)
  if (alter === 0.5) return '𝄲';  // Half sharp (quarter tone sharp)
  if (alter === -1) return '♭';
  if (alter === 1) return '♯';
  if (alter === -1.5) return '𝄵'; // Three quarter flat
  if (alter === 1.5) return '𝄴';  // Three quarter sharp
  return '';
}

/**
 * Compute violin string and finger placement for a given note.
 * Assumes 1st position primarily.
 */
export function getViolinPosition(
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
  octave: number,
  alter = 0
): { string: 'G' | 'D' | 'A' | 'E'; finger: string; description: string } {
  const stepVal = STEP_TO_SEMITONE[step] ?? 0;
  const midi = (octave + 1) * 12 + stepVal + alter;

  // 1st string: E5 (76) and above
  if (midi >= 76) {
    const diff = midi - 76;
    let finger = '0 (open)';
    if (diff > 0 && diff <= 1.5) finger = diff === 1 ? '1st finger low' : '1st finger';
    else if (diff <= 2.5) finger = diff === 2 ? '1st finger high' : '2nd finger low (quarter-tone)';
    else if (diff <= 3.5) finger = '2nd finger';
    else if (diff <= 4.5) finger = '3rd finger';
    else if (diff <= 6) finger = '4th finger';
    else finger = 'High pos';
    return { string: 'E', finger, description: `E5 string, ${finger}` };
  }
  // 2nd string: A4 (69) to D#5 (75)
  if (midi >= 69) {
    const diff = midi - 69;
    let finger = '0 (open)';
    if (diff > 0 && diff <= 1.5) finger = diff === 1 ? '1st finger (B♭)' : '1st finger (B𝄳 quarter-flat)';
    else if (diff <= 2.5) finger = diff === 2 ? '1st finger (B♮)' : '2nd finger (C𝄲)';
    else if (diff <= 3.5) finger = diff === 3 ? '2nd finger (C♮)' : '2nd finger (C♯)';
    else if (diff <= 5.5) finger = diff <= 5 ? '3rd finger (D♮)' : '4th finger (D♯)';
    else finger = '4th finger';
    return { string: 'A', finger, description: `A4 string, ${finger}` };
  }
  // 3rd string: D4 (62) to G#4 (68)
  if (midi >= 62) {
    const diff = midi - 62;
    let finger = '0 (open)';
    if (diff > 0 && diff <= 1.5) finger = diff === 1 ? '1st finger (E♭)' : '1st finger (E𝄳 quarter-flat / Sikah)';
    else if (diff <= 2.5) finger = diff === 2 ? '1st finger (E♮)' : '2nd finger (F𝄳)';
    else if (diff <= 3.5) finger = diff === 3 ? '2nd finger (F♮)' : '2nd finger (F♯)';
    else if (diff <= 5.5) finger = diff <= 5 ? '3rd finger (G♮)' : '4th finger (G♯)';
    else finger = '4th finger';
    return { string: 'D', finger, description: `D4 string, ${finger}` };
  }
  // 4th string: G3 (55) to C#4 (61)
  const diff = Math.max(0, midi - 55);
  let finger = '0 (open)';
  if (diff > 0 && diff <= 1.5) finger = diff === 1 ? '1st finger (A♭)' : '1st finger (A𝄳)';
  else if (diff <= 2.5) finger = diff === 2 ? '1st finger (A♮)' : '2nd finger (B♭)';
  else if (diff <= 3.5) finger = diff === 3 ? '2nd finger (B𝄳)' : '2nd finger (B♮)';
  else if (diff <= 5.5) finger = '3rd finger (C♮)';
  else finger = '4th finger';
  return { string: 'G', finger, description: `G3 string, ${finger}` };
}

/**
 * 8 Core Arabic Maqamat definitions with exact quarter-tones and violin finger placements.
 */
export const ARABIC_MAQAMAT: Maqam[] = [
  {
    id: 'rast',
    name: 'Maqam Rast',
    arabicName: 'مقام راست',
    category: 'Rast',
    tonic: 'C4',
    description: 'The foundation of Arabic music ("Rast" means straight/truth). Contains quarter-tone half-flats on the 3rd (E𝄳) and 7th (B𝄳) degrees.',
    jins: { asl: 'Jins Rast on C', far: 'Jins Rast on G' },
    scaleNotes: [
      { name: 'C4 (Rast)', arabicName: 'راست', step: 'C', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'G', finger: '3', positionNote: '3rd finger on G string' } },
      { name: 'D4 (Dukah)', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E𝄳4 (Sikah)', arabicName: 'سيكاه (نصف بيمول)', step: 'E', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'D', finger: '1½', positionNote: '1st finger stretched high (quarter-tone between Eb and E)' } },
      { name: 'F4 (Jaharkah)', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D string' } },
      { name: 'G4 (Nawa)', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D string' } },
      { name: 'A4 (Husayni)', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B𝄳4 (Awj)', arabicName: 'أوج (نصف بيمول)', step: 'B', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'A', finger: '1½', positionNote: '1st finger stretched high (between Bb and B)' } },
      { name: 'C5 (Kardan)', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A string' } },
    ],
  },
  {
    id: 'bayati',
    name: 'Maqam Bayati',
    arabicName: 'مقام بياتي',
    category: 'Bayati',
    tonic: 'D4',
    description: 'One of the most widespread Arabic scales, deeply evocative and warm. Tonic on D4, with second degree E𝄳 (half-flat) and B♭.',
    jins: { asl: 'Jins Bayati on D', far: 'Jins Nahawand on G' },
    scaleNotes: [
      { name: 'D4 (Dukah)', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E𝄳4 (Sikah)', arabicName: 'سيكاه (نصف بيمول)', step: 'E', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'D', finger: '1½', positionNote: '1st finger quarter-tone on D string' } },
      { name: 'F4 (Jaharkah)', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D string' } },
      { name: 'G4 (Nawa)', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D string' } },
      { name: 'A4 (Husayni)', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B♭4 (Ajam)', arabicName: 'عجم (بيمول)', step: 'B', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'A', finger: '1', positionNote: '1st finger low (Bb) on A string' } },
      { name: 'C5 (Kardan)', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A string' } },
      { name: 'D5 (Muhayyar)', arabicName: 'محير', step: 'D', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '3', positionNote: '3rd finger on A string' } },
    ],
  },
  {
    id: 'hijaz',
    name: 'Maqam Hijaz',
    arabicName: 'مقام حجاز',
    category: 'Hijaz',
    tonic: 'D4',
    description: 'Renowned for its dramatic augmented second between E♭ and F♯, creating mystical, introspective modal tension.',
    jins: { asl: 'Jins Hijaz on D', far: 'Jins Nahawand on G' },
    scaleNotes: [
      { name: 'D4', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E♭4', arabicName: 'كرد (بيمول)', step: 'E', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'D', finger: '1', positionNote: '1st finger low on D' } },
      { name: 'F♯4', arabicName: 'حجاز (دييز)', step: 'F', alter: 1, octave: 4, centsOffset: 100, violinFingering: { string: 'D', finger: '2½', positionNote: '2nd finger high on D' } },
      { name: 'G4', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D' } },
      { name: 'A4', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B♭4', arabicName: 'عجم', step: 'B', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'A', finger: '1', positionNote: '1st finger low on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
      { name: 'D5', arabicName: 'محير', step: 'D', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '3', positionNote: '3rd finger on A' } },
    ],
  },
  {
    id: 'saba',
    name: 'Maqam Saba',
    arabicName: 'مقام صبا',
    category: 'Saba',
    tonic: 'D4',
    description: 'Intensely poignant and yearning. Features second degree E𝄳 (quarter flat) with lowered 4th degree G♭ (Hijaz on 3rd degree).',
    jins: { asl: 'Jins Saba on D', far: 'Jins Hijaz on F' },
    scaleNotes: [
      { name: 'D4', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E𝄳4', arabicName: 'سيكاه', step: 'E', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'D', finger: '1½', positionNote: '1st finger quarter-tone on D' } },
      { name: 'F4', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D' } },
      { name: 'G♭4', arabicName: 'صبا (بيمول)', step: 'G', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'D', finger: '3-', positionNote: '3rd finger low on D' } },
      { name: 'A4', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B♭4', arabicName: 'عجم', step: 'B', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'A', finger: '1', positionNote: '1st finger low on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
      { name: 'D♭5', arabicName: 'جواب', step: 'D', alter: -1, octave: 5, centsOffset: -100, violinFingering: { string: 'A', finger: '3-', positionNote: '3rd finger low on A' } },
    ],
  },
  {
    id: 'sikah',
    name: 'Maqam Sikah',
    arabicName: 'مقام سيكاه',
    category: 'Sikah',
    tonic: 'E𝄳4',
    description: 'Starts directly on the quarter-tone half-flat E𝄳. Distinctive, soulful, and quintessential to classic Arabic vocal and violin art.',
    jins: { asl: 'Jins Sikah on E𝄳', far: 'Jins Rast on G' },
    scaleNotes: [
      { name: 'E𝄳4', arabicName: 'سيكاه', step: 'E', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'D', finger: '1½', positionNote: '1st finger quarter-tone on D' } },
      { name: 'F4', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D' } },
      { name: 'G4', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D' } },
      { name: 'A4', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B𝄳4', arabicName: 'أوج', step: 'B', alter: -0.5, octave: 4, centsOffset: -50, violinFingering: { string: 'A', finger: '1½', positionNote: '1st finger quarter-tone on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
      { name: 'D5', arabicName: 'محير', step: 'D', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '3', positionNote: '3rd finger on A' } },
      { name: 'E𝄳5', arabicName: 'جواب سيكاه', step: 'E', alter: -0.5, octave: 5, centsOffset: -50, violinFingering: { string: 'E', finger: '0½', positionNote: '1st finger very low on E string' } },
    ],
  },
  {
    id: 'nahawand',
    name: 'Maqam Nahawand',
    arabicName: 'مقام نهاوند',
    category: 'Nahawand',
    tonic: 'C4',
    description: 'Equivalent to the Western harmonic/melodic minor scale on C. Very versatile, widely used in orchestral and violin classical Arabic pieces.',
    jins: { asl: 'Jins Nahawand on C', far: 'Jins Hijaz on G' },
    scaleNotes: [
      { name: 'C4', arabicName: 'راست', step: 'C', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'G', finger: '3', positionNote: '3rd finger on G string' } },
      { name: 'D4', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E♭4', arabicName: 'كرد', step: 'E', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'D', finger: '1', positionNote: '1st finger low on D' } },
      { name: 'F4', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D' } },
      { name: 'G4', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D' } },
      { name: 'A♭4', arabicName: 'حصار', step: 'A', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'A', finger: '1-', positionNote: '1st finger low on A' } },
      { name: 'B4', arabicName: 'بوسليك', step: 'B', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '1+', positionNote: '1st finger standard on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
    ],
  },
  {
    id: 'kurd',
    name: 'Maqam Kurd',
    arabicName: 'مقام كرد',
    category: 'Kurd',
    tonic: 'D4',
    description: 'Built on the Phrygian scale (minor second D4 to E♭4). Popular in modern Arabic songs and cinematic violin melodies.',
    jins: { asl: 'Jins Kurd on D', far: 'Jins Nahawand on G' },
    scaleNotes: [
      { name: 'D4', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E♭4', arabicName: 'كرد', step: 'E', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'D', finger: '1', positionNote: '1st finger low on D' } },
      { name: 'F4', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D' } },
      { name: 'G4', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D' } },
      { name: 'A4', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B♭4', arabicName: 'عجم', step: 'B', alter: -1, octave: 4, centsOffset: -100, violinFingering: { string: 'A', finger: '1', positionNote: '1st finger low on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
      { name: 'D5', arabicName: 'محير', step: 'D', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '3', positionNote: '3rd finger on A' } },
    ],
  },
  {
    id: 'ajam',
    name: 'Maqam Ajam',
    arabicName: 'مقام عجم',
    category: 'Ajam',
    tonic: 'C4',
    description: 'Equivalent to the Western major scale on C (C4 D4 E4 F4 G4 A4 B4 C5). Triumphant and bright character.',
    jins: { asl: 'Jins Ajam on C', far: 'Jins Ajam on G' },
    scaleNotes: [
      { name: 'C4', arabicName: 'عجم', step: 'C', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'G', finger: '3', positionNote: '3rd finger on G string' } },
      { name: 'D4', arabicName: 'دوكاه', step: 'D', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '0', positionNote: 'Open D string' } },
      { name: 'E4', arabicName: 'بوسليك', step: 'E', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '1', positionNote: '1st finger on D' } },
      { name: 'F4', arabicName: 'جهاركاه', step: 'F', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '2', positionNote: '2nd finger low on D' } },
      { name: 'G4', arabicName: 'نوى', step: 'G', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'D', finger: '3', positionNote: '3rd finger on D' } },
      { name: 'A4', arabicName: 'حسيني', step: 'A', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '0', positionNote: 'Open A string' } },
      { name: 'B4', arabicName: 'ماهوار', step: 'B', alter: 0, octave: 4, centsOffset: 0, violinFingering: { string: 'A', finger: '1', positionNote: '1st finger high on A' } },
      { name: 'C5', arabicName: 'كردان', step: 'C', alter: 0, octave: 5, centsOffset: 0, violinFingering: { string: 'A', finger: '2', positionNote: '2nd finger low on A' } },
    ],
  },
];

/**
 * Generate standard MusicXML note XML snippet with proper quarter tone alter tags.
 */
export function generateMusicXmlNote(
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
  octave: number,
  alter: number,
  duration = 1,
  type = 'quarter'
): string {
  const alterTag = alter !== 0 ? `\n        <alter>${alter}</alter>` : '';
  let accidentalTag = '';
  if (alter === -0.5) accidentalTag = '\n      <accidental>quarter-flat</accidental>';
  else if (alter === 0.5) accidentalTag = '\n      <accidental>quarter-sharp</accidental>';
  else if (alter === -1) accidentalTag = '\n      <accidental>flat</accidental>';
  else if (alter === 1) accidentalTag = '\n      <accidental>sharp</accidental>';

  return `    <note>
      <pitch>
        <step>${step}</step>${alterTag}
        <octave>${octave}</octave>
      </pitch>
      <duration>${duration}</duration>
      <type>${type}</type>${accidentalTag}
    </note>`;
}
