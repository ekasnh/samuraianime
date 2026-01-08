import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Calendar, Clock, BarChart3, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string;
  image: { original: string; preview: string };
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string;
  released_on: string;
  rating: string;
  duration: number;
  description: string;
  genres: { id: number; name: string; russian: string; kind: string }[];
  studios: { id: number; name: string }[];
}

export default function ShikimoriPage() {
  const [topAnime, setTopAnime] = useState<ShikimoriAnime[]>([]);
  const [searchResults, setSearchResults] = useState<ShikimoriAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<ShikimoriAnime | null>(null);
  const [activeTab, setActiveTab] = useState('top');

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        const response = await fetch('https://shikimori.one/api/animes?limit=20&order=ranked', {
          headers: { 'User-Agent': 'SAMURAI Anime Platform' },
        });
        const data = await response.json();
        setTopAnime(data);
      } catch (error) {
        console.error('Failed to fetch Shikimori anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAnime();
  }, []);

  const searchAnime = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setActiveTab('search');
    
    try {
      const response = await fetch(
        `https://shikimori.one/api/animes?search=${encodeURIComponent(searchQuery)}&limit=20`,
        { headers: { 'User-Agent': 'SAMURAI Anime Platform' } }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchAnimeDetails = async (id: number) => {
    try {
      const response = await fetch(`https://shikimori.one/api/animes/${id}`, {
        headers: { 'User-Agent': 'SAMURAI Anime Platform' },
      });
      const data = await response.json();
      setSelectedAnime(data);
    } catch (error) {
      console.error('Failed to fetch anime details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'text-green-500 bg-green-500/10';
      case 'released': return 'text-blue-500 bg-blue-500/10';
      case 'anons': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  const displayAnime = activeTab === 'search' ? searchResults : topAnime;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Shikimori Tracker</h1>
          <p className="text-muted-foreground">Alternative anime tracker powered by Shikimori API</p>
        </motion.div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); searchAnime(); }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search anime on Shikimori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </form>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mx-auto w-fit">
            <TabsTrigger value="top">Top Anime</TabsTrigger>
            <TabsTrigger value="search" disabled={searchResults.length === 0}>
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Anime Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))
                : displayAnime.map((anime, index) => (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => fetchAnimeDetails(anime.id)}
                      className={`cursor-pointer group relative rounded-xl overflow-hidden border transition-all ${
                        selectedAnime?.id === anime.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-[3/4]">
                        <img
                          src={`https://shikimori.one${anime.image.original}`}
                          alt={anime.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {anime.score && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {anime.score}
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-medium text-sm text-white line-clamp-2">{anime.name}</p>
                        <p className="text-xs text-white/70 capitalize">{anime.kind}</p>
                      </div>
                    </motion.div>
                  ))}
            </div>
          </div>

          {/* Anime Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedAnime ? (
                <motion.div
                  key={selectedAnime.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <img
                      src={`https://shikimori.one${selectedAnime.image.original}`}
                      alt={selectedAnime.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>

                  <div className="p-6 -mt-12 relative">
                    <h2 className="text-xl font-bold mb-1">{selectedAnime.name}</h2>
                    {selectedAnime.russian && (
                      <p className="text-sm text-muted-foreground mb-3">{selectedAnime.russian}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(selectedAnime.status)}`}>
                        {selectedAnime.status}
                      </span>
                      <span className="px-2 py-1 bg-secondary rounded text-xs capitalize">
                        {selectedAnime.kind}
                      </span>
                      {selectedAnime.rating && (
                        <span className="px-2 py-1 bg-secondary rounded text-xs uppercase">
                          {selectedAnime.rating}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Star className="w-3 h-3" />
                          Score
                        </div>
                        <p className="font-bold">{selectedAnime.score || 'N/A'}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <BarChart3 className="w-3 h-3" />
                          Episodes
                        </div>
                        <p className="font-bold">
                          {selectedAnime.episodes_aired || 0} / {selectedAnime.episodes || '?'}
                        </p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </div>
                        <p className="font-bold">{selectedAnime.duration || '?'} min</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          Aired
                        </div>
                        <p className="font-bold text-sm">
                          {selectedAnime.aired_on ? new Date(selectedAnime.aired_on).getFullYear() : '?'}
                        </p>
                      </div>
                    </div>

                    {selectedAnime.genres && selectedAnime.genres.length > 0 && (
                      <>
                        <h3 className="font-semibold text-sm mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {selectedAnime.genres.map((genre) => (
                            <span key={genre.id} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedAnime.studios && selectedAnime.studios.length > 0 && (
                      <>
                        <h3 className="font-semibold text-sm mb-2">Studios</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedAnime.studios.map((s) => s.name).join(', ')}
                        </p>
                      </>
                    )}

                    <Button className="w-full mt-4" asChild>
                      <a
                        href={`https://shikimori.one${selectedAnime.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Shikimori
                      </a>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Select an anime to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
