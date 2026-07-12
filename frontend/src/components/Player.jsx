import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { usePlayer } from "../context/PlayerContext";

function Player() {
  const { currentTrack, mode, handleNext, handlePrev } = usePlayer();
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;
    const fetchStreamUrl = async () => {
      setLoading(true);
      setError("");
      setStreamUrl(null);
      try {
        const res = await api.get(`/tracks/${currentTrack._id}/stream`);
        setStreamUrl(res.data.streamUrl);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load audio stream. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamUrl();
  }, [currentTrack]);

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.warn("Autoplay blocked:", err.message));
    }
  }, [streamUrl]);

  // Auto-advance to the next track when the current one finishes playing
  const handleEnded = () => {
    handleNext();
  };

  if (!currentTrack) return null;

  return (
    <div style={{ border: "2px solid black", padding: "16px", marginTop: "24px" }}>
      <h2>Now Playing</h2>

      <p>
        <strong>Mode:</strong>{" "}
        {mode === "normal"  && "Normal (sequential)"}
        {mode === "shuffle" && "Shuffle (random order)"}
        {mode === "random"  && "Random (any song next)"}
      </p>

      {currentTrack.coverUrl && (
        <img
          src={currentTrack.coverUrl}
          alt={`${currentTrack.title} cover`}
          style={{ width: "150px", height: "150px", objectFit: "cover", display: "block", marginBottom: "12px" }}
        />
      )}

      <p><strong>Title:</strong>  {currentTrack.title}</p>
      <p><strong>Artist:</strong> {currentTrack.artist}</p>
      <p><strong>Album:</strong>  {currentTrack.album   || "—"}</p>
      <p><strong>Genre:</strong>  {currentTrack.genre   || "—"}</p>
      <p><strong>License:</strong>{currentTrack.license}</p>
      <p>
        <strong>Duration:</strong>{" "}
        {currentTrack.duration
          ? `${Math.floor(currentTrack.duration / 60)}m ${currentTrack.duration % 60}s`
          : "Unknown"}
      </p>

      {loading && <p>Loading audio stream...</p>}

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px" }}>
          <strong>Stream Error:</strong> {error}
        </div>
      )}

      {streamUrl && (
        <audio
          ref={audioRef}
          controls
          onEnded={handleEnded}
          style={{ width: "100%", marginTop: "12px" }}
        >
          <source src={streamUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Prev / Next controls */}
      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <button onClick={handlePrev}>⏮ Previous</button>
        <button onClick={handleNext}>⏭ Next</button>
      </div>

      {currentTrack.isDownloadable && (
        <p style={{ marginTop: "8px" }}>
          <a href={`http://localhost:5000/api/tracks/${currentTrack._id}/download`}
             target="_blank" rel="noreferrer">
            ⬇ Download ({currentTrack.license})
          </a>
        </p>
      )}
    </div>
  );
}

export default Player;