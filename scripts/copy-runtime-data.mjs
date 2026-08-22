import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(rootDirectory, "data", "hiking-routes.db");
const destinationDirectory = path.join(rootDirectory, "dist", "data");
const destination = path.join(destinationDirectory, "hiking-routes.db");

if (!fs.existsSync(source)) {
  throw new Error(`缺少部署所需的路线数据库：${source}`);
}

fs.mkdirSync(destinationDirectory, { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Copied route database to ${path.relative(rootDirectory, destination)}`);
