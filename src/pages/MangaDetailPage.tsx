import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, BookOpen, Bookmark, Calendar, ArrowLeft } from 'lucide-react';
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
        // Fetch manga details from MangaDex
        const response = await fetch(
          `https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
        );
        const data = await response.json();
        
        if (!data.data) throw new Error('Manga not found');
        
        const mangaData = data.data;
        const coverRel = mangaData.relationships?.find((r: any) => r.type === 'cover_art');
        const coverFile = coverRel?.attributes?.fileName;
        const coverUrl = coverFile 
          ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}.512.jpg`
          : '/placeholder.svg';
        
        const authors: string[] = mangaData.relationships
          ?.filter((r: any) => r.type === 'author' || r.type === 'artist')
          ?.map((r: any) => r.attributes?.name as string)
          ?.filter((name: string | undefined): name is string => Boolean(name)) || [];
        // Fetch chapters
        const chaptersRes = await fetch(
          `https://api.mangadex.org/manga/${mangaId}/feed?limit=100&translatedLanguage[]=en&order[chapter]=desc&includes[]=scanlation_group`
        );
        const chaptersData = await chaptersRes.json();
        
        const title = mangaData.attributes?.title?.en 
          || mangaData.attributes?.title?.['ja-ro'] 
          || Object.values(mangaData.attributes?.title || {})[0] 
          || 'Unknown';

        const description = mangaData.attributes?.description?.en 
          || Object.values(mangaData.attributes?.description || {})[0] 
          || 'No description available.';

        setManga({
          id: mangaId,
          title: title as string,
          description: description as string,
          image: coverUrl,
          status: mangaData.attributes?.status || 'Unknown',
          year: mangaData.attributes?.year,
          genres: mangaData.attributes?.tags
            ?.filter((t: any) => t.attributes?.group === 'genre')
            ?.map((t: any) => t.attributes?.name?.en)
            ?.filter(Boolean) || [],
          authors: [...new Set(authors)],
          chapters: (chaptersData.data || []).map((ch: any) => ({
            id: ch.id,
            chapter: ch.attributes?.chapter || '0',
            title: ch.attributes?.title,
            updatedAt: ch.attributes?.updatedAt,
          })),
        });

        // Check if bookmarked
        if (user) {
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('manga_id', mangaId)
            .maybeSingle();
          
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
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
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
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full capitalize">
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
            <p className="text-muted-foreground leading-relaxed mb-8 line-clamp-6">{manga.description}</p>

            {/* Chapters */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Chapters ({manga.chapters.length})
              </h2>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {manga.chapters.length > 0 ? (
                    manga.chapters.map((chapter) => (
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
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No chapters available in English</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
