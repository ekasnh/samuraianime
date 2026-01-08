import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import samuraiSilhouette from '@/assets/samurai-silhouette.png';
import grassSilhouette from '@/assets/grass-silhouette.png';

interface HeroSlide {
  id: number;
  titleJp: string;
  titleSub: string;
  description: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    titleJp: '自分自身の戦いを\n戦う少年',
    titleSub: 'A Boy Who Fights His Own Battle',
    description: 'Discover epic anime adventures and immersive manga stories. Stream thousands of episodes and read countless chapters.',
  },
  {
    id: 2,
    titleJp: '運命を切り開く\n剣の道',
    titleSub: 'The Path of the Sword',
    description: 'Follow legendary samurai on their journey through honor, sacrifice, and destiny. Every battle tells a story.',
  },
  {
    id: 3,
    titleJp: '夢を追いかける\n若き魂',
    titleSub: 'Young Souls Chasing Dreams',
    description: 'From shonen adventures to heartfelt slice-of-life, find your next obsession in our curated collection.',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Background gradient - grainy texture applied via CSS */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-background" />
      
      {/* Large Japanese character watermark */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 font-japanese text-[400px] font-black text-foreground/[0.03] leading-none select-none pointer-events-none hidden lg:block">
        年
      </div>

      {/* Rising Sun */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px]">
        <div className="w-full h-full rounded-full bg-primary/80 animate-pulse-glow" />
      </div>

      {/* Samurai Silhouette */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10"
      >
        <img
          src={samuraiSilhouette}
          alt="Samurai"
          className="h-[500px] md:h-[600px] lg:h-[700px] object-contain drop-shadow-2xl"
          style={{ filter: 'brightness(0)' }}
        />
      </motion.div>

      {/* Grass silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <img
          src={grassSilhouette}
          alt=""
          className="w-full h-24 md:h-32 object-cover object-bottom"
          style={{ filter: 'brightness(0)' }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-30 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <motion.div
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="japanese-title text-5xl md:text-6xl lg:text-7xl text-foreground whitespace-pre-line">
              {slide.titleJp}
            </h1>
          </motion.div>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-muted-foreground text-base md:text-lg max-w-md leading-relaxed"
          >
            {slide.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Button variant="hero" size="lg" asChild>
              <a href="/anime">PRE ORDER</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="/manga">CONTACT US</a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-32 left-8 z-40 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`pagination-dot ${idx === currentSlide ? 'active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows (hidden on mobile) */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 z-40 hidden md:block">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute bottom-1/2 translate-y-1/2 right-4 z-40 hidden md:block">
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tagline */}
      <div className="absolute bottom-8 right-8 z-40">
        <p className="font-japanese text-muted-foreground text-sm md:text-base">
          マンガが大好きな人が作った
        </p>
      </div>
    </section>
  );
}
