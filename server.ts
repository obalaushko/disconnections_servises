import { fetchQueueSchedule } from "./disconnection-schedule.ts";
import { scrapeTable } from "./scrape";

const port = 3000;

const server = Bun.serve({
  port,
  async fetch(req) {
    try {
      // Пробуємо отримати дані основним методом
      const schedule = await fetchQueueSchedule();
      return Response.json({ status: "success", data: { schedule } });

    } catch (error) {
      console.warn(
        "Помилка в fetchQueueSchedule, переходимо до резервного методу:",
        error.message
      );

      try {
        // Якщо основний метод не спрацював, використовуємо резервний
        const fallbackResult = await scrapeTable();
        return Response.json({ status: "fallback", data: fallbackResult });
        
      } catch (fallbackError) {
        console.error("Помилка в scrapeTable:", fallbackError.message);
        return Response.json(
          {
            status: "error",
            message: "Не вдалося отримати дані з жодного методу",
          },
          { status: 500 }
        );
      }
    }
  },
  error(error) {
    console.error("Bun server Error", error);
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Listening on ${server.url}`);
