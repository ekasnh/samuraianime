import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AnimePage from "./pages/AnimePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import WatchPage from "./pages/WatchPage";
import MangaPage from "./pages/MangaPage";
import MangaDetailPage from "./pages/MangaDetailPage";
import MangaReaderPage from "./pages/MangaReaderPage";
import SchedulePage from "./pages/SchedulePage";
import WallpapersPage from "./pages/WallpapersPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SearchPage from "./pages/SearchPage";
import NewsPage from "./pages/NewsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import GhibliGalleryPage from "./pages/GhibliGalleryPage";
import TriviaPage from "./pages/TriviaPage";
import PokemonLookupPage from "./pages/PokemonLookupPage";
import DragonBallPage from "./pages/DragonBallPage";
import ShikimoriPage from "./pages/ShikimoriPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/watch/:animeId/:episodeId" element={<WatchPage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/manga/:mangaId" element={<MangaDetailPage />} />
            <Route path="/manga/:mangaId/read/:chapterId" element={<MangaReaderPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/wallpapers" element={<WallpapersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ghibli" element={<GhibliGalleryPage />} />
            <Route path="/trivia" element={<TriviaPage />} />
            <Route path="/pokemon" element={<PokemonLookupPage />} />
            <Route path="/dragonball" element={<DragonBallPage />} />
            <Route path="/shikimori" element={<ShikimoriPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
