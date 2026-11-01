import { cn } from '@/lib/utils';

// Wraps one ghost (or ex, or chain link) so hovering it lights it up and shows
// what it is, like "Netflix · $16.99 a month". Works on any statement, sample or
// uploaded, because the words come from the scan. Keyboard users get the same
// label when the ghost's parent is focused, and screen readers read `label`.
export default function GhostTip({ label, detail, className, children, side = 'top' }) {
  return (
    <span className={cn('group/ghost relative inline-flex', className)}>
      <span className="transition-transform duration-200 group-hover/ghost:-translate-y-0.5 group-hover/ghost:scale-110 group-hover/ghost:drop-shadow-[0_0_14px_hsl(var(--primary)/0.85)]">
        {children}
      </span>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-30 w-max max-w-[190px] -translate-x-1/2 rounded-xl bg-[#170f2a] px-2.5 py-1.5 text-center text-[11.5px] leading-snug text-white opacity-0 shadow-lg ring-1 ring-primary/60 transition-opacity duration-150 group-hover/ghost:opacity-100',
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
        )}
      >
        <span className="block font-bold">{label}</span>
        {detail && <span className="block text-[#d9cff5]">{detail}</span>}
      </span>
    </span>
  );
}
