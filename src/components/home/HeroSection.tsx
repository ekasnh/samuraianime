import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RainEffect } from '@/components/effects/RainEffect';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { fetchTrendingAnime } from '@/lib/api';

interface AnimeSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  genres: string[];
}

export function HeroSection() {
  const [slides, setSlides] = useState<AnimeSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await fetchTrendingAnime(1, 5);
        const formatted = data.media.map((anime: any) => ({
          id: anime.id,
          title: anime.title.english || anime.title.romaji,
          description: anime.description?.replace(/<[^>]*>/g, '').slice(0, 150) + '...' || '',
          image: anime.bannerImage || anime.coverImage.extraLarge,
          genres: anime.genres?.slice(0, 3) || [],
        }));
        setSlides(formatted);
      } catch (error) {
        console.error('Failed to load trending anime:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading || slides.length === 0) {
    return (
      <section className="relative h-screen min-h-[600px] max-h-[800px] overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <RainEffect />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="container mx-auto px-4 relative z-30 h-full flex flex-col justify-center">
          <div className="max-w-2xl animate-pulse">
            <div className="h-12 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </section>
    );
  }

  const current = slides[currentSlide];

  return (
    <section className="relative h-screen min-h-[600px] max-h-[800px] overflow-hidden">
      {/* Rain Effect */}
      <RainEffect />

      {/* Background Image with Parallax */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Grain Overlay */}
      <div className="absolute inset-0 grain-overlay opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-30 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Genres */}
              <motion.div className="flex gap-2 mb-4">
                {current.genres.map((genre, i) => (
                  <motion.span
                    key={genre}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30"
                  >
                    {genre}
                  </motion.span>
                ))}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {current.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {current.description}
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="hero" size="lg" asChild>
                    <a href={`/anime/${current.id}`} className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      WATCH NOW
                    </a>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="heroOutline" size="lg" asChild>
                    <a href="/manga">READ MANGA</a>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </motion.button>
      </div>
      <div className="absolute bottom-1/2 right-4 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
            }`}
          />
        ))}
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 right-8 z-40 hidden md:block"
      >
        <p className="font-japanese text-muted-foreground text-sm">
          アニメとマンガの世界へ
        </p>
      </motion.div>
    </section>
  );
}
