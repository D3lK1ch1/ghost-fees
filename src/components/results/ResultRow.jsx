import { cn } from '@/lib/utils';

const TONES = {
  subscription: 'bg-[#2b2440] text-[#cbb8ff]',
  creep: 'bg-[#3a2a1f] text-[#ffb37c]',
  fee: 'bg-[#2f2a20] text-[#e3cda4]',
};

export default function ResultRow({ merchant, badge, tone = 'fee', meta, yearly, amount, dimmed, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-200 sm:p-5',
        dimmed ? 'opacity-45' : 'hover:border-white/[0.14]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white">{merchant}</h3>
            {badge && (
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', TONES[tone] || TONES.fee)}>
                {badge}
              </span>
            )}
          </div>
          {meta && <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{meta}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[1.35rem] font-semibold leading-none tabular-nums text-white">
            {yearly}
            <span className="text-[12px] font-normal text-muted-foreground">/yr</span>
          </div>
          {amount && <div className="mt-1.5 text-[12px] text-muted-foreground">{amount}</div>}
        </div>
      </div>
      {children && <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">{children}</div>}
    </div>
  );
}