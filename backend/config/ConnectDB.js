// Here we are connecting to the mongo DB
const mongoose = require("mongoose");
const DB_URL = process.env.MONGO_URI; // We are adding the Mongo DB URL for the cluster using env file

// This is the main fnc for connecting to the DB
const connectDB = async () => {
  if (!DB_URL) {
    console.error("MONGO_URI is not set. Set it in the environment (Render dashboard) and redeploy.");
    return false;
  }

  // Try catch block catches any errors while connecting to the DB
  try {
    // This await keyword waits for the promise to be completed
    await mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    // Any error while running the code is catched here.
    // Do NOT call process.exit(1) here: a temporary DNS/network outage would
    // otherwise crash the container and put the deploy into a restart loop.
    console.error("MongoDB connection failed:", err.message);
    console.error("Check that MONGO_URI is correct and the Atlas cluster is running.");
    return false;
  }
};

// Log later connection failures instead of crashing the process.
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

//  The connection function is exported.
module.exports = connectDB;
