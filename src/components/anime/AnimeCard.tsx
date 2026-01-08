import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Calendar, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimeCardProps {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large?: string;
    extraLarge?: string;
  };
  averageScore?: number;
  episodes?: number;
  format?: string;
  status?: string;
  genres?: string[];
  season?: string;
  seasonYear?: number;
}

export function AnimeCard({ 
  id, 
  title, 
  coverImage, 
  averageScore, 
  episodes, 
  format,
  genres,
  season,
  seasonYear,
}: AnimeCardProps) {
  const displayTitle = title.english || title.romaji || title.native || 'Unknown';
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/anime/${id}`} className="block group">
        <div className="anime-card aspect-[3/4] relative">
          <img
            src={coverImage.extraLarge || coverImage.large}
            alt={displayTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          
          {/* Score badge */}
          {averageScore && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-ink/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-sm font-semibold text-foreground">{averageScore}%</span>
            </div>
          )}
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {displayTitle}
            </h3>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {format && (
                <span className="flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  {format}
                </span>
              )}
              {episodes && (
                <span>{episodes} EP</span>
              )}
              {seasonYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {seasonYear}
                </span>
              )}
            </div>

            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {genres.slice(0, 2).map(genre => (
                  <span 
                    key={genre}
                    className="text-xs px-2 py-0.5 bg-secondary/80 rounded-full text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary">
              <Play className="w-6 h-6 fill-primary-foreground" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
