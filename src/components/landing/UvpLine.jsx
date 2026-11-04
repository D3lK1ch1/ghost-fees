import { Check } from 'lucide-react';
import { openTypicalPrices } from '@/components/site/DataSafety';

// The one line a tester gets in 3 seconds (4 Nov plan): what we do, a real example,
// and the three reasons to trust it. Same words on every theme and on sign in.
export const UVP = 'Find the subscriptions you forgot. Cancel them in one click.';
export const UVP_EXAMPLE = 'Paying for Netflix and Stan and Disney+? We spot your double ups and say which to keep.';

export default function UvpLine({ align = 'center', className = '' }) {
  const left = align === 'left';
  return (
    <div className={`${left ? 'text-left' : 'mx-auto text-center'} max-w-xl ${className}`}>
      <p className="text-[19px] font-semibold leading-snug text-foreground sm:text-[21px]">{UVP}</p>
      <p className="mt-2 text-[15.5px] leading-snug text-muted-foreground">{UVP_EXAMPLE}</p>
      <ul className={`mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] font-semibold text-foreground ${left ? '' : 'justify-center'}`}>
        <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" aria-hidden="true" />$10 once, never monthly</li>
        <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" aria-hidden="true" />No bank login</li>
        <li>
          <button type="button" onClick={openTypicalPrices} className="inline-flex items-center gap-1.5 underline decoration-primary/60 underline-offset-4 hover:decoration-primary">
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />No upload needed
          </button>
        </li>
      </ul>
    </div>
  );
}
