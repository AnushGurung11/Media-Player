// ORM for MongoDB
const mongoose = require("mongoose");

// Define the Song schema 
// JS object
const songSchema = new mongoose.Schema({
    title: { type: String, required: true}, 
    artist: {type: String, required: true}, 
    releaseDate:{type: Date, required: true},
    url: {type: String, required: true}, 
    coverArt: {type: String, required: true}
}, {timestamps: true});

// Create the Song model using the schema
const Song = mongoose.model("Song", songSchema);   

module.exports = Song;
