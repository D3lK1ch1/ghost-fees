import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';

export default function LeakCard({ leak, onDraft }) {
  return (
    <div className="rounded-3xl bg-[#f5f0e8] p-4 text-[#1b1233] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[17px] font-semibold">{leak.merchant}</h3>
          <span className={cn('mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[leak.badge])}>
            {leak.badge}
          </span>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-heading text-[1.7rem] font-bold leading-none tabular-nums">{money(leak.amount)}</div>
          <div className="mt-1.5 text-[12px] font-semibold text-[#5b5275]">{leak.caption}</div>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b5275]">{leak.reason}</p>

      {leak.cancelable && (
        <button
          type="button"
          onClick={onDraft}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1b1233]/70 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-[#1b1233] hover:text-[#f5f0e8]"
        >
          <Mail className="h-4 w-4" />
          Draft cancel email
        </button>
      )}
    </div>
  );
}