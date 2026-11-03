import { statFor } from '@/data/stats';
import { money } from '@/lib/ghostFees/format';
import { XMAS, xmasAvatar, xmasGhost } from '@/lib/ghostFees/christmasArt';
import ChangedMyWays from './ChangedMyWays';
import { Disclaimer, Kicker, Spirit, SpiritSays, Stocking, Title, XScreen, XmasGhostButton, useSeason } from './XmasKit';
import CancelSiteLink from '@/components/results/CancelSiteLink';

// The 🎄 design screen at the top of each results tab. Every number is from the scan.
//   Ghosts > Stave one, Dusty the Ghost of Fees Past (CW3)
//   Goal path > Christmas morning (CW7): dawn breaks as you break Jacob's links
//   Calendar  > Stave three, the Hooded One (CW5): the next 12 months
//   Emails    > Stave two, Jolly's table (CW4): every dish is something you pay for
//   Subscriptions > Changed my ways (CW6): the cancel list with Tiny Savings
//   Receipt   > The gift tag (CW8): one more gift to yourself, real totals only

function FeesPast({ leaks, total, X, season }) {
  return (
    <XScreen X={X} season={season}>
      <Kicker X={X}>STAVE ONE · THE PAST</Kicker>
      <Title size={24}>Dusty, the Ghost of Fees Past</Title>
      <SpiritSays src={XMAS.dusty} name="Dusty" alt="Dusty the candle ghost reading an old ledger" width={130} ratio={422 / 320} mouth={[80, 44]} lines={['I am the Ghost of Fees Past.', 'Long past? No. Your past. This statement.']} X={X} about="Reads your old statement by candlelight. Shows what it already cost you." />
      {/* Bigger cards with room above for the ghost to bob; text centred; buttons line up along the bottom. Tap a ghost for who they are. */}
      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
        {leaks.slice(0, 3).map((leak, index) => (
          <div key={leak.id} className="x-flip flex flex-col items-center rounded-2xl px-3 pb-3 pt-4 text-center" style={{ background: X.cream, color: '#14301f', animationDelay: `${0.4 + index * 0.5}s` }}>
            <div className="flex h-[88px] items-center justify-center">
              <XmasGhostButton leak={leak} season={season} size={72} X={X} delay={index * 0.4} />
            </div>
            <p className="mt-1 flex min-h-[2.5em] items-center text-[12.5px] font-bold leading-tight" style={{ color: '#1f5c3a' }}>{xmasGhost(leak.merchant).name}</p>
            <div className="mt-2 flex min-h-[42px] w-full items-center justify-center rounded-2xl px-2 py-1 text-[12.5px] font-bold leading-tight text-white" style={{ background: '#1f5c3a' }}>{leak.badge}</div>
            <div className="mt-2 line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-tight">{leak.title || leak.merchant}</div>
            <div className="mt-1 text-[16px] font-black" style={{ color: '#c0392b' }}>{money(leak.amount)}</div>
            <div className="mt-auto w-full pt-3">
              {leak.action === 'waive' || leak.badge === 'Bank fee' ? (
                <button type="button" onClick={() => document.getElementById(`leak-${leak.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="flex w-full items-center justify-center gap-1 rounded-lg border-2 py-1 text-[12px] font-bold" style={{ borderColor: '#1f5c3a', color: '#1f5c3a' }}>Waive it ↓</button>
              ) : (
                <CancelSiteLink leak={{ ...leak, action: 'cancel' }} compact style={{ borderColor: '#1f5c3a', color: '#1f5c3a' }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="x-rise relative rounded-2xl px-4 py-3" style={{ border: `1.5px solid ${X.gold}`, background: 'rgba(0,0,0,.25)', animationDelay: '2s' }}>
        <div className="x-fredoka text-[28px] font-bold" style={{ color: X.gold }}>{money(total)}</div>
        <div className="text-[14px]">already lost to the leaks in your statement</div>
        <div className="text-[13px]" style={{ color: X.muted }}>These can&apos;t be undone, but some can be refunded. Every card below has the email.</div>
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
        <img src={XMAS.morning(season)} alt="Christmas morning with coins falling like snow" width={720} className="block h-[200px] w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 transition-opacity duration-1000" style={{ background: '#0b1020', opacity: 0.65 * (1 - pct) }} />
        {done.map((leak, index) => (
          <span key={leak.id} aria-hidden="true" className="x-coin absolute h-4 w-4 rounded-full" style={{ left: `${12 + ((index * 23) % 76)}%`, top: `${30 + ((index * 17) % 50)}%`, background: X.gold, border: `2px solid ${X.goldDeep}`, animationDelay: `${0.3 + index * 0.25}s` }} />
        ))}
      </div>
      {/* Christmas morning in the story: the Sleeper wakes with a start. Once every link is
          broken, Jacob (free of his chain) cheers instead. Asset bubbles from the mouth. */}
      {pct >= 1 ? (
        <SpiritSays key="jacob-free" src={XMAS.jacobFree} name="Jacob Ledger" alt="Jacob Ledger free of his chain and cheering" width={120} ratio={420 / 350} mouth={[60, 36]}
          lines={['You changed the ending!', `${money(saved)} off my chain. Merry Christmas!`]} X={X} />
      ) : (
        <SpiritSays key="awake" src={XMAS.awake} name="The Sleeper" alt="The Sleeper waking with a start on Christmas morning" width={130} ratio={420 / 407} mouth={[53, 46]} bubbleWidth={190} about="That's you. Awake on Christmas morning with a second chance."
          lines={['Is it Christmas morning? I haven\'t missed it!', `${leaks.length - done.length} ${leaks.length - done.length === 1 ? 'link' : 'links'} to break. Help me change the ending.`]} X={X} />
      )}
      <Title size={24}>{pct >= 1 ? 'You changed the ending.' : 'It is not too late to change the ending.'}</Title>
      <div className="relative">
        <div className="mb-1.5 flex justify-between text-[14px] font-bold"><span>{done.length} of {leaks.length} links broken</span><span style={{ color: X.gold }}>{money(saved)} saved</span></div>
        <div className="h-3 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${X.gold}, ${X.mint})` }} />
        </div>
      </div>
      {yearly > 0 && <div className="relative text-[14px] font-bold" style={{ color: X.mint }}>Cancel what you don&apos;t use and keep up to {money(yearly)} a year.</div>}
      <div className="relative text-[13.5px]" style={{ color: X.muted }}>Break links in Jacob&apos;s chain, or tick off each step below. Both count.</div>
      <Disclaimer X={X} />
    </XScreen>
  );
}

function Present({ subscriptions, X, season }) {
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  return (
    <XScreen X={X} season={season}>
      <Kicker X={X}>STAVE TWO · THE PRESENT</Kicker>
      <Title size={24}>Jolly, the Ghost of Subscriptions Present</Title>
      {/* Asset bubbles from Jolly's mouth, as in every stave. */}
      <SpiritSays src={XMAS.jolly} name="Jolly" alt="Jolly the cheerful ghost in a patchwork robe holding a torch" width={140} ratio={294 / 320} mouth={[52, 37]} bubbleWidth={190}
        about="The Ghost of Subscriptions Present. Shows what you pay for right now."
        lines={['Come in! Know me better.', 'Every dish is something you pay for.']} X={X} />
      <ul className="relative m-0 grid list-none grid-cols-3 gap-2 rounded-2xl border-t-4 border-dashed p-3" style={{ borderColor: '#c0392b', background: '#5a3a24' }}>
        {subscriptions.slice(0, 9).map((item, index) => (
          <li key={item.id} className="x-dish flex flex-col items-center text-center" style={{ animationDelay: `${0.4 + index * 0.35}s` }}>
            {/* Each dish is served by its festive ghost. */}
            <span className="relative flex h-12 w-16 items-end justify-center" aria-hidden="true">
              <img src={xmasAvatar(item.merchant, season)} alt="" width={40} height={40} className="x-bob relative z-10 mb-1 h-10 w-10 object-contain" style={{ animationDelay: `${index * 0.3}s` }} />
              <span className="absolute bottom-0 h-4 w-16 rounded-[50%] shadow-inner" style={{ background: '#efe6d8' }} />
            </span>
            <span className="mt-1 flex w-full flex-col rounded-lg px-1.5 py-1 text-[12px] font-bold leading-tight" style={{ background: X.cream, color: '#14301f' }}>
              <span className="truncate">{item.merchant}</span>
              <span style={{ color: '#c0392b' }}>{money(item.monthly)}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="relative text-center">
        <div className="x-fredoka text-[26px] font-bold" style={{ color: X.gold }}>{money(monthly)} a month</div>
        <div className="text-[14px]" style={{ color: X.muted }}>on the table right now. The letters below clear it. One dish at a time.</div>
      </div>
    </XScreen>
  );
}

function GiftTag({ leaks, subscriptions, total, X, season }) {
  const yearly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0) * 12;
  const biggest = leaks[0];
  const lines = [
    total > 0 && [`${money(total)}`, 'lost to fees and leaks on this statement'],
    yearly > 0 && [`${money(yearly)} a year`, `on ${subscriptions.length} subscriptions`],
    biggest && [biggest.title || biggest.merchant, `your biggest ghost, ${money(biggest.amount)}`],
  ].filter(Boolean);
  return (
    <XScreen X={X} season={season}>
      {/* Room around the bobbing picture so it never touches the title or the tag below. */}
      <div className="relative mb-2 flex items-center gap-5 pt-2">
        <img src={XMAS.morning(season)} alt="" width={150} className="x-bob h-[110px] w-[150px] flex-none rounded-2xl object-cover" />
        <Title size={26}>One more gift to yourself.</Title>
      </div>
      <div className="relative flex flex-col gap-2 py-4 pl-[34px] pr-4" style={{ borderRadius: '8px 22px 22px 8px', background: X.cream, color: '#1a1a22', clipPath: 'polygon(22px 0, 100% 0, 100% 100%, 22px 100%, 0 50%)' }}>
        <span aria-hidden="true" className="absolute left-2.5 top-1/2 -mt-[5px] h-2.5 w-2.5 rounded-full" style={{ background: X.bg }} />
        <div className="text-[13px] font-extrabold tracking-wide" style={{ color: '#2d6b4f' }}>FROM YOUR STATEMENT</div>
        {lines.map(([big, small]) => (
          <div key={small} className="flex items-start gap-2 text-[14px] leading-snug"><span aria-hidden="true" className="font-black" style={{ color: '#2d6b4f' }}>✓</span><div><b>{big}</b>: {small}</div></div>
        ))}
        <div className="pt-2 text-[13px] font-extrabold tracking-wide" style={{ borderTop: '1px dashed #c9b28a', color: '#6b5a40' }}>AND FOR EVERYONE</div>
        {['waste', 'cancel'].map(statFor).map((fact) => (
          <div key={fact.key} className="flex items-start gap-2 text-[14px] leading-snug"><span aria-hidden="true" className="font-black" style={{ color: '#2d6b4f' }}>✓</span><div><b>{fact.stat}</b>: {fact.text} <span style={{ color: '#6b5a40' }}>({fact.source})</span></div></div>
        ))}
      </div>
      <div className="relative text-center text-[14px] font-extrabold" style={{ color: X.mint }}>Every charge is on the receipt below. Print it, or keep it for the bank.</div>
      <Disclaimer X={X} />
    </XScreen>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function YetToCome({ subscriptions, X, season }) {
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const start = new Date().getMonth() + 1;
  const months = Array.from({ length: 12 }, (_, i) => MONTHS[(start + i) % 12]);
  return (
    <XScreen X={X} season={season}>
      <Kicker X={X}>STAVE THREE · THE FUTURE</Kicker>
      <Title size={24}>The Hooded One, Ghost of Subscriptions Yet to Come</Title>
      <div className="relative flex items-center gap-4">
        <Spirit src={XMAS.hooded} name="The Hooded One" alt="The Hooded One in a dark cloak holding a lantern and pointing ahead" width={120} X={X} />
        <p className="text-[14.5px] leading-snug" style={{ color: X.muted }}>
          <b className="mb-1.5 block" style={{ color: X.text }}>The Ghost of Subscriptions Yet to Come.</b>He never speaks. He points at next year: every month you keep paying drops a coin into your stocking.
        </p>
      </div>
      {/* Future you is the Sleeper, speaking with the asset bubbles from the mouth. */}
      <SpiritSays src={XMAS.awake} name="Future you" alt="Future you sitting up in bed in shock" width={115} ratio={420 / 407} mouth={[53, 46]} bubbleWidth={175}
        lines={['Spirit! Is this my future?', 'Can I still change it?']} X={X} />
      <div className="relative flex items-center gap-3 rounded-2xl px-3 py-3" style={{ background: 'rgba(0,0,0,.22)', border: `1px solid ${X.line}` }}>
        <Stocking coins={12} X={X} />
        <div className="min-w-0">
          <p className="text-[15px] font-bold" style={{ color: X.frost }}>Your stocking: 12 coins</p>
          <p className="text-[13.5px] leading-snug" style={{ color: X.muted }}>One coin for each month you keep paying {money(monthly)}.</p>
        </div>
      </div>
      <div className="relative">
        <div className="text-[13px] font-extrabold" style={{ color: X.frostSoft }}>NEXT 12 MONTHS</div>
        <div className="mt-1.5 grid grid-cols-6 gap-1">
          {months.map((month, i) => (
            <div key={`${month}${i}`} className="rounded py-1.5 text-center text-[11px] font-extrabold" style={{ background: '#e9eef6', color: '#1a2033' }}>{month}</div>
          ))}
        </div>
      </div>
      <div className="relative rounded-2xl px-3.5 py-4" style={{ background: 'linear-gradient(135deg, rgba(220,235,255,.18), rgba(220,235,255,.05))', border: '2px solid rgba(220,235,255,.35)' }}>
        <div className="x-frost x-fredoka text-[22px] font-semibold leading-snug" style={{ color: X.frost, textShadow: '0 0 10px rgba(200,225,255,.8)', animationDelay: '4s' }}>{money(monthly * 12)} over the next 12 months if nothing changes.</div>
      </div>
      <div className="relative text-[13.5px]" style={{ color: X.muted }}>Below: the days you were charged, and reminders for the next charge in your own calendar.</div>
    </XScreen>
  );
}

export default function XmasTabScreens({ tab, leaks = [], subscriptions = [], total = 0, cleared = [] }) {
  const { season, X } = useSeason();
  const wrap = (children) => <div className="mb-5 mt-4 grid justify-center gap-6 xl:grid-cols-2">{children}</div>;
  if (tab === 'ghosts' && leaks.length) return wrap(<FeesPast leaks={leaks} total={total} X={X} season={season} />);
  if (tab === 'path' && leaks.length) return wrap(<Morning leaks={leaks} cleared={cleared} subscriptions={subscriptions} X={X} season={season} />);
  if (tab === 'calendar' && subscriptions.length) return wrap(<YetToCome subscriptions={subscriptions} X={X} season={season} />);
  if (tab === 'emails' && subscriptions.length) return wrap(<Present subscriptions={subscriptions} X={X} season={season} />);
  if (tab === 'subscriptions' && subscriptions.length) return <div className="mb-5 mt-4"><ChangedMyWays subscriptions={subscriptions} /></div>;
  if (tab === 'receipt' && leaks.length) return wrap(<GiftTag leaks={leaks} subscriptions={subscriptions} total={total} X={X} season={season} />);
  return null;
}
