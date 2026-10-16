import { useMemo, useState } from "react";
import { useCatalog } from "../catalog.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import { flagUrl } from "../format.js";

export default function ByCountry() {
  const { creators } = useCatalog();
  const groups = useMemo(() => {
    const map = new Map();
    for (const creator of creators) {
      const key = creator.countryCode || "UN";
      if (!map.has(key)) {
        map.set(key, { code: key, name: creator.country || "Unknown", creators: [] });
      }
      map.get(key).creators.push(creator);
    }
    return [...map.values()].sort((a, b) => b.creators.length - a.creators.length || a.name.localeCompare(b.name));
  }, [creators]);

  const [selected, setSelected] = useState(groups[0]?.code || "US");
  const active = groups.find((g) => g.code === selected) || groups[0];

  return (
    <div className="stack">
      <header className="page-head">
        <p className="kicker">World tour</p>
        <h1>TF2 YouTubers by country</h1>
        <p>Pick a flag to see who is holding the intel. Missing someone? Add their channel link to channels.json.</p>
      </header>
      <div className="country-pills">
        {groups.map((group) => (
          <button
            key={group.code}
            className={group.code === selected ? "pill-btn on" : "pill-btn"}
            onClick={() => setSelected(group.code)}
          >
            <img src={flagUrl(group.code)} alt="" />
            {group.name}
            <span>{group.creators.length}</span>
          </button>
        ))}
      </div>
      {active ? (
        <>
          <h2 className="country-title">
            <img src={flagUrl(active.code)} alt="" />
            {active.name}
          </h2>
          {active.creators.length ? (
            <div className="card-grid">
              {active.creators
                .slice()
                .sort((a, b) => b.subscribers - a.subscribers)
                .map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
            </div>
          ) : (
            <p className="empty">
              No creators listed for this country yet. Add a YouTube channel link to <code>channels.json</code>.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
