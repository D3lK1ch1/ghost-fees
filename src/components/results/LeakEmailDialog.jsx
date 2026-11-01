import { useEffect, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { money, monthsLabel } from '@/lib/ghostFees/format';

const longDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const SIGN_OFF = `Kind regards,
[Your name]
[Account or member number]`;

// Ready-to-send emails. Each one says what happened, why a refund is fair, exactly
// what we're asking for with a deadline, and the polite next step if they say no.
// Every amount and date comes from the statement; the person can edit anything.
function buildEmail(leak) {
  if (!leak) return { title: '', subject: '', body: '' };

  const wasted = (leak.rows || []).filter((row) => row.wasted);
  const dates = wasted.map((row) => row.date).sort();
  const span = dates.length > 1 ? `between ${longDate(dates[0])} and ${longDate(dates[dates.length - 1])}` : dates.length ? `on ${longDate(dates[0])}` : '';

  if (leak.targets) {
    const names = leak.targets.map((target) => target.merchant);
    const monthly = leak.targets.reduce((sum, target) => sum + (Number(target.monthly) || 0), 0);
    return {
      title: `Cancel ${names.join(' + ')}`,
      subject: `Please cancel: ${names.join(', ')}`,
      body: `Hi,

Please cancel these subscriptions on my account, effective today:
${leak.targets.map((target) => `- ${target.merchant}: ${money(target.monthly)} a month`).join('\n')}

Together they cost me ${money(monthly)} a month (${money(monthly * 12)} a year) and I no longer use them.

Please:
1. Cancel them today so there are no further charges.
2. Refund any charge taken after today.
3. Confirm the cancellation by email.

${SIGN_OFF}`,
    };
  }

  if (leak.action === 'refund') {
    const each = wasted[0]?.amount;
    return {
      title: `Refund request: ${leak.merchant}`,
      subject: `Refund request: duplicate charges of ${money(leak.amount)}`,
      body: `Hi ${leak.merchant},

I was charged twice for the same thing on these dates:
${wasted.map((row) => `- ${longDate(row.date)}: ${money(row.amount)} (duplicate)`).join('\n')}

Why I'm asking for a refund:
- Each time I agreed to one payment${each ? ` of ${money(each)}` : ''}, but it went through twice within a few days.
- The second charge is a duplicate, not something I bought or used.
- In total I've been overcharged ${money(leak.amount)}.

Please refund ${money(leak.amount)} to my original payment method within 14 days and confirm by email.

If it can't be refunded, please let me know why, as I'll otherwise ask my bank to dispute the duplicate charges.

${SIGN_OFF}`,
    };
  }

  if (leak.action === 'waive') {
    const late = /LATE|OVERDUE|DISHONOUR/i.test(`${leak.merchant} ${leak.title || ''}`);
    const reasons = late
      ? [
        '- This was a one-off. I have paid and want to keep my account in good standing.',
        `- The fee (${money(leak.amount)}) is large compared with the payment it relates to.`,
        '- I would appreciate a goodwill refund as a customer.',
      ]
      : [
        `- These fees add up to ${money(leak.amount)}${dates.length > 1 ? ` over ${wasted.length} months` : ''}, which is a lot for an everyday account.`,
        '- I would like to stay a customer, but not on an account that charges me every month.',
        '- Many banks offer fee-free everyday accounts, so I would like to be moved to one.',
      ];
    return {
      title: `Waive fees: ${leak.title || leak.merchant}`,
      subject: `Request to refund ${money(leak.amount)} in account fees`,
      body: `Hi,

I've been charged these fees on my account ${span}:
${wasted.map((row) => `- ${longDate(row.date)}: ${row.description} ${money(row.amount)}`).join('\n')}

Why I'm asking for a refund:
${reasons.join('\n')}

Please:
1. Refund the ${money(leak.amount)} in fees to this account within 14 days.
2. ${late ? 'Let me know how to avoid this fee in future (for example, a payment reminder or a later due date).' : 'Move me to a fee-free account, or tell me how to avoid this fee.'}
3. Confirm by email.

If you can't help, please let me know how to make a complaint. I understand I can contact the Australian Financial Complaints Authority (AFCA) if we can't sort it out.

${SIGN_OFF}`,
    };
  }

  // Cancel: trial that turned paid, a price rise, or a subscription you don't use.
  const trial = /trial/i.test(leak.badge || '');
  const rise = leak.priceRise;
  const why = trial
    ? `I signed up for a free trial and did not mean for it to turn into a paid subscription. Since the trial ended I've been charged ${money(leak.amount)}.`
    : rise
      ? `The price went up from ${money(rise.oldPrice)} to ${money(rise.newPrice)} a month, and I don't want to keep paying the higher price.`
      : `I no longer use it, and at ${money(leak.monthly || leak.amount)} a month it isn't worth keeping.`;
  return {
    title: `Cancel ${leak.merchant}`,
    subject: trial ? `Cancel and refund: ${leak.merchant} free trial` : `Please cancel my ${leak.merchant} subscription`,
    body: `Hi ${leak.merchant},

Please cancel my subscription, effective today.

Why: ${why}

Please:
1. Cancel it today so there are no further charges.
2. ${trial ? `Refund the ${money(leak.amount)} charged since the trial ended.` : 'Refund any charge taken after today, and any unused part of the current period if your policy allows.'}
3. Confirm the cancellation by email.

${SIGN_OFF}`,
  };
}

export default function LeakEmailDialog({ leak, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [leak]);

  const { title, subject, body } = buildEmail(leak);

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
  };

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={Boolean(leak)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg rounded-[1.5rem] border-border bg-popover p-0">
        <div className="p-5 sm:p-6">
          <DialogTitle className="pr-8 font-heading text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          {leak && (
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {leak.badge === 'Subscription' ? (
              <>Cancelling this frees up <span className="font-bold text-primary">{money(leak.monthly)}</span> a month. Edit anything before you send.</>
            ) : (
              <>
                Fixing this saves <span className="font-bold text-primary">{money(leak.amount)}</span>
                {leak.months ? ` (found in ${monthsLabel(leak.months)} months)` : ''}. Edit anything before you send.
              </>
            )}
          </p>
          )}

          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-4 text-[13px] leading-relaxed text-foreground/85">
            {body}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground transition-all hover:brightness-105"
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Copy className="h-4 w-4" strokeWidth={2.4} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={mailto}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-[14px] font-bold text-foreground transition-colors hover:border-primary/50"
            >
              <Mail className="h-4 w-4" />
              Open in Mail
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}