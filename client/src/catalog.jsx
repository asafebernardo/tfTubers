import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [creators, setCreators] = useState([]);
  const [videos, setVideos] = useState([]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    const data = await api.catalog();
    setCreators(data.creators || []);
    setVideos(data.videos || []);
    setVersion(data.version || 0);
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(
    () => ({ creators, videos, version, loading, error, refresh }),
    [creators, videos, version, loading, error]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
