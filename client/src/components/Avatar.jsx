import { useState } from "react";
import { proxiedImage } from "../api.js";

export default function Avatar({ name, src, handle, size = 72 }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const usableSrc = src && !src.includes("unavatar.io") ? src : "";
  const imageSrc = usableSrc
    ? usableSrc.startsWith("/api/")
      ? usableSrc
      : proxiedImage(usableSrc)
    : handle
      ? `/api/avatars/by-handle/${encodeURIComponent(handle)}`
      : "";

  return (
    <div className="avatar-wrap" style={{ width: size, height: size }} title={name}>
      {!loaded ? (
        <div className="avatar fallback" style={{ width: size, height: size }}>
          {initials}
        </div>
      ) : null}
      {imageSrc && !failed ? (
        <img
          className="avatar"
          src={imageSrc}
          alt={`${name} profile`}
          width={size}
          height={size}
          style={{ display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
