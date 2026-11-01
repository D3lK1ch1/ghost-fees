// Small broomstick banner above the house: tells people the ghosts are hoverable
// and that the orange glow means the biggest fee. Words only, no numbers.
import { cn } from '@/lib/utils';

export default function HouseHint({ className }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-2xl border border-[#ffb347]/40 bg-[#ffb347]/[0.08] px-3 py-2 sm:gap-3 sm:px-4', className)}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 -rotate-[12deg]" aria-hidden="true">
        <path d="M21.4 2.6 12.2 11.8" stroke="#c99a5f" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M13.4 10.6 7.4 21.4c-.4.8.7 1.7 1.4 1l8.6-7.4z" fill="#ffcf73" stroke="#c98a1b" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M11.2 14.8l4.6 3.2M9.8 17.4l3.6 2.6" stroke="#c98a1b" strokeWidth="1" strokeLinecap="round" />
        <path d="M12.6 11.4l3.6 2.7" stroke="#8a5a00" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="min-w-0 text-[12px] font-semibold leading-snug text-[#f5e7d0] sm:text-[12.5px]">
        Hover over a ghost to see the fee ghosting you.
        <span className="ml-1 font-bold text-[#ffcf73]">Orange glow = your biggest fee.</span>
      </p>
    </div>
  );
}