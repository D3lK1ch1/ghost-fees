import { useState } from 'react';
import { statFor } from '@/data/stats';
import { cn } from '@/lib/utils';
import PlansAtAGlance from '@/components/landing/PlansAtAGlance';

// The first thing on the home page in every theme, before any art: the promise
// (UVP), the purpose and who it's for, in one compact block.
// Testers said: "make the value statement clear from the start and more concise"
// and the founders asked for the UVP, purpose and target market to be clearer.
const YOU = [
  { key: 'gym', art: '/themes/ex/exav-gym.webp', line: 'Still paying for the gym you stopped going to' },
  { key: 'trial', art: '/themes/ex/exav-streammax.webp', line: 'Forgot to cancel a "free" trial' },
  { key: 'netflix', art: '/themes/ex/exav-netflix.webp', line: 'Three streaming apps, watching one' },
];

export default function ValueLine({ onSample }) {
  const [open, setOpen] = useState(null);
  const fact = open ? statFor(open) : null;
  return (
    <section aria-label="What Ghost Fees does and who it's for" className="mx-auto mt-4 w-full max-w-2xl rounded-3xl border border-primary/40 bg-primary/[0.07] px-5 py-5 text-center">
      {/* UVP: one promise, said like a person would. */}
      <p className="font-heading text-[26px] font-bold leading-tight text-foreground sm:text-[30px]">
        Ghost them once. <span className="text-primary">Pay once.</span>
      </p>
      {/* Purpose: what it actually does. */}
      <p className="mx-auto mt-1.5 max-w-lg text-[15px] leading-snug text-muted-foreground">
        Ghost Fees finds the subscriptions and bank fees you forgot you&apos;re paying, then helps you cancel them. No bank login.
      </p>

      {/* Target market: people recognise themselves; tap to see the research. */}
      <p className="mt-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-primary">Is this you?</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Is this you?">
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
          <>For Australians juggling subscriptions: students, sharehouses, couples and families.</>
        )}
      </p>

      <ol className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted-foreground">
        <li><span className="font-bold text-primary">1</span> Upload a bank statement</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">2</span> See every leak in dollars</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">3</span> Cancel with ready-made steps</li>
      </ol>
      {onSample && (
        <button type="button" onClick={onSample} className="mt-3 rounded-full bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground">
          See it on a sample in 10 seconds
        </button>
      )}
      <PlansAtAGlance />
    </section>
  );
}
