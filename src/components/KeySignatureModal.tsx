import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  Music, 
  Check, 
  RotateCcw, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { 
  KeyConfig, 
  STANDARD_KEY_SIGNATURES, 
  ARABIC_KEY_PRESETS, 
  getCurrentKeySignatureFromXml, 
  updateKeySignatureInXml 
} from '../lib/scoreTemplates';

interface KeySignatureModalProps {
  onClose: () => void;
  onKeyApplied: () => void;
}

export const KeySignatureModal: React.FC<KeySignatureModalProps> = ({
  onClose,
  onKeyApplied,
}) => {
  const { xmlContent, setXmlContent } = useScoreStore();

  const [activeTab, setActiveTab] = useState<'maqam' | 'western'>('maqam');
  const [selectedFifths, setSelectedFifths] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<string>('major');
  const [selectedMaqamPresetId, setSelectedMaqamPresetId] = useState<string>('rast-c');
  const [targetMeasure, setTargetMeasure] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Microtonal step toggles
  const [includeHalfFlatE, setIncludeHalfFlatE] = useState<boolean>(true);
  const [includeHalfFlatB, setIncludeHalfFlatB] = useState<boolean>(true);
  const [includeHalfSharpF, setIncludeHalfSharpF] = useState<boolean>(false);

  // Initialize from current score
  useEffect(() => {
    try {
      const current = getCurrentKeySignatureFromXml(xmlContent);
      setSelectedFifths(current.fifths);
      if (current.mode) setSelectedMode(current.mode);

      // Check if quarter tones exist
      if (current.quarterTones) {
        const hasE = current.quarterTones.some((q) => q.step === 'E' && q.alter === -0.5);
        const hasB = current.quarterTones.some((q) => q.step === 'B' && q.alter === -0.5);
        const hasF = current.quarterTones.some((q) => q.step === 'F' && q.alter === 0.5);
        setIncludeHalfFlatE(hasE);
        setIncludeHalfFlatB(hasB);
        setIncludeHalfSharpF(hasF);
      }
    } catch {
      // ignore
    }
  }, [xmlContent]);

  // When clicking an Arabic Maqam preset
  const handleSelectMaqamPreset = (presetId: string) => {
    setSelectedMaqamPresetId(presetId);
    const preset = ARABIC_KEY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedFifths(preset.config.fifths);
    setSelectedMode(preset.config.mode || 'major');

    const hasE = preset.config.quarterTones?.some((q) => q.step === 'E') || false;
    const hasB = preset.config.quarterTones?.some((q) => q.step === 'B') || false;
    setIncludeHalfFlatE(hasE);
    setIncludeHalfFlatB(hasB);
    setIncludeHalfSharpF(false);
  };

  const handleApply = () => {
    setErrorMsg(null);
    try {
      const quarterTones: KeyConfig['quarterTones'] = [];
      if (includeHalfFlatE) {
        quarterTones.push({ step: 'E', alter: -0.5, accidental: 'slash-flat' });
      }
      if (includeHalfFlatB) {
        quarterTones.push({ step: 'B', alter: -0.5, accidental: 'slash-flat' });
      }
      if (includeHalfSharpF) {
        quarterTones.push({ step: 'F', alter: 0.5, accidental: 'quarter-sharp' });
      }

      const keyConfig: KeyConfig = {
        fifths: selectedFifths,
        mode: selectedMode,
        quarterTones,
        measureNumber: targetMeasure,
      };

      const updatedXml = updateKeySignatureInXml(xmlContent, keyConfig);
      setXmlContent(updatedXml);
      onKeyApplied();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update key signature');
    }
  };

  const selectedWestern = STANDARD_KEY_SIGNATURES.find((k) => k.fifths === selectedFifths);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Set Score Key Signature
                <span className="arabic-text text-amber-300 font-normal text-sm" dir="rtl">
                  ضبط المفتاح والمقام الموسيقي
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Choose Arabic Maqam microtonal alterations or Western Cycle of Fifths
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

        {/* Tab switchers */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('maqam')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'maqam'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Arabic Maqamat &amp; Quarter-Tones (مقامات شرقية)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('western')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'western'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Western Fifths (دائرة الدلائل الغربية)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {activeTab === 'maqam' ? (
            /* TAB 1: Arabic Maqamat */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ARABIC_KEY_PRESETS.map((preset) => {
                  const isSelected = selectedMaqamPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectMaqamPreset(preset.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-950 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-100">
                          {preset.name}
                        </span>
                        <span className="arabic-text text-amber-300 font-medium text-xs" dir="rtl">
                          {preset.arabicName}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {preset.config.fifths === 0
                          ? '0 fifths (Natural base)'
                          : `${preset.config.fifths} ${preset.config.fifths < 0 ? 'flats' : 'sharps'}`}
                        {preset.config.quarterTones && preset.config.quarterTones.length > 0 && (
                          <span className="text-amber-300 ml-1">
                            · {preset.config.quarterTones.map((q) => `${q.step}𝄳`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Microtonal Quarter-Tone Accidentals Customization */}
              <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-200 block">
                  Quarter-Tone Key Signature Accidentals (علامات التحويل الربع صوتية):
                </span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={includeHalfFlatE}
                      onChange={(e) => setIncludeHalfFlatE(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>E𝄳 (Sikah Half-flat on E)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={includeHalfFlatB}
                      onChange={(e) => setIncludeHalfFlatB(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>B𝄳 (Awj Half-flat on B)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={includeHalfSharpF}
                      onChange={(e) => setIncludeHalfSharpF(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>F𝄲 (Quarter-sharp on F)</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Standard Western Fifths */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Select Cycle of Fifths (-7 to +7):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {STANDARD_KEY_SIGNATURES.map((sig) => {
                    const isSelected = selectedFifths === sig.fifths;
                    return (
                      <button
                        key={sig.fifths}
                        type="button"
                        onClick={() => setSelectedFifths(sig.fifths)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-950 border-amber-500 ring-1 ring-amber-500/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                          <span>{sig.major}</span>
                          <span className="text-neutral-400 font-mono text-[11px]">
                            {sig.fifths > 0 ? `+${sig.fifths}` : sig.fifths}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {sig.minor} · {sig.accidentals}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-300">Mode:</span>
                <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="major"
                    checked={selectedMode === 'major'}
                    onChange={() => setSelectedMode('major')}
                    className="accent-amber-500"
                  />
                  <span>Major</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="minor"
                    checked={selectedMode === 'minor'}
                    onChange={() => setSelectedMode('minor')}
                    className="accent-amber-500"
                  />
                  <span>Minor</span>
                </label>
              </div>
            </div>
          )}

          {/* Scope: Measure 1 or specific measure */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
            <span>Apply To:</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  checked={targetMeasure === 1}
                  onChange={() => setTargetMeasure(1)}
                  className="accent-amber-500"
                />
                <span>Measure 1 (Global Score Key)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  checked={targetMeasure !== 1}
                  onChange={() => setTargetMeasure(2)}
                  className="accent-amber-500"
                />
                <span>Key Change at Measure</span>
              </label>
              {targetMeasure !== 1 && (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={targetMeasure}
                  onChange={(e) => setTargetMeasure(parseInt(e.target.value, 10) || 2)}
                  className="w-14 bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 font-mono text-center"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60">
          <div className="text-xs text-neutral-400 font-mono">
            Key: <strong className="text-amber-300">{selectedFifths > 0 ? `+${selectedFifths}` : selectedFifths} fifths</strong>
            {includeHalfFlatE && ' + E𝄳'}
            {includeHalfFlatB && ' + B𝄳'}
            {includeHalfSharpF && ' + F𝄲'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Key Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
