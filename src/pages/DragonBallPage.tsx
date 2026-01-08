import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Users, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface DBCharacter {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  description: string;
  image: string;
  affiliation: string;
  originPlanet?: { name: string };
  transformations?: { id: number; name: string; image: string; ki: string }[];
}

export default function DragonBallPage() {
  const [characters, setCharacters] = useState<DBCharacter[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<DBCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<DBCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('https://dragonball-api.com/api/characters?limit=50');
        const data = await response.json();
        setCharacters(data.items || []);
        setFilteredCharacters(data.items || []);
      } catch (error) {
        console.error('Failed to fetch Dragon Ball characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const fetchCharacterDetails = async (id: number) => {
    try {
      const response = await fetch(`https://dragonball-api.com/api/characters/${id}`);
      const data = await response.json();
      setSelectedCharacter(data);
    } catch (error) {
      console.error('Failed to fetch character details:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCharacters(characters);
      return;
    }
    const filtered = characters.filter((char) =>
      char.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCharacters(filtered);
  };

  const formatKi = (ki: string) => {
    if (!ki) return 'Unknown';
    const num = parseInt(ki.replace(/[^0-9]/g, ''));
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return ki;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Dragon Ball Universe</h1>
          <p className="text-muted-foreground">Explore characters, power levels & transformations</p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Characters</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))
                : filteredCharacters.map((character, index) => (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => fetchCharacterDetails(character.id)}
                      className={`cursor-pointer bg-card border rounded-xl overflow-hidden transition-all ${
                        selectedCharacter?.id === character.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-square bg-gradient-to-b from-primary/10 to-transparent p-2">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="font-medium text-sm truncate">{character.name}</p>
                        <p className="text-xs text-muted-foreground">{character.race}</p>
                      </div>
                    </motion.div>
                  ))}
            </div>
          </div>

          {/* Character Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedCharacter ? (
                <motion.div
                  key={selectedCharacter.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <div className="relative h-64 bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center">
                    <img
                      src={selectedCharacter.image}
                      alt={selectedCharacter.name}
                      className="h-full object-contain"
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedCharacter.name}</h2>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-secondary rounded text-xs">{selectedCharacter.race}</span>
                      <span className="px-2 py-1 bg-secondary rounded text-xs capitalize">{selectedCharacter.gender}</span>
                      {selectedCharacter.affiliation && (
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                          {selectedCharacter.affiliation}
                        </span>
                      )}
                    </div>

                    <Tabs defaultValue="stats">
                      <TabsList className="w-full">
                        <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
                        <TabsTrigger value="transforms" className="flex-1">Transforms</TabsTrigger>
                      </TabsList>

                      <TabsContent value="stats" className="mt-4 space-y-4">
                        <div className="bg-secondary/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">Base Ki</span>
                          </div>
                          <p className="text-2xl font-bold">{formatKi(selectedCharacter.ki)}</p>
                        </div>

                        <div className="bg-secondary/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Max Ki</span>
                          </div>
                          <p className="text-2xl font-bold">{formatKi(selectedCharacter.maxKi)}</p>
                        </div>

                        {selectedCharacter.originPlanet && (
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Origin Planet</p>
                            <p className="font-medium">{selectedCharacter.originPlanet.name}</p>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedCharacter.description}
                        </p>
                      </TabsContent>

                      <TabsContent value="transforms" className="mt-4">
                        {selectedCharacter.transformations && selectedCharacter.transformations.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCharacter.transformations.map((transform) => (
                              <div
                                key={transform.id}
                                className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
                              >
                                <img
                                  src={transform.image}
                                  alt={transform.name}
                                  className="w-12 h-12 object-contain"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{transform.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {formatKi(transform.ki)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No transformations available
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Select a character to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
