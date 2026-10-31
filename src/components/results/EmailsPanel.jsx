import { Landmark, Mail, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';

const ACTIONS = {
  cancel: { label: 'Cancel email', blurb: 'Asks them to cancel and confirm by email.', Icon: Mail },
  refund: { label: 'Refund request', blurb: 'Lists the extra charges and asks for the money back.', Icon: Undo2 },
  waive: { label: 'Ask bank to waive', blurb: 'Lists the fees and asks your bank to refund them.', Icon: Landmark },
};

// Every ready-made email in one list, so they are easy to find.
export default function EmailsPanel({ leaks, onDraft }) {
  const ready = leaks.filter((leak) => ACTIONS[leak.action]);

  return (
    <section className="mt-4">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        One email ready for each ghost. Open it, edit anything, then copy it or send it from your own mail app.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ready.map((leak) => {
          const action = ACTIONS[leak.action];
          return (
            <button
              key={leak.id}
              type="button"
              onClick={() => onDraft(leak)}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/60"
            >
              <span className="rounded-xl bg-primary/15 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <action.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-heading text-[15px] font-semibold text-foreground">{leak.title || leak.merchant}</span>
                  <span className="shrink-0 font-bold tabular-nums text-primary">{money(leak.amount)}</span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-bold', BADGE_TONES[leak.badge])}>{leak.badge}</span>
                  <span className="text-[12px] font-bold text-foreground/90">{action.label}</span>
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">{action.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
      {!ready.length && <p className="mt-4 text-[13.5px] text-muted-foreground">None of these ghosts need an email.</p>}
    </section>
  );
}
