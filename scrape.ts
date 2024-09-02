import axios from "axios";
import * as cheerio from "cheerio";

import { exec } from "child_process";
import { promisify } from "util";

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

// Перетворюємо exec на функцію, яка повертає проміс
const execAsync = promisify(exec);

async function fetchWithCurl(): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      "curl -k https://www.roe.vsei.ua/disconnections"
    );

    if (stderr) {
      console.warn(`Stderr: ${stderr}`);
      // Ви можете обробляти stderr додатково або ігнорувати
    }

    return stdout; // Повертаємо дані сторінки
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error; // Генеруємо помилку, щоб викликаючий код міг її обробити
  }
}

async function fetchWithAxios(): Promise<string> {
  try {
    const { data } = await axios.get(Website.URL, {
      timeout: 60000,
    });
    return data;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

export async function scrapeTable(): Promise<Result | null> {
  try {
    let data;
    if (Bun.env.USE_CURL === "1") {
      data = await fetchWithCurl();
    } else if (Bun.env.USE_CURL === "0") {
      data = await fetchWithAxios();
    }
    
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
      console.log(`Queue Cell HTML: ${queueCell.html()}`);
    
      const times = queueCell.contents().map((_, el) => $(el).text().trim()).get();
      return times.filter((time) => /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/.test(time));
    };


    let firstQueueTimes: string[] = getQueueTimes(firstRow, 1);
    if (firstQueueTimes.length === 0) {
      firstQueueTimes = ["Очікується"];
    }

    const nextDate: string = nextRow.find("td").eq(0).text().trim();
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
