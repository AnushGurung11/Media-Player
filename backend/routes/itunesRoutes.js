const express = require("express");
const router = express.Router();
const { searchItunes } = require("../controllers/itunesController");

router.get("/search", searchItunes);

module.exports = router;