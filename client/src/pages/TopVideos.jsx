import { useCatalog } from "../catalog.jsx";
import VideoCard from "../components/VideoCard.jsx";

export default function TopVideos() {
  const { videos } = useCatalog();
  const ranked = [...videos].sort((a, b) => b.views - a.views);

  return (
    <div className="stack">
      <header className="page-head">
        <p className="kicker">Most wanted</p>
        <h1>Most viewed TF2 videos</h1>
        <p>The biggest Team Fortress 2 videos on the board — official shorts, SFM hits, and class essays.</p>
      </header>
      <div className="video-grid">
        {ranked.map((video, index) => (
          <VideoCard key={video.id} video={video} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
