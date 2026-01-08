import { useMemo } from 'react';

export function RainEffect() {
  const rainDrops = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${0.8 + Math.random() * 0.5}s`,
      opacity: 0.1 + Math.random() * 0.2,
    }));
  }, []);

  return (
    <div className="rain-container">
      {rainDrops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}
