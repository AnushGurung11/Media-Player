import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * Owns all playlist state: fetching playlists + available tracks,
 * creating/opening/deleting playlists, and adding/removing songs
 * from the currently selected playlist.
 */
export function usePlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMsg, setPickerMsg] = useState("");

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [playlistsRes, tracksRes] = await Promise.all([
        api.get("/playlists"),
        api.get("/tracks"),
      ]);
      setPlaylists(playlistsRes.data.playlists ?? playlistsRes.data);
      setTracks(tracksRes.data.tracks ?? tracksRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load playlists.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, not synchronous setState
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Keep `selected` in sync if playlists refresh underneath it
  // (e.g. after adding/removing a song) so the detail view doesn't go stale.
  const syncSelected = (updatedPlaylist) => {
    setSelected(updatedPlaylist);
    setPlaylists((prev) =>
      prev.map((p) => (p._id === updatedPlaylist._id ? updatedPlaylist : p)),
    );
  };

  const handleCreate = useCallback(async (name, coverFile) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { error: "Playlist name is required." };
    }
    try {
      const data = new FormData();
      data.append("name", trimmed);
      if (coverFile) data.append("cover", coverFile);
      const res = await api.post("/playlists", data);
      const newPlaylist = res.data.playlist ?? res.data;
      setPlaylists((prev) => [...prev, newPlaylist]);
      return { success: `"${newPlaylist.name}" created!` };
    } catch (err) {
      return {
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create playlist.",
      };
    }
  }, []);

  const handleOpen = useCallback((playlist) => {
    setSelected(playlist);
    setShowPicker(false);
    setPickerMsg("");
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    setShowPicker(false);
    setPickerMsg("");
  }, []);

  const handleAddSong = useCallback(
    async (trackId) => {
      if (!selected) return;
      try {
        const res = await api.post(`/playlists/${selected._id}/songs`, {
          trackId,
        });
        const updatedPlaylist = res.data.playlist ?? res.data;
        syncSelected(updatedPlaylist);
        setPickerMsg("Song added!");
      } catch (err) {
        setPickerMsg(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to add song.",
        );
      }
    },
    [selected],
  );

  const handleRemoveSong = useCallback(
    async (songId) => {
      if (!selected) return;
      try {
        const res = await api.delete(
          `/playlists/${selected._id}/songs/${songId}`,
        );
        const updatedPlaylist = res.data.playlist ?? res.data;
        syncSelected(updatedPlaylist);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to remove song.",
        );
      }
    },
    [selected],
  );

  const handleDelete = useCallback(
    async (playlist) => {
      const confirmed = window.confirm(
        `Delete "${playlist.name}"? This can't be undone.`,
      );
      if (!confirmed) return;

      try {
        await api.delete(`/playlists/${playlist._id}`);
        setPlaylists((prev) => prev.filter((p) => p._id !== playlist._id));
        if (selected?._id === playlist._id) {
          setSelected(null);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to delete playlist.",
        );
      }
    },
    [selected],
  );

  return {
    playlists,
    tracks,
    selected,
    loading,
    error,
    showPicker,
    setShowPicker,
    pickerMsg,
    setPickerMsg,
    setSelected,
    handleCreate,
    handleOpen,
    handleClose,
    handleAddSong,
    handleRemoveSong,
    handleDelete,
  };
}