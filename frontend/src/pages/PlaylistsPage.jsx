import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayer } from "../hooks/usePlayer";
import Player from "../components/Player";
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

  // Form-only state — stays local, nothing else needs it
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

  // Load this playlist's songs into the player queue as soon as it's opened,
  // so individual "▶ Play" buttons below actually find the track.
  useEffect(() => {
    if (selected?.songs?.length > 0) {
      loadQueueSource(selected.songs);
    }
  }, [selected, loadQueueSource]);

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My Playlists</h1>
        <Link to="/">← Back to Player</Link>
      </div>

      <hr />

      {/* Global error */}
      {error && (
        <div
          style={{
            color: "red",
            border: "1px solid red",
            padding: "8px",
            marginBottom: "12px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        {/* ── Left column: playlist list + create ── */}
        <div style={{ minWidth: "260px" }}>
          {/* Create new playlist */}
          <h3>Create New Playlist</h3>
          <form
            onSubmit={onCreateSubmit}
            style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
          >
            <input
              type="text"
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setCreateError("");
              }}
              style={{ flex: 1 }}
            />
            <button type="submit">+ Create</button>
          </form>
          {createError && <p style={{ color: "red" }}>{createError}</p>}
          {createSuccess && <p style={{ color: "green" }}>{createSuccess}</p>}

          <hr />

          {/* Playlist list */}
          <h3>Playlists ({playlists.length})</h3>

          {loading && <p>Loading...</p>}

          {!loading && playlists.length === 0 && (
            <p style={{ color: "gray" }}>No playlists yet. Create one above!</p>
          )}

          {playlists.map((pl) => (
            <div
                key={pl._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: selected?._id === pl._id ? "#e8f0ff" : "white",
                }}
              >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{pl.name}</strong>{" "}
                  {!pl.isOwner && (
                    <span style={{ fontSize: "0.75em", color: "#4f46e5" }}>
                      🌐 Admin · Public
                    </span>
                  )}
                  <br />
                  <small style={{ color: "gray" }}>
                    {pl.songs?.length || 0} songs
                  </small>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleOpen(pl)}>Open</button>
                  {pl.isOwner && (
                    <button
                      onClick={() => handleDelete(pl)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right column: open playlist detail ── */}
        {selected && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>
                📋 {selected.name}{" "}
                {!selected.isOwner && (
                  <span style={{ fontSize: "0.5em", color: "#4f46e5" }}>
                    🌐 Public (Admin)
                  </span>
                )}
              </h2>
              <button onClick={handleClose}>✕ Close</button>
            </div>

            <p style={{ color: "gray" }}>
              {selected.songs?.length || 0} songs in this playlist
            </p>

            {pickerMsg && (
              <p
                style={{ color: pickerMsg.startsWith("✅") ? "green" : "red" }}
              >
                {pickerMsg}
              </p>
            )}

            {/* Song picker — all available tracks */}
            {showPicker && (
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "16px",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                <h4 style={{ marginTop: 0 }}>All Tracks — click to add:</h4>
                {tracks.length === 0 && <p>No tracks available.</p>}
                {tracks.map((track) => {
                  // Check if already in playlist
                  const alreadyAdded = selected.songs?.some(
                    (s) => (s._id || s) === track._id,
                  );
                  return (
                    <div
                      key={track._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span>
                        <strong>{track.title}</strong> — {track.artist}
                      </span>
                      <button
                        onClick={() => handleAddSong(track._id)}
                        disabled={alreadyAdded}
                        style={{ color: alreadyAdded ? "gray" : "green" }}
                      >
                        {alreadyAdded ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Playback controls for this playlist */}
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <button
                  onClick={() => playList(selected.songs, { shuffled: false })}
                  style={{ marginRight: "8px" }}
                >
                  ▶ Play from Start
                </button>
                <button onClick={() => playList(selected.songs, { shuffled: true })}>
                  🔀 Randomize & Play
                </button>
              </div>

              <div>
                <strong>Mode: </strong>
                {["normal", "shuffle", "random"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      marginRight: "8px",
                      fontWeight: mode === m ? "bold" : "normal",
                      textDecoration: mode === m ? "underline" : "none",
                    }}
                  >
                    {mode === m ? "✓ " : ""}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Add song button — owner only */}
            {selected.isOwner && (
              <button
                onClick={() => {
                  setShowPicker(!showPicker);
                  setPickerMsg("");
                }}
                style={{ marginBottom: "12px" }}
              >
                {showPicker ? "✕ Close Song Picker" : "+ Add Songs"}
              </button>
            )}

            {/* Songs in this playlist */}
            {selected.songs?.length === 0 ? (
              <p style={{ color: "gray" }}>
                No songs yet. Click "+ Add Songs" to add some.
              </p>
            ) : (
              <table
                border="1"
                cellPadding="8"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                  <th>#</th>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Plays</th>
                  <th>Likes</th>
                  <th>Play</th>
                  <th>Remove</th>
                </tr>
                </thead>
                <tbody>
                  {selected.songs.map((song, index) => (
                    <tr key={song._id || song}>
                      <td>{index + 1}</td>
                      <td>
                        {song.coverUrl ? (
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            style={{
                              width: "36px",
                              height: "36px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{song.title || "—"}</td>
                      <td>{song.artist || "—"}</td>
                      <td>{song.album || "—"}</td>
                      <td>{song.genre || "—"}</td>
                      <td>
                        {song.duration
                          ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`
                          : "—"}
                      </td>
                      <td>{song.playCount ?? "—"}</td>
                      <td>
                        <button
                          onClick={() => handleToggleLike(song)}
                          disabled={likingId === song._id}
                        >
                          {getLikeState(song).liked ? "❤" : "🤍"} {getLikeState(song).likesCount}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handlePlay(song)}
                          style={{ marginRight: "6px" }}
                        >
                          {currentIndex !== null &&
                          queue[currentIndex]?._id === song._id
                            ? "▶ Playing"
                            : "▶ Play"}
                        </button>
                      </td>
                      <td>
                        {selected.isOwner && (
                          <button
                            onClick={() => handleRemoveSong(song._id || song)}
                            style={{ color: "red" }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <Player />

        {/* Prompt when no playlist is open */}
        {!selected && playlists.length > 0 && (
          <div style={{ flex: 1, color: "gray", paddingTop: "40px" }}>
            <p>← Select a playlist to view its songs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistsPage;