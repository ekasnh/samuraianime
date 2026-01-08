import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWatchProgress } from '@/lib/api';

interface ContinueWatchingItem {
  animeId: number;
  title: string;
  coverImage: string;
  episodeNumber: number;
  progress: number;
  timestamp: number;
  duration: number;
}

export function ContinueWatchingSection() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    const progress = getWatchProgress();
    // In a real app, we'd fetch the anime details for each progress item
    // For now, we'll show the section only if there's progress
    setItems([]);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Continue Watching</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
          {items.map((item, index) => (
            <motion.div
              key={item.animeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-72"
            >
              <Link to={`/watch/${item.animeId}/${item.episodeNumber}`} className="block group">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full aspect-video object-cover"
                  />
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(item.timestamp / item.duration) * 100}%` }}
                    />
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-foreground" />
                  </div>
                </div>
                
                <div className="mt-3">
                  <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Episode {item.episodeNumber}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
