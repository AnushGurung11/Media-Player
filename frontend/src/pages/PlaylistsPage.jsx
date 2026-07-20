import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayer } from "../hooks/usePlayer";
import { useAuth } from "../hooks/useAuth";
import { useLikeTrack } from "../hooks/useLikeTrack";

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

  const { queue, currentIndex, mode, setMode, handlePlay, playList, loadQueueSource } = usePlayer();
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
        <Link to="/"><button className="btn-ghost">← Back to Player</button></Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex gap-8 items-start flex-col lg:flex-row">
        {/* ── Left column: playlist list + create ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Create playlist — button reveals a card form */}
          {!showCreateForm ? (
            <button onClick={() => setShowCreateForm(true)} className="btn-primary w-full">
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
                  <button type="submit" className="btn-primary flex-1">Create</button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
              {createError && <p className="text-sm text-red-400 mt-2">{createError}</p>}
            </div>
          )}
          {createSuccess && <p className="text-sm text-green-400">{createSuccess}</p>}

          {/* Playlist list */}
          <div>
            <h3 className="text-sm text-muted uppercase tracking-wide mb-2">
              Your Library ({playlists.length})
            </h3>

            {loading && <p className="text-sm text-muted">Loading...</p>}

            {!loading && playlists.length === 0 && (
              <p className="text-sm text-muted">No playlists yet. Create one above!</p>
            )}

            <div className="space-y-2">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  className={`card transition-colors ${
                    selected?._id === pl._id ? "border-blood bg-blood-dim/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="text-sm block truncate">{pl.name}</strong>
                      {!pl.isOwner && <span className="badge mt-1">🌐 Admin · Public</span>}
                      <p className="text-xs text-muted mt-0.5">{pl.songs?.length || 0} songs</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => handleOpen(pl)} className="btn-outline !px-2.5 !py-1 text-xs">Open</button>
                      {pl.isOwner && (
                        <button onClick={() => handleDelete(pl)} className="btn-danger !px-2.5 !py-1 text-xs">Delete</button>
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
                {!selected.isOwner && <span className="badge">🌐 Public (Admin)</span>}
              </h2>
              <button onClick={handleClose} className="btn-ghost !px-2 !py-1">✕</button>
            </div>

            <p className="text-sm text-muted mb-4">
              {selected.songs?.length || 0} songs in this playlist
            </p>

            {pickerMsg && (
              <p className={`text-sm mb-3 ${pickerMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                {pickerMsg}
              </p>
            )}

            {/* Song picker */}
            {showPicker && (
              <div className="card bg-surface-2 mb-4 max-h-64 overflow-y-auto">
                <h4 className="text-sm text-muted uppercase tracking-wide mb-2">All Tracks — click to add</h4>
                {tracks.length === 0 && <p className="text-sm text-muted">No tracks available.</p>}
                <div className="divide-y divide-border">
                  {tracks.map((track) => {
                    const alreadyAdded = selected.songs?.some((s) => (s._id || s) === track._id);
                    return (
                      <div key={track._id} className="flex items-center justify-between py-2 gap-2">
                        <span className="text-sm truncate">
                          <strong>{track.title}</strong> <span className="text-muted">— {track.artist}</span>
                        </span>
                        <button
                          onClick={() => handleAddSong(track._id)}
                          disabled={alreadyAdded}
                          className={alreadyAdded ? "btn-ghost !px-2.5 !py-1 text-xs shrink-0" : "btn-outline !px-2.5 !py-1 text-xs shrink-0"}
                        >
                          {alreadyAdded ? "✓ Added" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playback controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => playList(selected.songs, { shuffled: false })} className="btn-primary">
                  ▶ Play from Start
                </button>
                <button onClick={() => playList(selected.songs, { shuffled: true })} className="btn-outline">
                  🔀 Randomize & Play
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-muted">Mode:</span>
                {["normal", "shuffle", "random"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={mode === m ? "btn-primary !px-2.5 !py-1 text-xs" : "btn-outline !px-2.5 !py-1 text-xs"}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {selected.isOwner && (
              <button
                onClick={() => { setShowPicker(!showPicker); setPickerMsg(""); }}
                className="btn-outline mb-4"
              >
                {showPicker ? "✕ Close Song Picker" : "+ Add Songs"}
              </button>
            )}

            {/* Songs table */}
            {selected.songs?.length === 0 ? (
              <p className="text-sm text-muted">No songs yet. Click "+ Add Songs" to add some.</p>
            ) : (
              <div className="overflow-x-auto -mx-4">
                <table className="table-vibe">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Artist</th>
                      <th className="hidden md:table-cell">Album</th>
                      <th className="hidden md:table-cell">Genre</th>
                      <th className="hidden md:table-cell">Duration</th>
                      <th>Plays</th>
                      <th>Likes</th>
                      <th>Play</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.songs.map((song, index) => {
                      const isPlaying = currentIndex !== null && queue[currentIndex]?._id === song._id;
                      return (
                        <tr key={song._id || song} className={isPlaying ? "is-active" : ""}>
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            {song.coverUrl ? (
                              <img src={song.coverUrl} alt={song.title} className="w-9 h-9 object-cover rounded" />
                            ) : (
                              <div className="w-9 h-9 rounded bg-surface-2" />
                            )}
                          </td>
                          <td className="font-medium">{song.title || "—"}</td>
                          <td className="text-muted">{song.artist || "—"}</td>
                          <td className="hidden md:table-cell text-muted">{song.album || "—"}</td>
                          <td className="hidden md:table-cell text-muted">{song.genre || "—"}</td>
                          <td className="hidden md:table-cell text-muted">
                            {song.duration
                              ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`
                              : "—"}
                          </td>
                          <td className="text-muted">{song.playCount ?? "—"}</td>
                          <td>
                            <button
                              onClick={() => handleToggleLike(song)}
                              disabled={likingId === song._id}
                              className="btn-ghost !px-2 !py-1"
                            >
                              {getLikeState(song).liked ? "❤" : "🤍"} {getLikeState(song).likesCount}
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => handlePlay(song)}
                              className={isPlaying ? "btn-primary !px-3 !py-1.5" : "btn-outline !px-3 !py-1.5"}
                            >
                              {isPlaying ? "▶ Playing" : "▶ Play"}
                            </button>
                          </td>
                          <td>
                            {selected.isOwner && (
                              <button onClick={() => handleRemoveSong(song._id || song)} className="btn-danger !px-2.5 !py-1 text-xs">
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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