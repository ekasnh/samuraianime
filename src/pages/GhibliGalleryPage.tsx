import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, ChevronLeft, ChevronRight, Star, Clock, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface GhibliFilm {
  id: string;
  title: string;
  original_title: string;
  original_title_romanised: string;
  image: string;
  movie_banner: string;
  description: string;
  director: string;
  producer: string;
  release_date: string;
  running_time: string;
  rt_score: string;
}

export default function GhibliGalleryPage() {
  const [films, setFilms] = useState<GhibliFilm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState<GhibliFilm | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch('https://ghibliapi.vercel.app/films');
        const data = await response.json();
        setFilms(data);
        if (data.length > 0) setSelectedFilm(data[0]);
      } catch (error) {
        console.error('Failed to fetch Ghibli films:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Selected Film */}
        {selectedFilm && (
          <motion.div
            key={selectedFilm.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[60vh] overflow-hidden"
          >
            <img
              src={selectedFilm.movie_banner || selectedFilm.image}
              alt={selectedFilm.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <p className="text-primary font-japanese text-lg mb-2">{selectedFilm.original_title}</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{selectedFilm.title}</h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {selectedFilm.rt_score}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedFilm.running_time} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedFilm.release_date}
                  </span>
                </div>
                
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {selectedFilm.description}
                </p>
                
                <p className="text-sm">
                  <span className="text-muted-foreground">Director:</span> {selectedFilm.director}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Horizontal Scrolling Gallery */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Studio Ghibli Masterpieces</h2>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => scroll('left')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="flex-shrink-0 w-72 h-96 rounded-xl" />
                ))
              : films.map((film, index) => (
                  <motion.div
                    key={film.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    onClick={() => setSelectedFilm(film)}
                    className={`flex-shrink-0 w-72 cursor-pointer group ${
                      selectedFilm?.id === film.id ? 'ring-2 ring-primary rounded-xl' : ''
                    }`}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                      <img
                        src={film.image}
                        alt={film.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="font-semibold text-white">{film.title}</p>
                        <p className="text-sm text-white/70">{film.release_date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
