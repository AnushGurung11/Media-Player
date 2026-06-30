const User     = require("../models/User");
const Song     = require("../models/Song");
const Playlist = require("../models/Playlist");

// -------------------------------------------------------
// @route   GET /api/admin/stats
// @desc    Get overview counts for admin dashboard
// @access  Admin only
// -------------------------------------------------------
const getStats = async (req, res) => {
    try {
        // Running all counts in parallel — faster than one by one
        const [totalSongs, totalPlaylists, totalUsers, allUsers] = await Promise.all([
            Song.countDocuments(),
            Playlist.countDocuments(),
            User.countDocuments({ role: "user" }), // only count normal users, not admins
            User.find({ role: "user" })
        ]);

        // Count how many users are "active" right now (logged in within 15 min)
        const activeUsers = allUsers.filter((u) => u.isOnline()).length;

        res.status(200).json({
            totalSongs,
            totalPlaylists,
            totalUsers,
            activeUsers
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/admin/users
// @desc    Get all users with their active status
// @access  Admin only
// -------------------------------------------------------
const getAllUsers = async (req, res) => {
    try {
        // Exclude password, get normal users only (not other admins)
        const users = await User.find({ role: "user" }).select("-password");

        // Add computed "isActive" field to each user before sending
        const usersWithStatus = users.map((user) => ({
            id:        user._id,
            username:  user.username,
            email:     user.email,
            joinedAt:  user.createdAt,
            lastLogin: user.lastLogin,
            isActive:  user.isOnline()   // true/false computed live
        }));

        res.status(200).json(usersWithStatus);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   DELETE /api/admin/users/:id
// @desc    Delete/ban a user
// @access  Admin only
// -------------------------------------------------------
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getStats, getAllUsers, deleteUser };