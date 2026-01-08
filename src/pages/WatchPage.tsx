import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { ChevronLeft, ChevronRight, List, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  fetchAnimeDetails, 
  fetchEpisodeStreams, 
  searchGogoanime,
  fetchGogoanimeInfo,
  updateWatchProgress,
  getPreferredDub,
  setPreferredDub,
} from '@/lib/api';

const alternativeLinks = [
  { name: 'Gogoanime', url: 'https://gogoanime3.co/search?keyword=' },
  { name: 'HiAnime', url: 'https://hianime.to/search?keyword=' },
  { name: 'AnimePahe', url: 'https://animepahe.ru/anime/' },
  { name: '9anime', url: 'https://9anime.to/search?keyword=' },
];

export default function WatchPage() {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [preferDub, setPreferDubState] = useState(getPreferredDub());

  // Fetch anime details and episodes
  useEffect(() => {
    if (!animeId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const animeData = await fetchAnimeDetails(parseInt(animeId));
        setAnime(animeData);
        
        const title = animeData.title.english || animeData.title.romaji;
        const searchResults = await searchGogoanime(title);
        
        if (!searchResults.length) {
          setError('Episodes not available from this provider');
          return;
        }

        let gogoId = searchResults[0].id;
        if (preferDub) {
          const dubVersion = searchResults.find((r: any) => 
            r.id.toLowerCase().includes('dub')
          );
          if (dubVersion) gogoId = dubVersion.id;
        } else {
          const subVersion = searchResults.find((r: any) => 
            !r.id.toLowerCase().includes('dub')
          );
          if (subVersion) gogoId = subVersion.id;
        }
        
        const info = await fetchGogoanimeInfo(gogoId);
        if (info?.episodes?.length) {
          setEpisodes(info.episodes);
          
          // Find current episode
          const current = info.episodes.find((ep: any) => ep.id === episodeId) || info.episodes[0];
          setCurrentEpisode(current);
        } else {
          setError('Episodes not available from this provider');
        }
      } catch (err) {
        console.error('Failed to load:', err);
        setError('Failed to load. Server may be waking up, please retry.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [animeId, preferDub]);

  // Fetch stream URL when episode changes
  useEffect(() => {
    if (!episodeId || !currentEpisode) return;
    
    const loadStream = async () => {
      try {
        const streamData = await fetchEpisodeStreams(episodeId);
        
        // Find best quality source
        const sources = streamData?.sources || [];
        const hlsSource = sources.find((s: any) => s.quality === '1080p' || s.quality === 'default' || s.quality === 'backup');
        
        if (hlsSource?.url) {
          setStreamUrl(hlsSource.url);
        } else if (sources.length > 0) {
          setStreamUrl(sources[0].url);
        } else {
          setError('Stream not available');
        }
      } catch (err) {
        console.error('Failed to fetch stream:', err);
        setError('Failed to load stream');
      }
    };

    loadStream();
  }, [episodeId, currentEpisode]);

  // Initialize HLS player
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr) => {
          // Add referer header to bypass 403
          xhr.setRequestHeader('Referer', 'https://gogoanime3.co/');
        },
      });
      
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          setError('Playback error. Try an alternative site.');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Save progress periodically
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !animeId || !episodeId || !currentEpisode) return;

    const saveProgress = () => {
      if (video.currentTime > 0 && video.duration) {
        updateWatchProgress({
          animeId: parseInt(animeId),
          episodeId,
          episodeNumber: currentEpisode.number,
          timestamp: video.currentTime,
          duration: video.duration,
          updatedAt: Date.now(),
        });
      }
    };

    const interval = setInterval(saveProgress, 10000);
    video.addEventListener('pause', saveProgress);

    return () => {
      clearInterval(interval);
      video.removeEventListener('pause', saveProgress);
      saveProgress();
    };
  }, [animeId, episodeId, currentEpisode]);

  const handleDubToggle = (checked: boolean) => {
    setPreferDubState(checked);
    setPreferredDub(checked);
  };

  const currentIndex = episodes.findIndex(ep => ep.id === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  const displayTitle = anime?.title?.english || anime?.title?.romaji || 'Loading...';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Player */}
        <div className="relative bg-ink rounded-xl overflow-hidden aspect-video">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Server is waking up, please wait a moment...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink">
              <div className="text-center max-w-md px-4">
                <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground mb-4">{error}</p>
                <div className="flex flex-wrap justify-center gap-2">
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
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
          <div>
            <Link to={`/anime/${animeId}`} className="text-primary hover:underline text-sm">
              ← Back to {displayTitle}
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mt-1">
              Episode {currentEpisode?.number || '-'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Sub/Dub Toggle */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">SUB</Label>
              <Switch checked={preferDub} onCheckedChange={handleDubToggle} />
              <Label className="text-sm text-muted-foreground">DUB</Label>
            </div>

            {/* Episode navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevEpisode}
                onClick={() => prevEpisode && navigate(`/watch/${animeId}/${prevEpisode.id}`)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEpisodeList(!showEpisodeList)}
              >
                <List className="w-4 h-4 mr-1" />
                Episodes
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextEpisode}
                onClick={() => nextEpisode && navigate(`/watch/${animeId}/${nextEpisode.id}`)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Episode List */}
        {showEpisodeList && (
          <div className="mt-6 bg-card rounded-xl p-4 border border-border max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-foreground mb-4">All Episodes</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => navigate(`/watch/${animeId}/${ep.id}`)}
                  className={`aspect-square flex items-center justify-center rounded-lg border transition-colors font-medium text-sm ${
                    ep.id === episodeId
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary border-border hover:border-primary'
                  }`}
                >
                  {ep.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alternative links */}
        <div className="mt-8 bg-card/50 rounded-xl p-4 border border-border">
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
    </Layout>
  );
}
