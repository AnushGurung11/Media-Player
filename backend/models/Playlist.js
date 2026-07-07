
const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
    shuffle: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Playlist", playlistSchema);