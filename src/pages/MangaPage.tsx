import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { searchManga } from '@/lib/api';
import { Link } from 'react-router-dom';

export default function MangaPage() {
  const [manga, setManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchManga = async (search = '') => {
    setLoading(true);
    try {
      const result = await searchManga({ 
        title: search || undefined,
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

  const getCoverUrl = (manga: any) => {
    const coverArt = manga.relationships?.find((r: any) => r.type === 'cover_art');
    if (coverArt?.attributes?.fileName) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`;
    }
    return '/placeholder.svg';
  };

  const getTitle = (manga: any) => {
    const titles = manga.attributes?.title;
    return titles?.en || titles?.['ja-ro'] || Object.values(titles || {})[0] || 'Unknown';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Browse Manga</h1>
          </div>
          <p className="text-muted-foreground">Read thousands of manga chapters for free</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
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
        </form>

        {/* Manga Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[3/4]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ))
          ) : (
            manga.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link to={`/manga/${item.id}`} className="block group">
                  <div className="anime-card aspect-[3/4] relative overflow-hidden">
                    <img
                      src={getCoverUrl(item)}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Status badge */}
                    {item.attributes?.status && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-ink/80 backdrop-blur-sm rounded-lg text-xs font-medium capitalize">
                        {item.attributes.status}
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {getTitle(item)}
                      </h3>
                      
                      {item.attributes?.year && (
                        <p className="text-xs text-muted-foreground mt-1">{item.attributes.year}</p>
                      )}
                    </div>
                    
                    {/* Read button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary">
                        <BookOpen className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* No Results */}
        {!loading && manga.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No manga found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
