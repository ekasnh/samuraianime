# 🎴 Samurai Anime Platform

A **production-ready anime streaming and manga reading platform** with a **cinematic samurai-themed UI**, built using **only free APIs** and a **self-hosted Consumet backend**.

The **homepage design is locked** to the provided reference screenshot and must not be visually altered.

---

## 🚀 Features

### 🎬 Anime Streaming
- `.m3u8` streaming with **Hls.js + Plyr**
- Sub / Dub provider selector
- Auto-play next episode
- Resume playback
- Quality & speed controls
- Keyboard shortcuts & fullscreen
- **Continue Watching** section

### 📚 Manga Reading
- Manga book tiles (grid layout)
- Online reader (vertical scroll / slider)
- Chapter downloads (ZIP or images)
- Manga reading history
- **Continue Reading** section

### 🔍 Discovery & Personalization
- Advanced anime & manga search filters
- Personalized recommendations
- Favorites & watchlist
- Airing schedule with episode notifications
- Alternative anime streaming site links

### 🖼 Wallpapers
- Anime wallpapers from:
  - **Nekos.best**
  - **Waifu.pics**
- Preview and download support

### 🌙 UX & Reliability
- Persistent dark mode
- Retry + cache layer
- Handles backend cold starts gracefully
- Fully responsive UI

### 🍪 Compliance
- Integrated **TermsFeed Cookie Consent**
- Preferences center included

---

## 🧱 Tech Stack

### Frontend
- **React / Vue / Next.js**
- **Tailwind CSS**
- **Hls.js + Plyr**
- Fetch API / Axios
- `localStorage` (state, cache, history)

### Backend
- **Self-hosted Consumet API**
- Node.js (REST)

---

## 🔗 APIs Used (Free Only)

| API | Purpose |
|---|---|
| AniList (GraphQL) | Anime metadata, genres, recommendations |
| Jikan (REST) | Top anime, seasonal charts, airing schedules |
| Kitsu (JSON:API) | Metadata fallback |
| MangaDex (REST) | Manga catalog, chapters, images |
| Nekos.best | Anime wallpapers |
| Waifu.pics | Anime wallpapers |

❌ Wallhaven is **not used**

---

## 🔌 Consumet Backend Setup

**Base URL**
