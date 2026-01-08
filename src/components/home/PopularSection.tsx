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
        // Transform Jikan data to AniList format
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

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Most Popular</h2>
          </div>
          <Link 
            to="/anime" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ))
          ) : (
            anime.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnimeCard {...item} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
