const express = require("express");
const router  = express.Router();
const {
    getStats,
    getAllUsers,
    deleteUser,
    getUserAnalytics,
    getSongAnalytics,
    getAllPlaylists,
} = require("../controllers/adminController");
const { protect }   = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All admin routes require login AND admin role
router.get("/stats",             protect, adminOnly, getStats);
router.get("/users",             protect, adminOnly, getAllUsers);
router.delete("/users/:id",      protect, adminOnly, deleteUser);
router.get("/analytics/users",   protect, adminOnly, getUserAnalytics);
router.get("/analytics/songs",   protect, adminOnly, getSongAnalytics);
router.get("/playlists",         protect, adminOnly, getAllPlaylists);

module.exports = router;