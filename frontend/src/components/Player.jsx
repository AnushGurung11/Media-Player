import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { usePlayer } from "../hooks/usePlayer";

function Player() {
  const { currentTrack, mode, handleNext, handlePrev } = usePlayer();
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrack.source === "itunes") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- iTunes preview url is already known synchronously from currentTrack, no fetch needed
      setStreamUrl(currentTrack.url);
      setError("");
      setLoading(false);
      return;
    }

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

  const handleEnded = () => {
    handleNext();
  };

  if (!currentTrack) return null;

  const isPreview = currentTrack.source === "itunes";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 flex items-center gap-4 z-50">
      {/* Track info */}
      <div className="flex items-center gap-3 w-64 min-w-0 shrink-0">
        <span className="w-2 h-2 rounded-full bg-blood animate-pulse shrink-0" />
        {currentTrack.coverUrl ? (
          <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-12 h-12 object-cover rounded shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded bg-surface-2 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls + audio */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="flex items-center gap-5">
          <button onClick={handlePrev} className="text-muted hover:text-text transition-colors">⏮</button>
          <button onClick={handleNext} className="text-muted hover:text-text transition-colors">⏭</button>
        </div>
        {loading && <p className="text-xs text-muted">Loading...</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
        {streamUrl && (
          <audio ref={audioRef} controls onEnded={handleEnded} className="w-full max-w-md h-8">
            <source src={streamUrl} type="audio/mpeg" />
          </audio>
        )}
      </div>

      {/* Meta */}
      <div className="w-48 flex items-center justify-end gap-2 shrink-0">
        {isPreview && <span className="badge">Preview</span>}
        <span className="text-xs text-muted hidden md:inline">
          {mode === "normal" ? "Normal" : mode === "shuffle" ? "Shuffle" : "Random"}
        </span>
        {currentTrack.isDownloadable && (
          <a
            href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tracks/${currentTrack._id}/download`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !px-2 !py-1 text-xs"
          >
            ⬇
          </a>
        )}
      </div>
    </div>
  );
}

export default Player;