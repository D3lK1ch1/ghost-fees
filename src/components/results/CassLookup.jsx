import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Mail, Phone } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import { money } from '@/lib/ghostFees/format';
import { cachedLookup, findCancelInfo } from '@/lib/ghostFees/cancelLookup';
import { cn } from '@/lib/utils';

export const CASS_COLOR = '#f2a65a';

function cancelEmail(info, monthly) {
  const subject = `Please cancel my ${info.company} subscription`;
  const body = `Hi ${info.company},

Please cancel my subscription, effective today.${monthly ? ` It costs me ${money(monthly)} a month and I no longer use it.` : ''}

Please:
1. Cancel it today so there are no further charges.
2. Refund any charge taken after today.
3. Confirm the cancellation by email.

Kind regards,
[Your name]
[Account email or number]`;
  return { subject, body };
}

// Cass's answer card: official cancel page, steps, phone, support email or page,
// a ready email to that address, and where it came from. Works in every theme.
export default function CassLookup({ merchant, monthly, auto = false, className = '' }) {
  const [info, setInfo] = useState(() => cachedLookup(merchant));
  const [state, setState] = useState(info ? 'done' : 'idle');
  const [copied, setCopied] = useState(false);

  const look = async () => {
    setState('loading');
    try {
      setInfo(await findCancelInfo(merchant));
      setState('done');
    } catch {
      setState('error');
    }
  };
  useEffect(() => {
    if (auto && state === 'idle') look();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, merchant]);

  if (state === 'idle' || state === 'error') {
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl border border-dashed p-3', className)} style={{ borderColor: `${CASS_COLOR}88` }}>
        <GhostMark className="h-8 w-8 shrink-0 animate-float" style={{ color: CASS_COLOR }} eyeColor="#1a1230" />
        <div className="min-w-0 flex-1 text-[13px] text-foreground">
          {state === 'error' ? 'Cass couldn’t reach the internet just now.' : <>Ask <b>Cass</b>, the cancel ghost, to find the official link, steps and phone number for {merchant}.</>}
        </div>
        <button type="button" onClick={look} className="shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-bold text-[#1a1230]" style={{ background: CASS_COLOR }}>
          {state === 'error' ? 'Try again' : 'Ask Cass'}
        </button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl border p-3', className)} style={{ borderColor: `${CASS_COLOR}88` }} aria-live="polite">
        <span className="flex gap-1">{[0, 1, 2].map((i) => <GhostMark key={i} className="h-5 w-5 animate-bob" style={{ color: CASS_COLOR, animationDelay: `${i * 0.2}s` }} eyeColor="#1a1230" />)}</span>
        <span className="text-[13px] text-muted-foreground">Cass is searching {merchant}&apos;s official site...</span>
      </div>
    );
  }

  if (!info?.found) {
    return (
      <div className={cn('rounded-2xl border p-3 text-[13px] text-foreground', className)} style={{ borderColor: `${CASS_COLOR}88` }}>
        <b>Cass couldn&apos;t confirm who &quot;{merchant}&quot; is.</b> Check your sign-up email for the company name, or search their official site for &quot;cancel subscription&quot;.
      </div>
    );
  }

  const mail = cancelEmail(info, monthly);
  const mailto = info.email ? `mailto:${info.email}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}` : null;
  const copy = async () => {
    await navigator.clipboard.writeText(mail.body);
    setCopied(true);
  };

  return (
    <div className={cn('rounded-2xl border bg-background/40 p-4', className)} style={{ borderColor: `${CASS_COLOR}aa` }}>
      <div className="flex items-center gap-2.5">
        <GhostMark className="h-7 w-7 shrink-0 animate-float" style={{ color: CASS_COLOR }} eyeColor="#1a1230" />
        <p className="min-w-0 flex-1 font-heading text-[15px] font-bold text-foreground">How to cancel {info.company}</p>
        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: info.confidence === 'high' ? '#5ee6c8' : `${CASS_COLOR}33`, color: info.confidence === 'high' ? '#12302a' : CASS_COLOR }}>
          {info.confidence === 'high' ? 'Official' : 'Double-check'}
        </span>
      </div>

      {info.cancelUrl && (
        <a href={info.cancelUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-[13.5px] font-bold text-primary-foreground">
          Open the cancel page <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {info.steps.length > 0 && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[13.5px] text-foreground">
          {info.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      )}
      {info.appStoreNote && <p className="mt-2 text-[12.5px] text-muted-foreground">{info.appStoreNote}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {info.phone && (
          <a href={`tel:${info.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-bold text-foreground hover:border-primary/60">
            <Phone className="h-4 w-4" /> {info.phone}{info.phoneHours ? <span className="font-normal text-muted-foreground"> · {info.phoneHours}</span> : null}
          </a>
        )}
        {mailto && (
          <a href={mailto} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-bold text-foreground hover:border-primary/60">
            <Mail className="h-4 w-4" /> Email {info.email}
          </a>
        )}
        {!info.email && info.supportUrl && (
          <a href={info.supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-bold text-foreground hover:border-primary/60">
            Contact page <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-bold text-foreground hover:border-primary/60">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Email copied' : 'Copy cancel email'}
        </button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Cass checked online on {info.checkedAt}. {info.confidence === 'high' ? 'From the official site.' : 'Not all from the official site, so double-check before you call or pay.'}
        {info.sources.length > 0 && <> Sources: {info.sources.map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer" className="underline">{i ? ', ' : ''}{new URL(src).hostname.replace(/^www\./, '')}</a>)}.</>}
      </p>
    </div>
  );
}
