import { useCatalog } from "../catalog.jsx";
import Avatar from "../components/Avatar.jsx";
import { flagUrl, formatDate, yearsAgo } from "../format.js";

export default function Oldest() {
  const { creators } = useCatalog();
  const ranked = [...creators].sort((a, b) => a.firstTf2VideoAt.localeCompare(b.firstTf2VideoAt));

  return (
    <div className="stack">
      <header className="page-head">
        <p className="kicker">Time machine</p>
        <h1>Oldest TF2 videos</h1>
        <p>
          Channels ranked by their first known Team Fortress 2 upload — from Valve’s Meet the Team era to modern Spy teachers.
        </p>
      </header>
      <ol className="timeline">
        {ranked.map((creator, index) => (
          <li key={creator.id}>
            <time>{formatDate(creator.firstTf2VideoAt)}</time>
            <Avatar name={creator.name} src={creator.avatarUrl} handle={creator.handle} size={58} />
            <div>
              <strong>
                #{index + 1} {creator.name}
              </strong>
              <p>{creator.firstTf2VideoTitle}</p>
              <span>
                <img className="flag" src={flagUrl(creator.countryCode)} alt="" />
                {creator.country} · {yearsAgo(creator.firstTf2VideoAt)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
