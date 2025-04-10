#!/usr/bin/env node

import express from "express";
import next from "next";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Resolve __dirname since we're in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

// Point to your Next.js project directory
const app = (next as any)({ dev, dir: resolve(__dirname, "../../../client") });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ✅ Custom route
  server.get("/myspecial", async (req, res) => {
    res.type("text/plain").send("success");
  });

  // ✅ Default catch-all handler to allow Next.js to handle all other routes
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // Start server
  server.listen(port, () => {
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
