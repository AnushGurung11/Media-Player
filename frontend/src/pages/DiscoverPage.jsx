import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useItunesSearch } from "../hooks/useItunesSearch";
import { usePlayer } from "../hooks/usePlayer";
import api from "../services/api";
import SegmentedControl from "../components/SegmentedControl";
import {
  ArrowLeft,
  Search,
  Music,
  Play,
  Pause,
  Database,
  Globe,
} from "lucide-react";

const SEARCH_SOURCES = [
  { value: "library", label: "Library", Icon: Database },
  { value: "itunes", label: "iTunes", Icon: Globe },
];

const SOURCE_COPY = {
  library: {
    title: "Search the library",
    hint: "Tracks already on VIBE — full playback.",
    placeholder: "Song, artist, or album...",
  },
  itunes: {
    title: "Find any song",
    hint: "Search iTunes's full catalog. Playback is a 30-second preview clip.",
    placeholder: "Song, artist, or album...",
  },
};

function DiscoverPage() {
  const { query, setQuery, results, loading, error } = useItunesSearch();
  const { queue, currentIndex, loadQueueSource, handlePlay } = usePlayer();

  const [source, setSource] = useState("itunes");
  const [libResults, setLibResults] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState("");
  const debounceRef = useRef(null);

  // Debounced library search — only hits /tracks/search in Library mode
  useEffect(() => {
    if (source !== "library") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing derived results when query is emptied, not a fetch-driven update
      setLibResults([]);
      setLibError("");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLibLoading(true);
      setLibError("");
      try {
        const res = await api.get("/tracks/search", { params: { q: query } });
        setLibResults(res.data);
      } catch (err) {
        setLibError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Search failed. Try again.",
        );
      } finally {
        setLibLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, source]);

  const switchSource = (next) => {
    setSource(next);
    if (next === "itunes") {
      setLibResults([]);
      setLibError("");
    }
  };

  const currentResults = source === "library" ? libResults : results;
  const currentLoading = source === "library" ? libLoading : loading;
  const currentError = source === "library" ? libError : error;
  const copy = SOURCE_COPY[source];

  const playResult = (track) => {
    loadQueueSource(currentResults);
    const index = currentResults.findIndex((t) => t._id === track._id);
    if (index !== -1) handlePlay(currentResults[index]);
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
        <div className="flex items-center justify-center mb-6">
          <SegmentedControl
            options={SEARCH_SOURCES}
            value={source}
            onChange={switchSource}
          />
        </div>

        <h2 className="text-lg mb-1">{copy.title}</h2>
        <p className="text-sm text-muted mb-6">{copy.hint}</p>

        <div className="relative max-w-xl mx-auto">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-full border border-border bg-surface-2 pl-12 pr-4 py-3.5
                       text-base text-text placeholder:text-muted
                       focus:outline-none focus:border-text focus:ring-2 focus:ring-text/15
                       transition-colors"
            autoFocus
          />
        </div>
      </div>

      {currentLoading && (
        <p className="text-sm text-muted text-center">Searching...</p>
      )}

      {currentError && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {currentError}
        </div>
      )}

      {!currentLoading &&
        !currentError &&
        source === "library" &&
        !query.trim() && (
          <p className="text-sm text-muted text-center">
            Start typing to search the VIBE library.
          </p>
        )}

      {!currentLoading &&
        !currentError &&
        query.trim() &&
        currentResults.length === 0 && (
          <p className="text-sm text-muted text-center">
            No results for "{query}".
          </p>
        )}

      {/* Result grid — Spotify-style cards */}
      {currentResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {currentResults.map((track) => {
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

                  {track.source === "itunes" && (
                    <span className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5">
                      Preview
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted truncate">{track.artist}</p>
                {track.album && (
                  <p className="text-xs text-muted truncate">{track.album}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DiscoverPage;
