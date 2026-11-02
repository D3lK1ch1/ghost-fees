import { useEffect, useState } from 'react';
import { CalendarPlus, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { doneLink, quickTimes, savePlan } from '@/lib/ghostFees/cancelPlans';
import { downloadTimedTask, googleTimedUrl, outlookTimedUrl } from '@/lib/ghostFees/reminder';
import { cn } from '@/lib/utils';

// "When will you do it?" People who pick a time and place are far more likely to
// follow through (implementation intentions; Gollwitzer and Sheeran, 2006). The
// event holds Cassy's steps, the official link, a ready cancel email, and a link
// back (/?done=<id>) that opens "I cancelled it" for this subscription.
export function cancelTask(subscription, at) {
  const info = cancelInfo(subscription.merchant);
  const yearly = money((Number(subscription.monthly) || 0) * 12);
  const email = `Hi ${subscription.merchant}, please cancel my subscription today and confirm by email that there will be no further charges. Thanks.`;
  const details = [
    `Cancel ${subscription.merchant}: ${money(subscription.monthly)} a month, ${yearly} a year.`,
    info.url ? `Official cancel page: ${info.url}` : 'No checked cancel page yet: ask Cassy in Ghost Fees, or search their site for "cancel subscription".',
    `Steps: ${info.steps}`,
    `Cancel email (copy and paste): ${email}`,
    `Done? Tick it off and keep proof: ${doneLink(subscription.id)}`,
  ].join('\n\n');
  return { title: `Cancel ${subscription.merchant} (${yearly} a year)`, details, start: at, uid: `cancel-${subscription.id}` };
}

const localInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function PickTimeDialog({ target, onClose }) {
  const quick = quickTimes();
  const [choice, setChoice] = useState('tonight');
  const [custom, setCustom] = useState(localInput(new Date(Date.now() + 86400000)));
  useEffect(() => {
    setChoice('tonight');
  }, [target]);
  if (!target) return null;

  const at = choice === 'custom' ? new Date(custom) : quick.find((item) => item.key === choice)?.at;
  const valid = at instanceof Date && !Number.isNaN(at.getTime()) && at > new Date();
  const task = valid ? cancelTask(target, at) : null;
  const when = valid ? at.toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

  const add = (how) => {
    if (!task) return;
    savePlan(target, at);
    if (how === 'file') downloadTimedTask(task);
    else window.open(how === 'google' ? googleTimedUrl(task) : outlookTimedUrl(task, how === 'work'), '_blank', 'noopener');
    toast({ title: `Cancel ${target.merchant}: ${when}`, description: 'It\'s in your calendar with the steps, the email and a link to tick it off.' });
    onClose();
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card text-foreground">
        <DialogTitle className="font-heading text-[20px]">When will you cancel {target.merchant}?</DialogTitle>
        <p className="-mt-2 text-[13px] text-muted-foreground">Picking a time makes it much more likely to happen. We&apos;ll put it in your calendar with everything you need.</p>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="When">
          {[...quick, { key: 'custom', label: 'Pick a date and time' }].map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={choice === item.key}
              onClick={() => setChoice(item.key)}
              className={cn('rounded-2xl border px-4 py-3 text-left text-[14.5px] font-bold', choice === item.key ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50')}
            >
              {item.label}
            </button>
          ))}
          {choice === 'custom' && (
            <input type="datetime-local" value={custom} onChange={(event) => setCustom(event.target.value)} aria-label="Date and time" className="rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground" />
          )}
        </div>
        {!valid && choice === 'custom' && <p className="text-[12.5px] font-semibold text-[#ffc27a]">Pick a time in the future.</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!valid} onClick={() => add('file')} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14.5px] font-bold text-primary-foreground disabled:opacity-40">
            <CalendarPlus className="h-4 w-4" /> Add to my calendar{when ? ` · ${when}` : ''}
          </button>
          <button type="button" disabled={!valid} onClick={() => add('google')} className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-[13px] font-bold disabled:opacity-40">Google <ExternalLink className="h-3 w-3" /></button>
          <button type="button" disabled={!valid} onClick={() => add('outlook')} className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-[13px] font-bold disabled:opacity-40">Outlook <ExternalLink className="h-3 w-3" /></button>
        </div>
        <p className="text-[11px] text-muted-foreground">&ldquo;Add to my calendar&rdquo; downloads a file for Apple Calendar, Outlook or any calendar app. Only the time you pick is kept, in this browser.</p>
      </DialogContent>
    </Dialog>
  );
}
