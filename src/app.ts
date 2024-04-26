import express, { Express } from "express";
import cors from "cors";
import indexRouter from "./routes/index";
import scrapingRouter from "./routes/scraping";

const app: Express = express();

const PORT = 8080;

app.listen(PORT, () => {
  console.log("サーバー起動");
});

app.use(cors());

app.use(express.json());

app.use("/students", indexRouter);
app.use("/scraping", scrapingRouter);

export default app;
