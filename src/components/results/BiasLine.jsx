import { useState } from 'react';
import { biasFor } from '@/lib/ghostFees/leaks';
import { usePatterns } from '@/components/patterns/PatternContext';

// On a leak card: a small chip "🧠 Present Bias · why?" (Pack 9: cards were too tall).
// Tapping it opens that pattern's popup. Hidden when the person said "No, something
// else" for this pattern this session. Without the results context it expands inline.
export default function BiasLine({ leak, className = '', style }) {
  const [open, setOpen] = useState(false);
  const ctx = usePatterns();
  const info = biasFor(leak);
  if (!info || ctx?.answers?.[info.key] === 'no') return null;
  const onClick = () => (ctx ? ctx.openPattern(info.key) : setOpen((v) => !v));
  return (
    <div className={className} style={style}>
      <button
        type="button"
        onClick={onClick}
        aria-haspopup={ctx ? 'dialog' : undefined}
        aria-expanded={ctx ? undefined : open}
        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold opacity-90 hover:opacity-100"
        style={{ borderColor: 'currentColor' }}
      >
        <span aria-hidden="true">🧠</span> {info.bias} <span className="opacity-70">· why?</span>
      </button>
      {!ctx && open && (
        <p className="mt-1.5 text-[13.5px] leading-snug">
          A common pattern: {info.line} <span className="opacity-75">({info.cite})</span>
        </p>
      )}
    </div>
  );
}
