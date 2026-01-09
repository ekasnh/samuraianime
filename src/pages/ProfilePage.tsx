import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, Loader2, Heart, BookMarked, Play, Book } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

interface Stats {
  favorites: number;
  bookmarks: number;
  episodesWatched: number;
  chaptersRead: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ username: null, avatar_url: null });
  const [stats, setStats] = useState<Stats>({ favorites: 0, bookmarks: 0, episodesWatched: 0, chaptersRead: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user, authLoading, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile({ username: data.username, avatar_url: data.avatar_url });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get favorites count
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get bookmarks count
      const { count: bookmarkCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get local stats
      const watchProgress = JSON.parse(localStorage.getItem('watchProgress') || '[]');
      const readProgress = JSON.parse(localStorage.getItem('readingProgress') || '[]');

      setStats({
        favorites: favCount || 0,
        bookmarks: bookmarkCount || 0,
        episodesWatched: watchProgress.length,
        chaptersRead: readProgress.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: profile.username, 
          avatar_url: profile.avatar_url 
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const syncLocalData = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      // Sync favorites from localStorage
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (localFavorites.length > 0) {
        for (const animeId of localFavorites) {
          const { error } = await supabase
            .from('favorites')
            .upsert({ 
              user_id: user.id, 
              anime_id: animeId,
              anime_title: `Anime #${animeId}`,
            }, { onConflict: 'user_id,anime_id' });
          
          if (error) console.error('Error syncing favorite:', error);
        }
      }

      // Sync watchlist from localStorage
      const localWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      // Note: You could add a watchlist table similarly

      toast.success('Local data synced to cloud!');
      loadStats();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your account and view stats</p>
          </div>

          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  {profile.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-2 bg-secondary rounded-full border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                <Camera className="w-5 h-5 text-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{user.email}</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <BookMarked className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.bookmarks}</p>
              <p className="text-xs text-muted-foreground">Bookmarks</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Play className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.episodesWatched}</p>
              <p className="text-xs text-muted-foreground">Episodes</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Book className="w-6 h-6 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.chaptersRead}</p>
              <p className="text-xs text-muted-foreground">Chapters</p>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={profile.username || ''}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile
              </Button>
              <Button variant="outline" onClick={syncLocalData} disabled={syncing}>
                {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sync Local Data
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
