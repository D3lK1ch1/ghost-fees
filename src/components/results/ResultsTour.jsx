import { useEffect, useState } from 'react';

// A 3-step tour the first time results show (after the reveal), so the page isn't
// overwhelming. Each step scrolls to the real thing and rings it. Skip any time.
// Shown once per browser. A tester: "quite overwhelmed at the beginning" (2 Nov).
const KEY = 'ghostFees.tourSeen.v1';
const STEPS = [
  { target: 'total', title: 'This is your total', body: 'Real charges from your own statement, nothing guessed. Below it you can share it or download a PDF.' },
  { target: 'tabs', title: 'Each tab is one job', body: 'Ghosts lists every leak. The others help you act: cancel, set reminders, send emails, track what stopped.' },
  { target: 'ask', title: 'Stuck? Ask a ghost', body: 'Our ghost guides answer questions about your results. Or press Ask Ghost It to try our chat agent on ASI:One.' },
];

const seen = () => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
};

export default function ResultsTour({ ready }) {
  const [step, setStep] = useState(() => (seen() ? -1 : 0));
  const active = ready && step >= 0 && step < STEPS.length;

  useEffect(() => {
    if (!active) return undefined;
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    if (!el) return undefined;
    el.classList.add('tour-ring');
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    return () => el.classList.remove('tour-ring');
  }, [active, step]);

  const finish = () => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      // Storage off: it just won't remember.
    }
    setStep(-1);
  };

  if (!active) return null;
  const current = STEPS[step];
  return (
    <div role="dialog" aria-label="Quick tour" className="fixed inset-x-3 bottom-4 z-[60] mx-auto max-w-md rounded-3xl border-2 border-primary bg-card p-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
      <p className="text-[12px] font-bold uppercase tracking-wide text-primary">Quick tour · {step + 1} of {STEPS.length}</p>
      <p className="mt-1 font-heading text-[18px] font-bold text-foreground">{current.title}</p>
      <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{current.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={finish} className="text-[13px] font-bold text-muted-foreground underline underline-offset-4">Skip</button>
        <button type="button" onClick={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))} className="rounded-full bg-primary px-5 py-2 text-[14px] font-bold text-primary-foreground">
          {step === STEPS.length - 1 ? 'Got it' : 'Next'}
        </button>
      </div>
    </div>
  );
}
