import { THEME_LIST } from '@/lib/ghostFees/themes';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

// Small row of emoji buttons. Changes words and colours only.
export default function ThemeSwitcher() {
  const { theme, setThemeKey } = useTheme();
  return (
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
            'grid h-7 w-7 place-items-center rounded-full text-[15px] transition-colors',
            theme.key === item.key ? 'bg-primary/25 ring-1 ring-primary' : 'opacity-70 hover:opacity-100',
          )}
        >
          <span aria-hidden="true">{item.emoji}</span>
          <span className="sr-only">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
