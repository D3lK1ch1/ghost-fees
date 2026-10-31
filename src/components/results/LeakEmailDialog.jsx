import { useEffect, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { money } from '@/lib/ghostFees/format';

const longDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

function buildEmail(leak) {
  if (!leak) return { title: '', subject: '', body: '' };

  const wasted = (leak.rows || []).filter((row) => row.wasted);

  if (leak.action === 'refund') {
    return {
      title: `Refund request: ${leak.merchant}`,
      subject: `Duplicate charges: ${leak.merchant}`,
      body: `Hi ${leak.merchant},

I was charged twice for the same thing on these dates:
${wasted.map((row) => `- ${longDate(row.date)}: ${money(row.amount)}`).join('\n')}

Please refund the duplicate ${money(leak.amount)} to my original payment method and confirm by email.

Thanks.`,
    };
  }

  if (leak.action === 'waive') {
    return {
      title: `Waive fees: ${leak.merchant}`,
      subject: 'Request to refund account fees',
      body: `Hi,

I've been charged these fees on my account:
${wasted.map((row) => `- ${longDate(row.date)}: ${row.description} ${money(row.amount)}`).join('\n')}

Could you please refund these fees? I'd also like to know whether there's a no-fee account that would suit me.

Thanks.`,
    };
  }

  return {
    title: `Cancel ${leak.merchant}`,
    subject: `Please cancel: ${leak.merchant}`,
    body: `Hi ${leak.merchant}, please cancel my subscription/charge of ${money(leak.monthly)} effective immediately and confirm by email. Thanks.`,
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