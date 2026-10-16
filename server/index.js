import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { avatarPath, bootCatalog, getCatalog, slugify } from "./store.js";
import { downloadImage, importFromYoutube } from "./youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/catalog", (_req, res) => {
  res.json(getCatalog());
});

app.get("/api/image-proxy", async (req, res) => {
  try {
    const { contentType, buffer } = await downloadImage(String(req.query.url || ""));
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ error: error.message || "Could not proxy that image." });
  }
});

function sendAvatarFile(res, file) {
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  fs.createReadStream(file).pipe(res);
}

app.get("/api/avatars/by-handle/:handle", async (req, res) => {
  try {
    const handle = String(req.params.handle || "").replace(/^@/, "");
    if (!handle) return res.status(404).end();
    const id = slugify(handle);
    const file = avatarPath(id);
    if (fs.existsSync(file)) return sendAvatarFile(res, file);
    const data = await importFromYoutube(`https://www.youtube.com/@${handle}`);
    if (!data.avatarUrl) return res.status(404).end();
    const { buffer } = await downloadImage(data.avatarUrl);
    const saved = path.join(path.dirname(file), `${id}.jpg`);
    fs.mkdirSync(path.dirname(saved), { recursive: true });
    fs.writeFileSync(saved, buffer);
    sendAvatarFile(res, saved);
  } catch {
    res.status(404).end();
  }
});

app.get("/api/avatars/:file", (req, res) => {
  const id = path.basename(req.params.file, path.extname(req.params.file));
  const file = avatarPath(id);
  if (!fs.existsSync(file)) return res.status(404).end();
  sendAvatarFile(res, file);
});

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

await bootCatalog();
app.listen(PORT, () => {
  console.log(`TF2 Tubers API on http://localhost:${PORT}`);
});
