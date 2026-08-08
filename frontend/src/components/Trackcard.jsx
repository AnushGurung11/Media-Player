import { formatTime } from "../utils/format";
import { Play, Pause, Music, X, Heart } from "lucide-react";

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
      className={`card !p-3 cursor-pointer group card-hover ${
        isPlaying ? "border-text bg-surface-2" : ""
      }`}
    >
      <div className="relative mb-3 overflow-hidden rounded">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full aspect-square object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-surface-2 flex items-center justify-center text-muted">
            <Music size={32} strokeWidth={1.5} />
          </div>
        )}

        {/* Equalizer — animated playing indicator */}
        {isPlaying && (
          <span
            className="absolute top-2.5 left-2.5 flex items-end gap-[3px] h-4"
            aria-hidden="true"
          >
            <span className="eq-bar w-[3px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "0ms" }} />
            <span className="eq-bar w-[3px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "180ms" }} />
            <span className="eq-bar w-[3px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "360ms" }} />
          </span>
        )}

        {/* Play/pause overlay — always visible while playing, pops in on hover */}
        <div
          className={`absolute bottom-2 right-2 rounded-full bg-btn-primary-bg text-btn-primary-fg p-2.5 shadow-lg transition-all duration-300 ease-out ${
            isPlaying
              ? "opacity-100 scale-100"
              : "opacity-0 translate-y-1 scale-75 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100"
          }`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </div>

        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(track._id || track);
            }}
            aria-label="Remove from playlist"
            className="absolute top-2 right-2 rounded-full bg-black/60 text-danger hover:text-blood w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
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
          className="btn-ghost !p-1 !px-1.5 text-xs shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        >
          {liked ? <Heart size={14} className="fill-current" /> : <Heart size={14} />}{" "}
          {likesCount}
        </button>
        <span className="text-xs text-muted truncate">
          {track.duration ? formatTime(track.duration) : ""}
          {track.duration && track.playCount != null ? " · " : ""}
          {track.playCount != null ? `${track.playCount} plays` : ""}
        </span>
      </div>
    </div>
  );
}

export default TrackCard;