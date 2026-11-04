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
      // Big target: use the empty space to its right if there's room. Otherwise tuck
      // the card neatly inside the target's bottom right corner, clear of its border
      // (4 Nov: it used to hang half over the edge).
      const gutter = vw - (spot.left + spot.width) - 24;
      const width = Math.min(360, cardW);
      if (gutter >= 300) place = { top: Math.max(16, Math.min(spot.top, vh - cardH - 16)), left: spot.left + spot.width + 12, width: Math.min(cardW, gutter) };
      else {
        const inset = 20;
        const right = Math.max(12, vw - (spot.left + spot.width) + inset);
        const bottom = Math.max(16, vh - Math.min(spot.bottom, vh) + inset);
        place = { right, bottom, width };
      }
    }
  }
  const current = live[step];
  const last = step === live.length - 1;
  return (
    <div role="dialog" aria-label="Quick tour" className="fixed z-[60] w-[min(24rem,calc(100vw-24px))] rounded-2xl border border-primary/50 bg-card/95 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[top,left,right,bottom] duration-200" style={place}>
      {arrow && <span aria-hidden="true" className="absolute h-4 w-4 rotate-45 border-primary/50 bg-card" style={arrow} />}
      <div className="flex items-center gap-2.5">
        {guide ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${guide.color}2e` }} aria-hidden="true">
            <GhostMark className="h-6 w-6 motion-safe:animate-float" style={{ color: guide.color }} eyeColor="#1a1230" />
          </span>
        ) : (
          <Compass className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        )}
        <p className="min-w-0 flex-1 text-[13px] leading-tight text-muted-foreground">
          {guide && <b className="block text-[14px]" style={{ color: guide.color }}>{guide.name} shows you round</b>}
          Step {step + 1} of {live.length}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {live.map((item, i) => <span key={item.target} className={i === step ? 'h-1.5 w-4 rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'} />)}
        </div>
      </div>
      <p className="mt-3 font-heading text-[18px] font-semibold leading-tight text-foreground">{current.title}</p>
      <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">{current.body}</p>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={finish} className="text-[13.5px] font-semibold text-muted-foreground hover:text-foreground">Skip tour</button>
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
