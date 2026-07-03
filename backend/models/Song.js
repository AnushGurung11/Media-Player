const mongoose = require("mongoose"); // For mongobd
const songSchema = new mongoose.Schema( //Creating a schema for the song model
    {
        // Can be extracted using music-metadata library
        title: {type: String, required: true}, 
        artist: {type: String, required: true},
        album: {type: String, required: true}, 
        genre: {type: String, required: true}, 
        duration: {type: Number, required: true},

        // supabase reference for actual audio and cover image path
        audioKey: {type: String, required: true}, 
        coverKey: {type: String, required: true}, 


        // License information
        license: {
            type: String,
            enum: ["all-rights-reserved", "CC0", "CC-BY", "CC-BY-SA", "CC-BY-NC"], 
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
    
    
    },
    // Time stap for uploading and updating the song
    {timestamps: true}
); 

// Before saving the song object in MongoDB, check if the license is downloadable and set the isDownloaded field accordingly
songSchema.pre("save", async function(){
    const downloadableLiscenses = ["CC0", "CC-BY", "CC-BY-SA"];
    this.isDownloaded = downloadableLiscenses.includes(this.license);
}); 

//  exporitng the model to be used in other files
module.exports = mongoose.model("Song", songSchema);

