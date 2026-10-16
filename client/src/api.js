async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export const api = {
  catalog: () => request("/api/catalog"),
};

export function proxiedImage(url) {
  if (!url) return "";
  if (url.startsWith("/api/")) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
