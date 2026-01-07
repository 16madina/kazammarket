import { useCallback } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#a855f7', // purple-500
  '#ef4444', // red-500
];

/**
 * Hook for creating celebratory confetti animation using canvas
 * Creates a burst of colorful confetti particles
 */
export const useConfetti = () => {
  const launchConfetti = useCallback((duration: number = 3000) => {
    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    // Create particles
    const particles: ConfettiParticle[] = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 8 + Math.random() * 12;
      
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - 10, // Bias upward
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
      });
    }

    // Additional burst from top
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      particles.push({
        x,
        y: -20,
        size: 5 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: 3 + Math.random() * 5,
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    const gravity = 0.3;
    const friction = 0.99;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed > duration) {
        canvas.remove();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        // Update physics
        particle.velocity.y += gravity;
        particle.velocity.x *= friction;
        particle.velocity.y *= friction;
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.rotation += particle.rotationSpeed;
        
        // Fade out near the end
        if (elapsed > duration * 0.7) {
          particle.opacity = Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3));
        }

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        
        // Draw a rectangle with rounded corners (confetti shape)
        const width = particle.size;
        const height = particle.size * 0.6;
        ctx.beginPath();
        ctx.roundRect(-width / 2, -height / 2, width, height, 1);
        ctx.fill();
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
      canvas.remove();
    };
  }, []);

  return { launchConfetti };
};
