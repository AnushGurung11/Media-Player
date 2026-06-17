// Taking the mongoose library and creating a new schema for the playlist collection in the database. The schema defines the structure of the documents in the collection, including the fields and their types. The schema also includes timestamps, which will automatically add createdAt and updatedAt fields to the documents. Finally, we export the model so that it can be used in other parts of the application.
const mongoose = require("mongoose");

// JS object for the playlist collection in the database
const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    shuffle: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Exporting the model in make Playlist and the blueprint to the model is playlistSchema
module.exports = mongoose.model("Playlist", playlistSchema);