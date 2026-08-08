import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { useLikeTrack } from "../hooks/useLikeTrack";
import { usePlaylists } from "../hooks/usePlaylists";
import TrackCard from "../components/Trackcard";

function HomePage() {
  const { user, isAdmin } = useAuth();
  const { queue, mode, setMode, currentIndex, loadQueueSource, handlePlay } =
    usePlayer();
  const { playlists, loading: playlistsLoading } = usePlaylists();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { toggleLike, likingId } = useLikeTrack();
  const [likeOverrides, setLikeOverrides] = useState({});

  const handleToggleLike = async (track) => {
    const result = await toggleLike(track._id);
    if (result?.error) return;
    setLikeOverrides((prev) => ({ ...prev, [track._id]: result }));
  };

  const getLikeState = (track) => {
    if (likeOverrides[track._id]) return likeOverrides[track._id];
    return {
      liked: user?.id ? (track.likedBy || []).includes(user.id) : false,
      likesCount: track.likesCount ?? (track.likedBy || []).length,
    };
  };

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/tracks");
        setTracks(res.data);
        loadQueueSource(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load tracks. Check if the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [loadQueueSource]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl mb-1">Home</h1>
      <p className="text-sm text-muted mb-6">Welcome back, {user.username}.</p>

      {isAdmin && (
        <div className="card mb-6 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-muted">
            <strong className="text-text">Admin tools</strong> — manage the
            track library
          </span>
          <div className="flex gap-2">
            <Link to="/admin/upload">
              <button className="btn-outline">+ Upload Track</button>
            </Link>
            <Link to="/admin/tracks">
              <button className="btn-outline">Manage Tracks</button>
            </Link>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="mb-6 flex items-center flex-wrap gap-3">
        <strong className="text-sm">Playback:</strong>
        <div className="flex gap-2">
          {["normal", "shuffle", "random"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={mode === m ? "btn-primary" : "btn-outline"}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">
          {mode === "normal" && "Original list order"}
          {mode === "shuffle" && "Shuffled order (reshuffles on toggle)"}
          {mode === "random" && "Next song is random each time"}
        </span>
      </div>

      {/* Playlists — horizontal scroll, Spotify-style cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg">
            Playlists {playlists.length > 0 && `(${playlists.length})`}
          </h2>
          <Link to="/playlists">
            <button className="btn-ghost">Manage →</button>
          </Link>
        </div>

        {playlistsLoading && (
          <p className="text-sm text-muted">Loading playlists...</p>
        )}

        {!playlistsLoading && playlists.length === 0 && (
          <p className="text-sm text-muted">
            No playlists yet. Create one from the Playlists page.
          </p>
        )}

        {!playlistsLoading && playlists.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {playlists.map((pl) => (
              <Link key={pl._id} to="/playlists" className="shrink-0">
                <div className="card w-40 hover:border-blood transition-colors">
                  <div className="w-full aspect-square rounded bg-surface-2 mb-2 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <strong className="text-sm block truncate">{pl.name}</strong>
                  {!pl.isOwner && <div className="badge mt-1">🌐 Public</div>}
                  <div className="text-xs text-muted mt-1">
                    {pl.songs?.length || 0} songs
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <p className="text-sm text-muted">
          No tracks available yet.{" "}
          {isAdmin ? (
            <Link to="/admin/upload" className="text-blood hover:underline">
              Upload the first one.
            </Link>
          ) : (
            "Ask an admin to upload some music."
          )}
        </p>
      )}

      {loading && <p className="text-sm text-muted">Loading tracks...</p>}

      {!loading && queue.length > 0 && (
        <div>
          <h2 className="text-lg mb-3">Tracks ({queue.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {queue.map((track, index) => {
              const isPlaying = currentIndex === index;
              const { liked, likesCount } = getLikeState(track);
              return (
                <TrackCard
                  key={track._id}
                  track={track}
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  liked={liked}
                  likesCount={likesCount}
                  onToggleLike={handleToggleLike}
                  likingId={likingId}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
