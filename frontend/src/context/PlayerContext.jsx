// context/PlayerContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setIndex] = useState(null);
  const [mode, setMode] = useState("normal"); // "normal" | "shuffle" | "random"
  const [sourceTracks, setSourceTracks] = useState([]); // the unshuffled base list

  // Rebuild queue whenever mode or the underlying track list changes
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

  // Call this whenever a page loads a new list of tracks to play from
  // (HomePage passes all tracks, Playlist passes selected.songs)
  const loadQueueSource = (tracksArray) => {
    setSourceTracks(tracksArray);
  };

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