import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { toast } from '@/components/ui/use-toast';
import { getSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';

// /try: one link for testers. Three steps (sample scan, Ghost It on ASI:One, one
// feedback form), with progress kept in this browser. Logs ref "try".
const KEY = 'ghostFees.try.v1';
export const TRY_RETURN = 'ghostFees.tryReturn';
export const ASK_TEXT = '@ghostit Netflix $19, Stan $16, Disney+ $16, Spotify $14';
// Visits and clicks from local development don't count in the real numbers.
const isLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export const loadTry = () => {
  try {
    return { app: false, agent: false, feedback: false, ...JSON.parse(window.localStorage.getItem(KEY) || '{}') };
  } catch {
    return { app: false, agent: false, feedback: false };
  }
};
export const markTry = (step) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...loadTry(), [step]: true }));
  } catch {
    // Storage off: progress lasts for this visit only.
  }
};

function Scale({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[14.5px] font-bold text-foreground">{label}</p>
      <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)} className={cn('h-10 w-10 rounded-xl border text-[15px] font-bold', value === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')}>
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">1 = confusing, 5 = really clear</p>
    </div>
  );
}

// One step card. Defined outside the page so the form inside keeps its state
// (and the text box keeps focus) when the page re-renders.
function Step({ n, title, children, isDone }) {
  return (
    <section className={cn('rounded-3xl border p-5', isDone ? 'border-[#5ee6c8]/60 bg-[#5ee6c8]/[0.05]' : 'border-border bg-card')}>
      <div className="flex items-center gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-[16px] font-bold', isDone ? 'bg-[#5ee6c8] text-[#0f2a24]' : 'bg-primary text-primary-foreground')}>{isDone ? '✓' : n}</span>
        <h2 className="font-heading text-[19px] font-bold text-foreground">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function Try() {
  const [done, setDone] = useState(loadTry);
  const [form, setForm] = useState({ clarity_app: null, clarity_agent: null, confusion_text: '', would_pay: '', quote_ok: false, builder_name: '' });
  const [sending, setSending] = useState(false);
  const count = ['app', 'agent', 'feedback'].filter((key) => done[key]).length;

  useEffect(() => {
    if (!isLocal()) base44.functions.invoke('logRefVisit', { ref: 'try', subs_count: 0 }).catch(() => {});
    const refresh = () => setDone(loadTry());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const startSample = () => {
    try {
      window.sessionStorage.setItem(TRY_RETURN, '1');
    } catch {
      // Without storage, the back button still works.
    }
    window.location.href = '/#ghosts';
  };

  const askGhostIt = async () => {
    try {
      await navigator.clipboard.writeText(ASK_TEXT);
      toast({ title: 'Copied. Paste it in ASI:One', description: ASK_TEXT });
    } catch {
      toast({ title: 'Type this in ASI:One', description: ASK_TEXT });
    }
    window.open('https://asi1.ai', '_blank', 'noopener');
    if (!isLocal()) base44.functions.invoke('logEvent', { session_id: getSessionId(), event_type: 'ask_ghostit_click' }).catch(() => {});
    markTry('agent');
    setDone(loadTry());
  };

  const send = async () => {
    setSending(true);
    try {
      await base44.functions.invoke('submitFeedback', { session_id: getSessionId(), kind: 'journey', used_sample: true, ...form, builder_name: form.quote_ok ? form.builder_name : '' });
      markTry('feedback');
      setDone(loadTry());
    } catch {
      toast({ title: 'Could not send that', description: 'Try again in a moment.' });
    } finally {
      setSending(false);
    }
  };

  const allDone = count === 3;
  const share = async () => {
    const text = 'Try Ghost Fees in 3 minutes: find the subscriptions haunting your bank account 👻';
    const url = `${window.location.origin}/try`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast({ title: 'Link copied' });
      }
    } catch {
      // Share cancelled.
    }
  };


  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-xl px-5 pb-10 sm:px-8">
        <h1 className="font-heading text-[2rem] font-bold leading-tight text-foreground">Try Ghost Fees in 3 minutes</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Three quick steps: our app, our chat agent, then one thing you&apos;d change. It really helps a hackathon team.</p>
        <div className="mt-4" aria-label={`${count} of 3 done`}>
          <div className="flex justify-between text-[13.5px] font-bold text-muted-foreground"><span>{count} of 3 done</span>{allDone && <span className="text-[#5ee6c8]">All done!</span>}</div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(count / 3) * 100}%` }} /></div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <Step n={1} title="Find the ghosts (app)" isDone={done.app}>
            <p className="text-[14px] text-muted-foreground">Run our sample bank statement and see what it finds. A &ldquo;Back to the test&rdquo; button brings you here.</p>
            <button type="button" onClick={startSample} className="mt-3 rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground">{done.app ? 'Try it again' : 'Try a sample statement'}</button>
          </Step>

          <Step n={2} title="Ask Ghost It (agent)" isDone={done.agent}>
            <p className="text-[14px] text-muted-foreground">Ghost It is our chat agent on ASI:One. It shows the maths and the cancel steps.</p>
            <p className="mt-2 rounded-xl bg-background/60 px-3 py-2 font-mono text-[13.5px] text-foreground">{ASK_TEXT}</p>
            <button type="button" onClick={askGhostIt} className="mt-3 rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground">Copy and open ASI:One</button>
          </Step>

          <Step n={3} title="Tell us one thing" isDone={done.feedback}>
            {done.feedback ? (
              <p className="text-[14px] font-semibold text-foreground">Got it, thank you!</p>
            ) : (
              <div className="flex flex-col gap-4">
                <Scale label="How clear was the app?" value={form.clarity_app} onChange={(value) => setForm({ ...form, clarity_app: value })} />
                <Scale label="How clear was Ghost It?" value={form.clarity_agent} onChange={(value) => setForm({ ...form, clarity_agent: value })} />
                <label className="text-[14.5px] font-bold text-foreground">
                  What was confusing?
                  <textarea value={form.confusion_text} maxLength={500} onChange={(event) => setForm({ ...form, confusion_text: event.target.value })} rows={3} className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal" />
                </label>
                <div>
                  <p className="text-[14.5px] font-bold text-foreground">Would you pay $10 once?</p>
                  <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label="Would you pay $10 once?">
                    {['Yes', 'Maybe', 'No'].map((option) => (
                      <button key={option} type="button" role="radio" aria-checked={form.would_pay === option} onClick={() => setForm({ ...form, would_pay: option })} className={cn('rounded-xl border px-4 py-2 text-[14px] font-bold', form.would_pay === option ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')}>{option}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[14.5px] font-bold text-foreground">
                  <input type="checkbox" checked={form.quote_ok} onChange={(event) => setForm({ ...form, quote_ok: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  Can we quote you?
                </label>
                {form.quote_ok && (
                  <input value={form.builder_name} maxLength={40} onChange={(event) => setForm({ ...form, builder_name: event.target.value })} placeholder="First name" aria-label="First name" className="rounded-xl border border-border bg-background px-3 py-2 text-[14px]" />
                )}
                <button type="button" disabled={sending || !(form.clarity_app || form.clarity_agent || form.confusion_text.trim() || form.would_pay)} onClick={send} className="rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground disabled:opacity-40">
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </Step>
        </div>

        {allDone && (
          <div className="mt-5 rounded-3xl border border-[#5ee6c8]/60 bg-[#5ee6c8]/[0.08] p-5 text-center">
            <p className="font-heading text-[22px] font-bold text-foreground">Thank you! You just helped a hackathon team 👻</p>
            <button type="button" onClick={share} className="mt-3 rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground">Share the test</button>
          </div>
        )}

        <p className="mt-6 text-center text-[13.5px] text-muted-foreground">Made-up prices are fine. Ghost Fees never asks for bank logins or card numbers. <Link to="/privacy" className="underline">Privacy</Link></p>
      </main>
      <SiteFooter />
    </div>
  );
}
