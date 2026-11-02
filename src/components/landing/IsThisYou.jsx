import { useState } from 'react';
import { statFor } from '@/data/stats';
import { cn } from '@/lib/utils';

// Target market: people recognise themselves; tap one to see the research.
// Lives in the home tabs so the top of the page stays short.
const YOU = [
  { key: 'gym', art: '/themes/ex/exav-gym.webp', line: 'Still paying for the gym you stopped going to' },
  { key: 'trial', art: '/themes/ex/exav-streammax.webp', line: 'Forgot to cancel a "free" trial' },
  { key: 'netflix', art: '/themes/ex/exav-netflix.webp', line: 'Three streaming apps, watching one' },
];

export default function IsThisYou() {
  const [open, setOpen] = useState(null);
  const fact = open ? statFor(open) : null;
  return (
    <div className="mx-auto mt-5 w-full max-w-2xl px-4 text-center">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Is this you?">
        {YOU.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={open === item.key}
            onClick={() => setOpen(open === item.key ? null : item.key)}
            className={cn('flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-colors sm:flex-col sm:text-center', open === item.key ? 'border-primary bg-primary/15' : 'border-border bg-card/60 hover:border-primary/50')}
          >
            <img src={item.art} alt="" width={44} height={44} className="motion-safe:animate-float h-11 w-11 shrink-0 object-contain" />
            <span className="text-[13.5px] font-semibold leading-snug text-foreground">{item.line}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[1.25rem] text-[13px] text-muted-foreground" aria-live="polite">
        {fact ? (
          <>You&apos;re not alone: <b className="text-foreground">{fact.stat}</b> {fact.text} <span className="opacity-75">({fact.source})</span>.</>
        ) : (
          <>Tap one to see how common it is.</>
        )}
      </p>
    </div>
  );
}
