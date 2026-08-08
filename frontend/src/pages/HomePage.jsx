import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { useLikeTrack } from "../hooks/useLikeTrack";
import { usePlaylists } from "../hooks/usePlaylists";
import TrackCard from "../components/Trackcard";
import SegmentedControl from "../components/SegmentedControl";
import { ListMusic, ListOrdered, Shuffle, Dices, Info } from "lucide-react";

const PLAYBACK_MODES = [
  { value: "normal", label: "Normal", Icon: ListOrdered },
  { value: "shuffle", label: "Shuffle", Icon: Shuffle },
  { value: "random", label: "Random", Icon: Dices },
];

const MODE_DESCRIPTIONS = {
  normal: "Plays tracks in their original order.",
  shuffle: "Shuffles the queue — toggling again reshuffles it.",
  random: "Picks the next track at random each time.",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const { user, isAdmin } = useAuth();
  const { queue, mode, setMode, currentIndex, loadQueueSource, handlePlay } =
    usePlayer();
  const { playlists, loading: playlistsLoading } = usePlaylists();

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
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Greeting header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl">{getGreeting()}, {user.username}</h1>
          <p className="text-sm text-muted mt-1">Your music, your way.</p>
        </div>
      </div>

      {/* Admin tools */}
      {isAdmin && (
        <div className="card flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-muted">
            <strong className="text-text">Admin tools</strong> — manage the track library
          </span>
          <div className="flex gap-2">
            <Link to="/admin/upload">
              <button className="btn-outline !px-4 !py-2">+ Upload Track</button>
            </Link>
            <Link to="/admin/tracks">
              <button className="btn-outline !px-4 !py-2">Manage Tracks</button>
            </Link>
          </div>
        </div>
      )}

      {/* Playlists section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Playlists</h2>
          <Link to="/playlists" className="text-sm text-muted hover:text-text">
            See all
          </Link>
        </div>

        {playlistsLoading && (
          <p className="text-sm text-muted">Loading playlists...</p>
        )}

        {!playlistsLoading && playlists.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-sm text-muted mb-3">
              No playlists yet. Create one from the Playlists page.
            </p>
            <Link to="/playlists">
              <button className="btn-outline">Create a playlist</button>
            </Link>
          </div>
        )}

        {!playlistsLoading && playlists.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <Link key={pl._id} to="/playlists" className="group">
                <div className="card !p-0 overflow-hidden transition-colors group-hover:border-text">
                  {pl.coverUrl ? (
                    <img
                      src={pl.coverUrl}
                      alt={`${pl.name} cover`}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="aspect-square bg-surface-2 flex items-center justify-center text-muted">
                      <ListMusic size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{pl.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {pl.songs?.length || 0} songs
                      {!pl.isOwner && " · Public"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Playback mode */}
      <section>
        <h2 className="text-xl mb-4">Playback mode</h2>
        <div className="flex flex-col items-start gap-3">
          <SegmentedControl
            options={PLAYBACK_MODES}
            value={mode}
            onChange={setMode}
          />
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Info size={14} className="shrink-0" />
            {MODE_DESCRIPTIONS[mode]}
          </p>
        </div>
      </section>

      {/* Tracks section */}
      <section>
        <h2 className="text-xl mb-4">Tracks</h2>

        {error && (
          <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading tracks...</p>}

        {!loading && !error && queue.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-sm text-muted">
              No tracks available yet.{" "}
              {isAdmin ? (
                <Link to="/admin/upload" className="text-muted hover:text-text hover:underline">
                  Upload the first one.
                </Link>
              ) : (
                "Ask an admin to upload some music."
              )}
            </p>
          </div>
        )}

        {!loading && queue.length > 0 && (
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
        )}
      </section>
    </div>
  );
}

export default HomePage;
