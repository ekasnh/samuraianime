import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAnimeQuote } from '@/lib/api';

interface AnimeQuote {
  quote: string;
  character: string;
  anime: string;
}

export function QuoteSection() {
  const [quote, setQuote] = useState<AnimeQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const data = await fetchAnimeQuote();
      setQuote(data);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Quote className="w-12 h-12 mx-auto text-primary/50 mb-6" />
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-4" />
              <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-1/4 mx-auto" />
            </div>
          ) : quote ? (
            <motion.div
              key={quote.quote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <blockquote className="text-xl md:text-2xl text-foreground italic leading-relaxed mb-6">
                "{quote.quote}"
              </blockquote>
              <p className="text-muted-foreground">
                — <span className="text-primary font-medium">{quote.character}</span> from{' '}
                <span className="font-medium">{quote.anime}</span>
              </p>
            </motion.div>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={loadQuote}
            disabled={loading}
            className="mt-6"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            New Quote
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
