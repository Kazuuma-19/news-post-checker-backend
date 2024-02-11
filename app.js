const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes/index");
const scrapingRouter = require("./routes/scraping");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/students", indexRouter);
app.use("/scraping", scrapingRouter);

module.exports = app;
