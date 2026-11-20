import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const port = Number(process.env.PORT || 4173);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

createServer(async (request, response) => {
  try {
    const requested = request.url === "/" ? "/index.html" : request.url;
    const path = join(process.cwd(), requested.split("?")[0]);
    const info = await stat(path);
    const file = info.isDirectory() ? join(path, "index.html") : path;
    response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, () => console.log(`Local: http://localhost:${port}`));
