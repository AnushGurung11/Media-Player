import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { useLikeTrack } from "../hooks/useLikeTrack";
import { usePlaylists } from "../hooks/usePlaylists";
import TrackCard from "../components/Trackcard";
import SegmentedControl from "../components/SegmentedControl";
import PlaylistModal from "../components/PlaylistModal";
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

/* ── One dashboard section — horizontal scroll on mobile, grid on desktop ── */
function SongSection({ title, subtitle, loading, error, children }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl">{title}</h2>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {!loading && error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      {!loading && !error && (
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 snap-x lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
          {children}
        </div>
      )}
    </section>
  );
}

function HomePage() {
  const { user, isAdmin } = useAuth();
  const { mode, setMode, loadQueueSource, handlePlay } = usePlayer();
  const { playlists, loading: playlistsLoading } = usePlaylists();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalPlaylist, setModalPlaylist] = useState(null);

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

  const playFromSection = (sectionTracks) => (track) => {
    loadQueueSource(sectionTracks);
    handlePlay(track);
  };

  const renderTrack = (track, sectionTracks) => {
    const { liked, likesCount } = getLikeState(track);
    return (
      <TrackCard
        key={track._id}
        track={track}
        onPlay={playFromSection(sectionTracks)}
        liked={liked}
        likesCount={likesCount}
        onToggleLike={handleToggleLike}
        likingId={likingId}
      />
    );
  };

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      setError("");
      try {
        const [recentRes, playedRes, latestRes] = await Promise.all([
          api.get("/tracks/recently-played"),
          api.get("/tracks/most-played"),
          api.get("/tracks/recent"),
        ]);
        setRecentlyPlayed(recentRes.data ?? []);
        setMostPlayed(playedRes.data ?? []);
        setLatest(latestRes.data ?? []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load your library. Check if the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  const myPlaylists = playlists
    .filter((p) => p.isOwner)
    .sort((a, b) => (b.songs?.length ?? 0) - (a.songs?.length ?? 0))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Greeting header */}
      <div>
        <h1 className="text-2xl md:text-3xl">
          {getGreeting()}, {user.username}
        </h1>
        <p className="text-sm text-muted mt-1">Your music, your way.</p>
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

      {/* Your playlists — top 5 by song count, click opens the song list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl">Your Playlists</h2>
            <p className="text-xs text-muted mt-0.5">
              Top {Math.min(myPlaylists.length, 5)} by song count
            </p>
          </div>
          <Link
            to="/playlists"
            className="text-sm text-muted hover:text-text shrink-0"
          >
            See all
          </Link>
        </div>

        {playlistsLoading && <p className="text-sm text-muted">Loading playlists…</p>}

        {!playlistsLoading && myPlaylists.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-sm text-muted mb-3">
              No playlists yet. Create one from the Playlists page.
            </p>
            <Link to="/playlists">
              <button className="btn-outline">Create a playlist</button>
            </Link>
          </div>
        )}

        {!playlistsLoading && myPlaylists.length > 0 && (
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 snap-x lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {myPlaylists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => setModalPlaylist(pl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setModalPlaylist(pl);
                }}
                className="w-44 shrink-0 snap-start lg:w-auto cursor-pointer card !p-0 overflow-hidden card-hover group"
              >
                <div className="relative overflow-hidden">
                  {pl.coverUrl ? (
                    <img
                      src={pl.coverUrl}
                      alt={`${pl.name} cover`}
                      className="w-full aspect-square object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-square bg-surface-2 flex items-center justify-center text-muted">
                      <ListMusic size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5">
                    {pl.songs?.length || 0} {pl.songs?.length === 1 ? "song" : "songs"}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{pl.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Recently played */}
      {!loading && !error && recentlyPlayed.length > 0 && (
        <SongSection title="Recently Played" loading={false} error="">
          {recentlyPlayed.map((track) =>
            renderTrack(track, recentlyPlayed),
          )}
        </SongSection>
      )}

      {/* Most played */}
      <SongSection
        title="Most Played"
        subtitle="All-time top 5"
        loading={loading}
        error={error}
      >
        {mostPlayed.map((track) => renderTrack(track, mostPlayed))}
      </SongSection>

      {/* Latest added */}
      <SongSection
        title="Latest Added"
        subtitle="Newest in the library"
        loading={loading}
        error={error}
      >
        {latest.map((track) => renderTrack(track, latest))}
      </SongSection>

      {/* Playlist popup */}
      {modalPlaylist && (
        <PlaylistModal
          playlist={modalPlaylist}
          onClose={() => setModalPlaylist(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
