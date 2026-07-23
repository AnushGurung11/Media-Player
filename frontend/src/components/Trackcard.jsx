const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
    <path d="M7 4l14 8-14 8z" />
  </svg>
);

const PauseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

/**
 * Spotify-style card for a single track. Clicking anywhere on the card plays
 * it; the like button and remove button stop propagation so they don't
 * trigger playback.
 *
 * Props:
 *  - track: the song/track object ({_id, title, artist, coverUrl, duration, playCount})
 *  - isPlaying: bool — highlights the card and swaps the overlay icon
 *  - onPlay(track)
 *  - liked, likesCount: like state for this track
 *  - onToggleLike(track), likingId: passed through from useLikeTrack
 *  - showRemove, onRemove(trackIdOrTrack): optional, for playlist owners
 */
function TrackCard({
  track,
  isPlaying,
  onPlay,
  liked,
  likesCount,
  onToggleLike,
  likingId,
  showRemove = false,
  onRemove,
}) {
  return (
    <div
      onClick={() => onPlay(track)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPlay(track);
      }}
      className={`card !p-3 cursor-pointer group transition-colors hover:border-blood ${
        isPlaying ? "border-blood bg-blood-dim/10" : ""
      }`}
    >
      <div className="relative mb-3">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full aspect-square object-cover rounded"
          />
        ) : (
          <div className="w-full aspect-square rounded bg-surface-2 flex items-center justify-center text-3xl text-muted">
            ♪
          </div>
        )}

        {/* Play/pause overlay — always visible while playing, fades in on hover otherwise */}
        <div
          className={`absolute bottom-2 right-2 rounded-full bg-blood text-white p-2.5 shadow-lg transition-all ${
            isPlaying
              ? "opacity-100"
              : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>

        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(track._id || track);
            }}
            aria-label="Remove from playlist"
            className="absolute top-2 right-2 rounded-full bg-black/60 text-red-400 hover:text-red-300 w-7 h-7 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-sm font-medium truncate">{track.title || "—"}</p>
      <p className="text-xs text-muted truncate">{track.artist || "—"}</p>

      <div className="flex items-center justify-between mt-2 gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track);
          }}
          disabled={likingId === track._id}
          className="btn-ghost !p-1 !px-1.5 text-xs shrink-0"
        >
          {liked ? "❤" : "🤍"} {likesCount}
        </button>
        <span className="text-xs text-muted truncate">
          {track.duration
            ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
            : ""}
          {track.duration && track.playCount != null ? " · " : ""}
          {track.playCount != null ? `${track.playCount} plays` : ""}
        </span>
      </div>
    </div>
  );
}

export default TrackCard;