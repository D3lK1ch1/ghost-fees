import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from '@/components/site/VideoCard';
import { VIDEOS } from '@/data/videos';

// /progress: the three videos up top, stacked, so judges see them first (4 Nov).
export default function WatchVideos() {
  // The nav bar's Videos link (/progress#videos) jumps straight here.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#videos') document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);
  return (
    <section id="videos" className="mt-6 scroll-mt-24" aria-labelledby="watch-videos">
      <h2 id="watch-videos" className="text-[18px] font-semibold text-foreground">Watch the videos</h2>
      <p className="mt-1 text-[14px] text-muted-foreground">Start with the demo, then the promo and how far we've come.</p>
      <div className="mt-3 flex flex-col gap-4">
        {VIDEOS.map((video) => <VideoCard key={video.key} video={video} />)}
      </div>
    </section>
  );
}
