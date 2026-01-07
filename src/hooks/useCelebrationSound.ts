import { useCallback, useMemo } from "react";

export const useCelebrationSound = () => {
  const canPlaySound = useCallback(() => {
    return typeof window !== "undefined" && "AudioContext" in window;
  }, []);

  const playCelebrationSound = useCallback(() => {
    if (!canPlaySound()) return;

    try {
      const audioContext = new AudioContext();
      const now = audioContext.currentTime;

      // Create a celebratory fanfare with ascending notes
      const playNote = (
        frequency: number,
        startTime: number,
        duration: number,
        volume: number = 0.15
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        // Smooth envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Triumphant ascending arpeggio (C major with octave jump)
      // C4 -> E4 -> G4 -> C5 -> E5 -> G5
      const notes = [
        { freq: 523.25, time: 0, duration: 0.15 },      // C5
        { freq: 659.25, time: 0.08, duration: 0.15 },   // E5
        { freq: 783.99, time: 0.16, duration: 0.2 },    // G5
        { freq: 1046.50, time: 0.28, duration: 0.4 },   // C6 (high, sustained)
      ];

      notes.forEach((note) => {
        playNote(note.freq, now + note.time, note.duration);
      });

      // Add a subtle shimmer effect
      const shimmerOsc = audioContext.createOscillator();
      const shimmerGain = audioContext.createGain();
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(audioContext.destination);
      shimmerOsc.type = "triangle";
      shimmerOsc.frequency.setValueAtTime(1568, now + 0.35); // G6
      shimmerGain.gain.setValueAtTime(0, now + 0.35);
      shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      shimmerOsc.start(now + 0.35);
      shimmerOsc.stop(now + 0.7);

    } catch (error) {
      console.log("Audio playback not available");
    }
  }, [canPlaySound]);

  return useMemo(() => ({
    playCelebrationSound,
    canPlaySound,
  }), [playCelebrationSound, canPlaySound]);
};
