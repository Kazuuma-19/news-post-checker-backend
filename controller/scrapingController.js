const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const puppeteer = require("puppeteer");
const { DateTime } = require("luxon");
require("dotenv").config();
// eslint-disable-next-line no-undef
const dotenv = process.env;

/**
 * スクレイピングを行い、データを取得
 * @param {} pageUrl
 * @returns {array of objects} 各投稿の名前、返信かどうか、投稿時間を配列形式で返却
 */
const scrapePageData = async (pageUrl) => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl);

    // 環境変数からログイン情報を参照し、ログイン
    await page.type(".form-username-slash input", dotenv.LOGIN_USERNAME);
    await page.type(".form-password-slash input", dotenv.LOGIN_PASSWORD);
    await page.click(".login-button");

    await page.waitForNavigation();

    /**
     * サイトから必要な要素を取得
     * 名前、返信かどうか、投稿時間
     * @return {array of objects} 各投稿の名前、返信かどうか、投稿時間を配列形式で返却
     */
    const data = await page.evaluate(() => {
      // 1つの投稿を囲うブロックを取得
      const elementsBlock = Array.from(
        document.querySelectorAll(".vr_followContentsColumn"),
      );
      // 各要素に分解
      return elementsBlock.map((element) => ({
        name: element.querySelector(".vr_followUserName").innerText,
        reply: !!element.querySelector(".vr_followHeaderTo"),
        dateString: element
          .querySelector(".vr_followTime")
          .innerText.replace(/\([日月火水木金土]\)/, ""),
      }));
    });

    // evaluateの中では、DateTimeにアクセスできないため、ここで処理をする
    return data.map(({ name, reply, dateString }) => ({
      name,
      reply,
      // 時刻を日本時間として扱うように設定
      dateTime: DateTime.fromFormat(dateString, "yyyy/M/d H:mm", {
        zone: "Asia/Tokyo",
      }),
    }));
  } catch (error) {
    console.error("Error during scraping:", error);
    throw new Error("Scraping failed");
  } finally {
    await browser.close();
  }
};

/**
 * 投稿数と返信数をカウント
 * @param {*} postData スクレイピングしたデータ
 * @returns {array of objects} 投稿数と返信数、日時をカウントしたデータを返却
 */
const countPosts = async (postData) => {
  try {
    // データベースから全ての学生を取得
    const allStudents = await prisma.student.findMany();

    return allStudents.map((student) => {
      let replyCount = 0;
      let postCount = 0;
      const dateReplyTime = [];
      const datePostTime = [];

      // 名前の空白を削除
      const trimmedStudentName = student.name.replace(/\s/g, "");

      // スクレイピングしたデータから返信数と投稿数、日時をカウント
      postData.forEach((post) => {
        if (trimmedStudentName === post.name.replace(/\s/g, "")) {
          // 返信の場合
          if (post.reply) {
            dateReplyTime.push(post.dateTime);
            replyCount++;
          } else {
            postCount++;
            datePostTime.push(post.dateTime);
          }
        }
      });

      return {
        ...student,
        reply: { replyCount, dateTime: dateReplyTime },
        post: { postCount, dateTime: datePostTime },
      };
    });
  } catch (error) {
    console.error("Error retrieving student:", error);
    return [];
  }
};

/**
 * スクレイピング用コンストラクタ
 * @param {*} req
 * @param {*} res
 */
const scrapingController = async (req, res) => {
  try {
    const newsUrl = decodeURIComponent(req.query.url);
    const postData = await scrapePageData(newsUrl);
    const countedPosts = await countPosts(postData);
    res.json(countedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = scrapingController;
