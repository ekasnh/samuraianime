import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWatchlist, fetchAnimeDetails, fetchAiringSchedule } from '@/lib/api';
import { Link } from 'react-router-dom';

interface Notification {
  animeId: number;
  title: string;
  episode: number;
  airingAt: number;
  image: string;
}

export function EpisodeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      const watchlist = getWatchlist();
      if (watchlist.length === 0) return;

      setLoading(true);
      try {
        // Fetch details for watchlist items
        const animeDetails = await Promise.all(
          watchlist.slice(0, 10).map(id => fetchAnimeDetails(id))
        );

        const newNotifications: Notification[] = [];
        const now = Date.now();

        animeDetails.forEach((anime) => {
          if (anime?.nextAiringEpisode) {
            const airingTime = anime.nextAiringEpisode.airingAt * 1000;
            // Show if airing within next 24 hours or aired in last 2 hours
            if (airingTime > now - 2 * 60 * 60 * 1000 && airingTime < now + 24 * 60 * 60 * 1000) {
              newNotifications.push({
                animeId: anime.id,
                title: anime.title?.romaji || anime.title?.english || 'Unknown',
                episode: anime.nextAiringEpisode.episode,
                airingAt: airingTime,
                image: anime.coverImage?.large || '',
              });
            }
          }
        });

        // Sort by airing time
        newNotifications.sort((a, b) => a.airingAt - b.airingAt);
        setNotifications(newNotifications);

        // Store in localStorage
        localStorage.setItem('episodeNotifications', JSON.stringify({
          data: newNotifications,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Failed to check notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check cache first
    const cached = localStorage.getItem('episodeNotifications');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 min cache
        setNotifications(data);
        return;
      }
    }

    checkNotifications();
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      return `Aired ${hours}h ago`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  const unreadCount = notifications.filter(n => n.airingAt < Date.now()).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Episode Notifications</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming episodes</p>
                    <p className="text-xs mt-1">Add anime to your watchlist to get notified</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Link
                      key={`${notification.animeId}-${notification.episode}`}
                      to={`/anime/${notification.animeId}`}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                    >
                      <img
                        src={notification.image}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Play className="w-3 h-3" />
                          Episode {notification.episode}
                        </p>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${
                          notification.airingAt < Date.now() ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.airingAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
