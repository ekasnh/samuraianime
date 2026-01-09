import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, BookOpen, Heart, Bookmark, Calendar, Star, Loader2, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MangaDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  year?: number;
  genres: string[];
  authors: string[];
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  chapter: string;
  title?: string;
  updatedAt?: string;
}

export default function MangaDetailPage() {
  const { mangaId } = useParams();
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMangaDetail = async () => {
      if (!mangaId) return;
      
      setLoading(true);
      try {
        // Fetch manga details from ComicK API
        const response = await fetch(`https://api.comick.io/comic/${mangaId}`);
        const data = await response.json();
        
        // Fetch chapters
        const chaptersRes = await fetch(`https://api.comick.io/comic/${mangaId}/chapters?lang=en&limit=100`);
        const chaptersData = await chaptersRes.json();
        
        const coverUrl = data.comic?.md_covers?.[0]?.b2key 
          ? `https://meo.comick.pictures/${data.comic.md_covers[0].b2key}`
          : '/placeholder.svg';

        setManga({
          id: data.comic?.hid || mangaId,
          title: data.comic?.title || 'Unknown',
          description: data.comic?.desc || 'No description available.',
          image: coverUrl,
          status: data.comic?.status === 1 ? 'Ongoing' : data.comic?.status === 2 ? 'Completed' : 'Unknown',
          year: data.comic?.year,
          genres: data.comic?.md_comic_md_genres?.map((g: any) => g.md_genres?.name).filter(Boolean) || [],
          authors: data.authors?.map((a: any) => a.name) || [],
          chapters: chaptersData.chapters?.map((ch: any) => ({
            id: ch.hid,
            chapter: ch.chap || '0',
            title: ch.title,
            updatedAt: ch.updated_at,
          })) || [],
        });

        // Check if bookmarked
        if (user) {
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('manga_id', mangaId)
            .single();
          
          setIsBookmarked(!!bookmark);
        }
      } catch (error) {
        console.error('Failed to fetch manga details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaDetail();
  }, [mangaId, user]);

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark manga');
      return;
    }

    if (!manga) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('manga_id', manga.id);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            manga_id: manga.id,
            manga_title: manga.title,
            manga_image: manga.image,
          });
        setIsBookmarked(true);
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-72 aspect-[3/4] rounded-xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!manga) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Book className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Manga Not Found</h1>
          <p className="text-muted-foreground">The manga you're looking for doesn't exist.</p>
          <Link to="/manga">
            <Button className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manga
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/manga" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manga
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72 flex-shrink-0"
          >
            <img
              src={manga.image}
              alt={manga.title}
              className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg"
            />
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleBookmark} variant={isBookmarked ? 'default' : 'outline'} className="flex-1">
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{manga.title}</h1>
            
            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                {manga.status}
              </span>
              {manga.year && (
                <span className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {manga.year}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {manga.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Authors */}
            {manga.authors.length > 0 && (
              <p className="text-muted-foreground mb-4">
                By: <span className="text-foreground">{manga.authors.join(', ')}</span>
              </p>
            )}

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">{manga.description}</p>

            {/* Chapters */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Chapters ({manga.chapters.length})
              </h2>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {manga.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      to={`/manga/${manga.id}/read/${chapter.id}`}
                      className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          Chapter {chapter.chapter}
                          {chapter.title && ` - ${chapter.title}`}
                        </span>
                        {chapter.updatedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(chapter.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
