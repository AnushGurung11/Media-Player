const mongoose = require("mongoose"); // For mongodb

const ALLOWED_LICENSES = ["all-rights-reserved", "CC0", "CC-BY", "CC-BY-SA", "CC-BY-NC"];
const DOWNLOADABLE_LICENSES = ["CC0", "CC-BY", "CC-BY-SA"];

const trackSchema = new mongoose.Schema( //Creating a schema for the song model
    {
        // Can be extracted using music-metadata library
        title: {type: String, required: true},
        artist: {type: String, required: true},

        // FIX: these were required:true but your upload UI treats them as optional.
        // Uploading without album/genre was throwing a validation error before this change.
        album: {type: String, trim: true, default: ""},
        genre: {type: String, trim: true, default: ""},

        duration: {type: Number, required: true},

        // supabase reference for actual audio and cover image path
        audioKey: {type: String, required: true},

        // FIX: was required:true — your UI labels cover art "(Optional)", so this
        // must allow null or every cover-less upload fails.
        coverKey: {type: String, default: null},


        // License information
        license: {
            type: String,
            enum: ALLOWED_LICENSES,
            required: true
        },

        // For the song download and consent logging
        isDownloadable: {type: Boolean, default: false},
        consentLoggedAt: {type: Date, default: null},
        consentIp: {type: String, default: null},

        // Upload state
        uploadState: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },

        //  user who uploaded the song
        uploaderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},

        //  Counting the number of times the song has been played
        playCount: {type: Number, default: 0},
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


    },
    // Time stap for uploading and updating the song
    {timestamps: true}
);

// Before saving the song object in MongoDB, check if the license is downloadable and set the isDownloadable field accordingly
trackSchema.pre("save", async function(){
    // FIX: this line was setting `this.isDownloaded`, a field that does not exist
    // on the schema — it was silently discarded and never saved. isDownloadable
    // stayed false forever regardless of license, which is why downloads never worked.
    this.isDownloadable = DOWNLOADABLE_LICENSES.includes(this.license);
});

//  exporitng the model to be used in other files
module.exports = mongoose.model("Track", trackSchema);