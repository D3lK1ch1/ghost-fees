import { Check, Lock } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import BrandHeader from '@/components/site/BrandHeader';

function stepLabels(transactionCount, fileCount) {
  return [
    transactionCount ? `Read ${transactionCount} transactions` : 'Reading your statement',
    'Spotted repeat charges',
    'Checking for price creep',
    fileCount > 1 ? `Merging ${fileCount} statements` : 'Totalling your leak',
  ];
}

export default function ScanningScreen({ steps, progress, transactionCount, fileCount, onCancel }) {
  const labels = stepLabels(transactionCount, fileCount);

  return (
    <div className="min-h-screen">
      <BrandHeader
        right={(
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-white"
          >
            Cancel
          </button>
        )}
      />

      <main className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pb-20 pt-6 text-center sm:px-8">
        <div className="animate-float">
          <GhostMark className="h-16 w-16 text-white drop-shadow-[0_0_30px_rgba(109,253,201,0.45)]" />
        </div>

        <div className="mt-6 w-full rounded-2xl border border-white/[0.09] bg-card/80 p-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>your statements</span>
            <span>{transactionCount ? `${transactionCount} rows` : 'reading…'}</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/[0.05] px-3 py-2.5">
            <span className="text-[13px] font-medium text-white">FitLife Gym</span>
            <span className="text-[13px] font-semibold text-[#ffb37c]">-$45.00</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-white">Hunting ghosts…</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">Usually takes about 10 seconds.</p>

        <ul className="mt-8 w-full space-y-3 text-left">
          {labels.map((label, index) => {
            const state = steps[index] || 'pending';
            return (
              <li key={label} className="flex items-center gap-3">
                {state === 'done' && (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </span>
                )}
                {state === 'active' && (
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                )}
                {state === 'pending' && <span className="h-5 w-5 shrink-0 rounded-full border border-white/15" />}
                <span className={state === 'pending' ? 'text-[13.5px] text-muted-foreground/60' : 'text-[13.5px] text-white/90'}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 flex items-center justify-center gap-2 text-[12px] text-muted-foreground/70">
          <Lock className="h-3 w-3" />
          Your file stays private. We only read dates, merchants and amounts.
        </p>
      </main>
    </div>
  );
}