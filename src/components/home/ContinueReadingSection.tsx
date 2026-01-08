import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchConsumetMangaInfo } from '@/lib/api';

interface ReadingProgress {
  mangaId: string;
  chapterId: string;
  page: number;
  updatedAt: number;
}

interface ContinueReadingItem extends ReadingProgress {
  title: string;
  image: string;
  chapterNumber?: string;
}

export function ContinueReadingSection() {
  const [items, setItems] = useState<ContinueReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = JSON.parse(localStorage.getItem('mangaProgress') || '{}');
        const entries = Object.entries(progress) as [string, ReadingProgress][];
        
        if (entries.length === 0) {
          setLoading(false);
          return;
        }

        // Sort by most recent
        const sorted = entries
          .map(([mangaId, data]) => ({ mangaId, ...data }))
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          .slice(0, 10);

        // Fetch manga info for each
        const itemsWithInfo = await Promise.all(
          sorted.map(async (item) => {
            try {
              const info = await fetchConsumetMangaInfo(item.mangaId);
              const chapter = info?.chapters?.find((ch: any) => ch.id === item.chapterId);
              return {
                ...item,
                title: info?.title || 'Unknown',
                image: info?.image || '/placeholder.svg',
                chapterNumber: chapter?.chapterNumber,
              };
            } catch {
              return {
                ...item,
                title: 'Unknown',
                image: '/placeholder.svg',
              };
            }
          })
        );

        setItems(itemsWithInfo.filter(item => item.title !== 'Unknown'));
      } catch (error) {
        console.error('Failed to load reading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Continue Reading</h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {items.map((item, index) => (
            <motion.div
              key={item.mangaId}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex-shrink-0 w-48"
            >
              <Link to={`/manga/${item.mangaId}/read/${item.chapterId}`} className="block group">
                <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Progress indicator */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ch. {item.chapterNumber || '?'}
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center"
                    >
                      <BookOpen className="w-6 h-6" />
                    </motion.div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white text-sm line-clamp-2">{item.title}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
