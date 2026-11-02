import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCancelProof } from '@/components/results/ProofDialog';
import { useGhostList } from '@/hooks/use-ghost-list';
import { STATUSES } from '@/lib/ghostFees/ghostList';
import { money } from '@/lib/ghostFees/format';
import { planFor } from '@/lib/ghostFees/cancelPlans';

// The link in a "Cancel X" calendar event: /?done=<id>. Opens "I cancelled it"
// for that subscription straight away, even in a fresh tab with no scan loaded.
// If this browser doesn't know it, says so kindly and shows the Ghost List.
export default function DoneLink() {
  const [ghostList] = useGhostList();
  const proof = useCancelProof();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('done');
    if (!id) return;
    params.delete('done');
    const rest = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`);
    const known = planFor(id) || ghostList.find((item) => item.id === id);
    if (known) proof.ask({ id, merchant: known.merchant, monthly: known.monthly });
    else setMissing(true);
    // Read once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {proof.dialog}
      <Dialog open={missing} onOpenChange={(open) => !open && setMissing(false)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card text-foreground">
          <DialogTitle className="font-heading text-[20px]">We couldn&apos;t find that one here</DialogTitle>
          <p className="-mt-2 text-[14.5px] text-muted-foreground">Your Ghost List is kept in the browser you used. Open the link there, or tick it off from your list below.</p>
          {ghostList.length ? (
            <ul className="divide-y divide-white/[0.06] rounded-2xl border border-border px-3">
              {ghostList.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-[14.5px]">
                  <span className="truncate">{item.merchant} · {money(item.monthly)}/mo</span>
                  <span className="shrink-0 text-[13px] font-bold text-muted-foreground">{STATUSES[item.status] || item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-muted-foreground">Nothing on your Ghost List in this browser yet.</p>
          )}
          <button type="button" onClick={() => setMissing(false)} className="rounded-2xl bg-primary px-4 py-3 font-bold text-primary-foreground">OK</button>
        </DialogContent>
      </Dialog>
    </>
  );
}
