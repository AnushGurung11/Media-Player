const Playlist = require("../models/Playlist");
const supabase = require("../config/supabase").supabase;

// -------------------------------------------------------
// @route   GET /api/playlists
// @desc    Get playlists visible to the logged-in user:
//          their own playlists + any public (admin-created) playlists
// @access  Protected
// -------------------------------------------------------
const getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({
            $or: [{ user: req.user._id }, { isPublic: true }]
        })
            .populate("songs")
            .populate("user", "username");

        const formatted = playlists.map((p) => ({
            ...p.toObject(),
            isOwner: p.user?._id?.toString() === req.user._id.toString()
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/playlists/:id
// @desc    Get single playlist with all songs — accessible if
//          the requester owns it, or it's public (admin-created)
// @access  Protected
// -------------------------------------------------------
const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate("songs")
            .populate("user", "username");

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const isOwner = playlist.user?._id?.toString() === req.user._id.toString();

        if (!isOwner && !playlist.isPublic) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const songsWithUrls = playlist.songs.map((song) => {
            let coverUrl = null;
            if (song.coverKey) {
                const { data } = supabase.storage
                    .from("cover")
                    .getPublicUrl(song.coverKey);
                coverUrl = data.publicUrl;
            }
            return { ...song.toObject(), coverUrl };
        });

        res.status(200).json({
            ...playlist.toObject(),
            songs: songsWithUrls,
            isOwner
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/playlists
// @desc    Create a new playlist. Admin-created playlists are
//          public (visible to everyone); user playlists are private.
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
            user: req.user._id,
            songs: [],
            isPublic: req.user.role === "admin"
        });

        res.status(201).json({
            message: "Playlist created successfully",
            playlist: { ...playlist.toObject(), isOwner: true }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/playlists/:id/songs
// @desc    Add a song to a playlist (owner only)
// @access  Protected
// -------------------------------------------------------
const addSongToPlaylist = async (req, res) => {
    try {
        const { trackId } = req.body;

        if (!trackId) {
            return res.status(400).json({ message: "trackId is required" });
        }

        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // FIX: Array.includes() on an ObjectId array never matches a plain
        // string — it compares object references, so this always returned
        // false and the duplicate check silently did nothing.
        const alreadyAdded = playlist.songs.some(
            (id) => id.toString() === trackId
        );
        if (alreadyAdded) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        playlist.songs.push(trackId);
        await playlist.save();
        await playlist.populate("songs");

        res.status(200).json({
            message: "Song added to playlist",
            playlist: { ...playlist.toObject(), isOwner: true }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   DELETE /api/playlists/:id/songs/:songId
// @desc    Remove a song from a playlist (owner only)
// @access  Protected
// -------------------------------------------------------
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { songId } = req.params;

        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        playlist.songs = playlist.songs.filter(
            (id) => id.toString() !== songId
        );
        await playlist.save();
        await playlist.populate("songs");

        res.status(200).json({
            message: "Song removed from playlist",
            playlist: { ...playlist.toObject(), isOwner: true }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   DELETE /api/playlists/:id
// @desc    Delete a playlist (owner only)
// @access  Protected
// -------------------------------------------------------
const deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

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