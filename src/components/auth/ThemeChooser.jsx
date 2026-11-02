import { Check } from 'lucide-react';
import { THEME_LIST } from '@/lib/ghostFees/themes';
import { useTheme } from '@/lib/ThemeContext';

// The emoji sits in its own fixed box so a big glyph can never spill onto the
// label beside it. Changes words and colours only, never features or numbers.
function ThemeEmoji({ emoji, box }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center overflow-hidden leading-none ${box}`}>
      <span className="block leading-none">{emoji}</span>
    </span>
  );
}

// bar: the quick switch at the top of the sign-in card, so you choose your theme
// as you log in. cards: the bigger set on the sign-in pages, with each theme's line.
export default function ThemeChooser({ variant = 'bar' }) {
  const { theme, setThemeKey } = useTheme();

  if (variant === 'bar') {
    return (
      <div className="mb-5">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Your theme
        </p>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1.5">
          {THEME_LIST.map((item) => {
            const active = theme.key === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setThemeKey(item.key)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors ${active ? 'border-primary bg-primary/15' : 'border-border bg-background/40 hover:border-primary/60'}`}
              >
                <ThemeEmoji emoji={item.emoji} box="h-6 w-6 text-[16px]" />
                <span className="w-full truncate text-center text-[12px] font-bold leading-tight text-foreground">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Theme" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {THEME_LIST.map((item) => {
        const active = theme.key === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setThemeKey(item.key)}
            className={`rounded-2xl border-2 px-3 py-3 text-left transition-colors ${active ? 'border-primary bg-primary/15' : 'border-border bg-card/60 hover:border-primary/60'}`}
          >
            <span className="flex items-center gap-2">
              <ThemeEmoji emoji={item.emoji} box="h-7 w-7 text-[20px]" />
              <span className="min-w-0 text-[14.5px] font-bold leading-tight text-foreground">{item.label}</span>
            </span>
            <span className="mt-1.5 block text-[13px] leading-snug text-muted-foreground">{item.headline}</span>
            {active && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-primary">
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Your theme
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}