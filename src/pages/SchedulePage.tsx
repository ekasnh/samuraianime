import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAiringSchedule } from '@/lib/api';
import { Link } from 'react-router-dom';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().getDay();
    return days[(today + 6) % 7]; // Convert Sunday=0 to our format
  });

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const allSchedule: Record<string, any[]> = {};
        
        // Fetch all days in parallel
        await Promise.all(
          days.map(async (day) => {
            const data = await fetchAiringSchedule(day);
            allSchedule[day] = data;
          })
        );
        
        setSchedule(allSchedule);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Airing Schedule</h1>
          </div>
          <p className="text-muted-foreground">See when your favorite anime airs</p>
        </div>

        {/* Day tabs */}
        <Tabs value={activeDay} onValueChange={setActiveDay}>
          <TabsList className="mb-8 flex-wrap">
            {days.map((day, i) => (
              <TabsTrigger key={day} value={day} className="capitalize">
                {dayLabels[i]}
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map((day) => (
            <TabsContent key={day} value={day}>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : schedule[day]?.length > 0 ? (
                <div className="space-y-4">
                  {schedule[day].map((anime, index) => (
                    <motion.div
                      key={anime.mal_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Link
                        to={`/anime/${anime.mal_id}`}
                        className="flex gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={anime.images?.jpg?.image_url}
                          alt={anime.title}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground line-clamp-1">{anime.title}</h3>
                          {anime.title_japanese && (
                            <p className="text-sm text-muted-foreground font-japanese line-clamp-1">
                              {anime.title_japanese}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(anime.broadcast?.time)}
                            </span>
                            {anime.episodes && (
                              <span>{anime.episodes} episodes</span>
                            )}
                            {anime.score && (
                              <span>★ {anime.score}</span>
                            )}
                          </div>
                          {anime.genres?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {anime.genres.slice(0, 3).map((genre: any) => (
                                <span
                                  key={genre.mal_id}
                                  className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
                                >
                                  {genre.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No anime scheduled for this day</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
