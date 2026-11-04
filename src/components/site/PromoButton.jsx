import { PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import VideoCard from '@/components/site/VideoCard';
import { PROMO, duration } from '@/data/videos';

// A quiet "Watch the promo" link that opens the promo in a popup (home page).
export default function PromoButton({ className = '' }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={`inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline ${className}`}>
          <PlayCircle className="h-4 w-4 text-primary" aria-hidden="true" /> Watch the promo ({duration(PROMO.seconds)})
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-white/10 bg-card p-3 sm:p-4">
        <DialogTitle className="sr-only">Ghost Fees promo</DialogTitle>
        <VideoCard video={PROMO} />
      </DialogContent>
    </Dialog>
  );
}
