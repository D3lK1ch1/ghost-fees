import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Mail } from 'lucide-react';
import { useGhostList } from '@/hooks/use-ghost-list';
import { money } from '@/lib/ghostFees/format';
import { APP_STORE_NOTE, cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { nextChargeDate } from '@/lib/ghostFees/reminder';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import TaskDialog from './TaskDialog';
import CassLookup from './CassLookup';
import { useCancelProof } from './ProofDialog';
import StatNote from '@/components/stats/StatNote';
import GhostMark from '@/components/site/GhostMark';

const STEPS = ['Open the cancel page', 'Follow their steps', 'No luck? Email them', 'Mark it cancelled'];

// What Cassy says at each step, so it feels like she's walking you through it.
// She helps; you do the cancelling (we never sign in for you).
function cassySays(step, sub, info, done) {
  const name = sub.merchant;
  if (step === 0) return info.url
    ? `Let's ghost ${name}. Their official cancel page is below. You sign in there, I never see your login.`
    : `${name} doesn't have a checked cancel page yet, so let me look it up for you.`;
  if (step === 1) return `Tick each step as you go. If they offer a discount to stay, you can say no thanks.`;
  if (step === 2) return `Stuck? Some companies make it hard. Send this email and ask them to confirm in writing.`;
  return done
    ? `${name} is on your Ghost List. I'll check your next statement to be sure it really stopped.`
    : `Did it work? That's ${money(sub.monthly * 12)} a year back. Save your proof and I'll check it stopped.`;
}

// Cancellation assistant, in every theme: pick a subscription and it walks you
// through cancelling it, one step at a time. Direct link to the official cancel
// page when we have a checked one, their exact steps as a checklist, the cancel
// email as a fallback, then mark it cancelled (Ghost List) and schedule a check.
export default function CancelAssistant({ subscriptions = [], onDraft }) {
  const subs = [...subscriptions].sort((a, b) => b.monthly - a.monthly);
  const [ghostList] = useGhostList();
  const [id, setId] = useState(subs[0]?.id);
  const [step, setStep] = useState(0);
  const isGone = (itemId) => ['requested', 'confirmed'].includes(ghostList.find((entry) => entry.id === itemId)?.status);
  // Once one is cancelled (proof saved or added later), go straight to the next
  // biggest one still charging, back at step 1, so Cassy picks it up right away.
  const proof = useCancelProof({
    onSaved: (done) => {
      const next = subs.find((item) => item.id !== done.id && !isGone(item.id));
      if (!next) return;
      setId(next.id);
      setStep(0);
      toast({ title: `Next up: ${next.merchant}`, description: 'Cassy has the cancel page and steps ready.' });
    },
  });
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
  // Asks for proof (how, when, a reference or a screenshot), then adds it to the Ghost List.
  const markCancelled = () => proof.ask(sub);
  const nextSub = subs.find((item) => item.id !== sub.id && !isGone(item.id));
  const scheduleCheck = () => {
    const next = sub.lastDate ? nextChargeDate(sub.lastDate) : null;
    const date = (next || new Date(Date.now() + 30 * 864e5)).toISOString().slice(0, 10);
    setTask({ kind: 'sub', name: sub.merchant, amount: sub.monthly, date });
  };

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5" aria-label="Cancellation assistant">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary">Cancellation assistant</p>
      <h3 className="mt-1 font-heading text-[20px] font-bold text-foreground">Meet Cassy, your cancellation assistant</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">Pick a subscription. Cassy finds the official cancel page, the steps and the phone number, and walks you through it.</p>
      <StatNote statKey={/GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45/i.test(sub.merchant) ? 'gym' : 'cancel'} className="mt-1.5" />

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
                'rounded-full border px-3 py-1.5 text-[13.5px] font-bold transition-colors',
                item.id === sub.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/60',
                index === 0 && item.id !== sub.id && 'border-[hsl(30_100%_62%)] text-[hsl(30_100%_62%)]',
                gone && item.id !== sub.id && 'opacity-60',
              )}
            >
              {gone && <Check className="mr-1 inline h-3.5 w-3.5" strokeWidth={3} aria-label="Cancelled" />}
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
              <span className={cn('text-[12.5px] font-bold leading-tight', index === step ? 'text-foreground' : 'text-muted-foreground')}>{index + 1}. {label}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* Cassy talks you through each step. */}
      <div key={`say-${sub.id}-${step}`} className="mt-4 flex animate-rise items-end gap-2.5">
        <GhostMark className="h-10 w-10 shrink-0 motion-safe:animate-float" style={{ color: '#f2a65a' }} eyeColor="#1a1230" />
        <p className="relative rounded-2xl rounded-bl-md bg-[#f2a65a] px-4 py-2.5 text-[14.5px] font-semibold leading-snug text-[#1a1230]">
          <span className="block text-[12px] font-bold uppercase tracking-wide opacity-70">Cassy</span>
          {cassySays(step, sub, info, done)}
        </p>
      </div>
      <div key={`${sub.id}-${step}`} className="mt-3 animate-rise rounded-2xl border border-border bg-background/50 p-4">
        {step === 0 && (
          <>
            {info.url && <p className="font-heading text-[16px] font-bold text-foreground">Go to {info.name}&apos;s cancel page</p>}
            {info.url ? (
              <>
                <a href={info.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground">
                  Open the {info.name} cancel page <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-2 text-[13px] text-muted-foreground">Official page, opens in a new tab. Sign in there. We never see your login.</p>
              </>
            ) : (
              <CassLookup key={sub.id} merchant={sub.merchant} monthly={sub.monthly} auto plain />
            )}
            <p className="mt-3 border-t border-white/[0.06] pt-2 text-[13px] text-muted-foreground">{APP_STORE_NOTE}</p>
            {info.url && <CassLookup key={`c-${sub.id}`} merchant={sub.merchant} monthly={sub.monthly} className="mt-3" />}
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
            <p className="mt-3 text-[13px] text-muted-foreground">Screenshot the confirmation or end date. It helps if they charge you again.</p>
          </>
        )}
        {step === 2 && (
          <>
            <p className="font-heading text-[16px] font-bold text-foreground">Stuck? Send the cancel email</p>
            <p className="mt-1 text-[14px] text-muted-foreground">Some companies make it hard. The email asks them to cancel and confirm in writing.</p>
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
            <p className="mt-1 text-[14px] text-muted-foreground">That&apos;s {money(sub.monthly * 12)} a year back. Keep proof (a screenshot of the cancelled screen, their email or a reference number), then check your next statement to be sure it stopped.</p>
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
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((value) => value + 1)} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-4 py-2 text-[14.5px] font-bold text-foreground hover:bg-primary/25">
              Next: {STEPS[step + 1]} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            nextSub && (
              <button type="button" onClick={() => pick(nextSub.id)} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-4 py-2 text-[14.5px] font-bold text-foreground hover:bg-primary/25">
                Next subscription: {nextSub.merchant} <ChevronRight className="h-4 w-4" />
              </button>
            )
          )}
          {step > 0 && (
            <button type="button" onClick={() => setStep((value) => value - 1)} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[14px] font-bold text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
      </div>

      <TaskDialog target={task} onClose={() => setTask(null)} />
      {proof.dialog}
    </section>
  );
}
