import { CalendarPlus, Check, ExternalLink, Mail, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { useGoalTasks } from '@/lib/ghostFees/goalTasks';
import { downloadTask, googleCalendarUrl, outlookCalendarUrl } from '@/lib/ghostFees/reminder';
import { useGhostList } from '@/hooks/use-ghost-list';
import { useCancelProof } from '@/components/results/ProofDialog';
import { trackEvent } from '@/lib/session';
import { addGhostReminder } from '@/lib/ghostFees/calendarSync';

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// One row of buttons that does the whole cancel: the provider's checked cancel page
// (never a guessed link; otherwise Cassy looks it up), the cancel email, "I cancelled it"
// (proof of cancellation, then it goes on your Ghost List and ticks the task), and a
// "check it stopped" reminder in your calendar a week later.
// item: { id, merchant, monthly }. goalId: the task-list id (leak.id, or `sub:${id}`).
export default function CancelActions({ item, goalId, onOpenEmail, onLookup, accent = '#f2a65a', compact = false }) {
  const { ticks, tick, setDue } = useGoalTasks();
  const [ghostList] = useGhostList();
  const id = goalId || item.id;
  const proof = useCancelProof({ onSaved: () => { tick(id, 0, true); tick(id, 1, true); trackEvent('cancel_proof'); } });
  const info = cancelInfo(item.merchant || item.title || '');
  const onList = ghostList.some((entry) => entry.id === item.id);
  const done = ticks[id] || {};
  const name = info.url ? info.name : (item.title || item.merchant);
  const check = { title: `👻 Check ${name} stopped charging`, details: `You cancelled ${name}. Look at your statement: if it charged again, use your proof in Ghost Fees.\n\nFrom Cassy, Ghost Fees.`, date: inDays(7) };
  const remind = () => addGhostReminder({ goalId: id, task: check, setDue });
  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground transition-colors hover:border-white/40';
  const leakLike = { id, merchant: item.merchant, title: item.title || item.merchant, monthly: item.monthly, amount: item.amount ?? item.monthly, action: 'cancel', badge: item.badge || 'Subscription' };
  return (
    <div className={cn('mt-2 w-full rounded-xl border border-border bg-background/50 p-2.5', compact && 'mt-1.5 p-2')}>
      <p className="text-[12px] text-muted-foreground">
        {[['Cancelled', onList || done[1]], ['Proof', onList && ghostList.find((e) => e.id === item.id)?.proof], ['Checked it stopped', done[2]]].map(([label, on], i) => (
          <span key={label} className={cn(on && 'font-bold', i && 'ml-2')} style={on ? { color: accent } : undefined}>{on ? '✓' : '○'} {label}</span>
        ))}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {info.url ? (
          <a className={cn(btn, 'border-transparent text-[#1b1233]')} style={{ background: accent }} href={info.url} target="_blank" rel="noreferrer" onClick={() => { tick(id, 0, true); trackEvent('cancel_link'); }}>
            Cancel on {info.name} <ExternalLink className="h-3 w-3" />
          </a>
        ) : onLookup && (
          <button type="button" className={btn} onClick={() => onLookup(item)}><Search className="h-3.5 w-3.5" /> Find the cancel page</button>
        )}
        {onOpenEmail && <button type="button" className={btn} onClick={() => { tick(id, 0, true); onOpenEmail(leakLike); }}><Mail className="h-3.5 w-3.5" /> Cancel email</button>}
        <button type="button" className={cn(btn, onList && 'opacity-70')} onClick={() => proof.ask({ id: item.id, merchant: item.merchant, monthly: item.monthly })}>
          <Check className="h-3.5 w-3.5" /> {onList ? 'On my Ghost List' : 'I cancelled it'}
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><CalendarPlus className="h-3.5 w-3.5" /> Check it stopped in 7 days:</span>
        <a className={btn} href={googleCalendarUrl(check)} target="_blank" rel="noreferrer" onClick={remind}>Google</a>
        <a className={btn} href={outlookCalendarUrl(check)} target="_blank" rel="noreferrer" onClick={remind}>Outlook</a>
        <button type="button" className={btn} onClick={() => { downloadTask(check); remind(); }}>Apple / .ics</button>
        <button type="button" className={cn(btn, done[2] && 'border-transparent text-[#1b1233]')} style={done[2] ? { background: accent } : undefined} onClick={() => tick(id, 2)} aria-pressed={Boolean(done[2])}>
          {done[2] ? '✓ It stopped' : 'It stopped'}
        </button>
      </div>
      {!info.url && !onLookup && <p className="mt-1 text-[12px] text-muted-foreground">No checked cancel link yet. Search their official site for &quot;cancel subscription&quot;.</p>}
      {proof.dialog}
    </div>
  );
}
