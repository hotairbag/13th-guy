import fs from "node:fs";
import path from "node:path";

fs.mkdirSync("dist/client", { recursive: true });
fs.mkdirSync("dist/server", { recursive: true });

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
};

const assetPaths = [
    "index.html",
    "icon.svg",
    "assets/index.css",
    "assets/index.js",
];

const assets = Object.fromEntries(
    assetPaths.map((assetPath) => [
        `/${assetPath}`,
        {
            body: fs.readFileSync(path.join("dist", assetPath), "utf8"),
            contentType:
                contentTypes[path.extname(assetPath)] ??
                "application/octet-stream",
        },
    ]),
);

for (const assetPath of assetPaths) {
    const source = path.join("dist", assetPath);
    const destination = path.join("dist", "client", assetPath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

fs.writeFileSync(
    "dist/client/_headers",
    "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n",
);
fs.writeFileSync("dist/client/.assetsignore", "wrangler.json\n.dev.vars\n");

const workerSource = `const assets = ${JSON.stringify(assets)};

const notFound = () => new Response("Not found", { status: 404 });

export default {
    async fetch(request) {
        if (request.method !== "GET" && request.method !== "HEAD") {
            return new Response("Method not allowed", {
                status: 405,
                headers: { Allow: "GET, HEAD" },
            });
        }

        const url = new URL(request.url);
        const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
        const asset = assets[pathname];

        if (!asset) return notFound();

        return new Response(request.method === "HEAD" ? null : asset.body, {
            headers: {
                "Content-Type": asset.contentType,
                "Cache-Control": pathname === "/index.html"
                    ? "no-cache"
                    : "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            },
        });
    },
};
`;

fs.writeFileSync("dist/server/index.js", workerSource);
fs.writeFileSync(
    "dist/server/wrangler.json",
    JSON.stringify({
        topLevelName: "mobile-13th-guy",
        name: "mobile-13th-guy",
        compatibility_date: "2026-05-15",
        compatibility_flags: ["nodejs_compat"],
        vars: {},
        main: "index.js",
        rules: [{ type: "ESModule", globs: ["**/*.js", "**/*.mjs"] }],
        no_bundle: true,
        assets: { directory: "../client" },
        observability: { enabled: true },
    }),
);
