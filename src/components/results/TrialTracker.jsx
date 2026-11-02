import { useEffect, useState } from 'react';
import { CalendarPlus, Timer, Trash2 } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { downloadTask, googleCalendarUrl, outlookCalendarUrl } from '@/lib/ghostFees/reminder';
import { loadSync, syncEvents } from '@/lib/ghostFees/calendarSync';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Trial tracker (Calendar & reminders): free trials you've started, the day each one
// turns paid, a countdown, and a reminder 2 days before in your own calendar. Trials
// your statement shows already turned paid are listed too. Saved in this browser only.
const KEY = 'ghostFees.trials.v1';
const DAY = 864e5;
const LENGTHS = [7, 14, 30];

const load = () => {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};
const iso = (date) => date.toISOString().slice(0, 10);
const addDays = (isoDate, days) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d;
};
const nice = (date) => date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
const daysUntil = (date) => Math.ceil((date - new Date(new Date().toDateString())) / DAY);

function reminderFor(trial) {
  const converts = addDays(trial.start, trial.days);
  const remind = new Date(Math.max(converts - 2 * DAY, Date.now()));
  return {
    uid: `trial-${trial.id}`,
    title: `${trial.name} free trial ends ${nice(converts)}`,
    details: `Your ${trial.name} trial turns paid on ${nice(converts)}${trial.price ? ` at ${money(trial.price)} a month` : ''}. Cancel before then if you don't want it.`,
    date: iso(remind),
  };
}

export default function TrialTracker({ leaks = [] }) {
  const [trials, setTrials] = useState(load);
  const [form, setForm] = useState({ name: '', start: iso(new Date()), days: 7, price: '' });
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(trials));
    } catch {
      // Storage off: works this visit only.
    }
  }, [trials]);

  const converted = leaks
    .filter((leak) => leak.badge === 'Trial converted')
    .map((leak) => ({ id: leak.id, name: leak.merchant, since: leak.rows?.find((row) => row.wasted)?.date, monthly: leak.monthly, paid: leak.amount }));

  const add = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const trial = { id: `${Date.now()}`, name, start: form.start, days: Number(form.days) || 7, price: Number(form.price) || 0 };
    setTrials((list) => [...list, trial].sort((a, b) => addDays(a.start, a.days) - addDays(b.start, b.days)));
    setForm({ name: '', start: iso(new Date()), days: 7, price: '' });
    // Already syncing reminders to a calendar? Add this one to the feed too.
    if (loadSync()) {
      try {
        await syncEvents([reminderFor(trial)]);
        toast({ title: `${name} added to your synced calendar`, description: 'It shows 2 days before the trial ends.' });
        return;
      } catch {
        // Fall through to the manual buttons.
      }
    }
    toast({ title: `Tracking ${name}`, description: 'Add the reminder to your calendar below.' });
  };
  const remove = (id) => setTrials((list) => list.filter((item) => item.id !== id));

  const input = 'h-10 rounded-xl border border-border bg-background/60 px-3 text-[14.5px] text-foreground';
  return (
    <section aria-label="Trial tracker" className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <p className="flex items-center gap-2 font-heading text-[18px] font-bold text-foreground"><Timer className="h-5 w-5 text-primary" aria-hidden="true" /> Trial tracker</p>
      <p className="mt-0.5 text-[14px] text-muted-foreground">Started a free trial? Add it and I&apos;ll show the day it turns paid, and put a reminder in your calendar 2 days before.</p>

      <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-[13px] font-bold text-muted-foreground">Trial
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paramount+" required />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-bold text-muted-foreground">Started
          <input type="date" className={input} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-bold text-muted-foreground">Free for
          <select className={input} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })}>
            {LENGTHS.map((days) => <option key={days} value={days}>{days} days</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-bold text-muted-foreground">Then $/mo
          <input type="number" min="0" step="0.01" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Optional" />
        </label>
        <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-[14.5px] font-bold text-primary-foreground">Track it</button>
      </form>

      {trials.length > 0 && (
        <ul className="mt-4 divide-y divide-white/[0.06] rounded-2xl border border-border">
          {trials.map((trial) => {
            const converts = addDays(trial.start, trial.days);
            const left = daysUntil(converts);
            const reminder = reminderFor(trial);
            return (
              <li key={trial.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-3">
                <span className={cn('rounded-full px-2.5 py-1 text-[13px] font-bold', left <= 0 ? 'bg-[#ff8a8a]/20 text-[#ff8a8a]' : left <= 3 ? 'bg-[#ffc27a]/20 text-[#ffc27a]' : 'bg-primary/15 text-primary')}>
                  {left <= 0 ? 'Now paid' : left === 1 ? '1 day left' : `${left} days left`}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-foreground">{trial.name}</span>
                  <span className="block text-[13px] text-muted-foreground">
                    Turns paid {nice(converts)}{trial.price ? ` at ${money(trial.price)}/mo (${money(trial.price * 12)}/yr)` : ''}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  <a href={googleCalendarUrl(reminder)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[13px] font-bold text-foreground hover:border-primary/60"><CalendarPlus className="h-3.5 w-3.5" /> Google</a>
                  <a href={outlookCalendarUrl(reminder)} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 text-[13px] font-bold text-foreground hover:border-primary/60">Outlook</a>
                  <button type="button" onClick={() => downloadTask(reminder)} className="rounded-full border border-border px-3 py-1.5 text-[13px] font-bold text-foreground hover:border-primary/60">Apple / .ics</button>
                  <button type="button" onClick={() => remove(trial.id)} aria-label={`Stop tracking ${trial.name}`} className="rounded-full px-2 py-1.5 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {converted.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#ff8a8a]">Already turned paid (from your statement)</p>
          <ul className="mt-1.5 space-y-1.5">
            {converted.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[#ff8a8a]/[0.08] px-3.5 py-2.5 text-[14px] text-foreground">
                <b>{item.name}</b> turned paid{item.since ? ` on ${nice(new Date(item.since))}` : ''}: {money(item.paid)} so far{item.monthly ? `, ${money(item.monthly)}/mo now` : ''}. Cancel it if you don&apos;t use it, and ask for the first charge back.
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[12.5px] text-muted-foreground">Saved in this browser only. Using calendar sync above? New trials go straight into your synced calendar.</p>
    </section>
  );
}
