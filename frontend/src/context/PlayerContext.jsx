import { useState, useEffect, useRef, useCallback } from "react";
import { PlayerContext } from "./player-context-value";

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal"); // "normal" | "shuffle" | "random"
  const [sourceTracks, setSourceTracks] = useState([]); // the unshuffled base list

  // Set by playList() right before a queue swap, so the effect below knows
  // to jump straight to a track instead of resetting to "nothing playing".
  const pendingIndexRef = useRef(null);

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
  }, []);

  const handlePlay = (track) => {
    const index = queue.findIndex((t) => t._id === track._id);
    setIndex(index !== -1 ? index : 0);
  };

  const handleNext = () => {
    if (currentIndex === null || queue.length === 0) return;
    setIndex(
      mode === "random"
        ? Math.floor(Math.random() * queue.length)
        : (currentIndex + 1) % queue.length
    );
  };

  const handlePrev = () => {
    if (currentIndex === null || queue.length === 0) return;
    setIndex((currentIndex - 1 + queue.length) % queue.length);
  };

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;

  return (
    <PlayerContext.Provider
      value={{
        queue, mode, setMode, currentIndex, currentTrack,
        loadQueueSource, playList, handlePlay, handleNext, handlePrev,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}