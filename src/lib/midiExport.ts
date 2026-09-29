import { Midi } from '@tonejs/midi';
import { ParsedNoteEvent } from '../types';

/**
 * Generate a standard MIDI file blob from note events, including pitch bends for quarter tones.
 */
export function generateMidiFile(
  events: ParsedNoteEvent[],
  tempo: number,
  trackName = 'Arabic Violin'
): Blob {
  const midi = new Midi();
  midi.header.setTempo(tempo);

  const track = midi.addTrack();
  track.name = trackName;
  track.instrument.number = 40; // Violin program number in General MIDI (0-indexed: 40 = violin)

  events.forEach((event) => {
    if (event.isRest) return;

    // Integer midi base
    const baseMidi = Math.round(event.midiNumber);
    // alter difference: e.g. -0.5 is -50 cents. In standard MIDI pitch bend range (+-2 semitones = 8192 units per 200 cents),
    // 50 cents = 50 / 200 * 8192 = 2048 units.
    const pitchBendOffsetCents = (event.alter % 1) * 100;

    if (Math.abs(pitchBendOffsetCents) > 1) {
      // Standard pitch bend center is 0 in Tone.js/midi (from -1 to 1)
      const bendFraction = pitchBendOffsetCents / 200; // 50 cents = 0.25
      track.addPitchBend({
        time: event.timeInSeconds,
        value: bendFraction,
      });
    }

    track.addNote({
      midi: baseMidi,
      time: event.timeInSeconds,
      duration: event.durationSeconds,
      velocity: 0.8,
    });
  });

  const arrayBuffer = midi.toArray();
  const bufferSlice = arrayBuffer.buffer.slice(
    arrayBuffer.byteOffset,
    arrayBuffer.byteOffset + arrayBuffer.byteLength
  ) as ArrayBuffer;
  return new Blob([bufferSlice], { type: 'audio/midi' });
}
