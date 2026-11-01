import { THEME_LIST } from '@/lib/ghostFees/themes';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

// Labelled theme bar: a small rounded heading over emoji plus the theme name.
// Changes words and colours only.
export default function ThemeSwitcher() {
  const { theme, setThemeKey } = useTheme();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-heading text-[10px] font-semibold uppercase leading-none tracking-[0.2em] text-muted-foreground">
        Theme
      </span>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex items-center gap-0.5 rounded-full border border-border/80 bg-card/60 p-1"
      >
        {THEME_LIST.map((item) => {
          const active = theme.key === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={active}
              title={item.label}
              onClick={() => setThemeKey(item.key)}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-full px-2 transition-colors sm:px-2.5',
                active
                  ? 'bg-primary/20 text-foreground ring-1 ring-primary/80'
                  : 'text-muted-foreground hover:bg-card/80 hover:text-foreground',
              )}
            >
              <span aria-hidden="true" className="text-[15px] leading-none">{item.emoji}</span>
              <span className="sr-only whitespace-nowrap text-[13px] font-semibold leading-none tracking-tight sm:not-sr-only sm:inline">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}