import { Check, Lock } from 'lucide-react';
import { openTypicalPrices } from '@/components/site/DataSafety';

// The one line a tester gets in 3 seconds (4 Nov plan): what we do, a real example,
// and the three reasons to trust it. Same words on every theme and on sign in.
// 4 Nov formatting pass: each sentence on its own line (no word left alone on a line),
// a short example, three equal ticks and a one-line trust note.
export const UVP = 'Find the subscriptions you forgot. Cancel them in one click.';
export const UVP_EXAMPLE = 'Netflix, Stan and Disney+? We spot the double ups and say which to keep.';

export default function UvpLine({ align = 'center', className = '' }) {
  const left = align === 'left';
  const tick = 'inline-flex items-center gap-1.5 whitespace-nowrap';
  return (
    <div className={`${left ? 'text-left' : 'mx-auto text-center'} max-w-xl ${className}`}>
      <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground sm:text-[22px]" style={{ textWrap: 'balance' }}>
        <span className="block">Find the subscriptions you forgot.</span>
        <span className="block text-primary">Cancel them in one click.</span>
      </p>
      <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted-foreground" style={{ textWrap: 'balance' }}>{UVP_EXAMPLE}</p>
      <ul className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-medium text-foreground/90 ${left ? '' : 'justify-center'}`}>
        <li className={tick}><Check className="h-4 w-4 text-primary" aria-hidden="true" />$10 once, never monthly</li>
        <li className={tick}><Check className="h-4 w-4 text-primary" aria-hidden="true" />No bank login</li>
        <li>
          <button type="button" onClick={openTypicalPrices} className={`${tick} hover:text-foreground`}>
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />No upload needed for the sample
          </button>
        </li>
      </ul>
      {/* Kingan (Tool Offer agent), 4 Nov: say plainly we never touch money. People decide. */}
      <p className={`mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground ${left ? '' : 'justify-center'}`}>
        <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        We never touch your bank, cards or accounts. You decide.
      </p>
    </div>
  );
}
