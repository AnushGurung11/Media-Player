import { useState, useEffect, useRef } from "react";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayer } from "../hooks/usePlayer";
import { useAuth } from "../hooks/useAuth";
import { useLikeTrack } from "../hooks/useLikeTrack";
import TrackCard from "../components/Trackcard";
import {
  ArrowLeft,
  ListMusic,
  Play,
  Shuffle,
  X,
  Music,
  Image,
  Plus,
  CircleCheck,
} from "lucide-react";
import { formatTime } from "../utils/format";

const MAX_COVER_SIZE_MB = 5;

/* Cover preview with proper object-URL lifecycle */
function CoverPreview({ file }) {
  const [url] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <img
      src={url}
      alt="Cover preview"
      className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
    />
  );
}

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
    handleCreate,
    handleOpen,
    handleClose,
    handleAddSong,
    handleRemoveSong,
    handleDelete,
  } = usePlaylists();

  const {
    queue,
    currentIndex,
    handlePlay,
    playList,
    loadQueueSource,
  } = usePlayer();
  const { user } = useAuth();
  const { toggleLike, likingId } = useLikeTrack();
  const [likeOverrides, setLikeOverrides] = useState({});

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverError, setCoverError] = useState("");
  const coverInputRef = useRef(null);

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    const result = await handleCreate(newName, coverFile);
    if (result.error) setCreateError(result.error);
    if (result.success) {
      setCreateSuccess(result.success);
      setNewName("");
      setCoverFile(null);
      setCoverError("");
      setShowCreateForm(false);
    }
  };

  const handleCoverPick = (e) => {
    const file = e.target.files[0] || null;
    setCoverError("");
    if (file) {
      if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
        setCoverError(`Cover image must be under ${MAX_COVER_SIZE_MB}MB.`);
        e.target.value = "";
        return;
      }
      setCoverFile(file);
      return;
    }
    setCoverFile(null);
  };

  const removeCover = () => {
    if (coverInputRef.current) coverInputRef.current.value = "";
    setCoverFile(null);
    setCoverError("");
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

  useEffect(() => {
    if (selected?.songs?.length > 0) {
      loadQueueSource(selected.songs);
    }
  }, [selected, loadQueueSource]);

  /* ── Detail view ── */
  if (selected) {
    const songCount = selected.songs?.length || 0;
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleClose}
          className="btn-ghost flex items-center gap-1.5 !px-3 !py-1.5 mb-6"
        >
          <ArrowLeft size={16} />
          All playlists
        </button>

        {/* Playlist header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            {selected.coverUrl ? (
              <img
                src={selected.coverUrl}
                alt={`${selected.name} cover`}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted shrink-0">
                <ListMusic size={36} strokeWidth={1.5} />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl">{selected.name}</h1>
              <p className="text-sm text-muted mt-1">
                {songCount} {songCount === 1 ? "song" : "songs"}
                {!selected.isOwner && " · Public"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => playList(selected.songs, { shuffled: false })}
              disabled={songCount === 0}
              className="btn-primary"
            >
              <Play size={16} fill="currentColor" />
              Play
            </button>
            <button
              onClick={() => playList(selected.songs, { shuffled: true })}
              disabled={songCount === 0}
              className="btn-outline"
            >
              <Shuffle size={16} />
              Shuffle
            </button>
            {selected.isOwner && (
              <button onClick={() => handleDelete(selected)} className="btn-danger">
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Song picker */}
        {showPicker && (
          <div className="card bg-surface-2 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base">Add songs</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="btn-ghost !px-3 !py-1.5"
                aria-label="Close song picker"
              >
                <X size={16} />
              </button>
            </div>
            {tracks.length === 0 && (
              <p className="text-sm text-muted">No tracks available.</p>
            )}
            <ul className="divide-y divide-border max-h-80 overflow-y-auto pr-1 rounded-lg border border-border">
              {tracks.map((track) => {
                const alreadyAdded = selected.songs?.some(
                  (s) => (s._id || s) === track._id,
                );
                return (
                  <li
                    key={track._id}
                    onClick={() => !alreadyAdded && handleAddSong(track._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !alreadyAdded) {
                        handleAddSong(track._id);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      alreadyAdded
                        ? "opacity-50 cursor-default"
                        : "cursor-pointer hover:bg-surface-2"
                    }`}
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center text-muted shrink-0">
                        <Music size={16} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted truncate">{track.artist}</p>
                    </div>
                    {track.duration && (
                      <span className="text-xs text-muted tabular-nums hidden sm:inline">
                        {formatTime(track.duration)}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!alreadyAdded) handleAddSong(track._id);
                      }}
                      disabled={alreadyAdded}
                      className={
                        alreadyAdded
                          ? "btn-ghost !px-2.5 !py-1.5 text-xs text-success pointer-events-none"
                          : "btn-outline !px-2.5 !py-1.5 text-xs"
                      }
                      aria-label={
                        alreadyAdded
                          ? `${track.title} is already in the playlist`
                          : `Add ${track.title}`
                      }
                    >
                      {alreadyAdded ? (
                        <>
                          <CircleCheck size={14} />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Add
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Songs */}
        {songCount === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-muted mb-3">No songs in this playlist yet.</p>
            {selected.isOwner ? (
              <button onClick={() => setShowPicker(true)} className="btn-outline">
                + Add Songs
              </button>
            ) : (
              <p className="text-sm text-muted">Sit tight — nothing to play yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selected.songs.map((song) => {
              const isPlaying =
                currentIndex !== null && queue[currentIndex]?._id === song._id;
              const { liked, likesCount } = getLikeState(song);
              return (
                <TrackCard
                  key={song._id || song}
                  track={song}
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  liked={liked}
                  likesCount={likesCount}
                  onToggleLike={handleToggleLike}
                  likingId={likingId}
                  showRemove={selected.isOwner}
                  onRemove={handleRemoveSong}
                />
              );
            })}
          </div>
        )}

        {pickerMsg && (
          <p
            className={`text-sm mt-4 ${
              pickerMsg === "Song added!" ? "text-success" : "text-danger"
            }`}
          >
            {pickerMsg}
          </p>
        )}
      </div>
    );
  }

  /* ── Library view ── */
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl">Playlists</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? "Loading…" : `${playlists.length} playlists in your library`}
          </p>
        </div>
        <button onClick={() => setShowCreateForm((v) => !v)} className="btn-primary">
          + New Playlist
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {createSuccess && <p className="text-sm text-success mb-4">{createSuccess}</p>}

      {showCreateForm && (
        <form onSubmit={onCreateSubmit} className="card mb-6 space-y-3 max-w-md">
          <label htmlFor="playlist-name" className="block text-sm font-medium">
            Playlist name
          </label>
          <input
            id="playlist-name"
            type="text"
            placeholder="e.g. Road trip bangers"
            value={newName}
            autoFocus
            onChange={(e) => {
              setNewName(e.target.value);
              setCreateError("");
            }}
            className="input"
          />
          {createError && <p className="text-sm text-danger">{createError}</p>}

          <div className="border-t border-border pt-4">
            <label className="block text-sm font-medium mb-1.5">
              Cover image <span className="text-muted">(optional)</span>
            </label>
            {coverFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <CoverPreview key={coverFile.name} file={coverFile} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{coverFile.name}</p>
                  <p className="text-xs text-muted">
                    {(coverFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCover}
                  className="btn-ghost !px-2 !py-1.5 text-xs flex items-center gap-1"
                >
                  <X size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border hover:border-text transition-colors p-6 cursor-pointer text-center">
                <Image size={24} strokeWidth={1.25} className="text-muted" />
                <span className="text-sm">
                  Add a cover <span className="text-muted">(JPEG · PNG · WEBP, max 5 MB)</span>
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverPick}
                  aria-label="Playlist cover"
                  className="sr-only"
                />
              </label>
            )}
            {coverError && <p className="text-sm text-danger mt-1.5">{coverError}</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-muted">Loading playlists...</p>}

      {!loading && !error && playlists.length === 0 && (
        <div className="card text-center py-14">
          <div className="flex items-center justify-center mb-3 text-muted">
            <ListMusic size={40} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted mb-4">
            No playlists yet. Create your first one!
          </p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            + New Playlist
          </button>
        </div>
      )}

      {!loading && playlists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl._id}
              onClick={() => handleOpen(pl)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleOpen(pl);
              }}
              className="card !p-0 overflow-hidden cursor-pointer card-hover group"
            >
              <div className="relative overflow-hidden">
                {pl.coverUrl ? (
                  <img
                    src={pl.coverUrl}
                    alt={`${pl.name} cover`}
                    className="w-full aspect-square object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-square bg-surface-2 flex items-center justify-center text-muted">
                    <ListMusic size={40} strokeWidth={1.5} />
                  </div>
                )}
                <span className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5">
                  {pl.songs?.length || 0} {pl.songs?.length === 1 ? "song" : "songs"}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{pl.name}</p>
                {!pl.isOwner && (
                  <p className="text-xs text-muted mt-0.5">Public playlist</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistsPage;
