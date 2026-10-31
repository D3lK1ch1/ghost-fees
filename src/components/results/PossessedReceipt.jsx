import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Always "05 Jun" so dates never wrap onto two lines.
function rowDate(value) {
  const [, month, day] = String(value).split('-');
  return MONTHS[Number(month) - 1] ? `${day} ${MONTHS[Number(month) - 1]}` : value;
}

const ALL = 'all';

// The printed charges of one leak, on paper that has clearly seen things.
export default function PossessedReceipt({ leaks }) {
  const receipts = leaks.filter((leak) => (leak.rows || []).length > 1);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  if (!receipts.length) return null;

  const showAll = !activeId || activeId === ALL;
  const active = showAll ? null : receipts.find((leak) => leak.id === activeId) || receipts[0];
  const rows = active ? active.rows || [] : [];
  const printed = active ? rows.reduce((sum, row) => sum + row.amount, 0) : leaks.reduce((sum, leak) => sum + leak.amount, 0);
  // Several statements: one section per bank and file, each with its own subtotal.
  const groups = [];
  rows.forEach((row) => {
    const label = row.source || 'Your statement';
    const group = groups.find((item) => item.label === label);
    if (group) group.rows.push(row);
    else groups.push({ label, rows: [row] });
  });
  const grouped = groups.length > 1;
  const sources = new Set(leaks.flatMap((leak) => (leak.rows || []).map((row) => row.source).filter(Boolean))).size;

  return (
    <>
      <section className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#4a3770] bg-[#231838] px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-retro text-[15px] uppercase tracking-[0.18em] text-primary/80">Possessed receipt</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Every charge behind a ghost, printed on paper that refuses to die.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13.5px] font-bold text-primary-foreground transition-all hover:brightness-105"
        >
          <Receipt className="h-4 w-4" />
          Open the receipt
        </button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[1.5rem] border-[#4a3770] bg-[#1b1230] p-0">
          <div className="p-4 sm:p-5">
            <DialogTitle className="pr-8 font-heading text-lg font-semibold text-foreground">
              The possessed receipt
            </DialogTitle>

            {receipts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveId(ALL)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11.5px] font-bold transition-colors',
                    showAll ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  All ghosts
                </button>
                {receipts.map((leak) => (
                  <button
                    key={leak.id}
                    type="button"
                    onClick={() => setActiveId(leak.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11.5px] font-bold transition-colors',
                      leak.id === active?.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {leak.title || leak.merchant}
                  </button>
                ))}
              </div>
            )}

            <div className="relative mt-4">
              <div className="max-h-[52vh] overflow-y-auto bg-[#f6efe1] px-4 py-5 font-mono text-[12.5px] text-[#1b1233] sm:px-5">
                <p className="text-center font-retro text-[21px] uppercase tracking-[0.22em]">Possessed receipt</p>
                <p className="mt-1 text-center text-[10.5px] uppercase tracking-[0.18em] text-[#7a6f8f]">
                  {active ? active.badge : `${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'}`}
                </p>
                <p className="mt-3 text-center text-[13px] font-bold">{active ? active.title || active.merchant : 'Every ghost charge'}</p>

                <div className="my-3 border-t border-dashed border-[#1b1233]/30" />

                {showAll ? (
                  leaks.map((leak) => {
                    const wasted = (leak.rows || []).filter((row) => row.wasted);
                    return (
                      <div key={leak.id} className="mb-3">
                        <p className="mb-1 flex items-baseline justify-between border-b border-[#1b1233]/20 pb-1 text-[11px] font-bold uppercase tracking-[0.1em]">
                          <span className="truncate">{leak.title || leak.merchant} · {leak.badge}</span>
                          <span className="shrink-0 tabular-nums">{money(leak.amount)}</span>
                        </p>
                        <ul className="space-y-1">
                          {wasted.map((row, index) => (
                            <li key={`${row.date}-${index}`} className="flex items-baseline gap-2">
                              <span className="w-[52px] shrink-0 whitespace-nowrap text-[#7a6f8f]">{rowDate(row.date)}</span>
                              <span className="min-w-0 flex-1 truncate">
                                {row.description}
                                {row.source && sources > 1 && <span className="block truncate text-[10px] text-[#7a6f8f]">{row.source}</span>}
                              </span>
                              <span className="shrink-0 font-bold tabular-nums">{money(row.wastedAmount || row.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <>
                  {groups.map((group) => (
                    <div key={group.label} className={cn(grouped && 'mb-3')}>
                      {grouped && (
                        <p className="mb-1.5 flex items-baseline justify-between border-b border-[#1b1233]/20 pb-1 text-[11px] font-bold uppercase tracking-[0.12em]">
                          <span className="truncate">{group.label}</span>
                          <span className="shrink-0 tabular-nums">{money(group.rows.reduce((sum, row) => sum + row.amount, 0))}</span>
                        </p>
                      )}
                      <ul className="space-y-1.5">
                        {group.rows.map((row, index) => (
                          <li key={`${row.date}-${index}`} className="flex items-baseline gap-2">
                            <span className="w-[52px] shrink-0 whitespace-nowrap text-[#7a6f8f]">{rowDate(row.date)}</span>
                            <span className="min-w-0 flex-1 truncate">{row.description}</span>
                            <span className={cn('shrink-0 tabular-nums', row.wasted && 'font-bold')}>
                              {money(row.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  </>
                )}

                <div className="my-3 border-t border-dashed border-[#1b1233]/30" />

                <div className="flex items-baseline justify-between font-bold">
                  <span>{showAll ? 'Ghost total' : 'Printed total'}</span>
                  <span className="tabular-nums">{money(printed)}</span>
                </div>

                <p className="mt-3 text-center text-[10.5px] leading-relaxed text-[#7a6f8f]">
                  Copied from your own statement. Nothing here is estimated.
                </p>
              </div>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 right-1 rotate-[-12deg] rounded border-2 border-[#b03a2e] px-2 py-0.5 font-retro text-[17px] uppercase tracking-[0.16em] text-[#b03a2e] opacity-70"
              >
                Ghosted
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}