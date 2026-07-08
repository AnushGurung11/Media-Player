// hooks/useStreamUrl.js
import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export function useStreamUrl(track) {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (!track) return;
    const fetchStreamUrl = async () => {
      setLoading(true);
      setError("");
      setStreamUrl(null);
      try {
        const res = await api.get(`/tracks/${track._id}/stream`);
        setStreamUrl(res.data.streamUrl);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load audio stream.");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamUrl();
  }, [track]);

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.warn("Autoplay blocked:", err.message));
    }
  }, [streamUrl]);

  return { streamUrl, loading, error, audioRef };
}