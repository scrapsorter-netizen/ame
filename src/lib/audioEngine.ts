import * as Tone from 'tone';
import { calculatePitchFrequency, getViolinPosition } from './arabicMusic';
import { InstrumentType, ParsedNoteEvent } from '../types';

/**
 * Parses MusicXML string into an ordered timeline of notes with precise timings,
 * quarter-tone frequencies, and violin fingering annotations.
 */
export function parseMusicXmlNotes(xmlText: string, userTempo?: number): {
  events: ParsedNoteEvent[];
  tempo: number;
  timeSignature: string;
  totalDurationSeconds: number;
  measuresCount: number;
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parse error
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error(parserError.textContent || 'Invalid MusicXML format. Please check your XML syntax.');
  }

  let tempo = userTempo || 92;
  // Look for tempo direction
  const soundEl = xmlDoc.querySelector('sound[tempo]');
  if (soundEl && soundEl.getAttribute('tempo')) {
    const parsedTempo = parseFloat(soundEl.getAttribute('tempo')!);
    if (!isNaN(parsedTempo) && parsedTempo > 20 && parsedTempo < 300) {
      if (!userTempo) tempo = parsedTempo;
    }
  }

  let divisions = 1;
  let beats = 4;
  let beatType = 4;

  const measures = xmlDoc.querySelectorAll('part > measure');
  const events: ParsedNoteEvent[] = [];
  let currentTimeInSeconds = 0;
  let eventIndex = 0;

  measures.forEach((measureEl, mIndex) => {
    const measureNumber = parseInt(measureEl.getAttribute('number') || `${mIndex + 1}`, 10);

    // Check attributes
    const divEl = measureEl.querySelector('attributes > divisions');
    if (divEl && divEl.textContent) {
      const d = parseInt(divEl.textContent, 10);
      if (d > 0) divisions = d;
    }

    const beatsEl = measureEl.querySelector('attributes > time > beats');
    const beatTypeEl = measureEl.querySelector('attributes > time > beat-type');
    if (beatsEl && beatsEl.textContent) beats = parseInt(beatsEl.textContent, 10);
    if (beatTypeEl && beatTypeEl.textContent) beatType = parseInt(beatTypeEl.textContent, 10);

    // Look for tempo changes inside measure
    const measureSound = measureEl.querySelector('direction sound[tempo]');
    if (measureSound && !userTempo) {
      const t = parseFloat(measureSound.getAttribute('tempo')!);
      if (!isNaN(t) && t > 20) tempo = t;
    }

    const secondsPerQuarter = 60 / tempo;
    const secondsPerDivision = secondsPerQuarter / divisions;

    // Process notes in this measure
    let measureTickOffset = 0;
    const noteElements = measureEl.querySelectorAll('note');

    noteElements.forEach((noteEl) => {
      // Check if chord (plays simultaneously with previous note)
      const isChord = noteEl.querySelector('chord') !== null;
      const isRest = noteEl.querySelector('rest') !== null;

      const durEl = noteEl.querySelector('duration');
      const noteDurationTicks = durEl && durEl.textContent ? parseInt(durEl.textContent, 10) : divisions;
      const durationSeconds = Math.max(0.05, noteDurationTicks * secondsPerDivision);

      const noteStartTime = isChord ? currentTimeInSeconds : currentTimeInSeconds;

      if (isRest) {
        // Just advance time unless chord
        if (!isChord) {
          currentTimeInSeconds += durationSeconds;
          measureTickOffset += noteDurationTicks;
        }
        return;
      }

      const stepEl = noteEl.querySelector('pitch > step');
      const octEl = noteEl.querySelector('pitch > octave');
      const alterEl = noteEl.querySelector('pitch > alter');
      const accidentalEl = noteEl.querySelector('accidental');

      if (!stepEl || !octEl) {
        if (!isChord) currentTimeInSeconds += durationSeconds;
        return;
      }

      const step = (stepEl.textContent?.trim().toUpperCase() || 'C') as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
      const octave = parseInt(octEl.textContent || '4', 10);
      const alter = alterEl && alterEl.textContent ? parseFloat(alterEl.textContent) : 0;
      const accidental = accidentalEl?.textContent?.trim();

      const frequency = calculatePitchFrequency(step, octave, alter, 440);
      const violinPos = getViolinPosition(step, octave, alter);

      events.push({
        id: `note-${eventIndex++}`,
        measure: measureNumber,
        beat: Math.floor(measureTickOffset / divisions) + 1,
        timeInSeconds: noteStartTime,
        durationSeconds: durationSeconds * 0.95, // slight articulation separation
        step,
        octave,
        alter,
        accidental,
        frequency,
        midiNumber: (octave + 1) * 12 + alter,
        isRest: false,
        violinString: violinPos.string,
        violinFinger: violinPos.finger,
      });

      if (!isChord) {
        currentTimeInSeconds += durationSeconds;
        measureTickOffset += noteDurationTicks;
      }
    });
  });

  return {
    events,
    tempo,
    timeSignature: `${beats}/${beatType}`,
    totalDurationSeconds: currentTimeInSeconds,
    measuresCount: measures.length,
  };
}

