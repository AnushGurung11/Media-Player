const express = require("express"); // for the express 
const router = express.Router(); // for routing functionality
const { getAllSongs, getSongById, searchSongs, addSong, deleteSong } = require("../controllers/songController"); // Importing functionalaity of Controller
const { protect } = require("../middleware/authMiddleware"); /// Auto auth 

// Public routes — no token needed
router.get("/", getAllSongs);
router.get("/search", searchSongs);
router.get("/:id", getSongById);

// Protected routes — token required
router.post("/", protect, addSong);
router.delete("/:id", protect, deleteSong);

module.exports = router;