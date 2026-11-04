import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from '@/components/site/VideoCard';
import { VIDEOS } from '@/data/videos';

// A stack of videos. keys picks which ones and in what order (4 Nov: each video lives
// where its job is: the demo on home and sign in, all three on /media, and "How far
// we've come" on /progress next to the feedback it is about).
export default function WatchVideos({ keys = VIDEOS.map((video) => video.key), id = 'videos', title = 'Watch the videos', subtitle = '', line = '', share = false }) {
  const { hash } = useLocation();
  useEffect(() => {
    // #videos opens the stack; #video-promo (a shared link) opens that one video.
    const target = hash === `#${id}` ? id : hash.startsWith('#video-') ? hash.slice(1) : '';
    if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, [hash, id]);
  const list = keys.map((key) => VIDEOS.find((video) => video.key === key)).filter((video) => video?.src);
  return (
    <section id={id} className="mt-6 scroll-mt-24" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-[18px] font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-[14px] font-semibold text-[#5ee6c8]">{subtitle}</p>}
      {line && <p className="mt-1 text-[14px] text-muted-foreground">{line}</p>}
      <div className="mt-3 flex flex-col gap-4">
        {list.map((video) => <VideoCard key={video.key} video={video} share={share} />)}
      </div>
    </section>
  );
}
