// context/PlayerContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal"); // "normal" | "shuffle" | "random"
  const [sourceTracks, setSourceTracks] = useState([]); // the unshuffled base list

  // Rebuild queue whenever mode or the underlying track list changes.
  // This MUST be an effect, not useMemo: shuffling uses Math.random, which
  // is an impure function React forbids calling during render. An effect
  // is the correct place for impure derived-state calculations like this.
  useEffect(() => {
    if (sourceTracks.length === 0) return;
    if (mode === "shuffle") {
      const shuffled = [...sourceTracks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: derived queue depends on an impure shuffle (Math.random) that cannot live in render/useMemo
      setQueue(shuffled);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see justification above
      setQueue([...sourceTracks]);
    }
    setIndex(null);
  }, [mode, sourceTracks]);

  // Stable identity via useCallback so consumers (HomePage) can safely
  // include this in a useEffect dependency array without infinite loops.
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

export const usePlayer = () => useContext(PlayerContext);