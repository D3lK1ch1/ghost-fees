import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { xmasAvatar, xmasGhost } from '@/lib/ghostFees/christmasArt';
import { BADGE_MEANING } from '@/lib/ghostFees/leaks';
import { money } from '@/lib/ghostFees/format';
import '@/components/ex/exKit.css';
import './xmasKit.css';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { SEASON_KEY, SEASONS } from '@/lib/ghostFees/christmasArt';

// Shared pieces for every Ghosts of Christmas screen, from the design's CW (Winter)
// and CS (Summer) boards: the two palettes, the phone-sized screen with snow or
// fireflies, the gold buttons, the stocking and Tiny Savings.

const COMMON = {
  gold: '#f2c14e', goldDeep: '#c99a2e', red: '#e5484d', orange: '#ff9f40',
  mint: '#5ee6c8', mintInk: '#12302a', frost: '#eaf3ff', frostSoft: '#9fb3d6', ink: '#15131a', cream: '#f5f0e8',
};
export const PALETTES = {
  winter: { ...COMMON, bg: '#0d1f17', glow: '#1d3b2c', card: '#13291f', line: '#24433a', text: '#f5f0e8', muted: '#b9c9bf' },
  summer: { ...COMMON, bg: '#10172a', glow: '#22305a', card: '#1a2340', line: '#2c3a63', text: '#f6efe0', muted: '#b8c0d8' },
};

export function useSeason() {
  const [season, setSeason] = useSavedChoice(SEASON_KEY, SEASONS, 'winter');
  return { season, setSeason, X: PALETTES[season] || PALETTES.winter };
}

