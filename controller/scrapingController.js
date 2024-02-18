const puppeteer = require("puppeteer");
const { DateTime } = require("luxon");
require("dotenv").config();
// eslint-disable-next-line no-undef
const dotenv = process.env;

const scrapingController = async (req, res) => {
  try {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const homeUrl = dotenv.LOGIN_URL;
    await page.goto(homeUrl);

    const address = dotenv.LOGIN_USERNAME;
    const password = dotenv.LOGIN_PASSWORD;
    await page.type(".form-username-slash input", address);
    await page.type(".form-password-slash input", password);
    await page.click(".login-button");

    await page.waitForNavigation();

    // jump to news page
    const newPage = await browser.newPage();
    const newsUrl = decodeURIComponent(req.query.url);
    await newPage.goto(newsUrl);

    const postData = await newPage.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(".vr_followContentsColumn"),
      );
      return elements.map((element) => {
        const name = element.querySelector(".vr_followUserName").innerText;
        const reply = !!element.querySelector(".vr_followHeaderTo");
        const dateString = element.querySelector(".vr_followTime").innerText;

        return { name, reply, dateString };
      });
    });

    const processedData = postData.map((data) => {
      const dateStringWithoutDay = data.dateString.replace(
        /\([日月火水木金土]\)/,
        "",
      );
      const formatString = "yyyy/M/d HH:mm";
      const time = DateTime.fromFormat(dateStringWithoutDay, formatString, {
        zone: "Asia/Tokyo",
      });

      return {
        ...data,
        dateTime: time,
      };
    });

    await browser.close();
    res.json(processedData);
  } catch (error) {
    console.error("Error retrieving student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = scrapingController;
