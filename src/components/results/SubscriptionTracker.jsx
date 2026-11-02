import { useState } from 'react';
import { Check, ListChecks } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { nextChargeDate } from '@/lib/ghostFees/reminder';
import { TYPE_LABELS, findOverlaps, typeOf } from '@/lib/ghostFees/overlaps';
import { useGhostList } from '@/hooks/use-ghost-list';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { cn } from '@/lib/utils';
import { useCancelProof } from './ProofDialog';

// Subscription tracker (Calendar tab): one checklist of every subscription, so you
// can see what's sorted and what's left. Group by double-ups, type, status or the
// next charge. Keep / Cancel here is the same answer as on the Subscriptions tab,
// and Cancel adds it to the Ghost List (with proof), like everywhere else.
const GROUPINGS = [
  { key: 'double', label: 'Double-ups' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'next', label: 'Next charge' },
];

const STATUS_ORDER = ['charging', 'todo', 'keeping', 'requested', 'confirmed'];
const STATUS_LABEL = {
  charging: 'Still charging after you cancelled',
  todo: 'To decide',
  keeping: 'Keeping',
  requested: 'Cancelled, check your next statement',
  confirmed: 'Stopped for good',
};

const shortDate = (date) => date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

export default function SubscriptionTracker({ subscriptions = [], answers = {}, onAnswer }) {
  const [ghosts] = useGhostList();
  const proof = useCancelProof();
  const [groupBy, setGroupBy] = useSavedChoice('ghostFees.trackerGroup', GROUPINGS.map((item) => item.key), 'double');
  const [hideDone, setHideDone] = useState(false);
  if (!subscriptions.length) return null;

  const overlaps = findOverlaps(subscriptions);
  const overlapOf = (id) => overlaps.find((group) => group.items.some((item) => item.id === id));
  const statusOf = (item) => {
    const ghost = ghosts.find((entry) => entry.id === item.id);
    if (ghost) return ghost.status;
    return answers[item.id] === 'yes' ? 'keeping' : 'todo';
  };
  const rows = subscriptions.map((item) => {
    const next = item.lastDate ? nextChargeDate(item.lastDate) : null;
    return { ...item, status: statusOf(item), next, overlap: overlapOf(item.id) };
  });
  const sorted = rows.filter((row) => row.status !== 'todo' && row.status !== 'charging');
  const ghostedYearly = rows.filter((row) => row.status === 'requested' || row.status === 'confirmed').reduce((sum, row) => sum + row.monthly * 12, 0);
  const shown = hideDone ? rows.filter((row) => !sorted.includes(row)) : rows;

  // Each grouping returns [{ key, title, note?, rows }].
  const groups = (() => {
    if (groupBy === 'double') {
      const inGroups = overlaps.map((group) => ({
        key: group.key,
        title: `${group.items.length} ${group.label}`,
        note: `${money(group.yearly)}/yr together. Keep one, rotate, or share a plan.`,
        rows: shown.filter((row) => row.overlap?.key === group.key),
      }));
      return [...inGroups, { key: 'single', title: 'No double-up', rows: shown.filter((row) => !row.overlap) }];
    }
    if (groupBy === 'type') {
      return Object.entries(TYPE_LABELS).map(([key, title]) => ({ key, title, rows: shown.filter((row) => typeOf(row.merchant) === key) }));
    }
    if (groupBy === 'status') {
      return STATUS_ORDER.map((key) => ({ key, title: STATUS_LABEL[key], rows: shown.filter((row) => row.status === key) }));
    }
    const soon = (row, from, to) => row.next && (row.next - Date.now()) / 864e5 >= from && (row.next - Date.now()) / 864e5 < to;
    return [
      { key: 'week', title: 'Charges in the next 7 days', rows: shown.filter((row) => soon(row, -1, 7)) },
      { key: 'month', title: 'Later this month', rows: shown.filter((row) => soon(row, 7, 31)) },
      { key: 'later', title: 'Later, or no date', rows: shown.filter((row) => !soon(row, -1, 31)) },
    ];
  })().filter((group) => group.rows.length);

  const keep = (row) => onAnswer?.((current) => ({ ...current, [row.id]: current[row.id] === 'yes' ? undefined : 'yes' }));

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5" aria-label="Subscription tracker">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 font-heading text-[18px] font-bold text-foreground"><ListChecks className="h-5 w-5 text-primary" aria-hidden="true" /> Subscription tracker</p>
          <p className="mt-0.5 text-[14px] text-muted-foreground">Every subscription in one checklist. Tick Keep or Cancel until nothing is left to decide.</p>
        </div>
        <p className="text-right text-[14px] text-muted-foreground">
          <b className="text-foreground">{sorted.length} of {rows.length}</b> sorted
          {ghostedYearly > 0 && <><br /><b className="text-[#5ee6c8]">{money(ghostedYearly)}/yr</b> ghosted</>}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={sorted.length} aria-label="Subscriptions sorted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.round((sorted.length / rows.length) * 100)}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[13px] font-bold text-muted-foreground">Group by</span>
        {GROUPINGS.map((item) => (
          <button key={item.key} type="button" aria-pressed={groupBy === item.key} onClick={() => setGroupBy(item.key)} className={cn('rounded-full border px-3 py-1 text-[13.5px] font-bold', groupBy === item.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
            {item.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground">
          <input type="checkbox" checked={hideDone} onChange={(event) => setHideDone(event.target.checked)} className="accent-[hsl(var(--primary))]" /> Hide sorted
        </label>
      </div>

      {groups.length === 0 && <p className="mt-4 text-center text-[14px] font-bold text-[#5ee6c8]">All sorted. Nothing left to decide 👻</p>}
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="text-[13.5px] font-bold uppercase tracking-wide text-primary">{group.title} <span className="font-normal normal-case text-muted-foreground">· {money(group.rows.reduce((sum, row) => sum + row.monthly, 0))}/mo</span></p>
            {group.note && <p className="text-[13px] text-muted-foreground">{group.note}</p>}
            <ul className="mt-1.5 divide-y divide-white/[0.06] rounded-2xl border border-border">
              {group.rows.map((row) => {
                const done = sorted.includes(row);
                const cancelled = row.status === 'requested' || row.status === 'confirmed';
                return (
                  <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', done ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50')} aria-label={done ? 'Sorted' : 'Not sorted yet'}>
                      {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-foreground">
                        {row.merchant}
                        {row.overlap && groupBy !== 'double' && <span className="ml-1.5 rounded-full bg-[#ffc27a]/20 px-1.5 py-0.5 text-[12px] font-bold text-[#ffc27a]">Double-up</span>}
                      </span>
                      <span className={cn('block text-[13px]', row.status === 'charging' ? 'font-bold text-[#ff8a8a]' : 'text-muted-foreground')}>
                        {money(row.monthly)}/mo{row.next && !cancelled ? ` · next charge ${shortDate(row.next)}` : ''} · {STATUS_LABEL[row.status]}
                      </span>
                    </span>
                    {!cancelled && (
                      <span className="flex gap-1.5">
                        <button type="button" aria-pressed={row.status === 'keeping'} onClick={() => keep(row)} className={cn('rounded-full border px-3 py-1 text-[13.5px] font-bold', row.status === 'keeping' ? 'border-[#5ee6c8] bg-[#5ee6c8]/15 text-[#5ee6c8]' : 'border-border text-foreground hover:border-[#5ee6c8]/60')}>
                          Keep
                        </button>
                        <button type="button" onClick={() => proof.ask(row)} className="rounded-full border border-primary/70 px-3 py-1 text-[13.5px] font-bold text-foreground hover:bg-primary/15">
                          Cancel
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-muted-foreground">Saved in this browser only. Cancel asks for proof (a screenshot, their email or a reference), then your next statement checks it stopped.</p>
      {proof.dialog}
    </section>
  );
}
