import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { biasGroups } from '@/lib/ghostFees/leaks';
import { money } from '@/lib/ghostFees/format';

// One animated icon per pattern. Drawn art lives at public/patterns/<key>.png (the simple
// bias icons from the GoldMind app's Learn tab); patterns without a PNG show the animated emoji.
export const PATTERN_ICONS = {
  present_bias: { emoji: '⏳', anim: 'px-tilt', tint: '#c4b5fd' },
  denomination: { emoji: '🪙', anim: 'px-spin', tint: '#fcd34d' },
  status_quo: { emoji: '🛋️', anim: 'px-bob', tint: '#93c5fd' },
  ostrich: { emoji: '🙈', anim: 'px-peek', tint: '#fda4af' },
  mental_accounting: { emoji: '🫙', anim: 'px-wiggle', tint: '#86efac' },
  pain_of_paying: { emoji: '💳', anim: 'px-pulse', tint: '#fdba74' },
};

const HAS_ART = new Set(['present_bias', 'denomination', 'status_quo', 'ostrich', 'mental_accounting']);

function PatternIcon({ patternKey }) {
  const icon = PATTERN_ICONS[patternKey] || { emoji: '🧠', anim: 'px-bob', tint: '#c4f06c' };
  const [img, setImg] = useState(HAS_ART.has(patternKey));
  // The GoldMind icon sits bigger on a light tile with a gentle
  // bob; the emoji fallback keeps its own little animation.
  return img ? (
    <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5" aria-hidden="true">
      <img src={`/patterns/${patternKey}.png`} alt="" className="px-bob h-full w-full object-contain" onError={() => setImg(false)} />
    </span>
  ) : (
    <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl" style={{ background: `${icon.tint}26` }} aria-hidden="true">
      <span className={`inline-block text-[34px] ${icon.anim}`}>{icon.emoji}</span>
    </span>
  );
}

// "4 money patterns behind these ghosts": each pattern with how it shows up in YOUR
// charges (the ghosts it's behind and what they cost), then the full tab.
export default function PatternsPopup({ open, onOpenChange, leaks, onSeeAll }) {
  const groups = biasGroups(leaks || []);
  const nameOf = (id) => { const leak = leaks.find((item) => item.id === id); return leak ? leak.title || leak.merchant : null; };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogTitle className="font-heading text-[19px]">🧠 Why these ghosts happen</DialogTitle>
        <p className="-mt-1 text-[13.5px] text-muted-foreground">{groups.length} common money {groups.length === 1 ? 'pattern' : 'patterns'} behind your charges. Most people have them.</p>
        <ul className="mt-1 space-y-2.5">
          {groups.map((group, i) => {
            const names = group.leakIds.map(nameOf).filter(Boolean);
            return (
              <li key={group.key} className="pop-in flex gap-3 rounded-xl border border-border bg-background/60 p-3" style={{ animationDelay: `${i * 120}ms` }}>
                <PatternIcon patternKey={group.key} />
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-heading text-[15px] font-bold text-foreground">{group.bias}</p>
                    <span className="shrink-0 text-[13px] font-bold text-foreground">{money(group.total)}</span>
                  </div>
                  <p className="text-[13px] leading-snug text-muted-foreground">{group.line}</p>
                  <p className="mt-1 text-[12.5px] text-foreground"><span className="font-semibold">In your fees: </span>{names.slice(0, 3).join(', ')}{names.length > 3 ? ` +${names.length - 3} more` : ''}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => { onOpenChange(false); onSeeAll?.(); }} className="mt-1 w-full rounded-full bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-foreground">
          See the research and one habit to beat each →
        </button>
      </DialogContent>
    </Dialog>
  );
}
