import { useState, useEffect, useRef, useCallback } from "react";
import { PlayerContext } from "./player-context-value";

// NOTE: assumes each track object has an `audioUrl` field pointing at the
// playable file (e.g. a Supabase storage URL). If your field is named
// differently (e.g. `url` or `fileUrl`), update the one line marked below.

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal"); // "normal" | "shuffle" | "random"
  const [sourceTracks, setSourceTracks] = useState([]); // the unshuffled base list
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolume] = useState(1); // 0..1

  // Set by playList() right before a queue swap, so the effect below knows
  // to jump straight to a track instead of resetting to "nothing playing".
  const pendingIndexRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (sourceTracks.length === 0) return;
    let newQueue;
    if (mode === "shuffle") {
      newQueue = [...sourceTracks];
      for (let i = newQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
      }
    } else {
      newQueue = [...sourceTracks];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: derived queue depends on an impure shuffle (Math.random) that cannot live in render/useMemo
    setQueue(newQueue);

    if (pendingIndexRef.current !== null) {
      setIndex(pendingIndexRef.current);
      pendingIndexRef.current = null;
    } else {
      setIndex(null);
    }
  }, [mode, sourceTracks]);

  const loadQueueSource = useCallback((tracksArray) => {
    setSourceTracks(tracksArray);
  }, []);

  // Load a track list (e.g. a playlist's songs) and start playing it right
  // away — either in the given order, or shuffled.
  const playList = useCallback((tracksArray, { shuffled = false } = {}) => {
    if (!tracksArray || tracksArray.length === 0) return;
    pendingIndexRef.current = 0;
    setMode(shuffled ? "shuffle" : "normal");
    setSourceTracks([...tracksArray]); // new array reference — always retriggers the effect above
    setIsPlaying(true);
  }, []);

  const handlePlay = useCallback(
    (track) => {
      const index = queue.findIndex((t) => t._id === track._id);
      setIndex(index !== -1 ? index : 0);
      setIsPlaying(true);
    },
    [queue],
  );

  const togglePlay = useCallback(() => {
    if (currentIndex === null) return;
    setIsPlaying((p) => !p);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex === null || queue.length === 0) return;
    setIndex(
      mode === "random"
        ? Math.floor(Math.random() * queue.length)
        : (currentIndex + 1) % queue.length,
    );
    setIsPlaying(true);
  }, [currentIndex, queue, mode]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || queue.length === 0) return;
    setIndex((currentIndex - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }, [currentIndex, queue]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  }, []);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;

  // Load a new <audio> source whenever the *track* changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute("src");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting playback UI when the track is cleared, not a derived-state cascade
      setProgress(0);
       
      setDuration(0);
      return;
    }

    audio.src = currentTrack.audioUrl;
    audio.volume = volume;
     
    setProgress(0);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the track itself changes
  }, [currentTrack?._id]);

  // React to play/pause toggles without reloading the source.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Audio element event wiring (progress, duration, end-of-track behaviour).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const isLastTrack = currentIndex === queue.length - 1;
      if (repeatMode === "off" && isLastTrack && mode !== "random") {
        setIsPlaying(false);
        return;
      }
      handleNext();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [repeatMode, currentIndex, queue.length, mode, handleNext]);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        mode,
        setMode,
        currentIndex,
        currentTrack,
        loadQueueSource,
        playList,
        handlePlay,
        handleNext,
        handlePrev,
        // playback engine
        isPlaying,
        togglePlay,
        progress,
        duration,
        seek,
        volume,
        changeVolume,
        repeatMode,
        cycleRepeat,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  );
}
