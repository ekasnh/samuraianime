// API Configuration and utilities

const CONSUMET_BASE = 'https://my-anime-api-backend.onrender.com';
const ANILIST_API = 'https://graphql.anilist.co';
const JIKAN_API = 'https://api.jikan.moe/v4';
const MANGADEX_API = 'https://api.mangadex.org';
const NEKOS_API = 'https://nekos.best/api/v2';
const WAIFU_API = 'https://api.waifu.pics';

// Retry with exponential backoff
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // If server is waking up (cold start), wait longer
      if (response.status === 503 || response.status === 502) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 2000));
        continue;
      }
      
      if (!response.ok && i === retries - 1) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}

// Cache utilities
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage full, clear old items
    clearOldCache();
  }
}

function clearOldCache(): void {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('anime_') || key.startsWith('manga_')) {
      localStorage.removeItem(key);
    }
  }
}

// AniList GraphQL queries
const TRENDING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      bannerImage
      description
      genres
      averageScore
      popularity
      episodes
      status
      season
      seasonYear
      format
      studios { nodes { name } }
      nextAiringEpisode { episode airingAt }
    }
  }
}`;

const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $genre: String, $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, search: $search, genre: $genre, seasonYear: $year, season: $season, format: $format, status: $status, sort: $sort) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      bannerImage
      description
      genres
      averageScore
      popularity
      episodes
      status
      season
      seasonYear
      format
      studios { nodes { name } }
    }
  }
}`;

const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large extraLarge }
    bannerImage
    description
    genres
    averageScore
    popularity
    episodes
    duration
    status
    season
    seasonYear
    format
    source
    studios { nodes { name isAnimationStudio } }
    relations { edges { node { id title { romaji } coverImage { large } type format } relationType } }
    recommendations { nodes { mediaRecommendation { id title { romaji } coverImage { large } averageScore } } }
    tags { name rank }
    nextAiringEpisode { episode airingAt }
    trailer { id site }
    characters { nodes { id name { full } image { large } } }
  }
}`;

// API Functions
export async function fetchTrendingAnime(page = 1, perPage = 20) {
  const cacheKey = `anime_trending_${page}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: TRENDING_QUERY,
      variables: { page, perPage }
    })
  });

  const data = await response.json();
  const result = data.data?.Page?.media || [];
  setCache(cacheKey, result);
  return result;
}

export async function searchAnime(params: {
  search?: string;
  genre?: string;
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: string[];
  page?: number;
  perPage?: number;
}) {
  const response = await fetchWithRetry(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: {
        ...params,
        page: params.page || 1,
        perPage: params.perPage || 20,
        sort: params.sort || ['POPULARITY_DESC']
      }
    })
  });

  const data = await response.json();
  return data.data?.Page;
}

export async function fetchAnimeDetails(id: number) {
  const cacheKey = `anime_details_${id}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: ANIME_DETAILS_QUERY,
      variables: { id }
    })
  });

  const data = await response.json();
  const result = data.data?.Media;
  if (result) setCache(cacheKey, result);
  return result;
}

// Consumet API for streaming
export async function searchGogoanime(title: string) {
  const cacheKey = `gogo_search_${title.toLowerCase().replace(/\s+/g, '-')}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const encoded = encodeURIComponent(title);
  const response = await fetchWithRetry(`${CONSUMET_BASE}/anime/gogoanime/${encoded}`);
  const data = await response.json();
  
  if (data?.results?.length) {
    setCache(cacheKey, data.results);
  }
  return data?.results || [];
}

