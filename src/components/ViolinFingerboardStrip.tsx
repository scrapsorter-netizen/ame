import React from 'react';
import { Volume2, Music, Sparkles } from 'lucide-react';
import { ParsedNoteEvent } from '../types';
import { calculatePitchFrequency, getAccidentalGlyph } from '../lib/arabicMusic';

interface ViolinFingerboardStripProps {
  currentNote?: ParsedNoteEvent | null;
  onPlayNote?: (step: string, octave: number, alter: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface FingerPosition {
  label: string;
  finger: string;
  step: string;
  octave: number;
  alter: number;
  isQuarterTone?: boolean;
  maqamDegree?: string;
}

// 1st position layout for all 4 violin strings
const STRINGS_DATA: {
  id: 'E' | 'A' | 'D' | 'G';
  name: string;
  arabicName: string;
  openNote: { step: string; octave: number; alter: number };
  positions: FingerPosition[];
}[] = [
  {
    id: 'E',
    name: '1st String (E5)',
    arabicName: 'وتر الحاد (مي)',
    openNote: { step: 'E', octave: 5, alter: 0 },
    positions: [
      { label: 'E5', finger: '0 (Open)', step: 'E', octave: 5, alter: 0 },
      { label: 'F5', finger: '1st (low)', step: 'F', octave: 5, alter: 0 },
      { label: 'F𝄲5', finger: '1st (𝄲)', step: 'F', octave: 5, alter: 0.5, isQuarterTone: true, maqamDegree: 'Ajam' },
      { label: 'F♯5', finger: '1st', step: 'F', octave: 5, alter: 1 },
      { label: 'G5', finger: '2nd (low)', step: 'G', octave: 5, alter: 0 },
      { label: 'G𝄲5', finger: '2nd (𝄲)', step: 'G', octave: 5, alter: 0.5, isQuarterTone: true },
      { label: 'G♯5', finger: '2nd (high)', step: 'G', octave: 5, alter: 1 },
      { label: 'A5', finger: '3rd', step: 'A', octave: 5, alter: 0 },
      { label: 'B♭5', finger: '4th (low)', step: 'B', octave: 5, alter: -1 },
      { label: 'B𝄳5', finger: '4th (𝄳)', step: 'B', octave: 5, alter: -0.5, isQuarterTone: true, maqamDegree: 'Awj' },
      { label: 'B5', finger: '4th', step: 'B', octave: 5, alter: 0 },
    ],
  },
  {
    id: 'A',
    name: '2nd String (A4)',
    arabicName: 'وتر الدوكاه (لا)',
    openNote: { step: 'A', octave: 4, alter: 0 },
    positions: [
      { label: 'A4', finger: '0 (Open)', step: 'A', octave: 4, alter: 0 },
      { label: 'B♭4', finger: '1st (low)', step: 'B', octave: 4, alter: -1 },
      { label: 'B𝄳4', finger: '1st (𝄳)', step: 'B', octave: 4, alter: -0.5, isQuarterTone: true, maqamDegree: 'Awj / Bayati' },
      { label: 'B4', finger: '1st', step: 'B', octave: 4, alter: 0 },
      { label: 'C5', finger: '2nd (low)', step: 'C', octave: 5, alter: 0 },
      { label: 'C𝄲5', finger: '2nd (𝄲)', step: 'C', octave: 5, alter: 0.5, isQuarterTone: true },
      { label: 'C♯5', finger: '2nd (high)', step: 'C', octave: 5, alter: 1 },
      { label: 'D5', finger: '3rd', step: 'D', octave: 5, alter: 0 },
      { label: 'E♭5', finger: '4th (low)', step: 'E', octave: 5, alter: -1 },
      { label: 'E𝄳5', finger: '4th (𝄳)', step: 'E', octave: 5, alter: -0.5, isQuarterTone: true, maqamDegree: 'Sikah' },
      { label: 'E5', finger: '4th', step: 'E', octave: 5, alter: 0 },
    ],
  },
  {
    id: 'D',
    name: '3rd String (D4)',
    arabicName: 'وتر الراست (ري)',
    openNote: { step: 'D', octave: 4, alter: 0 },
    positions: [
      { label: 'D4', finger: '0 (Open)', step: 'D', octave: 4, alter: 0 },
      { label: 'E♭4', finger: '1st (low)', step: 'E', octave: 4, alter: -1 },
      { label: 'E𝄳4', finger: '1st (𝄳)', step: 'E', octave: 4, alter: -0.5, isQuarterTone: true, maqamDegree: 'Sikah (Rast 3rd)' },
      { label: 'E4', finger: '1st', step: 'E', octave: 4, alter: 0 },
      { label: 'F4', finger: '2nd (low)', step: 'F', octave: 4, alter: 0, maqamDegree: 'Jaharkah' },
      { label: 'F𝄲4', finger: '2nd (𝄲)', step: 'F', octave: 4, alter: 0.5, isQuarterTone: true, maqamDegree: 'Saba/Hijaz' },
      { label: 'F♯4', finger: '2nd (high)', step: 'F', octave: 4, alter: 1 },
      { label: 'G4', finger: '3rd', step: 'G', octave: 4, alter: 0, maqamDegree: 'Nawa' },
      { label: 'A♭4', finger: '4th (low)', step: 'A', octave: 4, alter: -1 },
      { label: 'A𝄳4', finger: '4th (𝄳)', step: 'A', octave: 4, alter: -0.5, isQuarterTone: true },
      { label: 'A4', finger: '4th', step: 'A', octave: 4, alter: 0 },
    ],
  },
  {
    id: 'G',
    name: '4th String (G3)',
    arabicName: 'وتر القرار (صول)',
    openNote: { step: 'G', octave: 3, alter: 0 },
    positions: [
      { label: 'G3', finger: '0 (Open)', step: 'G', octave: 3, alter: 0, maqamDegree: 'Yekah' },
      { label: 'A♭3', finger: '1st (low)', step: 'A', octave: 3, alter: -1 },
      { label: 'A𝄳3', finger: '1st (𝄳)', step: 'A', octave: 3, alter: -0.5, isQuarterTone: true },
      { label: 'A3', finger: '1st', step: 'A', octave: 3, alter: 0, maqamDegree: 'Ushshaq' },
      { label: 'B♭3', finger: '2nd (low)', step: 'B', octave: 3, alter: -1 },
      { label: 'B𝄳3', finger: '2nd (𝄳)', step: 'B', octave: 3, alter: -0.5, isQuarterTone: true, maqamDegree: 'Iraq' },
      { label: 'B3', finger: '2nd', step: 'B', octave: 3, alter: 0 },
      { label: 'C4', finger: '3rd', step: 'C', octave: 4, alter: 0, maqamDegree: 'Rast' },
      { label: 'D♭4', finger: '4th (low)', step: 'D', octave: 4, alter: -1 },
      { label: 'D𝄳4', finger: '4th (𝄳)', step: 'D', octave: 4, alter: -0.5, isQuarterTone: true },
      { label: 'D4', finger: '4th', step: 'D', octave: 4, alter: 0, maqamDegree: 'Dukah' },
    ],
  },
];

export const ViolinFingerboardStrip: React.FC<ViolinFingerboardStripProps> = ({
  currentNote,
  onPlayNote,
  isOpen,
  onToggle,
}) => {
  if (!isOpen) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/90 border-t border-neutral-800 text-xs">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-amber-400 transition-colors font-sans text-xs"
        >
          <Music className="w-3.5 h-3.5 text-amber-500" />
          <span>Show Live Violin Fingerboard &amp; Intonation</span>
          <span className="arabic-text text-amber-400/80 text-[11px] ml-1" dir="rtl">
            (عفق الكمان)
          </span>
        </button>

        {currentNote && !currentNote.isRest && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300">
            <span className="text-amber-400 font-semibold">
              {currentNote.step}{getAccidentalGlyph(currentNote.alter)}{currentNote.octave}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">
              String: <strong className="text-amber-300">{currentNote.violinString}</strong>
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">
              Finger: <strong className="text-amber-300">{currentNote.violinFinger}</strong>
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">{Math.round(currentNote.frequency)} Hz</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-neutral-950 border-t border-neutral-800 text-xs shrink-0 select-none animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/80 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Violin 1st Position Live Tracker
          </span>
          <span className="arabic-text text-amber-300/80 text-xs" dir="rtl">
            لوحة عفق الأوتار وربع التون (سيكاه / بياتي)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentNote && !currentNote.isRest && (
            <div className="flex items-center gap-2 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <span>Playing:</span>
              <strong className="text-amber-200">
                {currentNote.step}{getAccidentalGlyph(currentNote.alter)}{currentNote.octave}
              </strong>
              <span>({Math.round(currentNote.frequency)} Hz)</span>
              <span>·</span>
              <span>{currentNote.violinString} String, {currentNote.violinFinger}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
          >
            Hide
          </button>
        </div>
      </div>

      {/* The 4 Strings Visualizer Grid */}
      <div className="p-2 space-y-1.5 overflow-x-auto">
        {STRINGS_DATA.map((str) => {
          const isStringActive = currentNote && currentNote.violinString === str.id;

          return (
            <div
              key={str.id}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all ${
                isStringActive
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-neutral-900/60 border-neutral-800/80'
              }`}
            >
              {/* String Label */}
              <div className="w-24 shrink-0 flex flex-col leading-tight">
                <span className={`font-mono font-semibold text-xs ${isStringActive ? 'text-amber-300' : 'text-neutral-300'}`}>
                  {str.id} ({str.openNote.step}{str.openNote.octave})
                </span>
                <span className="arabic-text text-[10px] text-neutral-400" dir="rtl">
                  {str.arabicName}
                </span>
              </div>

              {/* Finger positions row along the string */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5">
                {str.positions.map((pos, idx) => {
                  const isNoteActive =
                    currentNote &&
                    currentNote.step.toUpperCase() === pos.step.toUpperCase() &&
                    currentNote.octave === pos.octave &&
                    Math.abs(currentNote.alter - pos.alter) < 0.25;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPlayNote && onPlayNote(pos.step, pos.octave, pos.alter)}
                      title={`Audition ${pos.label} (${pos.finger}) - ${Math.round(calculatePitchFrequency(pos.step, pos.octave, pos.alter))} Hz`}
                      className={`group relative flex flex-col items-center justify-center px-2 py-1 rounded text-center transition-all ${
                        isNoteActive
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/40 scale-105 z-10'
                          : pos.isQuarterTone
                          ? 'bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300'
                          : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-neutral-700/60'
                      }`}
                    >
                      <span className="font-mono text-xs leading-none">
                        {pos.label}
                      </span>
                      <span
                        className={`text-[9px] mt-0.5 font-sans leading-none ${
                          isNoteActive ? 'text-neutral-900 font-semibold' : 'text-neutral-400'
                        }`}
                      >
                        {pos.finger}
                      </span>
                      {pos.maqamDegree && (
                        <span
                          className={`text-[8px] leading-none mt-0.5 ${
                            isNoteActive ? 'text-neutral-950 font-bold' : 'text-amber-400/90'
                          }`}
                        >
                          {pos.maqamDegree}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
