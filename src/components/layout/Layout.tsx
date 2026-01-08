import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { RainEffect } from '../effects/RainEffect';

interface LayoutProps {
  children: ReactNode;
  showRain?: boolean;
}

export function Layout({ children, showRain = false }: LayoutProps) {
  useEffect(() => {
    // Add dark class to document for consistent theming
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Optional rain effect */}
      {showRain && <RainEffect />}
      
      <Header />
      
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
