import { useEffect } from "react";
import { usePlayer } from "../hooks/usePlayer";
import { formatTime } from "../utils/format";
import { Play, Shuffle, X, ListMusic, Music } from "lucide-react";

/**
 * Spotify-style playlist popup: shows the songs inside a playlist with
 * Play/Shuffle actions for the whole playlist, and click-to-play rows.
 */
function PlaylistModal({ playlist, onClose }) {
  const { queue, currentIndex, handlePlay, playList, loadQueueSource } =
    usePlayer();

  const songs = playlist?.songs ?? [];

  // Queue the playlist so individual rows play in context
  useEffect(() => {
    if (songs.length > 0) loadQueueSource(songs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?._id]);

  // Escape to close + scroll lock while open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!playlist) return null;

  const playSong = (track) => {
    loadQueueSource(songs);
    handlePlay(track);
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${playlist.name} playlist`}
    >
      <div
        className="card !p-0 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div className="flex items-center gap-4 min-w-0">
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={`${playlist.name} cover`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted shrink-0">
                <ListMusic size={28} strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl truncate">{playlist.name}</h3>
              <p className="text-sm text-muted">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
                {!playlist.isOwner && " · Public"}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => playList(songs, { shuffled: false })}
                  disabled={songs.length === 0}
                  className="btn-primary !px-4 !py-2 text-sm"
                >
                  <Play size={15} fill="currentColor" />
                  Play
                </button>
                <button
                  onClick={() => playList(songs, { shuffled: true })}
                  disabled={songs.length === 0}
                  className="btn-outline !px-4 !py-2 text-sm"
                >
                  <Shuffle size={15} />
                  Shuffle
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost !p-2 shrink-0"
            aria-label="Close playlist"
          >
            <X size={18} />
          </button>
        </div>

        {/* Song list */}
        <div className="overflow-y-auto flex-1">
          {songs.length === 0 ? (
            <p className="text-sm text-muted text-center py-10 px-4">
              No songs in this playlist yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {songs.map((song, i) => {
                const isPlaying =
                  currentIndex !== null &&
                  queue[currentIndex]?._id === (song._id || song);
                return (
                  <li
                    key={song._id || song}
                    onClick={() => playSong(song)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") playSong(song);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-surface-2 ${
                      isPlaying ? "bg-surface-2" : ""
                    }`}
                  >
                    <span className="w-6 text-xs text-muted tabular-nums shrink-0">
                      {isPlaying ? (
                        <span className="inline-flex items-end gap-[2px] h-3.5" aria-hidden="true">
                          <span className="eq-bar w-[2.5px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "0ms" }} />
                          <span className="eq-bar w-[2.5px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "180ms" }} />
                          <span className="eq-bar w-[2.5px] h-full bg-btn-primary-bg rounded-sm" style={{ animationDelay: "360ms" }} />
                        </span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center text-muted shrink-0">
                        <Music size={16} strokeWidth={1.5} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm truncate ${
                          isPlaying ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {song.title || "—"}
                      </span>
                      <span className="block text-xs text-muted truncate">
                        {song.artist || "—"}
                      </span>
                    </span>
                    <span className="text-xs text-muted tabular-nums shrink-0">
                      {song.duration ? formatTime(song.duration) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistModal;
