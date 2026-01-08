import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Shield, Heart, Swords, Wind, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-stone-500',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
};

const statIcons: Record<string, any> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  'special-attack': Zap,
  'special-defense': Shield,
  speed: Wind,
};

export default function PokemonLookupPage() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pokemonSearches') || '[]');
    } catch {
      return [];
    }
  });

  const searchPokemon = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase().trim()}`
      );
      
      if (!response.ok) throw new Error('Pokémon not found');
      
      const data = await response.json();
      setPokemon(data);
      
      // Save to recent searches
      const searches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(searches);
      localStorage.setItem('pokemonSearches', JSON.stringify(searches));
    } catch {
      setError('Pokémon not found. Try a different name or ID!');
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon(query);
  };

  const getStatColor = (value: number) => {
    if (value < 50) return 'bg-red-500';
    if (value < 80) return 'bg-yellow-500';
    if (value < 100) return 'bg-green-500';
    return 'bg-primary';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Pokémon Lookup</h1>
          <p className="text-muted-foreground">Search for any Pokémon to view their stats</p>
        </motion.div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Pokémon name or ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !pokemon && (
          <div className="max-w-md mx-auto mb-8">
            <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <Button
                  key={search}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery(search);
                    searchPokemon(search);
                  }}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-destructive mb-8"
          >
            {error}
          </motion.p>
        )}

        {/* Pokemon Card */}
        <AnimatePresence mode="wait">
          {pokemon && (
            <motion.div
              key={pokemon.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <motion.img
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                    alt={pokemon.name}
                    className="h-48 object-contain drop-shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 text-4xl font-bold text-foreground/10">
                    #{String(pokemon.id).padStart(3, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name & Types */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold capitalize mb-3">{pokemon.name}</h2>
                    <div className="flex justify-center gap-2">
                      {pokemon.types.map(({ type }) => (
                        <span
                          key={type.name}
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium capitalize ${
                            typeColors[type.name] || 'bg-gray-500'
                          }`}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Physical Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{pokemon.height / 10}m</p>
                      <p className="text-sm text-muted-foreground">Height</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{pokemon.weight / 10}kg</p>
                      <p className="text-sm text-muted-foreground">Weight</p>
                    </div>
                  </div>

                  {/* Base Stats */}
                  <h3 className="font-semibold mb-4">Base Stats</h3>
                  <div className="space-y-3">
                    {pokemon.stats.map(({ base_stat, stat }) => {
                      const Icon = statIcons[stat.name] || Zap;
                      return (
                        <div key={stat.name} className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="w-24 text-sm capitalize text-muted-foreground">
                            {stat.name.replace('-', ' ')}
                          </span>
                          <span className="w-10 text-sm font-medium">{base_stat}</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (base_stat / 150) * 100)}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={`h-full rounded-full ${getStatColor(base_stat)}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Abilities */}
                  <h3 className="font-semibold mt-6 mb-3">Abilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map(({ ability, is_hidden }) => (
                      <span
                        key={ability.name}
                        className={`px-3 py-1 rounded-full text-sm capitalize ${
                          is_hidden
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-secondary'
                        }`}
                      >
                        {ability.name.replace('-', ' ')}
                        {is_hidden && ' (Hidden)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular Pokemon */}
        {!pokemon && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-center mb-6">Popular Pokémon</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['pikachu', 'charizard', 'mewtwo', 'eevee', 'gengar', 'lucario'].map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  onClick={() => {
                    setQuery(name);
                    searchPokemon(name);
                  }}
                  className="capitalize"
                >
                  {name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
