import { useMemo, useState } from 'react';
import { BellRing, CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { downloadAllReminders, nextChargeDate, nextReminderDate } from '@/lib/ghostFees/reminder';
import GhostMark from '@/components/site/GhostMark';
import { useTheme } from '@/lib/ThemeContext';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { SEASON_KEY, SEASONS, xmasAvatar } from '@/lib/ghostFees/christmasArt';
import GhostTip from './GhostTip';
import TaskDialog from './TaskDialog';
import CalendarSync from './CalendarSync';
import { useGhostList } from '@/hooks/use-ghost-list';
import { EX_GHOST_KEY, EX_GHOSTS } from '@/lib/ghostFees/exArt';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const monthKey = (date) => date.slice(0, 7);
const monthName = (key) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const longDay = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

// Month grid: ghosts on the days a leak charged you, bells on upcoming subscription
// charges. Like the Haunted House, each ghost shows its name, hovering says what it
// is, and the biggest ghost glows orange. Scheduling opens a task popup.
export default function HauntedCalendar({ leaks, subscriptions: allSubscriptions, avatarFor }) {
  const { theme } = useTheme();
  // Cancelled ones (on the Ghost List as Requested or Confirmed) come off the
  // calendar and reminders. Still charging puts them back.
  const [ghostList] = useGhostList();
  const cancelledIds = new Set(ghostList.filter((item) => item.status !== 'charging').map((item) => item.id));
  const subscriptions = allSubscriptions.filter((item) => !cancelledIds.has(item.id));
  const cancelled = allSubscriptions.filter((item) => cancelledIds.has(item.id));
  const [season] = useSavedChoice(SEASON_KEY, SEASONS, 'winter');
  const [task, setTask] = useState(null);
  const biggestId = leaks[0]?.id;
  const themeGhost = (name) => (theme.key === 'ex' && avatarFor ? avatarFor(name) : theme.key === 'christmas' ? xmasAvatar(name, season) : null);
  const today = new Date().toISOString().slice(0, 10);
  const scheduleSub = (item) => setTask({ kind: 'sub', name: item.merchant, amount: item.monthly, dueDate: item.next, date: nextReminderDate(item.lastDate)?.toISOString().slice(0, 10) || today });
  const scheduleLeak = (item) => setTask({ kind: 'leak', name: item.name, amount: item.total, biggest: item.leakId === biggestId, date: today });
  const { charges, upcoming, months } = useMemo(() => {
    const list = [];
    leaks.forEach((leak) => {
      (leak.rows || []).filter((row) => row.wasted).forEach((row) => {
        list.push({ date: row.date, name: leak.title || leak.merchant, merchant: leak.merchant, badge: leak.badge, amount: row.wastedAmount || row.amount, total: leak.amount, leakId: leak.id });
      });
    });
    const soon = subscriptions
      .filter((item) => item.lastDate)
      .map((item) => ({ ...item, next: nextChargeDate(item.lastDate)?.toISOString().slice(0, 10) }))
      .filter((item) => item.next)
      .sort((a, b) => a.next.localeCompare(b.next));
    const keys = [...new Set([...list.map((item) => monthKey(item.date)), ...soon.map((item) => monthKey(item.next))])].sort();
    return { charges: list, upcoming: soon, months: keys };
  }, [leaks, subscriptions]);

  const latestCharge = charges.map((item) => item.date).sort().pop();
  const [month, setMonth] = useState(latestCharge ? monthKey(latestCharge) : months[0]);
  const [day, setDay] = useState(null);

  if (!months.length) {
    return <p className="mt-4 text-[13.5px] text-muted-foreground">No dated charges to show yet.</p>;
  }

  const index = months.indexOf(month);
  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];

  const onDay = (date) => charges.filter((item) => item.date === date);
  const dueOn = (date) => upcoming.filter((item) => item.next === date);
  const isDouble = (date) => {
    const ids = onDay(date).map((item) => item.leakId);
    return ids.length !== new Set(ids).size;
  };
  const monthTotal = charges.filter((item) => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
  const selected = day && monthKey(day) === month ? day : null;

  return (
    <section className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[#140c26] p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 animate-moon-glow rounded-full bg-[#f5efe0]/80" />
        <div className="relative flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMonth(months[index - 1])}
            disabled={index <= 0}
            aria-label="Previous month"
            className="rounded-full border border-border bg-card/70 p-2 text-foreground transition-colors hover:border-primary/60 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h3 className="font-heading text-xl font-semibold text-foreground">{monthName(month)}</h3>
            <p className="text-[12px] text-muted-foreground">
              {monthTotal > 0 ? <>Ghost charges this month: <span className="font-bold text-primary">{money(monthTotal)}</span></> : 'No ghost charges this month'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMonth(months[index + 1])}
            disabled={index >= months.length - 1}
            aria-label="Next month"
            className="rounded-full border border-border bg-card/70 p-2 text-foreground transition-colors hover:border-primary/60 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((name) => (
            <span key={name} className="pb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{name}</span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const ghosts = onDay(date);
            const due = dueOn(date);
            const double = isDouble(date);
            return (
              <button
                key={date}
                type="button"
                onClick={() => setDay(date)}
                aria-label={`${longDay(date)}${ghosts.length ? `, ${ghosts.length} ghost charges` : ''}${due.length ? `, ${due.length} upcoming` : ''}`}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-start rounded-xl border p-1 text-[11.5px] font-bold transition-colors',
                  ghosts.length ? 'border-primary/40 bg-[#2c1f47]' : due.length ? 'border-dashed border-[#5ee6c8]/50 bg-[#1b1630]' : 'border-white/[0.06] bg-white/[0.02]',
                  selected === date && 'ring-2 ring-primary',
                  'hover:border-primary/60',
                )}
              >
                <span className="text-muted-foreground">{Number(date.slice(8))}</span>
                {ghosts.length > 0 && (() => {
                  const lead = ghosts.find((item) => item.leakId === biggestId) || ghosts[0];
                  const art = themeGhost(lead.merchant);
                  return (
                    <span className="mt-auto flex w-full flex-col items-center">
                      <GhostTip biggest={lead.leakId === biggestId} label={ghosts.map((item) => item.name).join(' + ')} detail={`${lead.badge} · ${money(ghosts.reduce((sum, item) => sum + item.amount, 0))}`}>
                        <span className="block animate-bob" style={{ animationDelay: `${(i % 5) * 0.3}s` }}>
                          {art ? <img src={art} alt={lead.name} width={28} height={28} className="h-5 w-5 object-contain sm:h-7 sm:w-7" /> : <GhostMark className="h-5 w-5 text-[#f4efe8] sm:h-7 sm:w-7" eyeColor="#1a1230" />}
                        </span>
                      </GhostTip>
                      <span className={cn('mt-0.5 hidden w-full truncate text-[9px] font-bold leading-tight sm:block', lead.leakId === biggestId ? 'text-[hsl(30_100%_62%)]' : 'text-foreground/80')}>{lead.name}</span>
                    </span>
                  );
                })()}
                {due.length > 0 && !ghosts.length && (
                  <span className="mt-auto flex w-full flex-col items-center">
                    <BellRing className="h-4 w-4 text-[#5ee6c8] sm:h-5 sm:w-5" />
                    <span className="mt-0.5 hidden w-full truncate text-[9px] font-bold leading-tight text-[#5ee6c8] sm:block">{due[0].merchant}</span>
                  </span>
                )}
                {double && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#ff6b8a] px-1.5 text-[9px] font-bold uppercase text-white">Double!</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="relative mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><GhostMark className="h-3.5 w-3.5 text-[#f4efe8]" eyeColor="#1a1230" /> Ghost charge</span>
          <span className="flex items-center gap-1.5"><BellRing className="h-3.5 w-3.5 text-[#5ee6c8]" /> Subscription due</span>
          <span className="flex items-center gap-1.5"><span className="rounded-full bg-[#ff6b8a] px-1.5 text-[9px] font-bold text-white">DOUBLE!</span> Charged twice</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[hsl(30_100%_62%)] shadow-[0_0_8px_hsl(30_100%_62%)]" /> Biggest ghost</span>
        </p>
      </div>
        <CassyNudge />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-[15px] font-semibold text-foreground">{selected ? longDay(selected) : 'Tap a day'}</p>
          {selected ? (
            <ul className="mt-2 space-y-2">
              {onDay(selected).map((item, i) => (
                <li key={`${item.leakId}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-background/60 px-3 py-2 text-[13px]">
                  <span className="min-w-0">
                    <span className={cn('block truncate font-bold', item.leakId === biggestId ? 'text-[hsl(30_100%_62%)]' : 'text-foreground')}>{item.leakId === biggestId && '★ '}{item.name}</span>
                    <span className="text-[11.5px] text-muted-foreground">{item.badge}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="font-bold tabular-nums text-primary">{money(item.amount)}</span>
                    <button type="button" onClick={() => scheduleLeak(item)} className="text-[12px] font-bold text-primary hover:underline">Schedule a task</button>
                  </span>
                </li>
              ))}
              {dueOn(selected).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#5ee6c8]/40 px-3 py-2 text-[13px]">
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-foreground">{item.merchant}</span>
                    <span className="text-[11.5px] text-[#5ee6c8]">Due {money(item.monthly)}</span>
                  </span>
                  <button type="button" onClick={() => scheduleSub(item)} className="shrink-0 text-[12px] font-bold text-primary hover:underline">Schedule a task</button>
                </li>
              ))}
              {!onDay(selected).length && !dueOn(selected).length && (
                <li className="text-[13px] text-muted-foreground">Nothing haunting this day.</li>
              )}
            </ul>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">Ghosts mark the days a leak charged you. Bells mark upcoming subscription charges.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading text-[15px] font-semibold text-foreground">Upcoming reminders</p>
            {upcoming.length > 0 && (
              <button
                type="button"
                onClick={() => downloadAllReminders(upcoming)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Add all
              </button>
            )}
          </div>
          <ul className="mt-2 divide-y divide-white/[0.06]">
            {upcoming.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <button type="button" onClick={() => { setMonth(monthKey(item.next)); setDay(item.next); }} className="min-w-0 text-left">
                  <span className="block truncate font-bold text-foreground">{item.merchant}</span>
                  <span className="text-[11.5px] text-muted-foreground">
                    {new Date(`${item.next}T00:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' })} · {money(item.monthly)}
                  </span>
                </button>
                <button type="button" onClick={() => scheduleSub(item)} className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                  <CalendarPlus className="h-3.5 w-3.5" /> Schedule
                </button>
              </li>
            ))}
            {!upcoming.length && <li className="py-2 text-[13px] text-muted-foreground">No subscriptions to remind you about.</li>}
          </ul>
          {cancelled.length > 0 && (
            <p className="mt-2 text-[12px] leading-relaxed text-[#5ee6c8]">
              Cancelled, so off your reminders: {cancelled.map((item) => item.merchant).join(', ')}.
            </p>
          )}
          <CalendarSync subscriptions={subscriptions} />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Schedule picks a task and a day, then adds it to Google, Outlook or Apple Calendar. Add all puts a reminder 2 days before every charge.</p>
        </div>
      </div>
      <TaskDialog target={task} onClose={() => setTask(null)} />
    </section>
  );
}

// Fills the space under the calendar (the reminders column is taller) and points
// you down to Cassy, the cancellation assistant. One ghost per theme from the
// asset bank: 💔 your own ghost (sassy for Heartbroken, blocking for I'm Fine),
// 👻 the lantern ghost, 🎄 the festive ghost.
const NUDGE = {
  ex: 'Scroll down to f**k your exes more, with help from Cassy.',
  christmas: "Scroll down to break more of Jacob's chain, with help from Cassy.",
  haunted: 'Scroll down to bust more ghosts, with help from Cassy.',
};

function CassyNudge() {
  const { theme } = useTheme();
  const [exPick] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const art = theme.key === 'ex'
    ? `/themes/ex/${exPick === 'fine' ? 'men-block' : 'ghost-sassy'}.webp`
    : theme.key === 'christmas' ? '/themes/christmas/xc-festive.webp' : '/themes/haunted/lantern-ghost.webp';
  const toCassy = () => document.querySelector('[aria-label="Cancellation assistant"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="flex flex-1 items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 px-5 py-5">
      <img src={art} alt="" width={130} height={140} className="animate-float h-[140px] w-[130px] flex-none object-contain" />
      <div className="relative max-w-[280px] rounded-[22px] bg-white px-5 py-4 text-[#15131a] shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <span aria-hidden="true" className="absolute -left-2 top-1/2 h-5 w-5 -translate-y-1/2 rotate-45 rounded-[3px] bg-white" />
        <p className="relative font-heading text-[17px] font-bold leading-snug">{NUDGE[theme.key] || NUDGE.haunted}</p>
        <button type="button" onClick={toCassy} className="relative mt-2 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground">
          Take me to Cassy ↓
        </button>
      </div>
    </div>
  );
}
