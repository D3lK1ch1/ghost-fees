import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Shown when the free scan is used up.
export default function Paywall({ open, onClose, signedIn, onSample }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card">
        <DialogTitle className="font-heading text-[20px]">You've used your free scan</DialogTitle>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Unlimited scans and every cancel tool: $5 once for the first 50 founding members, then $10 once. Never a subscription.
        </p>
        {signedIn ? (
          <p className="rounded-2xl bg-primary/10 px-3 py-2 text-[14px] text-foreground">Payments open this week. We'll email you when you can unlock.</p>
        ) : (
          <Link to="/login" className="block rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground">
            Sign in
          </Link>
        )}
        <button type="button" onClick={onSample} className="mt-1 text-[13px] font-bold text-primary underline-offset-4 hover:underline">
          Try the sample statement instead (always free)
        </button>
      </DialogContent>
    </Dialog>
  );
}
