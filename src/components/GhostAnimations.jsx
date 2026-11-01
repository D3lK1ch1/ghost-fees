import { useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import GhostMark from '@/components/site/GhostMark';
import { cn } from '@/lib/utils';
import { money, moneyWhole } from '@/lib/ghostFees/format';

const LINES = ['Reading statement…', 'Matching merchants…'];
const LINE_MS = 500;
const TOTAL_MS = 1600;
const COUNT_MS = 1200;

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Scan animation. Calls onDone once when its timeline ends, then keeps its
// last line on screen until the parent unmounts it.
export function ScanScreen({ lastLine = 'Ghost detected', onDone, onCancel }) {
  const [line, setLine] = useState(0);
  const done = useRef(onDone);
  const final = useRef(lastLine);
  done.current = onDone;
  final.current = lastLine;

  useEffect(() => {
    if (reducedMotion()) {
      setLine(2);
      done.current?.();
      return undefined;
    }

    const timers = [
      setTimeout(() => setLine(1), LINE_MS),
      setTimeout(() => {
        setLine(2);
        done.current?.();
      }, TOTAL_MS),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const text = line >= 2 ? lastLine : LINES[line];

  return (
    <div className="min-h-screen">
      <BrandHeader
        right={onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-white"
          >
            Cancel
          </button>
        ) : null}
      />

      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-24 pt-4 text-center sm:px-8">
        <div className="relative h-[220px] w-full animate-rise overflow-hidden rounded-3xl border border-white/10 bg-[#1a1230]">
          <div className="space-y-3 p-8 opacity-40">
            {[90, 70, 85, 60, 75].map((width) => (
              <div key={width} className="h-3 rounded" style={{ width: `${width}%`, background: 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-ghost-sweep bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.45),transparent_70%)]" />

          <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-6">
            <p className="font-retro text-[22px] leading-none text-[#ffc27a]">{text}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full animate-ghost-fill bg-primary" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-[13px] text-muted-foreground">
          Usually takes about 10 seconds. Your file stays private.
        </p>
      </main>
    </div>
  );
}

// Counts up in whole dollars, then settles on the exact cents.
export function CountUp({ value, duration = COUNT_MS }) {
  const [shown, setShown] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (reducedMotion()) {
      setShown(value);
      setFinished(true);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setShown(value * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setShown(value);
        setFinished(true);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="tabular-nums">{finished ? money(value) : moneyWhole(shown)}</span>;
}

// Faint CRT lines over the whole app.
export function CrtOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 mix-blend-overlay"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 2px 4px)',
      }}
    />
  );
}

// Generic staggered list: CardItem children float in one after another.
export function CardList({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardItem({ index = 0, children, className = '' }) {
  return (
    <div
      className={cn('animate-ghost-card', className)}
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      {children}
    </div>
  );
}

export function BadgePop({ delay = 0.6, children, className = '' }) {
  return (
    <span
      className={cn('inline-block animate-ghost-pop', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}

export function BobbingGhost({ size = 72 }) {
  return (
    <span className="inline-block animate-bob drop-shadow-[0_0_18px_rgba(255,170,60,0.35)]">
      <span style={{ width: size, height: size }} className="block">
        <GhostMark className="h-full w-full text-foreground" eyeColor="#150e28" />
      </span>
    </span>
  );
}

// Shown after a successful feedback submit: white ghosts swoop in from all sides,
// one after another, shrink into the jar and stay inside it, bobbing behind the
// glass. The lid wobbles on each catch. Reduced motion: ghosts just appear in the jar.
const CATCHES = [[-170, -120, -30], [170, -130, 25], [-200, 10, -20], [200, 0, 30], [-120, -170, 15], [130, -175, -25], [-160, 90, 20], [160, 80, -15]];
const INSIDE = [[-11, 14], [10, 12], [0, 2], [-12, -6], [11, -8], [-2, -16], [8, 24], [-8, 26]];
const CAPTURE_CSS = `
@keyframes gcFly{0%{opacity:0;transform:translate(var(--sx),var(--sy)) rotate(var(--rot)) scale(1)}12%{opacity:1}55%{transform:translate(calc(var(--sx)*.35),calc(var(--sy)*.35 - 40px)) rotate(calc(var(--rot)*-1)) scale(.9)}100%{opacity:0;transform:translate(0,0) rotate(0) scale(.25)}}
@keyframes gcIn{0%{opacity:0;transform:scale(.2)}100%{opacity:1;transform:scale(1)}}
@keyframes gcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes gcLid{0%,100%{transform:rotate(0)}30%{transform:rotate(-12deg) translateY(-3px)}60%{transform:rotate(8deg)}}
@keyframes gcGlow{0%,100%{opacity:.18}50%{opacity:.45}}
.gc-fly{animation:gcFly .9s cubic-bezier(.45,.05,.55,.95) both}
.gc-in{animation:gcIn .3s ease-out both}
.gc-bob{animation:gcBob 1.8s ease-in-out infinite}
.gc-lid{animation:gcLid .35s ease-in-out 8;animation-delay:.85s;animation-duration:.28s;transform-origin:50% 100%;transform-box:fill-box}
.gc-glow{animation:gcGlow 2.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.gc-fly{display:none}.gc-in,.gc-bob,.gc-lid,.gc-glow{animation:none}}
`;

export function CapturedJar({ message = 'Thanks! Ghosts captured.' }) {
  return (
    <div className="relative mx-auto flex h-[250px] w-full max-w-[420px] flex-col items-center justify-end">
      <style>{CAPTURE_CSS}</style>
      {CATCHES.map(([x, y, rot], i) => (
        <span key={i} aria-hidden="true" className="gc-fly pointer-events-none absolute bottom-[96px] left-1/2 -ml-4 w-8" style={{ '--sx': `${x}px`, '--sy': `${y}px`, '--rot': `${rot}deg`, animationDelay: `${i * 0.28}s` }}>
          <GhostMark className="h-8 w-8 text-[#fbf8fa] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" eyeColor="#150e28" />
        </span>
      ))}

      <div className="relative">
        <svg viewBox="0 0 90 104" width="96" height="111" aria-hidden="true" className="block overflow-visible">
          <ellipse cx="45" cy="101" rx="34" ry="3.5" fill="#000" opacity=".35" />
          <circle className="gc-glow" cx="45" cy="64" r="30" fill="#fbf8fa" />
          <path d="M18 24C10 26 8 32 8 42V88Q8 98 18 98H72Q82 98 82 88V42C82 32 80 26 72 24Z" fill="rgba(255,255,255,0.08)" stroke="#f4dfe4" strokeWidth="2.5" />
          <path d="M15 46V84" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".3" />
          <g className="gc-lid">
            <rect x="16" y="8" width="58" height="16" rx="5" fill="hsl(var(--primary))" />
            <rect x="22" y="11" width="16" height="3" rx="1.5" fill="#fff" opacity=".45" />
          </g>
        </svg>
        <div className="pointer-events-none absolute left-1/2 top-[66px] h-0 w-0">
          {INSIDE.map(([x, y], i) => (
            <span key={i} aria-hidden="true" className="gc-in absolute" style={{ left: x - 9, top: y - 9, animationDelay: `${0.85 + i * 0.28}s` }}>
              <span className="gc-bob block" style={{ animationDelay: `${i * 0.23}s` }}>
                <GhostMark className="h-[18px] w-[18px] text-[#fbf8fa]" eyeColor="#150e28" />
              </span>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 animate-rise text-[18px] font-bold text-white" style={{ animationDelay: '3s' }}>{message}</p>
      <p className="animate-rise text-[13px] text-muted-foreground" style={{ animationDelay: '3.2s' }}>{CATCHES.length} ghosts in the jar. Your answers help us catch more.</p>
    </div>
  );
}
