// So express module lai node modules bata import gare ko
const express = require("express");
// Requireed router module from express
const router = express.Router();

console.log("Auth routes loaded");
// Importing the register, login, and oauth functions from authController.js
const { register, login, oauthLogin } = require("../controllers/authController");

// Routing the URL
router.post("/register", register);
router.post("/login", login);
router.post("/oauth", oauthLogin);

// Exporting the router at the end as we are adding in the outer module instance
module.exports = router;