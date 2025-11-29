/**
 * Hook for generating programmatic startup sound using Web Audio API
 * Creates an elegant "chime" sound without requiring external audio files
 */
export const useSplashSound = () => {
  const canPlaySound = () => {
    return typeof AudioContext !== 'undefined' || 
           typeof (window as any).webkitAudioContext !== 'undefined';
  };

  const playStartupSound = () => {
    if (!canPlaySound()) {
      console.log('Web Audio API not supported');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Create an elegant "chime" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Frequency that rises (startup effect)
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.4);
      
      // Volume that gradually decreases
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing startup sound:', error);
    }
  };

  return { playStartupSound, canPlaySound };
};
