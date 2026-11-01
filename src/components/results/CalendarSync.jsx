import { useState } from 'react';
import { CalendarCheck, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { feedLinks, loadSync, reminderEvents, stopSync, syncEvents } from '@/lib/ghostFees/calendarSync';

// "Sync to my calendar": puts every upcoming reminder in a private feed, then one
// tap subscribes Google, Outlook or Apple Calendar to it. New reminders and tasks
// you add later appear in your real calendar on their own.
export default function CalendarSync({ subscriptions }) {
  const [sync, setSync] = useState(loadSync);
  const [busy, setBusy] = useState(false);
  const links = sync ? feedLinks(sync.token) : null;

  const start = async () => {
    setBusy(true);
    try {
      const next = await syncEvents(reminderEvents(subscriptions));
      setSync(next);
      toast({ title: 'Reminders ready to sync', description: `${next.events.length} reminders. Now pick your calendar below.` });
    } catch {
      toast({ title: 'Could not set up sync', description: 'Try again in a moment.' });
    } finally {
      setBusy(false);
    }
  };
  const stop = async () => {
    await stopSync();
    setSync(null);
    toast({ title: 'Sync stopped', description: 'Your calendar will drop the Ghost Fees reminders at its next refresh.' });
  };

  if (!sync) {
    return (
      <div className="mt-3 rounded-2xl border border-primary/40 bg-primary/[0.06] p-3">
        <p className="flex items-center gap-2 font-heading text-[14px] font-semibold text-foreground"><RefreshCw className="h-4 w-4 text-primary" /> Sync to my calendar</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Subscribe once in Google, Outlook or Apple Calendar. Every reminder and task you add here then shows up there on its own.</p>
        <button type="button" disabled={busy} onClick={start} className="mt-2 w-full rounded-xl bg-primary py-2 text-[13px] font-bold text-primary-foreground disabled:opacity-50">
          {busy ? 'Setting up...' : 'Set up calendar sync'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#5ee6c8]/50 bg-[#5ee6c8]/[0.06] p-3">
      <p className="flex items-center gap-2 font-heading text-[14px] font-semibold text-foreground"><CalendarCheck className="h-4 w-4 text-[#5ee6c8]" /> {sync.events.length} reminders syncing</p>
      <p className="mt-1 text-[12px] text-muted-foreground">Subscribe once in your calendar:</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {[['Google Calendar', links.google], ['Outlook', links.outlook], ['Work Outlook', links.work], ['Apple Calendar', links.apple]].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-background/60 px-2 py-2 text-[12.5px] font-bold text-foreground hover:border-primary/60">
            {label} <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" onClick={async () => { await navigator.clipboard.writeText(links.https); toast({ title: 'Calendar link copied' }); }} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
          <Copy className="h-3.5 w-3.5" /> Copy link
        </button>
        <button type="button" onClick={stop} className="text-[12px] font-bold text-muted-foreground underline">Stop syncing</button>
      </div>
      <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">Google and Outlook check for new reminders every few hours. The link is private: anyone with it can see these reminders (names, amounts and dates only).</p>
    </div>
  );
}
