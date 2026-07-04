const express    = require("express");
const router     = express.Router();
const { previewTrack, uploadTrack, getAllTracks, streamTrack, downloadTrack } = require("../controllers/trackController");
const { protect }     = require("../middleware/authMiddleware");
const { adminOnly }   = require("../middleware/adminMiddleware");
const { uploadTrack: uploadMiddleware } = require("../middleware/upload");

// Public
router.get("/",              getAllTracks);
router.get("/:id/stream",   protect, streamTrack);
router.get("/:id/download", protect, downloadTrack);

// Private — any logged in user can preview and upload
router.post("/preview", protect, uploadMiddleware, previewTrack);

// Note: /upload uses the same uploadMiddleware to handle multipart form data
// but preview only receives audio, upload receives audio + cover + form fields
router.post("/upload",  protect, uploadMiddleware, uploadTrack);

module.exports = router;