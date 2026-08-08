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
const { uploadImage } = require("../middleware/upload");

// All playlist routes are protected — must be logged in
router.get("/", protect, getPlaylists);
router.get("/:id", protect, getPlaylistById);
// Optional cover image (JPEG/PNG/WEBP, max 5MB) — same bucket as track covers
router.post("/", protect, uploadImage.single("cover"), createPlaylist);
router.post("/:id/songs", protect, addSongToPlaylist);
router.delete("/:id/songs/:songId", protect, removeSongFromPlaylist);
router.delete("/:id", protect, deletePlaylist);

module.exports = router;