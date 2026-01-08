import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Tv } from 'lucide-react';
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
        
        // Fetch days sequentially to avoid rate limiting
        for (const day of days) {
          try {
            const data = await fetchAiringSchedule(day);
            allSchedule[day] = data;
          } catch (error) {
            console.error(`Failed to fetch ${day} schedule:`, error);
            allSchedule[day] = [];
          }
        }
        
        setSchedule(allSchedule);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const formatTime = (broadcastInfo: any) => {
    if (!broadcastInfo?.time) return 'TBA';
    return broadcastInfo.time;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Airing Schedule</h1>
          </div>
          <p className="text-muted-foreground">See when your favorite anime airs</p>
        </motion.div>

        {/* Day tabs */}
        <Tabs value={activeDay} onValueChange={setActiveDay}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="mb-8 flex-wrap">
              {days.map((day, i) => (
                <TabsTrigger key={day} value={day} className="capitalize">
                  {dayLabels[i]}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {days.map((day) => (
            <TabsContent key={day} value={day}>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : schedule[day]?.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {schedule[day].map((anime) => (
                    <motion.div
                      key={anime.mal_id}
                      variants={item}
                      whileHover={{ scale: 1.01, x: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Link
                        to={`/anime/${anime.mal_id}`}
                        className="flex gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={anime.images?.jpg?.image_url}
                            alt={anime.title}
                            className="w-16 h-24 object-cover rounded-lg"
                          />
                          {anime.airing && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground line-clamp-1">{anime.title}</h3>
                          {anime.title_japanese && (
                            <p className="text-sm text-muted-foreground font-japanese line-clamp-1">
                              {anime.title_japanese}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(anime.broadcast)}
                            </span>
                            {anime.episodes && (
                              <span className="flex items-center gap-1">
                                <Tv className="w-4 h-4" />
                                {anime.episodes} eps
                              </span>
                            )}
                            {anime.score && (
                              <span className="flex items-center gap-1 text-primary">
                                <Star className="w-4 h-4 fill-current" />
                                {anime.score}
                              </span>
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
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-muted-foreground">No anime scheduled for this day</p>
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
