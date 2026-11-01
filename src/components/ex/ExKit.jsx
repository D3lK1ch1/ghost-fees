import './exKit.css';

// Pieces shared by every My Ex Ghosted Me screen, ported from the Claude Design
// canvas: colours, the GhostPal character, twinkling stars with rising motes, the
// cartoon bubbles and the two button styles.

export const C = {
  bg: '#15131a',
  bar: '#1b1921',
  barLine: '#2f2b38',
  card: '#221f29',
  line: '#34303e',
  coral: '#ff6f7d',
  coralDeep: '#e0505f',
  coralSoft: '#ffb8bf',
  mint: '#5ee6c8',
  mintInk: '#12302a',
  text: '#fbf8fa',
  soft: '#d6d1db',
  muted: '#bdb7c6',
  faint: '#9f99ab',
};

const ART = '/themes/ex';

// Which art each pick shows for each mood, exactly as GhostPal maps it in the design.
const SKINS = {
  heartbroken: { sad: 'ghost-sad', focused: 'ghost-focused', shocked: 'ghost-shocked', sassy: 'ghost-sassy', power: 'ghost-sassy', happy: 'ghost-happy', idle: 'pink-phone', dinner: 'ghost-dinner' },
  fine: { sad: 'men-couch', focused: 'men-shaker', shocked: 'men-shock', sassy: 'men-block', power: 'men-lift', happy: 'men-footy', idle: 'men-cap', dinner: 'men-bbqshades' },
};

// Where the mouth is in each art file, as % of the GhostPal box (art is drawn
// object-contain, bottom-aligned, in a width x 1.15 width box). Used by atMouth.
const MOUTHS = {
  'men-block': [54, 34],
  'ghost-sassy': [51, 45],
};
// Where each speech bubble's tail tip is, as % of the bubble (bottom edge).
const TAIL_X = { l: 9.4, r: 86.4 };

const MOTION = { float: 'ex-float', dance: 'ex-dance', shock: 'ex-shock', breathe: 'ex-breathe' };

