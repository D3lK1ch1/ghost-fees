import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';

// A short step-by-step tour. Each step scrolls to the real thing on the page and
// rings it. Opt-in: it never pops up on its own (testers found pop-ups distracting);
// people start it with a "Take the tour" button, via replayTour(name). Testers: "quite overwhelmed at the beginning", "information overload".
export const TOUR_EVENT = 'ghostFees:tour';
const EVENT = TOUR_EVENT;
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

// guide: optional ghost guide ({ name, role, color }) who leads the tour.
export default function Tour({ name, steps, ready = true, auto = false, onFinish, guide }) {
  const [step, setStep] = useState(() => (auto && !seen(name) ? 0 : -1));
  // Only the steps whose target is on the page, checked after the page has drawn
  // (so a total that appears as the tour starts is included).
  const [live, setLive] = useState([]);
  const starting = step >= 0 && ready;
  useEffect(() => {
    if (!starting) return;
    setLive(steps.filter((item) => document.querySelector(`[data-tour="${item.target}"]`)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starting]);
  const active = ready && step >= 0 && step < live.length;
  const [spot, setSpot] = useState(null); // the target's place on screen

  useEffect(() => {
    const onReplay = (event) => event.detail === name && setStep(0);
    window.addEventListener(EVENT, onReplay);
    return () => window.removeEventListener(EVENT, onReplay);
  }, [name]);

  useEffect(() => {
    if (!active) return undefined;
    // A step can open the right tab first (click-through tour), then we find its target.
    live[step].onEnter?.();
    let el = null;
    const timer = setTimeout(() => {
      el = document.querySelector(`[data-tour="${live[step].target}"]`);
      if (!el) return;
      el.classList.add('tour-ring');
      // Bring the target near the top so the card has room under it.
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      measureLater();
    }, live[step].onEnter ? 250 : 0);
    // Keep the card next to its target while the page scrolls or resizes.
    let frame = 0;
    const measure = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSpot({ top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height });
    };
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    let later = 0;
    function measureLater() {
      measure();
      later = setTimeout(measure, 450);
    }
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    return () => {
      clearTimeout(timer);
      clearTimeout(later);
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('resize', onMove);
      el?.classList.remove('tour-ring');
    };
  }, [active, step, live]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => event.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function finish() {
    onFinish?.();
    try {
      window.localStorage.setItem(storageKey(name), '1');
    } catch {
      // Storage off: it just won't remember.
    }
    setStep(-1);
  }

  if (!active) return null;
  // Where the card goes: just under the target (or above it if there's no room),
  // lined up with it, never on top of it. Big targets: the card sits in the bottom
  // corner beside the content. Phones: a slim card at the bottom.
  const vw = typeof window === 'undefined' ? 1024 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
  const cardW = Math.min(416, vw - 24);
  const cardH = 270;
  let place = { left: 12, right: 12, bottom: 16, margin: '0 auto' };
  let arrow = null;
  if (spot && vw >= 640) {
    const left = Math.min(Math.max(12, spot.left), vw - cardW - 12);
    const arrowX = Math.min(Math.max(24, spot.left + Math.min(spot.width / 2, 120) - left), cardW - 32);
    if (spot.bottom + cardH + 16 < vh) {
      place = { top: spot.bottom + 14, left };
      arrow = { top: -9, left: arrowX, borderLeftWidth: 2, borderTopWidth: 2 };
    } else if (spot.top - cardH - 16 > 0) {
      place = { top: spot.top - cardH - 14, left };
      arrow = { bottom: -9, left: arrowX, borderRightWidth: 2, borderBottomWidth: 2 };
    } else {
      place = { right: 20, bottom: 20 };
    }
  }
  const current = live[step];
  const last = step === live.length - 1;
  return (
    <div role="dialog" aria-label="Quick tour" className="fixed z-[60] w-[min(26rem,calc(100vw-24px))] rounded-3xl border-2 border-primary bg-card p-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] transition-[top,left] duration-200" style={place}>
      {arrow && <span aria-hidden="true" className="absolute h-4 w-4 rotate-45 border-primary bg-card" style={arrow} />}
      {guide && (
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${guide.color}2e` }} aria-hidden="true">
            <GhostMark className="h-7 w-7 motion-safe:animate-float" style={{ color: guide.color }} eyeColor="#1a1230" />
          </span>
          <p className="text-[14px] leading-tight text-muted-foreground"><b style={{ color: guide.color }}>{guide.name}</b>, {guide.role}, shows you round</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase tracking-wide text-primary">Quick tour · {step + 1} of {live.length}</p>
        <div className="flex gap-1" aria-hidden="true">
          {live.map((item, i) => <span key={item.target} className={i === step ? 'h-1.5 w-4 rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'} />)}
        </div>
      </div>
      <p className="mt-1 font-heading text-[18px] font-bold text-foreground">{current.title}</p>
      <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{current.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={finish} className="text-[14px] font-bold text-muted-foreground underline underline-offset-4">Skip</button>
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

// The button that starts a tour.
export function TourButton({ name, label = 'Take the tour', className = '' }) {
  return (
    <button type="button" onClick={() => replayTour(name)} className={`inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-3.5 py-1.5 text-[14px] font-bold text-foreground hover:bg-primary/20 ${className}`}>
      <Compass className="h-4 w-4 text-primary" aria-hidden="true" /> {label}
    </button>
  );
}
