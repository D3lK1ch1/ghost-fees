import { useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
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