import { useEffect, useState } from 'react';

export function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 2 + Math.random() * 4,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
          }}
        />
      ))}
    </div>
  );
}
