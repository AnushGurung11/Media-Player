const express = require("express");
const router = express.Router();

// your routes here
router.get("/login", (req, res) => { res.send("Hello, login page!"); });
router.post("/register", (req, res) => { res.send("Hello, register page!"); });

//  This line is critical — without it, require() returns undefined
module.exports = router;