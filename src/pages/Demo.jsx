import { useEffect, useMemo, useState } from 'react';
import '@/components/ex/exKit.css';
import './demo.css';
import FkJar from '@/components/ex/FkJar';

// /demo: a 36-second animated walkthrough to screen-record (Cmd + Shift + 5) for
// Slack, the hackathon submission and stories. Big one-word captions, real ghost
// art and the sample statement's real numbers. ?ratio=16x9 (default), 1x1 or 9x16.
// Press Start, then R to replay. Nothing here is sent anywhere.

const SCENE_MS = 6000;
const C = { bg: '#150e28', ink: '#1b1233', cream: '#fbf8fa', pink: '#ff6f7d', mint: '#5ee6c8', gold: '#ffd36e', muted: '#b9adcc', card: '#241a3d', line: '#3a2d5c' };

// The built-in sample statement, exactly as the app finds it.
const LEAKS = [
  { name: 'Streammax', badge: 'Trial converted', amount: 113.94 },
  { name: 'Monthly Account Fee', badge: 'Bank fee', amount: 105 },
  { name: 'Adobe Creative Cloud', badge: 'Duplicate', amount: 59.98 },
  { name: 'Late Payment Fee', badge: 'Bank fee', amount: 12 },
  { name: 'Spotify', badge: 'Price creep', amount: 6 },
];
const TOTAL = 296.92;
const money = (value) => `$${value.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function useCountUp(target, start, ms = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    let frame;
    const began = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - began) / ms);
      setValue(target * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, ms]);
  return value;
}

const Bubble = ({ me, delay, children }) => (
  <div className={`dm-in max-w-[82%] px-4 py-2.5 text-[15px] leading-snug ${me ? 'self-end' : 'self-start'}`} style={{ animationDelay: `${delay}s`, borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: me ? C.pink : '#2e2645', color: me ? C.ink : C.cream, fontWeight: me ? 800 : 600 }}>
    {children}
  </div>
);

function SceneUpload() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: C.line }}>
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full" style={{ background: '#2e2645', border: `1.5px solid ${C.mint}` }}><img src="/themes/ex/tilly.webp" alt="" className="h-9 w-auto translate-y-1" /></span>
        <div><div className="ex-fredoka text-[17px] font-semibold">Tilly</div><div className="text-[12px] font-bold" style={{ color: C.mint }}>Tilly is typing...</div></div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Bubble me delay={0.4}>📄 my-statement.csv<br /><span className="text-[12px]">Here&apos;s everything. Be honest.</span></Bubble>
        <Bubble delay={1.4}>Going through your messages...</Bubble>
        <Bubble delay={2.4}>Found someone who never calls...</Bubble>
        <div className="dm-pop mt-1 flex items-center gap-3 self-start rounded-2xl px-4 py-3" style={{ animationDelay: '3.4s', border: `1.5px solid ${C.pink}`, background: '#2a1f3f' }}>
          <span className="ex-fredoka text-[34px] font-bold" style={{ color: C.pink }}>5</span>
          <span className="text-[15px] font-extrabold">ghosts still charging you</span>
        </div>
      </div>
    </div>
  );
}

function SceneFound({ active }) {
  const total = useCountUp(TOTAL, active, 2200);
  return (
    <div className="flex h-full flex-col p-5">
      <div className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: C.muted }}>You found</div>
      <div className="ex-fredoka text-[52px] font-bold leading-none" style={{ color: C.gold }}>{money(total)}</div>
      <div className="mb-3 text-[13px] font-bold" style={{ color: C.muted }}>in 7 months, from your own statement</div>
      <div className="flex flex-col gap-2">
        {LEAKS.map((leak, index) => (
          <div key={leak.name} className="dm-in flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5" style={{ animationDelay: `${0.5 + index * 0.45}s`, background: '#2a1f3f', border: index === 0 ? `1.5px solid #ffa25a` : `1px solid ${C.line}` }}>
            <span className="min-w-0"><span className="block truncate text-[15px] font-extrabold">{leak.name}</span><span className="text-[12px] font-bold" style={{ color: C.muted }}>{leak.badge}</span></span>
            <span className="ex-fredoka text-[18px] font-semibold" style={{ color: C.pink }}>{money(leak.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneBlock({ active }) {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    setBlocked(false);
    if (!active) return undefined;
    const timer = setTimeout(() => setBlocked(true), 2300);
    return () => clearTimeout(timer);
  }, [active]);
  return (
    <div className="relative flex h-full flex-col gap-3 p-5">
      <div className="rounded-2xl p-4" style={{ background: '#2a1f3f', border: `1.5px solid ${blocked ? C.mint : C.line}` }}>
        <div className="flex items-center gap-3">
          <img src="/themes/ex/exav-gym.webp" alt="" className="h-12 w-12 object-contain" />
          <div className="flex-1"><div className="ex-fredoka text-[19px] font-semibold">Fitlife Gym</div><div className="text-[12.5px]" style={{ color: C.muted }}>Membership</div></div>
          <div className="ex-fredoka text-[19px] font-semibold">$45.00/mo</div>
        </div>
        <div className="mt-3 rounded-xl px-3 py-2 text-[14px]" style={{ background: '#352a4d' }}>You never visit anymore. I still bill you though.</div>
        <div className="mt-3 rounded-xl py-3 text-center text-[16px] font-extrabold transition-colors duration-300" style={blocked ? { border: `2px solid ${C.mint}`, color: C.mint } : { background: C.pink, color: C.ink }}>
          {blocked ? '✓ Blocked · $540.00/yr in your jar' : '💔 Block and delete'}
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between">
        <div className="flex flex-col items-center">
          <FkJar amount={blocked ? 540 : 0} total={1331.64} size={112} />
        </div>
        <img src={blocked ? '/themes/ex/ghost-happy.webp' : '/themes/ex/ghost-sad.webp'} alt="" className={`h-[120px] w-auto ${blocked ? 'ex-dance' : 'ex-breathe'}`} style={{ '--gs': '1.8s' }} />
      </div>
      {active && <span aria-hidden="true" className="dm-cursor pointer-events-none absolute text-[34px]">👆</span>}
    </div>
  );
}

