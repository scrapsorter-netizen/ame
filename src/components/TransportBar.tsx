import React, { useState, useRef } from 'react';
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
  Music2
} from 'lucide-react';
import { useScoreStore } from '../store/useScoreStore';
import { InstrumentType } from '../types';

interface TransportBarProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeekPercent: (percent: number) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  onPlay,
  onPause,
  onStop,
  onSeekPercent,
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
      {/* Top row: Transport buttons, Tempo, Instrument, Volume */}
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

          {/* Time Counter */}
          <div className="flex items-baseline gap-1 font-mono text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1.5 tabular-nums">
            <span className="text-amber-400">{formatTime(playbackProgressSeconds)}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">{formatTime(totalDurationSeconds)}</span>
          </div>
        </div>

        {/* Middle: Instrument sound & Violin tuning preset */}
        <div className="flex items-center gap-2">
          <label htmlFor="instrument-select" className="text-neutral-400 text-xs font-sans flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Voice:</span>
          </label>
          <select
            id="instrument-select"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value as InstrumentType)}
            className="bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
          >
            <option value="violin_bowed">Warm Bowed Violin (كمان مصقول)</option>
            <option value="violin_pizz">Pizzicato Violin (كمان نقر)</option>
            <option value="oud">Classical Oud (عود شرقي)</option>
            <option value="nay_flute">Nay Flute (ناي)</option>
            <option value="acoustic_grand">Acoustic Piano (بيانو)</option>
          </select>
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

      {/* Scrubbable Timeline Track */}
      <div
        onClick={handleTimelineClick}
        title="Click to seek position in score"
        className="relative w-full h-1.5 bg-neutral-800 hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden group"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-75 relative"
          style={{ width: `${playbackPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
