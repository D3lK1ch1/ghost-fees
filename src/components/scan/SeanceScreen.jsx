import { useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import { cn } from '@/lib/utils';

const LINES = ['Placing the statement on the table…', 'Asking the spirits about merchants…'];
const LINE_MS = 500;
const TOTAL_MS = 1600;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LIT = new Set(['G', 'H', 'O', 'S', 'T']);

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Candle({ className }) {
  return (
    <span className={cn('pointer-events-none absolute flex flex-col items-center', className)}>
      <span className="h-3 w-2 animate-flicker rounded-full bg-[#ffcf73] shadow-[0_0_16px_6px_rgba(255,190,90,0.45)]" />
      <span className="mt-0.5 h-9 w-2.5 rounded-sm bg-[#f0e6d2]" />
    </span>
  );
}

// Séance scan screen: the table, the board, the planchette. Same timeline as the
// old scan screen — calls onDone once, then keeps the last line on screen.
export default function SeanceScreen({ lastLine = 'Ghost detected', onDone, onCancel }) {
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
        <div className="relative flex h-[260px] w-full animate-rise items-center justify-center overflow-hidden rounded-3xl border border-[#4a3770] bg-[#160e28]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(255,190,90,0.16),transparent_65%)]" />

          <Candle className="bottom-7 left-6" />
          <Candle className="bottom-7 right-6" />
          <Candle className="bottom-9 left-14 scale-75" />

          <div className="grid grid-cols-6 gap-x-4 gap-y-2 px-12 font-retro text-[16px] uppercase tracking-[0.18em]">
            {LETTERS.map((letter) => (
              <span
                key={letter}
                className={cn(
                  'transition-colors duration-700',
                  LIT.has(letter) && line >= 1
                    ? 'text-[#ffcf73] [text-shadow:0_0_14px_rgba(255,190,90,0.7)]'
                    : 'text-[#6c5a99]/70',
                )}
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="pointer-events-none absolute animate-seance drop-shadow-[0_0_22px_rgba(255,190,90,0.35)]">
            <svg viewBox="0 0 100 90" className="h-16 w-[74px]" aria-hidden="true">
              <path d="M8 16 H92 L50 84 Z" fill="rgba(245,239,230,0.14)" stroke="#f5efe6" strokeWidth="2" />
              <circle cx="50" cy="38" r="12" fill="rgba(255,170,60,0.4)" stroke="#ffc27a" strokeWidth="2" />
            </svg>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
            <span className="font-retro text-[15px] uppercase tracking-[0.16em] text-primary/80">Seance</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full animate-ghost-fill bg-primary" />
            </span>
          </div>
        </div>

        <p className="mt-6 font-retro text-[24px] leading-none text-[#ffc27a]" aria-live="polite">
          {text}
        </p>

        <p className="mt-6 text-[13px] text-muted-foreground">
          The board only reads the file you picked. Nothing is stored.
        </p>
      </main>
    </div>
  );
}