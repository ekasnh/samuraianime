import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Plus, Star, Calendar, Clock, Tv, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  fetchAnimeDetails, 
  searchGogoanime, 
  fetchGogoanimeInfo,
  addToFavorites,
  removeFromFavorites,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  getWatchlist,
  getPreferredDub,
  setPreferredDub,
} from '@/lib/api';

const alternativeLinks = [
  { name: 'Gogoanime', url: 'https://gogoanime3.co/search?keyword=' },
  { name: 'HiAnime', url: 'https://hianime.to/search?keyword=' },
  { name: 'AnimePahe', url: 'https://animepahe.ru/anime/' },
  { name: '9anime', url: 'https://9anime.to/search?keyword=' },
];

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState('');
  const [gogoanimeId, setGogoanimeId] = useState<string | null>(null);
  const [preferDub, setPreferDubState] = useState(getPreferredDub());
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const numId = parseInt(id);
    setIsFavorite(getFavorites().includes(numId));
    setIsInWatchlist(getWatchlist().includes(numId));
    
    fetchAnimeDetails(numId)
      .then(setAnime)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch episodes from Gogoanime
  useEffect(() => {
    if (!anime) return;
    
    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      setEpisodesError('');
      setEpisodes([]);
      
      try {
        const title = anime.title.english || anime.title.romaji;
        const searchResults = await searchGogoanime(title);
        
        if (!searchResults.length) {
          setEpisodesError('Episodes not available from this provider');
          return;
        }

        // Find the best match
        let gogoId = searchResults[0].id;
        
        // If dub is preferred, look for dub version
        if (preferDub) {
          const dubVersion = searchResults.find((r: any) => 
            r.id.toLowerCase().includes('dub') || r.title.toLowerCase().includes('dub')
          );
          if (dubVersion) gogoId = dubVersion.id;
        } else {
          // Prefer sub version (no dub suffix)
          const subVersion = searchResults.find((r: any) => 
            !r.id.toLowerCase().includes('dub')
          );
          if (subVersion) gogoId = subVersion.id;
        }
        
        setGogoanimeId(gogoId);
        
        const info = await fetchGogoanimeInfo(gogoId);
        if (info?.episodes?.length) {
          setEpisodes(info.episodes);
        } else {
          setEpisodesError('Episodes not available from this provider');
        }
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
        setEpisodesError('Failed to load episodes. The server may be waking up, please try again.');
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [anime, preferDub]);

  const handleDubToggle = (checked: boolean) => {
    setPreferDubState(checked);
    setPreferredDub(checked);
  };

  const handleFavoriteToggle = () => {
    if (!id) return;
    const numId = parseInt(id);
    if (isFavorite) {
      removeFromFavorites(numId);
    } else {
      addToFavorites(numId);
    }
    setIsFavorite(!isFavorite);
  };

  const handleWatchlistToggle = () => {
    if (!id) return;
    const numId = parseInt(id);
    if (isInWatchlist) {
      removeFromWatchlist(numId);
    } else {
      addToWatchlist(numId);
    }
    setIsInWatchlist(!isInWatchlist);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-[400px] rounded-xl mb-8" />
          <Skeleton className="w-1/2 h-10 mb-4" />
          <Skeleton className="w-full h-24" />
        </div>
      </Layout>
    );
  }

  if (!anime) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Anime not found</p>
        </div>
      </Layout>
    );
  }

  const displayTitle = anime.title.english || anime.title.romaji || anime.title.native;

  return (
    <Layout>
      {/* Banner */}
      <div className="relative h-[400px] md:h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.bannerImage || anime.coverImage.extraLarge})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={displayTitle}
              className="w-48 md:w-64 rounded-xl shadow-2xl"
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {anime.title.native && (
                <p className="text-muted-foreground font-japanese text-lg mb-2">{anime.title.native}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{displayTitle}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {anime.averageScore && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    {anime.averageScore}%
                  </span>
                )}
                {anime.episodes && (
                  <span className="flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    {anime.episodes} Episodes
                  </span>
                )}
                {anime.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {anime.duration} min
                  </span>
                )}
                {anime.seasonYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {anime.season} {anime.seasonYear}
                  </span>
                )}
                <span>{anime.format}</span>
                <span>{anime.status}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                {episodes.length > 0 && (
                  <Button asChild size="lg">
                    <Link to={`/watch/${id}/${episodes[0].id}`}>
                      <Play className="w-5 h-5 mr-2 fill-primary-foreground" />
                      Watch Now
                    </Link>
                  </Button>
                )}
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  size="lg"
                  onClick={handleFavoriteToggle}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant={isInWatchlist ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={handleWatchlistToggle}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>

              {/* Sub/Dub Toggle */}
              <div className="flex items-center gap-3">
                <Label htmlFor="dub-toggle" className="text-sm text-muted-foreground">SUB</Label>
                <Switch
                  id="dub-toggle"
                  checked={preferDub}
                  onCheckedChange={handleDubToggle}
                />
                <Label htmlFor="dub-toggle" className="text-sm text-muted-foreground">DUB</Label>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="episodes" className="mt-12">
          <TabsList>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            {episodesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading episodes... Server may be waking up.</span>
              </div>
            ) : episodesError ? (
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{episodesError}</span>
                </div>
                
                {/* Alternative streaming links */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Watch on Alternative Sites:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternativeLinks.map(link => (
                      <a
                        key={link.name}
                        href={`${link.url}${encodeURIComponent(displayTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                      >
                        {link.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    External sites – availability may vary
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${id}/${ep.id}`}
                    className="aspect-square flex items-center justify-center bg-card hover:bg-primary hover:text-primary-foreground rounded-lg border border-border transition-colors font-medium"
                  >
                    {ep.number}
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }}
              />
            </div>
            
            {anime.studios?.nodes?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-2">Studios</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.nodes.map((studio: any) => (
                    <Badge key={studio.name} variant="outline">{studio.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="related" className="mt-6">
            {anime.relations?.edges?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {anime.relations.edges.slice(0, 12).map((edge: any) => (
                  <Link
                    key={edge.node.id}
                    to={`/anime/${edge.node.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                      <img
                        src={edge.node.coverImage?.large}
                        alt={edge.node.title?.romaji}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs text-primary font-medium">{edge.relationType}</p>
                    <p className="text-sm text-foreground line-clamp-2">{edge.node.title?.romaji}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No related anime found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
