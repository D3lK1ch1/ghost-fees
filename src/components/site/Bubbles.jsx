import { cn } from '@/lib/utils';

// Speech and thought bubbles drawn in code: no image assets, no outlines, so
// every size stays crisp. Both are white shapes with a soft shadow, meant to
// sit next to a ghost on a dark card.

const TAILS = {
  left: 'M0 0 L26 0 C22 12 14 22 0 30 Z',
  right: 'M26 0 L0 0 C4 12 12 22 26 30 Z',
};

export function SpeechBubble({ children, side = 'left', className }) {
  return (
    <div className={cn('relative block w-fit max-w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.28)]', className)}>
      <div className="rounded-[20px] bg-white px-3.5 py-2 text-[12.5px] font-bold leading-snug text-[#14301f]">
        {children}
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 26 30"
        className={cn(
          'absolute -bottom-[9px] h-[14px] w-[13px] fill-white',
          side === 'right' ? 'right-5' : 'left-5',
        )}
      >
        <path d={TAILS[side === 'right' ? 'right' : 'left']} />
      </svg>
    </div>
  );
}

// Cloud body: the same white fill overlapping in bumps, so the ruffled edge
// reads as one shape. Two shrinking dots trail towards the speaker.
export function ThoughtBubble({ children, className, trail = 'right', tones = 'text-[#14301f]' }) {
  return (
    <div className={cn('relative block w-fit max-w-full', className)}>
      <div className="relative drop-shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
        <div className={cn('relative z-10 rounded-[24px] bg-white px-4 py-2.5 text-[13px] font-bold leading-snug', tones)}>
          {children}
        </div>
        <span aria-hidden="true" className="absolute -left-1.5 top-2 h-4 w-4 rounded-full bg-white" />
        <span aria-hidden="true" className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white" />
        <span aria-hidden="true" className="absolute -bottom-1 left-3 h-3.5 w-3.5 rounded-full bg-white" />
        <span aria-hidden="true" className="absolute -bottom-1 right-4 h-3 w-3 rounded-full bg-white" />
      </div>
      <span aria-hidden="true" className={cn('absolute -bottom-3 h-2.5 w-2.5 rounded-full bg-white/95', trail === 'left' ? 'left-5' : 'right-5')} />
      <span aria-hidden="true" className={cn('absolute -bottom-6 h-1.5 w-1.5 rounded-full bg-white/90', trail === 'left' ? 'left-2.5' : 'right-3')} />
    </div>
  );
}