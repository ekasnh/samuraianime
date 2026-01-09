import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, BookOpen, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface MangaItem {
  id: string;
  title: string;
  image: string;
  status?: string;
  lastChapter?: string;
  year?: number;
}

export default function MangaPage() {
  const [manga, setManga] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchManga = async (search = '') => {
    setLoading(true);
    try {
      // Use MangaDex API directly (CORS-friendly)
      const endpoint = search
        ? `https://api.mangadex.org/manga?title=${encodeURIComponent(search)}&limit=30&includes[]=cover_art&order[relevance]=desc`
        : `https://api.mangadex.org/manga?limit=30&includes[]=cover_art&order[followedCount]=desc`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      const results = data?.data || [];
      
      setManga(results.map((item: any) => {
        const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
        const coverFile = coverRel?.attributes?.fileName;
        const coverUrl = coverFile 
          ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile}.512.jpg`
          : '/placeholder.svg';
        
        const title = item.attributes?.title?.en 
          || item.attributes?.title?.['ja-ro'] 
          || Object.values(item.attributes?.title || {})[0] 
          || 'Unknown';
        
        return {
          id: item.id,
          title: title as string,
          image: coverUrl,
          status: item.attributes?.status,
          lastChapter: item.attributes?.lastChapter ? `Ch. ${item.attributes.lastChapter}` : undefined,
          year: item.attributes?.year,
        };
      }));
    } catch (error) {
      console.error('Failed to fetch manga:', error);
      setManga([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchManga();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    fetchManga(searchQuery);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Book className="w-8 h-8 text-primary" />
            </motion.div>
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
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
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
            manga.map((mangaItem, index) => (
              <motion.div
                key={mangaItem.id}
                variants={item}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link to={`/manga/${mangaItem.id}`} className="block group">
                  <div className="anime-card aspect-[3/4] relative overflow-hidden rounded-xl">
                    <motion.img
                      src={mangaItem.image}
                      alt={mangaItem.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Status badge */}
                    {mangaItem.status && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-xs font-medium capitalize"
                      >
                        {mangaItem.status}
                      </motion.div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {mangaItem.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
                        {mangaItem.lastChapter && <span>{mangaItem.lastChapter}</span>}
                        {mangaItem.year && <span>• {mangaItem.year}</span>}
                      </div>
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Book className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">No manga found</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Try a different search term</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
