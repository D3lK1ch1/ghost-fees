import { useState } from 'react';
import { SpeechBubble } from '@/components/site/Bubbles';
import { money } from '@/lib/ghostFees/format';
import { XMAS, xmasAvatar } from '@/lib/ghostFees/christmasArt';
import { GoldButton, Kicker, LineButton, Spirit, Title, XScreen, useSeason } from './XmasKit';

// Jacob's chain (design CW2), the 🎄 version of the Haunted House: every leak is one
// receipt link in Jacob Ledger's chain. Pick a link, draft the email, then break the
// link once it's sorted. Broken links are the same "cleared" list the Goal path uses.
export default function JacobsChain({ leaks, cleared = [], onClearedChange, onDraft }) {
  const { season, X } = useSeason();
  const [selectedId, setSelectedId] = useState(leaks[0]?.id);
  const [snapping, setSnapping] = useState(null);
  const selected = leaks.find((leak) => leak.id === selectedId) || leaks[0];
  const left = leaks.filter((leak) => !cleared.includes(leak.id));
  const weight = left.reduce((sum, leak) => sum + leak.amount, 0);
  if (!selected) return null;
  const isBroken = cleared.includes(selected.id);

  const breakLink = (leak) => {
    setSnapping(leak.id);
    setTimeout(() => {
      onClearedChange?.([...cleared.filter((id) => id !== leak.id), leak.id]);
      setSnapping(null);
      const next = leaks.find((item) => item.id !== leak.id && !cleared.includes(item.id));
      if (next) setSelectedId(next.id);
    }, 450);
  };
  const mend = (leak) => onClearedChange?.(cleared.filter((id) => id !== leak.id));

  return (
    <div className="mx-auto mt-4 grid max-w-[820px] justify-center gap-6 xl:grid-cols-2">
      <XScreen X={X} season={season}>
        <Kicker X={X}>THE FIRST VISITOR</Kicker>
        <Title>Jacob Ledger</Title>
        <div className="relative flex items-end gap-2">
          <Spirit src={XMAS.jacob} name="Jacob Ledger" alt="Jacob Ledger, a weary ghost wrapped in a chain of receipts" width={130} X={X} />
          <div className="flex flex-col gap-2 pb-6">
            <SpeechBubble>I wear the chain I forged in life. Every link a fee.</SpeechBubble>
            <SpeechBubble>{left.length ? `${left.length} links still. Break them.` : 'Free! Every link is broken.'}</SpeechBubble>
          </div>
        </div>

        <ul className="relative m-0 flex list-none flex-col items-center p-0" aria-label="Jacob's chain">
          {leaks.map((leak, index) => {
            const broken = cleared.includes(leak.id);
            const active = leak.id === selected.id;
            return (
              <li key={leak.id} className={`flex flex-col items-center ${snapping === leak.id ? 'x-snap' : 'x-link'}`} style={{ animationDelay: snapping === leak.id ? '0s' : `${0.3 + index * 0.3}s` }}>
                {index > 0 && <span aria-hidden="true" className="h-3 w-1.5 rounded-full" style={{ background: broken ? X.line : X.goldDeep }} />}
                <button
                  type="button"
                  onClick={() => setSelectedId(leak.id)}
                  aria-pressed={active}
                  className="x-btn flex w-[300px] max-w-full items-center gap-2.5 rounded-[18px] px-3 py-2 text-left"
                  style={{
                    background: broken ? 'transparent' : X.cream,
                    color: broken ? X.muted : '#14301f',
                    border: `2.5px ${broken ? 'dashed' : 'solid'} ${active ? X.gold : broken ? X.line : X.goldDeep}`,
                    boxShadow: active && !broken ? `0 0 0 3px ${X.gold}55` : 'none',
                  }}
                >
                  <img src={xmasAvatar(leak.merchant, season)} alt="" width={34} height={34} className={`h-[34px] w-[34px] flex-none rounded-full ${broken ? 'opacity-50 grayscale' : ''}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-extrabold">{leak.title || leak.merchant}</span>
                    <span className="block text-[11.5px] font-bold" style={{ color: broken ? X.mint : '#c0392b' }}>{broken ? 'Link broken' : `${leak.badge} · ${money(leak.amount)}`}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="relative text-center text-[13px]" style={{ color: X.muted }}>
          {left.length} of {leaks.length} links left · <span className="font-extrabold" style={{ color: X.gold }}>{money(weight)}</span> still on the chain
        </div>
      </XScreen>

      <div className="x-root flex flex-col gap-3 self-start rounded-[22px] p-4" style={{ background: X.card, border: `1px solid ${X.line}`, color: X.text }}>
        <div className="flex items-center gap-3">
          <img src={xmasAvatar(selected.merchant, season)} alt="" width={46} height={46} className="h-[46px] w-[46px] rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="x-fredoka text-[18px] font-semibold">{selected.title || selected.merchant}</div>
            <div className="text-[12.5px]" style={{ color: X.muted }}>{selected.badge}</div>
          </div>
          <div className="x-fredoka text-[20px] font-semibold" style={{ color: X.gold }}>{money(selected.amount)}</div>
        </div>
        <p className="m-0 text-[14px] leading-snug">{selected.reason}</p>
        {selected.action && <GoldButton X={X} onClick={() => onDraft?.(selected)}>🎄 Draft the email</GoldButton>}
        {isBroken ? (
          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ border: `2px solid ${X.mint}` }}>
            <span className="x-fredoka text-[15px] font-semibold" style={{ color: X.mint }}>Link broken · {money(selected.amount)} off the chain</span>
            <button type="button" onClick={() => mend(selected)} className="text-[12.5px] font-bold underline" style={{ color: X.muted }}>Undo</button>
          </div>
        ) : (
          <LineButton X={X} onClick={() => breakLink(selected)}>⛓️ Break this link</LineButton>
        )}
        <p className="m-0 text-[12.5px] leading-relaxed" style={{ color: X.muted }}>Break a link once you&apos;ve cancelled, asked for a refund, or decided to keep it.</p>
      </div>
    </div>
  );
}
