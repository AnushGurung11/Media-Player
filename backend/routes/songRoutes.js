const express    = require("express");
const router     = express.Router();
const { getAllSongs, getSongById, searchSongs, addSong, deleteSong } = require("../controllers/songController");
const { protect }   = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.get("/",        getAllSongs);
router.get("/search",  searchSongs);
router.get("/:id",     getSongById);

// Admin only — must be logged in AND be an admin
router.post("/",    protect, adminOnly, addSong);
router.delete("/:id", protect, adminOnly, deleteSong);

module.exports = router;