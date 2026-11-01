import { Lock, Upload } from 'lucide-react';
import { ThoughtBubble } from '@/components/site/Bubbles';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { EX_GHOST_KEY, EX_GHOSTS, EX_PICKS } from '@/lib/ghostFees/exArt';
import { cn } from '@/lib/utils';

// Two-tone text: sage green into coral, as in the design.
const BLEND = 'bg-gradient-to-r from-[#a9c8a8] to-primary bg-clip-text text-transparent';

// Scattered stars behind the hero: [left %, top %, size px, pink].
const SPARKS = [
  [6, 4, 2, false], [92, 3, 2, false], [48, 9, 1.5, false], [18, 18, 2, false], [84, 22, 2, false],
  [4, 36, 5, true], [96, 40, 2, false], [12, 52, 2, false], [88, 55, 5, true], [30, 61, 6, true],
  [70, 63, 2, false], [8, 70, 2, false], [94, 74, 2, false], [52, 82, 2, false], [20, 90, 5, true],
];

// My Ex Ghosted Me landing, laid out like the phone design (screens ChooseGhost and
// Ex1Landing): logo, the chosen ghost with a thought cloud, Choose your ghost, then a
// left-aligned two-tone headline and two full-width buttons. The pick only changes
// the art and words, never the scan.
export default function ExHero({ theme, onSample, onUpload }) {
  const [pickKey, setPickKey] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const pick = EX_PICKS[pickKey];
  const [first, highlight, rest] = pick.headline;

  return (
    <section className="relative mx-auto flex w-full max-w-[460px] animate-rise flex-col items-center px-5 pb-16 pt-4">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {SPARKS.map(([left, top, size, pink]) => (
          <span
            key={`${left}-${top}`}
            className={cn('absolute rounded-full', pink ? 'bg-primary/50 blur-[1px]' : 'bg-white/40')}
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="flex items-center justify-center gap-2 font-heading text-[30px] font-bold leading-none">
          <span aria-hidden="true">💔</span>
          <span className={BLEND}>My Ex Ghosted Me</span>
        </p>
        <p className="mt-1.5 text-[12.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">By Ghost Fees</p>
      </div>

      <div className="relative mt-6 w-full">
        <img
          src={pick.hero}
          alt={pick.heroAlt}
          width={360}
          className="mx-auto h-auto w-[250px] animate-float drop-shadow-[0_0_50px_hsl(var(--primary)/0.25)]"
        />
        <ThoughtBubble trail="left" tones="text-[#2a1020]" className="absolute -right-2 -top-4 max-w-[170px]">
          {pick.heroBubble}
        </ThoughtBubble>
      </div>

      <p className="mt-6 font-heading text-[16px] font-bold text-foreground/90">Choose your ghost</p>
      <div role="radiogroup" aria-label="Choose your ghost" className="mt-3 grid w-full grid-cols-2 gap-3">
        {EX_GHOSTS.map((key) => {
          const item = EX_PICKS[key];
          const selected = key === pickKey;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPickKey(key)}
              className={cn(
                'flex flex-col items-center rounded-[20px] border-2 bg-card px-3 pb-3 pt-3.5 transition-colors',
                selected ? 'border-[#5ee6c8] shadow-[0_0_24px_rgba(94,230,200,0.25)]' : 'border-border hover:border-primary/60',
              )}
            >
              <img src={item.avatar} alt="" width={76} height={76} className="h-[76px] w-[76px] rounded-full object-cover" />
              <span className="mt-2 font-heading text-[15px] font-bold text-foreground">{item.label}</span>
              <span className={cn('text-[12.5px] font-semibold', selected ? 'text-[#5ee6c8]' : 'text-muted-foreground')}>
                {selected ? 'Selected' : item.note}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 w-full text-left">
        <h1 className="text-[2.15rem] font-bold leading-[1.08] text-foreground">
          {first}
          <span className={BLEND}>{highlight}</span>{' '}
          <span className="text-primary">{rest}</span>
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{theme.subhead}</p>

        <button
          type="button"
          onClick={onSample}
          className="mt-5 w-full rounded-[20px] bg-primary px-6 py-4 font-heading text-[18px] font-bold text-primary-foreground shadow-[0_8px_36px_hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5"
        >
          Try a sample statement
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-border bg-transparent px-6 py-3.5 font-heading text-[17px] font-bold text-foreground transition-colors hover:border-primary/60"
        >
          <Upload className="h-4 w-4" strokeWidth={2.4} />
          Upload my CSV or PDF
        </button>

        <p className="mt-4 flex items-start justify-center gap-2 text-center text-[12.5px] text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          CSVs never leave your browser. PDFs are uploaded privately so they can be read. 1 free scan, no sign-in.
        </p>
      </div>
    </section>
  );
}
