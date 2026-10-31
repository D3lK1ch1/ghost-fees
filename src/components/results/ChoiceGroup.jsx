import { cn } from '@/lib/utils';

export default function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="mt-5">
      <p className="text-[13px] font-medium text-white">{label}</p>
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
                'rounded-xl border px-3.5 py-1.5 text-[13px] transition-colors',
                active
                  ? 'border-primary/60 bg-primary/15 font-semibold text-primary'
                  : 'border-white/[0.1] bg-white/[0.02] font-medium text-muted-foreground hover:border-white/25 hover:text-white',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}