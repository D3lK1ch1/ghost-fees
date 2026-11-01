import { useEffect, useState } from 'react';
import { CalendarPlus, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { money } from '@/lib/ghostFees/format';
import { downloadTask, googleCalendarUrl } from '@/lib/ghostFees/reminder';
import { cn } from '@/lib/utils';

const longDay = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

// Task popup from the calendar: pick what to do about a ghost and when, then add it
// to your own calendar (a file for Apple, Outlook or any app) or to Google Calendar.
// target: { name, amount, kind: 'leak' | 'sub', date (default day), dueDate? }
export function tasksFor(target) {
  const due = target.dueDate ? ` before it charges on ${longDay(target.dueDate)}` : '';
  if (target.kind === 'sub') {
    return [
      { key: 'cancel', title: `Cancel ${target.name}`, details: `${target.name} costs ${money(target.amount)} a month. Cancel${due} if you don't use it.` },
      { key: 'decide', title: `Decide on ${target.name}`, details: `Still using ${target.name} at ${money(target.amount)} a month? Keep it or cancel${due}.` },
      { key: 'check', title: `Check ${target.name} stopped`, details: `Look at your statement and check ${target.name} did not charge again.` },
    ];
  }
  return [
    { key: 'email', title: `Send the ${target.name} email`, details: `Ghost Fees found ${money(target.amount)} on ${target.name}. Send the email from the Email templates tab.` },
    { key: 'refund', title: `Chase the ${target.name} refund`, details: `Check the ${money(target.amount)} refund for ${target.name} has landed.` },
    { key: 'check', title: `Check ${target.name} is gone`, details: `Look at your next statement and check ${target.name} has not charged again.` },
  ];
}

export default function TaskDialog({ target, onClose }) {
  const options = target ? tasksFor(target) : [];
  const [choice, setChoice] = useState(0);
  const [date, setDate] = useState(target?.date || '');
  const [note, setNote] = useState('');
  useEffect(() => {
    setChoice(0);
    setDate(target?.date || '');
    setNote('');
  }, [target]);
  if (!target) return null;
  const picked = options[choice];
  const task = { title: picked.title, details: note ? `${picked.details} ${note}` : picked.details, date };
  const scheduled = (where) => {
    toast({ title: 'Task scheduled', description: `${task.title} · ${longDay(date)} · ${where}` });
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card text-foreground">
        <DialogTitle className="font-heading text-[20px]">Schedule a task</DialogTitle>
        <p className="-mt-2 text-[13px] text-muted-foreground">
          {target.biggest && <span className="mr-1.5 inline-block rounded-full bg-[hsl(30_100%_62%)] px-1.5 text-[10px] font-bold uppercase text-[#1b1233]">Biggest</span>}
          <span className="font-bold text-foreground">{target.name}</span> · {money(target.amount)}{target.kind === 'sub' ? ' a month' : ''}
        </p>

        <fieldset className="mt-1 space-y-2">
          <legend className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">What to do</legend>
          {options.map((option, index) => (
            <label key={option.key} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5 text-[13.5px]', index === choice ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
              <input type="radio" name="task" checked={index === choice} onChange={() => setChoice(index)} className="mt-1 accent-[hsl(var(--primary))]" />
              <span><span className="block font-bold">{option.title}</span><span className="text-[12px] text-muted-foreground">{option.details}</span></span>
            </label>
          ))}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <label className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
            When
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal normal-case text-foreground" />
          </label>
          <label className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
            Note (optional)
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. use the app" className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal normal-case text-foreground" />
          </label>
        </div>

        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!date}
            onClick={() => downloadTask(task) && scheduled('added from the calendar file')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
          >
            <CalendarPlus className="h-4 w-4" /> Add to my calendar
          </button>
          <a
            href={date ? googleCalendarUrl(task) : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={() => date && scheduled('opened in Google Calendar')}
            className={cn('inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/70 px-4 py-3 text-[14px] font-bold text-foreground', !date && 'pointer-events-none opacity-40')}
          >
            Google Calendar <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          &quot;Add to my calendar&quot; saves a file for Apple Calendar, Outlook or any calendar app. Google Calendar opens with the task filled in, and only then is the task text sent to Google.
        </p>
      </DialogContent>
    </Dialog>
  );
}
