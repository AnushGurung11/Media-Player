const Song = require("../models/Song");

// -------------------------------------------------------
// @route   GET /api/songs
// @desc    Get all songs
// @access  Public
// -------------------------------------------------------
const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/songs/:id
// @desc    Get single song by ID
// @access  Public
// -------------------------------------------------------
const getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        res.status(200).json(song);
    } catch (error) {
        // Handle invalid ObjectId format (e.g. /api/songs/not-a-valid-id)
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid song ID format" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/songs/search?q=
// @desc    Search songs by title or artist
// @access  Public
// -------------------------------------------------------
const searchSongs = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // $regex allows partial matching — like SQL LIKE '%query%'
        // $options: "i" means case insensitive
        const songs = await Song.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { artist: { $regex: query, $options: "i" } }
            ]
        });

        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/songs
// @desc    Add a new song
// @access  Protected
// -------------------------------------------------------
const addSong = async (req, res) => {
    try {
        // Destructure only fields that exist in the schema
        const { title, artist, releaseDate, url, coverArt } = req.body;

        // Mirror the schema's required fields exactly
        if (!title || !artist || !releaseDate || !url || !coverArt) {
            return res.status(400).json({
                message: "Title, artist, releaseDate, url, and coverArt are required"
            });
        }

        const song = await Song.create({
            title,
            artist,
            releaseDate,
            url,
            coverArt
        });

        res.status(201).json({
            message: "Song added successfully",
            song
        });
    } catch (error) {
        // Mongoose validation errors (e.g. wrong type for releaseDate)
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   DELETE /api/songs/:id
// @desc    Delete a song
// @access  Protected
// -------------------------------------------------------
const deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        await song.deleteOne();
        res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid song ID format" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllSongs, getSongById, searchSongs, addSong, deleteSong };