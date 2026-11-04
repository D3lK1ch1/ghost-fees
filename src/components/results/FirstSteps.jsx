import { useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import { useGhostList } from '@/hooks/use-ghost-list';
import { cn } from '@/lib/utils';

// "Your first 3 steps": a small card above the tabs on your first results, so the
// page has one clear path instead of everything at once. Each step opens the right
// tab ("Show me") and ticks itself off when you've done it. Not a pop-up; hide it
// any time. Testers: "information overload", "a little tour on the trial".
const KEY = 'ghostFees.firstStepsHidden.v1';

const hidden = () => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export default function FirstSteps({ setTab, answers = {}, firstLeakTitle }) {
  const [ghostList] = useGhostList();
  const [gone, setGone] = useState(hidden);
  const [seenBiggest, setSeenBiggest] = useState(false);
  if (gone) return null;

  const jump = (tab, selector) => {
    setTab(tab);
    setTimeout(() => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };
  const steps = [
    {
      title: firstLeakTitle ? `See your biggest ghost: ${firstLeakTitle}` : 'See your biggest ghost',
      line: 'What it is and the charges behind it.',
      done: seenBiggest,
      go: () => {
        setSeenBiggest(true);
        jump('ghosts', '[data-tour="panel"]');
      },
    },
    {
      title: 'Keep or cancel your subscriptions',
      line: 'Answer Yes or No for each one.',
      done: Object.values(answers).some(Boolean) || ghostList.length > 0,
      go: () => jump('subscriptions', '[data-tour="panel"]'),
    },
    {
      title: 'Cancel one for real',
      line: 'Open its cancel page, or let Cassy find it, then mark it cancelled.',
      done: ghostList.length > 0,
      go: () => jump('calendar', '[aria-label="Cancellation assistant"]'),
    },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const hide = () => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      // Storage off: it just won't remember.
    }
    setGone(true);
  };

  return (
    <section aria-label="Your first 3 steps" className="mt-4 rounded-3xl border-2 border-primary/50 bg-primary/[0.06] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-[18px] font-bold text-foreground">{doneCount === 3 ? 'All 3 done. Nice ghost hunting 👻' : 'Your first 3 steps'}</p>
          <p className="text-[14px] text-muted-foreground">{doneCount} of 3 done. Everything else can wait.</p>
        </div>
        <button type="button" onClick={hide} aria-label="Hide first steps" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={step.title}>
            <button type="button" onClick={step.go} className={cn('flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors', step.done ? 'border-[#5ee6c8]/40 bg-[#5ee6c8]/[0.06]' : 'border-border bg-card/70 hover:border-primary/60')}>
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-[15px] font-bold', step.done ? 'bg-[#5ee6c8] text-[#0f2a24]' : 'bg-primary text-primary-foreground')}>
                {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-[15px] font-bold', step.done ? 'text-muted-foreground line-through' : 'text-foreground')}>{step.title}</span>
                <span className="block text-[13.5px] text-muted-foreground">{step.line}</span>
              </span>
              {!step.done && <span className="inline-flex shrink-0 items-center gap-0.5 text-[13.5px] font-bold text-primary">Show me <ChevronRight className="h-4 w-4" /></span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
