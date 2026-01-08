import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTopAnime } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';

export function PopularSection() {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopAnime('bypopularity', 1)
      .then(data => {
        const transformed = data.slice(0, 10).map((item: any) => ({
          id: item.mal_id,
          title: {
            romaji: item.title,
            english: item.title_english,
            native: item.title_japanese,
          },
          coverImage: {
            large: item.images?.jpg?.large_image_url,
            extraLarge: item.images?.jpg?.large_image_url,
          },
          averageScore: item.score ? Math.round(item.score * 10) : null,
          episodes: item.episodes,
          format: item.type,
          status: item.status,
          genres: item.genres?.map((g: any) => g.name),
          season: item.season,
          seasonYear: item.year,
        }));
        setAnime(transformed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Most Popular</h2>
          </div>
          <Link 
            to="/anime" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            View All
            <motion.span whileHover={{ x: 5 }}>
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
