// Axios is for making Http request to third party API
const axios = require("axios");

// -------------------------------------------------------
// @route   GET /api/itunes/search?q=
// @desc    Search songs from iTunes API
// @access  Public
// -------------------------------------------------------

// Creating an async function 
const searchItunes = async (req, res) => {
    try {

        // q will get the request attached data
        // Send by the client  
        const query = req.query.q;

        // Checking for empty query
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Call the iTunes Search API
        // For making response
        const response = await axios.get("https://itunes.apple.com/search", {
            // Making HTTP request to iTunes API with query parameters 
            params: {
                term: query,
                media: "music",
                limit: 20
            }
        });

        // iTunes returns a LOT of fields — we only map what our Song schema needs
        const songs = response.data.results.map((item) => ({
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : null,
            url: item.previewUrl,       // 30 second preview clip
            coverArt: item.artworkUrl100,
            genre: item.primaryGenreName,
            itunesId: item.trackId      // useful to prevent duplicate imports later
        }));

        res.status(200).json(songs);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { searchItunes };