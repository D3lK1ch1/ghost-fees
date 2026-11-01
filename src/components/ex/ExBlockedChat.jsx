import { useState } from 'react';
import { yearly } from '@/lib/ghostFees/exJourney';
import { C, GhostButton, GhostPal, PrimaryButton, Screen } from './ExKit';
import GlowUpFund from './GlowUpFund';

// Scene 4, design screen Ex5Story: the chat with one ex after you block them.
// Their line is the real joke for that merchant; the money back is their price x 12.
export default function ExBlockedChat({ theme, pick, pickKey, ex, glow, avatarFor, onNext }) {
  const [run, setRun] = useState(0);
  const line = theme.lines.find((entry) => entry.match.test(ex.merchant))?.text || theme.fallbackLine;
  const chip = (text) => <div className="self-center rounded-full px-3 py-1 text-[12px] font-bold" style={{ color: C.muted, background: C.card }}>{text}</div>;

  return (
    <Screen key={run} stars={false}>
      <div className="relative z-[1] flex items-center gap-3 px-4 pb-3.5 pt-[18px]" style={{ background: C.bar, borderBottom: `1px solid ${C.barLine}` }}>
        <img src={avatarFor(ex.merchant)} alt="" className="h-[42px] w-[42px] flex-none object-contain opacity-50 grayscale" />
        <div className="flex flex-col gap-0.5">
          <div className="ex-fredoka text-[18px] font-semibold">{ex.merchant}</div>
          <div className="text-[13px] font-bold" style={{ color: C.muted }}>Blocked</div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-2.5 p-4" style={{ background: 'radial-gradient(ellipse at 80% 85%, #24202c 0%, #15131a 55%)' }}>
        <div className="ex-in flex items-center gap-3 rounded-[18px] px-4 py-3" style={{ background: C.coral, color: C.bg, animationDelay: '.1s' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9.4-8.8A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.4 5.2C19 15.6 12 20 12 20z" /><path d="M12 6l-2 4 3 2.5-2 4" /></svg>
          <div className="flex flex-col">
            <span className="ex-fredoka text-[17px] font-semibold">Blocked</span>
            <span className="text-[13px] font-bold">{ex.merchant} won&apos;t be texting you again.</span>
          </div>
        </div>
        {chip('Before')}
        <div className="ex-in max-w-[82%] self-start px-4 py-3 text-[16px]" style={{ background: C.card, borderRadius: '20px 20px 20px 6px', animationDelay: '.6s' }}>{line}</div>
        {chip('Today')}
        <div className="ex-in flex max-w-[78%] flex-col items-end gap-1 self-end" style={{ animationDelay: '1.2s' }}>
          <div className="px-4 py-3 text-[16px] font-bold" style={{ background: C.coral, color: C.bg, borderRadius: '20px 20px 6px 20px' }}>I cancelled. We&apos;re done, and that&apos;s okay.</div>
          <div className="text-[12px] font-bold" style={{ color: C.mint }}>✓✓ Left on read</div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="ex-in flex flex-col gap-2" style={{ animationDelay: '1.8s' }}>
            <div className="w-fit rounded-full px-4 py-2 text-[14px] font-bold" style={{ border: `2px solid ${C.mint}`, background: '#173b33' }}>
              <span className="ex-fredoka text-[19px] font-bold" style={{ color: C.mint }}>+{yearly(ex.monthly)}</span> a year back
            </div>
            <GlowUpFund glow={glow} compact className="w-[200px] rounded-2xl px-3 py-2.5" />
          </div>
          <div className="flex flex-col items-end pt-14">
            <GhostPal pickKey={pickKey} mood="happy" motion="dance" width={112} speed={2.1} side="left" bubble={pick.healedBubble} bubbleWidth={120} bubbleDelay="2.2s" bubbleClass="text-[13px]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-[22px] pt-3.5" style={{ background: C.bar, borderTop: `1px solid ${C.barLine}` }}>
        <div className="text-center text-[13px]" style={{ color: C.muted }}>{ex.merchant} is on your Blocked list.</div>
        <div className="grid grid-cols-2 gap-2.5">
          <GhostButton onClick={() => setRun((value) => value + 1)}>Replay</GhostButton>
          <PrimaryButton onClick={onNext}>Next ex</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
