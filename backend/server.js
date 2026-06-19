/**
 * The server.js is the main entry point of node js server. 
 */
const express = require("express"); /* creating a constant for storing the express lib from node modules*/
const cors = require("cors"); /*this is for resource sharing cross origin resource sharing */


// so this will store the connection of DB
require("dotenv").config();
const connectDB = require("./config/ConnectDB");
/* Creating a connection object using ConnectDB */ 

const app = express(); 
connectDB(); 

// This app object is the actual back end
// this command is telling the whole backend to use this modules and functions
app.use(cors()); 
// Specifying the use of JSON in express
app.use(express.json()); 

// the /api/auth is the initial URL and then the rest will be handled by the 
// require where remaing URL will be matched by the respective Route js file. 
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/songs", require("./routes/songRoutes"));
app.use("/api/playlists", require("./routes/playlistRoutes"));
app.use("/api/itunes", require("./routes/itunesRoutes"));

// This line is saying that to use which port for the server to run
// We have already set the port to 5000 in .env file but if that doesnot work we can work 
// with or 5000 port we can add our own one as well. 
// Add this AFTER all your routes
app.use((err, req, res, next) => {
  console.error('Error caught:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: "Server error", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`Server is running in port: ${PORT}`)); 
