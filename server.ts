import { scrapeTable } from "./scrape";

const port = 3000;
let lastSuccsessResult: object;

const server = Bun.serve({
  port,
  async fetch(req) {
    const result = await scrapeTable();
    console.log(result);

    if (result) {
      lastSuccsessResult = result;
      return Response.json(result);
    } else {
      console.warn("Return last success result", lastSuccsessResult);
      return Response.json(lastSuccsessResult);
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
