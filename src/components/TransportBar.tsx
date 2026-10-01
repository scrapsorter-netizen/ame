import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Timer, 
  Sliders, 
  Radio, 
  Gauge, 
  FastForward,
  Music2,
  Activity,
  Keyboard
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { InstrumentType } from '../types';
import { ScoreAudioEngine } from '../lib/audioEngine';

interface WebMidiMessageEvent {
  data: Uint8Array;
}

interface WebMidiInput {
  id: string;
  name?: string;
  onmidimessage: ((event: WebMidiMessageEvent) => void) | null;
}

interface WebMidiAccess {
  inputs: Map<string, WebMidiInput>;
  onstatechange: (() => void) | null;
}

interface TransportBarProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeekPercent: (percent: number) => void;
  audioEngine?: ScoreAudioEngine;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  onPlay,
  onPause,
  onStop,
  onSeekPercent,
  audioEngine,
}) => {
  const {
    isPlaying,
    isLooping,
    setLooping,
    metronome,
    setMetronome,
    tempo,
    setTempo,
    volume,
    setVolume,
    instrument,
    setInstrument,
    totalDurationSeconds,
    playbackProgressSeconds,
    playbackPercent,
    parsedEvents,
    currentEventIndex,
  } = useScoreStore();

  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(volume);

  // Web MIDI Devices state
  const [midiDevices, setMidiDevices] = useState<{ id: string; name: string }[]>([]);
  const [selectedMidiId, setSelectedMidiId] = useState<string>('none');
  const [isMidiSupported, setIsMidiSupported] = useState<boolean>(true);
  const [midiActiveNote, setMidiActiveNote] = useState<number | null>(null);
  const midiAccessRef = useRef<WebMidiAccess | null>(null);
  const activeInputsRef = useRef<WebMidiInput[]>([]);

  // Initialize Web MIDI Access
  const setupMidi = useCallback(async () => {
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as { requestMIDIAccess?: () => Promise<WebMidiAccess> }) : null;
    if (!nav || !nav.requestMIDIAccess) {
      setIsMidiSupported(false);
      return;
    }

    try {
      const access = await nav.requestMIDIAccess();
      midiAccessRef.current = access;

      const updateInputs = () => {
        const inputs: { id: string; name: string }[] = [];
        access.inputs.forEach((input) => {
          inputs.push({
            id: input.id,
            name: input.name || `MIDI Port ${input.id}`,
          });
        });
        setMidiDevices(inputs);
        if (inputs.length > 0 && selectedMidiId === 'none') {
          // If a keyboard was plugged in, provide convenient default
          setSelectedMidiId('all');
        }
      };

      updateInputs();
      access.onstatechange = () => {
        updateInputs();
      };
    } catch {
      setIsMidiSupported(false);
    }
  }, [selectedMidiId]);

  useEffect(() => {
    setupMidi();
  }, [setupMidi]);

  // Handle switching MIDI input port & routing note events to ScoreAudioEngine
  useEffect(() => {
    if (!midiAccessRef.current) return;

    // Disconnect previous listeners
    activeInputsRef.current.forEach((input) => {
      input.onmidimessage = null;
    });
    activeInputsRef.current = [];

    if (selectedMidiId === 'none') {
      return;
    }

    const handleMidiMessage = (event: WebMidiMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 2) return;

      const command = data[0] & 0xf0;
      const note = data[1];
      const velocity = data.length > 2 ? data[2] : 0;

      if (command === 0x90 && velocity > 0) {
        // Note On
        audioEngine?.triggerMidiNoteOn(note, velocity);
        setMidiActiveNote(note);
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        // Note Off
        audioEngine?.triggerMidiNoteOff(note);
        setMidiActiveNote((prev) => (prev === note ? null : prev));
      }
    };

    if (selectedMidiId === 'all') {
      midiAccessRef.current.inputs.forEach((input) => {
        input.onmidimessage = handleMidiMessage;
        activeInputsRef.current.push(input);
      });
    } else {
      const targetInput = midiAccessRef.current.inputs.get(selectedMidiId);
      if (targetInput) {
        targetInput.onmidimessage = handleMidiMessage;
        activeInputsRef.current.push(targetInput);
      }
    }

    return () => {
      activeInputsRef.current.forEach((input) => {
        input.onmidimessage = null;
      });
      activeInputsRef.current = [];
    };
  }, [selectedMidiId, audioEngine]);

  // Measure markers computation for scrubber
  const measureMarkers = useMemo(() => {
    if (!parsedEvents || parsedEvents.length === 0 || totalDurationSeconds <= 0) return [];
    const measureMap = new Map<number, number>();
    parsedEvents.forEach((ev) => {
      if (!measureMap.has(ev.measure)) {
        measureMap.set(ev.measure, ev.timeInSeconds);
      }
    });

    return Array.from(measureMap.entries()).map(([measureNum, timeSec]) => ({
      measure: measureNum,
      percent: Math.min(100, Math.max(0, (timeSec / totalDurationSeconds) * 100)),
    }));
  }, [parsedEvents, totalDurationSeconds]);

  const currentEvent = parsedEvents[currentEventIndex];

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was more than 2 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      taps.length = 0;
    }

    taps.push(now);
    if (taps.length > 4) taps.shift();

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      if (bpm >= 40 && bpm <= 240) {
        setTempo(bpm);
      }
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current || 0.85);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeekPercent(pct);
  };

  return (
    <div className="w-full bg-neutral-950/95 border-b border-neutral-800/80 px-4 py-2.5 flex flex-col gap-2">
      {/* Top row: Transport buttons, Sound Timbre, MIDI Keyboard, Tempo, Volume */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Primary Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              title="Pause (Space)"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold shadow-md shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              title="Play (Space)"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold shadow-md shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onStop}
            title="Stop & Reset to Start"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => setLooping(!isLooping)}
            title={isLooping ? 'Disable Loop' : 'Enable Loop'}
            className={`p-2 rounded-lg transition-colors ${
              isLooping
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMetronome(!metronome)}
            title={metronome ? 'Metronome On' : 'Metronome Off'}
            className={`p-2 rounded-lg transition-colors ${
              metronome
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Time Counter & Measure Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1.5 tabular-nums">
            <span className="text-amber-400">{formatTime(playbackProgressSeconds)}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400">{formatTime(totalDurationSeconds)}</span>
            {currentEvent && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-amber-300 font-sans text-[11px]">
                  M{currentEvent.measure}:B{currentEvent.beat}
                </span>
              </>
            )}
          </div>

          {/* Active Audio Waveform Equalizer animation */}
          {isPlaying && (
            <div className="hidden md:flex items-center gap-0.5 px-2 py-1 rounded bg-amber-950/40 border border-amber-500/30">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" />
              <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" />
            </div>
          )}
        </div>

        {/* Center: Sound Timbre Selector & MIDI Keyboard Input */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Timbre */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
            {(
              [
                { id: 'violin_bowed', label: 'Violin Bowed (كمان)', short: 'Violin' },
                { id: 'violin_pizz', label: 'Violin Pizz (نقر)', short: 'Pizz' },
                { id: 'oud', label: 'Arabic Oud (عود)', short: 'Oud' },
                { id: 'nay_flute', label: 'Nay Flute (ناي)', short: 'Nay' },
                { id: 'acoustic_grand', label: 'Piano (بيانو)', short: 'Piano' },
              ] as { id: InstrumentType; label: string; short: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInstrument(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  instrument === item.id
                    ? 'bg-amber-500 text-neutral-950 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
                title={item.label}
              >
                {item.short}
              </button>
            ))}
          </div>

          {/* MIDI Device Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs">
            <Keyboard
              className={`w-3.5 h-3.5 shrink-0 ${
                midiActiveNote !== null
                  ? 'text-emerald-400 animate-pulse'
                  : selectedMidiId !== 'none'
                  ? 'text-amber-400'
                  : 'text-neutral-500'
              }`}
            />
            <span className="hidden xl:inline text-neutral-400 font-sans">MIDI In:</span>
            {isMidiSupported ? (
              <select
                value={selectedMidiId}
                onChange={(e) => setSelectedMidiId(e.target.value)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer max-w-[130px] truncate"
                title="Select connected external MIDI keyboard for live playback"
              >
                <option value="none" className="bg-neutral-900 text-neutral-400">
                  Off
                </option>
                {midiDevices.length > 0 && (
                  <option value="all" className="bg-neutral-900 text-amber-300">
                    All Inputs ({midiDevices.length})
                  </option>
                )}
                {midiDevices.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-neutral-900 text-neutral-200">
                    {dev.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] text-neutral-500 font-sans" title="Web MIDI is not supported in this browser">
                N/A
              </span>
            )}
            {midiActiveNote !== null && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </div>

        {/* Right: Tempo controls & Volume */}
        <div className="flex items-center gap-3">
          {/* Tempo BPM */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1">
            <Gauge className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400 text-xs font-sans">BPM:</span>
            <input
              type="number"
              min={30}
              max={260}
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value, 10) || 92)}
              className="w-12 bg-transparent text-xs font-mono text-amber-300 focus:outline-none text-center"
            />
            <button
              type="button"
              onClick={handleTapTempo}
              title="Tap Tempo"
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-sans uppercase"
            >
              Tap
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                setVolume(parseFloat(e.target.value));
              }}
              className="w-20 accent-amber-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Scrubbable Timeline Track with Measure Markers */}
      <div
        onClick={handleTimelineClick}
        title="Click to seek position in score"
        className="relative w-full h-2 bg-neutral-800 hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden group select-none"
      >
        {/* Measure boundary tick lines */}
        {measureMarkers.map((m) => (
          <div
            key={m.measure}
            className="absolute top-0 bottom-0 w-[1px] bg-neutral-700/60 pointer-events-none z-10"
            style={{ left: `${m.percent}%` }}
            title={`Measure ${m.measure}`}
          />
        ))}

        {/* Active playback fill bar */}
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-75 relative z-20"
          style={{ width: `${playbackPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
