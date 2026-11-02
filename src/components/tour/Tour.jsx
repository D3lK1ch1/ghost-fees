import { useEffect, useMemo, useState } from 'react';

// A short step-by-step tour. Each step scrolls to the real thing on the page and
// rings it. Opt-in: it never pops up on its own (testers found pop-ups distracting);
// people start it with a "Take the tour" button, via replayTour(name). Testers: "quite overwhelmed at the beginning", "information overload".
const EVENT = 'ghostFees:tour';
const storageKey = (name) => `ghostFees.tourSeen.${name}.v1`;

const seen = (name) => {
  try {
    return window.localStorage.getItem(storageKey(name)) === '1';
  } catch {
    return true;
  }
};

export function replayTour(name) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }));
}

export default function Tour({ name, steps, ready = true, auto = false }) {
  const [step, setStep] = useState(() => (auto && !seen(name) ? 0 : -1));
  // Only the steps whose target is on the page right now (checked after it renders).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = useMemo(
    () => (mounted && step >= 0 ? steps.filter((item) => document.querySelector(`[data-tour="${item.target}"]`)) : []),
    [mounted, step === -1, steps],
  );
  const active = ready && step >= 0 && step < live.length;

  useEffect(() => {
    const onReplay = (event) => event.detail === name && setStep(0);
    window.addEventListener(EVENT, onReplay);
    return () => window.removeEventListener(EVENT, onReplay);
  }, [name]);

  useEffect(() => {
    if (!active) return undefined;
    const el = document.querySelector(`[data-tour="${live[step].target}"]`);
    if (!el) return undefined;
    el.classList.add('tour-ring');
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    return () => el.classList.remove('tour-ring');
  }, [active, step, live]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => event.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function finish() {
    try {
      window.localStorage.setItem(storageKey(name), '1');
    } catch {
      // Storage off: it just won't remember.
    }
    setStep(-1);
  }

  if (!active) return null;
  const current = live[step];
  const last = step === live.length - 1;
  return (
    <div role="dialog" aria-label="Quick tour" className="fixed inset-x-3 bottom-4 z-[60] mx-auto max-w-md rounded-3xl border-2 border-primary bg-card p-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:left-1/2 sm:w-[28rem] sm:-translate-x-1/2">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-wide text-primary">Quick tour · {step + 1} of {live.length}</p>
        <div className="flex gap-1" aria-hidden="true">
          {live.map((item, i) => <span key={item.target} className={i === step ? 'h-1.5 w-4 rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'} />)}
        </div>
      </div>
      <p className="mt-1 font-heading text-[18px] font-bold text-foreground">{current.title}</p>
      <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{current.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={finish} className="text-[13px] font-bold text-muted-foreground underline underline-offset-4">Skip</button>
        <div className="flex gap-2">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="rounded-full border border-border px-4 py-2 text-[14px] font-bold text-foreground">Back</button>}
          <button type="button" onClick={() => (last ? finish() : setStep(step + 1))} className="rounded-full bg-primary px-5 py-2 text-[14px] font-bold text-primary-foreground">
            {last ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
