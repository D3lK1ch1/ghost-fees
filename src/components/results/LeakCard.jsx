import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';

export default function LeakCard({ leak, onDraft }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white">{leak.merchant}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', BADGE_TONES[leak.badge])}>
              {leak.badge}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{leak.reason}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[1.35rem] font-semibold leading-none tabular-nums text-white">
            {moneyWhole(leak.yearly)}
            <span className="text-[12px] font-normal text-muted-foreground">/yr</span>
          </div>
          <div className="mt-1.5 text-[12px] text-muted-foreground">{money(leak.monthly)}/mo</div>
        </div>
      </div>

      <div className="mt-3.5 border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={onDraft}
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-[12.5px] font-medium text-white/90 transition-colors hover:border-primary/45 hover:text-primary"
        >
          <Mail className="h-3.5 w-3.5" />
          Draft cancel email
        </button>
      </div>
    </div>
  );
}