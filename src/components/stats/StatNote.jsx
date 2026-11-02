import { statFor } from '@/data/stats';
import { cn } from '@/lib/utils';

// One sourced stat, shown in context (e.g. the gym stat beside a gym charge).
export default function StatNote({ statKey, className = '' }) {
  const fact = statFor(statKey);
  if (!fact) return null;
  return (
    <p className={cn('text-[12px] leading-snug text-muted-foreground', className)}>
      <span aria-hidden="true">{fact.emoji} </span>
      <b className="text-foreground">{fact.stat}</b> {fact.text}. <span className="opacity-75">({fact.source})</span>
    </p>
  );
}
