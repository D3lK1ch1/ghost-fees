import { useRef, useState } from 'react';
import { CalendarPlus, ChevronDown } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { leakRows } from '@/lib/ghostFees/leaks';
import { googleCalendarUrl } from '@/lib/ghostFees/reminder';
import { useGoalTasks } from '@/lib/ghostFees/goalTasks';
import { addGhostReminder } from '@/lib/ghostFees/calendarSync';

const PENNY = '#5ee6c8';

// What the statement can't tell you about a fee: why you're charged it, how to stop it,
// and whether you can get it back. General guidance about common fee types, no product
// names and no numbers beyond the statement's own.
const FEE_TYPES = [
  { match: /monthly|account (keeping )?fee|maintenance|service fee|account fee/i, kind: 'Account-keeping fee', odds: 'Often', next: 'Ask to waive, or move to a fee-free account',
    why: 'A flat monthly charge for having the account. Many everyday accounts charge nothing, or waive it if you meet a condition like a monthly deposit.',
    stop: 'Ask your bank what makes the fee go away, or whether they have a fee-free everyday account you can move to.',
    back: 'Worth asking: banks often refund recent account fees when you ask politely.' },
  { match: /late|overdue/i, kind: 'Late payment fee', odds: 'Often (first time)', next: 'Ask to refund, then set up autopay',
    why: 'Charged when a payment (often a credit card or bill minimum) lands after the due date.',
    stop: 'Set up an automatic payment for at least the minimum, or a reminder 3 days before the due date.',
    back: 'A first late fee is often refunded if you ask and you are usually on time.' },
  { match: /overdra|dishonou?r|overdrawn|insufficient|returned/i, kind: 'Overdrawn / dishonour fee', odds: 'Sometimes', next: 'Ask to refund, turn on low-balance alerts',
    why: 'Charged when a payment goes out and there is not enough money in the account.',
    stop: 'Turn on a low-balance alert in your bank app, and move direct debits to just after payday.',
    back: 'Ask, especially if it happened once. Banks can refund these.' },
  { match: /atm|withdrawal/i, kind: 'ATM fee', odds: 'Rarely', next: 'Use your own bank\'s ATMs',
    why: 'Charged for using another bank\'s ATM, or an ATM overseas.',
    stop: 'Use your own bank\'s ATMs, or take cash out at the checkout when you shop.',
    back: 'Rarely refunded, so this one is about avoiding it next time.' },
  { match: /foreign|international|overseas|\bfx\b|currency|conversion/i, kind: 'Foreign transaction fee', odds: 'Rarely', next: 'Check your card\'s foreign fee before you pay',
    why: 'A percentage added when you pay in another currency, including some overseas online shops.',
    stop: 'Check your card\'s foreign fee before you travel or shop overseas sites, and pay in the local currency when asked.',
    back: 'Usually not refunded, so plan the card you use next time.' },
  { match: /interest|cash advance/i, kind: 'Interest / cash advance', odds: 'Rarely', next: 'Pay the full balance by the due date',
    why: 'Charged when a card balance is not paid in full, or when you take cash out on a credit card.',
    stop: 'Pay the full balance by the due date where you can, and avoid cash out on a credit card.',
    back: 'Interest is rarely refunded, but ask if it came from a mistake.' },
  { match: /surcharge|card fee|merchant fee/i, kind: 'Card surcharge', odds: 'Sometimes', next: 'Ask for a way to pay with no surcharge',
    why: 'Some shops add a fee for paying by card.',
    stop: 'Ask if another way to pay has no surcharge, or pay where none is charged.',
    back: 'Ask the shop if the surcharge looked higher than the card actually costs them.' },
];
const typeOf = (leak) => FEE_TYPES.find((t) => t.match.test(`${leak.title || ''} ${leak.merchant || ''} ${leak.badge || ''}`))
  || { kind: leak.badge || 'Fee', odds: 'Worth asking', next: 'Ask what it is for', why: 'A charge your bank or a company added on top of what you bought.', stop: 'Ask them what the fee is for and how to avoid it.', back: 'It never hurts to ask for a refund once.' };

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Penny the fee detective: each fee with why, how to stop it, can you get it back, and
// the buttons to act on it (Spooksworth's letter, a reminder to check next statement).
// focus: 'why' | 'stop' | 'back' shows only that answer for each fee (so each question
// gets its own reply); no focus shows all three.
export default function FeeCheck({ fees, onLetter, onTeamUp, focus = null }) {
  const { setDue } = useGoalTasks();
  const [showDetail, setShowDetail] = useState(Boolean(focus));
  const detailRef = useRef(null);
  // Tap a fee (or All fees) in the table: open the detail and scroll to it.
  const openDetail = (id, toggle = false) => {
    const next = toggle ? !showDetail : true;
    setShowDetail(next);
    if (!next) return;
    requestAnimationFrame(() => {
      const target = (id && detailRef.current?.querySelector(`[data-fee="${id}"]`)) || detailRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };
  if (!fees?.length) return null;
  const total = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const askable = fees.filter((f) => f.action && f.action !== 'cancel');
  const askTotal = askable.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const stopLines = [...new Set(fees.map((f) => typeOf(f).stop))].slice(0, 2);
  const col = focus === 'why' ? 'Why' : focus === 'stop' ? 'How to stop it' : 'Get it back?';
  return (
    <div className="mt-2 w-full">
      {/* 1. Everything in one table, so the numbers make sense at a glance. */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: `${PENNY}55` }}>
        <table className="w-full text-left text-[12.5px]">
          <thead style={{ background: `${PENNY}1a` }}>
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5 font-bold">Fee</th>
              <th className="px-2 py-1.5 font-bold">Charged</th>
              <th className="px-2 py-1.5 text-right font-bold">Total</th>
              <th className="px-2 py-1.5 font-bold">{col}</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((leak) => {
              const t = typeOf(leak);
              const times = leakRows(leak).length;
              return (
                <tr key={leak.id} onClick={() => openDetail(leak.id)} className="cursor-pointer border-t border-border align-top hover:bg-white/[0.04]" title="Tap for this fee in detail">
                  <td className="px-2 py-1.5"><span className="block font-bold text-foreground">{leak.title || leak.merchant}</span><span className="text-[11px] text-muted-foreground">{t.kind}</span></td>
                  <td className="px-2 py-1.5 text-foreground">{times ? `${times}×` : '-'}</td>
                  <td className="px-2 py-1.5 text-right font-bold text-foreground">{money(leak.amount)}</td>
                  <td className="px-2 py-1.5 text-foreground">{focus === 'why' ? t.why.split('.')[0] : focus === 'stop' ? t.next : <span className="font-bold" style={{ color: /Often/.test(t.odds) ? PENNY : undefined }}>{t.odds}</span>}</td>
                </tr>
              );
            })}
            <tr onClick={() => openDetail(null, true)} className="cursor-pointer border-t border-border hover:bg-white/[0.04]" style={{ background: `${PENNY}0d` }}>
              <td className="px-2 py-1.5 font-bold text-foreground" colSpan={2}>
                <button type="button" aria-expanded={showDetail} className="inline-flex items-center gap-1 font-bold text-foreground">
                  All fees <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
                </button>
                <span className="block text-[11px] font-semibold" style={{ color: PENNY }}>{showDetail ? 'Hide detail' : 'Tap for each fee in detail'}</span>
              </td>
              <td className="px-2 py-1.5 text-right font-bold text-foreground">{money(total)}</td>
              <td className="px-2 py-1.5 text-[11.5px] text-muted-foreground">{askable.length ? `${money(askTotal)} worth asking for` : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. What to do next, in order, with the team that helps. */}
      <div className="mt-2 rounded-xl border border-border bg-background/50 p-2.5 text-[13px]">
        <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PENNY }}>What to do next</p>
        <ol className="mt-1 list-decimal space-y-1 pl-4 text-foreground">
          {askable.length > 0 && <li>Ask for {money(askTotal)} back: Spooksworth writes {askable.length === 1 ? 'the letter' : askable.length === 2 ? 'both letters' : `all ${askable.length} letters`} to your bank.</li>}
          <li>Stop them coming back: {stopLines.join(' ')}</li>
          <li>Check your next statement in a month, and tick it off.</li>
        </ol>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {askable.length > 0 && (
            <button type="button" onClick={() => onLetter?.(askable[0])} className="rounded-full px-2.5 py-1 text-[12.5px] font-bold text-[#06231c]" style={{ background: PENNY }}>
              Write the {askable.length === 1 ? 'letter' : 'letters'}: Spooksworth →
            </button>
          )}
          {onTeamUp && <button type="button" onClick={() => onTeamUp(askable[0] || fees[0])} className="rounded-full border border-dashed border-white/30 px-2.5 py-1 text-[12.5px] font-bold text-foreground">👻 Team up on fees</button>}
        </div>
      </div>

      {/* 3. The detail for each fee, folded away until wanted. */}
      <details ref={detailRef} className="mt-2" open={showDetail} onToggle={(e) => setShowDetail(e.currentTarget.open)}>
        <summary className="cursor-pointer text-[12.5px] font-bold text-foreground">Each fee in detail</summary>
    <ul className="mt-2 w-full space-y-2">
      {fees.map((leak) => {
        const t = typeOf(leak);
        const check = { title: `👻 Check ${leak.title || leak.merchant} is gone`, details: 'Look at your new statement: is the fee still there? If so, ask again or use the waiver letter from Ghost Fees.', date: inDays(30) };
        return (
          <li key={leak.id} data-fee={leak.id} className="rounded-xl border p-2.5 text-[13.5px]" style={{ borderColor: `${PENNY}55`, background: `${PENNY}0d` }}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-bold text-foreground">{leak.title || leak.merchant}</p>
              <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">{money(leak.amount)}</span>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PENNY }}>{t.kind}</p>
            {(!focus || focus === 'why') && <p className="mt-1 text-foreground"><span className="font-bold">Why you pay it: </span>{t.why}</p>}
            {(!focus || focus === 'stop') && <p className="mt-0.5 text-foreground"><span className="font-bold">How to stop it: </span>{t.stop}</p>}
            {(!focus || focus === 'back') && <p className="mt-0.5 text-foreground"><span className="font-bold">Can you get it back? </span>{t.back}</p>}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {leak.action && leak.action !== 'cancel' && (
                <button type="button" onClick={() => onLetter?.(leak)} className="rounded-full px-2.5 py-1 text-[12.5px] font-bold text-[#06231c]" style={{ background: PENNY }}>
                  Get the {leak.action === 'refund' ? 'refund' : 'waiver'} letter: Spooksworth →
                </button>
              )}
              <a href={googleCalendarUrl(check)} target="_blank" rel="noreferrer" onClick={() => addGhostReminder({ goalId: leak.id, task: check, setDue })} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground hover:border-white/40">
                <CalendarPlus className="h-3.5 w-3.5" /> Check next statement
              </a>
            </div>
          </li>
        );
      })}
    </ul>
      </details>
    </div>
  );
}
