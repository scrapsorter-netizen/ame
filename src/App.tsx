/**
 * Nawa - Arabic MusicXML Score Editor & Synthesizer
 * Violin Studio with Quarter-Tone Microtonal Playback and OSMD Rendering
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  FileCode, 
  Music, 
  BookOpen, 
  Keyboard, 
  Download, 
  Sparkles, 
  RotateCw, 
  SlidersHorizontal,
  Compass,
  FileMusic,
  Share2,
  FilePlus,
  Key,
  Code2
} from 'lucide-react';
import { useScoreStore } from './store/useScoreStore';
import { ScoreAudioEngine, parseMusicXmlNotes } from './lib/audioEngine';
import { PaneCard } from './components/PaneCard';
import { ScoreEditor } from './components/ScoreEditor';
import { ScorePreview } from './components/ScorePreview';
import { TransportBar } from './components/TransportBar';
import { ViolinGuideModal } from './components/ViolinGuideModal';
import { ExportModal } from './components/ExportModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { MaqamSelectorModal } from './components/MaqamSelectorModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { KeySignatureModal } from './components/KeySignatureModal';
import { MusicXmlReferenceModal } from './components/MusicXmlReferenceModal';
import { ARABIC_MAQAMAT, generateMusicXmlNote } from './lib/arabicMusic';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export default function App() {
  const {
    xmlContent,
    setXmlContent,
    tempo,
    setTempo,
    volume,
    instrument,
    metronome,
    isLooping,
    isPlaying,
    setIsPlaying,
    parsedEvents,
    currentEventIndex,
    setCurrentEventIndex,
    setParsedEvents,
    setPlaybackProgress,
    activePane,
    setActivePane,
    expandedPane,
    setExpandedPane,
    toggleExpandedPane,
    showViolinGuide,
    setShowViolinGuide,
    showShortcuts,
    setShowShortcuts,
    showExportModal,
    setShowExportModal,
    showMaqamSelector,
    setShowMaqamSelector,
    showNewDocModal,
    setShowNewDocModal,
    showKeySignatureModal,
    setShowKeySignatureModal,
    showXmlReference,
    setShowXmlReference,
    activeMaqamId,
  } = useScoreStore();

  const audioEngineRef = useRef<ScoreAudioEngine | null>(null);
  const osmdRefExternal = useRef<OpenSheetMusicDisplay | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Initialize Audio Engine once
  if (!audioEngineRef.current) {
    audioEngineRef.current = new ScoreAudioEngine();
  }
  const audioEngine = audioEngineRef.current;

  // Force re-render callback
  const handleForceRender = useCallback(() => {
    try {
      const parsed = parseMusicXmlNotes(xmlContent, tempo);
      setParsedEvents(parsed.events, parsed.totalDurationSeconds);
    } catch {
      // preview will show error
    }
    setRenderTrigger((prev) => prev + 1);
  }, [xmlContent, tempo, setParsedEvents, setRenderTrigger]);

  // Sync Audio Engine settings
  useEffect(() => {
    audioEngine.setTempo(tempo);
  }, [audioEngine, tempo]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [audioEngine, volume]);

  useEffect(() => {
    audioEngine.setInstrument(instrument);
  }, [audioEngine, instrument]);

  useEffect(() => {
    audioEngine.setMetronome(metronome);
  }, [audioEngine, metronome]);

  useEffect(() => {
    audioEngine.setLooping(isLooping);
  }, [audioEngine, isLooping]);

  // Audio Engine callbacks
  useEffect(() => {
    audioEngine.onNoteTrigger((note, index) => {
      setCurrentEventIndex(index);
    });

    audioEngine.onProgress((sec, pct) => {
      setPlaybackProgress(sec, pct);
    });

    audioEngine.onPlaybackEnd(() => {
      setIsPlaying(false);
      setCurrentEventIndex(0);
    });
  }, [audioEngine, setCurrentEventIndex, setPlaybackProgress, setIsPlaying]);

  // Playback handlers
  const handlePlay = useCallback(async () => {
    if (parsedEvents.length === 0) {
      handleForceRender();
    }
    audioEngine.setScore(parsedEvents, tempo);
    setIsPlaying(true);
    await audioEngine.play(currentEventIndex);
  }, [audioEngine, parsedEvents, tempo, currentEventIndex, setIsPlaying, handleForceRender]);

  const handlePause = useCallback(() => {
    audioEngine.pause();
    setIsPlaying(false);
  }, [audioEngine, setIsPlaying]);

  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentEventIndex(0);
    setPlaybackProgress(0, 0);
  }, [audioEngine, setIsPlaying, setCurrentEventIndex, setPlaybackProgress]);

  const handleSeekPercent = useCallback((percent: number) => {
    if (parsedEvents.length === 0) return;
    const targetIdx = Math.min(
      parsedEvents.length - 1,
      Math.max(0, Math.floor(parsedEvents.length * (percent / 100)))
    );
    audioEngine.seekToIndex(targetIdx);
    setCurrentEventIndex(targetIdx);
  }, [audioEngine, parsedEvents, setCurrentEventIndex]);

  // Insert complete Maqam scale into XML
  const handleInsertMaqamScale = useCallback((maqamId: string) => {
    const maqam = ARABIC_MAQAMAT.find((m) => m.id === maqamId);
    if (!maqam) return;

    let measureXml = `    <!-- Inserted Maqam Scale: ${maqam.name} (${maqam.arabicName}) -->
    <measure number="scale">
      <direction placement="above">
        <direction-type>
          <words font-weight="bold">${maqam.name} - ${maqam.arabicName}</words>
        </direction-type>
      </direction>\n`;

    maqam.scaleNotes.forEach((n) => {
      measureXml += generateMusicXmlNote(n.step, n.octave, n.alter, 1, 'quarter') + '\n';
    });
    measureXml += `    </measure>`;

    const lines = xmlContent.split('\n');
    let measureEndIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('</measure>')) {
        measureEndIdx = i;
        break;
      }
    }
    if (measureEndIdx !== -1) {
      lines.splice(measureEndIdx + 1, 0, measureXml);
      setXmlContent(lines.join('\n'));
    } else {
      setXmlContent(xmlContent + '\n' + measureXml);
    }
    setTimeout(handleForceRender, 60);
  }, [xmlContent, setXmlContent, handleForceRender]);

  // Insert XML snippet from reference guide
  const handleInsertXmlSnippet = useCallback((snippet: string) => {
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
      setXmlContent(lines.join('\n'));
    } else {
      setXmlContent(xmlContent + '\n' + snippet);
    }
    setTimeout(handleForceRender, 60);
  }, [xmlContent, setXmlContent, handleForceRender]);

  // Global Keyboard Shortcuts Registry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside text input/textarea unless it's a modifier command
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Escape closes modals or exits expanded pane
      if (e.key === 'Escape') {
        if (showNewDocModal) { setShowNewDocModal(false); return; }
        if (showKeySignatureModal) { setShowKeySignatureModal(false); return; }
        if (showXmlReference) { setShowXmlReference(false); return; }
        if (showViolinGuide) { setShowViolinGuide(false); return; }
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (showExportModal) { setShowExportModal(false); return; }
        if (showMaqamSelector) { setShowMaqamSelector(false); return; }
        if (expandedPane) { setExpandedPane(null); return; }
      }

      // Cmd/Ctrl + N: Open New Document Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNewDocModal(true);
        return;
      }

      // Cmd/Ctrl + K: Open Key Signature Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowKeySignatureModal(true);
        return;
      }

      // Cmd/Ctrl + S: Open Export Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowExportModal(true);
        return;
      }

      // Cmd/Ctrl + Enter: Force Re-render
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleForceRender();
        return;
      }

      // Global non-input shortcuts:
      if (!isInput) {
        // Space: Play / Pause
        if (e.code === 'Space') {
          e.preventDefault();
          if (isPlaying) handlePause();
          else handlePlay();
          return;
        }

        // '1': Focus Input pane
        if (e.key === '1') {
          e.preventDefault();
          setActivePane('input');
          return;
        }

        // '2': Focus Preview pane
        if (e.key === '2') {
          e.preventDefault();
          setActivePane('preview');
          return;
        }

        // 'F': Toggle fullscreen expansion of active pane
        if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          toggleExpandedPane(activePane);
          return;
        }

        // '[': Decrease tempo
        if (e.key === '[') {
          e.preventDefault();
          setTempo(tempo - 4);
          return;
        }

        // ']': Increase tempo
        if (e.key === ']') {
          e.preventDefault();
          setTempo(tempo + 4);
          return;
        }

        // '?': Open shortcuts modal
        if (e.key === '?') {
          e.preventDefault();
          setShowShortcuts(true);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    handlePlay,
    handlePause,
    handleForceRender,
    tempo,
    setTempo,
    activePane,
    setActivePane,
    expandedPane,
    setExpandedPane,
    toggleExpandedPane,
    showViolinGuide,
    setShowViolinGuide,
    showShortcuts,
    setShowShortcuts,
    showExportModal,
    setShowExportModal,
    showMaqamSelector,
    setShowMaqamSelector,
    showNewDocModal,
    setShowNewDocModal,
    showKeySignatureModal,
    setShowKeySignatureModal,
    showXmlReference,
    setShowXmlReference,
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. TOP BAR (Strict 3-zone contract) */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/90 bg-neutral-950 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-neutral-100 group">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
            <span>Nawa Score Studio</span>
            <span className="arabic-text text-amber-400 font-medium text-sm mr-1" dir="rtl">
              نوى
            </span>
          </a>
          <span className="hidden md:inline text-xs text-neutral-500">
            · Violin &amp; Maqam MusicXML
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links / studio tools */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => setShowNewDocModal(true)}
            title="Create New Score (Ctrl/Cmd+N)"
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Score</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKeySignatureModal(true)}
            title="Set or Change Key Signature (Ctrl/Cmd+K)"
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Key Sig</span>
          </button>

          <button
            type="button"
            onClick={() => setShowXmlReference(true)}
            title="MusicXML Tags & Attributes Reference Guide"
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-400" />
            <span>XML Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMaqamSelector(true)}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-400" />
            <span>Maqamat Scales</span>
          </button>

          <button
            type="button"
            onClick={() => setShowViolinGuide(true)}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-400" />
            <span>Violin Fingerboard</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
            <span>Shortcuts (?)</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowViolinGuide(true)}
            className="md:hidden p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
            title="Violin Guide"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            title="Export MusicXML, Audio WAV, MIDI, or Sheet SVG/PDF (⌘S)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-95 transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Score</span>
          </button>
        </div>
      </header>

      {/* 2. TRANSPORT BAR */}
      <TransportBar
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onSeekPercent={handleSeekPercent}
        audioEngine={audioEngine}
      />

      {/* 3. MAIN WORKSPACE: TWO EXPANDABLE CARDS SIDE-BY-SIDE */}
      <main className="flex-1 min-h-0 p-3 sm:p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Card 1: MusicXML Input & Code Editor */}
          <PaneCard
            id="input"
            title="MusicXML Editor"
            arabicTitle="محرر النوتة"
            subtitle="Drag & Drop .mxl, .musicxml"
            icon={<FileCode className="w-4 h-4" />}
            isActive={activePane === 'input'}
            isExpanded={expandedPane === 'input'}
            isHidden={expandedPane === 'preview'}
            onFocus={() => setActivePane('input')}
            onToggleExpand={() => toggleExpandedPane('input')}
            headerActions={
              <button
                type="button"
                onClick={() => setShowMaqamSelector(true)}
                title="Browse Arabic Maqam Scales"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs transition-colors"
              >
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Maqamat</span>
              </button>
            }
          >
            <ScoreEditor onForceRender={handleForceRender} />
          </PaneCard>

          {/* Card 2: OSMD Score Preview & Transport Sync */}
          <PaneCard
            id="preview"
            title="Score Sheet &amp; Cursor"
            arabicTitle="المدرج الموسيقي"
            subtitle="OSMD Vector Engine with 24-EDO Quarter-Tones"
            icon={<Music className="w-4 h-4" />}
            isActive={activePane === 'preview'}
            isExpanded={expandedPane === 'preview'}
            isHidden={expandedPane === 'input'}
            onFocus={() => setActivePane('preview')}
            onToggleExpand={() => toggleExpandedPane('preview')}
            headerActions={
              <button
                type="button"
                onClick={() => setShowViolinGuide(true)}
                title="View Violin Fingerboard Guide"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Violin Tuning</span>
              </button>
            }
          >
            <ScorePreview
              key={renderTrigger}
              osmdRefExternal={osmdRefExternal}
            />
          </PaneCard>
        </div>
      </main>

      {/* MODALS */}
      {showViolinGuide && (
        <ViolinGuideModal
          onClose={() => setShowViolinGuide(false)}
          audioEngine={audioEngine}
        />
      )}

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}

      {showShortcuts && (
        <ShortcutsHelpModal onClose={() => setShowShortcuts(false)} />
      )}

      {showMaqamSelector && (
        <MaqamSelectorModal
          onClose={() => setShowMaqamSelector(false)}
          audioEngine={audioEngine}
          onInsertMaqamScale={handleInsertMaqamScale}
        />
      )}

      {showNewDocModal && (
        <NewDocumentModal
          onClose={() => setShowNewDocModal(false)}
          onScoreCreated={handleForceRender}
        />
      )}

      {showKeySignatureModal && (
        <KeySignatureModal
          onClose={() => setShowKeySignatureModal(false)}
          onKeyApplied={handleForceRender}
        />
      )}

      {showXmlReference && (
        <MusicXmlReferenceModal
          onClose={() => setShowXmlReference(false)}
          onInsertSnippet={handleInsertXmlSnippet}
        />
      )}
    </div>
  );
}
