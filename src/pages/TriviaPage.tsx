import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

interface AnimeFact {
  id: number;
  fact: string;
}

export default function TriviaPage() {
  const [facts, setFacts] = useState<AnimeFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const animeFacts = [
    { id: 1, fact: "One Piece has been running since 1997 and has over 1000 episodes, making it one of the longest-running anime series." },
    { id: 2, fact: "Studio Ghibli's 'Spirited Away' won the Academy Award for Best Animated Feature in 2003, the only anime to do so." },
    { id: 3, fact: "Dragon Ball Z's famous 'Over 9000' scene was actually a mistranslation - the original power level was 8000." },
    { id: 4, fact: "Naruto's creator, Masashi Kishimoto, originally envisioned Naruto as a cooking manga before changing it to ninjas." },
    { id: 5, fact: "Attack on Titan's creator, Hajime Isayama, was inspired by a drunk customer at an internet cafe who grabbed him." },
    { id: 6, fact: "The 'JoJo pose' in JoJo's Bizarre Adventure is inspired by Italian sculpture and Renaissance art." },
    { id: 7, fact: "Death Note was banned in China because students were found writing names of teachers in replica notebooks." },
    { id: 8, fact: "Pokémon's Pikachu was originally designed to have a second evolution called 'Gorochu' with fangs and horns." },
    { id: 9, fact: "My Hero Academia's author, Kohei Horikoshi, drew the entire series while battling severe back problems." },
    { id: 10, fact: "The word 'anime' is actually the Japanese abbreviation of 'animation' borrowed from English." },
    { id: 11, fact: "Demon Slayer: Mugen Train became the highest-grossing film in Japanese box office history in 2020." },
    { id: 12, fact: "Sailor Moon is credited with reviving the magical girl genre and inspiring countless similar series." },
    { id: 13, fact: "Cowboy Bebop's soundtrack is so iconic that it's studied in music schools as an example of jazz fusion." },
    { id: 14, fact: "Fullmetal Alchemist's automail technology was inspired by real prosthetic limb research." },
    { id: 15, fact: "The creator of Bleach, Tite Kubo, designs all character outfits himself and considers fashion very important." },
  ];

  useEffect(() => {
    // Shuffle facts
    const shuffled = [...animeFacts].sort(() => Math.random() - 0.5);
    setFacts(shuffled);
    setLoading(false);
  }, []);

  const nextFact = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, 200);
  };

  const currentFact = facts[currentIndex];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Anime Trivia</h1>
          </div>
          <p className="text-muted-foreground">Tap the card to reveal fun facts about anime!</p>
        </motion.div>

        {/* Trivia Card */}
        <div className="flex justify-center items-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {!loading && currentFact && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md cursor-pointer perspective-1000"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full h-80 preserve-3d"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of card */}
                  <div
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary/20 via-card to-secondary/20 border border-border rounded-2xl p-8 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Sparkles className="w-16 h-16 text-primary mb-6 animate-pulse" />
                    <p className="text-xl font-semibold text-center">Tap to Flip</p>
                    <p className="text-muted-foreground text-center mt-2">
                      Discover a fun anime fact!
                    </p>
                    <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                      {currentIndex + 1} / {facts.length}
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-secondary via-card to-primary/10 border border-border rounded-2xl p-8 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Lightbulb className="w-10 h-10 text-primary mb-4" />
                    <p className="text-lg text-center leading-relaxed">
                      {currentFact.fact}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <div className="flex justify-center mt-8">
          <Button onClick={nextFact} size="lg" className="gap-2">
            <RefreshCw className="w-5 h-5" />
            Next Fact
          </Button>
        </div>

        {/* All Facts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">All Trivia Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facts.map((fact, index) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground line-clamp-3">{fact.fact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
