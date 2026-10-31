import { useEffect, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function CancelEmailDialog({ leak, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [leak]);

  const subject = `Please cancel: ${leak?.merchant || ''}`;
  const body = leak
    ? `Hi ${leak.merchant}, please cancel my subscription/charge of $${leak.monthly.toFixed(2)} effective immediately and confirm by email. Thanks.`
    : '';

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
  };

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={Boolean(leak)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg rounded-[1.5rem] border-white/10 bg-popover p-0">
        <div className="p-5 sm:p-6">
          <DialogTitle className="pr-8 text-lg font-semibold tracking-tight text-white">
            Cancel {leak?.merchant}
          </DialogTitle>

          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-black/30 p-4 text-[13px] leading-relaxed text-white/85">
            {body}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground transition-all hover:brightness-105"
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Copy className="h-4 w-4" strokeWidth={2.4} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={mailto}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-[14px] font-medium text-white transition-colors hover:border-white/30"
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