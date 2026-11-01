import { useEffect, useState } from 'react';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { CalendarPlus, ExternalLink } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { downloadReminder } from '@/lib/ghostFees/reminder';
import { APP_STORE_NOTE, cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { loadGhostList, saveGhostList } from '@/lib/ghostFees/ghostList';
import { cn } from '@/lib/utils';
import GhostList from './GhostList';

const GYM_RE = /\b(GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|SNAP|F45|CROSSFIT|PILATES|YOGA)\b/i;

// App store charges bundle many subscriptions into one statement line.
function bundleHint(merchant) {
  if (/\b(APPLE|ITUNES|ICLOUD)\b/i.test(merchant)) return 'Apple bundles subscriptions into one charge. See them all in Settings > your name > Subscriptions.';
  if (/\bGOOGLE\b/i.test(merchant)) return 'Google bundles subscriptions into one charge. See them all in Google Play > Payments & subscriptions.';
  return null;
}

const ANSWERS = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
];

// Answers live in the results page, so they survive switching tabs.
export default function SubscriptionsSection({ subscriptions, answers = {}, onAnswer, onDraftCancel, onOpenPath }) {
  const [ghosts, setGhosts] = useState(loadGhostList);
  useEffect(() => saveGhostList(ghosts), [ghosts]);

  if (!subscriptions.length) return null;

  const isGhosted = (id) => ghosts.some((item) => item.id === id);
  const ghostIt = (subscription) => setGhosts((current) => (
    current.some((item) => item.id === subscription.id)
      ? current
      : [...current, { id: subscription.id, merchant: subscription.merchant, monthly: subscription.monthly, status: 'requested', date: new Date().toISOString() }]
  ));
  const setStatus = (id, status) => setGhosts((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  const removeGhost = (id) => setGhosts((current) => current.filter((item) => item.id !== id));

  const answer = (id, key) => onAnswer?.((current) => ({ ...current, [id]: current[id] === key ? undefined : key }));
  const keeping = subscriptions.filter((item) => answers[item.id] === 'yes').length;
  const cancelling = subscriptions.filter((item) => answers[item.id] === 'no');

  const gym = subscriptions.find((item) => GYM_RE.test(item.merchant));

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Still using these?</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Your subscriptions and what each one costs a month. Not counted in the total above.
      </p>

      {gym && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.07] px-4 py-3">
          <span className="text-2xl" aria-hidden="true">🏋️</span>
          <p className="text-[13.5px] leading-relaxed text-foreground">
            <span className="font-bold">{gym.merchant}: {money(gym.monthly)} a month.</span>{' '}
            <span className="text-muted-foreground">Been this month?</span>
          </p>
        </div>
      )}

      <GhostList items={ghosts} onStatus={setStatus} onRemove={removeGhost} />

      <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">{APP_STORE_NOTE}</p>

      <CardList className="mt-2 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 sm:px-5">
        {subscriptions.map((subscription, index) => (
          <CardItem key={subscription.id} index={index} className={cn('py-3 transition-opacity', answers[subscription.id] === 'yes' && 'opacity-55')}>
            <div className="flex items-center justify-between gap-4">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[14px] text-white/90">{subscription.merchant}</span>
                {answers[subscription.id] === 'yes' && <span className="shrink-0 rounded-full bg-[#5ee6c8]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#5ee6c8]">Keeping it</span>}
                {answers[subscription.id] === 'no' && <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10.5px] font-bold text-primary">On your goal path</span>}
              </span>
              <span className="shrink-0 text-[14px] font-semibold tabular-nums text-white">
                {money(subscription.monthly)}
                <span className="text-[12px] font-normal text-muted-foreground">/mo</span>
              </span>
            </div>

            {bundleHint(subscription.merchant) && (
              <p className="mt-1 text-[11.5px] leading-relaxed text-[#ffc27a]">{bundleHint(subscription.merchant)}</p>
            )}

            <CancelHelp subscription={subscription} ghosted={isGhosted(subscription.id)} onGhost={() => ghostIt(subscription)} />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] text-muted-foreground">Would you sign up for it today?</span>
              {ANSWERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={answers[subscription.id] === option.key}
                  onClick={() => answer(subscription.id, option.key)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold transition-colors',
                    answers[subscription.id] === option.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
              {subscription.lastDate && (
                <button
                  type="button"
                  onClick={() => downloadReminder(subscription)}
                  className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-primary underline-offset-4 hover:underline"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Remind me
                </button>
              )}
            </div>

            {answers[subscription.id] === 'no' && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-primary/[0.08] px-3 py-2 text-[12px] text-foreground animate-rise">
                <span className="flex-1">Added &quot;Cancel {subscription.merchant}&quot; to your goal path.</span>
                {onDraftCancel && (
                  <button type="button" onClick={() => onDraftCancel(subscription)} className="rounded-full bg-primary px-2.5 py-1 font-bold text-primary-foreground">
                    Draft cancel email
                  </button>
                )}
                {onOpenPath && (
                  <button type="button" onClick={onOpenPath} className="font-bold text-primary underline underline-offset-4">See goal path</button>
                )}
              </div>
            )}
          </CardItem>
        ))}
      </CardList>

      {(keeping > 0 || cancelling.length > 0) && (
        <p className="mt-2.5 text-[12.5px] text-muted-foreground">
          Keeping {keeping}. Cancelling {cancelling.length}
          {cancelling.length > 0 && `, which frees up ${money(cancelling.reduce((sum, item) => sum + item.monthly, 0))} a month`}.
        </p>
      )}

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/90">
        <span className="font-bold text-foreground/90">Know your rights:</span> from 1 July 2027, cancelling a subscription
        must be as easy as signing up. You can report subscription traps to the{' '}
        <a href="https://www.accc.gov.au/" target="_blank" rel="noreferrer" className="font-bold text-primary underline underline-offset-4">ACCC</a>.
      </p>
    </section>
  );
}

// Official cancel link and steps, plus "I cancelled it", which adds it to the Ghost List.
function CancelHelp({ subscription, ghosted, onGhost }) {
  const info = cancelInfo(subscription.merchant);
  return (
    <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {info.url && (
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-primary underline-offset-4 hover:underline"
          >
            Cancel on {info.name}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={onGhost}
          disabled={ghosted}
          className={cn(
            'ml-auto rounded-full px-2.5 py-0.5 text-[11.5px] font-bold transition-colors',
            ghosted ? 'bg-[#5ee6c8]/15 text-[#5ee6c8]' : 'bg-primary text-primary-foreground',
          )}
        >
          {ghosted ? 'On your Ghost List' : '👻 I cancelled it'}
        </button>
      </div>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{info.steps}</p>
    </div>
  );
}
