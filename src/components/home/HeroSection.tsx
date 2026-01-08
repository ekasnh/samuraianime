import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import samuraiSilhouette from '@/assets/samurai-silhouette.png';
import grassSilhouette from '@/assets/grass-silhouette.png';

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Background gradient */}
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
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="japanese-title text-5xl md:text-6xl lg:text-7xl text-foreground whitespace-pre-line">
              {'自分自身の戦いを\n戦う少年'}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-muted-foreground text-base md:text-lg max-w-md leading-relaxed"
          >
            Discover epic anime adventures and immersive manga stories. Stream thousands of episodes and read countless chapters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Button variant="hero" size="lg" asChild>
              <a href="/anime">WATCH NOW</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="/manga">READ MANGA</a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Pagination dots (static, single active) */}
      <div className="absolute bottom-32 left-8 z-40 flex gap-3">
        <div className="pagination-dot active" />
        <div className="pagination-dot" />
        <div className="pagination-dot" />
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
