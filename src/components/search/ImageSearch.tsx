import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchByImage } from '@/lib/api';
import { Link } from 'react-router-dom';

interface SearchResult {
  anilist: number;
  filename: string;
  episode: number | null;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}

export function ImageSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await searchImage(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await searchImage(file);
    }
  };

  const searchImage = async (file: File) => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const data = await searchByImage(file);
      if (data?.result?.length > 0) {
        setResults(data.result.slice(0, 5));
      } else {
        setError('No matching anime found');
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setResults([]);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        title="Search by image"
      >
        <Upload className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Image Search (Trace.moe)
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="mt-4"
                    >
                      Upload Different Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Drop an anime screenshot here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Powered by Trace.moe API
                    </p>
                  </>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-destructive text-center mt-4">{error}</p>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Results</h3>
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={`/anime/${result.anilist}`}
                        onClick={() => setIsOpen(false)}
                        className="flex gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <img
                          src={result.image}
                          alt=""
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.episode && `Episode ${result.episode} • `}
                            {formatTime(result.from)} - {formatTime(result.to)}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            {(result.similarity * 100).toFixed(1)}% match
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
