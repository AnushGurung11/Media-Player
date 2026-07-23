import { usePlayer } from "../hooks/usePlayer";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Small hand-rolled icon set (no icon library in package.json) — single-color
// strokes so they inherit `currentColor` and work with the red/black theme.
const Icon = {
  Prev: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
      <path d="M6 5h2v14H6zM20 5v14l-11-7z" />
    </svg>
  ),
  Next: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
      <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
    </svg>
  ),
  Play: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
      <path d="M7 4l14 8-14 8z" />
    </svg>
  ),
  Pause: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  ),
  Shuffle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" {...props}>
      <path d="M3 6h3l9 12h5M17 5l4 1-1 4M3 18h3l4-5.5M17 19l4-1-1-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Repeat: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" {...props}>
      <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Volume: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
      <path d="M3 10v4h4l5 5V5L7 10H3zM16 8.5a4 4 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
    progress,
    duration,
    seek,
    volume,
    changeVolume,
    mode,
    setMode,
    repeatMode,
    cycleRepeat,
  } = usePlayer();

  if (!currentTrack) return null; // nothing loaded yet — no bar to show

  const shuffleOn = mode === "shuffle";

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface">
      {/* Scrubber sits on the very top edge of the bar, full width */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(progress, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full h-1 accent-[#dc2626] cursor-pointer block"
        aria-label="Seek"
      />

      <div className="px-3 md:px-4 py-2 md:py-3 flex items-center gap-3">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 w-1/3 md:w-1/4">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-11 h-11 md:w-12 md:h-12 object-cover rounded shrink-0"
            />
          ) : (
            <div className="w-11 h-11 md:w-12 md:h-12 rounded bg-surface-2 shrink-0" />
          )}
          <div className="min-w-0 hidden xs:block">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setMode(shuffleOn ? "normal" : "shuffle")}
              className={`hidden sm:inline-flex btn-ghost !p-1.5 ${shuffleOn ? "!text-blood" : ""}`}
              aria-label="Toggle shuffle"
              aria-pressed={shuffleOn}
            >
              <Icon.Shuffle />
            </button>

            <button onClick={handlePrev} className="btn-ghost !p-1.5" aria-label="Previous track">
              <Icon.Prev />
            </button>

            <button
              onClick={togglePlay}
              className="btn-primary !rounded-full !p-2.5"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Icon.Pause /> : <Icon.Play />}
            </button>

            <button onClick={handleNext} className="btn-ghost !p-1.5" aria-label="Next track">
              <Icon.Next />
            </button>

            <button
              onClick={cycleRepeat}
              className={`hidden sm:inline-flex btn-ghost !p-1.5 relative ${repeatMode !== "off" ? "!text-blood" : ""}`}
              aria-label="Cycle repeat mode"
            >
              <Icon.Repeat />
              {repeatMode === "one" && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold leading-none">1</span>
              )}
            </button>
          </div>

          {/* Time readout — hidden on very small screens to save space */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted w-full max-w-md">
            <span className="tabular-nums">{formatTime(progress)}</span>
            <span className="flex-1" />
            <span className="tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          <Icon.Volume className="text-muted" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="w-24 h-1 accent-[#dc2626] cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

export default PlayerBar;