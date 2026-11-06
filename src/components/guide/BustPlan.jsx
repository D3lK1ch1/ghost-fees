import { Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { useGoalTasks } from '@/lib/ghostFees/goalTasks';
import { trackEvent } from '@/lib/session';

const GUS = '#ff6fa3';

// How to bust each kind of ghost, and which ghost helps with each step.
const HOW = {
  cancel: { line: 'Cancel it on their site, send the cancel email, then check it stops.', helpers: [['cass', 'Cassy: cancel page'], ['sir', 'Spooksworth: cancel email']] },
  refund: { line: 'Ask for your money back with the refund email, then check it lands.', helpers: [['sir', 'Spooksworth: refund email'], ['cass', 'Cassy: their contact page']] },
  waive: { line: 'Ask the bank to waive it. Most banks will for a first request.', helpers: [['sir', 'Spooksworth: waiver email'], ['penny', 'Penny: what this fee is']] },
  check: { line: 'It went up in price. Decide if it is still worth it, or keep one and cancel the double.', helpers: [['bundle', 'Kit: keep or rotate'], ['cass', 'Cassy: cancel page']] },
};

const isDone = (ticks, id) => Boolean(ticks[id]?.[2] || (ticks[id]?.[0] && ticks[id]?.[1] && ticks[id]?.[2]));

// Gus the bust coach: your score, then each ghost with how to bust it, the button that
// does it, the ghost that helps, and Busted (ticks the same task list as the goal path).
export default function BustPlan({ leaks, onHandoff, onOpenEmail, onOpenPath }) {
  const { ticks, tick } = useGoalTasks();
  const items = (leaks || []).slice(0, 6);
  if (!items.length) return null;
  const busted = items.filter((leak) => isDone(ticks, leak.id));
  const saved = busted.reduce((sum, leak) => sum + (Number(leak.amount) || 0), 0);
  const total = items.reduce((sum, leak) => sum + (Number(leak.amount) || 0), 0);
  const next = items.find((leak) => !isDone(ticks, leak.id));
  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground transition-colors hover:border-[#ff6fa3]';
  return (
    <div className="mt-2 w-full rounded-xl border border-[#ff6fa3]/40 bg-[#ff6fa3]/[0.05] p-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-heading text-[14px] font-bold text-foreground">🏆 Score: {busted.length} of {items.length} busted</p>
        <p className="text-[12.5px] font-bold" style={{ color: GUS }}>{money(saved)} of {money(total)} sorted</p>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${total ? (saved / total) * 100 : 0}%`, background: GUS }} />
      </div>
      {next && <p className="mt-1.5 text-[12.5px] text-muted-foreground">Next up: <span className="font-bold text-foreground">{next.title || next.merchant}</span>. LET&apos;S GO!</p>}
      <ol className="mt-2 space-y-1.5">
        {items.map((leak, i) => {
          const kind = HOW[leak.action] ? leak.action : 'check';
          const how = HOW[kind];
          const done = isDone(ticks, leak.id);
          const link = kind === 'cancel' ? cancelInfo(leak.merchant || leak.title) : null;
          return (
            <li key={leak.id} className={cn('rounded-xl border p-2.5 text-[13.5px]', done ? 'border-[#ff6fa3]/50 bg-[#ff6fa3]/10' : 'border-border bg-background/50')}>
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn('font-bold', done ? 'text-muted-foreground line-through' : 'text-foreground')}>{i + 1}. {leak.title || leak.merchant}</p>
                <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">{money(leak.amount)}</span>
              </div>
              {!done && <p className="mt-0.5 text-muted-foreground"><span className="font-semibold text-foreground">How to bust it: </span>{how.line}</p>}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {!done && link?.url && (
                  <a className={btn} href={link.url} target="_blank" rel="noreferrer" onClick={() => trackEvent('gus_cancel_link')}>
                    Cancel on {link.name} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!done && leak.action && <button type="button" className={btn} onClick={() => { tick(leak.id, 0, true); onOpenEmail?.(leak); }}>Open the email</button>}
                {!done && how.helpers.map(([key, label]) => (
                  <button key={key} type="button" className={btn} onClick={() => onHandoff?.(key, leak)}>{label} →</button>
                ))}
                <button type="button" onClick={() => { tick(leak.id, 0, true); tick(leak.id, 1, true); tick(leak.id, 2, !done); trackEvent('gus_busted'); }}
                  aria-pressed={done} className={cn(btn, done && 'border-transparent text-[#2a0f1c]')} style={done ? { background: GUS } : undefined}>
                  <Check className="h-3.5 w-3.5" /> {done ? 'Busted!' : 'Busted it'}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {onOpenPath && <button type="button" onClick={onOpenPath} className="mt-2 text-[12.5px] font-bold underline-offset-4 hover:underline" style={{ color: GUS }}>See it all on my goal path →</button>}
    </div>
  );
}
