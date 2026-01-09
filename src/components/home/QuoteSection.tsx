import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimeQuote {
  quote: string;
  character: string;
  anime: string;
}

// Fallback quotes in case API fails
const fallbackQuotes: AnimeQuote[] = [
  { quote: "The world is cruel, but also very beautiful.", character: "Mikasa Ackerman", anime: "Attack on Titan" },
  { quote: "People's lives don't end when they die. It ends when they lose faith.", character: "Itachi Uchiha", anime: "Naruto" },
  { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece" },
  { quote: "The only thing we're allowed to do is believe that we won't regret the choice we made.", character: "Levi Ackerman", anime: "Attack on Titan" },
  { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", character: "Kenshin Himura", anime: "Rurouni Kenshin" },
  { quote: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.", character: "Gildarts Clive", anime: "Fairy Tail" },
  { quote: "Even if we forget the faces of our friends, we will never forget the bonds that were carved into our souls.", character: "Otonashi", anime: "Angel Beats" },
  { quote: "Power comes in response to a need, not a desire.", character: "Goku", anime: "Dragon Ball Z" },
];

export function QuoteSection() {
  const [quote, setQuote] = useState<AnimeQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuote = async () => {
    setLoading(true);
    try {
      // Try multiple API endpoints
      const endpoints = [
        'https://animechan.io/api/v1/quotes/random',
        'https://animechan.xyz/api/random',
      ];
      
      let data = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, { 
            signal: AbortSignal.timeout(5000) 
          });
          
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (data) {
        setQuote({
          quote: data.data?.content || data.quote || data.content || '',
          character: data.data?.character?.name || data.character || 'Unknown',
          anime: data.data?.anime?.name || data.anime || 'Unknown',
        });
      } else {
        // Use fallback
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        setQuote(randomQuote);
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Use fallback on error
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
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
