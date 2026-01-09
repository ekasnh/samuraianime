import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  mal_id: number;
  url: string;
  title: string;
  date: string;
  author_username: string;
  images?: {
    jpg?: {
      image_url: string;
    };
  };
  excerpt: string;
}

// Popular anime IDs for fetching news
const POPULAR_ANIME_IDS = [21, 1535, 16498, 30276, 38000, 5114, 11757, 20, 1, 21459];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const allNews: NewsItem[] = [];

        // Fetch news from multiple popular anime with rate limiting
        for (let i = 0; i < 3; i++) {
          const animeId = POPULAR_ANIME_IDS[i];
          try {
            // Jikan API requires rate limiting (3 requests per second max)
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/news`);
            if (!response.ok) continue;
            
            const data = await response.json();
            if (data?.data) {
              allNews.push(...data.data.slice(0, 5));
            }
          } catch (error) {
            console.error(`Failed to fetch news for anime ${animeId}:`, error);
          }
        }

        // Sort by date and remove duplicates
        const uniqueNews = allNews.filter((item, index, self) =>
          index === self.findIndex((t) => t.mal_id === item.mal_id)
        );
        uniqueNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setNews(uniqueNews.slice(0, 20));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Newspaper className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Anime News</h1>
          </div>
          <p className="text-muted-foreground">Latest updates from the anime world</p>
        </motion.div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {news.map((newsItem) => (
              <motion.a
                key={newsItem.mal_id}
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                className="block bg-card border border-border rounded-xl overflow-hidden group"
              >
                {newsItem.images?.jpg?.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={newsItem.images.jpg.image_url}
                      alt={newsItem.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {newsItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {newsItem.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(newsItem.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      Read more <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}

        {!loading && news.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Newspaper className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">No news available</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Please try again later</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
