import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { GHOST_IT_MASCOT, GHOST_IT_PRICE, GHOST_IT_PROFILE, GHOST_IT_SAMPLE, GHOST_IT_THUMBS } from '@/lib/ghostFees/ghostItAgent';
import { base44 } from '@/api/base44Client';
import { getSessionId } from '@/lib/session';

// /ghostit: the one link to share for testing Ghost It (our Fetch.ai agent).
// Short on purpose: what it does, a message to copy, one button. The web app is a
// separate, optional next step, so nobody has to understand both at once.
const STEPS = [
  { title: 'Copy the test message', line: 'Or type your own: what you pay for, in plain words.' },
  { title: 'Open Ghost It and press "Chat with Agent"', line: 'It opens ASI:One already talking to Ghost It. Sign in to ASI:One if it asks (free).' },
  { title: 'Paste and send', line: 'You get the yearly cost line by line, any double-ups, and the cancel steps.' },
];

const count = (event_type) => base44.functions.invoke('logEvent', { session_id: getSessionId(), event_type }).catch(() => {});

export default function GhostIt() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(GHOST_IT_SAMPLE);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    count('ghostit_page_copy');
  };

  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-xl px-5 pb-16">
        <div className="text-center">
          <img src={GHOST_IT_MASCOT} alt="Ghost It, a friendly ghost waving with a chat bubble" width={170} height={170} className="motion-safe:animate-float mx-auto h-[170px] w-[170px] object-contain drop-shadow-[0_0_30px_rgba(143,184,255,0.35)]" />
          <h1 className="mt-4 font-heading text-[32px] font-bold leading-tight text-foreground">Try Ghost It</h1>
          <p className="mt-2 text-[16px] leading-snug text-muted-foreground">
            Our AI agent on Fetch.ai&apos;s ASI:One. Tell it what you pay for and it shows the yearly cost, spots double-ups and gives you the official cancel steps. 1 minute, nothing to install.
          </p>
        </div>

        <ol className="mt-6 flex flex-col gap-2.5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-[15px] font-bold text-primary-foreground">{index + 1}</span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold text-foreground">{step.title}</span>
                <span className="block text-[14.5px] leading-snug text-muted-foreground">{step.line}</span>
                {index === 0 && (
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="rounded-xl bg-background/70 px-3 py-2 text-[14px] text-foreground">{GHOST_IT_SAMPLE}</code>
                    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-primary/70 px-3.5 py-2 text-[14px] font-bold text-foreground hover:bg-primary/15">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
                    </button>
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>

        <a
          href={GHOST_IT_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => count('ghostit_page_open')}
          className="mt-5 flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary text-[17px] font-bold text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.35)]"
        >
          <MessageCircle className="h-5 w-5" /> Open Ghost It <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-2 text-center text-[13.5px] text-muted-foreground">Opens Ghost It&apos;s page on Agentverse. Press <b className="text-foreground">Chat with Agent</b> there. Sign in to ASI:One first (free): agents only reply to signed-in people.</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-primary/60 bg-primary/10 px-4 py-3 text-[14px] leading-snug text-muted-foreground">
          <img src={GHOST_IT_THUMBS} alt="" className="h-14 w-14 shrink-0 object-contain" />
          <p><b className="text-foreground">Free trial: 1 try.</b> {GHOST_IT_PRICE}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card/50 px-4 py-3.5 text-[14.5px] text-muted-foreground">
          <b className="text-foreground">Want to find the ones you forgot?</b> Ghost It works from what you tell it. Our web app, Ghost Fees, reads a bank statement instead (no bank login).{' '}
          <a href="/try" className="font-bold text-primary underline-offset-4 hover:underline">Try the web app</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
