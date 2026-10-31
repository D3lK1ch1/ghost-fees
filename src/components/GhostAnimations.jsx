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

// Shown after a successful feedback submit.
export function CapturedJar({ message = 'Thanks! Ghosts captured.' }) {
  const flies = [[-140, -90], [140, -110], [-110, 60], [130, 70]];

  return (
    <div className="relative mx-auto flex h-[200px] w-full max-w-[380px] flex-col items-center justify-end">
      {flies.map(([x, y], index) => (
        <span
          key={`${x}-${y}`}
          className="absolute bottom-[70px] w-7 animate-ghost-suck"
          style={{ '--sx': `${x}px`, '--sy': `${y}px`, animationDelay: `${index * 0.12}s` }}
        >
          <GhostMark className="h-7 w-7 text-[#f5efe6]" eyeColor="#150e28" />
        </span>
      ))}

      <svg viewBox="0 0 64 72" width="64" height="72" className="animate-ghost-jar">
        <rect x="18" y="4" width="28" height="8" rx="2" fill="#ffaa3c" />
        <path d="M14 14h36v46a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" fill="rgba(255,255,255,0.12)" stroke="#f5efe6" strokeWidth="2" />
        <circle cx="32" cy="44" r="10" fill="rgba(255,170,60,0.35)" />
      </svg>

      <p className="mt-2.5 animate-rise text-[18px] font-bold text-white" style={{ animationDelay: '1.1s' }}>
        {message}
      </p>
    </div>
  );
}