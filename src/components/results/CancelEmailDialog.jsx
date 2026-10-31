import { useEffect, useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { moneyWhole } from '@/lib/ghostFees/format';

export default function CancelEmailDialog({ subscription, onClose }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!subscription) return undefined;
    let alive = true;
    setEmail(null);
    setError('');
    setCopied(false);
    setLoading(true);

    base44.functions
      .invoke('draftCancelEmail', {
        merchant: subscription.merchant,
        amount: subscription.amount,
        frequency: subscription.frequencyLabel,
      })
      .then((response) => {
        if (!alive) return;
        const data = response?.data || {};
        if (data.subject && data.body) setEmail(data);
        else setError('We could not draft that email just now. Try again.');
      })
      .catch(() => {
        if (alive) setError('We could not draft that email just now. Try again.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [subscription]);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      setCopied(true);
    } catch {
      setError('Copying was blocked by your browser. Select the text and copy it manually.');
    }
  };

  return (
    <Dialog open={Boolean(subscription)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg rounded-[1.5rem] border-white/10 bg-popover p-0">
        <div className="p-5 sm:p-6">
          <div className="pr-8">
            <DialogTitle className="text-lg font-semibold tracking-tight text-white">
              Cancel {subscription?.merchant}
            </DialogTitle>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Saves you <span className="font-semibold text-primary">{moneyWhole(subscription?.yearlyCost || 0)} a year</span>
            </p>
          </div>

          <div className="mt-4 min-h-[190px] rounded-xl border border-white/[0.07] bg-black/30 p-4">
            {loading && (
              <div className="flex h-[158px] flex-col items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Writing your email…
              </div>
            )}

            {!loading && error && <p className="text-[13px] leading-relaxed text-[#ffb3b3]">{error}</p>}

            {!loading && email && (
              <div className="text-[12.5px] leading-relaxed text-white/85">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Subject</p>
                <p className="mt-1 font-medium text-white">{email.subject}</p>
                <div className="my-3 h-px bg-white/[0.08]" />
                <p className="whitespace-pre-wrap">{email.body}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={copy}
            disabled={!email}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-all duration-200 enabled:hover:brightness-105 disabled:opacity-40"
          >
            {copied ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Copy className="h-4 w-4" strokeWidth={2.4} />}
            {copied ? 'Copied' : 'Copy email'}
          </button>

          <p className="mt-3 text-center text-[11.5px] text-muted-foreground/70">
            Tip: keep their reply as proof you cancelled.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}