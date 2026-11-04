import VideoCard from '@/components/site/VideoCard';
import { VIDEOS } from '@/data/videos';

// /progress: the four videos up top, so judges see them first (4 Nov). 2 x 2 on
// desktop, one column on phones.
export default function WatchVideos() {
  const ready = VIDEOS.filter((video) => video.src);
  return (
    <section className="mt-6" aria-labelledby="watch-videos">
      <h2 id="watch-videos" className="text-[18px] font-semibold text-foreground">Watch the videos</h2>
      <p className="mt-1 text-[14px] text-muted-foreground">Start with the promo, or see how three days of feedback changed it.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Only videos that exist (the demo appears once its file is added). With an odd
            number, the first one spans the full width so the grid stays tidy. */}
        {ready.map((video, index) => (
          <VideoCard key={video.key} video={video} className={ready.length % 2 && index === 0 ? 'md:col-span-2' : ''} />
        ))}
      </div>
    </section>
  );
}
