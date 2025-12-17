# Movie Explorer

Movie Explorer is a lightweight web application that allows users to search for movies, view detailed information, and save their favorite movies with a personal rating and note.  
This project was built as a take-home assignment with a focus on **core functionality, clean architecture, and clear technical tradeoffs**, rather than over-engineering.

---

## 🔗 Live Links

- **Live App (Vercel):** [https://movieexplorer-beta.vercel.app](https://movieexplorer-beta.vercel.app/)
- **GitHub Repository:** https://github.com/AishwaryaBhanage/movie_explorer

---

## Features

### Search
- Search movies by **title**
- Displays results with:
  - Movie poster
  - Title
  - Release year
  - Short description (overview snippet)
- Graceful handling of:
  - Empty input
  - No results found
  - Network / API errors

---

### Movie Details
- Click **Details** to open a modal view
- Shows:
  - Large poster
  - Full overview
  - Release year
  - Runtime (if available)
- Modal keeps the user in context without page navigation

---

### Favorites
- Add or remove movies from a **Favorites** list
- Each favorite supports:
  - Personal rating (**1–5**)
  - Optional note/comment
- Favorites are displayed separately for quick access

---

### Persistence
- Favorites are stored in **LocalStorage**
- Data persists across page refreshes
- No authentication or backend database required for baseline functionality

---

### Secure API Integration
- Uses **TMDB (The Movie Database)** as the data source
- API key is:
  - Stored **server-side only**
  - Accessed via **Next.js API routes**
  - Never exposed in client-side code

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Custom CSS (no heavy UI framework)

### Backend
- Next.js API Routes
  - `/api/tmdb/search`
  - `/api/tmdb/movie/[id]`

### State & Data
- React hooks (`useState`, `useEffect`, `useMemo`)
- LocalStorage for persistence

### Deployment
- Vercel

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- TMDB API key

---

1️⃣ Clone the repository
```bash
git clone https://github.com/AishwaryaBhanage/MovieExplorer.git
cd MovieExplorer

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env.local file in the project root:

TMDB_API_KEY=YOUR_TMDB_API_KEY

.env.local is ignored by Git and should not be committed.

4️⃣ Run the development server
npm run dev

Open:
http://localhost:3000

☁️ Deployment (Vercel)
Import the GitHub repository into Vercel
Add environment variable in Project Settings → Environment Variables:

Name: TMDB_API_KEY
Value: your TMDB key
Environment: Production & Preview

Redeploy the project so the env variable takes effect

🧠 Technical Decisions & Tradeoffs
API Proxy via Next.js Routes

Why: Keeps the TMDB API key secure and off the client
Tradeoff: Slight server overhead, but improved security and clarity

LocalStorage for Persistence

Why: Simple, fast, and appropriate for a take-home prototype
Tradeoff: Favorites are browser/device specific

Minimal State Management

Why: React hooks are sufficient for the app’s scope
Tradeoff: A global state library could be useful at larger scale

Modal-Based Details View

Why: Keeps navigation simple and user context intact
Tradeoff: Requires careful loading and error handling

-Known Limitations

No pagination for large search results
Favorites are not synced across devices
Limited accessibility enhancements
No automated tests (due to time constraints)

-What I Would Improve With More Time

Add debounced search and pagination
Add loading skeletons and improved accessibility (ARIA, focus trap)
Add server-side persistence with a database
Add unit and integration tests
Improve mobile-specific UI polish

Summary

This project demonstrates:
Secure third-party API integration
Clean separation between client and server logic
Thoughtful tradeoffs aligned with the project scope
A complete, working prototype suitable for technical discussion
