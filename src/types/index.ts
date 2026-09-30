/**
 * Arabic MusicXML Editor & Violin Studio Types
 */

export type AccidentalType = 
  | 'natural'
  | 'sharp'
  | 'flat'
  | 'double-sharp'
  | 'double-flat'
  | 'quarter-flat'    // -0.5 alter (e.g. sikah / rast / bayati half-flat)
  | 'quarter-sharp'   // +0.5 alter
  | 'three-quarters-flat'
  | 'three-quarters-sharp';

export interface MaqamNote {
  name: string;        // e.g. "Rast (C4)", "Sikah (E d 4)"
  arabicName: string;  // e.g. "راست", "سيكاه"
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  alter: number;       // -1, -0.5, 0, 0.5, 1
  octave: number;
  centsOffset: number; // e.g. -50 for quarter-flat
  violinFingering?: {
    string: 'G' | 'D' | 'A' | 'E';
    finger: number | string; // 0, 1, '1½', 2, 3, 4
    positionNote: string;
  };
}

export interface Maqam {
  id: string;
  name: string;
  arabicName: string;
  category: 'Rast' | 'Bayati' | 'Hijaz' | 'Saba' | 'Sikah' | 'Nahawand' | 'Kurd' | 'Ajam';
  tonic: string;
  description: string;
  scaleNotes: MaqamNote[];
  jins: {
    asl: string;
    far: string;
  };
}

export interface ParsedNoteEvent {
  id: string;
  measure: number;
  beat: number;
  timeInSeconds: number;
  durationSeconds: number;
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  octave: number;
  alter: number; // -0.5 for quarter flat, 0.5 for quarter sharp, etc.
  frequency: number;
  midiNumber: number;
  accidental?: string;
  isRest: boolean;
  tieStart?: boolean;
  tieStop?: boolean;
  dynamic?: string;
  violinString?: 'G' | 'D' | 'A' | 'E';
  violinFinger?: string;
}

export type InstrumentType = 
  | 'violin_bowed' 
  | 'violin_pizz' 
  | 'oud' 
  | 'nay_flute' 
  | 'acoustic_grand';

export interface ViolinTuning {
  string4: string; // G3
  string3: string; // D4
  string2: string; // A4
  string1: string; // E5
  a4PitchHz: number; // usually 440 Hz
}

export interface SampleScore {
  id: string;
  title: string;
  arabicTitle: string;
  composer: string;
  maqam: string;
  meter: string;
  tempo: number;
  description: string;
  xml: string;
}

export interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  category: 'Playback' | 'Navigation' | 'Editor' | 'View';
}
