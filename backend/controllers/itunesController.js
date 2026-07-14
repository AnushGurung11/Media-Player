// Axios is for making Http request to third party API
const axios = require("axios");

// -------------------------------------------------------
// @route   GET /api/itunes/search?q=
// @desc    Search songs from iTunes API (30s preview only)
// @access  Public
// -------------------------------------------------------

const searchItunes = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const response = await axios.get("https://itunes.apple.com/search", {
            params: {
                term: query,
                media: "music",
                limit: 20
            }
        });

        // Mapped to look like our local Track objects (coverUrl, _id, etc.)
        // so the same PlayerContext queue and <Player /> component can
        // handle both local tracks and iTunes results without branching
        // logic everywhere.
        const songs = response.data.results.map((item) => ({
            _id: `itunes-${item.trackId}`,        // prefixed so it can never collide with a Mongo ObjectId
            source: "itunes",                       // lets Player.jsx know NOT to call /tracks/:id/stream
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : null,
            url: item.previewUrl,                   // 30 second preview clip — used directly as <audio> src
            coverUrl: item.artworkUrl100
                ? item.artworkUrl100.replace("100x100bb", "300x300bb") // ask iTunes for a bigger image
                : null,
            genre: item.primaryGenreName,
            itunesId: item.trackId
        }));

        res.status(200).json(songs);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { searchItunes };