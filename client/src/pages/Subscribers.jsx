import { useCatalog } from "../catalog.jsx";
import Avatar from "../components/Avatar.jsx";
import { flagUrl, formatNumber } from "../format.js";

export default function Subscribers() {
  const { creators } = useCatalog();
  const ranked = [...creators].sort((a, b) => b.subscribers - a.subscribers);
  const max = ranked[0]?.subscribers || 1;

  return (
    <div className="stack">
      <header className="page-head">
        <p className="kicker">Leaderboard</p>
        <h1>Most subscribers</h1>
        <p>Biggest TF2-related channels in the catalog, from mega variety names to dedicated merc mains.</p>
      </header>
      <ol className="rank-list">
        {ranked.map((creator, index) => (
          <li key={creator.id}>
            <span className="place">{index + 1}</span>
            <Avatar name={creator.name} src={creator.avatarUrl} handle={creator.handle} size={56} />
            <div className="rank-copy">
              <strong>{creator.name}</strong>
              <span>
                <img className="flag" src={flagUrl(creator.countryCode)} alt="" />
                {creator.country}
              </span>
              <div className="bar">
                <i style={{ width: `${Math.max(6, (creator.subscribers / max) * 100)}%` }} />
              </div>
            </div>
            <em>{formatNumber(creator.subscribers)}</em>
          </li>
        ))}
      </ol>
    </div>
  );
}
