import React from 'react';
import { X, Music2, Sparkles, Check, Play, Volume2 } from 'lucide-react';
import { ARABIC_MAQAMAT } from '../lib/arabicMusic';
import { useScoreStore } from '../store/useScoreStore';
import { ScoreAudioEngine } from '../lib/audioEngine';

interface MaqamSelectorModalProps {
  onClose: () => void;
  audioEngine: ScoreAudioEngine;
  onInsertMaqamScale: (maqamId: string) => void;
}

export const MaqamSelectorModal: React.FC<MaqamSelectorModalProps> = ({
  onClose,
  audioEngine,
  onInsertMaqamScale,
}) => {
  const { activeMaqamId, setActiveMaqamId } = useScoreStore();

  const handlePlayScale = async (maqamId: string) => {
    const maqam = ARABIC_MAQAMAT.find((m) => m.id === maqamId);
    if (!maqam) return;

    for (let i = 0; i < maqam.scaleNotes.length; i++) {
      const note = maqam.scaleNotes[i];
      audioEngine.playSingleNote(note.step, note.octave, note.alter, 0.45);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Arabic Maqamat &amp; Quarter-Tone Scales
                <span className="arabic-text text-amber-300 font-normal text-sm" dir="rtl">
                  المقامات الشرقية وأرباع التون
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Explore tuning tables, jins divisions, and insert modal templates into your score
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

        {/* Maqamat Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARABIC_MAQAMAT.map((maqam) => {
              const isSelected = activeMaqamId === maqam.id;

              return (
                <div
                  key={maqam.id}
                  onClick={() => setActiveMaqamId(maqam.id)}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-950 border-amber-500/80 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Top line: Name & Arabic */}
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-100">
                          {maqam.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-amber-400 font-medium bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="arabic-text text-amber-300 font-medium text-sm" dir="rtl">
                        {maqam.arabicName}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                      {maqam.description}
                    </p>

                    {/* Jins */}
                    <div className="text-[11px] text-neutral-400 bg-neutral-900/80 p-2 rounded-md border border-neutral-800 mb-3 space-y-0.5">
                      <div>
                        <strong className="text-neutral-300">Asl (Base):</strong> {maqam.jins.asl}
                      </div>
                      <div>
                        <strong className="text-neutral-300">Far' (Branch):</strong> {maqam.jins.far}
                      </div>
                    </div>

                    {/* Scale notes pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {maqam.scaleNotes.map((note, nIdx) => (
                        <span
                          key={nIdx}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            note.alter === -0.5 || note.alter === 0.5
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40 font-bold'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {note.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayScale(maqam.id);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Audition Scale</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertMaqamScale(maqam.id);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Insert into Score</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400">
          <span>Quarter-tones (-0.5 alter) are detuned by exactly -50 cents on Tone.js violin synth.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
