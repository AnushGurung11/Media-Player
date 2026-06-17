// This JS is for creating connection between the mongodb 

const mongoose = require("mongoose"); 

const DB_URL = process.env.MONGO_URI; // From the env file, we are accessing the actual location of the database 

const connectDB = async () => {
  try{
    await
    // Creating a connection between the nodejs and mongodb 
    mongoose.connect(DB_URL); 
    // if connected the message is displayed
    console.log("MongoBD connected"); 

    //any error will be handled here
  }catch (err){
    console.error(err.message); 

    // If any error occurs while connected to the db there exit is performed and error will be displayed
    // The code for db not connecting will be 1
    process.exit(1); 
  }
}; 

// This module will export the DB connection
module.exports = connectDB; 