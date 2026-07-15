// hooks/useAdminPlaylists.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useAdminPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/playlists");
        setPlaylists(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { playlists, loading, error };
}