import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchWallpapers } from '@/lib/api';

const categories = [
  { id: 'neko', label: 'Neko' },
  { id: 'waifu', label: 'Waifu' },
  { id: 'kitsune', label: 'Kitsune' },
  { id: 'husbando', label: 'Husbando' },
];

export default function WallpapersPage() {
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('neko');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);

  const loadWallpapers = async (category: string) => {
    setLoading(true);
    try {
      const data = await fetchWallpapers(category, 20);
      setWallpapers(data);
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallpapers(activeCategory);
  }, [activeCategory]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `wallpaper-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Image className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Wallpapers</h1>
          </div>
          <p className="text-muted-foreground">Beautiful anime wallpapers for your devices</p>
        </div>

        {/* Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <div className="flex items-center justify-between mb-8">
            <TabsList>
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
              ))}
            </TabsList>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadWallpapers(activeCategory)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))
                ) : (
                  wallpapers.map((wp, index) => (
                    <motion.div
                      key={wp.url || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => setSelectedWallpaper(wp.url || wp.anime_name)}
                    >
                      <img
                        src={wp.url || wp.anime_name}
                        alt="Wallpaper"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="icon"
                          className="w-12 h-12 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(wp.url || wp.anime_name);
                          }}
                        >
                          <Download className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Lightbox */}
        {selectedWallpaper && (
          <div
            className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
            onClick={() => setSelectedWallpaper(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={selectedWallpaper}
                alt="Wallpaper preview"
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
              />
              <Button
                className="absolute bottom-4 right-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedWallpaper);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
