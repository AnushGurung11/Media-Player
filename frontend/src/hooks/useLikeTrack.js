// hooks/useLikeTrack.js
import { useState } from "react";
import api from "../services/api";

export function useLikeTrack() {
  const [likingId, setLikingId] = useState(null);

  const toggleLike = async (trackId) => {
    setLikingId(trackId);
    try {
      const res = await api.post(`/tracks/${trackId}/like`);
      return res.data; // { liked, likesCount }
    } catch (err) {
      return { error: err.response?.data?.message || "Failed to update like." };
    } finally {
      setLikingId(null);
    }
  };

  return { toggleLike, likingId };
}