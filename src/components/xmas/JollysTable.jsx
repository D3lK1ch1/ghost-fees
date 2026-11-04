import { money } from '@/lib/ghostFees/format';
import LAYOUT from '@/lib/ghostFees/jollysTable.json';
import { xmasAvatar, xmasGhost } from '@/lib/ghostFees/christmasArt';
import { useSeason } from './XmasKit';

// Stave Two: Jolly's feast. The table and Jolly are one background (jollys-table-assets.zip);
// each subscription is its own festive ghost from Image Assets, seated at its dish with the
// price on the plate's tag. Seats come from layout.json (1600x1000 scene).
// SEATED: the sitting-and-eating art for all six (4 Nov): Sweaty Holly with a drumstick,
// Cool Yule with pudding, Frosty with soup, Popcorn Pete with popcorn, Tangled Tinsel with
// gingerbread, Mystery Parcel with a cracker.
const ART = '/themes/christmas/table';
const SEATED = Object.fromEntries(['gym', 'design', 'trial', 'netflix', 'music', 'stan'].map((seat) => [seat, `${ART}/seated-${seat}.webp`]));
const SEATS = ['gym', 'design', 'trial', 'netflix', 'music', 'stan'];
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
  SEATS.forEach((seat) => { if (!seats[seat] && extra.length) seats[seat] = extra.shift(); });
  return { seats, extra };
}

export default function JollysTable({ subscriptions }) {
  const { season } = useSeason();
  const { w: W, h: H } = LAYOUT.canvas;
  const { seats, extra } = seatGuests(subscriptions);
  const seated = SEATS.filter((seat) => seats[seat]);
  const art = (seat, merchant) => SEATED[seat] || xmasAvatar(merchant, season);
  return (
    <div className="relative">
      <div className="relative mt-[16%] w-full rounded-2xl" style={{ aspectRatio: `${W} / ${H}`, containerType: 'inline-size' }}>
        <img src={`${ART}/table.webp`} alt="Jolly at the head of a long Christmas table, every dish something you pay for" width={W} height={H} className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
        <div className="bub-l x-rise absolute z-10 !min-w-0 font-bold leading-tight" style={{ left: '54%', bottom: '70%', width: '44%', fontSize: '3.6cqw', padding: '2.4cqw 3cqw 4.4cqw' }}>
          Come in! Every dish is something you pay for.
        </div>
        {seated.map((seat, index) => {
          const g = LAYOUT.guests[seat];
          const item = seats[seat];
          const left = !g.mirror;                 // left side of the table faces right
          const size = 300 * g.scale * 1.15;      // a little bigger than the seat box
          const cx = g.x + (260 * g.scale) / 2;   // seat centre
          const bottom = g.y + 300 * g.scale;     // where the guest meets the table
          return (
            <div key={seat}>
              <img
                src={art(seat, item.merchant)}
                alt={`${xmasGhost(item.merchant).name}, the ${item.merchant} ghost`}
                width={size}
                height={size}
                className="x-bob absolute object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
                style={{ left: pct(cx - size / 2, W), top: pct(bottom - size, H), width: pct(size, W), height: pct(size, H), transform: SEATED[seat] && !left ? 'scaleX(-1)' : undefined, animationDelay: `${index * 0.35}s` }}
              />
              {/* Price on the plate, pushed toward the centre so it never covers a face. */}
              <span
                className="absolute z-10 whitespace-nowrap rounded-md border border-[#c99a2e] bg-[#fbf6ec] px-[1.2cqw] py-[0.5cqw] font-bold leading-none text-[#c0392b] shadow"
                style={{ left: pct(g.tag.x + (left ? 40 : -40), W), top: pct(g.tag.y + 10, H), transform: `rotate(${g.tag.rotate}deg)`, fontSize: '2.4cqw' }}
              >
                {money(item.monthly)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Who is eating what: one row each, full names. */}
      <ul className="relative mt-3 divide-y divide-white/10 rounded-2xl border border-white/10">
        {[...seated.map((seat) => [seat, seats[seat]]), ...extra.map((item) => [null, item])].map(([seat, item]) => (
          <li key={item.id || item.merchant} className="flex items-center gap-3 px-3 py-2">
            <img src={art(seat, item.merchant)} alt="" width={34} height={34} className="h-[34px] w-[34px] shrink-0 object-contain" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-bold leading-tight">{item.merchant}</span>
              <span className="block text-[12.5px] opacity-70">{xmasGhost(item.merchant).name}</span>
            </span>
            <span className="shrink-0 text-[14.5px] font-bold text-[#f2c14e]">{money(item.monthly)}/mo</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
