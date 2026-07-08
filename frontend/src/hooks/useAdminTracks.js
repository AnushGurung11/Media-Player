// hooks/useAdminTracks.js
import { useState } from "react";
import api from "../services/api";
import { useTracks } from "./useTracks";

export function useAdminTracks() {
  const { tracks, setTracks, loading, error } = useTracks();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (track) => {
    if (!window.confirm(`Delete "${track.title}" by ${track.artist}? This cannot be undone.`)) return;
    setDeletingId(track._id);
    setDeleteError("");
    try {
      await api.delete(`/tracks/${track._id}`);
      setTracks((prev) => prev.filter((t) => t._id !== track._id));
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.response?.data?.error || "Failed to delete track.");
    } finally {
      setDeletingId(null);
    }
  };

  return { tracks, loading, error: error || deleteError, deletingId, handleDelete };
}