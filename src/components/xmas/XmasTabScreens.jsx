import { SpeechBubble } from '@/components/site/Bubbles';
import { money } from '@/lib/ghostFees/format';
import { XMAS } from '@/lib/ghostFees/christmasArt';
import { Kicker, Spirit, Title, XScreen, useSeason } from './XmasKit';

// The 🎄 design screen at the top of each results tab. Every number is from the scan.
//   Ghosts > Stave one, Dusty the Ghost of Fees Past (CW3)

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

export default function XmasTabScreens({ tab, leaks = [], total = 0 }) {
  const { season, X } = useSeason();
  const wrap = (children) => <div className="mb-5 mt-4 grid justify-center gap-6 xl:grid-cols-2">{children}</div>;
  if (tab === 'ghosts' && leaks.length) return wrap(<FeesPast leaks={leaks} total={total} X={X} season={season} />);
  return null;
}
