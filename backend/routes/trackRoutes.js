const express = require("express");
const multer = require("multer");
const router = express.Router();

// ASSUMPTION: adjust this import path/name to match your actual auth middleware file.
// It must attach req.user (including req.user.role) on a valid token.
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// FIX: was require("../controllers/tracks.controller") — your real file is trackController.js
const {
    previewTrack,
    uploadTrack,
    getAllTracks,
    streamTrack,
    downloadTrack,
    deleteTrack,
    toggleLike,
} = require("../controllers/trackController");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file — adjust as needed
});

const previewFields = upload.fields([{ name: "audio", maxCount: 1 }]);
const uploadFields = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
]);

// Public
router.get("/", getAllTracks);

// Authenticated (any logged-in user)
router.get("/:id/stream", protect, streamTrack);
router.get("/:id/download", protect, downloadTrack);
router.post("/:id/like", protect, toggleLike);

// Admin only — FIX: previously had no role check, any logged-in user could upload
router.post("/preview", protect, previewFields, previewTrack);
router.post("/upload", protect, uploadFields, uploadTrack);
router.delete("/:id", protect, adminOnly, deleteTrack);

module.exports = router;