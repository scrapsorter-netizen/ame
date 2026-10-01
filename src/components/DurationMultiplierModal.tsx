import React, { useState } from 'react';
import { X, Clock, Check, Sparkles, Scale, ArrowRight, Music } from 'lucide-react';
import { 
  scaleScoreDurations, 
  scaleSnippetDuration, 
  getShiftedNoteType,
  DurationScaleOptions 
} from '../lib/durationMultiplier';
import { useScoreStore } from '../store/useScoreStore';

interface DurationMultiplierModalProps {
  onClose: () => void;
  onApplied: () => void;
  selectedTextSnippet?: string;
  onReplaceSelection?: (newText: string) => void;
}

export const DurationMultiplierModal: React.FC<DurationMultiplierModalProps> = ({
  onClose,
  onApplied,
  selectedTextSnippet,
  onReplaceSelection,
}) => {
  const { xmlContent, setXmlContent } = useScoreStore();

  const hasSelection = Boolean(
    selectedTextSnippet && 
    selectedTextSnippet.trim().length > 0 && 
    (selectedTextSnippet.includes('<note') || selectedTextSnippet.includes('<duration'))
  );

  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(0.5);
  const [customMultiplier, setCustomMultiplier] = useState<number>(0.5);
  const [useCustom, setUseCustom] = useState(false);
  const [scope, setScope] = useState<'selection' | 'all' | 'measures'>(
    hasSelection ? 'selection' : 'all'
  );
  const [measureStart, setMeasureStart] = useState<number>(1);
  const [measureEnd, setMeasureEnd] = useState<number>(4);
  const [adjustTimeSignature, setAdjustTimeSignature] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeMultiplier = useCustom ? customMultiplier : selectedMultiplier;

  const PRESET_MULTIPLIERS = [
    {
      multiplier: 0.5,
      label: '½x (Halve Durations)',
      desc: 'Quarters → Eighths, Halves → Quarters. Ideal when converting 4/4 to 2/4 or 4/8.',
      badge: 'Popular',
    },
    {
      multiplier: 2.0,
      label: '2x (Double Durations)',
      desc: 'Eighths → Quarters, Quarters → Halves. Ideal when expanding 2/4 to 4/4.',
      badge: 'Popular',
    },
    {
      multiplier: 0.25,
      label: '¼x (Quarter Length)',
      desc: 'Halves → Eighths, Quarters → 16ths. Compresses durations by 4x.',
    },
    {
      multiplier: 4.0,
      label: '4x (Quadruple Length)',
      desc: '16ths → Quarters, Eighths → Halves. Expands durations by 4x.',
    },
    {
      multiplier: 1.5,
      label: '1.5x (Dotted Ratio)',
      desc: 'Scales straight notes by 3/2 (e.g. quarter 2 → dotted quarter 3).',
    },
  ];

  const handleApply = () => {
    if (activeMultiplier <= 0) {
      setErrorMsg('Multiplier must be greater than 0.');
      return;
    }

    try {
      if (scope === 'selection' && hasSelection && selectedTextSnippet && onReplaceSelection) {
        const { resultXml, notesCount } = scaleSnippetDuration(selectedTextSnippet, activeMultiplier);
        onReplaceSelection(resultXml);
        setSuccessMsg(`Scaled ${notesCount} selected note(s) by ${activeMultiplier}x!`);
      } else {
        const { updatedXml, notesModifiedCount } = scaleScoreDurations(xmlContent, {
          multiplier: activeMultiplier,
          scope,
          measureStart,
          measureEnd,
          adjustTimeSignature: scope === 'all' ? adjustTimeSignature : false,
        });

        setXmlContent(updatedXml);
        setSuccessMsg(`Scaled ${notesModifiedCount} note(s) across score by ${activeMultiplier}x!`);
      }

      setTimeout(() => {
        onApplied();
        onClose();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to scale durations.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Note Duration Multiplier
                <span className="arabic-text text-amber-300 font-medium text-sm" dir="rtl">
                  مضاعفة أو تنصيف أزمنة النغمات
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Halve, double, or scale note durations and time signatures across selected notes
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
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

          {/* 1. Target Scope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Target Scope:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('selection')}
                disabled={!hasSelection}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'selection'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : hasSelection
                    ? 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    : 'bg-neutral-950/30 border-neutral-800/40 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <span className="text-xs font-semibold">Selected Notes</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {hasSelection ? 'Code highlighted' : 'No notes highlighted'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'all'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <span className="text-xs font-semibold">Entire Score</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">All measures &amp; notes</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('measures')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'measures'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <span className="text-xs font-semibold">Measure Range</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Specific measure range</span>
              </button>
            </div>

            {/* Measure Range Inputs */}
            {scope === 'measures' && (
              <div className="flex items-center gap-3 pt-2 text-xs text-neutral-300 animate-in fade-in">
                <span>From Measure:</span>
                <input
                  type="number"
                  min="1"
                  value={measureStart}
                  onChange={(e) => setMeasureStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 px-2 py-1 rounded bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-center font-mono text-xs focus:outline-none"
                />
                <span>to</span>
                <input
                  type="number"
                  min="1"
                  value={measureEnd}
                  onChange={(e) => setMeasureEnd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 px-2 py-1 rounded bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-center font-mono text-xs focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 2. Multiplier Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Multiplier Factor:
            </label>
            <div className="space-y-2">
              {PRESET_MULTIPLIERS.map((p) => (
                <button
                  key={p.multiplier}
                  type="button"
                  onClick={() => {
                    setSelectedMultiplier(p.multiplier);
                    setUseCustom(false);
                    setErrorMsg(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left border transition-all ${
                    !useCustom && selectedMultiplier === p.multiplier
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs font-mono">{p.label}</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">{p.desc}</span>
                  </div>
                  {p.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Multiplier Input */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-400">
                Or Custom Multiplier:
              </label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                max="32"
                value={customMultiplier}
                onChange={(e) => {
                  setCustomMultiplier(parseFloat(e.target.value) || 1);
                  setUseCustom(true);
                  setErrorMsg(null);
                }}
                className="w-24 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 font-mono text-xs focus:outline-none"
              />
              <span className="text-xs text-neutral-400">
                {activeMultiplier === 0.5
                  ? 'Halving (½x)'
                  : activeMultiplier === 2.0
                  ? 'Doubling (2x)'
                  : `${activeMultiplier}x speed scaling`}
              </span>
            </div>
          </div>

          {/* 3. Time Signature Adjustment Checkbox (Only for all scope) */}
          {scope === 'all' && (
            <div className="pt-2 border-t border-neutral-800/80">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={adjustTimeSignature}
                  onChange={(e) => setAdjustTimeSignature(e.target.checked)}
                  className="mt-0.5 rounded accent-amber-500"
                />
                <div>
                  <span className="font-semibold text-neutral-200">
                    Automatically adapt Time Signature to match
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    When halving durations, updates time signature from 4/4 to 2/4 (or 4/8). When doubling, updates from 2/4 to 4/4.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* 4. Live Visual Preview */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
            <span className="text-neutral-400 font-sans block text-[11px] font-semibold">
              Conversion Preview:
            </span>
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">quarter (2)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-300 font-semibold">
                {getShiftedNoteType('quarter', activeMultiplier)} ({Math.max(1, Math.round(2 * activeMultiplier))})
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">eighth (1)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-300 font-semibold">
                {getShiftedNoteType('eighth', activeMultiplier)} ({Math.max(1, Math.round(1 * activeMultiplier))})
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Apply Multiplier ({activeMultiplier}x)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
