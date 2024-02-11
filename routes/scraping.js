const express = require("express");
const router = express.Router();
const scrapingController = require("../controller/scrapingController");

// scraping
router.get("/", scrapingController);
module.exports = router;
