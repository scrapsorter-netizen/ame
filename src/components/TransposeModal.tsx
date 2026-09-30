import React, { useState } from 'react';
import { X, ArrowUpDown, MoveUp, MoveDown, Music, Check, Sparkles } from 'lucide-react';
import { transposeMusicXml } from '../lib/transposer';
import { useScoreStore } from '../store/useScoreStore';

interface TransposeModalProps {
  onClose: () => void;
  onTransposed: () => void;
}

export const TransposeModal: React.FC<TransposeModalProps> = ({ onClose, onTransposed }) => {
  const { xmlContent, setXmlContent } = useScoreStore();
  const [selectedDelta, setSelectedDelta] = useState<number>(1);
  const [customDelta, setCustomDelta] = useState<number>(0);
  const [useCustom, setUseCustom] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const PRESETS = [
    { label: '+1 Quarter-tone (+50¢)', delta: 0.5, desc: 'Shift to Sikah / microtonal tonic' },
    { label: '-1 Quarter-tone (-50¢)', delta: -0.5, desc: 'Shift down by 50 cents' },
    { label: '+1 Half-step (+1 Semitone)', delta: 1, desc: 'E.g. C → C♯ / D♭' },
    { label: '-1 Half-step (-1 Semitone)', delta: -1, desc: 'E.g. D → D♭ / C♯' },
    { label: '+1 Whole-step (+2 Semitones)', delta: 2, desc: 'E.g. Rast on C → Rast on D' },
    { label: '-1 Whole-step (-2 Semitones)', delta: -2, desc: 'E.g. Bayati on D → Bayati on C' },
    { label: '+Perfect 4th (+5 Semitones)', delta: 5, desc: 'E.g. C → F' },
    { label: '+Perfect 5th (+7 Semitones)', delta: 7, desc: 'E.g. Rast on C → Rast on G' },
    { label: '+1 Octave (+12 Semitones)', delta: 12, desc: 'Shift full octave up' },
    { label: '-1 Octave (-12 Semitones)', delta: -12, desc: 'Shift full octave down' },
  ];

  const handleApply = () => {
    const delta = useCustom ? customDelta : selectedDelta;
    if (delta === 0) {
      setErrorMsg('Please select a non-zero transposition interval.');
      return;
    }

    try {
      const updated = transposeMusicXml(xmlContent, delta);
      setXmlContent(updated);
      setSuccessMsg(`Transposed score by ${delta > 0 ? `+${delta}` : delta} semitones!`);
      setTimeout(() => {
        onTransposed();
        onClose();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Transposition failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Transpose Score
                <span className="arabic-text text-amber-300 font-medium text-sm" dir="rtl">
                  تحويل مقام النوتة (دياتونيك / ربع تون)
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Shift pitches by semitones or quarter-tones (±50¢) across all measures
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Select Transposition Interval:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.delta}
                  type="button"
                  onClick={() => {
                    setSelectedDelta(p.delta);
                    setUseCustom(false);
                    setErrorMsg(null);
                  }}
                  className={`flex flex-col p-2.5 rounded-lg text-left border transition-all ${
                    !useCustom && selectedDelta === p.delta
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span className="font-semibold text-xs font-mono">{p.label}</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Delta Input */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-neutral-400">
                Or Custom Semitones (decimals allowed for quarter-tones, e.g. 1.5, -2.5):
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="-24"
                max="24"
                value={customDelta}
                onChange={(e) => {
                  setCustomDelta(parseFloat(e.target.value) || 0);
                  setUseCustom(true);
                  setErrorMsg(null);
                }}
                placeholder="0"
                className="w-24 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 font-mono text-xs focus:outline-none"
              />
              <span className="text-xs text-neutral-400">
                {useCustom
                  ? customDelta === 0
                    ? 'No shift'
                    : `${customDelta > 0 ? `+${customDelta}` : customDelta} semitones (${customDelta * 100} cents)`
                  : 'Preset selected'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-neutral-800 bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Apply Transposition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
