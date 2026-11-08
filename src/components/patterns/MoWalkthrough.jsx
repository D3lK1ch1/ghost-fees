import { useState } from 'react';
import { GUIDES } from '@/lib/ghostFees/guides';
import { MO_WALK_SEEN } from '@/lib/ghostFees/habitPlan';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';
import { usePatterns } from './PatternContext';

// Pack 10 part A: Mo walks you through your patterns in 3 steps, in a speech bubble.
// Fixed copy, no AI. Open the first time in this browser, then one line to replay.
// Numbers only from biasGroups. The bubble is a rounded card (not a pill) so longer
// lines keep clear of the edge; at phone width the bubble sits above Mo.
const VOICE = {
  haunted: { who: 'the money mind ghost', opener: '' },
  ex: { who: "who's seen this a hundred times", opener: 'Here’s why this ex stuck around. ' },
  christmas: { who: 'the spirit of habits past', opener: 'Here’s the old habit behind it. ' },
};
const INK = '#2E1A23';
const seen = () => { try { return window.localStorage.getItem(MO_WALK_SEEN) === '1'; } catch { return false; } };
const markSeen = () => { try { window.localStorage.setItem(MO_WALK_SEEN, '1'); } catch { /* storage off */ } };

// Styled after the white bubble in our sticker set (Image Assets/Cute Pastel Comic Bubble
// Sticker Set): white, a dark ink outline, a soft pink band along the bottom, a curved tail
// toward Mo and three little red "pop" marks. Drawn in CSS and SVG so any amount of text fits.
const PINK = '#FDD9EF';
const POP = '#F04B6D';
function Bubble({ children }) {
  return (
    <div className="relative w-full pt-6">
      {/* Three pop marks above the top-right corner, like the sticker. */}
      <svg aria-hidden="true" viewBox="0 0 40 30" className="absolute right-5 top-0 h-6 w-8">
        <g stroke={POP} strokeWidth="4" strokeLinecap="round">
          <path d="M6 26 L3 14" /><path d="M16 22 L20 8" /><path d="M26 25 L37 17" />
        </g>
      </svg>
      <div
        className="relative z-10 rounded-[30px] border-[3px] bg-white px-6 py-4 pb-5 text-[15.5px] font-medium leading-[1.55] sm:px-7"
        style={{ borderColor: INK, color: INK, boxShadow: `inset 0 -9px 0 ${PINK}, 0 6px 14px rgba(0,0,0,0.28)` }}
      >
        {children}
      </div>
      {/* Curved tail: down and out toward Mo on phones (Mo sits below), left toward Mo on wider screens. */}
      <svg aria-hidden="true" viewBox="0 0 44 40" className="absolute -bottom-[26px] left-10 z-20 h-[30px] w-[33px] sm:hidden">
        <path d="M6 0 C8 14 4 26 0 38 C14 30 26 18 34 0 Z" fill={PINK} />
        <path d="M7 4 C8 15 4 26 0 38 C14 30 25 18 32 4" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 40 44" className="absolute -left-[33px] bottom-5 z-20 hidden h-[44px] w-[40px] sm:block">
        <path d="M40 4 C26 6 14 2 2 0 C10 14 22 26 40 34 Z" fill="#fff" />
        <path d="M34 5 C24 6 14 2 2 0 C10 14 20 25 34 31" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function MoWalkthrough({ groups, total, themeKey, habitName, onHabit }) {
  const { answers, setAnswer, openPattern } = usePatterns();
  const [open, setOpen] = useState(() => !seen());
  const [step, setStep] = useState(0);
  if (!groups.length) return null;
  const top = groups[0];
  const voice = VOICE[themeKey] || VOICE.haunted;
  const answer = answers?.[top.key];
  const close = () => { markSeen(); setOpen(false); setStep(0); };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-left text-[14.5px] text-foreground/90 underline-offset-4 hover:underline">
        <span aria-hidden="true">🧠 </span>Mo can walk you through this again <span className="font-semibold text-primary">→</span>
      </button>
    );
  }

  const chip = 'rounded-full border-[2px] px-3 py-1.5 text-[14px] font-semibold';
  const steps = [
    <>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] opacity-60">Step 1 of 3 · Your biggest pattern</p>
      <p className="mt-1">{voice.opener}<b>{moneyWhole(top.total)} of your {money(total)} is the {top.bias}.</b> {top.line} It’s a common pattern, not a flaw.</p>
    </>,
    <>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] opacity-60">Step 2 of 3 · Sound like you?</p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Sound like you?">
        {[['yes', 'Yes, that’s me'], ['unsure', 'Not sure'], ['no', 'No, something else']].map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={answer === k} onClick={() => { setAnswer(top.key, k); if (k === 'unsure') openPattern(top.key); }}
            className={cn(chip, answer === k ? 'text-white' : 'bg-white')} style={{ borderColor: INK, background: answer === k ? INK : undefined }}>{label}</button>
        ))}
      </div>
      {answer === 'yes' && <p className="mt-2">Nice spot. Noticing it is the first step.</p>}
      {answer === 'unsure' && <p className="mt-2">Fair. Have a look at the ghosts behind it.</p>}
      {answer === 'no' && <p className="mt-2">Patterns are common, not universal. Let’s look at the next one.</p>}
    </>,
    <>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] opacity-60">Step 3 of 3 · One small habit</p>
      <p className="mt-1">One habit beats four. Here’s one for this pattern: <b>{top.beat}</b> Want {habitName} to help you stick to it?</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button type="button" onClick={() => { close(); onHabit(top.key); }} className={cn(chip, 'text-white')} style={{ borderColor: INK, background: INK }}>Yes, help me stick to it</button>
        <button type="button" onClick={close} className={cn(chip, 'bg-white')} style={{ borderColor: INK }}>Not now</button>
      </div>
    </>,
  ];

  return (
    <section aria-label="Mo walks you through your patterns" className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-end">
      <div className="flex shrink-0 flex-col items-center sm:w-24">
        <img src={GUIDES.mind.image} alt="" width={72} height={80} className="h-20 w-[72px] object-contain drop-shadow-[0_0_14px_rgba(94,230,200,0.35)] motion-safe:animate-float" />
        <p className="mt-1 text-center text-[13px] font-semibold text-foreground">Mo</p>
        <p className="text-center text-[11.5px] leading-tight text-muted-foreground">{voice.who}</p>
      </div>
      <div className="w-full min-w-0 flex-1">
        <Bubble>{steps[step]}</Bubble>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="font-semibold text-foreground/85 hover:text-foreground">← Back</button>}
          {step < 2 && <button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground">Next</button>}
          <button type="button" onClick={close} className="ml-auto text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Skip, show me everything</button>
        </div>
      </div>
    </section>
  );
}
