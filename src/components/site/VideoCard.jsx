import { useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import { duration } from '@/data/videos';
import { cn } from '@/lib/utils';

// One video: a cover (the frame a few seconds in, since the videos fade in from dark)
// with a ghost play button, title and length. Nothing plays until you tap it; then the
// normal controls take over. No autoplay. preload="metadata" so pages stay light.
export default function VideoCard({ video, compact = false, className = '' }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  if (!video.src) {
    return (
      <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.02]', className)}>
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
          <span className="flex flex-col items-center gap-2 text-center">
            <GhostMark className="h-10 w-10 text-foreground/40 motion-safe:animate-float" eyeColor="#150e28" />
            <span className="text-[13px] font-semibold text-muted-foreground">Coming soon</span>
          </span>
        </div>
        <Caption video={video} compact={compact} />
      </div>
    );
  }

  const start = () => {
    setPlaying(true);
    const el = ref.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});   // started by the tap, so browsers allow it
    }
  };

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/60', className)}>
      <div className="relative aspect-video bg-black">
        <video
          ref={ref}
          src={`${video.src}#t=4`}
          preload="metadata"
          playsInline
          controls={playing}
          className="h-full w-full object-cover"
          aria-label={`${video.title} video`}
        />
        {!playing && (
          <button
            type="button"
            onClick={start}
            aria-label={`Play ${video.title} (${duration(video.seconds)})`}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/20 to-black/10"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_10px_40px_hsl(var(--primary)/0.5)] transition-transform group-hover:scale-110">
              <GhostMark className="h-9 w-9 text-primary-foreground motion-safe:animate-float" eyeColor="hsl(var(--primary))" />
            </span>
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[12px] font-semibold text-white">
              <Clock className="h-3 w-3" aria-hidden="true" /> {duration(video.seconds)}
            </span>
          </button>
        )}
      </div>
      <Caption video={video} compact={compact} />
    </div>
  );
}

function Caption({ video, compact }) {
  return (
    <div className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
      <p className="text-[15px] font-semibold leading-tight text-foreground"><span aria-hidden="true">{video.emoji}</span> {video.title}</p>
      {!compact && <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">{video.line}</p>}
    </div>
  );
}
