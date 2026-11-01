import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Mail } from 'lucide-react';
import { useGhostList } from '@/hooks/use-ghost-list';
import { money } from '@/lib/ghostFees/format';
import { APP_STORE_NOTE, cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { nextChargeDate } from '@/lib/ghostFees/reminder';
import { cn } from '@/lib/utils';
import TaskDialog from './TaskDialog';

const STEPS = ['Open the cancel page', 'Follow their steps', 'No luck? Email them', 'Mark it cancelled'];

// Cancellation assistant, in every theme: pick a subscription and it walks you
// through cancelling it, one step at a time. Direct link to the official cancel
// page when we have a checked one, their exact steps as a checklist, the cancel
// email as a fallback, then mark it cancelled (Ghost List) and schedule a check.
export default function CancelAssistant({ subscriptions = [], onDraft }) {
  const subs = [...subscriptions].sort((a, b) => b.monthly - a.monthly);
  const [ghostList, setGhostList] = useGhostList();
  const [id, setId] = useState(subs[0]?.id);
  const [step, setStep] = useState(0);
  const [ticks, setTicks] = useState({});
  const [task, setTask] = useState(null);
  const sub = subs.find((item) => item.id === id) || subs[0];
  if (!sub) return null;

  const info = cancelInfo(sub.merchant);
  const steps = info.url ? info.steps.split(/\s*>\s*|\.\s+/).map((part) => part.replace(/\.$/, '')).filter(Boolean) : [info.steps];
  const status = ghostList.find((item) => item.id === sub.id)?.status;
  const done = status === 'requested' || status === 'confirmed';
  const key = (index) => `${sub.id}:${index}`;
  const pick = (next) => {
    setId(next);
    setStep(0);
  };
  const markCancelled = () => setGhostList((current) => (current.some((entry) => entry.id === sub.id)
    ? current.map((entry) => (entry.id === sub.id ? { ...entry, status: 'requested' } : entry))
    : [...current, { id: sub.id, merchant: sub.merchant, monthly: sub.monthly, status: 'requested', date: new Date().toISOString() }]));
  const scheduleCheck = () => {
    const next = sub.lastDate ? nextChargeDate(sub.lastDate) : null;
    const date = (next || new Date(Date.now() + 30 * 864e5)).toISOString().slice(0, 10);
    setTask({ kind: 'sub', name: sub.merchant, amount: sub.monthly, date });
  };

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5" aria-label="Cancellation assistant">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">Cancellation assistant</p>
      <h3 className="mt-1 font-heading text-[20px] font-bold text-foreground">Cancel it, step by step</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">Pick a subscription. We&apos;ll take you to the official cancel page and walk you through it.</p>

      <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Subscription to cancel">
        {subs.map((item, index) => {
          const gone = ['requested', 'confirmed'].includes(ghostList.find((entry) => entry.id === item.id)?.status);
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === sub.id}
              onClick={() => pick(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors',
                item.id === sub.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/60',
                index === 0 && item.id !== sub.id && 'border-[hsl(30_100%_62%)] text-[hsl(30_100%_62%)]',
                gone && 'line-through opacity-60',
              )}
            >
              {item.merchant} · {money(item.monthly)}
            </button>
          );
        })}
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button type="button" onClick={() => setStep(index)} className="flex w-full flex-col items-start gap-1 text-left">
              <span className={cn('h-1.5 w-full rounded-full', index <= step ? 'bg-primary' : 'bg-white/10')} />
              <span className={cn('text-[11px] font-bold leading-tight', index === step ? 'text-foreground' : 'text-muted-foreground')}>{index + 1}. {label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div key={`${sub.id}-${step}`} className="mt-4 animate-rise rounded-2xl border border-border bg-background/50 p-4">
        {step === 0 && (
          <>
            <p className="font-heading text-[16px] font-bold text-foreground">Go to {info.name}&apos;s cancel page</p>
            {info.url ? (
              <>
                <a href={info.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground">
                  Open the {info.name} cancel page <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-2 text-[12px] text-muted-foreground">Official page, opens in a new tab. Sign in there. We never see your login.</p>
              </>
            ) : (
              <p className="mt-2 text-[13.5px] text-foreground">{info.steps}</p>
            )}
            <p className="mt-2 text-[12px] text-muted-foreground">{APP_STORE_NOTE}</p>
          </>
        )}
        {step === 1 && (
          <>
            <p className="font-heading text-[16px] font-bold text-foreground">Follow their steps</p>
            <ul className="mt-2 space-y-2">
              {steps.map((text, index) => (
                <li key={text}>
                  <button type="button" onClick={() => setTicks((current) => ({ ...current, [key(index)]: !current[key(index)] }))} className="flex items-start gap-3 text-left text-[14px] text-foreground">
                    <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', ticks[key(index)] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50')}>
                      {ticks[key(index)] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className={cn(ticks[key(index)] && 'text-muted-foreground line-through')}>{text}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted-foreground">Screenshot the confirmation or end date. It helps if they charge you again.</p>
          </>
        )}
        {step === 2 && (
          <>
            <p className="font-heading text-[16px] font-bold text-foreground">Stuck? Send the cancel email</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Some companies make it hard. The email asks them to cancel and confirm in writing.</p>
            <button
              type="button"
              onClick={() => onDraft?.({ id: `sub:${sub.id}`, merchant: sub.merchant, title: sub.merchant, monthly: sub.monthly, amount: sub.monthly, action: 'cancel', badge: 'Subscription' })}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-primary/70 px-4 py-3 text-[14px] font-bold text-foreground"
            >
              <Mail className="h-4 w-4" /> Draft the cancel email
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <p className="font-heading text-[16px] font-bold text-foreground">{done ? `${sub.merchant} is on your Ghost List` : `Did you cancel ${sub.merchant}?`}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">That&apos;s {money(sub.monthly * 12)} a year back. Check your next statement to be sure it stopped.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!done && (
                <button type="button" onClick={markCancelled} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground">
                  <Check className="h-4 w-4" /> I cancelled it
                </button>
              )}
              <button type="button" onClick={scheduleCheck} className="rounded-2xl border-2 border-primary/70 px-4 py-3 text-[14px] font-bold text-foreground">
                Schedule a check
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-between">
        <button type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="inline-flex items-center gap-1 text-[13px] font-bold text-muted-foreground disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep((value) => value + 1)} className="inline-flex items-center gap-1 text-[13px] font-bold text-primary">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          subs.find((item) => item.id !== sub.id && !['requested', 'confirmed'].includes(ghostList.find((entry) => entry.id === item.id)?.status)) && (
            <button type="button" onClick={() => pick(subs.find((item) => item.id !== sub.id && !['requested', 'confirmed'].includes(ghostList.find((entry) => entry.id === item.id)?.status)).id)} className="inline-flex items-center gap-1 text-[13px] font-bold text-primary">
              Next subscription <ChevronRight className="h-4 w-4" />
            </button>
          )
        )}
      </div>
      <TaskDialog target={task} onClose={() => setTask(null)} />
    </section>
  );
}
