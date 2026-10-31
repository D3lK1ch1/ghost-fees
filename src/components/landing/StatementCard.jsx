import GhostMark from '@/components/site/GhostMark';

const ROWS = [
  { name: 'FitLife Gym', amount: '-$45.00', highlight: true },
  { name: 'StreamMax Premium', amount: '-$18.99' },
  { name: 'Monthly account fee', amount: '-$15.00' },
];

export default function StatementCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-10 -z-10 rounded-full bg-primary/[0.09] blur-3xl" />
      <div className="rounded-[1.75rem] border border-white/[0.08] bg-card/90 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white/70">statement.csv</span>
          <span className="text-muted-foreground">214 rows</span>
        </div>
        <div className="mt-4 space-y-2">
          {ROWS.map((row) => (
            <div
              key={row.name}
              className={
                row.highlight
                  ? 'flex items-center justify-between rounded-xl border border-primary/30 bg-primary/[0.06] px-3.5 py-2.5'
                  : 'flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5'
              }
            >
              <span className="text-[13px] font-medium text-white/90">{row.name}</span>
              <span className={row.highlight ? 'text-[13px] font-semibold text-[#ffb37c]' : 'text-[13px] text-muted-foreground'}>
                {row.amount}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>3 ghosts detected</span>
          <span className="text-primary">scan complete</span>
        </div>
      </div>
      <div className="absolute -top-10 right-3 animate-float">
        <GhostMark className="h-16 w-16 text-white drop-shadow-[0_0_28px_rgba(109,253,201,0.4)]" />
      </div>
    </div>
  );
}