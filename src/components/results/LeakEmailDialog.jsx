import { useEffect, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { buildEmail } from '@/lib/ghostFees/emailDraft';

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
      {/* Fits the screen: the title and buttons stay put and only the email scrolls, so
          Close, Copy and Open in Mail are always visible (a long fee email was taller than
          a laptop screen and hid them). */}
      <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] max-w-lg flex-col gap-0 rounded-[1.5rem] border-border bg-popover p-0 [&>button:last-child]:right-4 [&>button:last-child]:top-4 [&>button:last-child]:rounded-full [&>button:last-child]:bg-white/10 [&>button:last-child]:p-1.5 [&>button:last-child]:opacity-100">
        <div className="shrink-0 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="pr-8 font-heading text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          {leak && (
          <p className="mt-1.5 text-[14px] text-muted-foreground">
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          <p className="whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-4 text-[14px] leading-relaxed text-foreground/85">
            {body}
          </p>
        </div>

        <div className="shrink-0 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-2 gap-3">
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
          <button type="button" onClick={onClose} className="mt-2 w-full rounded-xl px-4 py-2 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}