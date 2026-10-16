const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const YT_HEADERS = {
  "User-Agent": UA,
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  Cookie: "CONSENT=YES+; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwMzI3LjA4X3AxGgJlbiACGgYIgJnorgY",
};

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"');
}

function parseCount(raw) {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.round(raw);
  const text = String(raw)
    .replace(/subscribers?/i, "")
    .replace(/inscritos?/i, "")
    .replace(/visualiza(?:c|ç)(?:o|õ)es/i, "")
    .replace(/views?/i, "")
    .trim();
  const compact = text.replace(/\s/g, "").replace(/,/g, "");
  const match = compact.match(/^([\d.]+)\s*([KMB]|mil|mi)?/i);
  if (!match) {
    const digits = text.replace(/[^\d]/g, "");
    return digits ? Number(digits) : null;
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  const suffix = (match[2] || "").toLowerCase();
  const multiplier =
    suffix === "b" ? 1e9 : suffix === "m" || suffix === "mi" ? 1e6 : suffix === "k" || suffix === "mil" ? 1e3 : 1;
  return Math.round(amount * multiplier);
}

function upgradeAvatar(url) {
  if (!url) return url;
  return url
    .replace(/=s\d+[^&=]*/g, "=s800-c-k-c0x00ffffff-no-rj")
    .replace(/=w\d+-h\d+[^&=]*/g, "=s800-c-k-c0x00ffffff-no-rj");
}

function isYouTubeHost(hostname) {
  return /(?:^|\.)youtube\.com$/.test(hostname) || hostname === "youtu.be";
}

export function normalizeYoutubeUrl(input) {
  if (!input || typeof input !== "string") throw new Error("Paste a YouTube channel or video URL.");
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Paste a YouTube channel or video URL.");

  let url;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    if (/^@[\w.-]+$/.test(trimmed)) return `https://www.youtube.com/${trimmed}`;
    if (/^UC[\w-]{22}$/.test(trimmed)) return `https://www.youtube.com/channel/${trimmed}`;
    throw new Error("That does not look like a valid YouTube URL.");
  }

  if (!isYouTubeHost(url.hostname)) {
    throw new Error("Only YouTube URLs can be imported.");
  }

  url.hostname = url.hostname.replace(/^m\.youtube\.com$/, "www.youtube.com");
  if (url.hostname === "youtu.be") {
    const id = url.pathname.replace("/", "");
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url.toString();
}

function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    const shorts = parsed.pathname.match(/\/shorts\/([\w-]+)/);
    if (shorts) return shorts[1];
    const embed = parsed.pathname.match(/\/embed\/([\w-]+)/);
    if (embed) return embed[1];
  } catch {
    return null;
  }
  return null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: YT_HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`YouTube returned ${res.status}. Try another URL.`);
  return res.text();
}

async function fetchOEmbed(url) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(endpoint, { headers: YT_HEADERS });
  if (!res.ok) return null;
  return res.json();
}

function extractFromHtml(html, sourceUrl) {
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];

  const channelId =
    html.match(/"browseId":"(UC[\w-]{22})"/)?.[1] ||
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ||
    html.match(/\/channel\/(UC[\w-]{22})/)?.[1];

  const handleMatch =
    html.match(/"canonicalBaseUrl":"\/(@[\w.-]+)"/)?.[1] ||
    html.match(/"vanityChannelUrl":"http[^"]*\/(@[\w.-]+)"/)?.[1] ||
    sourceUrl.match(/youtube\.com\/(@[\w.-]+)/i)?.[1] ||
    canonical?.match(/youtube\.com\/(@[\w.-]+)/i)?.[1];

  const avatarCandidates = [
    html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt3\.[^"]+)"/)?.[1],
    html.match(/"avatarViewModel":\{"image":\{"sources":\[\{"url":"(https:\/\/yt3\.[^"]+)"/)?.[1],
    html.match(/https:\/\/yt3\.(?:googleusercontent|ggpht)\.com\/ytc\/[A-Za-z0-9_-]+=s\d+[^"&]*/)?.[0],
    ogImage,
  ].filter(Boolean);

  const subscriberRaw =
    html.match(/"aboutChannelViewModel":\{[^}]*"subscriberCountText":"([^"]+)"/)?.[1] ||
    html.match(/"content":"([\d.,]+\s*(?:K|M|B|mil)?)\s*(?:subscribers?|inscritos?)"/i)?.[1] ||
    html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/)?.[1] ||
    html.match(/([\d.,]+\s*(?:K|M|B|mil)?)\s*(?:subscribers?|inscritos?)/i)?.[1];

  const country =
    html.match(/"aboutChannelViewModel":\{[^}]*"country":"([^"]+)"/)?.[1] ||
    null;

  const description =
    html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] ||
    html.match(/"description":\{"simpleText":"([^"]+)"/)?.[1] ||
    "";

  const name = decodeHtml(ogTitle || "").replace(/\s*-\s*YouTube\s*$/i, "").trim();

  return {
    name: name || null,
    handle: handleMatch ? handleMatch.replace(/^@/, "") : null,
    channelId: channelId || null,
    avatarUrl: upgradeAvatar(decodeHtml(avatarCandidates[0] || "")),
    subscribers: parseCount(subscriberRaw),
    subscribersLabel: subscriberRaw ? decodeHtml(subscriberRaw) : null,
    country,
    description: decodeHtml(description).slice(0, 280),
    youtubeUrl: canonical || (channelId ? `https://www.youtube.com/channel/${channelId}` : sourceUrl),
  };
}

export async function importFromYoutube(input) {
  const url = normalizeYoutubeUrl(input);
  const videoId = extractVideoId(url);

  let channelUrl = url;
  let videoMeta = null;

  if (videoId) {
    videoMeta = await fetchOEmbed(url);
    if (videoMeta?.author_url) {
      channelUrl = videoMeta.author_url;
    }
  }

  const html = await fetchText(channelUrl);
  const parsed = extractFromHtml(html, channelUrl);

  if (!parsed.name && videoMeta?.author_name) parsed.name = videoMeta.author_name;
  if (!parsed.youtubeUrl && videoMeta?.author_url) parsed.youtubeUrl = videoMeta.author_url;
  if (!parsed.avatarUrl && videoMeta?.thumbnail_url && !videoId) parsed.avatarUrl = videoMeta.thumbnail_url;

  if (!parsed.name) {
    throw new Error("Could not read that channel. Open the channel page on YouTube and paste that URL.");
  }

  if (parsed.handle && !parsed.youtubeUrl.includes("@")) {
    parsed.youtubeUrl = `https://www.youtube.com/@${parsed.handle}`;
  }

  return {
    ...parsed,
    sourceUrl: url,
    fromVideo: videoId
      ? {
          id: videoId,
          title: videoMeta?.title || null,
          thumbnail: videoMeta?.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        }
      : null,
  };
}

export async function downloadImage(imageUrl) {
  if (!imageUrl) throw new Error("No image URL to download.");
  const parsed = new URL(imageUrl);
  const allowed = /(?:youtube|ytimg|ggpht|googleusercontent|unavatar)\./i.test(parsed.hostname);
  if (!allowed) throw new Error("That image host is not allowed.");
  const res = await fetch(imageUrl, { headers: YT_HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error("Could not download the channel image.");
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return { contentType, buffer };
}
