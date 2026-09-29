import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  FileArchive, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Headphones, 
  Check, 
  Loader2 
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { createMxlArchive } from '../lib/mxlParser';
import { renderScoreToWavBlob } from '../lib/audioEngine';
import { generateMidiFile } from '../lib/midiExport';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { xmlContent, parsedEvents, tempo, instrument, currentScoreId } = useScoreStore();
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const baseFileName = currentScoreId || 'nawa-score';

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export standard .musicxml
  const handleExportMusicXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/vnd.recordare.musicxml+xml;charset=utf-8' });
    triggerDownload(blob, `${baseFileName}.musicxml`);
    setSuccessMsg('Exported MusicXML score successfully!');
  };

  // 2. Export compressed .mxl container
  const handleExportMxl = async () => {
    setExportingType('mxl');
    try {
      const blob = await createMxlArchive(xmlContent, baseFileName);
      triggerDownload(blob, `${baseFileName}.mxl`);
      setSuccessMsg('Exported compressed .mxl container successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to export .mxl');
    } finally {
      setExportingType(null);
    }
  };

  // 3. Export SVG from rendered OSMD container
  const handleExportSvg = () => {
    const container = document.getElementById('osmdCanvasContainer');
    const svgEl = container?.querySelector('svg');
    if (!svgEl) {
      alert('Score SVG has not finished rendering yet.');
      return;
    }
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, `${baseFileName}.svg`);
    setSuccessMsg('Exported vector SVG sheet successfully!');
  };

  // 4. Export PNG
  const handleExportPng = () => {
    const container = document.getElementById('osmdCanvasContainer');
    const svgEl = container?.querySelector('svg');
    if (!svgEl) {
      alert('Score SVG has not finished rendering yet.');
      return;
    }

    setExportingType('png');
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // high-res
      canvas.width = (img.width || 1200) * scale;
      canvas.height = (img.height || 1600) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            triggerDownload(blob, `${baseFileName}.png`);
            setSuccessMsg('Exported high-resolution PNG successfully!');
          }
          URL.revokeObjectURL(url);
          setExportingType(null);
        }, 'image/png');
      }
    };
    img.onerror = () => {
      alert('Failed to rasterize SVG to PNG.');
      URL.revokeObjectURL(url);
      setExportingType(null);
    };
    img.src = url;
  };

  // 5. Export PDF (uses clean browser print dialog with printable score CSS)
  const handleExportPdf = () => {
    window.print();
  };

  // 6. Export Audio WAV (Offline rendered)
  const handleExportWav = async () => {
    setExportingType('wav');
    try {
      const blob = await renderScoreToWavBlob(parsedEvents, tempo, instrument);
      triggerDownload(blob, `${baseFileName}.wav`);
      setSuccessMsg('Exported 16-bit PCM WAV audio successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to render WAV audio.');
    } finally {
      setExportingType(null);
    }
  };

  // 7. Export MIDI file
  const handleExportMidi = () => {
    try {
      const blob = generateMidiFile(parsedEvents, tempo, baseFileName);
      triggerDownload(blob, `${baseFileName}.mid`);
      setSuccessMsg('Exported standard MIDI file with quarter-tone pitch bends!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to export MIDI.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">Export &amp; Save Score</h2>
              <p className="text-xs text-neutral-400">Download score notation, audio stem, or project files</p>
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

        {/* Success toast notification */}
        {successMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="p-6 space-y-4">
          {/* Section: Project / Score Data */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Score &amp; Code Formats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportMusicXml}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group"
              >
                <FileCode className="w-5 h-5 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    MusicXML (.musicxml)
                  </div>
                  <div className="text-[11px] text-neutral-400">Standard uncompressed MusicXML 3.1 file</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportMxl}
                disabled={exportingType === 'mxl'}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group disabled:opacity-50"
              >
                {exportingType === 'mxl' ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin mt-0.5" />
                ) : (
                  <FileArchive className="w-5 h-5 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                )}
                <div>
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Compressed (.mxl)
                  </div>
                  <div className="text-[11px] text-neutral-400">ZIP-packaged MusicXML for Finale/Sibelius</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Visual Sheet Music */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Visual Sheet Music
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleExportSvg}
                className="flex flex-col p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Vector SVG
                  </span>
                  <FileText className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                </div>
                <span className="text-[11px] text-neutral-400">Lossless resolution</span>
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                disabled={exportingType === 'png'}
                className="flex flex-col p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Raster PNG
                  </span>
                  {exportingType === 'png' ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                  )}
                </div>
                <span className="text-[11px] text-neutral-400">High-res 2x image</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="flex flex-col p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Print / PDF
                  </span>
                  <FileText className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                </div>
                <span className="text-[11px] text-neutral-400">Standard A4/Letter</span>
              </button>
            </div>
          </div>

          {/* Section: Audio & MIDI */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Audio &amp; Synthesis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportWav}
                disabled={exportingType === 'wav'}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group disabled:opacity-50"
              >
                {exportingType === 'wav' ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin mt-0.5" />
                ) : (
                  <Headphones className="w-5 h-5 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                )}
                <div>
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Synthesized WAV Audio
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Offline rendered 24-EDO quarter-tone audio
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportMidi}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/40 text-left transition-all group"
              >
                <Music className="w-5 h-5 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                    Standard MIDI (.mid)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Violin track with pitch-bend quarter-tones
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-neutral-800 bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
