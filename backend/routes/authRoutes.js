// So express module lai node modules bata import gare ko
const express = require("express");
// Requireed router module from express
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); /// Auto auth

console.log("Auth routes loaded");
// Importing the register and login fucntion form authController.js
const {register,login} = require("../controllers/authController"); 


// Routing the URL
router.post("/register", register);
router.post("/login", login); 

// Exporting the router at the end as we are adding in the outer module instance
module.exports = router; 