function SceneCancel() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <img src="/themes/haunted/lantern-ghost.webp" alt="" className="ex-float h-14 w-auto" />
        <div><div className="ex-fredoka text-[19px] font-semibold">Cassy</div><div className="text-[12.5px] font-bold" style={{ color: C.gold }}>Your cancellation assistant</div></div>
      </div>
      <div className="dm-in rounded-2xl p-4" style={{ animationDelay: '0.6s', background: '#2a1f3f', border: `1.5px solid ${C.gold}` }}>
        <div className="flex items-center justify-between"><span className="text-[16px] font-extrabold">How to cancel Netflix</span><span className="rounded-full px-2 py-0.5 text-[11px] font-black" style={{ background: C.mint, color: C.ink }}>OFFICIAL</span></div>
        <ol className="mt-2 space-y-1 text-[14px]" style={{ color: C.cream }}>
          <li className="dm-in" style={{ animationDelay: '1.3s' }}>1. Account &gt; Membership</li>
          <li className="dm-in" style={{ animationDelay: '1.8s' }}>2. Cancel membership</li>
          <li className="dm-in" style={{ animationDelay: '2.3s' }}>3. Confirm cancel</li>
        </ol>
      </div>
      <div className="dm-in flex gap-2" style={{ animationDelay: '3s' }}>
        <span className="rounded-full px-3.5 py-2 text-[14px] font-extrabold" style={{ border: `1.5px solid ${C.pink}` }}>Cancel on Netflix ↗</span>
        <span className="dm-pop rounded-full px-3.5 py-2 text-[14px] font-extrabold" style={{ animationDelay: '3.8s', background: C.mint, color: C.ink }}>✓ Cancel email copied</span>
      </div>
    </div>
  );
}

function SceneAsk() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.line }}>
        <span className="ex-fredoka text-[18px] font-semibold">ASI:One</span><span className="text-[12px] font-bold" style={{ color: C.muted }}>· Fetch.ai</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Bubble me delay={0.4}>@ghostit Netflix $19, Stan $16, Disney+ $16</Bubble>
        <div className="dm-in self-start rounded-2xl px-4 py-3 text-[14.5px]" style={{ animationDelay: '1.6s', background: '#2e2645', borderRadius: '18px 18px 18px 4px' }}>
          <div className="ex-fredoka text-[17px] font-semibold">👻 Your ghost check</div>
          <div className="mt-1"><b>Screen Pack:</b> $612 a year</div>
          <div className="dm-in" style={{ animationDelay: '2.4s' }}>3 streaming services. Keep the one you use.</div>
          <div className="dm-in mt-1.5 font-bold" style={{ animationDelay: '3.2s', color: C.mint }}>🎁 Your first Ghost Pack is free.</div>
        </div>
      </div>
    </div>
  );
}

