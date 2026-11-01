import { THEME_LIST } from '@/lib/ghostFees/themes';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

// Labelled theme bar: a small rounded heading over emoji plus the theme name.
// Changes words and colours only.
export default function ThemeSwitcher() {
  const { theme, setThemeKey } = useTheme();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Theme</span>
      <div role="radiogroup" aria-label="Theme" className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1">
        {THEME_LIST.map((item) => (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={theme.key === item.key}
            title={item.label}
            onClick={() => setThemeKey(item.key)}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-full px-2 text-[12.5px] font-medium transition-colors',
              theme.key === item.key ? 'bg-primary/25 text-foreground ring-1 ring-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span aria-hidden="true" className="text-[15px] leading-none">{item.emoji}</span>
            <span className="whitespace-nowrap sr-only sm:not-sr-only sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}