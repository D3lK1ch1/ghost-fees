// Ready-to-send emails (moved here from LeakEmailDialog so Spooksworth can send them too).
import { money, monthsLabel } from './format';

const longDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const SIGN_OFF = `Kind regards,
[Your name]
[Account or member number]`;

// Ready-to-send emails. Each one says what happened, why a refund is fair, exactly
// what we're asking for with a deadline and the polite next step if they say no.
// Every amount and date comes from the statement; the person can edit anything.
export function buildEmail(leak) {
  if (!leak) return { title: '', subject: '', body: '' };

  const wasted = (leak.rows || []).filter((row) => row.wasted);
  const dates = wasted.map((row) => row.date).sort();
  const span = dates.length > 1 ? `between ${longDate(dates[0])} and ${longDate(dates[dates.length - 1])}` : dates.length ? `on ${longDate(dates[0])}` : '';

  // One claim to your own bank for several ghost charges, ticked on the possessed
  // receipt. Banks can look into card charges from several companies at once.
  if (leak.claim) {
    const why = (item) => ({
      Duplicate: 'charged twice within a few days; the second charge is a duplicate.',
      'Trial converted': 'a free trial I did not mean to turn into a paid subscription.',
      'Price creep': 'the price went up from what I signed up for.',
      'Bank fee': 'fees on this account that I am asking you to refund.',
    }[item.badge] || 'a charge I am asking to have refunded.');
    const total = leak.claim.reduce((sum, item) => sum + item.amount, 0);
    const charges = (item) => (item.rows || []).filter((row) => row.wasted);
    const count = leak.claim.reduce((sum, item) => sum + charges(item).length, 0);
    return {
      title: `Ask your bank about ${count} ${count === 1 ? 'charge' : 'charges'}`,
      subject: `Request to review ${count} charges on my account (${money(total)})`,
      body: `Hi,

I'd like you to look into these charges on my account and refund what isn't owed:

${leak.claim.map((item) => `${item.title || item.merchant} (${money(item.amount)}): ${why(item)}
${charges(item).map((row) => `- ${longDate(row.date)}: ${money(row.wastedAmount || row.amount)}`).join('\n')}`).join('\n\n')}

Total: ${money(total)}

Please:
1. Review each charge and refund what isn't owed, or tell me how to dispute it.
2. Tell me if you need anything from me, such as cancellation emails or screenshots.
3. Confirm by email.

If we can't sort it out, I understand I can contact the Australian Financial Complaints Authority (AFCA).

${SIGN_OFF}`,
    };
  }

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
      ? `The price went up from ${money(rise.oldPrice)} to ${money(rise.newPrice)} a month and I don't want to keep paying the higher price.`
      : `I no longer use it and at ${money(leak.monthly || leak.amount)} a month it isn't worth keeping.`;
  return {
    title: `Cancel ${leak.merchant}`,
    subject: trial ? `Cancel and refund: ${leak.merchant} free trial` : `Please cancel my ${leak.merchant} subscription`,
    body: `Hi ${leak.merchant},

Please cancel my subscription, effective today.

Why: ${why}

Please:
1. Cancel it today so there are no further charges.
2. ${trial ? `Refund the ${money(leak.amount)} charged since the trial ended.` : 'Refund any charge taken after today and any unused part of the current period if your policy allows.'}
3. Confirm the cancellation by email.

${SIGN_OFF}`,
  };
}


// Open the email ready to send in the person's own mail. Nothing goes through Ghost Fees.
export const composeLinks = ({ subject, body }) => ({
  outlook: `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  mail: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
});
