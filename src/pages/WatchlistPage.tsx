import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getWatchlist, removeFromWatchlist, fetchAnimeDetails } from '@/lib/api';

export default function WatchlistPage() {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      setLoading(true);
      const ids = getWatchlist();
      
      try {
        const animeData = await Promise.all(
          ids.map(id => fetchAnimeDetails(id).catch(() => null))
        );
        setAnime(animeData.filter(Boolean));
      } catch (error) {
        console.error('Failed to load watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const handleRemove = (id: number) => {
    removeFromWatchlist(id);
    setAnime(anime.filter(a => a.id !== id));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Watchlist</h1>
          </div>
          <p className="text-muted-foreground">Anime you want to watch</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : anime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {anime.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <AnimeCard {...item} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookMarked className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add anime to watch later!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
