/**
 * The server.js is the main entry point of node js server. 
 */
// so this will store the connection of DB

require("dotenv").config();
const cors = require("cors"); /*this is for resource sharing cross origin resource sharing */
const express = require("express"); /* creating a constant for storing the express lib from node modules*/
const connectDB = require("./config/ConnectDB");
// const rateLimit = require('express-rate-limit');
/* Creating a connection object using ConnectDB */ 
const { supabase } = require("./config/supabase");// Creating a connection with supabase
const logger = require("./logger");

const app = express(); 
connectDB(); 

const corsConfig = {
  origin: ["https://media-player-seven-pink.vercel.app","http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

// This app object is the actual back end
// this command is telling the whole backend to use this modules and functions
app.use(cors(corsConfig)); 
// Specifying the use of JSON in express
app.use(express.json()); 

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 min
//   max: 100 // max requests per window
// });
// app.use(limiter);

// the /api/auth is the initial URL and then the rest will be handled by the 
// require where remaing URL will be matched by the respective Route js file. 
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/playlists", require("./routes/playlistRoutes"));
app.use("/api/itunes", require("./routes/itunesRoutes"));
app.use("/api/tracks", require("./routes/trackRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// This line is saying that to use which port for the server to run
// We have already set the port to 5000 in .env file but if that doesnot work we can work 
// with or 5000 port we can add our own one as well. 
// Add this AFTER all your routes
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error caught:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: "Server error", 
    error: err.message 
  });
});


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Test connection on server start
const testSupabase = async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("Supabase connection failed:", error.message);
    } else {
        console.log("Supabase connected. Buckets:", data.map(b => b.name));
    }
};
testSupabase();

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`Server is running in port: ${PORT}`)); 
