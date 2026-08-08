import { Link } from "react-router-dom";
import { useItunesSearch } from "../hooks/useItunesSearch";
import { usePlayer } from "../hooks/usePlayer";
import { ArrowLeft, Search, Music, Play, Pause } from "lucide-react";

function DiscoverPage() {
  const { query, setQuery, results, loading, error } = useItunesSearch();
  const { queue, currentIndex, loadQueueSource, handlePlay } = usePlayer();

  const playResult = (track) => {
    loadQueueSource(results);
    const index = results.findIndex((t) => t._id === track._id);
    if (index !== -1) handlePlay(results[index]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Discover</h1>
        <Link to="/">
          <button className="btn-ghost flex items-center gap-1.5">
            <ArrowLeft size={16} />
            Back to Library
          </button>
        </Link>
      </div>

      {/* Prominent search hero */}
      <div className="card mb-8 py-10 px-8 text-center">
        <h2 className="text-lg mb-1">Find any song</h2>
        <p className="text-sm text-muted mb-6">
          Search iTunes's full catalog. Playback is a 30-second preview clip.
        </p>

        <div className="relative max-w-xl mx-auto">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Song, artist, or album..."
            className="w-full rounded-full border border-border bg-surface-2 pl-12 pr-4 py-3.5
                       text-base text-text placeholder:text-muted
                       focus:outline-none focus:border-text focus:ring-2 focus:ring-text/15
                       transition-colors"
            autoFocus
          />
        </div>
      </div>

      {loading && <p className="text-sm text-muted text-center">Searching...</p>}

      {error && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && query.trim() && results.length === 0 && (
        <p className="text-sm text-muted text-center">No results for "{query}".</p>
      )}

      {/* Result grid — Spotify-style cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {results.map((track) => {
            const isPlaying = queue[currentIndex]?._id === track._id;
            return (
              <div
                key={track._id}
                className={`card !p-3 cursor-pointer card-hover group ${
                  isPlaying ? "border-text bg-surface-2" : ""
                }`}
                onClick={() => playResult(track)}
              >
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-surface-2 mb-3">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <Music size={36} strokeWidth={1.5} />
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                      isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <span className="w-11 h-11 rounded-full bg-btn-primary-bg text-btn-primary-fg flex items-center justify-center">
                      {isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted truncate">{track.artist}</p>
                {track.album && <p className="text-xs text-muted truncate">{track.album}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DiscoverPage;