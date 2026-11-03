import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// A results section that opens and closes, so the page stays clean (3 Nov: "make things
// collapse and expand"). Closed, it shows the title and a one-line summary.
export default function CollapseCard({ icon: Icon, title, summary, defaultOpen = false, label, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section aria-label={label || title} className={cn('mt-6 rounded-3xl border border-border bg-card', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-3xl p-4 text-left sm:p-5"
      >
        {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[18px] font-bold text-foreground">{title}</span>
          {summary && <span className="mt-0.5 block text-[14px] leading-snug text-muted-foreground">{summary}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-primary">
          {open ? 'Hide' : 'Open'}
          <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </span>
      </button>
      {open && <div id={id} className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>}
    </section>
  );
}
