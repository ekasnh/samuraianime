import { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { RainEffect } from '../effects/RainEffect';
import { SnowEffect } from '../effects/SnowEffect';
import { ScrollToTop } from '../ui/ScrollToTop';

interface LayoutProps {
  children: ReactNode;
  showRain?: boolean;
}

export function Layout({ children, showRain = false }: LayoutProps) {
  const [showSnow, setShowSnow] = useState(() => {
    return localStorage.getItem('showSnow') === 'true';
  });

  useEffect(() => {
    // Check theme preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleSnow = () => {
    const newValue = !showSnow;
    setShowSnow(newValue);
    localStorage.setItem('showSnow', String(newValue));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Optional rain effect */}
      {showRain && <RainEffect />}
      
      {/* Optional snow effect */}
      {showSnow && <SnowEffect />}
      
      <Header showSnow={showSnow} onToggleSnow={toggleSnow} />
      
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      <Footer />
      
      <ScrollToTop />
    </div>
  );
}
