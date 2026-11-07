import VideoCard from '@/components/site/VideoCard';
import { DEMO, PROMO } from '@/data/videos';

// The first thing on the home page in every theme (design A, 4 Nov: "less chunky,
// more streamlined"). One kicker, one headline, one sentence, three steps in a line,
// one button and quiet trust ticks. No box around it, so it reads open, not like a form.
const STEPS = ['Upload', 'See every leak', 'Cancel'];

export default function ValueLine({ onSample, onUpload }) {
  return (
    <section data-tour="uvp" aria-label="What Ghost Fees does" className="relative mx-auto mt-6 w-full max-w-2xl px-5 py-4 text-center">
      {/* Soft glow behind the headline instead of a border. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-2 -z-10 h-32 rounded-full bg-primary/15 blur-3xl" />
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-primary">Find · Cancel · Pay once</p>
      <h2 className="mt-2 font-heading text-[30px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[38px]">
        Ghost them once. <span className="text-primary">Pay once.</span>
      </h2>

      <ol className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-[14px] text-foreground/90" aria-label="How it works">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="h-px w-6 bg-white/20 sm:w-10" />}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/60 text-[12px] font-semibold text-primary">{index + 1}</span>
            <span className="whitespace-nowrap">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col items-center gap-2">
        {onSample && (
          <button type="button" data-tour="try" onClick={onSample} className="rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_34px_hsl(var(--primary)/0.32)] transition-transform hover:-translate-y-0.5">
            Try the sample (10 sec)
          </button>
        )}
        {onUpload && (
          <button type="button" onClick={onUpload} className="text-[14px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            or upload a statement
          </button>
        )}
      </div>

      {/* Pack 9: the selling lines (price, no bank login, trust) live once, in the theme
          hero below, so this card is just the headline, the 3 steps and the button. */}

      {/* The promo (our story in 90 seconds) and the demo (see it work), both on the home
          page (4 Nov: "embed the promo one too"; 8 Nov: "put demo, maybe even promo too"). */}
      <div className="mx-auto mt-6 max-w-xl space-y-6 text-left">
        <div>
          <p className="mb-2 text-center text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary">Our story in 90 seconds</p>
          <VideoCard video={PROMO} />
        </div>
        {DEMO?.src && (
          <div>
            <p className="mb-2 text-center text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary">See it work: the full demo</p>
            <VideoCard video={DEMO} />
          </div>
        )}
      </div>
    </section>
  );
}
