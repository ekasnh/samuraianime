import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RainEffect } from '@/components/effects/RainEffect';
import { ArrowUpRight, Play, Book, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTrendingAnime } from '@/lib/api';

export function HeroSection() {
  const [animeImage, setAnimeImage] = useState<string>('/placeholder.svg');
  const [loading, setLoading] = useState(true);
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [chaptersRead, setChaptersRead] = useState(0);

  useEffect(() => {
    // Load a featured anime image
    const loadFeaturedImage = async () => {
      try {
        const data = await fetchTrendingAnime(1, 1);
        if (data && data.length > 0) {
          const anime = data[0];
          setAnimeImage(anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.svg');
        }
      } catch (error) {
        console.error('Failed to load featured anime:', error);
      } finally {
        setLoading(false);
      }
    };

    // Get stats from localStorage
    const watchProgress = JSON.parse(localStorage.getItem('watchProgress') || '[]');
    const readProgress = JSON.parse(localStorage.getItem('readingProgress') || '[]');
    setEpisodesWatched(watchProgress.length || 120);
    setChaptersRead(readProgress.length || 350);

    loadFeaturedImage();
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/80 dark:from-background dark:via-background dark:to-background">
      {/* Rain Effect */}
      <RainEffect />

      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full border border-primary/20 opacity-50" />
      <div className="absolute top-40 right-40 w-64 h-64 rounded-full border border-primary/30 opacity-30" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full py-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            {/* Side Icons */}
            <div className="flex items-start gap-6">
              <motion.div 
                className="flex flex-col gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center cursor-pointer"
                >
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer"
                >
                  <Play className="w-5 h-5 text-foreground" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer"
                >
                  <Book className="w-5 h-5 text-foreground" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <div>
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="font-japanese">IMMERSE IN</span>
                  <br />
                  <span className="flex items-center gap-3">
                    ANIME <span className="font-japanese text-primary">軍</span>
                  </span>
                  <span className="text-primary">MANGA</span>
                </motion.h1>
              </div>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 flex-1">
                <p className="text-sm text-muted-foreground mb-1">Explore, Read, and</p>
                <h3 className="text-2xl font-bold text-foreground font-japanese tracking-wider">ENJOY</h3>
                <Link to="/manga">
                  <Button variant="outline" className="mt-4 w-full group">
                    Let's Explore
                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 flex-1">
                <p className="text-sm text-muted-foreground mb-1">Stream Anime and</p>
                <h3 className="text-2xl font-bold text-foreground font-japanese tracking-wider">ENJOY</h3>
                <Link to="/anime">
                  <Button variant="hero" className="mt-4 w-full group">
                    Watch
                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Character Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative flex justify-center"
          >
            {/* Character Image Placeholder - Dynamic trending anime */}
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <div className="w-64 md:w-80 lg:w-96 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={animeImage}
                    alt="Featured Anime"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl flex gap-6 z-20"
              >
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Complete</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{episodesWatched}</span>
                    <span className="text-xs text-muted-foreground">Episodes</span>
                  </div>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{chaptersRead}</span>
                  <p className="text-xs text-muted-foreground">Chapters Read</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer self-center"
                >
                  <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Japanese text decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 right-10 text-8xl font-japanese text-foreground pointer-events-none hidden lg:block"
      >
        アニメ
      </motion.div>
    </section>
  );
}
