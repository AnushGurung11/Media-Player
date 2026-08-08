import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayer } from "../hooks/usePlayer";
import { useAuth } from "../hooks/useAuth";
import { useLikeTrack } from "../hooks/useLikeTrack";
import TrackCard from "../components/Trackcard";

function PlaylistsPage() {
  const {
    playlists,
    tracks,
    selected,
    loading,
    error,
    showPicker,
    setShowPicker,
    pickerMsg,
    setPickerMsg,
    handleCreate,
    handleOpen,
    handleClose,
    handleAddSong,
    handleRemoveSong,
    handleDelete,
  } = usePlaylists();

  const {
    queue,
    currentIndex,
    mode,
    setMode,
    handlePlay,
    playList,
    loadQueueSource,
  } = usePlayer();
  const { user } = useAuth();
  const { toggleLike, likingId } = useLikeTrack();
  const [likeOverrides, setLikeOverrides] = useState({});

  // Create-playlist form is hidden behind a button now — starts closed
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    const result = await handleCreate(newName);
    if (result.error) setCreateError(result.error);
    if (result.success) {
      setCreateSuccess(result.success);
      setNewName("");
      setShowCreateForm(false);
    }
  };

  const handleToggleLike = async (song) => {
    const result = await toggleLike(song._id);
    if (result?.error) return;
    setLikeOverrides((prev) => ({ ...prev, [song._id]: result }));
  };

  const getLikeState = (song) => {
    if (likeOverrides[song._id]) return likeOverrides[song._id];
    return {
      liked: user?.id ? (song.likedBy || []).includes(user.id) : false,
      likesCount: song.likesCount ?? (song.likedBy || []).length,
    };
  };

  useEffect(() => {
    if (selected?.songs?.length > 0) {
      loadQueueSource(selected.songs);
    }
  }, [selected, loadQueueSource]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Playlists</h1>
        <Link to="/">
          <button className="btn-ghost">← Back to Player</button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex gap-8 items-start flex-col lg:flex-row">
        {/* ── Left column: playlist list + create ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Create playlist — button reveals a card form */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary w-full"
            >
              + New Playlist
            </button>
          ) : (
            <div className="card">
              <form onSubmit={onCreateSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newName}
                  autoFocus
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setCreateError("");
                  }}
                  className="input"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {createError && (
                <p className="text-sm text-danger mt-2">{createError}</p>
              )}
            </div>
          )}
          {createSuccess && (
            <p className="text-sm text-success">{createSuccess}</p>
          )}

          {/* Playlist list */}
          <div>
            <h3 className="text-sm text-muted uppercase tracking-wide mb-2">
              Your Library ({playlists.length})
            </h3>

            {loading && <p className="text-sm text-muted">Loading...</p>}

            {!loading && playlists.length === 0 && (
              <p className="text-sm text-muted">
                No playlists yet. Create one above!
              </p>
            )}

            <div className="space-y-2">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  className={`card transition-colors ${
                    selected?._id === pl._id
                      ? "border-blood bg-blood-dim/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="text-sm block truncate">
                        {pl.name}
                      </strong>
                      {!pl.isOwner && (
                        <span className="badge mt-1">🌐 Admin · Public</span>
                      )}
                      <p className="text-xs text-muted mt-0.5">
                        {pl.songs?.length || 0} songs
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpen(pl)}
                        className="btn-outline !px-2.5 !py-1 text-xs"
                      >
                        Open
                      </button>
                      {pl.isOwner && (
                        <button
                          onClick={() => handleDelete(pl)}
                          className="btn-danger !px-2.5 !py-1 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: open playlist detail ── */}
        {selected && (
          <div className="flex-1 min-w-0 w-full card">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg flex items-center gap-2">
                📋 {selected.name}
                {!selected.isOwner && (
                  <span className="badge">🌐 Public (Admin)</span>
                )}
              </h2>
              <button onClick={handleClose} className="btn-ghost !px-2 !py-1">
                ✕
              </button>
            </div>

            <p className="text-sm text-muted mb-4">
              {selected.songs?.length || 0} songs in this playlist
            </p>

            {pickerMsg && (
              <p
                className={`text-sm mb-3 ${pickerMsg.startsWith("✅") ? "text-success" : "text-danger"}`}
              >
                {pickerMsg}
              </p>
            )}

            {/* Song picker — grid of all tracks, click a card to add it */}
            {showPicker && (
              <div className="card bg-surface-2 mb-4 max-h-80 overflow-y-auto">
                <h4 className="text-sm text-muted uppercase tracking-wide mb-3">
                  All Tracks — click to add
                </h4>
                {tracks.length === 0 && (
                  <p className="text-sm text-muted">No tracks available.</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tracks.map((track) => {
                    const alreadyAdded = selected.songs?.some(
                      (s) => (s._id || s) === track._id,
                    );
                    return (
                      <div
                        key={track._id}
                        onClick={() =>
                          !alreadyAdded && handleAddSong(track._id)
                        }
                        role="button"
                        tabIndex={0}
                        className={`card !p-2.5 transition-colors ${
                          alreadyAdded
                            ? "opacity-50 cursor-default"
                            : "cursor-pointer hover:border-blood"
                        }`}
                      >
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full aspect-square object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded bg-surface mb-2 flex items-center justify-center text-2xl text-muted">
                            ♪
                          </div>
                        )}
                        <p className="text-xs font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {track.artist}
                        </p>
                        <span
                          className={`text-xs mt-1 block ${alreadyAdded ? "text-success" : "text-blood"}`}
                        >
                          {alreadyAdded ? "✓ Added" : "+ Add"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playback controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => playList(selected.songs, { shuffled: false })}
                  className="btn-primary"
                >
                  ▶ Play from Start
                </button>
                <button
                  onClick={() => playList(selected.songs, { shuffled: true })}
                  className="btn-outline"
                >
                  🔀 Randomize & Play
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-muted">Mode:</span>
                {["normal", "shuffle", "random"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={
                      mode === m
                        ? "btn-primary !px-2.5 !py-1 text-xs"
                        : "btn-outline !px-2.5 !py-1 text-xs"
                    }
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {selected.isOwner && (
              <button
                onClick={() => {
                  setShowPicker(!showPicker);
                  setPickerMsg("");
                }}
                className="btn-outline mb-4"
              >
                {showPicker ? "✕ Close Song Picker" : "+ Add Songs"}
              </button>
            )}

            {/* Songs grid */}
            {selected.songs?.length === 0 ? (
              <p className="text-sm text-muted">
                No songs yet. Click "+ Add Songs" to add some.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selected.songs.map((song) => {
                  const isPlaying =
                    currentIndex !== null &&
                    queue[currentIndex]?._id === song._id;
                  const { liked, likesCount } = getLikeState(song);
                  return (
                    <TrackCard
                      key={song._id || song}
                      track={song}
                      isPlaying={isPlaying}
                      onPlay={handlePlay}
                      liked={liked}
                      likesCount={likesCount}
                      onToggleLike={handleToggleLike}
                      likingId={likingId}
                      showRemove={selected.isOwner}
                      onRemove={handleRemoveSong}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Prompt when no playlist is open */}
        {!selected && playlists.length > 0 && (
          <div className="flex-1 flex items-center justify-center text-muted text-sm py-20">
            ← Select a playlist to view its songs.
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistsPage;
