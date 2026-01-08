import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RainEffect } from '@/components/effects/RainEffect';
import samuraiSilhouette from '@/assets/samurai-silhouette.png';
import grassSilhouette from '@/assets/grass-silhouette.png';

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Rain Effect */}
      <RainEffect />
      
      {/* Background gradient with grain texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-background" />
      <div className="absolute inset-0 grain-overlay opacity-30" />
      
      {/* Large Japanese character watermark */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute right-10 top-1/2 -translate-y-1/2 font-japanese text-[400px] font-black text-foreground/[0.03] leading-none select-none pointer-events-none hidden lg:block"
      >
        年
      </motion.div>

      {/* Rising Sun with pulse animation */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px]"
      >
        <div className="w-full h-full rounded-full bg-primary/80 animate-pulse-glow" />
      </motion.div>

      {/* Samurai Silhouette with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10"
      >
        <motion.img
          src={samuraiSilhouette}
          alt="Samurai"
          className="h-[500px] md:h-[600px] lg:h-[700px] object-contain drop-shadow-2xl"
          style={{ filter: 'brightness(0)' }}
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Grass silhouette at bottom with wave animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <img
          src={grassSilhouette}
          alt=""
          className="w-full h-24 md:h-32 object-cover object-bottom"
          style={{ filter: 'brightness(0)' }}
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-30 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="japanese-title text-5xl md:text-6xl lg:text-7xl text-foreground whitespace-pre-line"
              animate={{ 
                textShadow: [
                  "0 0 0px rgba(0,0,0,0)",
                  "0 0 20px rgba(0,0,0,0.1)",
                  "0 0 0px rgba(0,0,0,0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {'自分自身の戦いを\n戦う少年'}
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-muted-foreground text-base md:text-lg max-w-md leading-relaxed"
          >
            要するに、意味を持たずデザイン確認用として使える和文ダミーテキストです。要りますか？本当の日本語ランダム文字列版
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="hero" size="lg" asChild>
                <a href="/anime">WATCH NOW</a>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="/manga">READ MANGA</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Pagination dots (static, single active) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-32 left-8 z-40 flex gap-3"
      >
        <motion.div 
          className="pagination-dot active"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="pagination-dot" />
        <div className="pagination-dot" />
      </motion.div>

      {/* Tagline */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 right-8 z-40"
      >
        <p className="font-japanese text-muted-foreground text-sm md:text-base">
          マンガが大好きな人が作った
        </p>
      </motion.div>
    </section>
  );
}