// bubble: optional speech bubble that sits inside the ghost's animation, so it
// bobs and dances along, with its tail at the mouth. side: 'right' puts it to the
// right of the ghost (tail pointing left), 'left' to the left (tail pointing right).
// atMouth: put the tail tip exactly on the mouth (art listed in MOUTHS), using a
// tailed speech bubble.
export function GhostPal({ pickKey = 'heartbroken', mood = 'sad', width = 140, motion = 'float', speed = 3.4, drift = 7, className, style, bubble, side = 'right', kind, bubbleWidth = 150, bubbleDelay = '.6s', bubbleClass = '', atMouth = false }) {
  const file = (SKINS[pickKey] || SKINS.heartbroken)[mood] || SKINS.heartbroken.sad;
  const bubbleKind = kind || (side === 'right' ? 'l' : 'r');
  return (
    <div className={`ex-ghost relative flex flex-none ${className || ''}`} style={{ '--gd': `${drift}s`, '--gdx': '6px', ...style }}>
      <div className="ex-wig relative">
        <div className={MOTION[motion] || ''} style={{ '--gs': `${speed}s` }}>
          <div className="relative" style={{ width, height: Math.round(width * 1.15), filter: 'drop-shadow(0 0 16px rgba(255,170,200,0.25))' }}>
            <div className="gp-shadow absolute rounded-[50%]" aria-hidden="true" style={{ left: '22%', right: '22%', bottom: '-4%', height: '7%', background: 'rgba(0,0,0,0.38)', filter: 'blur(2px)' }} />
            <img src={`${ART}/${file}.webp`} alt="" className="relative block h-full w-full object-contain object-bottom" />
            {bubble && atMouth && MOUTHS[file] && (
              <div
                className="pointer-events-none absolute z-10"
                style={{ left: `calc(${MOUTHS[file][0]}% ${side === 'right' ? '+ 4px' : '- 4px'})`, top: `calc(${MOUTHS[file][1]}% - 4px)`, transform: `translate(-${TAIL_X[side === 'right' ? 'l' : 'r']}%, -100%)` }}
              >
                <div
                  className={`bub-${side === 'right' ? 'l' : 'r'} ex-in !min-w-0 font-extrabold leading-tight ${bubbleClass}`}
                  style={{ width: bubbleWidth, animationDelay: bubbleDelay, transformOrigin: `${TAIL_X[side === 'right' ? 'l' : 'r']}% 100%` }}
                >
                  {bubble}
                </div>
              </div>
            )}
            {bubble && !(atMouth && MOUTHS[file]) && (
              <div
                className={`bub-${bubbleKind} ex-in absolute z-10 !min-w-0 font-extrabold leading-tight ${bubbleClass}`}
                style={{ width: bubbleWidth, bottom: '50%', animationDelay: bubbleDelay, ...(side === 'right' ? { left: '58%' } : { right: '58%' }) }}
              >
                {bubble}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Twinkling stars plus coloured motes rising from the bottom, same maths as the design.
export function Stars({ n = 20, maxY = 100, motes = true }) {
  const dots = Array.from({ length: n }, (_, i) => {
    const size = i % 4 === 0 ? 3 : 2;
    return (
      <span
        key={`s${i}`}
        aria-hidden="true"
        className="ex-star pointer-events-none absolute rounded-full bg-white"
        style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % maxY}%`, width: size, height: size, animationDelay: `${((i * 7) % 30) / 10}s` }}
      />
    );
  });
  const rising = motes ? Array.from({ length: 9 }, (_, i) => {
    const col = i % 3 === 0 ? '94,230,200' : i % 3 === 1 ? '255,111,125' : '255,227,163';
    const size = 4 + ((i * 5) % 5);
    return (
      <span
        key={`m${i}`}
        aria-hidden="true"
        className="ex-mote pointer-events-none absolute rounded-full"
        style={{ left: `${(i * 41 + 7) % 96}%`, bottom: -12, width: size, height: size, background: `rgba(${col},0.9)`, boxShadow: `0 0 10px 3px rgba(${col},0.45)`, animationDuration: `${9 + ((i * 3) % 7)}s`, animationDelay: `${-(i * 1.7)}s` }}
      />
    );
  }) : [];
  return <>{dots}{rising}</>;
}

// kind: l (speech, tail left), r (speech, tail right), t (thought), s (shout).
export function Bubble({ kind = 'l', className = '', style, children }) {
  return <div className={`bub-${kind} font-extrabold ${className}`} style={style}>{children}</div>;
}

export function PrimaryButton({ children, onClick, className = '', delay }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ex-btn ex-in ex-fredoka flex min-h-[54px] w-full items-center justify-center rounded-2xl text-[18px] font-semibold ${className}`}
      style={{ background: C.coral, color: C.bg, boxShadow: '0 10px 30px -10px rgba(255,111,125,0.7)', animationDelay: delay }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = '', delay }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ex-btn ex-in ex-fredoka flex min-h-[54px] w-full items-center justify-center rounded-2xl text-[18px] font-medium ${className}`}
      style={{ border: '1.5px solid #5c5668', color: C.text, animationDelay: delay }}
    >
      {children}
    </button>
  );
}

// The phone-sized screen every scene sits in.
export function Screen({ children, background, className = '', stars = true, maxY = 100 }) {
  return (
    <div
      className={`ex-root relative mx-auto flex w-full max-w-[390px] flex-col overflow-hidden rounded-[30px] ${className}`}
      style={{ background: background || C.bg, minHeight: 760, boxShadow: '0 24px 70px rgba(0,0,0,0.45)', border: `1px solid ${C.line}` }}
    >
      {stars && <Stars maxY={maxY} />}
      {children}
    </div>
  );
}

// The silver phone from design screen Ex3Reveal: brushed-metal edge, side buttons,
// black bezel, camera pill and a soft glare. Children fill the screen.
const SIDE = [
  { side: 'left', top: 92, h: 22 },
  { side: 'left', top: 132, h: 40 },
  { side: 'left', top: 180, h: 40 },
  { side: 'right', top: 150, h: 56 },
];

export function SilverPhone({ children, className = '', screenClassName = '', width = 360 }) {
  return (
    <div
      className={`relative mx-auto box-border w-full ${className}`}
      style={{
        maxWidth: width,
        padding: 5,
        borderRadius: 52,
        background: 'linear-gradient(145deg, #ffffff 0%, #dfe2e6 10%, #8e939b 26%, #f6f7f9 44%, #a9aeb6 60%, #eef0f3 78%, #7c8189 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.95), inset 0 2px 3px rgba(255,255,255,0.9), 0 0 0 1px #575b62, 0 28px 60px -22px rgba(0,0,0,0.9), 0 0 50px -14px rgba(255,170,200,0.25)',
      }}
    >
      {SIDE.map((button) => (
        <div
          key={`${button.side}${button.top}`}
          aria-hidden="true"
          className="absolute w-[3px]"
          style={{
            [button.side]: -3,
            top: button.top,
            height: button.h,
            borderRadius: button.side === 'left' ? '2px 0 0 2px' : '0 2px 2px 0',
            background: `linear-gradient(${button.side === 'left' ? 90 : 270}deg, #8d9198, #d9dbe0)`,
          }}
        />
      ))}
      <div className="relative" style={{ borderRadius: 47, background: '#050506', padding: 7 }}>
        <div aria-hidden="true" className="pointer-events-none absolute z-[3]" style={{ inset: 7, borderRadius: 40, background: 'linear-gradient(118deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0) 40%)' }} />
        <div aria-hidden="true" className="absolute left-1/2 z-[4] -ml-[42px] h-[24px] w-[84px] rounded-full bg-black" style={{ top: 18, boxShadow: 'inset 0 0 0 1px #16161a' }}>
          <div className="absolute right-[10px] top-[7px] h-[10px] w-[10px] rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #2a3550, #07080c)' }} />
        </div>
        <div className={`ex-root relative flex flex-col overflow-hidden ${screenClassName}`} style={{ borderRadius: 40, background: C.bg }}>
          {children}
        </div>
      </div>
    </div>
  );
}
