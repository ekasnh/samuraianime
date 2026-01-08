import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, BookOpen, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchKitsuManga } from '@/lib/api';
import { Link } from 'react-router-dom';

export default function MangaPage() {
  const [manga, setManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchManga = async (search = '') => {
    setLoading(true);
    try {
      const result = await fetchKitsuManga({ 
        search: search || undefined,
        limit: 20,
      });
      setManga(result?.data || []);
    } catch (error) {
      console.error('Failed to fetch manga:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManga();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchManga(searchQuery);
  };

  const getCoverUrl = (item: any) => {
    return item.attributes?.posterImage?.medium || 
           item.attributes?.posterImage?.small || 
           '/placeholder.svg';
  };

  const getTitle = (item: any) => {
    return item.attributes?.canonicalTitle || 
           item.attributes?.titles?.en || 
           item.attributes?.titles?.en_jp || 
           'Unknown';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
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
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Browse Manga</h1>
          </div>
          <p className="text-muted-foreground">Read thousands of manga chapters for free</p>
        </motion.div>

        {/* Search */}
        <motion.form 
          onSubmit={handleSearch} 
          className="flex gap-2 mb-8 max-w-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button type="submit">Search</Button>
        </motion.form>

        {/* Manga Grid */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {loading ? (
            Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[3/4]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ))
          ) : (
            manga.map((mangaItem) => (
              <motion.div
                key={mangaItem.id}
                variants={item}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link to={`/manga/${mangaItem.id}`} className="block group">
                  <div className="anime-card aspect-[3/4] relative overflow-hidden">
                    <img
                      src={getCoverUrl(mangaItem)}
                      alt={getTitle(mangaItem)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Status badge */}
                    {mangaItem.attributes?.status && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-xs font-medium capitalize">
                        {mangaItem.attributes.status}
                      </div>
                    )}

                    {/* Rating */}
                    {mangaItem.attributes?.averageRating && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {(parseFloat(mangaItem.attributes.averageRating) / 10).toFixed(1)}
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {getTitle(mangaItem)}
                      </h3>
                      
                      {mangaItem.attributes?.startDate && (
                        <p className="text-xs text-white/70 mt-1">
                          {new Date(mangaItem.attributes.startDate).getFullYear()}
                        </p>
                      )}
                    </div>
                    
                    {/* Read button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Button size="icon" className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary">
                          <BookOpen className="w-6 h-6" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* No Results */}
        {!loading && manga.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xl text-muted-foreground">No manga found</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
