import { formatDate, formatNumber } from "../format.js";

export default function VideoCard({ video, rank }) {
  return (
    <a className="video-card" href={video.url} target="_blank" rel="noreferrer">
      {rank ? <span className="rank-badge">#{rank}</span> : null}
      <div className="thumb-wrap">
        <img src={video.thumbnail} alt="" />
      </div>
      <div className="video-body">
        <p className="kicker">{formatNumber(video.views)} views</p>
        <h3>{video.title}</h3>
        <p className="meta">{video.channelName} · {formatDate(video.publishedAt)}</p>
      </div>
    </a>
  );
}
