import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function RainEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rainDrops: HTMLDivElement[] = [];

    // Create rain drops
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.opacity = `${0.1 + Math.random() * 0.3}`;
      container.appendChild(drop);
      rainDrops.push(drop);
    }

    // Animate each drop with GSAP
    rainDrops.forEach((drop) => {
      const animateDrop = () => {
        const duration = 0.6 + Math.random() * 0.4;
        const delay = Math.random() * 2;

        gsap.set(drop, {
          y: -20,
          x: Math.random() * 10 - 5,
        });

        gsap.to(drop, {
          y: window.innerHeight + 20,
          duration,
          delay,
          ease: 'none',
          onComplete: animateDrop,
        });
      };

      animateDrop();
    });

    return () => {
      // Cleanup
      rainDrops.forEach((drop) => {
        gsap.killTweensOf(drop);
        drop.remove();
      });
    };
  }, []);

  return <div ref={containerRef} className="rain-container" />;
}
