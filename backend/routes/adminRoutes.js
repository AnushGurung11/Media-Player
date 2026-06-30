const express = require("express");
const router  = express.Router();
const { getStats, getAllUsers, deleteUser } = require("../controllers/adminController");
const { protect }   = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All admin routes require login AND admin role
router.get("/stats",       protect, adminOnly, getStats);
router.get("/users",       protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;