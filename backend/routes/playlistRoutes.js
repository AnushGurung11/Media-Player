const express = require("express");
const router = express.Router();
const {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist
} = require("../controllers/playlistController");
const { protect } = require("../middleware/authMiddleware");

// All playlist routes are protected — must be logged in
router.get("/", protect, getPlaylists);
router.get("/:id", protect, getPlaylistById);
router.post("/", protect, createPlaylist);
router.post("/:id/songs", protect, addSongToPlaylist);
router.delete("/:id/songs/:songId", protect, removeSongFromPlaylist);
router.delete("/:id", protect, deletePlaylist);

module.exports = router;