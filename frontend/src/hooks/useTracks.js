// hooks/useTracks.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useTracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTracks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tracks");
      setTracks(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load tracks.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, not synchronous setState
    loadTracks();
  }, []);

  return { tracks, setTracks, loading, error, loadTracks };
}