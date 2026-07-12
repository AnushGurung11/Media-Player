import { useState, useEffect, useCallback } from "react";
import { PlayerContext } from "./player-context-value";

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal"); // "normal" | "shuffle" | "random"
  const [sourceTracks, setSourceTracks] = useState([]); // the unshuffled base list

  useEffect(() => {
    if (sourceTracks.length === 0) return;
    if (mode === "shuffle") {
      const shuffled = [...sourceTracks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQueue(shuffled);
    } else {
      setQueue([...sourceTracks]);
    }
    setIndex(null);
  }, [mode, sourceTracks]);

  const loadQueueSource = useCallback((tracksArray) => {
    setSourceTracks(tracksArray);
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
        loadQueueSource, handlePlay, handleNext, handlePrev,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}