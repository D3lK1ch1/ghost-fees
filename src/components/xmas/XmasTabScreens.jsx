import { SpeechBubble } from '@/components/site/Bubbles';
import { money } from '@/lib/ghostFees/format';
import { XMAS } from '@/lib/ghostFees/christmasArt';
import { Disclaimer, Kicker, Spirit, Title, XScreen, useSeason } from './XmasKit';

// The 🎄 design screen at the top of each results tab. Every number is from the scan.
//   Ghosts > Stave one, Dusty the Ghost of Fees Past (CW3)
//   Goal path > Christmas morning (CW7): dawn breaks as you break Jacob's links

function FeesPast({ leaks, total, X, season }) {
  return (
    <XScreen X={X} season={season}>
      <Kicker X={X}>STAVE ONE · THE PAST</Kicker>
      <Title size={24}>Dusty, the Ghost of Fees Past</Title>
      <div className="relative flex items-end gap-2">
        <Spirit src={XMAS.dusty} name="Dusty" alt="Dusty, a candle ghost reading an old ledger" width={130} X={X} />
        <div className="flex flex-col gap-2 pb-6">
          <SpeechBubble>I am the Ghost of Fees Past.</SpeechBubble>
          <SpeechBubble>Long past? No. Your past, from this statement.</SpeechBubble>
        </div>
      </div>
      <div className="relative grid grid-cols-3 gap-2">
        {leaks.slice(0, 3).map((leak, index) => (
          <div key={leak.id} className="x-flip rounded-xl px-2 py-2" style={{ background: X.cream, color: '#14301f', animationDelay: `${0.4 + index * 0.5}s` }}>
            <div className="rounded-md px-1.5 py-1 text-center text-[10.5px] font-bold text-white" style={{ background: '#1f5c3a' }}>{leak.badge}</div>
            <div className="mt-1.5 line-clamp-2 text-[11.5px] font-bold">{leak.title || leak.merchant}</div>
            <div className="text-[11px] font-bold" style={{ color: '#c0392b' }}>{money(leak.amount)}</div>
          </div>
        ))}
      </div>
      <div className="x-rise relative rounded-2xl px-4 py-3" style={{ border: `1.5px solid ${X.gold}`, background: 'rgba(0,0,0,.25)', animationDelay: '2s' }}>
        <div className="x-fredoka text-[28px] font-bold" style={{ color: X.gold }}>{money(total)}</div>
        <div className="text-[13px]">already lost to the leaks in your statement</div>
        <div className="text-[12px]" style={{ color: X.muted }}>These can&apos;t be undone, but some can be refunded. Every card below has the email.</div>
      </div>
    </XScreen>
  );
}

function Morning({ leaks, cleared, subscriptions, X, season }) {
  const done = leaks.filter((leak) => cleared.includes(leak.id));
  const saved = done.reduce((sum, leak) => sum + leak.amount, 0);
  const yearly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0) * 12;
  const pct = leaks.length ? done.length / leaks.length : 0;
  return (
    <XScreen X={X} season={season} snow={false} background={`linear-gradient(180deg, ${pct >= 1 ? '#ffb48a' : '#1b2a4a'} 0%, ${X.glow} 45%, ${X.bg} 80%)`}>
      <Kicker X={X}>CHRISTMAS MORNING</Kicker>
      <div className="relative overflow-hidden rounded-2xl" style={{ border: `1px solid ${X.line}` }}>
        <img src={XMAS.morning(season)} alt="Christmas morning, with coins falling like snow" width={720} className="block h-[200px] w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 transition-opacity duration-1000" style={{ background: '#0b1020', opacity: 0.65 * (1 - pct) }} />
        {done.map((leak, index) => (
          <span key={leak.id} aria-hidden="true" className="x-coin absolute h-4 w-4 rounded-full" style={{ left: `${12 + ((index * 23) % 76)}%`, top: `${30 + ((index * 17) % 50)}%`, background: X.gold, border: `2px solid ${X.goldDeep}`, animationDelay: `${0.3 + index * 0.25}s` }} />
        ))}
      </div>
      <Title size={24}>{pct >= 1 ? 'You changed the ending.' : 'It is not too late to change the ending.'}</Title>
      <div className="relative">
        <div className="mb-1.5 flex justify-between text-[13px] font-bold"><span>{done.length} of {leaks.length} links broken</span><span style={{ color: X.gold }}>{money(saved)} saved</span></div>
        <div className="h-3 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${X.gold}, ${X.mint})` }} />
        </div>
      </div>
      {yearly > 0 && <div className="relative text-[14px] font-bold" style={{ color: X.mint }}>Cancel what you don&apos;t use and keep up to {money(yearly)} a year.</div>}
      <div className="relative text-[12.5px]" style={{ color: X.muted }}>Break links in Jacob&apos;s chain, or tick off each step below. Both count.</div>
      <Disclaimer X={X} />
    </XScreen>
  );
}

export default function XmasTabScreens({ tab, leaks = [], subscriptions = [], total = 0, cleared = [] }) {
  const { season, X } = useSeason();
  const wrap = (children) => <div className="mb-5 mt-4 grid justify-center gap-6 xl:grid-cols-2">{children}</div>;
  if (tab === 'ghosts' && leaks.length) return wrap(<FeesPast leaks={leaks} total={total} X={X} season={season} />);
  if (tab === 'path' && leaks.length) return wrap(<Morning leaks={leaks} cleared={cleared} subscriptions={subscriptions} X={X} season={season} />);
  return null;
}
