import { money } from '@/lib/ghostFees/format';
import LAYOUT from '@/lib/ghostFees/jollysTable.json';
import { xmasAvatar, xmasGhost } from '@/lib/ghostFees/christmasArt';
import { useSeason } from './XmasKit';

// Stave Two: Jolly's feast. Table from jollys-table-assets.zip; the guests are each
// subscription's own festive ghost from Image Assets (same as everywhere in 🎄), at its dish,
// with the price on the plate's tag. Positions come from layout.json (1600x1000 scene).
const ART = '/themes/christmas/table';
const SEATS = ['gym', 'design', 'trial', 'netflix', 'music', 'stan'];
// Which guest sits for which subscription (the same characters as the avatars elsewhere).
const MATCH = [
  ['gym', /GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45/i],
  ['design', /ADOBE|CANVA|FIGMA/i],
  ['trial', /STREAMMAX|DISNEY|BINGE|PARAMOUNT|PRIME|KAYO/i],
  ['netflix', /NETFLIX/i],
  ['music', /SPOTIFY|MUSIC|YOUTUBE|AUDIBLE/i],
  ['stan', /\bSTAN\b/i],
];
const pct = (value, total) => `${(value / total) * 100}%`;

export function seatGuests(subscriptions) {
  const seats = {};
  const extra = [];
  subscriptions.forEach((item) => {
    const hit = MATCH.find(([seat, re]) => re.test(item.merchant) && !seats[seat]);
    if (hit) seats[hit[0]] = item;
    else extra.push(item);
  });
  // Anything without its own guest takes a free seat, then the list below the table.
  SEATS.forEach((seat) => { if (!seats[seat] && extra.length) seats[seat] = extra.shift(); });
  return { seats, extra };
}

export default function JollysTable({ subscriptions }) {
  const { season } = useSeason();
  const { w: W, h: H } = LAYOUT.canvas;
  const { seats, extra } = seatGuests(subscriptions);
  const seated = SEATS.filter((seat) => seats[seat]);
  return (
    <div className="relative">
      <div className="relative mt-[16%] w-full rounded-2xl" style={{ aspectRatio: `${W} / ${H}`, containerType: 'inline-size' }}>
        <img src={`${ART}/table.webp`} alt="Jolly at the head of a long Christmas table, every dish something you pay for" width={W} height={H} className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
        {/* Jolly speaks from his mouth at the head of the table (asset bubble, tail at the mouth). */}
        <div className="bub-l x-rise absolute z-10 !min-w-0 font-bold leading-tight" style={{ left: '54%', bottom: '70%', width: '44%', fontSize: '3.6cqw', padding: '2.4cqw 3cqw 4.4cqw' }}>
          Come in! Every dish is something you pay for.
        </div>
        {seated.map((seat, index) => {
          const g = LAYOUT.guests[seat];
          const item = seats[seat];
          const gw = 260 * g.scale;
          const gh = 300 * g.scale;
          const tagW = Math.max(g.tag.w * 1.9, 150);
          const tagH = Math.max(g.tag.h * 1.7, 58);
          const tagX = g.tag.x + g.tag.w / 2 - tagW / 2;
          const tagY = g.tag.y + g.tag.h / 2 - tagH / 2;
          return (
            <div key={seat}>
              {/* The guest is this subscription's own ghost from Image Assets (same as everywhere in 🎄). */}
              <img
                src={xmasAvatar(item.merchant, season)}
                alt={`${xmasGhost(item.merchant).name}, the ${item.merchant} ghost`}
                width={160}
                height={160}
                className="x-bob absolute object-contain"
                style={{ left: pct(g.x, W), top: pct(g.y + gh - gw, H), width: pct(gw, W), height: pct(gw, H), transform: g.mirror ? 'scaleX(-1)' : undefined, animationDelay: `${index * 0.35}s` }}
              />
              <span
                className="absolute flex flex-col items-center justify-center rounded-md border border-[#c99a2e] bg-[#fbf6ec] text-center font-bold leading-none text-[#14301f] shadow"
                style={{ left: pct(tagX, W), top: pct(tagY, H), width: pct(tagW, W), height: pct(tagH, H), transform: `rotate(${g.tag.rotate}deg)`, fontSize: '2.1cqw' }}
              >
                <span style={{ color: '#c0392b' }}>{money(item.monthly)}</span>
              </span>
            </div>
          );
        })}
      </div>
      {/* Who is eating what, readable at any size. */}
      <ul className="relative mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13.5px] leading-tight">
        {seated.map((seat) => (
          <li key={seat} className="flex items-center gap-2">
            <img src={xmasAvatar(seats[seat].merchant, season)} alt="" width={30} height={30} className="h-[30px] w-[30px] shrink-0 object-contain" />
            <span className="min-w-0 flex-1 break-words font-bold">{seats[seat].merchant}</span>
            <span className="shrink-0 font-bold text-[#f2c14e]">{money(seats[seat].monthly)}</span>
          </li>
        ))}
        {extra.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <img src={xmasAvatar(item.merchant, season)} alt="" width={30} height={30} className="h-[30px] w-[30px] shrink-0 object-contain" />
            <span className="min-w-0 flex-1 break-words font-bold">{item.merchant}</span>
            <span className="shrink-0 font-bold text-[#f2c14e]">{money(item.monthly)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
