import { useState } from 'react';
import { CalendarPlus, Check, ChevronDown, Mail, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { buildEmail, composeLinks } from '@/lib/ghostFees/emailDraft';
import { GOAL_KINDS, useGoalTasks } from '@/lib/ghostFees/goalTasks';
import { downloadTask, googleCalendarUrl, outlookCalendarUrl } from '@/lib/ghostFees/reminder';
import { trackEvent } from '@/lib/session';

const SIR = '#b18cff';
const nameOf = (leak) => leak.title || leak.merchant;
// Who each letter goes to, and what it asks for, so the outline is clear before you open it.
const RECIPIENT = {
  cancel: (leak) => `${nameOf(leak)} customer support (their help or contact page)`,
  refund: (leak) => `${nameOf(leak)} customer support`,
  waive: () => 'Your bank (secure message in the app, or their complaints email)',
  check: (leak) => `${nameOf(leak)} customer support`,
};
const ASKS = {
  cancel: (leak) => `Cancel now, confirm it in writing${/trial/i.test(leak.badge || '') ? ', and refund the charges since the trial ended' : ''}.`,
  refund: (leak) => `Refund ${money(leak.amount)} of extra charges, and confirm by email.`,
  waive: (leak) => `Refund ${money(leak.amount)} in fees within 14 days, or a fee-free account.`,
  check: () => 'Explain the price rise, or cancel.',
};
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Sir Spooksworth does the whole letter job: read it, send it from your own Outlook,
// Gmail or mail app, put a "check for a reply" reminder in your calendar, and tick each
// step off the same task list as the goal path and calendar (steps: open, send, check).
export default function LetterActions({ leaks, onOpen }) {
  const { ticks, tick, setDue } = useGoalTasks();
  // A clean numbered list: one line per letter, tap to open it. One open at a time,
  // starting with the first letter that isn't sent yet.
  const [openId, setOpenId] = useState(() => (leaks || []).find((l) => !ticks[l.id]?.[1])?.id ?? leaks?.[0]?.id);
  if (!leaks?.length) return null;
  return (
    <ol className="mt-2 w-full space-y-1.5">
      {leaks.map((leak, index) => {
        const email = buildEmail(leak);
        const links = composeLinks(email);
        const kind = GOAL_KINDS[leak.action] ? leak.action : 'check';
        const done = ticks[leak.id] || {};
        const check = { title: `👻 Check ${leak.title || leak.merchant} replied`, details: `You sent: ${email.subject}. ${GOAL_KINDS[kind].steps[2]}.\n\nFrom Sir Spooksworth, Ghost Fees.`, date: inDays(7) };
        const sent = () => { tick(leak.id, 0, true); tick(leak.id, 1, true); trackEvent('sir_send'); };
        const remind = () => setDue(leak.id, check.date);
        const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground transition-colors hover:border-[#b18cff]';
        return (
          <li key={leak.id} className={cn('rounded-xl border bg-background/50 text-[13.5px]', openId === leak.id ? 'border-[#b18cff]/60' : 'border-border')}>
            <button type="button" onClick={() => setOpenId(openId === leak.id ? null : leak.id)} aria-expanded={openId === leak.id}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-[#1b1233]" style={{ background: done[1] ? SIR : `${SIR}88` }}>{done[1] ? '✓' : index + 1}</span>
              <span className={cn('min-w-0 flex-1 truncate font-bold', done[2] ? 'text-muted-foreground line-through' : 'text-foreground')}>{GOAL_KINDS[kind].label(leak.title || leak.merchant)}</span>
              <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">{money(leak.amount)}</span>
              <span className="shrink-0 text-[11.5px] font-bold" style={{ color: SIR }}>{done[2] ? 'Done' : done[1] ? 'Sent' : ''}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', openId === leak.id && 'rotate-180')} />
            </button>
            {openId === leak.id && (
            <div className="border-t border-border px-2.5 pb-2.5 pt-1">
            {/* Send first: opens your own Outlook or Gmail with the letter filled in, ready to send. */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <a className={cn(btn, 'border-transparent text-[#1b1233]')} style={{ background: SIR }} href={links.outlook} target="_blank" rel="noreferrer" onClick={sent}><Send className="h-3.5 w-3.5" /> Send in Outlook</a>
              <a className={cn(btn, 'border-transparent text-[#1b1233]')} style={{ background: SIR }} href={links.gmail} target="_blank" rel="noreferrer" onClick={sent}><Send className="h-3.5 w-3.5" /> Send in Gmail</a>
              <a className={btn} href={links.mail} onClick={sent}>Mail app</a>
              <button type="button" className={btn} onClick={() => { tick(leak.id, 0, true); onOpen?.(leak); }}><Mail className="h-3.5 w-3.5" /> Edit it</button>
            </div>
            {/* The outline: who it goes to, the subject, and what it asks for. */}
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[12.5px]">
              <dt className="font-bold text-muted-foreground">To</dt>
              <dd className="text-foreground">{RECIPIENT[kind](leak)}</dd>
              <dt className="font-bold text-muted-foreground">Subject</dt>
              <dd className="text-foreground">{email.subject}</dd>
              <dt className="font-bold text-muted-foreground">Asks for</dt>
              <dd className="text-foreground">{ASKS[kind](leak)}</dd>
            </dl>
            <details className="mt-1.5 rounded-lg bg-background/60 px-2.5 py-1.5" onToggle={(e) => e.currentTarget.open && tick(leak.id, 0, true)}>
              <summary className="cursor-pointer text-[12.5px] font-bold text-foreground">Read the draft</summary>
              <p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/85">{email.body}</p>
            </details>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {[['Read', done[0]], ['Sent', done[1]], ['Worked', done[2]]].map(([label, on], i) => (
                <span key={label} className={cn(on && 'font-bold', i && 'ml-2')} style={on ? { color: SIR } : undefined}>{on ? '✓' : '○'} {label}</span>
              ))}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><CalendarPlus className="h-3.5 w-3.5" /> Remind me in 7 days:</span>
              <a className={btn} href={googleCalendarUrl(check)} target="_blank" rel="noreferrer" onClick={remind}>Google</a>
              <a className={btn} href={outlookCalendarUrl(check)} target="_blank" rel="noreferrer" onClick={remind}>Outlook</a>
              <button type="button" className={btn} onClick={() => { downloadTask(check); remind(); }}>Apple / .ics</button>
              <button type="button" onClick={() => tick(leak.id, 2)} aria-pressed={Boolean(done[2])}
                className={cn(btn, done[2] && 'border-transparent text-[#1b1233]')} style={done[2] ? { background: SIR } : undefined}>
                <Check className="h-3.5 w-3.5" /> {done[2] ? 'It worked' : 'Mark it worked'}
              </button>
            </div>
            </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
