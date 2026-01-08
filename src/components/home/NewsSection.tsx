import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAnimeNews } from '@/lib/api';

interface NewsItem {
  title: string;
  url: string;
  uploadedAt: string;
  topics: string[];
  thumbnail?: string;
  intro?: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchAnimeNews();
        setNews(data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest News</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            : news.map((newsItem, index) => (
                <motion.a
                  key={index}
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
                >
                  {newsItem.thumbnail && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={newsItem.thumbnail}
                        alt={newsItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {newsItem.uploadedAt}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {newsItem.title}
                    </h3>
                    {newsItem.intro && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {newsItem.intro}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary mt-3">
                      Read more <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </motion.a>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
