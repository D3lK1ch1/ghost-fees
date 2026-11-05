import { cn } from '@/lib/utils';

// labels: optional display text per stored option (e.g. store 'Kinda', show 'Not sure').
export default function ChoiceGroup({ label, options, value, onChange, labels = {} }) {
  return (
    <div className="mt-5">
      <p className="text-[14px] font-medium text-white">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(active ? '' : option)}
              aria-pressed={active}
              className={cn(
                'rounded-xl border px-3.5 py-1.5 text-[14px] transition-colors',
                active
                  ? 'border-primary/60 bg-primary/15 font-semibold text-primary'
                  : 'border-white/[0.1] bg-white/[0.02] font-medium text-muted-foreground hover:border-white/25 hover:text-white',
              )}
            >
              {labels[option] || option}
            </button>
          );
        })}
      </div>
    </div>
  );
}