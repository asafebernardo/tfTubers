import { Link } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { formatNumber } from "../format.js";

export default function Home() {
  const { creators, videos } = useCatalog();
  const countries = new Set(creators.map((c) => c.countryCode)).size;
  const topSubs = [...creators].sort((a, b) => b.subscribers - a.subscribers).slice(0, 3);
  const oldest = [...creators]
    .filter((c) => c.firstTf2VideoAt)
    .sort((a, b) => a.firstTf2VideoAt.localeCompare(b.firstTf2VideoAt))
    .slice(0, 3);
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <div className="stack">
      <section className="hero">
        <p className="stamp">Mann Co. approved</p>
        <h1>Meet the TF2 YouTubers.</h1>
        <p>
          A living roster of Team Fortress 2 creators — sorted by country, subscriber count, oldest TF2 upload,
          and the videos with the most views.
        </p>
        <div className="hero-actions">
          <Link className="btn red" to="/countries">Choose a country</Link>
          <Link className="btn blu" to="/subscribers">View the leaderboard</Link>
        </div>
      </section>

      <section className="howto hud-panel">
        <h2>Add a channel</h2>
        <p>
          Drop a YouTube channel link into <code>channels.json</code> in this repo. After the file is saved or
          pulled, the site fetches the name and profile image and updates the roster automatically.
        </p>
      </section>

      <section className="stat-grid">
        <Stat label="Mercenaries" value={creators.length} />
        <Stat label="Countries" value={countries} />
        <Stat label="Videos" value={videos.length} />
        <Stat label="Combined subs" value={formatNumber(creators.reduce((sum, c) => sum + (c.subscribers || 0), 0))} />
      </section>

      <section>
        <div className="section-head">
          <h2>Biggest channels</h2>
          <Link to="/subscribers">Full leaderboard</Link>
        </div>
        <div className="card-grid">
          {topSubs.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} rank={i + 1} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Oldest known TF2 uploads</h2>
          <Link to="/oldest">See the timeline</Link>
        </div>
        <div className="card-grid">
          {oldest.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} rank={i + 1} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Most viewed TF2 videos</h2>
          <Link to="/videos">All videos</Link>
        </div>
        <div className="video-grid">
          {topVideos.map((video, i) => (
            <VideoCard key={video.id} video={video} rank={i + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-tile">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
