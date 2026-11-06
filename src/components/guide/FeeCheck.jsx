import { CalendarPlus } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { googleCalendarUrl } from '@/lib/ghostFees/reminder';

const PENNY = '#5ee6c8';

// What the statement can't tell you about a fee: why you're charged it, how to stop it,
// and whether you can get it back. General guidance about common fee types, no product
// names and no numbers beyond the statement's own.
const FEE_TYPES = [
  { match: /monthly|account (keeping )?fee|maintenance|service fee|account fee/i, kind: 'Account-keeping fee',
    why: 'A flat monthly charge for having the account. Many everyday accounts charge nothing, or waive it if you meet a condition like a monthly deposit.',
    stop: 'Ask your bank what makes the fee go away, or whether they have a fee-free everyday account you can move to.',
    back: 'Worth asking: banks often refund recent account fees when you ask politely.' },
  { match: /late|overdue/i, kind: 'Late payment fee',
    why: 'Charged when a payment (often a credit card or bill minimum) lands after the due date.',
    stop: 'Set up an automatic payment for at least the minimum, or a reminder 3 days before the due date.',
    back: 'A first late fee is often refunded if you ask and you are usually on time.' },
  { match: /overdra|dishonou?r|overdrawn|insufficient|returned/i, kind: 'Overdrawn / dishonour fee',
    why: 'Charged when a payment goes out and there is not enough money in the account.',
    stop: 'Turn on a low-balance alert in your bank app, and move direct debits to just after payday.',
    back: 'Ask, especially if it happened once. Banks can refund these.' },
  { match: /atm|withdrawal/i, kind: 'ATM fee',
    why: 'Charged for using another bank\'s ATM, or an ATM overseas.',
    stop: 'Use your own bank\'s ATMs, or take cash out at the checkout when you shop.',
    back: 'Rarely refunded, so this one is about avoiding it next time.' },
  { match: /foreign|international|overseas|\bfx\b|currency|conversion/i, kind: 'Foreign transaction fee',
    why: 'A percentage added when you pay in another currency, including some overseas online shops.',
    stop: 'Check your card\'s foreign fee before you travel or shop overseas sites, and pay in the local currency when asked.',
    back: 'Usually not refunded, so plan the card you use next time.' },
  { match: /interest|cash advance/i, kind: 'Interest / cash advance',
    why: 'Charged when a card balance is not paid in full, or when you take cash out on a credit card.',
    stop: 'Pay the full balance by the due date where you can, and avoid cash out on a credit card.',
    back: 'Interest is rarely refunded, but ask if it came from a mistake.' },
  { match: /surcharge|card fee|merchant fee/i, kind: 'Card surcharge',
    why: 'Some shops add a fee for paying by card.',
    stop: 'Ask if another way to pay has no surcharge, or pay where none is charged.',
    back: 'Ask the shop if the surcharge looked higher than the card actually costs them.' },
];
const typeOf = (leak) => FEE_TYPES.find((t) => t.match.test(`${leak.title || ''} ${leak.merchant || ''} ${leak.badge || ''}`))
  || { kind: leak.badge || 'Fee', why: 'A charge your bank or a company added on top of what you bought.', stop: 'Ask them what the fee is for and how to avoid it.', back: 'It never hurts to ask for a refund once.' };

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Penny the fee detective: each fee with why, how to stop it, can you get it back, and
// the buttons to act on it (Spooksworth's letter, a reminder to check next statement).
export default function FeeCheck({ fees, onLetter }) {
  if (!fees?.length) return null;
  return (
    <ul className="mt-2 w-full space-y-2">
      {fees.map((leak) => {
        const t = typeOf(leak);
        const check = { title: `👻 Check ${leak.title || leak.merchant} is gone`, details: 'Look at your new statement: is the fee still there? If so, ask again or use the waiver letter from Ghost Fees.', date: inDays(30) };
        return (
          <li key={leak.id} className="rounded-xl border p-2.5 text-[13.5px]" style={{ borderColor: `${PENNY}55`, background: `${PENNY}0d` }}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-bold text-foreground">{leak.title || leak.merchant}</p>
              <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">{money(leak.amount)}</span>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PENNY }}>{t.kind}</p>
            <p className="mt-1 text-foreground"><span className="font-bold">Why you pay it: </span>{t.why}</p>
            <p className="mt-0.5 text-foreground"><span className="font-bold">How to stop it: </span>{t.stop}</p>
            <p className="mt-0.5 text-foreground"><span className="font-bold">Can you get it back? </span>{t.back}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {leak.action && leak.action !== 'cancel' && (
                <button type="button" onClick={() => onLetter?.(leak)} className="rounded-full px-2.5 py-1 text-[12.5px] font-bold text-[#06231c]" style={{ background: PENNY }}>
                  Get the {leak.action === 'refund' ? 'refund' : 'waiver'} letter: Spooksworth →
                </button>
              )}
              <a href={googleCalendarUrl(check)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground hover:border-white/40">
                <CalendarPlus className="h-3.5 w-3.5" /> Check next statement
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
