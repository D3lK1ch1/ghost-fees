import { Brain } from 'lucide-react';
import { biasFor } from '@/lib/ghostFees/leaks';
import { cn } from '@/lib/utils';

// Under a leak's "what it means": the common money pattern behind it, with the research.
// Only on leaks backed by statement lines (biasFor checks). Colours come from the card.
export default function BiasLine({ leak, className = '', style, citeStyle }) {
  const info = biasFor(leak);
  if (!info) return null;
  return (
    <p className={cn('flex items-start gap-1.5 text-[13.5px] leading-snug', className)} style={style}>
      <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
      <span>
        <b>A common pattern: {info.bias}.</b> {info.line}{' '}
        <span className="opacity-75" style={citeStyle}>({info.cite})</span>
      </span>
    </p>
  );
}
