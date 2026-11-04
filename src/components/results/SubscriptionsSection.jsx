import { useState } from 'react';
import { CalendarPlus, ChevronDown, ExternalLink } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { downloadReminder } from '@/lib/ghostFees/reminder';
import { APP_STORE_NOTE, cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { useGhostList } from '@/hooks/use-ghost-list';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import GhostList from './GhostList';
import BadgesExplainer from './BadgesExplainer';
import { useCancelProof } from './ProofDialog';
import PickTimeDialog from './PickTimeDialog';
import { LIFE_STAGES, TYPE_ICONS, TYPE_LABELS, findOverlaps, tipFor } from '@/lib/ghostFees/overlaps';
import { useCategories } from '@/hooks/use-categories';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import StatNote from '@/components/stats/StatNote';

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

// Answers live in the results page and this browser tab, so they survive switching tabs
// and visiting other pages. Answered subscriptions move to Decided, with Undo.
export default function SubscriptionsSection({ subscriptions, leaks = [], answers = {}, onAnswer, onDraftCancel, onOpenPath }) {
  const [ghosts, setGhosts] = useGhostList();
  // "I cancelled it" asks for proof first (how, when, a reference or a screenshot).
  const proof = useCancelProof();
  // "When will you do it?" (pick a time to cancel, B3).
  const [planFor, setPlanFor] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('group');
  const { categoryOf, setCategory } = useCategories();
  const typeOf = categoryOf;
  const [view, setView] = useState('open');
  const [stage, setStage] = useSavedChoice('ghostFees.lifeStage', LIFE_STAGES.map((item) => item.key), 'solo');

  if (!subscriptions.length) return null;

  const isGhosted = (id) => ghosts.some((item) => item.id === id);
  const ghostIt = (subscription) => proof.ask(subscription);
  const setStatus = (id, status) => setGhosts((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  const removeGhost = (id) => setGhosts((current) => current.filter((item) => item.id !== id));

  const answer = (subscription, key) => {
    onAnswer?.((current) => ({ ...current, [subscription.id]: key }));
    toast(key === 'yes'
      ? { title: `Keeping ${subscription.merchant}`, description: 'Moved to the Keeping tab. Undo is there.' }
      : { title: `${subscription.merchant} is on your goal path`, description: 'Its cancel link and email are in the Cancelling tab.' });
  };
  const undo = (id) => onAnswer?.((current) => ({ ...current, [id]: undefined }));
  const undecided = subscriptions.filter((item) => !answers[item.id]);
  // Categories biggest spend first, so the chips and groups lead with where the money goes.
  const spend = (key) => subscriptions.filter((item) => typeOf(item.merchant) === key).reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const types = [...new Set(subscriptions.map((item) => typeOf(item.merchant)))].sort((a, b) => (a === 'other') - (b === 'other') || spend(b) - spend(a));
  const sorters = {
    cost: (a, b) => b.monthly - a.monthly,
    name: (a, b) => a.merchant.localeCompare(b.merchant),
    group: (a, b) => b.monthly - a.monthly,
  };
  const open = subscriptions
    .filter((item) => !answers[item.id])
    .filter((item) => typeFilter === 'all' || typeOf(item.merchant) === typeFilter)
    .sort(sorters[sortBy]);
  const keeping = subscriptions.filter((item) => answers[item.id] === 'yes').length;
  const cancelling = subscriptions.filter((item) => answers[item.id] === 'no');

  const gym = subscriptions.find((item) => GYM_RE.test(item.merchant));
  const overlaps = findOverlaps(subscriptions);
  const overlapIds = new Set(overlaps.flatMap((group) => group.items.map((item) => item.id)));
  const priceRiseIds = new Set(leaks.filter((leak) => leak.priceRise).map((leak) => leak.id));

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Still using these?</h2>
      <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
        Your subscriptions and what each one costs a month. Not counted in the total above.
      </p>

      {gym && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.07] px-4 py-3">
          <span className="text-2xl" aria-hidden="true">🏋️</span>
          <p className="text-[14.5px] leading-relaxed text-foreground">
            <span className="font-bold">{gym.merchant}: {money(gym.monthly)} a month.</span>{' '}
            <span className="text-muted-foreground">Been this month?</span>
          </p>
          <StatNote statKey="gym" className="mt-0.5" />
        </div>
      )}

      {overlaps.length > 0 && (
        <div className="mt-3 rounded-2xl border border-[#ffc27a]/40 bg-[#ffc27a]/[0.06] px-4 py-3">
          <p className="text-[14px] font-bold text-foreground">Double-ups spotted</p>
          <ul className="mt-1 space-y-0.5 text-[13.5px] text-muted-foreground">
            {overlaps.map((group) => (
              <li key={group.key}>
                <span className="font-bold text-foreground">{group.items.length} {group.label}</span>: {group.items.map((item) => item.merchant).join(', ')} = {money(group.yearly)}/yr together.
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Who are these for?">
            <span className="mr-1 text-[12.5px] text-muted-foreground">Who uses these? Pick one for the best fix:</span>
            {LIFE_STAGES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={stage === item.key}
                onClick={() => setStage(item.key)}
                className={cn('rounded-full border px-2 py-0.5 text-[12.5px] font-semibold', stage === item.key ? 'border-[#ffc27a] bg-[#ffc27a] text-[#2a1a08]' : 'border-[#ffc27a]/40 text-muted-foreground')}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{tipFor(stage, overlaps)}</p>
        </div>
      )}

      {ghosts.length === 0 && <BadgesExplainer compact className="mt-3" />}
      <GhostList items={ghosts} onStatus={setStatus} onRemove={removeGhost} onAddProof={proof.addProof} overlapIds={overlapIds} priceRiseIds={priceRiseIds} />
      {proof.dialog}
      <PickTimeDialog target={planFor} onClose={() => setPlanFor(null)} />

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{APP_STORE_NOTE}</p>

      {/* Tabs (To decide / Cancelling / Keeping), then one drop-down row per subscription,
          so the list stays short and every row looks the same (3 Nov). */}
      <div className="mt-4 flex gap-1 rounded-full border border-border bg-card/60 p-1" role="tablist" aria-label="Your subscriptions">
        {[['open', 'To decide', 0], ['cancel', 'Cancelling', cancelling.length], ['keep', 'Keeping', keeping]].map(([key, label, count]) => (
          <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)}
            className={cn('flex-1 rounded-full px-3 py-2 text-[14px] font-bold transition-colors', view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {label} <span className="opacity-70">{key === 'open' ? subscriptions.filter((item) => !answers[item.id]).length : count}</span>
          </button>
        ))}
      </div>

      {view === 'open' && (types.length > 1 || subscriptions.length > 3) && (
        <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Filter and sort subscriptions">
          {/* Category chips with counts: one tap filters (4 Nov, replaces the drop-down). */}
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Show one category">
            {['all', ...types].map((key) => {
              const count = undecided.filter((item) => key === 'all' || typeOf(item.merchant) === key).length;
              if (key !== 'all' && !count) return null;
              const on = typeFilter === key;
              return (
                <button key={key} type="button" role="radio" aria-checked={on} onClick={() => setTypeFilter(key)}
                  className={cn('rounded-full border px-2.5 py-1 text-[13px] font-semibold', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
                  {key === 'all' ? 'All' : `${TYPE_ICONS[key]} ${TYPE_LABELS[key]}`} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          <label className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground">
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-full border border-border bg-card px-2.5 py-1 text-[13px] text-foreground">
              <option value="group">Grouped by type</option>
              <option value="cost">Highest cost</option>
              <option value="name">A to Z</option>
            </select>
          </label>
        </div>
      )}

      {(() => {
        const list = view === 'open' ? open : view === 'cancel' ? cancelling : subscriptions.filter((item) => answers[item.id] === 'yes');
        if (!list.length) {
          return (
            <p className="mt-2 rounded-2xl border border-[#5ee6c8]/30 bg-[#5ee6c8]/[0.06] px-4 py-3 text-[14px] font-semibold text-foreground">
              {view === 'open' ? (typeFilter === 'all' ? 'All decided. See Cancelling and Keeping.' : 'Nothing of this type left to decide.') : view === 'cancel' ? 'Nothing to cancel yet. Answer No on one to add it here.' : 'Nothing kept yet. Answer Yes on one to keep it.'}
            </p>
          );
        }
        const row = (subscription) => (
              <SubRow
                key={subscription.id}
                category={typeOf(subscription.merchant)}
                onCategory={(key) => setCategory(subscription.merchant, key)}
                subscription={subscription}
                view={view}
                ghosted={isGhosted(subscription.id)}
                answer={answers[subscription.id]}
                onAnswer={(key) => answer(subscription, key)}
                onUndo={() => undo(subscription.id)}
                onGhost={() => ghostIt(subscription)}
                onPlan={() => setPlanFor(subscription)}
                onDraftCancel={onDraftCancel}
                onOpenPath={onOpenPath}
              />
        );
        const box = 'divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]';
        if (view !== 'open' || sortBy !== 'group' || typeFilter !== 'all') return <ul className={`mt-2 ${box}`}>{list.map(row)}</ul>;
        // Grouped: one collapsible block per category with its count and yearly cost.
        return (
          <div className="mt-2 space-y-2">
            {types.map((key) => {
              const items = list.filter((item) => typeOf(item.merchant) === key);
              if (!items.length) return null;
              const yearly = items.reduce((sum, item) => sum + (Number(item.monthly) || 0) * 12, 0);
              return (
                <details key={key} open className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/[0.03]">
                    <span aria-hidden="true">{TYPE_ICONS[key]}</span>
                    <span className="text-[14.5px] font-semibold text-foreground">{TYPE_LABELS[key]}</span>
                    <span className="text-[13px] text-muted-foreground">{items.length}</span>
                    <span className="ml-auto text-[13.5px] font-semibold tabular-nums text-foreground">{money(yearly)}<span className="font-normal text-muted-foreground">/yr</span></span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <ul className={`mt-1 ${box}`}>{items.map(row)}</ul>
                </details>
              );
            })}
          </div>
        );
      })()}

      {(keeping > 0 || cancelling.length > 0) && (
        <p className="mt-2.5 text-[13.5px] text-muted-foreground">
          Keeping {keeping}. Cancelling {cancelling.length}
          {cancelling.length > 0 && `, which frees up ${money(cancelling.reduce((sum, item) => sum + item.monthly, 0))} a month`}.
        </p>
      )}

      {/* Life goals live in the Goal path tab; here just one line that points there. */}
      {onOpenPath && (
        <button type="button" onClick={onOpenPath} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#5ee6c8] underline-offset-4 hover:underline">
          {cancelling.length > 0 ? `Put the ${money(cancelling.reduce((sum, item) => sum + item.monthly, 0))} a month towards a goal` : 'Put what you save towards a goal'} in Goal path →
        </button>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/90">
        <span className="font-bold text-foreground/90">Know your rights:</span> from 1 July 2027, cancelling a subscription
        must be as easy as signing up. You can report subscription traps to the{' '}
        <a href="https://www.accc.gov.au/" target="_blank" rel="noreferrer" className="font-bold text-primary underline underline-offset-4">ACCC</a>.
      </p>
    </section>
  );
}

// One subscription as a drop-down row: closed shows name, price and status; open shows
// the cancel help, the actions and the "would you sign up today?" question.
function SubRow({ subscription, category, onCategory, view, ghosted, answer, onAnswer, onUndo, onGhost, onPlan, onDraftCancel, onOpenPath }) {
  const [open, setOpen] = useState(false);
  const status = ghosted ? { text: 'On your Ghost List', cls: 'bg-[#5ee6c8]/15 text-[#5ee6c8]' }
    : view === 'cancel' ? { text: 'To cancel', cls: 'bg-primary/15 text-primary' }
      : view === 'keep' ? { text: 'Keeping', cls: 'bg-[#5ee6c8]/15 text-[#5ee6c8]' }
        : { text: 'To decide', cls: 'bg-white/[0.06] text-muted-foreground' };
  return (
    <li>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-foreground">{subscription.merchant}</span>
          <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold', status.cls)}>{status.text}</span>
        </span>
        <span className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground">{money(subscription.monthly)}<span className="text-[13px] font-normal text-muted-foreground">/mo</span></span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5">
          {bundleHint(subscription.merchant) && <p className="mb-2 text-[13px] leading-snug text-[#ffc27a]">{bundleHint(subscription.merchant)}</p>}
          <CancelHelp subscription={subscription} ghosted={ghosted} onGhost={onGhost} onPlan={onPlan} />
          {onCategory && (
            <label className="mt-2.5 flex items-center gap-2 text-[13px] text-muted-foreground">
              Category
              <select value={category} onChange={(event) => onCategory(event.target.value)} className="rounded-full border border-border bg-card px-2.5 py-1 text-[13px] text-foreground">
                {Object.keys(TYPE_LABELS).map((key) => <option key={key} value={key}>{TYPE_ICONS[key]} {TYPE_LABELS[key]}</option>)}
              </select>
            </label>
          )}
          {view === 'open' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[13.5px] text-muted-foreground">Would you sign up for it today?</span>
              {ANSWERS.map((option) => (
                <button key={option.key} type="button" aria-pressed={answer === option.key} onClick={() => onAnswer(option.key)}
                  className={cn('min-w-[64px] rounded-full border px-3 py-1.5 text-[13.5px] font-bold', answer === option.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/60')}>
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {view === 'cancel' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onDraftCancel && <button type="button" onClick={() => onDraftCancel(subscription)} className="rounded-full bg-primary px-3.5 py-1.5 text-[13.5px] font-bold text-primary-foreground">Draft cancel email</button>}
              {onOpenPath && <button type="button" onClick={onOpenPath} className="text-[13.5px] font-bold text-primary underline underline-offset-4">See goal path</button>}
              <button type="button" onClick={onUndo} className="ml-auto text-[13.5px] font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">Undo</button>
            </div>
          )}
          {view === 'keep' && (
            <div className="mt-3 flex justify-end">
              <button type="button" onClick={onUndo} className="text-[13.5px] font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">Undo</button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// Official cancel link (or a search for it) and steps, then the actions in one row.
function CancelHelp({ subscription, ghosted, onGhost, onPlan }) {
  const info = cancelInfo(subscription.merchant);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <a
        href={info.url || `https://www.google.com/search?q=${encodeURIComponent(`cancel ${subscription.merchant} subscription`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[14px] font-bold text-primary underline-offset-4 hover:underline"
      >
        {info.url ? `Cancel on ${info.name}` : `Find ${subscription.merchant}'s cancel page`}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">{info.url ? info.steps : 'No checked cancel link yet. Search their site or check your sign-up email.'}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button type="button" onClick={onGhost} disabled={ghosted}
          className={cn('rounded-full px-3.5 py-1.5 text-[13.5px] font-bold', ghosted ? 'bg-[#5ee6c8]/15 text-[#5ee6c8]' : 'bg-primary text-primary-foreground')}>
          {ghosted ? '✓ On your Ghost List' : '👻 I cancelled it'}
        </button>
        {!ghosted && onPlan && (
          <button type="button" onClick={onPlan} className="rounded-full border border-primary/60 px-3.5 py-1.5 text-[13.5px] font-bold text-foreground hover:bg-primary/10">⏰ Pick a day to cancel</button>
        )}
        {subscription.lastDate && (
          <button type="button" onClick={() => downloadReminder(subscription)} className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-[13.5px] font-bold text-foreground hover:border-primary/60">
            <CalendarPlus className="h-3.5 w-3.5" /> Remind me
          </button>
        )}
      </div>
    </div>
  );
}
