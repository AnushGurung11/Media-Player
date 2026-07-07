import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Player from "../components/Player";

function PlaylistsPage() {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]); // all tracks for song picker
  const [selected, setSelected] = useState(null); // currently open playlist
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // For the playlist functionalaity
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal");

  // Song picker state — shown when user clicks "Add Song" inside a playlist
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMsg, setPickerMsg] = useState("");

  const loadPlaylists = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/playlists");
      setPlaylists(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load playlists.");
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async () => {
    try {
      const res = await api.get("/tracks");
      setTracks(res.data);
    } catch (err) {
      console.error("Failed to load tracks for picker:", err);
    }
  };

  useEffect(() => {
    loadPlaylists();
    loadTracks();
  }, []);

  // ── Create playlist ──────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!newName.trim()) {
      setCreateError("Playlist name is required.");
      return;
    }
    try {
      await api.post("/playlists", { name: newName.trim() });
      setCreateSuccess(`✅ Playlist "${newName.trim()}" created!`);
      setNewName("");
      loadPlaylists();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create playlist.");
    }
  };

  // ── Open a playlist (fetch fresh with songs populated) ──
  const handleOpen = async (playlist) => {
    try {
      const res = await api.get(`/playlists/${playlist._id}`);
      setSelected(res.data);
      setShowPicker(false);
      setPickerMsg("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load playlist.");
    }
  };

  // ── Add song to currently open playlist ─────────────
  const handleAddSong = async (trackId) => {
    if (!selected) return;
    setPickerMsg("");
    try {
      await api.put(`/playlists/${selected._id}/add`, { songId: trackId });
      setPickerMsg("✅ Song added!");
      // Refresh the open playlist to show the new song
      const res = await api.get(`/playlists/${selected._id}`);
      setSelected(res.data);
    } catch (err) {
      setPickerMsg("❌ " + (err.response?.data?.message || "Failed to add song."));
    }
  };

  // ── Remove song from currently open playlist ─────────
  const handleRemoveSong = async (trackId) => {
    if (!selected) return;
    if (!window.confirm("Remove this song from the playlist?")) return;
    try {
      await api.put(`/playlists/${selected._id}/remove`, { songId: trackId });
      // Refresh the open playlist
      const res = await api.get(`/playlists/${selected._id}`);
      setSelected(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove song.");
    }
  };

  // ── Delete a playlist ────────────────────────────────
  const handleDelete = async (playlist) => {
    if (!window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/playlists/${playlist._id}`);
      if (selected?._id === playlist._id) setSelected(null);
      loadPlaylists();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete playlist.");
    }
  };
  // When user clicks Play on a song in the playlist
  const handlePlay = (song) => {
    const index = queue.findIndex(t => t._id === song._id);
    setIndex(index !== -1 ? index : 0);
  };

  const handleNext = () => {
    if (currentIndex === null || queue.length === 0) return;
    if (mode === "random") {
      setIndex(Math.floor(Math.random() * queue.length));
    } else {
      setIndex((currentIndex + 1) % queue.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex === null || queue.length === 0) return;
    setIndex((currentIndex - 1 + queue.length) % queue.length);
  };

  useEffect(() => {
    if (!selected || selected.songs.length === 0) return;
    if (mode === "shuffle") {
      const shuffled = [...selected.songs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQueue(shuffled);
    } else {
      setQueue([...selected.songs]);
    }
    setIndex(null);
  }, [mode, selected]);

  return (
    <div style={{ padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Playlists</h1>
        <Link to="/">← Back to Player</Link>
      </div>

      <hr />

      {/* Global error */}
      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

        {/* ── Left column: playlist list + create ── */}
        <div style={{ minWidth: "260px" }}>

          {/* Create new playlist */}
          <h3>Create New Playlist</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              style={{ flex: 1 }}
            />
            <button type="submit">+ Create</button>
          </form>
          {createError && <p style={{ color: "red" }}>{createError}</p>}
          {createSuccess && <p style={{ color: "green" }}>{createSuccess}</p>}

          <hr />

          {/* Playlist list */}
          <h3>Your Playlists ({playlists.length})</h3>

          {loading && <p>Loading...</p>}

          {!loading && playlists.length === 0 && (
            <p style={{ color: "gray" }}>No playlists yet. Create one above!</p>
          )}

          {playlists.map((pl) => (
            <div key={pl._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "10px",
                marginBottom: "8px",
                backgroundColor: selected?._id === pl._id ? "#e8f0ff" : "white"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{pl.name}</strong>
                  <br />
                  <small style={{ color: "gray" }}>{pl.songs?.length || 0} songs</small>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleOpen(pl)}>Open</button>
                  <button
                    onClick={() => handleDelete(pl)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right column: open playlist detail ── */}
        {selected && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>📋 {selected.name}</h2>
              <button onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <p style={{ color: "gray" }}>
              {selected.songs?.length || 0} songs in this playlist
            </p>

            {/* Add song button */}
            <button
              onClick={() => { setShowPicker(!showPicker); setPickerMsg(""); }}
              style={{ marginBottom: "12px" }}
            >
              {showPicker ? "✕ Close Song Picker" : "+ Add Songs"}
            </button>

            {pickerMsg && (
              <p style={{ color: pickerMsg.startsWith("✅") ? "green" : "red" }}>
                {pickerMsg}
              </p>
            )}

            {/* Song picker — all available tracks */}
            {showPicker && (
              <div style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "12px",
                marginBottom: "16px",
                maxHeight: "250px",
                overflowY: "auto"
              }}>
                <h4 style={{ marginTop: 0 }}>All Tracks — click to add:</h4>
                {tracks.length === 0 && <p>No tracks available.</p>}
                {tracks.map((track) => {
                  // Check if already in playlist
                  const alreadyAdded = selected.songs?.some(
                    (s) => (s._id || s) === track._id
                  );
                  return (
                    <div key={track._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid #eee"
                      }}>
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

            {/* For the option of suffleing and randomizing the music order */}
            {/* Playback mode controls */}
            <div style={{ marginBottom: "12px" }}>
              <strong>Mode: </strong>
              {["normal", "shuffle", "random"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    marginRight: "8px",
                    fontWeight: mode === m ? "bold" : "normal",
                    textDecoration: mode === m ? "underline" : "none"
                  }}
                >
                  {mode === m ? "✓ " : ""}{m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Songs in this playlist */}
            {selected.songs?.length === 0 ? (
              <p style={{ color: "gray" }}>
                No songs yet. Click "+ Add Songs" to add some.
              </p>
            ) : (

              <table border="1" cellPadding="8" cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>Duration</th>
                    <th>Play</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.songs.map((song, index) => (
                    <tr key={song._id || song}>
                      <td>{index + 1}</td>
                      <td>
                        {song.coverUrl
                          ? <img src={song.coverUrl} alt={song.title}
                            style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                          : "—"}
                      </td>
                      <td>{song.title || "—"}</td>
                      <td>{song.artist || "—"}</td>
                      <td>{song.album || "—"}</td>
                      <td>
                        {song.duration
                          ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`
                          : "—"}
                      </td>
                      <td>
                        <button onClick={() => handlePlay(song)} style={{ marginRight: "6px" }}>
                          {currentIndex !== null && queue[currentIndex]?._id === song._id
                            ? "▶ Playing"
                            : "▶ Play"}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveSong(song._id || song)}
                          style={{ color: "red" }}
                        >
                          Remove
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}
        <Player
          track={currentIndex !== null ? queue[currentIndex] : null}
          onNext={handleNext}
          onPrev={handlePrev}
          mode={mode}
        />

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