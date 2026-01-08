import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { searchAnime, searchManga } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Book } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [animeResults, setAnimeResults] = useState<any[]>([]);
  const [mangaResults, setMangaResults] = useState<any[]>([]);
  const [loadingAnime, setLoadingAnime] = useState(false);
  const [loadingManga, setLoadingManga] = useState(false);
  const [activeTab, setActiveTab] = useState('anime');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Search anime
  useEffect(() => {
    if (!debouncedQuery) {
      setAnimeResults([]);
      return;
    }

    const fetchAnime = async () => {
      setLoadingAnime(true);
      try {
        const result = await searchAnime({ search: debouncedQuery, perPage: 20 });
        setAnimeResults(result?.media || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoadingAnime(false);
      }
    };

    fetchAnime();
  }, [debouncedQuery]);

  // Search manga
  useEffect(() => {
    if (!debouncedQuery) {
      setMangaResults([]);
      return;
    }

    const fetchManga = async () => {
      setLoadingManga(true);
      try {
        const result = await searchManga({ title: debouncedQuery, limit: 20 });
        setMangaResults(result?.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoadingManga(false);
      }
    };

    fetchManga();
  }, [debouncedQuery]);

  const getCoverUrl = (manga: any) => {
    const coverArt = manga.relationships?.find((r: any) => r.type === 'cover_art');
    if (coverArt?.attributes?.fileName) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`;
    }
    return '/placeholder.svg';
  };

  const getMangaTitle = (manga: any) => {
    const titles = manga.attributes?.title;
    return titles?.en || titles?.['ja-ro'] || Object.values(titles || {})[0] || 'Unknown';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search anime and manga..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-10 py-6 text-lg bg-card border-border rounded-xl"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {debouncedQuery && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="anime">
                Anime ({loadingAnime ? '...' : animeResults.length})
              </TabsTrigger>
              <TabsTrigger value="manga">
                Manga ({loadingManga ? '...' : mangaResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anime">
              {loadingAnime ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))}
                </div>
              ) : animeResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {animeResults.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <AnimeCard {...item} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No anime found for "{debouncedQuery}"</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manga">
              {loadingManga ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))}
                </div>
              ) : mangaResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {mangaResults.map((item, index) => (
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
                            alt={getMangaTitle(item)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-80" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                              {getMangaTitle(item)}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No manga found for "{debouncedQuery}"</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Empty state */}
        {!debouncedQuery && (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">Start typing to search</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
