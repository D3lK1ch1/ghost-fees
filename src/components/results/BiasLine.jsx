import { useState } from 'react';
import { biasFor } from '@/lib/ghostFees/leaks';
import { cn } from '@/lib/utils';

// On a leak card: a small chip "🧠 Present Bias · why?" (Pack 9: cards were too tall).
// Tapping it shows the one-line pattern and its research. Only on leaks backed by
// statement lines (biasFor checks). Colours come from the card.
export default function BiasLine({ leak, className = '', style }) {
  const [open, setOpen] = useState(false);
  const info = biasFor(leak);
  if (!info) return null;
  return (
    <div className={className} style={style}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-current/25 px-2.5 py-0.5 text-[12.5px] font-semibold opacity-90 hover:opacity-100"
        style={{ borderColor: 'currentColor' }}
      >
        <span aria-hidden="true">🧠</span> {info.bias} <span className="opacity-70">· why?</span>
      </button>
      {open && (
        <p className={cn('mt-1.5 text-[13.5px] leading-snug')}>
          A common pattern: {info.line} <span className="opacity-75">({info.cite})</span>
        </p>
      )}
    </div>
  );
}
