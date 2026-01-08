import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTrendingAnime } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingSection() {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingAnime(1, 10)
      .then(setAnime)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-6 h-6 text-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trending Now</h2>
          </div>
          <Link 
            to="/anime" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            View All
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="aspect-[3/4]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Skeleton className="w-full h-full rounded-xl" />
              </motion.div>
            ))
          ) : (
            anime.map((animeItem, index) => (
              <motion.div
                key={animeItem.id}
                variants={item}
                whileHover={{ y: -10, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <AnimeCard {...animeItem} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}
