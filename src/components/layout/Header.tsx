import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, BookMarked, Menu, X, ChevronDown, LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SnowToggle } from '@/components/ui/SnowToggle';
import { ImageSearch } from '@/components/search/ImageSearch';
import { EpisodeNotifications } from '@/components/notifications/EpisodeNotifications';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Anime', path: '/anime' },
  { name: 'Manga', path: '/manga' },
  { name: 'Schedule', path: '/schedule' },
  { name: 'Wallpapers', path: '/wallpapers' },
  { name: 'News', path: '/news' },
];

const toolsLinks = [
  { name: 'Ghibli Gallery', path: '/ghibli' },
  { name: 'Anime Trivia', path: '/trivia' },
  { name: 'Pokémon Lookup', path: '/pokemon' },
  { name: 'Dragon Ball', path: '/dragonball' },
  { name: 'Shikimori Tracker', path: '/shikimori' },
];

interface HeaderProps {
  showSnow: boolean;
  onToggleSnow: () => void;
}

export function Header({ showSnow, onToggleSnow }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="font-japanese font-bold text-primary-foreground text-sm">侍</span>
          </motion.div>
          <span className="font-bold text-lg tracking-wide text-foreground">SAMURAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {location.pathname === link.path && (
                <motion.span
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-secondary rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          ))}
          
          {/* Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tools
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              {toolsLinks.map(link => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link to={link.path} className="w-full cursor-pointer">
                    {link.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SnowToggle isActive={showSnow} onToggle={onToggleSnow} />
          <EpisodeNotifications />
          <ImageSearch />
          <Link to="/search" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Link>
          
          {user ? (
            <>
              <Link to="/favorites" className="p-2 hover:bg-secondary rounded-lg transition-colors hidden sm:block">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link to="/watchlist" className="p-2 hover:bg-secondary rounded-lg transition-colors hidden sm:block">
                <BookMarked className="w-5 h-5 text-muted-foreground" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors hidden sm:flex items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem className="text-muted-foreground text-xs">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="sm" className="hidden sm:flex">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass bg-background/95 border-b border-border/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Tools section */}
              <div className="pt-2 border-t border-border/50 mt-2">
                <p className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">Tools</p>
                {toolsLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 block"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-border/50 mt-2">
                {user ? (
                  <>
                    <Link to="/favorites" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </Button>
                    </Link>
                    <Link to="/watchlist" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookMarked className="w-4 h-4 mr-2" />
                        Watchlist
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
