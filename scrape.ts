import axios from "axios";
import * as cheerio from "cheerio";
import { add, format } from "date-fns";

export interface Result {
  url: string;
  date: string;
  firstQueueTimes: string[];
  updatedTime: string | null;
  nextDate: string;
  nextQueueTimes: string[];
}
enum Website {
  URL = "https://www.roe.vsei.ua/disconnections",
}

export async function scrapeTable(): Promise<Result | null> {
  try {
    const { data } = await axios.get(Website.URL, {
      timeout: 60000,
    });

    const $ = cheerio.load(data);

    const table = $("table");
    const firstRow = table.find("tr").eq(3);
    const date: string = firstRow.find("td").eq(0).text().trim();
    const nextRow = table.find("tr").eq(4);

    // const cleanTimeString = (time: string): string => {
    //   const regex = /\d{2}:\d{2}-\d{2}:\d{2}/;
    //   const match = time.match(regex);
    //   return match ? match[0] : "";
    // };

    const getQueueTimes = (
      row: cheerio.Cheerio<cheerio.Element>,
      queueNumber: number
    ): string[] => {
      const queueCell = row.find("td").eq(queueNumber);

      const times = queueCell
        .contents()
        .map((_, el) => $(el).text().trim())
        .get();
      return times.filter((time) => /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/.test(time));
    };

    let firstQueueTimes: string[] = getQueueTimes(firstRow, 1);
    if (firstQueueTimes.length === 0) {
      firstQueueTimes = ["Очікується"];
    }

    const nextDate: string =
      nextRow.find("td").eq(0).text().trim() ||
      format(add(new Date(), {days: 1}), "dd.MM.yyyy");
    let nextQueueTimes: string[] = getQueueTimes(nextRow, 1);

    if (nextQueueTimes.length === 0) {
      nextQueueTimes = ["Очікується"];
    }

    const updatedText = $("body")
      .text()
      .match(/Оновлено: \d{2}.\d{2}.\d{4} \d{2}:\d{2}/);
    const updatedTime: string | null = updatedText
      ? updatedText[0].replace("Оновлено: ", "")
      : null;

    return {
      url: Website.URL,
      date,
      firstQueueTimes,
      nextDate,
      nextQueueTimes,
      updatedTime,
    };
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}
