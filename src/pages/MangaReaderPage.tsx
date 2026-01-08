import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, List, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchConsumetMangaInfo, fetchConsumetMangaChapters } from '@/lib/api';

interface Page {
  img: string;
  page: number;
}

export default function MangaReaderPage() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [pages, setPages] = useState<Page[]>([]);
  const [mangaInfo, setMangaInfo] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);

  useEffect(() => {
    const loadReader = async () => {
      if (!mangaId || !chapterId) return;
      setLoading(true);
      
      try {
        const [info, chapterData] = await Promise.all([
          fetchConsumetMangaInfo(mangaId),
          fetchConsumetMangaChapters(chapterId),
        ]);
        
        setMangaInfo(info);
        setChapters(info?.chapters || []);
        setPages(chapterData || []);
        
        // Save reading progress
        const progress = JSON.parse(localStorage.getItem('mangaProgress') || '{}');
        progress[mangaId] = { chapterId, page: 0, updatedAt: Date.now() };
        localStorage.setItem('mangaProgress', JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to load reader:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReader();
  }, [mangaId, chapterId]);

  const currentChapterIndex = chapters.findIndex((ch: any) => ch.id === chapterId);
  const prevChapter = chapters[currentChapterIndex + 1];
  const nextChapter = chapters[currentChapterIndex - 1];

  const goToChapter = (id: string) => {
    navigate(`/manga/${mangaId}/read/${id}`);
    setShowChapterList(false);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercent = scrollTop / (scrollHeight - clientHeight);
    const page = Math.floor(scrollPercent * pages.length);
    setCurrentPage(Math.min(page, pages.length - 1));
    
    // Update progress
    if (mangaId) {
      const progress = JSON.parse(localStorage.getItem('mangaProgress') || '{}');
      progress[mangaId] = { chapterId, page: currentPage, updatedAt: Date.now() };
      localStorage.setItem('mangaProgress', JSON.stringify(progress));
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const hideControls = () => {
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    hideControls();
    return () => clearTimeout(timeout);
  }, [showControls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading chapter...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black relative"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Top Controls */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: showControls ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/manga/${mangaId}`}>
              <Button variant="ghost" size="icon">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-sm">
              <p className="font-medium truncate max-w-[200px]">{mangaInfo?.title}</p>
              <p className="text-muted-foreground text-xs">
                Chapter {chapters.find((ch: any) => ch.id === chapterId)?.chapterNumber || '?'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(50, z - 25)); }}>
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(200, z + 25)); }}>
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowChapterList(!showChapterList); }}>
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Chapter List Sidebar */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: showChapterList ? 0 : 300 }}
        className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-card border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h3 className="font-semibold mb-4">Chapters</h3>
          <div className="space-y-1">
            {chapters.map((chapter: any) => (
              <button
                key={chapter.id}
                onClick={() => goToChapter(chapter.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  chapter.id === chapterId ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
              >
                Chapter {chapter.chapterNumber}
                {chapter.title && <span className="text-muted-foreground ml-2">- {chapter.title}</span>}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pages (Vertical Scroll) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-auto pt-16 pb-20"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto px-4" style={{ width: `${zoom}%`, maxWidth: '100%' }}>
          {pages.map((page, index) => (
            <motion.img
              key={index}
              src={page.img}
              alt={`Page ${page.page}`}
              className="w-full mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showControls ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-t border-border px-4 py-3"
      >
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            disabled={!prevChapter}
            onClick={(e) => { e.stopPropagation(); prevChapter && goToChapter(prevChapter.id); }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} / {pages.length}
          </span>
          
          <Button
            variant="outline"
            disabled={!nextChapter}
            onClick={(e) => { e.stopPropagation(); nextChapter && goToChapter(nextChapter.id); }}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
