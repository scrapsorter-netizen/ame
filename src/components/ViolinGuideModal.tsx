import React from 'react';
import { X, Volume2, Info, BookOpen } from 'lucide-react';
import { VIOLIN_OPEN_STRINGS, ARABIC_MAQAMAT, calculatePitchFrequency } from '../lib/arabicMusic';
import { useScoreStore } from '../store/useScoreStore';
import { ScoreAudioEngine } from '../lib/audioEngine';

interface ViolinGuideModalProps {
  onClose: () => void;
  audioEngine: ScoreAudioEngine;
}

export const ViolinGuideModal: React.FC<ViolinGuideModalProps> = ({ onClose, audioEngine }) => {
  const { activeMaqamId } = useScoreStore();
  const currentMaqam = ARABIC_MAQAMAT.find((m) => m.id === activeMaqamId) || ARABIC_MAQAMAT[0];

  const playPitch = (step: string, octave: number, alter = 0) => {
    audioEngine.playSingleNote(step, octave, alter, 0.7);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Violin Fingerboard &amp; Quarter-Tone Intonation Guide
                <span className="arabic-text text-amber-300 font-medium text-sm" dir="rtl">
                  دليل عفق أوتار الكمان
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Standard Western Tuning (G3 – D4 – A4 – E5) with 24-EDO Quarter-Tone Half-Flats (Sikah / Awj)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Open Strings Reference */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-3">
              1. The 4 Open Strings (Standard Western Tuning)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VIOLIN_OPEN_STRINGS.map((str) => (
                <div
                  key={str.string}
                  onClick={() => playPitch(str.pitch[0], parseInt(str.pitch[1], 10), 0)}
                  className="flex flex-col p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-neutral-800/40 group"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>String {str.string}</span>
                    <Volume2 className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="text-lg font-bold font-mono text-neutral-100 group-hover:text-amber-300">
                    {str.pitch}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                    {str.freq.toFixed(2)} Hz
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1">Finger: 0 (Open)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Interactive Fingerboard Diagram */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                2. Arabic Quarter-Tone Fingerboard Positions (1st Position)
              </h3>
              <span className="text-[11px] text-neutral-400">Click any position to audition</span>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 font-mono text-xs">
              {/* String 1: E5 */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-neutral-400">E5 (1st):</span>
                <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
                  <button
                    onClick={() => playPitch('E', 5, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-amber-600/30 border border-neutral-700 text-neutral-200"
                  >
                    Open (E5)
                  </button>
                  <button
                    onClick={() => playPitch('F', 5, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st Low (F5)
                  </button>
                  <button
                    onClick={() => playPitch('F', 5, 0.5)}
                    className="px-2.5 py-1.5 rounded bg-amber-950/40 hover:bg-amber-600/40 border border-amber-600/60 text-amber-300 font-bold"
                  >
                    F𝄲5 (Quarter-sharp)
                  </button>
                  <button
                    onClick={() => playPitch('F', 5, 1)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st High (F♯5)
                  </button>
                  <button
                    onClick={() => playPitch('G', 5, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    2nd (G5)
                  </button>
                </div>
              </div>

              {/* String 2: A4 */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-neutral-400">A4 (2nd):</span>
                <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
                  <button
                    onClick={() => playPitch('A', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-amber-600/30 border border-neutral-700 text-neutral-200"
                  >
                    Open (A4)
                  </button>
                  <button
                    onClick={() => playPitch('B', 4, -1)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st Low (B♭4)
                  </button>
                  <button
                    onClick={() => playPitch('B', 4, -0.5)}
                    className="px-2.5 py-1.5 rounded bg-amber-950/40 hover:bg-amber-600/40 border border-amber-500/70 text-amber-300 font-bold shadow-sm"
                  >
                    B𝄳4 (Awj Half-flat)
                  </button>
                  <button
                    onClick={() => playPitch('B', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st High (B♮4)
                  </button>
                  <button
                    onClick={() => playPitch('C', 5, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    2nd (C5)
                  </button>
                </div>
              </div>

              {/* String 3: D4 */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-neutral-400">D4 (3rd):</span>
                <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
                  <button
                    onClick={() => playPitch('D', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-amber-600/30 border border-neutral-700 text-neutral-200"
                  >
                    Open (D4)
                  </button>
                  <button
                    onClick={() => playPitch('E', 4, -1)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st Low (E♭4)
                  </button>
                  <button
                    onClick={() => playPitch('E', 4, -0.5)}
                    className="px-2.5 py-1.5 rounded bg-amber-950/40 hover:bg-amber-600/40 border border-amber-500/70 text-amber-300 font-bold shadow-sm"
                  >
                    E𝄳4 (Sikah Half-flat)
                  </button>
                  <button
                    onClick={() => playPitch('E', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st High (E♮4)
                  </button>
                  <button
                    onClick={() => playPitch('F', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    2nd Low (F4)
                  </button>
                </div>
              </div>

              {/* String 4: G3 */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-neutral-400">G3 (4th):</span>
                <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
                  <button
                    onClick={() => playPitch('G', 3, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-amber-600/30 border border-neutral-700 text-neutral-200"
                  >
                    Open (G3)
                  </button>
                  <button
                    onClick={() => playPitch('A', 3, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    1st (A3)
                  </button>
                  <button
                    onClick={() => playPitch('B', 3, -0.5)}
                    className="px-2.5 py-1.5 rounded bg-amber-950/40 hover:bg-amber-600/40 border border-amber-500/70 text-amber-300 font-bold"
                  >
                    B𝄳3 (Half-flat)
                  </button>
                  <button
                    onClick={() => playPitch('C', 4, 0)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800/60 hover:bg-amber-600/30 border border-neutral-700 text-neutral-300"
                  >
                    3rd (C4 Rast Tonic)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Maqam Scale Preview */}
          <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">
                  Current Maqam Scale: {currentMaqam.name}{' '}
                  <span className="arabic-text text-amber-400 font-normal mr-2" dir="rtl">
                    ({currentMaqam.arabicName})
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{currentMaqam.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {currentMaqam.scaleNotes.map((note, idx) => {
                const isQuarterTone = note.alter === -0.5 || note.alter === 0.5;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playPitch(note.step, note.octave, note.alter)}
                    className={`flex flex-col p-2 rounded-lg border text-left transition-all hover:scale-105 active:scale-95 ${
                      isQuarterTone
                        ? 'bg-amber-950/30 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold">{note.name}</span>
                    <span className="arabic-text text-[10px] text-neutral-400" dir="rtl">
                      {note.arabicName}
                    </span>
                    {note.violinFingering && (
                      <span className="text-[9px] text-neutral-500 mt-1">
                        Str {note.violinFingering.string}, Fg {note.violinFingering.finger}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400">
          <span>Tuning Reference: A4 = 440 Hz (24 Equal Divisions of Octave)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
