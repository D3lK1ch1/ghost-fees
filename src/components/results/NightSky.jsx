// The haunted night behind the results page: moon, stars and a couple of bats.
// Decorative only, and still when reduce motion is on.

const STARS = [[6, 40], [14, 120], [22, 70], [31, 180], [40, 30], [52, 140], [61, 60], [70, 200], [83, 90], [92, 160]];

function Bat({ className, style }) {
  return (
    <svg viewBox="0 0 40 16" className={className} style={style} aria-hidden="true">
      <path d="M20 6c1-2 2-3 2-3l1 2c3-3 9-4 17-2-4 1-6 3-7 6-2-2-5-2-7 0-1-1-2-1-3-1h-6c-1 0-2 0-3 1-2-2-5-2-7 0-1-3-3-5-7-6 8-2 14-1 17 2l1-2s1 1 2 3Z" fill="#0b0716" />
    </svg>
  );
}

export default function NightSky() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-[#241640] via-[#170f2a]/60 to-transparent" />
      <div className="absolute right-[8%] top-16 h-24 w-24 animate-moon-glow rounded-full bg-[#f5efe0] opacity-90 sm:h-32 sm:w-32" />
      {STARS.map(([x, y], index) => (
        <span
          key={`${x}-${y}`}
          className="absolute h-1 w-1 animate-flicker rounded-full bg-white/60"
          style={{ left: `${x}%`, top: `${y}px`, animationDelay: `${index * 0.35}s` }}
        />
      ))}
      <Bat className="absolute left-0 top-24 w-9 animate-bat-fly" />
      <Bat className="absolute left-0 top-44 w-6 animate-bat-fly opacity-70" style={{ animationDelay: '6s' }} />
      <div className="absolute inset-x-0 bottom-0 h-24 animate-fog-drift bg-[#c3b8db]/[0.04] blur-2xl" />
    </div>
  );
}
