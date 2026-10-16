export function formatNumber(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export function formatDate(iso) {
  if (!iso) return "Unknown";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function yearsAgo(iso) {
  if (!iso) return "";
  const then = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(then.getTime())) return "";
  const years = (Date.now() - then.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years < 1) return "this year";
  return `${Math.floor(years)} year${Math.floor(years) === 1 ? "" : "s"} ago`;
}

export function topicLabel(topic) {
  if (topic === "animation") return "Animation";
  if (topic === "mixed") return "Mixed";
  return "TF2 Content";
}

export function statusLabel(status) {
  if (status === "official") return "Official";
  if (status === "legacy") return "Legacy TF2";
  return "Active";
}

export function flagUrl(code) {
  const safe = (code || "un").toLowerCase();
  return `https://flagcdn.com/w80/${safe}.png`;
}

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "NL", name: "Netherlands" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "DK", name: "Denmark" },
  { code: "AT", name: "Austria" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "LT", name: "Lithuania" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "PH", name: "Philippines" },
  { code: "UN", name: "Unknown" },
];
