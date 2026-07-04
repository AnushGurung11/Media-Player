const mm       = require("music-metadata");
const { v4: uuidv4 } = require("uuid");
const { supabase, uploadToSupabase } = require("../config/supabase");
const Track    = require("../models/Track");

// -------------------------------------------------------
// @route   POST /api/tracks/preview
// @desc    Extract metadata from uploaded audio file
//          Does NOT save anything — just reads and returns
// @access  Private (must be logged in)
// -------------------------------------------------------
const previewTrack = async (req, res) => {
    try {
        const audioFile = req.files?.audio?.[0];

        if (!audioFile) {
            return res.status(400).json({ message: "No audio file provided" });
        }

        const metadata = await mm.parseBuffer(
            audioFile.buffer,
            audioFile.mimetype,
            { duration: true }
        );

        const extracted = {
            title:    metadata.common.title      || "Unknown Title",
            artist:   metadata.common.artist     || "Unknown Artist",
            album:    metadata.common.album      || "Unknown Album",
            genre:    metadata.common.genre?.[0] || "Unknown",
            duration: metadata.format.duration
                        ? Math.round(metadata.format.duration)
                        : null,
            filename: audioFile.originalname,
            filesize: audioFile.size,
            mimetype: audioFile.mimetype,
        };

        res.status(200).json({
            message: "Metadata extracted successfully",
            metadata: extracted
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to extract metadata", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/tracks/upload
// @desc    Upload audio + cover to Supabase, save Track to MongoDB
// @access  Private (must be logged in)
// -------------------------------------------------------
const uploadTrack = async (req, res) => {
    try {
        const audioFile = req.files?.audio?.[0];
        const coverFile = req.files?.cover?.[0];

        if (!audioFile) {
            return res.status(400).json({ message: "No audio file provided" });
        }
        if (!coverFile) {
            return res.status(400).json({ message: "No cover image provided" });
        }

        // Extract duration from audio metadata
        const metadata = await mm.parseBuffer(
            audioFile.buffer,
            audioFile.mimetype,
            { duration: true }
        );
        const duration = metadata.format.duration
            ? Math.round(metadata.format.duration)
            : null;

        if (!duration) {
            return res.status(400).json({ message: "Could not determine audio duration" });
        }

        // Upload both files to their respective Supabase buckets
        const audioKey = await uploadToSupabase(audioFile, "audio");
        const coverKey = await uploadToSupabase(coverFile, "cover");

        const track = await Track.create({
            title:    req.body.title,
            artist:   req.body.artist,
            album:    req.body.album,
            genre:    req.body.genre,
            duration,
            audioKey,
            coverKey,
            license:     req.body.license,
            uploaderId:  req.user._id,
            uploadState: "completed",
        });

        res.status(201).json({ message: "Track uploaded successfully", track });

    } catch (error) {
        res.status(400).json({ message: "Upload failed", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/tracks
// @desc    Get all ready tracks (public)
// @access  Public
// -------------------------------------------------------
const getAllTracks = async (req, res) => {
    try {
        const tracks = await Track.find({ uploadState: "completed" })
            .select("-audioKey -consentIp")
            .populate("uploaderId", "username");

        const tracksWithUrls = tracks.map((track) => {
            let coverUrl = null;
            if (track.coverKey) {
                const { data } = supabase.storage
                    .from("cover")
                    .getPublicUrl(track.coverKey);
                coverUrl = data.publicUrl;
            }
            return { ...track.toObject(), coverUrl };
        });

        res.status(200).json(tracksWithUrls);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/tracks/:id/stream
// @desc    Get a signed URL for streaming audio
// @access  Private
// -------------------------------------------------------
const streamTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track || track.uploadState !== "completed") {
            return res.status(404).json({ message: "Track not found" });
        }

        track.playCount += 1;
        await track.save();

        const { data, error } = await supabase.storage
            .from("audio")
            .createSignedUrl(track.audioKey, 3600);

        if (error) {
            return res.status(500).json({ message: "Could not generate stream URL", error: error.message });
        }

        res.status(200).json({ streamUrl: data.signedUrl });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   GET /api/tracks/:id/download
// @desc    Get download URL — only if track license allows it
// @access  Private
// -------------------------------------------------------
const downloadTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track || track.uploadState !== "completed") {
            return res.status(404).json({ message: "Track not found" });
        }

        if (!track.isDownloadable) {
            return res.status(403).json({
                message: "This track is not available for download",
                license: track.license
            });
        }

        const { data, error } = await supabase.storage
            .from("audio")
            .createSignedUrl(track.audioKey, 300, {
                download: true
            });

        if (error) {
            return res.status(500).json({ message: "Could not generate download URL", error: error.message });
        }

        res.status(200).json({ downloadUrl: data.signedUrl });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { previewTrack, uploadTrack, getAllTracks, streamTrack, downloadTrack };