import express from "express";
import { scrapeTable } from "./scrape";

const app = express();
const port = 3000;

app.get("/outages", async (req, res) => {
  try {
    const result = await scrapeTable();
    res.json(result);
  } catch (error) {
    res.status(500).send("Помилка сервера");
  }
});

app.listen(port, () => {
  console.log(`Сервер працює на http://localhost:${port}`);
});
