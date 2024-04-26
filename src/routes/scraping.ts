import express from "express";
const router = express.Router();
import scrapingController from "../controller/scrapingController";

// scraping
router.get("/", scrapingController);

export default router;