/**
 * Violin & Middle-Eastern Instrument Audio Engine using Tone.js
 */
export class ScoreAudioEngine {
  private synth: Tone.PolySynth | null = null;
  private metronomeSynth: Tone.MembraneSynth | null = null;
  private vibrato: Tone.Vibrato | null = null;
  private reverb: Tone.Reverb | null = null;
  private volumeNode: Tone.Volume | null = null;
  private currentInstrument: InstrumentType = 'violin_bowed';

  private noteEvents: ParsedNoteEvent[] = [];
  private isPlaying = false;
  private isLooping = false;
  private tempo = 92;
  private currentPlaybackIndex = 0;
  private playbackTimeoutId: number | null = null;
  private onNoteTriggerCallback?: (event: ParsedNoteEvent, index: number) => void;
  private onPlaybackEndCallback?: () => void;
  private onProgressCallback?: (progressSec: number, percent: number) => void;
  private playbackStartTime = 0;
  private pausedAtTime = 0;
  private animFrameId: number | null = null;
  private isMetronomeActive = false;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public async initialize(): Promise<void> {
    if (this.synth) return;

    await Tone.start();

    this.volumeNode = new Tone.Volume(0).toDestination();
    this.reverb = new Tone.Reverb({ decay: 1.8, wet: 0.25 }).connect(this.volumeNode);
    await this.reverb.generate();

    this.vibrato = new Tone.Vibrato({
      frequency: 5.5, // Natural violin vibrato rate
      depth: 0.12,
      wet: 0.35,
    }).connect(this.reverb);

    this.setInstrument('violin_bowed');

    // Metronome synth
    this.metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
    }).connect(this.volumeNode);
  }

  public setInstrument(type: InstrumentType): void {
    this.currentInstrument = type;
    if (!this.vibrato || !this.reverb || !this.volumeNode) return;

    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }

    switch (type) {
      case 'violin_bowed':
        // Warm violin with bowing attack, harmonic richness, vibrato
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: {
            attack: 0.04,
            decay: 0.15,
            sustain: 0.85,
            release: 0.35,
          },
        }).connect(this.vibrato);
        break;

      case 'violin_pizz':
        // Plucked violin pizzicato
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.05,
            release: 0.25,
          },
        }).connect(this.reverb);
        break;

      case 'oud':
        // Oud - dual-stringed fretless lute with sharp wooden attack & fast decay
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'pwm', modulationFrequency: 0.2 },
          envelope: {
            attack: 0.008,
            decay: 0.45,
            sustain: 0.1,
            release: 0.3,
          },
        }).connect(this.reverb);
        break;

      case 'nay_flute':
        // Nay reed flute - soft breathy attack, gentle sine/triangle blend
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.08,
            decay: 0.2,
            sustain: 0.7,
            release: 0.4,
          },
        }).connect(this.vibrato);
        break;

      case 'acoustic_grand':
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0.2,
            release: 0.4,
          },
        }).connect(this.volumeNode);
        break;
    }
  }

  public setVolume(val: number): void {
    // val 0 to 1
    if (this.volumeNode) {
      if (val <= 0.01) {
        this.volumeNode.mute = true;
      } else {
        this.volumeNode.mute = false;
        // Map 0..1 to -36dB..+6dB
        const db = Tone.gainToDb(val);
        this.volumeNode.volume.value = Math.max(-40, Math.min(6, db));
      }
    }
  }

  public setTempo(bpm: number): void {
    this.tempo = bpm;
  }

  public setMetronome(enabled: boolean): void {
    this.isMetronomeActive = enabled;
  }

  public setLooping(enabled: boolean): void {
    this.isLooping = enabled;
  }

  public setScore(events: ParsedNoteEvent[], tempo: number): void {
    this.noteEvents = events;
    this.tempo = tempo;
    this.stop();
  }

  public onNoteTrigger(callback: (event: ParsedNoteEvent, index: number) => void): void {
    this.onNoteTriggerCallback = callback;
  }

  public onPlaybackEnd(callback: () => void): void {
    this.onPlaybackEndCallback = callback;
  }

  public onProgress(callback: (progressSec: number, percent: number) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Play a single preview note (e.g. from Maqam inspector or editor click)
   */
  public async playSingleNote(step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B', octave: number, alter = 0, duration = 0.5): Promise<void> {
    await this.initialize();
    if (!this.synth) return;
    const freq = calculatePitchFrequency(step, octave, alter, 440);
    this.synth.triggerAttackRelease(freq, duration);
  }

  /**
   * Trigger note attack from an external MIDI keyboard (0-127)
   */
  public async triggerMidiNoteOn(midiNumber: number, velocity = 100): Promise<void> {
    await this.initialize();
    if (!this.synth) return;
    const freq = 440 * Math.pow(2, (midiNumber - 69) / 12);
    const velNorm = Math.max(0.1, Math.min(1.0, velocity / 127));
    this.synth.triggerAttack(freq, undefined, velNorm);
  }

  /**
   * Trigger note release from an external MIDI keyboard
   */
  public triggerMidiNoteOff(midiNumber: number): void {
    if (!this.synth) return;
    const freq = 440 * Math.pow(2, (midiNumber - 69) / 12);
    this.synth.triggerRelease(freq);
  }

  /**
   * Start playback from current position or offset
   */
  public async play(startFromIndex = 0): Promise<void> {
    await this.initialize();
    if (this.noteEvents.length === 0) return;

    this.isPlaying = true;
    this.currentPlaybackIndex = Math.max(0, Math.min(startFromIndex, this.noteEvents.length - 1));

    const firstEvent = this.noteEvents[this.currentPlaybackIndex];
    const baseOffsetSec = firstEvent ? firstEvent.timeInSeconds : 0;
    this.playbackStartTime = performance.now() - baseOffsetSec * 1000;

    this.scheduleNextNotes();
    this.startProgressTracking();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.playbackTimeoutId !== null) {
      window.clearTimeout(this.playbackTimeoutId);
      this.playbackTimeoutId = null;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.synth) {
      this.synth.releaseAll();
    }
  }

  public stop(): void {
    this.pause();
    this.currentPlaybackIndex = 0;
    this.pausedAtTime = 0;
  }

  public seekToIndex(index: number): void {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentPlaybackIndex = Math.max(0, Math.min(index, this.noteEvents.length - 1));
    if (wasPlaying) {
      this.play(this.currentPlaybackIndex);
    }
  }

  private scheduleNextNotes(): void {
    if (!this.isPlaying) return;

    if (this.currentPlaybackIndex >= this.noteEvents.length) {
      if (this.isLooping) {
        this.currentPlaybackIndex = 0;
        this.playbackStartTime = performance.now();
        this.scheduleNextNotes();
      } else {
        this.stop();
        if (this.onPlaybackEndCallback) this.onPlaybackEndCallback();
      }
      return;
    }

    const currentNote = this.noteEvents[this.currentPlaybackIndex];
    const now = performance.now();
    const noteAbsoluteTargetTime = this.playbackStartTime + currentNote.timeInSeconds * 1000;
    const delay = Math.max(0, noteAbsoluteTargetTime - now);

    this.playbackTimeoutId = window.setTimeout(() => {
      if (!this.isPlaying) return;

      // Play audio note
      if (this.synth && currentNote.frequency > 20) {
        this.synth.triggerAttackRelease(
          currentNote.frequency,
          currentNote.durationSeconds,
          undefined,
          0.85
        );
      }

      // Metronome beat accent
      if (this.isMetronomeActive && this.metronomeSynth) {
        const isDownbeat = currentNote.beat === 1;
        this.metronomeSynth.triggerAttackRelease(isDownbeat ? 'C3' : 'G2', '16n', undefined, isDownbeat ? 0.9 : 0.4);
      }

      // Notify UI & OSMD cursor
      if (this.onNoteTriggerCallback) {
        this.onNoteTriggerCallback(currentNote, this.currentPlaybackIndex);
      }

      this.currentPlaybackIndex++;
      this.scheduleNextNotes();
    }, delay);
  }

  private startProgressTracking(): void {
    const update = () => {
      if (!this.isPlaying) return;
      const totalSec = this.noteEvents[this.noteEvents.length - 1]?.timeInSeconds || 1;
      const elapsed = Math.max(0, (performance.now() - this.playbackStartTime) / 1000);
      const percent = Math.min(100, (elapsed / (totalSec + 1)) * 100);

      if (this.onProgressCallback) {
        this.onProgressCallback(elapsed, percent);
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentIndex(): number {
    return this.currentPlaybackIndex;
  }
}

/**
 * Render complete score audio offline to a downloadable WAV Blob using Tone.Offline
 */
export async function renderScoreToWavBlob(
  events: ParsedNoteEvent[],
  tempo: number,
  instrument: InstrumentType
): Promise<Blob> {
  if (events.length === 0) {
    throw new Error('Score contains no notes to render. Please add notes to your score first.');
  }

  const lastNote = events[events.length - 1];
  const totalDuration = (lastNote.timeInSeconds + lastNote.durationSeconds + 1.5);

  const audioBuffer = await Tone.Offline(async ({ transport }) => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: instrument === 'oud' ? 'pwm' : 'sawtooth' },
      envelope: {
        attack: instrument === 'violin_pizz' ? 0.005 : 0.04,
        decay: 0.2,
        sustain: 0.8,
        release: 0.4,
      },
    }).toDestination();

    events.forEach((note) => {
      if (note.frequency > 20) {
        synth.triggerAttackRelease(note.frequency, note.durationSeconds, note.timeInSeconds);
      }
    });

    transport.start();
  }, totalDuration);

  // Convert Tone AudioBuffer to standard WAV Blob
  return audioBufferToWavBlob(audioBuffer.get() as unknown as AudioBuffer);
}

/**
 * Convert standard Web Audio API AudioBuffer to WAV 16-bit PCM Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  out.setUint8(pos++, 0x52); out.setUint8(pos++, 0x49); out.setUint8(pos++, 0x46); out.setUint8(pos++, 0x46);
  setUint32(length - 8);
  // WAVE identifier
  out.setUint8(pos++, 0x57); out.setUint8(pos++, 0x41); out.setUint8(pos++, 0x56); out.setUint8(pos++, 0x45);
  // fmt chunk identifier
  out.setUint8(pos++, 0x66); out.setUint8(pos++, 0x6d); out.setUint8(pos++, 0x74); out.setUint8(pos++, 0x20);
  setUint32(16); // format chunk length
  setUint16(1);  // linear PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2);              // block align
  setUint16(16);                         // bits per sample
  // data chunk identifier
  out.setUint8(pos++, 0x64); out.setUint8(pos++, 0x61); out.setUint8(pos++, 0x74); out.setUint8(pos++, 0x61);
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
