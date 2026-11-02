import { ExternalLink, Search } from 'lucide-react';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';

// Straight to the company's own cancel page, on every ghost card that's a
// subscription. A checked official link when we have one; otherwise a web search
// for their official cancel page (never a guessed link). Bank fees don't get one:
// you ask the bank to waive those instead.
export default function CancelSiteLink({ leak, className = '', style, compact = false }) {
  if (leak.action !== 'cancel' && leak.badge !== 'Trial converted') return null;
  const merchant = leak.merchant || leak.title || '';
  const info = cancelInfo(merchant);
  const href = info.url || `https://www.google.com/search?q=${encodeURIComponent(`${merchant} cancel subscription official site`)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={compact ? `flex w-full items-center justify-center gap-1 rounded-lg border-2 py-1 text-[12px] font-bold ${className}` : `flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-[15px] font-bold transition-colors ${className}`}
      style={style}
    >
      {compact ? <>{info.url ? 'Cancel it' : 'Find it'} <ExternalLink className="h-3 w-3" aria-hidden="true" /></> : info.url ? <>Cancel on {info.name}&apos;s site <ExternalLink className="h-4 w-4" aria-hidden="true" /></> : <><Search className="h-4 w-4" aria-hidden="true" /> Find {info.name}&apos;s cancel page</>}
    </a>
  );
}
