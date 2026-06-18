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
router.put("/:id/add", protect, addSongToPlaylist);
router.put("/:id/remove", protect, removeSongFromPlaylist);
router.delete("/:id", protect, deletePlaylist);

module.exports = router;