import fs from "node:fs";

fs.mkdirSync("dist/server", { recursive: true });
fs.copyFileSync("sites/worker.js", "dist/server/index.js");
