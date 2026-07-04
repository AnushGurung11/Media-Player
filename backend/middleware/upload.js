const multer = require("multer");

// Store files in memory as Buffer — no temp files on disk
// Suitable for files up to 25MB
const storage = multer.memoryStorage();

// File filter — only allow audio files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "audio/mpeg",       // .mp3
        "audio/wav",        // .wav
        "audio/mp4",        // .m4a
        "audio/flac",       // .flac
        "audio/ogg",        // .ogg
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);  // ✅ accept the file
    } else {
        cb(new Error("Only audio files are allowed (MP3, WAV, FLAC, M4A, OGG)"), false); // ❌ reject
    }
};

// Image filter — for cover art uploads
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (JPEG, PNG, WEBP)"), false);
    }
};

// 25MB limit for audio files
const uploadAudio = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB in bytes
});

// 5MB limit for cover art
const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB in bytes
});

// Combined upload — handles both audio and cover in one request
// fields: [{ name: "audio" }, { name: "cover" }]
const uploadTrack = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }
}).fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]);

module.exports = { uploadAudio, uploadImage, uploadTrack };
