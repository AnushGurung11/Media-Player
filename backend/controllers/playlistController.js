const Playlist = require("../models/Playlist");

// -------------------------------------------------------
// @route   GET /api/playlists
// @desc    Get all playlists for logged in user
// @access  Protected
// -------------------------------------------------------
const getPlaylists = async (req, res) => {
    try {
        // Only get playlists belonging to logged in user
        // req.user._id comes from authMiddleware
        const playlists = await Playlist.find({ user: req.user._id })
            .populate("songs"); // populate replaces song IDs with actual song data
        
        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/playlists/:id
// @desc    Get single playlist with all songs
// @access  Protected
// -------------------------------------------------------
const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate("songs"); // replaces ObjectIds with full song documents

        // Check if playlist exists
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Check if playlist belongs to logged in user
        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/playlists
// @desc    Create a new playlist
// @access  Protected
// -------------------------------------------------------
const createPlaylist = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Playlist name is required" });
        }

        const playlist = await Playlist.create({
            name,
            user: req.user._id, // attach logged in user as owner
            songs: []
        });

        res.status(201).json({
            message: "Playlist created successfully",
            playlist
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   PUT /api/playlists/:id/add
// @desc    Add a song to a playlist
// @access  Protected
// -------------------------------------------------------
const addSongToPlaylist = async (req, res) => {
    try {
        const { songId } = req.body;

        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Check ownership
        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check if song already exists in playlist
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        // $push adds songId to the songs array in MongoDB
        playlist.songs.push(songId);
        await playlist.save();

        res.status(200).json({
            message: "Song added to playlist",
            playlist
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   PUT /api/playlists/:id/remove
// @desc    Remove a song from a playlist
// @access  Protected
// -------------------------------------------------------
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { songId } = req.body;

        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Check ownership
        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // $pull removes the songId from songs array in MongoDB
        playlist.songs = playlist.songs.filter(
            (id) => id.toString() !== songId
        );
        await playlist.save();

        res.status(200).json({
            message: "Song removed from playlist",
            playlist
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   DELETE /api/playlists/:id
// @desc    Delete a playlist
// @access  Protected
// -------------------------------------------------------
const deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Check ownership
        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await playlist.deleteOne();
        res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist
};