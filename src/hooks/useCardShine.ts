import { useCallback, useState } from "react";

interface ShinePosition {
  x: number;
  y: number;
  opacity: number;
}

export const useCardShine = () => {
  const [shinePosition, setShinePosition] = useState<ShinePosition>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setShinePosition({ x, y, opacity: 1 });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setShinePosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const shineStyle: React.CSSProperties = {
    background: `radial-gradient(circle at ${shinePosition.x}% ${shinePosition.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 25%, transparent 50%)`,
    opacity: shinePosition.opacity,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  };

  return {
    shineStyle,
    handleMouseMove,
    handleMouseLeave,
  };
};
