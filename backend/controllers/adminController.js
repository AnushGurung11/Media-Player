// Importing the required models
const User     = require("../models/User");
const Song     = require("../models/Track");
const Playlist = require("../models/Playlist");

/**
 * @route  GET /api/admin/stats
 * @desc   Get overview counts for admin dashboard
 * @access Admin only 
 */
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
/**
*@route   GET /api/admin/users
*@desc    Get all users with their active status
*@access  Admin only
 */
// Gets all user exclusing the password and user with role user only
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
            // This is based on the user schema it self
            lastLogin: user.lastLogin,
            // This is also calcualted in the user model as well
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

// -------------------------------------------------------
// @route   GET /api/admin/analytics/users
// @desc    Registration trend + active-hour distribution for charts
// @access  Admin only
// -------------------------------------------------------
const getUserAnalytics = async (req, res) => {
    try {
        const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // New registrations per day, last 30 days
        const registrationsByDay = await User.aggregate([
            { $match: { role: "user", createdAt: { $gte: THIRTY_DAYS_AGO } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } }
        ]);

        // NOTE: we only keep a single lastLogin timestamp per user, not a full
        // login-history log — this is an approximation of peak activity hours,
        // not a true session histogram.
        const activeByHour = await User.aggregate([
            { $match: { role: "user" } },
            {
                $group: {
                    _id: { $hour: "$lastLogin" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, hour: "$_id", count: 1 } }
        ]);

        res.status(200).json({ registrationsByDay, activeByHour });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/admin/analytics/songs
// @desc    Most played, most liked, and upload trend for charts
// @access  Admin only
// -------------------------------------------------------
const getSongAnalytics = async (req, res) => {
    try {
        const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [mostPlayed, mostLiked, uploadsByDay] = await Promise.all([
            Song.find({ uploadState: "completed" })
                .sort({ playCount: -1 })
                .limit(10)
                .select("title artist playCount"),

            Song.aggregate([
                { $match: { uploadState: "completed" } },
                { $project: { title: 1, artist: 1, likesCount: { $size: { $ifNull: ["$likedBy", []] } } } },
                { $sort: { likesCount: -1 } },
                { $limit: 10 }
            ]),

            Song.aggregate([
                { $match: { createdAt: { $gte: THIRTY_DAYS_AGO } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, date: "$_id", count: 1 } }
            ])
        ]);

        res.status(200).json({ mostPlayed, mostLiked, uploadsByDay });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/admin/playlists
// @desc    Get all playlists with owner + song count
// @access  Admin only
// -------------------------------------------------------
const getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find()
            .populate("user", "username email")
            .populate("songs", "title artist");

        const formatted = playlists.map((p) => ({
            id: p._id,
            name: p.name,
            owner: p.user?.username || "Unknown",
            songCount: p.songs.length,
            shuffle: p.shuffle,
            createdAt: p.createdAt
        }));

        res.status(200).json(formatted);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getStats, getAllUsers, deleteUser, getUserAnalytics, getSongAnalytics, getAllPlaylists };