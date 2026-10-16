import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { downloadImage, importFromYoutube } from "./youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const dataDir = path.join(__dirname, "data");
const avatarsDir = path.join(dataDir, "avatars");
const cachePath = path.join(dataDir, "cache.json");
const channelsPath = path.join(rootDir, "channels.json");
const videosPath = path.join(rootDir, "videos.json");

let catalog = { creators: [], videos: [], version: 0 };
const listeners = new Set();

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function slugify(value) {
  return (
    String(value || "channel")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "channel"
  );
}

export function avatarPath(id) {
  return path.join(avatarsDir, `${id}.jpg`);
}

export function saveAvatar(id, buffer) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  const file = avatarPath(id);
  fs.writeFileSync(file, buffer);
  return file;
}

function normalizeEntry(entry) {
  if (typeof entry === "string") return { url: entry };
  return entry && entry.url ? entry : null;
}

function creatorFrom(entry, live = {}) {
  const handle = (live.handle || String(entry.url).match(/@([\w.-]+)/)?.[1] || "channel").replace(/^@/, "");
  const id = slugify(handle);
  const localAvatar = avatarPath(id);
  return {
    id,
    name: live.name || handle,
    handle,
    channelId: live.channelId || null,
    country: entry.country || "Unknown",
    countryCode: (entry.countryCode || "UN").toUpperCase(),
    status: entry.status || "active",
    subscribers: Number(live.subscribers) || 0,
    firstTf2VideoAt: entry.firstTf2VideoAt || "",
    firstTf2VideoTitle: entry.firstTf2VideoTitle || "",
    youtubeUrl: live.youtubeUrl || entry.url,
    avatarUrl: fs.existsSync(localAvatar) ? `/api/avatars/${id}.jpg` : live.avatarUrl || "",
    description: entry.description || live.description || "",
  };
}

function loadVideoList() {
  const data = readJson(videosPath, { videos: [] });
  return (data.videos || []).map((video) => {
    const id = video.id || String(video.url || "").match(/[?&]v=([\w-]+)/)?.[1] || slugify(video.title);
    return {
      id,
      title: video.title,
      channelName: video.channelName,
      views: Number(video.views) || 0,
      publishedAt: video.publishedAt,
      thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: video.url,
    };
  });
}

function rebuildFromDisk() {
  const list = readJson(channelsPath, { channels: [] });
  const cache = readJson(cachePath, { creators: {} });
  const creators = (list.channels || [])
    .map(normalizeEntry)
    .filter(Boolean)
    .map((entry) => creatorFrom(entry, cache.creators?.[entry.url] || {}));

  catalog = {
    creators,
    videos: loadVideoList(),
    version: Date.now(),
  };
  for (const fn of listeners) fn(catalog);
  return catalog;
}

async function refreshChannel(entry, cache) {
  const live = await importFromYoutube(entry.url);
  cache.creators[entry.url] = {
    name: live.name,
    handle: live.handle,
    channelId: live.channelId,
    subscribers: live.subscribers,
    avatarUrl: live.avatarUrl,
    description: live.description,
    youtubeUrl: live.youtubeUrl,
    fetchedAt: new Date().toISOString(),
  };
  if (live.avatarUrl) {
    try {
      const id = slugify(live.handle || entry.url);
      const { buffer } = await downloadImage(live.avatarUrl);
      saveAvatar(id, buffer);
    } catch {
      // Keep the remote avatar URL if download fails.
    }
  }
}

async function refreshLive(force = false) {
  const list = readJson(channelsPath, { channels: [] });
  const cache = readJson(cachePath, { creators: {} });
  const day = 24 * 60 * 60 * 1000;

  for (const raw of list.channels || []) {
    const entry = normalizeEntry(raw);
    if (!entry) continue;
    const cached = cache.creators[entry.url];
    const stale = !cached?.fetchedAt || Date.now() - new Date(cached.fetchedAt).getTime() > day;
    if (!force && cached && !stale) continue;
    try {
      await refreshChannel(entry, cache);
      writeJson(cachePath, cache);
      rebuildFromDisk();
    } catch (error) {
      console.warn(`Could not refresh ${entry.url}: ${error.message}`);
    }
  }
}

export function getCatalog() {
  return catalog;
}

export function onCatalogChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function bootCatalog() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(avatarsDir, { recursive: true });
  rebuildFromDisk();
  refreshLive(false).catch((error) => console.warn(error.message));

  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      rebuildFromDisk();
      refreshLive(true).catch((error) => console.warn(error.message));
    }, 400);
  };

  fs.watch(rootDir, { persistent: true }, (_event, filename) => {
    if (filename === "channels.json" || filename === "videos.json") schedule();
  });
}

export { avatarsDir };
