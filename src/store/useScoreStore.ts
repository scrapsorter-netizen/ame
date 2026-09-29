import { create } from 'zustand';
import { SAMPLE_SCORES } from '../lib/sampleScores';
import { InstrumentType, ParsedNoteEvent } from '../types';

interface ScoreStoreState {
  xmlContent: string;
  currentScoreId: string;
  tempo: number;
  volume: number;
  isPlaying: boolean;
  isLooping: boolean;
  metronome: boolean;
  instrument: InstrumentType;
  parsedEvents: ParsedNoteEvent[];
  currentEventIndex: number;
  totalDurationSeconds: number;
  playbackProgressSeconds: number;
  playbackPercent: number;

  parseError: string | null;
  parseWarnings: string[];

  // Pane layout
  activePane: 'input' | 'preview';
  expandedPane: 'input' | 'preview' | null;
  zoom: number;

  // Modals & Panels
  showViolinGuide: boolean;
  showShortcuts: boolean;
  showExportModal: boolean;
  showMaqamSelector: boolean;
  showNewDocModal: boolean;
  showKeySignatureModal: boolean;
  activeMaqamId: string;

  // Actions
  setXmlContent: (xml: string) => void;
  loadSampleScore: (scoreId: string) => void;
  setTempo: (tempo: number) => void;
  setVolume: (volume: number) => void;
  setInstrument: (instrument: InstrumentType) => void;
  setMetronome: (enabled: boolean) => void;
  setLooping: (enabled: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentEventIndex: (idx: number) => void;
  setParsedEvents: (events: ParsedNoteEvent[], duration: number) => void;
  setParseError: (err: string | null) => void;
  setPlaybackProgress: (seconds: number, percent: number) => void;

  setActivePane: (pane: 'input' | 'preview') => void;
  setExpandedPane: (pane: 'input' | 'preview' | null) => void;
  toggleExpandedPane: (pane: 'input' | 'preview') => void;
  setZoom: (zoom: number) => void;

  setShowViolinGuide: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowMaqamSelector: (show: boolean) => void;
  setShowNewDocModal: (show: boolean) => void;
  setShowKeySignatureModal: (show: boolean) => void;
  setActiveMaqamId: (id: string) => void;
}

const LOCAL_STORAGE_KEY = 'nawa_arabic_musicxml_autosave';

// Read initial content from localStorage if present
const savedXml = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
const initialXml = savedXml || SAMPLE_SCORES[0].xml;

export const useScoreStore = create<ScoreStoreState>((set, get) => ({
  xmlContent: initialXml,
  currentScoreId: SAMPLE_SCORES[0].id,
  tempo: SAMPLE_SCORES[0].tempo,
  volume: 0.85,
  isPlaying: false,
  isLooping: false,
  metronome: false,
  instrument: 'violin_bowed',
  parsedEvents: [],
  currentEventIndex: 0,
  totalDurationSeconds: 0,
  playbackProgressSeconds: 0,
  playbackPercent: 0,

  parseError: null,
  parseWarnings: [],

  activePane: 'preview',
  expandedPane: null,
  zoom: 1.0,

  showViolinGuide: false,
  showShortcuts: false,
  showExportModal: false,
  showMaqamSelector: false,
  showNewDocModal: false,
  showKeySignatureModal: false,
  activeMaqamId: 'rast',

  setXmlContent: (xml) => {
    set({ xmlContent: xml });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, xml);
    } catch {
      // quota or private mode fallback
    }
  },

  loadSampleScore: (scoreId) => {
    const score = SAMPLE_SCORES.find((s) => s.id === scoreId) || SAMPLE_SCORES[0];
    set({
      xmlContent: score.xml,
      currentScoreId: score.id,
      tempo: score.tempo,
      currentEventIndex: 0,
      isPlaying: false,
    });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, score.xml);
    } catch {
      // ignore
    }
  },

  setTempo: (tempo) => set({ tempo: Math.max(30, Math.min(260, tempo)) }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setInstrument: (instrument) => set({ instrument }),
  setMetronome: (metronome) => set({ metronome }),
  setLooping: (isLooping) => set({ isLooping }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentEventIndex: (currentEventIndex) => set({ currentEventIndex }),
  setParsedEvents: (parsedEvents, totalDurationSeconds) => set({ parsedEvents, totalDurationSeconds }),
  setParseError: (parseError) => set({ parseError }),
  setPlaybackProgress: (playbackProgressSeconds, playbackPercent) =>
    set({ playbackProgressSeconds, playbackPercent }),

  setActivePane: (activePane) => set({ activePane }),
  setExpandedPane: (expandedPane) => set({ expandedPane }),
  toggleExpandedPane: (pane) => {
    const current = get().expandedPane;
    set({ expandedPane: current === pane ? null : pane });
  },
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2.0, zoom)) }),

  setShowViolinGuide: (showViolinGuide) => set({ showViolinGuide }),
  setShowShortcuts: (showShortcuts) => set({ showShortcuts }),
  setShowExportModal: (showExportModal) => set({ showExportModal }),
  setShowMaqamSelector: (showMaqamSelector) => set({ showMaqamSelector }),
  setShowNewDocModal: (showNewDocModal) => set({ showNewDocModal }),
  setShowKeySignatureModal: (showKeySignatureModal) => set({ showKeySignatureModal }),
  setActiveMaqamId: (activeMaqamId) => set({ activeMaqamId }),
}));