function SceneFree() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-5 text-center">
      <div className="flex items-end gap-2">
        <img src="/themes/haunted/lantern-ghost.webp" alt="" className="ex-float h-[110px] w-auto" />
        <img src="/themes/ex/tilly.webp" alt="" className="ex-dance h-[130px] w-auto" style={{ '--gs': '2.2s' }} />
        <img src="/themes/christmas/xc-festive.webp" alt="" className="ex-float h-[100px] w-auto" style={{ animationDelay: '0.6s' }} />
      </div>
      <div className="ex-fredoka text-[38px] font-bold leading-tight">Ghost Fees</div>
      <div className="text-[17px] font-bold" style={{ color: C.gold }}>Find the money haunting your account</div>
      <div className="rounded-full px-5 py-2.5 text-[16px] font-extrabold" style={{ background: C.mint, color: C.ink }}>hunt-ghost-fees.base44.app</div>
      <div className="text-[13px] font-bold" style={{ color: C.muted }}>No sign-in. CSVs never leave your browser.</div>
    </div>
  );
}

const SCENES = [
  { word: 'Upload.', line: 'Drop in a bank statement. It never leaves your browser.', Body: SceneUpload },
  { word: 'Found.', line: 'Forgotten subscriptions, double charges, sneaky fees.', Body: SceneFound },
  { word: 'Block.', line: 'Cancel your exes, keep proof, watch the jar fill.', Body: SceneBlock },
  { word: 'Cancel.', line: 'Cassy finds the official page and writes the email.', Body: SceneCancel },
  { word: 'Ask.', line: 'Or tell Ghost It on ASI:One what you pay.', Body: SceneAsk },
  { word: 'Free to try.', line: 'Your first scan is on us.', Body: SceneFree },
];

const RATIOS = { '16x9': [1280, 720], '1x1': [1080, 1080], '9x16': [720, 1280] };

export default function Demo() {
  const ratioKey = useMemo(() => new URLSearchParams(window.location.search).get('ratio'), []);
  const [w, h] = RATIOS[ratioKey] || RATIOS['16x9'];
  const tall = h > w;
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!started) return undefined;
    if (scene >= SCENES.length - 1) return undefined;
    const timer = setTimeout(() => setScene((value) => value + 1), SCENE_MS);
    return () => clearTimeout(timer);
  }, [started, scene, run]);

  useEffect(() => {
    const key = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        setScene(0);
        setRun((value) => value + 1);
        setStarted(true);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const { word, line, Body } = SCENES[scene];
  // Fit the fixed-size stage into the window, so it records crisply at any size.
  const scale = Math.min(window.innerWidth / w, window.innerHeight / h, 1.5);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#0b0716' }}>
      <div className="dm-stage relative overflow-hidden" style={{ width: w, height: h, transform: `scale(${scale})`, background: `radial-gradient(ellipse at 80% 20%, rgba(255,111,125,0.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(94,230,200,0.16), transparent 55%), ${C.bg}`, color: C.cream }}>
        <div className="absolute left-0 right-0 top-0 h-1.5" style={{ background: C.line }}>
          {started && <div key={`${run}-${scene}`} className="dm-progress h-full" style={{ background: C.pink, animationDuration: `${SCENE_MS}ms` }} />}
        </div>

        {!started ? (
          <button type="button" onClick={() => setStarted(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <span className="ex-fredoka text-[44px] font-bold">Ghost Fees demo</span>
            <span className="rounded-full px-6 py-3 text-[18px] font-extrabold" style={{ background: C.pink, color: C.ink }}>Start recording, then click here</span>
            <span className="text-[14px]" style={{ color: C.muted }}>{w} × {h}. Try ?ratio=1x1 or ?ratio=9x16. Press R to replay.</span>
          </button>
        ) : (
          <div key={`${run}-${scene}`} className={`absolute inset-0 flex ${tall ? 'flex-col px-12 pb-14 pt-20' : 'items-center px-20'} gap-10`}>
            <div className={tall ? 'text-center' : 'w-[46%]'}>
              <div className="dm-word ex-fredoka font-bold leading-none" style={{ fontSize: tall ? 96 : 118 }}>{word}</div>
              <div className="dm-in mt-5 font-bold leading-snug" style={{ animationDelay: '0.35s', fontSize: tall ? 26 : 28, color: C.muted }}>{line}</div>
            </div>
            <div className={`dm-device relative overflow-hidden rounded-[28px] ${tall ? 'mx-auto mt-auto h-[720px] w-[520px]' : 'ml-auto h-[540px] w-[470px]'}`} style={{ background: C.card, border: `2px solid ${C.line}`, boxShadow: '0 30px 80px -30px rgba(0,0,0,0.8)' }}>
              <Body active />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
