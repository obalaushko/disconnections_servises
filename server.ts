import express from "express";
import { scrapeTable } from "./scrape";
import os from "os";

const app = express();
const port = 3000;

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceInfo = interfaces[name];
    if (ifaceInfo) { // перевірка на undefined
      for (const iface of ifaceInfo) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}


app.get("/", async (req, res) => {
  try {
    const result = await scrapeTable();
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(port, () => {
  const ipAddress = getLocalIPAddress();
  console.log(`Сервер працює на http://${ipAddress}:${port}`);
});