// Snow in Winter, warm fireflies in Summer. Decoration only.
export function Snow({ season, n = 18 }) {
  return Array.from({ length: n }, (_, i) => {
    const size = 2 + (i % 3);
    const summer = season === 'summer';
    return (
      <span
        key={i}
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full ${summer ? 'x-twinkle' : 'x-snow'}`}
        style={{
          left: `${(i * 37 + 11) % 100}%`,
          top: summer ? `${(i * 53 + 7) % 100}%` : -10,
          width: size,
          height: size,
          background: summer ? '#ffe3a3' : '#ffffff',
          boxShadow: summer ? '0 0 8px 2px rgba(255,227,163,0.6)' : 'none',
          opacity: summer ? 0.8 : 0.7,
          animationDuration: summer ? `${1.4 + (i % 5) * 0.4}s` : `${9 + (i * 3) % 7}s`,
          animationDelay: `${-(i * 1.3)}s`,
        }}
      />
    );
  });
}

export function XScreen({ X, season, children, className = '', snow = true, background }) {
  return (
    <div
      className={`x-root relative mx-auto flex w-full max-w-[390px] flex-col gap-3 overflow-hidden rounded-[30px] px-4 pb-4 pt-4 ${className}`}
      style={{ background: background || `radial-gradient(ellipse at 50% 0%, ${X.glow} 0%, ${X.bg} 62%)`, color: X.text, border: `1px solid ${X.line}`, boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}
    >
      {snow && <Snow season={season} />}
      {children}
    </div>
  );
}

export const Kicker = ({ X, children }) => (
  <div className="x-fredoka relative text-[14px] font-semibold tracking-[.1em]" style={{ color: X.gold }}>{children}</div>
);

export const Title = ({ children, size = 26 }) => (
  <h2 className="x-fredoka relative m-0 font-bold leading-[1.1]" style={{ fontSize: size }}>{children}</h2>
);

export function GoldButton({ children, onClick, href, className = '', X }) {
  const style = { background: X.gold, color: X.ink, boxShadow: '0 10px 30px -12px rgba(242,193,78,0.7)' };
  const cls = `x-btn x-fredoka relative flex min-h-[54px] w-full items-center justify-center rounded-2xl text-[17px] font-semibold ${className}`;
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls} style={style}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
}

export function LineButton({ children, onClick, X, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`x-btn relative flex min-h-[44px] w-full items-center justify-center rounded-xl text-[14px] font-extrabold ${className}`} style={{ border: `1.5px solid ${X.gold}`, color: X.text }}>
      {children}
    </button>
  );
}

// A ghost from the story with its gold name tag underneath, as in every stave.
export function Spirit({ src, name, alt = '', width = 140, X, className = '', about }) {
  return (
    <div className={`relative flex flex-none flex-col items-center ${className}`}>
      <img src={src} alt={alt} width={width} className="x-breathe block h-auto" style={{ width }} />
      <div className="x-fredoka mt-1 rounded-full px-2.5 py-1 text-center text-[13px] font-semibold leading-tight" style={{ background: 'rgba(0,0,0,.45)', border: `1px solid ${X.gold}`, color: X.gold }}>{name}</div>
      {about && <p className="mt-1 max-w-[170px] text-center text-[12.5px] leading-snug" style={{ color: X.muted }}>{about}</p>}
    </div>
  );
}

// The red stocking from stave three, filling with one gold coin per month paid.
export function Stocking({ coins = 12, X }) {
  return (
    <div className="relative h-[66px] w-16" aria-hidden="true">
      {Array.from({ length: Math.min(coins, 12) }, (_, i) => (
        <div key={i} className="x-coin absolute h-3.5 w-3.5 rounded-full" style={{ left: 14 + (i % 4) * 9, top: 30 - Math.floor(i / 4) * 8, background: X.gold, border: `2px solid ${X.goldDeep}`, animationDelay: `${1 + i * 0.25}s` }} />
      ))}
      <div className="absolute bottom-0 left-1.5 h-[50px] w-[50px]" style={{ background: X.red, borderRadius: '6px 6px 22px 6px', border: '2px solid #1a1a22' }}>
        <div className="absolute -left-0.5 -right-0.5 -top-0.5 h-3 rounded" style={{ background: X.cream, border: '2px solid #1a1a22' }} />
      </div>
    </div>
  );
}

// Tiny Savings, the little ghost with a jar of coins from "Changed my ways".
export function TinySavings({ X, size = 84, hop = 0 }) {
  return (
    <div className="flex flex-col items-center">
      <svg key={hop} className={hop ? 'x-hop' : ''} width={size} height={Math.round(size * 1.25)} viewBox="0 0 160 200" aria-hidden="true" style={{ overflow: 'visible' }}>
        <path d="M80 8C46 8 30 34 30 70V170Q38 182 46 170Q54 158 62 170Q71 182 80 170Q89 158 98 170Q106 182 114 170Q122 158 130 170V70C130 34 114 8 80 8Z" fill="#fbf8fa" stroke="#1a1a22" strokeWidth="3" />
        <circle cx="66" cy="48" r="4.5" fill="#1a1a22" /><circle cx="94" cy="48" r="4.5" fill="#1a1a22" />
        <circle cx="67.5" cy="46.5" r="1.4" fill="#fff" /><circle cx="95.5" cy="46.5" r="1.4" fill="#fff" />
        <path d="M72 60q8 7 16 0" stroke="#1a1a22" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M44 70 Q80 84 116 70 L118 80 Q80 96 42 80Z" fill="#e5484d" stroke="#1a1a22" strokeWidth="2.5" />
        <path d="M54 76l7 7M70 80l7 5M88 80l7 -2" stroke="#5ee6c8" strokeWidth="3.5" />
        <path d="M104 78 l8 22 l8 -3 l-6 -20" fill="#e5484d" stroke="#1a1a22" strokeWidth="2.5" />
        <rect x="50" y="96" width="60" height="64" rx="12" fill="rgba(230,240,255,.55)" stroke="#1a1a22" strokeWidth="3" />
        <rect x="54" y="90" width="52" height="12" rx="4" fill="#f2c14e" stroke="#1a1a22" strokeWidth="2.5" />
        <circle cx="68" cy="146" r="8" fill="#f2c14e" stroke="#c99a2e" strokeWidth="2" /><circle cx="88" cy="148" r="8" fill="#f2c14e" stroke="#c99a2e" strokeWidth="2" />
        <circle cx="78" cy="132" r="8" fill="#f2c14e" stroke="#c99a2e" strokeWidth="2" /><circle cx="94" cy="128" r="7" fill="#f2c14e" stroke="#c99a2e" strokeWidth="2" />
        <path d="M60 104v40" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
        <ellipse cx="44" cy="124" rx="11" ry="13" fill="#fbf8fa" stroke="#1a1a22" strokeWidth="2.5" />
        <ellipse cx="116" cy="124" rx="11" ry="13" fill="#fbf8fa" stroke="#1a1a22" strokeWidth="2.5" />
      </svg>
      <div className="x-fredoka mt-1 rounded-full px-2.5 py-1 text-[13px] font-semibold" style={{ background: 'rgba(0,0,0,.45)', border: `1px solid ${X.gold}`, color: X.gold }}>Tiny Savings</div>
    </div>
  );
}

export const Disclaimer = ({ X }) => (
  <div className="relative text-center text-[12.5px]" style={{ color: X.muted }}>General information about subscriptions, not financial advice.</div>
);

// A spirit with its own speech bubbles (the asset bubbles): the first comes out of
// its mouth and goes up and right, the second sits just under it. Both tails point
// back at the ghost. mouth: where the tail tip goes, as % of the picture (width x
// height). Bubbles never cover the eyes.
export function SpiritSays({ src, name, alt = '', width = 130, ratio = 1.3, mouth = [80, 40], lines = [], X, bubbleWidth = 220, about }) {
  // The ghost on the left; its bubbles sit beside it, starting at mouth height with the
  // tail pointing back at the mouth. The bubbles shrink to the space left, so they can
  // never run off the card.
  const height = Math.round(width * ratio);
  const top = Math.max(0, Math.round((mouth[1] / 100) * height) - 54);
  return (
    <div className="relative flex items-start gap-1">
      <div className="flex flex-none flex-col items-center" style={{ width }}>
        <img src={src} alt={alt} width={width} height={height} className="x-breathe block h-auto" style={{ width }} />
        <div className="x-fredoka mt-1 w-fit rounded-full px-2.5 py-1 text-center text-[13px] font-semibold leading-tight" style={{ background: 'rgba(0,0,0,.45)', border: `1px solid ${X.gold}`, color: X.gold }}>{name}</div>
        {about && <p className="mt-1 text-center text-[12.5px] leading-snug" style={{ color: X.muted, width: Math.max(width, 150) }}>{about}</p>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1" style={{ paddingTop: top }}>
        {lines.filter(Boolean).map((line, index) => (
          <div key={line} className="bub-l x-rise !min-w-0 text-[14.5px] font-semibold" style={{ width: '100%', maxWidth: bubbleWidth, animationDelay: `${0.3 + index * 0.6}s` }}>{line}</div>
        ))}
      </div>
    </div>
  );
}


// A festive ghost you can tap: a popup says who they are and what this kind of leak
// means. Bobs gently (x-bob); its box leaves room above so the bob never clips.
export function XmasGhostButton({ leak, season, size = 64, X, className = '', delay = 0 }) {
  const ghost = xmasGhost(leak.merchant);
  const meaning = BADGE_MEANING[leak.badge];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Who is ${ghost.name}?`} className={`group relative flex-none rounded-full focus:outline-none focus-visible:ring-2 ${className}`} style={{ '--tw-ring-color': X.gold }}>
          <img src={xmasAvatar(leak.merchant, season)} alt={ghost.name} width={size} height={size} className="x-bob block object-contain" style={{ width: size, height: size, animationDelay: `${delay}s` }} />
          <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black" style={{ background: X.gold, color: '#14301f' }}>?</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl border-2 p-4" style={{ background: '#fbf6ec', color: '#14301f', borderColor: X.gold }}>
        <div className="flex items-center gap-3">
          <img src={xmasAvatar(leak.merchant, season)} alt="" width={52} height={52} className="h-[52px] w-[52px] object-contain" />
          <div>
            <p className="text-[17px] font-black leading-tight">{ghost.name}</p>
            <p className="text-[13px] font-bold" style={{ color: '#c0392b' }}>{leak.badge} · {money(leak.amount)}</p>
          </div>
        </div>
        <p className="mt-2.5 text-[14px] leading-snug">{ghost.who}</p>
        {meaning && (
          <div className="mt-2.5 rounded-xl px-3 py-2 text-[13.5px] leading-snug" style={{ background: '#1f5c3a14' }}>
            <p><b>{leak.badge}:</b> {meaning.what}</p>
            <p className="mt-1"><b>What to do:</b> {meaning.todo}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
