const mm = require("music-metadata");
const { supabase, uploadToSupabase } = require("../config/supabase");
const Track = require("../models/Track");

const ALLOWED_LICENSES = ["all-rights-reserved", "CC0", "CC-BY", "CC-BY-SA", "CC-BY-NC"];

// -------------------------------------------------------
// @route   POST /api/tracks/preview
// @desc    Extract metadata from uploaded audio file
//          Does NOT save anything — just reads and returns
// @access  Private (admin only, via route middleware)
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
// @desc    Upload audio (+ optional cover) to Supabase, save Track to MongoDB
// @access  Private (admin only, via route middleware)
// -------------------------------------------------------
const uploadTrack = async (req, res) => {
    try {
        const audioFile = req.files?.audio?.[0];
        const coverFile = req.files?.cover?.[0]; // FIX: now genuinely optional

        if (!audioFile) {
            return res.status(400).json({ message: "No audio file provided" });
        }

        // FIX: server no longer trusts the frontend blindly for required fields.
        const { title, artist, license } = req.body;

        if (!title?.trim() || !artist?.trim()) {
            return res.status(400).json({ message: "Title and artist are required" });
        }

        // FIX: license is now whitelisted server-side instead of accepted as any string.
        if (!license || !ALLOWED_LICENSES.includes(license)) {
            return res.status(400).json({ message: "Invalid or missing license" });
        }

        // FIX: consent is now actually enforced and persisted, not just collected.
        if (req.body.consent !== "true") {
            return res.status(400).json({ message: "Consent confirmation is required" });
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

        const audioKey = await uploadToSupabase(audioFile, "audio");

        // FIX: cover is optional — only touch Supabase/coverKey if a file was actually sent.
        let coverKey = null;
        if (coverFile) {
            coverKey = await uploadToSupabase(coverFile, "cover");
        }

        const track = await Track.create({
            title:    title.trim(),
            artist:   artist.trim(),
            album:    req.body.album?.trim() || "",
            genre:    req.body.genre?.trim() || "",
            duration,
            audioKey,
            coverKey,
            license,
            uploaderId:      req.user._id,
            uploadState:     "completed",
            consentLoggedAt: new Date(), // FIX: now actually written to the DB
            consentIp:       req.ip,     // FIX: now actually written to the DB
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

// -------------------------------------------------------
// @route   DELETE /api/tracks/:id
// @desc    Delete a track — removes files from Supabase and the Mongo doc
// @access  Private (admin only, via route middleware)
// -------------------------------------------------------
const deleteTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ message: "Track not found" });
        }

        // Best-effort cleanup of storage files — don't let a storage hiccup
        // block the DB delete, but do report it back so admin knows.
        const storageErrors = [];

        if (track.audioKey) {
            const { error } = await supabase.storage.from("audio").remove([track.audioKey]);
            if (error) storageErrors.push(`audio: ${error.message}`);
        }
        if (track.coverKey) {
            const { error } = await supabase.storage.from("cover").remove([track.coverKey]);
            if (error) storageErrors.push(`cover: ${error.message}`);
        }

        await track.deleteOne();

        res.status(200).json({
            message: "Track deleted successfully",
            storageWarnings: storageErrors.length ? storageErrors : undefined,
        });

    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

module.exports = { previewTrack, uploadTrack, getAllTracks, streamTrack, downloadTrack, deleteTrack };