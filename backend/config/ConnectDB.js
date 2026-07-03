// Here we are connecting to the mongo DB
const mongoose = require("mongoose"); 
const DB_URL = process.env.MONGO_URI; // We are adding the Mongo DB URL for the cluster using env file

// This is the main fnc for connecting to the DB
const connectDB = async () => {
  
  // Try catch block catches any errors while connecting to the DB
  try{

    await // This await keyword waits for the promise to be completed 
    mongoose.connect(DB_URL); 
    console.log("MongoBD connected"); 
   
  }catch (err){
    // Any error while running the code is catched here
    console.error(err.message); 
    // Connection failed code is 1 
    process.exit(1); 
  }
}; 

//  The connection function is exported. 
module.exports = connectDB; 