export async function fetchGogoanimeInfo(gogoanimeId: string, dub = false) {
  const id = dub && !gogoanimeId.endsWith('-dub') ? `${gogoanimeId}-dub` : gogoanimeId;
  const cacheKey = `gogo_info_${id}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(`${CONSUMET_BASE}/anime/gogoanime/info/${id}`);
  const data = await response.json();
  
  if (data) setCache(cacheKey, data);
  return data;
}

export async function fetchEpisodeStreams(episodeId: string) {
  const response = await fetchWithRetry(`${CONSUMET_BASE}/anime/gogoanime/watch/${episodeId}`);
  return response.json();
}

// Jikan API for schedules
export async function fetchAiringSchedule(day?: string) {
  const endpoint = day 
    ? `${JIKAN_API}/schedules/${day}`
    : `${JIKAN_API}/schedules`;
  
  const response = await fetchWithRetry(endpoint);
  const data = await response.json();
  return data?.data || [];
}

export async function fetchTopAnime(filter = 'airing', page = 1) {
  const response = await fetchWithRetry(`${JIKAN_API}/top/anime?filter=${filter}&page=${page}`);
  const data = await response.json();
  return data?.data || [];
}

// MangaDex API
export async function searchManga(params: {
  title?: string;
  limit?: number;
  offset?: number;
  includedTags?: string[];
  status?: string[];
  year?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.title) queryParams.append('title', params.title);
  queryParams.append('limit', String(params.limit || 20));
  queryParams.append('offset', String(params.offset || 0));
  queryParams.append('includes[]', 'cover_art');
  queryParams.append('includes[]', 'author');
  queryParams.append('order[relevance]', 'desc');

  const response = await fetchWithRetry(`${MANGADEX_API}/manga?${queryParams}`);
  return response.json();
}

export async function fetchMangaDetails(id: string) {
  const response = await fetchWithRetry(
    `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`
  );
  return response.json();
}

export async function fetchMangaChapters(mangaId: string, limit = 100, offset = 0) {
  const response = await fetchWithRetry(
    `${MANGADEX_API}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=en&order[chapter]=asc`
  );
  return response.json();
}

export async function fetchChapterPages(chapterId: string) {
  const response = await fetchWithRetry(`${MANGADEX_API}/at-home/server/${chapterId}`);
  return response.json();
}

// Wallpaper APIs
export async function fetchWallpapers(category = 'neko', amount = 20) {
  try {
    const response = await fetchWithRetry(`${NEKOS_API}/${category}?amount=${amount}`);
    const data = await response.json();
    return data?.results || [];
  } catch {
    // Fallback to waifu.pics
    const responses = await Promise.all(
      Array(amount).fill(null).map(() => 
        fetchWithRetry(`${WAIFU_API}/sfw/${category}`).then(r => r.json())
      )
    );
    return responses.map(r => ({ url: r.url }));
  }
}

// Local storage utilities for user data
export function getWatchlist(): number[] {
  try {
    return JSON.parse(localStorage.getItem('watchlist') || '[]');
  } catch {
    return [];
  }
}

export function addToWatchlist(animeId: number): void {
  const list = getWatchlist();
  if (!list.includes(animeId)) {
    list.push(animeId);
    localStorage.setItem('watchlist', JSON.stringify(list));
  }
}

export function removeFromWatchlist(animeId: number): void {
  const list = getWatchlist().filter(id => id !== animeId);
  localStorage.setItem('watchlist', JSON.stringify(list));
}

export function getFavorites(): number[] {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
}

export function addToFavorites(animeId: number): void {
  const list = getFavorites();
  if (!list.includes(animeId)) {
    list.push(animeId);
    localStorage.setItem('favorites', JSON.stringify(list));
  }
}

export function removeFromFavorites(animeId: number): void {
  const list = getFavorites().filter(id => id !== animeId);
  localStorage.setItem('favorites', JSON.stringify(list));
}

export interface WatchProgress {
  animeId: number;
  episodeId: string;
  episodeNumber: number;
  timestamp: number;
  duration: number;
  updatedAt: number;
}

export function getWatchProgress(): WatchProgress[] {
  try {
    return JSON.parse(localStorage.getItem('watchProgress') || '[]');
  } catch {
    return [];
  }
}

export function updateWatchProgress(progress: WatchProgress): void {
  const list = getWatchProgress().filter(p => p.episodeId !== progress.episodeId);
  list.unshift({ ...progress, updatedAt: Date.now() });
  localStorage.setItem('watchProgress', JSON.stringify(list.slice(0, 50)));
}

export function getPreferredDub(): boolean {
  return localStorage.getItem('preferDub') === 'true';
}

export function setPreferredDub(dub: boolean): void {
  localStorage.setItem('preferDub', String(dub));
}
