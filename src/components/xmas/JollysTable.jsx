import { money } from '@/lib/ghostFees/format';
import { xmasAvatar, xmasGhost } from '@/lib/ghostFees/christmasArt';
import { useSeason } from './XmasKit';

// Stave Two: Jolly's feast (4 Nov, new scene). One picture of the whole table, with every
// ghost cut out along its sticker outline so each one bobs on its own over the table
// (feast-bg.webp has the space behind them filled in). Each subscription's price sits on
// the blank tag by a plate. Scene is 1585 x 992; positions below are in scene pixels.
const ART = '/themes/christmas/table/feast';
const W = 1585;
const H = 992;
const JOLLY = { x: 534, y: 85, w: 429, h: 407 };
// seat: the ghost who sits there (null for the empty plate) and the blank tag's centre.
const SEAT = {
  design: { ghost: 'coolyule', box: { x: 258, y: 177, w: 296, h: 300 }, tag: { x: 612, y: 521, r: -3 } },
  trial: { ghost: 'frosty', box: { x: 55, y: 345, w: 317, h: 360 }, tag: { x: 570, y: 641, r: -3 } },
  gym: { ghost: null, tag: { x: 527, y: 789, r: -3 } },
  netflix: { ghost: 'popcorn', box: { x: 1015, y: 162, w: 290, h: 315 }, tag: { x: 1071, y: 528, r: 2 } },
  music: { ghost: 'tinsel', box: { x: 1246, y: 347, w: 291, h: 339 }, tag: { x: 1158, y: 638, r: 2 } },
  stan: { ghost: 'mystery', box: { x: 1167, y: 660, w: 349, h: 312 }, tag: { x: 1131, y: 793, r: 3 } },
};
const SEATS = ['gym', 'design', 'trial', 'netflix', 'music', 'stan'];
const MATCH = [
  ['gym', /GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45/i],
  ['design', /ADOBE|CANVA|FIGMA/i],
  ['trial', /STREAMMAX|DISNEY|BINGE|PARAMOUNT|PRIME|KAYO/i],
  ['netflix', /NETFLIX/i],
  ['music', /SPOTIFY|MUSIC|YOUTUBE|AUDIBLE/i],
  ['stan', /\bSTAN\b/i],
];
const px = (value, total) => `${(value / total) * 100}%`;
const box = (b) => ({ left: px(b.x, W), top: px(b.y, H), width: px(b.w, W), height: px(b.h, H) });

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

// The art for a row in the list: the seat's ghost from the scene, else the festive avatar.
const rowArt = (seat, merchant, season) => (seat && SEAT[seat].ghost ? `${ART}/${SEAT[seat].ghost}.webp` : seat === 'gym' ? '/themes/christmas/table/seated-gym.webp' : xmasAvatar(merchant, season));

export default function JollysTable({ subscriptions }) {
  const { season } = useSeason();
  const { seats, extra } = seatGuests(subscriptions);
  const seated = SEATS.filter((seat) => seats[seat]);
  const guests = SEATS.filter((seat) => SEAT[seat].ghost);
  return (
    <div className="relative">
      <div className="relative mt-[17%] w-full rounded-2xl" style={{ aspectRatio: `${W} / ${H}`, containerType: 'inline-size' }}>
        <img src={`${ART}/feast-bg.webp`} alt="Jolly at the head of a long Christmas table with five ghost guests, every dish something you pay for" width={W} height={H} className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
        {/* Every guest bobs on its own beat; Jolly sways gently at the head of the table. */}
        <img src={`${ART}/jolly.webp`} alt="" aria-hidden="true" className="x-feast absolute" style={{ ...box(JOLLY), animationDuration: '4.4s' }} />
        {guests.map((seat, index) => (
          <img
            key={seat}
            src={`${ART}/${SEAT[seat].ghost}.webp`}
            alt=""
            aria-hidden="true"
            className="x-feast absolute"
            style={{ ...box(SEAT[seat].box), animationDelay: `${index * -0.7}s`, animationDuration: `${3.2 + (index % 3) * 0.35}s` }}
          />
        ))}
        {/* Jolly's bubble above the table, tail toward Jolly. */}
        <div className="bub-l x-rise absolute z-10 !min-w-0 font-semibold" style={{ left: '58%', top: '-21cqw', width: '38%', fontSize: '2.75cqw', lineHeight: 1.2, padding: '3cqw 4.6cqw 5.4cqw 5.6cqw' }}>
          <span className="block font-bold" style={{ fontSize: '3.3cqw' }}>Come in!</span>
          <span className="block" style={{ textWrap: 'balance' }}>Every dish is something you pay for.</span>
        </div>
        {seated.map((seat) => {
          const { tag } = SEAT[seat];
          return (
            <span
              key={seat}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold leading-none text-[#c0392b]"
              style={{ left: px(tag.x, W), top: px(tag.y, H), rotate: `${tag.r}deg`, fontSize: '1.75cqw', letterSpacing: '-0.02em' }}
            >
              {money(seats[seat].monthly)}
            </span>
          );
        })}
      </div>
      {/* Who is eating what: one row each, full names. */}
      <ul className="relative mt-3 divide-y divide-white/10 rounded-2xl border border-white/10">
        {[...seated.map((seat) => [seat, seats[seat]]), ...extra.map((item) => [null, item])].map(([seat, item]) => (
          <li key={item.id || item.merchant} className="flex items-center gap-3 px-3 py-2">
            <img src={rowArt(seat, item.merchant, season)} alt="" width={34} height={34} className="h-[34px] w-[34px] shrink-0 object-contain" />
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
