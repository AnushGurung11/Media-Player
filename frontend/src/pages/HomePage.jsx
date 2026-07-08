import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Player from "../components/Player";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

function HomePage() {
  const { isAdmin, handleLogout } = useAuth();
  const { queue, mode, setMode, currentIndex, currentTrack, loadQueueSource, handlePlay, handleNext, handlePrev } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/tracks");
        setTracks(res.data);
        loadQueueSource(res.data); // feeds PlayerContext's queue
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load tracks. Check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  return (
    <div style={{ padding: "16px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Music Player</h1>
        <div>
          <span>Logged in as: <strong>{user.username}</strong> ({user.role})</span>
          &nbsp;&nbsp;
          {/* NEW — only rendered for admins, links into the admin panel */}
          {isAdmin && (
            <Link to="/admin/upload">
              <button style={{ marginRight: "8px" }}>⚙ Admin Panel</button>
            </Link>
          )}
          <Link to="/playlists">
            <button style={{ marginRight: "8px" }}>📋 My Playlists</button>
          </Link>
          <Link to="/upload">
            <button style={{ marginRight: "8px" }}>+ Upload Track</button>
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </div>

      </div>

      <hr />

      {/* NEW — admin-only quick actions card, only visible to admins */}
      {isAdmin && (
        <div style={{
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#f7f7fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span><strong>Admin tools</strong> — manage the track library</span>
          <div>
            <Link to="/admin/upload" style={{ marginRight: "12px" }}>
              <button>+ Upload Track</button>
            </Link>
            <Link to="/admin/tracks">
              <button>Manage Tracks</button>
            </Link>
          </div>
        </div>
      )}

      {/* Mode toggle buttons */}
      <div style={{ marginBottom: "16px" }}>
        <strong>Playback Mode: </strong>
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
        <span style={{ marginLeft: "12px", color: "gray", fontSize: "0.9em" }}>
          {mode === "normal" && "Playing in original list order"}
          {mode === "shuffle" && "Playing in shuffled order (reshuffles on toggle)"}
          {mode === "random" && "Next song is completely random each time"}
        </span>
      </div>

      {loading && <p>Loading tracks...</p>}

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <p>
          No tracks available yet.{" "}
          {isAdmin
            ? <Link to="/admin/upload">Upload the first one.</Link>
            : "Ask an admin to upload some music."}
        </p>
      )}

      {!loading && queue.length > 0 && (
        <div>
          <h2>Tracks ({queue.length})</h2>
          <table border="1" cellPadding="8" cellSpacing="0"
            style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Cover</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Album</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>License</th>
                <th>Plays</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((track, index) => (
                <tr key={track._id}
                  style={{ backgroundColor: currentIndex === index ? "#d0e8ff" : "white" }}>
                  <td>{index + 1}</td>
                  <td>
                    {track.coverUrl
                      ? <img src={track.coverUrl} alt={track.title}
                        style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                      : "—"}
                  </td>
                  <td>{track.title}</td>
                  <td>{track.artist}</td>
                  <td>{track.album || "—"}</td>
                  <td>{track.genre || "—"}</td>
                  <td>
                    {track.duration
                      ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
                      : "—"}
                  </td>
                  <td>{track.license}</td>
                  <td>{track.playCount}</td>
                  <td>
                    <button onClick={() => handlePlay(track)}>
                      {currentIndex === index ? "▶ Playing" : "▶ Play"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Player
        track={currentTrack}
        onNext={handleNext}
        onPrev={handlePrev}
        mode={mode}
      />
    </div>

  );
}

export default HomePage;