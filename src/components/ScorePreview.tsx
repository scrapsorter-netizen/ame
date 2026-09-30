import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Music, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Layers, 
  Info,
  Volume2,
  Key
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { parseMusicXmlNotes } from '../lib/audioEngine';
import { getCurrentKeySignatureFromXml } from '../lib/scoreTemplates';

interface ScorePreviewProps {
  onStepCursor?: (direction: 'next' | 'prev') => void;
  osmdRefExternal?: React.MutableRefObject<OpenSheetMusicDisplay | null>;
}

export const ScorePreview: React.FC<ScorePreviewProps> = ({ osmdRefExternal }) => {
  const {
    xmlContent,
    tempo,
    zoom,
    setZoom,
    setParsedEvents,
    setParseError,
    currentEventIndex,
    isPlaying,
    setShowKeySignatureModal,
  } = useScoreStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const osmdInstanceRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const lastValidXmlRef = useRef<string>(xmlContent);
  const debounceTimerRef = useRef<number | null>(null);

  // Apply RTL font and quarter tone styling to SVG elements post-render
  const enhanceSvgPostRender = useCallback(() => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    // Apply Amiri font and dir="auto" to text elements containing Arabic glyphs
    const textNodes = svgEl.querySelectorAll('text');
    textNodes.forEach((node) => {
      const content = node.textContent || '';
      // Check for Arabic unicode range: [\u0600-\u06FF\u0750-\u077F]
      if (/[\u0600-\u06FF\u0750-\u077F]/.test(content)) {
        node.setAttribute('direction', 'rtl');
        node.setAttribute('font-family', 'Amiri, serif');
        node.setAttribute('font-weight', 'bold');
      }
    });
  }, []);

  // Initialize or re-render OSMD
  const renderScore = useCallback(
    async (xmlToRender: string) => {
      if (!containerRef.current) return;

      setIsRendering(true);
      try {
        // First, validate XML and extract note events
        const parsed = parseMusicXmlNotes(xmlToRender, tempo);
        setParsedEvents(parsed.events, parsed.totalDurationSeconds);
        setParseError(null);

        // Clear existing canvas if needed or instantiate OSMD
        if (!osmdInstanceRef.current) {
          containerRef.current.innerHTML = '';
          const osmd = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            backend: 'svg',
            drawTitle: true,
            drawSubtitle: true,
            drawComposer: true,
            drawPartNames: true,
            drawMetronomeMarks: true,
            followCursor: true,
            cursorsOptions: [
              {
                type: 0,
                color: '#d97706',
                alpha: 0.65,
                follow: true,
              },
            ],
          });
          osmdInstanceRef.current = osmd;
          if (osmdRefExternal) {
            osmdRefExternal.current = osmd;
          }
        }

        const osmd = osmdInstanceRef.current;
        osmd.zoom = zoom;

        await osmd.load(xmlToRender);
        osmd.render();

        // Setup cursor
        if (osmd.cursor) {
          osmd.cursor.show();
          osmd.cursor.reset();
        }

        enhanceSvgPostRender();
        lastValidXmlRef.current = xmlToRender;
        setRenderCount((prev) => prev + 1);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'XML rendering error. Please check your MusicXML syntax.';
        console.warn('OSMD render warning:', errorMsg);
        setParseError(errorMsg);
        // Note: We keep the last valid score rendered on screen as specified in the plan!
      } finally {
        setIsRendering(false);
      }
    },
    [tempo, zoom, setParsedEvents, setParseError, enhanceSvgPostRender, osmdRefExternal]
  );

  // Debounced load on xmlContent change (~400 ms as requested in the plan)
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      renderScore(xmlContent);
    }, 400);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [xmlContent, renderScore]);

  // Adjust zoom without full reload if already loaded
  useEffect(() => {
    if (osmdInstanceRef.current) {
      osmdInstanceRef.current.zoom = zoom;
      osmdInstanceRef.current.render();
      enhanceSvgPostRender();
    }
  }, [zoom, enhanceSvgPostRender]);

  // Cursor sync with current note event
  useEffect(() => {
    const osmd = osmdInstanceRef.current;
    if (!osmd || !osmd.cursor) return;

    try {
      if (currentEventIndex === 0) {
        osmd.cursor.reset();
      } else {
        // Step cursor forward
        osmd.cursor.next();
      }
    } catch {
      // ignore boundary cursor error
    }
  }, [currentEventIndex]);

  const handleStepCursor = (direction: 'next' | 'prev') => {
    const osmd = osmdInstanceRef.current;
    if (!osmd || !osmd.cursor) return;
    try {
      if (direction === 'next') {
        osmd.cursor.next();
      } else {
        osmd.cursor.previous();
      }
    } catch {
      // ignore
    }
  };

  const handleResetCursor = () => {
    const osmd = osmdInstanceRef.current;
    if (!osmd || !osmd.cursor) return;
    osmd.cursor.reset();
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-neutral-900 overflow-hidden">
      {/* Score Controls Header */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-neutral-950/80 border-b border-neutral-800 text-xs gap-2 shrink-0">
        {/* Left: Measure navigation & Cursor controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400 text-xs font-sans">Cursor:</span>
          <button
            type="button"
            onClick={handleResetCursor}
            title="Reset Cursor to Start"
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStepCursor('prev')}
            title="Step Cursor Back (Left Arrow)"
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStepCursor('next')}
            title="Step Cursor Forward (Right Arrow)"
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Quarter-Tone accidental indicator & Key button */}
        <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-[11px] font-sans">
          <button
            type="button"
            onClick={() => setShowKeySignatureModal(true)}
            title="Change Key Signature"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 transition-colors"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>Key Signature</span>
          </button>
          <span>·</span>
          <span className="text-amber-400 font-serif text-sm">𝄳</span>
          <span>Sikah/Bayati (Half-flat, -50¢)</span>
          <span>·</span>
          <span className="text-amber-400 font-serif text-sm">𝄲</span>
          <span>Quarter-sharp (+50¢)</span>
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom(zoom - 0.1)}
            disabled={zoom <= 0.6}
            title="Zoom Out"
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-neutral-400 font-mono text-[11px] w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 0.1)}
            disabled={zoom >= 1.8}
            title="Zoom In"
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            title="Reset Zoom to 100%"
            className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors font-sans"
          >
            100%
          </button>
        </div>
      </div>

      {/* Main Score Canvas Scrollable Viewport */}
      <div className="relative flex-1 min-h-0 overflow-auto p-4 flex justify-center bg-neutral-900/60">
        {isRendering && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900/90 border border-neutral-700 text-[11px] text-amber-400 shadow-lg backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Rendering score...</span>
          </div>
        )}

        {/* OSMD SVG Container */}
        <div
          id="osmdCanvasContainer"
          ref={containerRef}
          className="w-full max-w-4xl min-h-[500px] p-6 text-neutral-900 select-none shadow-xl transition-all"
        />
      </div>
    </div>
  );
};
