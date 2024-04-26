import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import puppeteer from "puppeteer";
import { DateTime } from "luxon";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import { ScrapedData } from "../types/post";

/**
 * スクレイピングを行い、データを取得
 * @param {} pageUrl
 * @returns {array of objects} 各投稿の名前、返信かどうか、投稿時間を配列形式で返却
 */
const scrapePageData = async (pageUrl: string): Promise<ScrapedData[]> => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl);

    // 環境変数からログイン情報を参照し、ログイン
    await page.type(
      ".form-username-slash input",
      process.env.LOGIN_USERNAME as string,
    );
    await page.type(
      ".form-password-slash input",
      process.env.LOGIN_PASSWORD as string,
    );
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
        name: (element.querySelector(".vr_followUserName") as HTMLElement)
          ?.innerText,
        reply: !!element.querySelector(".vr_followHeaderTo"),
        dateString: (
          element.querySelector(".vr_followTime") as HTMLElement
        )?.innerText.replace(/\([日月火水木金土]\)/, ""),
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
const countPosts = async (postData: ScrapedData[]) => {
  try {
    // データベースから活動中の全ての学生を取得
    const allStudents = await prisma.student.findMany({
      where: {
        active: true,
      },
      orderBy: [{ grade: "desc" }, { name: "asc" }],
    });

    return allStudents.map((student) => {
      let replyCount = 0;
      let postCount = 0;
      const dateReplyTime: string[] = [];
      const datePostTime: string[] = [];

      // 名前の空白を削除
      const trimmedStudentName = student.name.replace(/\s/g, "");

      // スクレイピングしたデータから返信数と投稿数、日時をカウント
      postData.forEach((post) => {
        if (trimmedStudentName === post.name.replace(/\s/g, "")) {
          // 返信の場合
          if (post.reply) {
            dateReplyTime.push(post.dateTime.toString());
            replyCount++;
          } else {
            postCount++;
            datePostTime.push(post.dateTime.toString());
          }
        }
      });

      return {
        ...student,
        reply: { count: replyCount, dateTime: dateReplyTime },
        post: { count: postCount, dateTime: datePostTime },
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
const scrapingController = async (req: Request, res: Response) => {
  try {
    const newsUrl = decodeURIComponent(req.query.url as string);
    const postData = await scrapePageData(newsUrl);
    const countedPosts = await countPosts(postData);
    res.json(countedPosts);
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    res.status(500).json({ error: message });
  }
};

export default scrapingController;
