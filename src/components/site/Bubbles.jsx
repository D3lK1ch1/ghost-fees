import { cn } from '@/lib/utils';

// Speech and thought bubbles drawn in code, in the cartoon style of the
// reference sheets: white fill, thick near-black ink outline, a soft pink
// shadow underneath and no image assets. Text stays real HTML on top of the
// shape, so it wraps and stays selectable at any size.

const INK = '#2E1A23';
const SHADOW = 'drop-shadow-[0_5px_0_rgba(255,143,156,0.5)]';

// Scalloped blob path: points around an inset ellipse joined by outward arcs,
// which gives the soft cloud edge. Stretched to the text box, so the ink stays
// even thanks to vector-effect="non-scaling-stroke".
function scallopPath(w, h, bumps = 16, depth = 7) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = cx - depth;
  const ry = cy - depth;
  const at = (i) => {
    const angle = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  };

  let d = '';
  for (let i = 0; i <= bumps; i += 1) {
    const [x, y] = at(i);
    if (i === 0) {
      d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      const [px, py] = at(i - 1);
      const radius = Math.hypot(x - px, y - py) * 0.62;
      d += ` A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return `${d} Z`;
}

const CLOUD_PATH = scallopPath(200, 100);

const TAIL_PATH = 'M2 0 H22 C19 9 13 17 4 26 C6 17 7 9 2 0 Z';

const DOT_SIZES = ['h-3 w-3', 'h-2 w-2', 'h-1.5 w-1.5'];

// Three dots stepping down towards whoever is thinking.
function TrailDots({ trail }) {
  const left = trail === 'left';
  const offsets = left
    ? ['bottom-[-14px] left-5', 'bottom-[-27px] left-1', 'bottom-[-37px] -left-3']
    : ['bottom-[-14px] right-5', 'bottom-[-27px] right-1', 'bottom-[-37px] -right-3'];

  return DOT_SIZES.map((size, index) => (
    <span
      key={size}
      aria-hidden="true"
      className={cn('absolute rounded-full border-[2.4px] bg-white', size, offsets[index])}
      style={{ borderColor: INK }}
    />
  ));
}

export function SpeechBubble({ children, side = 'left', className }) {
  const left = side !== 'right';

  return (
    <div className={cn('relative w-fit max-w-full', SHADOW, className)}>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 28"
          className={cn(
            'absolute bottom-[-15px] h-[21px] w-[18px] overflow-visible',
            left ? 'left-4' : 'right-4 -scale-x-100',
          )}
        >
          <path d={TAIL_PATH} fill="#fff" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div
          className="relative z-10 rounded-full border-[2.6px] bg-white px-4 py-2 text-[12.5px] font-semibold leading-snug"
          style={{ borderColor: INK, color: INK }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function ThoughtBubble({ children, className, trail = 'right', tones }) {
  return (
    <div className={cn('relative w-fit max-w-full', SHADOW, className)}>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            d={CLOUD_PATH}
            fill="#fff"
            stroke={INK}
            strokeWidth={2.7}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className={cn('relative z-10 flex min-h-[58px] items-center justify-center px-6 py-3 text-center text-[13px] font-semibold leading-[1.3] text-balance', tones)}
          style={{ color: INK }}
        >
          {children}
        </div>
      </div>
      <TrailDots trail={trail} />
    </div>
  );
}