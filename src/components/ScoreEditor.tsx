import React, { useRef, useState, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { 
  FolderOpen, 
  Sparkles, 
  AlertCircle, 
  UploadCloud, 
  Music, 
  Code, 
  Check, 
  FileText,
  RotateCcw,
  FilePlus,
  Key
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { extractMusicXmlFromFile } from '../lib/mxlParser';
import { SAMPLE_SCORES } from '../lib/sampleScores';
import { getCurrentKeySignatureFromXml } from '../lib/scoreTemplates';

interface ScoreEditorProps {
  onForceRender: () => void;
}

export const ScoreEditor: React.FC<ScoreEditorProps> = ({ onForceRender }) => {
  const {
    xmlContent,
    setXmlContent,
    parseError,
    currentScoreId,
    loadSampleScore,
    setShowNewDocModal,
    setShowKeySignatureModal,
  } = useScoreStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Handle file opening (Drag & drop or file picker)
  const processFile = useCallback(async (file: File) => {
    setLoadingFile(true);
    setFileError(null);
    try {
      const extractedXml = await extractMusicXmlFromFile(file);
      setXmlContent(extractedXml);
      onForceRender();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file';
      setFileError(msg);
    } finally {
      setLoadingFile(false);
    }
  }, [setXmlContent, onForceRender]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Snippet inserters
  const insertSnippet = (snippet: string) => {
    // Append or replace
    const lines = xmlContent.split('\n');
    let measureEndIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('</measure>')) {
        measureEndIdx = i;
        break;
      }
    }
    if (measureEndIdx !== -1) {
      lines.splice(measureEndIdx, 0, snippet);
      const updated = lines.join('\n');
      setXmlContent(updated);
    } else {
      setXmlContent(xmlContent + '\n' + snippet);
    }
    setTimeout(onForceRender, 50);
  };

  const insertHalfFlatE = () => {
    insertSnippet(`      <!-- E half-flat (Sikah quarter-tone) -->
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>`);
  };

  const insertHalfFlatB = () => {
    insertSnippet(`      <!-- B half-flat (Awj quarter-tone) -->
      <note>
        <pitch>
          <step>B</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>`);
  };

  const insertHalfSharpF = () => {
    insertSnippet(`      <!-- F half-sharp (quarter-tone sharp) -->
      <note>
        <pitch>
          <step>F</step>
          <alter>0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>quarter-sharp</accidental>
      </note>`);
  };

  const insertViolinOpenStrings = () => {
    insertSnippet(`    <!-- Measure: Violin Open Strings (G3 D4 A4 E5) -->
    <measure number="new">
      <direction placement="above">
        <direction-type>
          <words font-style="italic">Violin Open Strings: G-D-A-E</words>
        </direction-type>
      </direction>
      <note>
        <pitch><step>G</step><octave>3</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>`);
  };

  const resetToSample = (scoreId: string) => {
    loadSampleScore(scoreId);
    setTimeout(onForceRender, 50);
  };

  const lineCount = xmlContent.split('\n').length;
  const charCount = xmlContent.length;

  const currentKey = useMemo(() => {
    try {
      return getCurrentKeySignatureFromXml(xmlContent);
    } catch {
      return null;
    }
  }, [xmlContent]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col h-full w-full bg-neutral-950 font-mono select-text ${
        isDragging ? 'ring-2 ring-amber-500 bg-amber-950/20' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,.musicxml,.mxl"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Quick Action & Preset Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* New Document Button */}
          <button
            type="button"
            onClick={() => setShowNewDocModal(true)}
            title="Create New Score (Ctrl/Cmd+N)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors font-sans font-medium"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>New (⌘N)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Open MusicXML or .mxl (Ctrl/Cmd+O)"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors font-sans"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Open</span>
          </button>

          {/* Change Key Signature Button */}
          <button
            type="button"
            onClick={() => setShowKeySignatureModal(true)}
            title="Set or Change Key Signature / Maqam"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors font-sans"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Key Sig</span>
          </button>

          <label htmlFor="sample-preset-select" className="text-neutral-400 font-sans text-xs ml-1">
            Preset:
          </label>
          <select
            id="sample-preset-select"
            value={currentScoreId}
            onChange={(e) => resetToSample(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-sans"
          >
            {SAMPLE_SCORES.map((score) => (
              <option key={score.id} value={score.id}>
                {score.title} ({score.meter})
              </option>
            ))}
          </select>
        </div>

        {/* Snippet Insertion buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-neutral-500 text-[11px] font-sans">Insert:</span>

          <button
            type="button"
            onClick={insertHalfFlatE}
            title="Insert E𝄳 quarter-flat (Sikah note, alter -0.5)"
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-amber-900/40 text-amber-300 border border-neutral-700 text-xs transition-colors"
          >
            + E𝄳 <span className="text-[10px] text-neutral-400">(سيكاه)</span>
          </button>

          <button
            type="button"
            onClick={insertHalfFlatB}
            title="Insert B𝄳 quarter-flat (Awj note, alter -0.5)"
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-amber-900/40 text-amber-300 border border-neutral-700 text-xs transition-colors"
          >
            + B𝄳 <span className="text-[10px] text-neutral-400">(أوج)</span>
          </button>

          <button
            type="button"
            onClick={insertHalfSharpF}
            title="Insert F𝄲 quarter-sharp (alter +0.5)"
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-amber-900/40 text-amber-300 border border-neutral-700 text-xs transition-colors"
          >
            + F𝄲
          </button>

          <button
            type="button"
            onClick={insertViolinOpenStrings}
            title="Insert 4 Open Strings (G3 D4 A4 E5)"
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs transition-colors font-sans"
          >
            + Open Strings
          </button>
        </div>
      </div>

      {/* Parse Error / File Error Alert */}
      {(parseError || fileError) && (
        <div className="flex items-start gap-2.5 px-3 py-2 bg-rose-950/70 border-b border-rose-800/80 text-rose-200 text-xs shrink-0 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-rose-300">Parse Warning:</span>{' '}
            <span className="break-all">{parseError || fileError}</span>
            <p className="text-[11px] text-rose-300/80 mt-0.5">
              The preview maintains the last valid score until errors are resolved.
            </p>
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur-sm border-2 border-dashed border-amber-500 rounded-lg pointer-events-none p-6 text-center">
          <UploadCloud className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
          <h3 className="text-base font-semibold text-neutral-100">Drop MusicXML or .mxl Archive</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">
            Drag files directly to parse scores, quarter-tone accidentals, and violin parts instantly.
          </p>
        </div>
      )}

      {/* CodeMirror XML Editor Canvas */}
      <div className="relative flex-1 min-h-0 overflow-auto">
        <CodeMirror
          value={xmlContent}
          height="100%"
          theme="dark"
          extensions={[xml()]}
          onChange={(val) => setXmlContent(val)}
          className="h-full text-xs font-mono"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
          }}
        />
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-t border-neutral-800/80 text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>
            Lines: <strong className="text-neutral-300 font-mono">{lineCount}</strong>
          </span>
          <span>·</span>
          <span>
            Chars: <strong className="text-neutral-300 font-mono">{charCount}</strong>
          </span>
          {currentKey && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowKeySignatureModal(true)}
                title="Click to Change Key Signature"
                className="text-amber-300/90 hover:text-amber-200 transition-colors flex items-center gap-1 font-sans"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>
                  Key: {currentKey.fifths > 0 ? `+${currentKey.fifths}` : currentKey.fifths}
                  {currentKey.quarterTones && currentKey.quarterTones.length > 0
                    ? ` (${currentKey.quarterTones.map((q) => `${q.step}𝄳`).join(' ')})`
                    : ''}
                </span>
              </button>
            </>
          )}
          <span>·</span>
          <span className="text-amber-400/90">MusicXML 3.1 / 4.0</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onForceRender}
            title="Force re-render score (Cmd+Enter)"
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            Re-render (⌘↵)
          </button>
        </div>
      </div>
    </div>
  );
};
