import { MousePointerClick } from 'lucide-react';
import { openTypicalPrices } from '@/components/site/DataSafety';

// Under "Upload my CSV or PDF" (4 Nov): for people who don't want to upload a file.
// It opens the existing "Do you have any of these?" card (the home tab "Have any of
// these?"), so there is one no-upload option, not two. Describing it to Ghost It is the
// Ghost It box just below.
export default function NoUploadButton({ className = '' }) {
  return (
    <button
      type="button"
      onClick={openTypicalPrices}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-[14.5px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground ${className}`}
    >
      <MousePointerClick className="h-4 w-4 text-primary" aria-hidden="true" />
      Don&apos;t want to upload? Tap what you pay instead
    </button>
  );
}
