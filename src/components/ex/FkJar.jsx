import { useEffect, useMemo, useRef, useState } from 'react';
import './fkJar.css';

// The F**k-ex jar from the design (FkJar component). Fill = yearly money from
// blocked exes / yearly money from all exes, 54 coin spots from the bottom up.
// Blocking an ex drops 3 to 5 new coins 0.08 s apart; they spin, bounce and glint,
// and the amount counts up over 0.9 s. Full: sparkles around the jar.
const MONEY = (n) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const JAR = 'M30 32C15 34 10 44 10 58V128Q10 146 28 146H92Q110 146 110 128V58C110 44 105 34 90 32Z';

const SLOTS = (() => {
  const out = [];
  [136, 126, 116, 106, 96, 86, 76, 66, 56].forEach((y, r) => [24, 42, 60, 78, 96].forEach((x) => out.push([x + (r % 2 ? 6 : 0), y])));
  [[38, 47], [56, 46], [74, 47], [92, 49], [44, 38], [62, 37], [80, 38], [50, 28], [70, 28]].forEach((p) => out.push(p));
  return out.map(([x, y], i) => [x + ((i * 37) % 7) - 3, y + ((i * 53) % 5) - 2, ((i * 29) % 50) - 25]);
})();
const MAX = SLOTS.length;

function useCountUp(value, ms = 900) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      from.current = value;
      setShown(value);
      return undefined;
    }
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      setShown(start + (value - start) * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

export default function FkJar({ amount = 0, total = 0, size = 140 }) {
  const safeTotal = total > 0 ? total : 1;
  const amt = Math.max(0, Math.min(safeTotal, amount));
  const frac = amt / safeTotal;
  const n = amt <= 0 ? 0 : frac >= 0.999 ? MAX : Math.max(1, Math.round(frac * MAX));
  const shown = useCountUp(amt);

  // Which coins are new this render, so only they drop in.
  const seen = useRef(-1);
  const anim = useRef([]);
  const coins = useMemo(() => {
    if (seen.current < 0) {
      anim.current = SLOTS.map(() => ({}));
    } else if (n > seen.current) {
      const dropFrom = n - Math.min(5, n - seen.current);
      for (let i = seen.current; i < n; i += 1) {
        const d = (i - dropFrom) * 0.08;
        anim.current[i] = i >= dropFrom ? { cls: 'fj-drop', delay: d, spin: true, glint: d + 0.42 } : { cls: 'fj-in' };
      }
    } else if (n < seen.current) {
      for (let i = n; i < MAX; i += 1) anim.current[i] = {};
    }
    seen.current = n;
    return SLOTS.slice(0, n).map((s, i) => ({ s, i, ...anim.current[i] }));
  }, [n]);

  const full = n >= MAX;
  const word = n === 0 ? 'empty' : frac >= 0.999 ? 'full to the lid' : frac < 0.2 ? 'a little bit full' : frac < 0.45 ? 'about a third full' : frac < 0.7 ? 'about half full' : 'nearly full';
  const cap = Math.max(11, Math.round(size * 0.085));

  return (
    <div className="flex flex-col items-center" style={{ gap: Math.round(size * 0.03), color: '#fbf8fa', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <svg role="img" aria-label={`F**k-ex jar, ${MONEY(amt)} a year, ${word}`} width={size} height={Math.round((size * 164) / 148)} viewBox="-14 -12 148 164" className="block overflow-visible">
        <defs>
          <radialGradient id="fjGold" cx=".34" cy=".28" r=".8"><stop offset="0" stopColor="#fff7cf" /><stop offset=".3" stopColor="#ffd95e" /><stop offset=".72" stopColor="#eab02f" /><stop offset="1" stopColor="#b47c18" /></radialGradient>
          <clipPath id="fjCoinClip"><circle cx="0" cy="0" r="9" /></clipPath>
          <clipPath id="fjClip"><path d={JAR} /><rect x="31" y="20" width="58" height="14" /></clipPath>
        </defs>
        <ellipse cx="60" cy="149" rx="46" ry="5" fill="#000" opacity=".35" />
        <path d={JAR} fill="#fff" fillOpacity=".05" />
        <g clipPath="url(#fjClip)">
          {coins.map(({ s, i, cls, delay, spin, glint }) => (
            <g key={i} className={cls || ''} style={delay != null ? { animationDelay: `${delay.toFixed(2)}s` } : undefined}>
              <g transform={`translate(${s[0]} ${s[1]}) rotate(${s[2]})`}>
                <g className={spin ? 'fj-spin' : ''} style={delay != null ? { animationDelay: `${delay.toFixed(2)}s` } : undefined}>
                  <circle r="9" fill="url(#fjGold)" stroke="#a46f12" strokeWidth="1.4" />
                  <circle r="6.3" fill="none" stroke="#fff1b0" strokeWidth="1.1" opacity=".7" />
                  <text y="3.4" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontSize="9.5" fontWeight="700" fill="#8a5a0c">$</text>
                  <g clipPath="url(#fjCoinClip)"><g transform="skewX(-22)">
                    <rect className={i % 3 === 0 ? 'fj-shine' : ''} style={{ animationDelay: `${((i * 0.53) % 3.4).toFixed(2)}s` }} x="-17" y="-12" width="5" height="24" fill="#fffdf0" opacity=".9" />
                  </g></g>
                </g>
                {glint != null && <path className="fj-glint" style={{ animationDelay: `${glint.toFixed(2)}s` }} d="M7 -13l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#fffbe0" />}
              </g>
            </g>
          ))}
        </g>
        <rect x="30" y="20" width="60" height="13" rx="3" fill="#fff" fillOpacity=".05" stroke="#f4dfe4" strokeWidth="2.5" />
        <path d={JAR} fill="none" stroke="#f4dfe4" strokeWidth="3" />
        <path d="M18 62V120" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".28" />
        <path d="M24 50Q28 42 36 39" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".28" />
        <rect x="22" y="2" width="76" height="21" rx="7" fill="#ff6f7d" />
        <path d="M24 15H96" stroke="#e0505f" strokeWidth="2" />
        <rect x="30" y="6" width="22" height="4" rx="2" fill="#ffb8bf" />
        <rect x="21" y="74" width="78" height="36" rx="6" fill="#fbf8fa" stroke="#e9d9de" strokeWidth="1.5" />
        <text x="60" y="89" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontSize="13" fontWeight="700" fill="#15131a">F**K-EX</text>
        <text x="60" y="103" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontSize="11" fontWeight="600" letterSpacing=".6" fill="#d8475a">DOLLARS</text>
        {full && (
          <g fill="#fff3c4">
            <path className="fj-tw" d="M-4 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
            <path className="fj-tw" style={{ animationDelay: '.5s' }} d="M122 18l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
            <path className="fj-tw" style={{ animationDelay: '.9s' }} d="M126 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
            <path className="fj-tw" style={{ animationDelay: '1.2s' }} d="M60 -10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          </g>
        )}
      </svg>
      <div aria-hidden="true" style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: Math.round(size * 0.2), fontWeight: 700, lineHeight: 1, color: '#5ee6c8', textShadow: '0 0 18px rgba(94,230,200,0.45)' }}>{MONEY(shown)}</div>
      <div style={{ fontSize: cap, fontWeight: 800, color: '#d6d1db', whiteSpace: 'nowrap' }}>F**k-ex dollars a year</div>
      {n === 0 && <div style={{ fontSize: cap, fontWeight: 800, color: '#ffb8bf', whiteSpace: 'nowrap' }}>Block an ex to start</div>}
    </div>
  );
}
