import puppeteer, { Browser } from "puppeteer";
import { toZonedTime, format } from "date-fns-tz";

// Функція для обробки дат
function parseDynamicDate(rawDate: string): Date {
  const monthMap: { [key: string]: number } = {
    січ: 0,
    січень: 0,
    лют: 1,
    лютий: 1,
    бер: 2,
    березень: 2,
    квіт: 3,
    квітень: 3,
    трав: 4,
    травень: 4,
    черв: 5,
    червень: 5,
    лип: 6,
    липень: 6,
    серп: 7,
    серпень: 7,
    вер: 8,
    вересень: 8,
    жовт: 9,
    жовтень: 9,
    лист: 10,
    листопад: 10,
    груд: 11,
    грудень: 11,
  };

  const cleanedDate = rawDate
    .replace(/[.\u202F]/g, "")
    .trim()
    .toLowerCase();
  const parts = cleanedDate.split(" ");
  if (parts.length < 3) {
    throw new Error(`Неможливо розпізнати дату: ${rawDate}`);
  }

  const day = parseInt(parts[0], 10);
  const monthText = parts[1];
  const year = parseInt(parts[2], 10);

  const month = monthMap[monthText];
  if (month === undefined) {
    throw new Error(`Невідомий місяць: ${monthText}`);
  }

  const utcDate = new Date(Date.UTC(year, month, day));
  const timeZone = "Europe/Kyiv";
  return toZonedTime(utcDate, timeZone);
}

// Експортована функція для отримання даних
export async function fetchQueueSchedule(): Promise<
  Array<{ date: string; queues: { [queue: string]: string[] } }>
> {
  let browser: Browser | null = null;

  try {
    // Запускаємо браузер
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Відкриваємо потрібну сторінку
    await page.goto(
      "https://lookerstudio.google.com/embed/u/0/reporting/0bbde89a-82b6-41d7-80c6-e9f68ef5a0e6/page/nro2D"
    );

    // Чекаємо, поки потрібна таблиця завантажиться
    await page.waitForSelector(
      "div[style*='top: 215px; left: 50px;'] table-wrapper .tableBody"
    );

    // Збираємо інформацію про черги з потрібної таблиці
    const scheduleData = await page.evaluate(() => {
      const result: Array<{
        date: string;
        queues: { [queue: string]: string[] };
      }> = [];

      const table = document.querySelector(
        "div[style*='top: 215px; left: 50px;'] table-wrapper .tableBody"
      );

      if (!table) {
        return result; // Якщо таблицю не знайдено, повертаємо пустий результат
      }

      const rows = table.querySelectorAll(".row");

      rows.forEach((row) => {
        const cells = row.querySelectorAll(".cell");
        const dateCell = cells[0]?.textContent?.trim();

        if (dateCell) {
          const queueData: { [queue: string]: string[] } = {};

          for (let i = 1; i < cells.length; i++) {
            const queueName = `черга ${i}`;
            const hours = cells[i]?.textContent
              ?.trim()
              .split("\n")
              .filter((time) => time);
            queueData[queueName] = hours || ["Немає даних"];
          }

          result.push({
            date: dateCell,
            queues: queueData,
          });
        }
      });

      return result;
    });

    // Обробка дат і форматування результатів
    return scheduleData.map((entry) => {
      try {
        const parsedDate = parseDynamicDate(entry.date);
        const timeZone = "Europe/Kyiv";
        return {
          date: format(parsedDate, "yyyy-MM-dd", { timeZone }),
          queues: entry.queues,
        };
      } catch (error) {
        console.error(`Помилка обробки дати: ${entry.date}`);
        return {
          date: "Invalid Date",
          queues: entry.queues,
        };
      }
    });
  } catch (error) {
    console.error("Помилка:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
