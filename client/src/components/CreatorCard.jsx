import { flagUrl, formatDate, formatNumber, statusLabel } from "../format.js";
import Avatar from "./Avatar.jsx";

export default function CreatorCard({ creator, rank }) {
  return (
    <article className="creator-card">
      {rank ? <span className="rank-badge">#{rank}</span> : null}
      <Avatar name={creator.name} src={creator.avatarUrl} handle={creator.handle} size={78} />
      <div className="creator-body">
        <div className="creator-head">
          <h3>{creator.name}</h3>
          <span className={`pill status-${creator.status}`}>{statusLabel(creator.status)}</span>
        </div>
        <p className="handle">@{creator.handle || creator.name}</p>
        <p className="meta">
          <img className="flag" src={flagUrl(creator.countryCode)} alt="" />
          {creator.country}
        </p>
        <p className="stats-line">
          <strong>{formatNumber(creator.subscribers)}</strong> subscribers
          {creator.firstTf2VideoAt ? (
            <>
              <span className="dot" />
              First TF2 {formatDate(creator.firstTf2VideoAt)}
            </>
          ) : null}
        </p>
        <p className="blurb">{creator.description}</p>
        <a className="yt-link" href={creator.youtubeUrl} target="_blank" rel="noreferrer">
          Open on YouTube
        </a>
      </div>
    </article>
  );
}
