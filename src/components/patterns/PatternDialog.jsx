import { BellRing, ExternalLink, Landmark, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PATTERN_BY_KEY, biasGroups } from '@/lib/ghostFees/leaks';
import { money, shortDate } from '@/lib/ghostFees/format';
import { googleCalendarUrl, nextReminderDate } from '@/lib/ghostFees/reminder';
import CancelSiteLink from '@/components/results/CancelSiteLink';
import { cn } from '@/lib/utils';

// One money pattern, explained (Pack 9 part 2): what it is, why it happens, one habit to
// beat it ("When X, I will Y") with a button that does it, the ghosts behind it and the
// paper. "Sound like you?" (part 3) is session only. Every number comes from biasGroups.
const ymd = (d) => d.toISOString().slice(0, 10);
const firstOfNextMonth = () => { const d = new Date(); return ymd(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))); };
const lastDate = (leak) => (leak.rows || []).map((r) => r.date).filter(Boolean).sort().at(-1);
const EVIDENCE = { strong: 'Strong evidence', medium: 'Medium evidence' };
const EVIDENCE_NOTE = {
  strong: 'The research tested this kind of choice directly.',
  medium: 'The idea fits, but the research did not test subscriptions directly.',
};
const ANSWERS = [
  { key: 'yes', label: 'Yes, that’s me' },
  { key: 'unsure', label: 'Not sure' },
  { key: 'no', label: 'No, something else' },
];

export function BeatButton({ pattern, leaks, onDraft, onTab }) {
  const first = leaks[0];
  const btn = 'inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[14px] font-semibold text-primary-foreground';
  if (!first) return null;
  if (pattern.beatAction === 'reminder') {
    const when = nextReminderDate(lastDate(first));
    if (!when) return null;
    const url = googleCalendarUrl({ title: `${first.merchant}: decide before the next charge`, details: `Ghost Fees reminder: keep or cancel ${first.merchant} before it charges again.`, date: ymd(when) });
    return <a href={url} target="_blank" rel="noopener noreferrer" className={btn}><BellRing className="h-4 w-4" aria-hidden="true" /> Set a reminder</a>;
  }
  if (pattern.beatAction === 'review') {
    const url = googleCalendarUrl({ title: 'Scan my statement for doubles', details: 'Monthly Ghost Fees check: look for double charges (repeat this event monthly).', date: firstOfNextMonth() });
    return <a href={url} target="_blank" rel="noopener noreferrer" className={btn}><BellRing className="h-4 w-4" aria-hidden="true" /> Set a monthly reminder</a>;
  }
  if (pattern.beatAction === 'waive') return <button type="button" onClick={() => onDraft(first)} className={btn}><Landmark className="h-4 w-4" aria-hidden="true" /> Ask bank to waive</button>;
  if (pattern.beatAction === 'cancel') return <CancelSiteLink leak={first} className={cn(btn, 'border-0')} />;
  if (pattern.beatAction === 'subscriptions') return <button type="button" onClick={() => onTab('subscriptions')} className={btn}><ListChecks className="h-4 w-4" aria-hidden="true" /> Open Subscriptions</button>;
  return null;
}

export default function PatternDialog({ patternKey, leaks, answers, onAnswer, onClose, onShowGhosts, onDraft, onTab }) {
  const pattern = patternKey ? PATTERN_BY_KEY[patternKey] : null;
  const group = pattern ? biasGroups(leaks).find((g) => g.key === patternKey) : null;
  const mine = group ? leaks.filter((leak) => group.leakIds.includes(leak.id)) : [];
  const answer = answers?.[patternKey];
  return (
    <Dialog open={Boolean(pattern && group)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto border-white/10 bg-card p-5 sm:p-6">
        {pattern && group && (
          <>
            <div className="pr-6">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary"><span aria-hidden="true">🧠 </span>A common money pattern</p>
              <DialogTitle className="mt-1 text-[21px] font-semibold text-foreground">{pattern.bias}</DialogTitle>
              <p className="mt-0.5 text-[14px] text-muted-foreground">Notice it. Adjust early. No shame.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-semibold text-foreground">{money(group.total)} on this statement</span>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-muted-foreground" title={EVIDENCE_NOTE[pattern.evidence]}>{EVIDENCE[pattern.evidence]}</span>
              </div>
            </div>
            <DialogDescription className="sr-only">{pattern.what} {pattern.why}</DialogDescription>
            <dl className="mt-4 space-y-3 text-[14.5px] leading-snug">
              <div><dt className="font-semibold text-foreground">What it is</dt><dd className="text-foreground/85">{pattern.what}</dd></div>
              <div><dt className="font-semibold text-foreground">Why it happens</dt><dd className="text-foreground/85">{pattern.why}</dd></div>
              <div className={cn('rounded-2xl p-3', answer === 'yes' ? 'bg-primary/15 ring-2 ring-primary' : 'bg-white/[0.04]')}>
                <dt className="font-semibold text-foreground">How to beat it</dt>
                <dd className="mt-0.5 text-foreground/90">{pattern.beat}</dd>
                <dd className="mt-2.5"><BeatButton pattern={pattern} leaks={mine} onDraft={(leak) => { onClose(); onDraft(leak); }} onTab={(key) => { onClose(); onTab(key); }} /></dd>
              </div>
            </dl>

            <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">The ghosts behind it</p>
            <ul className="mt-1.5 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08]">
              {mine.map((leak) => {
                const dates = (leak.rows || []).filter((r) => Math.abs(Number(r.amount) || 0) > 0).map((r) => r.date).sort();
                return (
                  <li key={leak.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[14px]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{leak.title || leak.merchant}</span>
                      {dates.length > 0 && <span className="block text-[12.5px] text-muted-foreground">{dates[0] === dates.at(-1) ? shortDate(dates[0]) : `${shortDate(dates[0])} to ${shortDate(dates.at(-1))}`}</span>}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">{money(leak.amount)}</span>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => { onClose(); onShowGhosts(group.badge); }} className="mt-2 text-[14px] font-semibold text-primary underline-offset-4 hover:underline">
              Show on Ghosts tab →
            </button>

            <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">The research</p>
            <a href={pattern.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-start gap-1.5 text-[13.5px] leading-snug text-foreground/85 underline-offset-4 hover:underline">
              <span>{pattern.paper}</span><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
            <p className="mt-1 text-[12.5px] text-muted-foreground">{EVIDENCE_NOTE[pattern.evidence]}</p>

            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <p className="text-[14.5px] font-semibold text-foreground">Sound like you?</p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Sound like you?">
                {ANSWERS.map((a) => (
                  <button key={a.key} type="button" role="radio" aria-checked={answer === a.key} onClick={() => onAnswer(patternKey, a.key)}
                    className={cn('rounded-full border px-3 py-1.5 text-[13.5px] font-semibold', answer === a.key ? 'border-primary bg-primary text-primary-foreground' : 'border-white/15 text-foreground hover:border-primary/60')}>
                    {a.label}
                  </button>
                ))}
              </div>
              {answer === 'yes' && <p className="mt-2 text-[14px] text-foreground">Nice spot. Noticing it is the first step.</p>}
              {answer === 'no' && <p className="mt-2 text-[14px] text-foreground">Fair. Patterns are common, not universal.</p>}
              <p className="mt-2 text-[12px] text-muted-foreground">Your answer stays in this tab and is never saved.</p>
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">Not a judgement, and not financial advice.</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
