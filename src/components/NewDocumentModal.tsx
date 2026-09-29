import React, { useState } from 'react';
import { 
  X, 
  FilePlus, 
  Sparkles, 
  Music, 
  Clock, 
  Check, 
  Layers, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { 
  NewDocumentConfig, 
  generateNewMusicXml, 
  ARABIC_KEY_PRESETS 
} from '../lib/scoreTemplates';

interface NewDocumentModalProps {
  onClose: () => void;
  onScoreCreated: () => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  onClose,
  onScoreCreated,
}) => {
  const { setXmlContent, setTempo } = useScoreStore();

  const [title, setTitle] = useState('New Arabic Score');
  const [arabicTitle, setArabicTitle] = useState('مقطوعة موسيقية جديدة');
  const [composer, setComposer] = useState('Violin Solo (كمان منفرد)');
  const [selectedMaqamPreset, setSelectedMaqamPreset] = useState('rast-c');
  const [beats, setBeats] = useState(4);
  const [beatType, setBeatType] = useState(4);
  const [bpm, setBpm] = useState(92);
  const [measuresCount, setMeasuresCount] = useState(8);
  const [starterType, setStarterType] = useState<'empty' | 'scale'>('empty');

  // Quick preset loader
  const applyPreset = (presetKey: 'blank' | 'rast_dulab' | 'bayati_samai' | 'longa_24') => {
    if (presetKey === 'blank') {
      setTitle('Untitled Score');
      setArabicTitle('مقطوعة جديدة');
      setSelectedMaqamPreset('rast-c');
      setBeats(4);
      setBeatType(4);
      setBpm(92);
      setMeasuresCount(4);
      setStarterType('empty');
    } else if (presetKey === 'rast_dulab') {
      setTitle('Taqsim Rast for Violin');
      setArabicTitle('تقسيم راست للكمان');
      setSelectedMaqamPreset('rast-c');
      setBeats(4);
      setBeatType(4);
      setBpm(88);
      setMeasuresCount(8);
      setStarterType('scale');
    } else if (presetKey === 'bayati_samai') {
      setTitle('Samai Bayati Composition');
      setArabicTitle('تأليف سماعي بياتي');
      setSelectedMaqamPreset('bayati-d');
      setBeats(10);
      setBeatType(8);
      setBpm(108);
      setMeasuresCount(8);
      setStarterType('scale');
    } else if (presetKey === 'longa_24') {
      setTitle('Violin Longa Nahawand');
      setArabicTitle('لونجا نهاوند للكمان');
      setSelectedMaqamPreset('nahawand-c');
      setBeats(2);
      setBeatType(4);
      setBpm(124);
      setMeasuresCount(12);
      setStarterType('empty');
    }
  };

  const handleCreate = () => {
    const keyPreset = ARABIC_KEY_PRESETS.find((p) => p.id === selectedMaqamPreset) || ARABIC_KEY_PRESETS[0];

    const config: NewDocumentConfig = {
      title,
      arabicTitle,
      composer,
      instrumentName: 'Violin (كمان)',
      timeSignature: { beats, beatType },
      tempo: bpm,
      keyConfig: keyPreset.config,
      measuresCount,
      starterNotesType: starterType,
    };

    const newXml = generateNewMusicXml(config);
    setXmlContent(newXml);
    setTempo(bpm);
    onScoreCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Create New MusicXML Score
                <span className="arabic-text text-amber-300 font-normal text-sm" dir="rtl">
                  إنشاء نوتة جديدة
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Configure score title, meter, maqam key signature, and measures</p>
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

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Starter Templates */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Quick Starter Templates
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('blank')}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-neutral-200">Blank Canvas</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">4 measures · 4/4</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('rast_dulab')}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-amber-300">Maqam Rast (راست)</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">E𝄳 B𝄳 half-flats · 4/4</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bayati_samai')}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-amber-300">Sama'i Bayati (10/8)</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">E𝄳 half-flat · 10/8</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('longa_24')}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-neutral-200">Longa Fast (2/4)</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Nahawand · 124 BPM</div>
              </button>
            </div>
          </div>

          {/* Title & Arabic Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Score Title (Latin / English)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Violin Taqsim in Maqam Rast"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Arabic Title (العنوان بالعربية)
              </label>
              <input
                type="text"
                dir="rtl"
                value={arabicTitle}
                onChange={(e) => setArabicTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-serif"
                placeholder="مثال: تقسيم كمان في مقام راست"
              />
            </div>
          </div>

          {/* Composer */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Composer / Instrumentation
            </label>
            <input
              type="text"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              placeholder="e.g. Violin Solo / Traditional"
            />
          </div>

          {/* Maqam & Key Signature Picker */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Key Signature &amp; Maqam (المقام والمفتاح الموسيقي)
            </label>
            <select
              value={selectedMaqamPreset}
              onChange={(e) => setSelectedMaqamPreset(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            >
              {ARABIC_KEY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.arabicName}) · {preset.config.fifths} fifths
                  {preset.config.quarterTones && preset.config.quarterTones.length > 0
                    ? ` with ${preset.config.quarterTones.map((q) => `${q.step}𝄳`).join(', ')}`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Meter, Tempo, Measure Count Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Time Signature */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Meter / Time Signature
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={`${beats}/${beatType}`}
                  onChange={(e) => {
                    const [b, bt] = e.target.value.split('/').map(Number);
                    setBeats(b);
                    setBeatType(bt);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="4/4">4/4 (Adani / Masmoudi)</option>
                  <option value="10/8">10/8 (Sama'i Thaqil)</option>
                  <option value="2/4">2/4 (Longa / Malfuf)</option>
                  <option value="3/4">3/4 (Darij / Waltz)</option>
                  <option value="6/8">6/8 (Wahda Kabira)</option>
                  <option value="8/8">8/8 (Masmoudi Kabir)</option>
                </select>
              </div>
            </div>

            {/* Tempo BPM */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Initial Tempo (BPM)
              </label>
              <input
                type="number"
                min={40}
                max={240}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10) || 92)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Measures Count */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Number of Measures
              </label>
              <select
                value={measuresCount}
                onChange={(e) => setMeasuresCount(parseInt(e.target.value, 10))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value={4}>4 Measures</option>
                <option value={8}>8 Measures</option>
                <option value={12}>12 Measures</option>
                <option value={16}>16 Measures</option>
                <option value={24}>24 Measures</option>
              </select>
            </div>
          </div>

          {/* Starter note options */}
          <div className="bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800 text-xs">
            <span className="font-medium text-neutral-300 block mb-2">Initial Measure 1 Content:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="starter"
                  checked={starterType === 'empty'}
                  onChange={() => setStarterType('empty')}
                  className="accent-amber-500"
                />
                <span className="text-neutral-300">Clean Rest (Empty canvas)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="starter"
                  checked={starterType === 'scale'}
                  onChange={() => setStarterType('scale')}
                  className="accent-amber-500"
                />
                <span className="text-neutral-300">Starter Maqam Scale Notes</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Score</span>
          </button>
        </div>
      </div>
    </div>
  );
};
