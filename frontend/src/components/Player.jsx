import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { usePlayer } from "../hooks/usePlayer";
import { formatTime } from "../utils/format";

const Icon = {
  Prev: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      {...props}
    >
      <path d="M6 5h2v14H6zM20 5v14l-11-7z" />
    </svg>
  ),
  Next: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      {...props}
    >
      <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
    </svg>
  ),
  Play: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      {...props}
    >
      <path d="M7 4l14 8-14 8z" />
    </svg>
  ),
  Pause: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      {...props}
    >
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  ),
  Volume: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
      {...props}
    >
      <path
        d="M3 10v4h4l5 5V5L7 10H3zM16 8.5a4 4 0 0 1 0 7"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function Player() {
  const { currentTrack, mode, handleNext, handlePrev } = usePlayer();
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  // Custom-control state — the audio element itself is now hidden.
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

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
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load audio stream. Try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStreamUrl();
  }, [currentTrack]);

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((err) => console.warn("Autoplay blocked:", err.message));
    }
  }, [streamUrl]);

  // Keep custom UI in sync with the real <audio> element instead of guessing
  // state ourselves — covers autoplay being blocked, user calling play()/
  // pause() below, track ending, etc.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [handleNext]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((err) => console.warn("Play blocked:", err.message));
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  };

  const handleVolume = (value) => {
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  };

  const handleDownload = async () => {
  try {
    const res = await api.get(`/tracks/${currentTrack._id}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentTrack.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.warn("Download failed:", err.message);
  }
};

  if (!currentTrack) return null;

  const isPreview = currentTrack.source === "itunes";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      {/* Scrubber along the top edge of the bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(progress, duration || 0)}
        onChange={(e) => handleSeek(Number(e.target.value))}
        disabled={!streamUrl}
        className="w-full h-1 accent-brand cursor-pointer block disabled:cursor-not-allowed"
        aria-label="Seek"
      />

      <div className="px-2 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-4">
        {/* Track info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:w-64 md:flex-none">
          <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded shrink-0"
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-surface-2 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={handlePrev}
              className="btn-ghost !p-1.5"
              aria-label="Previous track"
            >
              <Icon.Prev />
            </button>
            <button
              onClick={togglePlay}
              disabled={!streamUrl}
              className="btn-primary !rounded-full !p-2.5"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Icon.Pause /> : <Icon.Play />}
            </button>
            <button
              onClick={handleNext}
              className="btn-ghost !p-1.5"
              aria-label="Next track"
            >
              <Icon.Next />
            </button>
          </div>

          {loading && (
            <p className="text-xs text-muted hidden sm:block">Loading...</p>
          )}
          {error && (
            <p className="text-xs text-danger hidden sm:block">{error}</p>
          )}

          {!loading && !error && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted w-full max-w-md">
              <span className="tabular-nums">{formatTime(progress)}</span>
              <span className="flex-1" />
              <span className="tabular-nums">{formatTime(duration)}</span>
            </div>
          )}

          {/* Real audio element — hidden, driven entirely by the controls above */}
          <audio ref={audioRef} className="hidden">
            {streamUrl && <source src={streamUrl} type="audio/mpeg" />}
          </audio>
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center gap-2 w-24">
          <Icon.Volume className="text-muted shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
            className="w-full h-1 accent-brand cursor-pointer"
            aria-label="Volume"
          />
        </div>

        {/* Meta — hidden on very small screens to keep the bar from overflowing */}
        <div className="hidden sm:flex w-auto md:w-40 items-center justify-end gap-2 shrink-0">
          {isPreview && <span className="badge">Preview</span>}
          <span className="text-xs text-muted hidden lg:inline">
            {mode === "normal"
              ? "Normal"
              : mode === "shuffle"
                ? "Shuffle"
                : "Random"}
          </span>
          {currentTrack.isDownloadable && (
            <button
              onClick={handleDownload}
              className="btn-ghost !px-2 !py-1 text-xs"
            >
              ⬇
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Player;
