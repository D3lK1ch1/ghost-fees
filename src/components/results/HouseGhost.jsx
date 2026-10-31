import { cn } from '@/lib/utils';

// Basement ghosts each carry a different prop so a row of fees doesn't look copy-pasted.
const BASEMENT_PROPS = ['coin', 'shades', 'bow', 'bag'];

const INK = '#1a1230';
const BLUSH = '#ffb37c';

function Face({ mood }) {
  if (mood === 'sleepy') {
    return (
      <>
        <path d="M21 31q3.5 3 7 0M36 31q3.5 3 7 0" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M29 40q3 1.6 6 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'grumpy') {
    return (
      <>
        <path d="M19 25l9 3.5M45 25l-9 3.5" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="25" cy="32" rx="2.6" ry="3" fill={INK} />
        <ellipse cx="39" cy="32" rx="2.6" ry="3" fill={INK} />
        <path d="M27 42q5-3 10 0" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'shocked') {
    return (
      <>
        <circle cx="25" cy="30" r="5" fill={INK} />
        <circle cx="39" cy="30" r="5" fill={INK} />
        <circle cx="26.5" cy="28.5" r="1.6" fill="#fff" />
        <circle cx="40.5" cy="28.5" r="1.6" fill="#fff" />
        <ellipse cx="32" cy="42" rx="3" ry="3.8" fill={INK} />
      </>
    );
  }
  return (
    <>
      <ellipse cx="25" cy="30" rx="2.8" ry="3.6" fill={INK} />
      <ellipse cx="39" cy="30" rx="2.8" ry="3.6" fill={INK} />
      <path d="M28 38.5q4 3.4 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function Prop({ kind }) {
  switch (kind) {
    case 'hourglass':
      return (
        <g transform="translate(52 34)">
          <path d="M0 0h12M0 22h12M2 0q0 8 4 11q-4 3-4 11M10 0q0 8-4 11q4 3 4 11" stroke="#f0a64b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M4 18l2-4l2 4z" fill="#ffd27a" />
        </g>
      );
    case 'candle':
      return (
        <g transform="translate(55 30)">
          <rect x="0" y="8" width="7" height="16" rx="1.5" fill="#ffd9a8" stroke="#c98a1b" strokeWidth="1.2" />
          <path d="M3.5 0q4.5 4 0 7.5q-4.5-3.5 0-7.5z" fill="#ff9a3c" className="animate-flicker" style={{ transformOrigin: '3.5px 7px' }} />
        </g>
      );
    case 'coin':
      return (
        <g transform="translate(48 46)">
          <circle cx="7" cy="7" r="7" fill="#ffc857" stroke="#c98a1b" strokeWidth="1.5" />
          <text x="7" y="10.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#8a5a00">$</text>
        </g>
      );
    case 'shades':
      return <path d="M17 27h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4zM35 27h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4zM29 29h6" fill={INK} stroke={INK} strokeWidth="1.5" />;
    case 'bow':
      return (
        <g transform="translate(32 9)">
          <path d="M0 0l-9-6v12zM0 0l9-6v12z" fill="#ff7a8a" />
          <circle r="2.6" fill="#ff5a70" />
        </g>
      );
    case 'bag':
      return (
        <g transform="translate(48 42)">
          <path d="M3 6q-3 10 6 12q9-2 6-12z" fill="#c9a47a" />
          <path d="M5 6l4-4l4 4" stroke="#8a6a44" strokeWidth="2" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

function Body({ mood, prop, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      <path
        d="M32 6C19 6 10 16 10 29v37c0 1.6 1.8 2.4 3 1.4l5.4-4.2c.9-.7 2.1-.7 3 0l5.3 4.1c1 .8 2.4.8 3.4 0l4.8-3.9c.9-.7 2.2-.7 3.1 0l5 3.9c1 .8 2.4.8 3.4 0l5.4-4.1c.9-.7 2.1-.7 3 0l.2.1V29C54 16 45 6 32 6Z"
        fill="#f4efe8"
      />
      <circle cx="18" cy="37" r="3" fill={BLUSH} opacity="0.55" />
      <circle cx="46" cy="37" r="3" fill={BLUSH} opacity="0.55" />
      <Face mood={mood} />
      <Prop kind={prop} />
    </g>
  );
}

// One cartoon ghost whose look depends on the room it haunts.
export default function HouseGhost({ room, index = 0, className }) {
  const look = {
    attic: { mood: 'sleepy' },
    guest: { mood: 'grumpy', prop: 'hourglass' },
    mirror: { mood: 'shocked', twin: true },
    hallway: { mood: 'happy', prop: 'candle' },
    basement: { mood: 'happy', prop: BASEMENT_PROPS[index % BASEMENT_PROPS.length] },
  }[room] || { mood: 'happy' };

  return (
    <span className={cn('relative inline-block', className)}>
      <svg viewBox={look.twin ? '-14 0 82 74' : '0 0 70 74'} className="h-full w-full overflow-visible drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]" aria-hidden="true">
        {look.twin && (
          <g transform="translate(-12 2)">
            <Body mood="happy" opacity={0.35} />
          </g>
        )}
        <Body mood={look.mood} prop={look.prop} />
      </svg>
      {look.mood === 'sleepy' && (
        <span className="absolute -right-2 -top-3 animate-float font-heading text-[13px] font-bold text-[#c3b8db]">z</span>
      )}
    </span>
  );
}
