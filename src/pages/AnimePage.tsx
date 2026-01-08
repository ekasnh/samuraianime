import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { searchAnime } from '@/lib/api';

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const formats = ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC'];
const statuses = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED'];
const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function AnimePage() {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    season: '',
    format: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAnime = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const result = await searchAnime({
        search: searchQuery || undefined,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        season: filters.season as any || undefined,
        format: filters.format as any || undefined,
        status: filters.status as any || undefined,
        page: currentPage,
        perPage: 20,
      });
      
      const newAnime = result?.media || [];
      setAnime(reset ? newAnime : [...anime, ...newAnime]);
      setHasMore(result?.pageInfo?.hasNextPage || false);
      if (reset) setPage(1);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime(true);
  }, [searchQuery, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnime(true);
  };

  const clearFilters = () => {
    setFilters({ genre: '', year: '', season: '', format: '', status: '' });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Browse Anime</h1>
          <p className="text-muted-foreground">Discover thousands of anime series and movies</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button type="submit" variant="default">
              Search
            </Button>
          </form>
          
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-6 mb-8 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filters</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Select value={filters.genre} onValueChange={(v) => setFilters({ ...filters, genre: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.year} onValueChange={(v) => setFilters({ ...filters, year: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.season} onValueChange={(v) => setFilters({ ...filters, season: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.format} onValueChange={(v) => setFilters({ ...filters, format: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format} value={format}>{format.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading && page === 1 ? (
            Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[3/4]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ))
          ) : (
            anime.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 20) * 0.03 }}
              >
                <AnimeCard {...item} />
              </motion.div>
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setPage(p => p + 1);
                fetchAnime();
              }}
            >
              Load More
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && anime.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No anime found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
