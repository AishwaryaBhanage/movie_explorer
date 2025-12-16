"use client";

import { useEffect, useMemo, useState } from "react";

type TmdbMovie = {
  id: number;
  title: string;
  release_date?: string;
  overview: string;
  poster_path: string | null;
};

type TmdbMovieDetails = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  runtime?: number | null;
  poster_path: string | null;
};

type Favorite = {
  id: number;
  title: string;
  release_date?: string;
  overview: string;
  poster_path: string | null;
  rating: number; // 1-5
  note: string;
};

const LS_KEY = "movie_explorer_favorites_v1";

function posterUrl(path: string | null, size: "w185" | "w342" = "w185") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="panelHeader" style={{ marginBottom: 0 }}>
          <div />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  // Search state
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TmdbMovie[]>([]);

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [details, setDetails] = useState<TmdbMovieDetails | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Load favorites once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Favorite[];
      if (Array.isArray(parsed)) setFavorites(parsed);
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist favorites whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favorites));
    } catch {
      // ignore quota errors
    }
  }, [favorites]);

  const favoriteById = useMemo(() => {
    const map = new Map<number, Favorite>();
    for (const f of favorites) map.set(f.id, f);
    return map;
  }, [favorites]);

  function isFavorite(id: number) {
    return favoriteById.has(id);
  }

  function addFavorite(movie: TmdbMovie) {
    if (isFavorite(movie.id)) return;
    const fav: Favorite = {
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      overview: movie.overview,
      poster_path: movie.poster_path,
      rating: 3,
      note: "",
    };
    setFavorites((prev) => [fav, ...prev]);
  }

  function removeFavorite(id: number) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFavorite(id: number, patch: Partial<Pick<Favorite, "rating" | "note">>) {
    setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setError(null);
    setResults([]);

    if (!q) {
      setError("Please enter a movie title.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`);
      const data = await resp.json();

      if (!resp.ok) {
        setError(data?.error || "Search failed.");
        return;
      }

      const movies: TmdbMovie[] = data?.results ?? [];
      setResults(movies);
      if (movies.length === 0) setError("No results found.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(movieId: number) {
    setDetailsOpen(true);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const resp = await fetch(`/api/tmdb/movie/${movieId}`);
      const data = await resp.json();

      if (!resp.ok) {
        setDetailsError(data?.error || "Failed to load details.");
        return;
      }

      setDetails(data as TmdbMovieDetails);
    } catch {
      setDetailsError("Network error while loading details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="topbar">
        <div>
          <h1 className="h1">Movie Explorer</h1>
          <p className="sub">
            Search movies, view details, and save favorites with your rating & notes.
          </p>
        </div>
        <span className="badge">
          Favorites: <b style={{ color: "var(--text)" }}>{favorites.length}</b>
        </span>
      </div>

      <div className="grid">
        {/* Favorites Panel */}
        <section className="panel">
          <div className="panelHeader">
            <h2 className="h2">Favorites</h2>
            <span className="badge">Saved locally</span>
          </div>

          {favorites.length === 0 ? (
            <div className="notice">No favorites yet. Add some from search results.</div>
          ) : (
            <ul className="list">
              {favorites.map((f) => {
                const year = f.release_date ? f.release_date.slice(0, 4) : "—";
                const poster = posterUrl(f.poster_path, "w185");

                return (
                  <li key={f.id} className="card">
                    <div className="poster">
                      {poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={poster} alt={f.title} />
                      ) : null}
                    </div>

                    <div>
                      <div className="titleRow">
                        <div>
                          <h3 className="title">
                            {f.title} <span style={{ fontWeight: 400, color: "var(--muted)" }}>({year})</span>
                          </h3>
                        </div>

                        <div className="actions">
                          <button className="btn btnDanger" onClick={() => removeFavorite(f.id)}>
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: 10 }}>
                        <label className="meta" style={{ margin: 0 }}>
                          Rating:&nbsp;
                          <select
                            className="select"
                            value={f.rating}
                            onChange={(e) => updateFavorite(f.id, { rating: Number(e.target.value) })}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <textarea
                        className="textarea"
                        value={f.note}
                        onChange={(e) => updateFavorite(f.id, { note: e.target.value })}
                        placeholder="Optional note..."
                        rows={2}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Search Panel */}
        <section className="panel">
          <div className="panelHeader">
            <h2 className="h2">Search</h2>
            <span className="badge">TMDB via proxy</span>
          </div>

          <form onSubmit={onSearch} className="row" style={{ marginBottom: 12 }}>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
            />
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && <div className="notice noticeError">{error}</div>}

          <ul className="list" style={{ marginTop: 12 }}>
            {results.map((m) => {
              const year = m.release_date ? m.release_date.slice(0, 4) : "—";
              const desc = m.overview
                ? m.overview.slice(0, 180) + (m.overview.length > 180 ? "…" : "")
                : "No description.";
              const poster = posterUrl(m.poster_path, "w185");
              const fav = isFavorite(m.id);

              return (
                <li key={m.id} className="card">
                  <div className="poster">
                    {poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={poster} alt={m.title} />
                    ) : null}
                  </div>

                  <div>
                    <div className="titleRow">
                      <div>
                        <h3 className="title">
                          {m.title}{" "}
                          <span style={{ fontWeight: 400, color: "var(--muted)" }}>({year})</span>
                        </h3>
                      </div>

                      <div className="actions">
                        <button className="btn" type="button" onClick={() => openDetails(m.id)}>
                          Details
                        </button>

                        {fav ? (
                          <button className="btn" type="button" onClick={() => removeFavorite(m.id)}>
                            Unfavorite
                          </button>
                        ) : (
                          <button className="btn btnPrimary" type="button" onClick={() => addFavorite(m)}>
                            Favorite
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="meta">{desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {results.length === 0 && !error && !loading ? (
            <div className="notice" style={{ marginTop: 12 }}>
              Try searching for “Batman”, “Inception”, “Harry Potter”, etc.
            </div>
          ) : null}
        </section>
      </div>

      {/* Details Modal */}
      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        {detailsLoading && <div className="notice">Loading details…</div>}

        {detailsError && <div className="notice noticeError">{detailsError}</div>}

        {details && (
          <div className="modalBody">
            <div className="modalPoster">
              {details.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterUrl(details.poster_path, "w342")!} alt={details.title} />
              ) : null}
            </div>

            <div>
              <h2 className="h2" style={{ fontSize: 22, marginTop: 6 }}>
                {details.title}
              </h2>

              <p className="kv">
                Year: <b style={{ color: "var(--text)" }}>{details.release_date ? details.release_date.slice(0, 4) : "—"}</b>
                {" · "}
                Runtime: <b style={{ color: "var(--text)" }}>{details.runtime ? `${details.runtime} min` : "—"}</b>
              </p>

              <p className="meta" style={{ marginTop: 12, fontSize: 14 }}>
                {details.overview || "No overview available."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
