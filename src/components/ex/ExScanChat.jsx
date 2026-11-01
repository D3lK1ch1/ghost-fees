import { Upload } from 'lucide-react';
import { C, GhostPal, PrimaryButton, SilverPhone } from './ExKit';

const Dots = ({ color }) => (
  <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
    <span className="ex-dot" style={{ background: color }} />
    <span className="ex-dot" style={{ background: color, animationDelay: '.15s' }} />
    <span className="ex-dot" style={{ background: color, animationDelay: '.3s' }} />
  </span>
);

const them = { background: C.card, borderRadius: '20px 20px 20px 6px' };

// Scene 1, design screen Ex2Scanning: Ghost Fees texts you while it reads the
// statement, then counts the exes. The file name and the count are real.
// Shown inside the silver phone. The message bar at the bottom is the upload
// button: on the sample it asks for your own statement, otherwise another one.
export default function ExScanChat({ pick, pickKey, count, fileName, sample, onNext, onUpload }) {
  return (
    <SilverPhone screenClassName="min-h-[740px]">
      <div className="relative z-[1] flex items-center gap-3 px-4 pb-3.5 pt-[52px]" style={{ background: C.bar, borderBottom: `1px solid ${C.barLine}` }}>
        <img src={pick.avatar} alt="" className="h-[42px] w-[42px] flex-none rounded-full object-cover" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="ex-fredoka text-[18px] font-semibold">Ghost Fees</div>
          <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: C.mint }}>Ghost Fees is typing <Dots color={C.mint} /></div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-2.5 p-4" style={{ background: 'radial-gradient(ellipse at 80% 85%, #24202c 0%, #15131a 55%)' }}>
        <div className="relative self-center rounded-full px-3 py-1 text-[12px] font-bold" style={{ color: C.muted, background: C.card }}>Today</div>
        <div className="ex-in relative flex max-w-[78%] flex-col items-end gap-1 self-end" style={{ animationDelay: '.2s' }}>
          <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ borderRadius: '20px 20px 6px 20px', background: C.coral, color: C.bg }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>
            <div className="flex flex-col"><span className="break-all text-[15px] font-extrabold">{fileName}</span><span className="text-[12px] font-bold">Here&apos;s everything. Be honest.</span></div>
          </div>
          <div className="text-[12px]" style={{ color: C.muted }}>Delivered</div>
        </div>
        <div className="ex-in relative max-w-[80%] self-start px-4 py-3 text-[16px]" style={{ ...them, animationDelay: '.85s' }}>Going through your messages...</div>
        <div className="ex-in relative max-w-[80%] self-start px-4 py-3 text-[16px]" style={{ ...them, animationDelay: '1.4s' }}>Found someone who never calls...</div>
        <div className="ex-in relative flex max-w-[86%] items-center gap-3 self-start px-4 py-3.5" style={{ ...them, border: `1.5px solid ${C.coral}`, animationDelay: '1.95s' }}>
          <span className="ex-fredoka text-[40px] font-bold leading-none" style={{ color: C.coral }}>{count}</span>
          <span className="text-[17px] font-extrabold leading-snug">Found {count} {count === 1 ? 'ex' : 'exes'} still charging you</span>
        </div>
        <div className="ex-in relative flex max-w-[78%] flex-col items-end gap-1 self-end" style={{ animationDelay: '2.5s' }}>
          <div className="ex-fredoka px-4 py-3 text-[17px] font-semibold" style={{ borderRadius: '20px 20px 6px 20px', background: C.coral, color: C.bg }}>{pick.scanBubble}</div>
          <div className="text-[12px] font-bold" style={{ color: C.mint }}>✓✓ Read</div>
        </div>
        <div className="ex-in relative flex gap-[5px] self-start px-4 py-3.5" aria-hidden="true" style={{ ...them, animationDelay: '3s' }}><Dots color={C.soft} /></div>
        <div className="mt-auto flex items-end justify-end gap-1 self-end pt-6">
          <GhostPal pickKey={pickKey} mood="focused" width={128} speed={3.25} drift={7.3} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-[22px] pt-3.5" style={{ background: C.bar, borderTop: `1px solid ${C.barLine}` }}>
        <PrimaryButton onClick={onNext} delay="3.3s">Show me who</PrimaryButton>
        {onUpload ? (
          <button
            type="button"
            onClick={onUpload}
            className="ex-btn ex-in flex min-h-[44px] w-full items-center gap-2.5 rounded-[22px] px-4 text-left text-[15px] font-bold"
            style={{ background: C.card, color: C.soft, border: `1px solid ${C.line}`, animationDelay: '3.4s' }}
          >
            <span className="flex-1">{sample ? 'Upload your own statement' : 'Upload another statement'}</span>
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: C.mint, color: C.mintInk }}>
              <Upload className="h-4 w-4" strokeWidth={2.6} />
            </span>
          </button>
        ) : (
          <div aria-hidden="true" className="flex min-h-[44px] items-center rounded-[22px] px-4 text-[15px]" style={{ background: C.card, color: C.faint }}>Reading between the lines...</div>
        )}
        <div className="text-center text-[11.5px]" style={{ color: C.faint }}>PDF or CSV bank statements · read in your browser</div>
      </div>
    </SilverPhone>
  );
}
