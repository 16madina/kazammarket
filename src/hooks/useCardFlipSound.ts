/**
 * Hook for generating card flip sound using Web Audio API
 * Creates a satisfying "whoosh/flip" sound effect
 */
export const useCardFlipSound = () => {
  const canPlaySound = () => {
    return typeof AudioContext !== 'undefined' || 
           typeof (window as any).webkitAudioContext !== 'undefined';
  };

  const playFlipSound = () => {
    if (!canPlaySound()) {
      console.log('Web Audio API not supported');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Create white noise for the "whoosh" effect
      const bufferSize = audioContext.sampleRate * 0.15; // 150ms
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      
      // Filter for a softer whoosh sound
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.08);
      filter.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
      filter.Q.setValueAtTime(1, audioContext.currentTime);
      
      // Envelope for volume
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      // Add a subtle click at the start
      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      clickOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.03);
      clickGain.gain.setValueAtTime(0.08, audioContext.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
      
      // Connect nodes
      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);
      
      // Play
      whiteNoise.start(audioContext.currentTime);
      whiteNoise.stop(audioContext.currentTime + 0.15);
      clickOsc.start(audioContext.currentTime);
      clickOsc.stop(audioContext.currentTime + 0.03);
      
    } catch (error) {
      console.error('Error playing flip sound:', error);
    }
  };

  return { playFlipSound, canPlaySound };
};
