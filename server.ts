import { scrapeTable } from "./scrape";

const port = 3000;

const server = Bun.serve({
  port,
  async fetch(req) {
    const result = await scrapeTable();
	console.log(result)
    return Response.json(result);
  },
  error(error) {
	console.error('Bun server Error', error);
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Listening on ${server.url}`);
