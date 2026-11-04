import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Download } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import WatchVideos from '@/components/site/WatchVideos';
import shipped from '@/data/shipped.json';
import { WHY_LINE } from '@/data/founders';

// /media (4 Nov): everything for sharing and press in one place. The videos (promo
// first), a press kit (logo, the one-line pitch, the facts) and a build diary made
// from what we shipped each day of the hackathon.
const PITCH = 'Ghost Fees finds the subscriptions you forgot and helps you cancel them in one click. No bank login, no upload needed, $10 once and never a subscription.';
const FACTS = [
  ['What', 'Finds forgotten subscriptions, double ups, trials that turned paid and price rises, then cancels them'],
  ['Price', 'Free to try. Pro $10 once. Ghost It (AI agent): first pack free, then $5 once'],
  ['Built at', 'Stranger Builds, a NerdConf hackathon in Melbourne (31 Oct to 8 Nov 2026)'],
  ['Built with', 'Base44 (web app) and Fetch.ai (Ghost It agent on ASI:One)'],
];
const LOGOS = [
  { file: '/icon-512.png', label: 'App icon (PNG)' },
  { file: '/favicon.svg', label: 'App icon (SVG)' },
  { file: '/og-image.png', label: 'Share image (1200 x 630)' },
];

function CopyPitch() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(PITCH).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {})}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground hover:border-primary/60"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy the pitch'}
    </button>
  );
}

const day = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });

export default function Media() {
  const days = [...new Set(shipped.map((item) => item.date))];
  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-6 sm:px-8">
        <p className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary">Media</p>
        <h1 className="mt-1 font-heading text-[2rem] font-bold leading-tight text-foreground">Videos, press kit and build diary</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Everything you need to share or write about Ghost Fees.</p>

        <WatchVideos keys={['promo', 'demo', 'progress']} line="The promo to share, the demo to see it work, and how far we've come." />

        <section className="mt-10" aria-labelledby="press-kit">
          <h2 id="press-kit" className="text-[18px] font-semibold text-foreground">Press kit</h2>
          <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <p className="text-[15px] leading-relaxed text-foreground">{PITCH}</p>
            <div className="mt-3"><CopyPitch /></div>
            <dl className="mt-4 divide-y divide-white/[0.06] text-[14px]">
              {FACTS.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{WHY_LINE} <Link to="/about" className="font-semibold text-primary underline-offset-4 hover:underline">Meet the founders</Link></p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {LOGOS.map((logo) => (
                <li key={logo.file}>
                  <a href={logo.file} download className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground hover:border-primary/60">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> {logo.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="build-diary">
          <h2 id="build-diary" className="text-[18px] font-semibold text-foreground">Build diary</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">What we shipped each day. The full list, with what people told us, is on <Link to="/progress" className="font-semibold text-primary underline-offset-4 hover:underline">Our progress</Link>.</p>
          <ol className="mt-3 space-y-3">
            {days.map((date, index) => {
              const items = shipped.filter((item) => item.date === date);
              return (
                <li key={date} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <p className="text-[12.5px] font-semibold uppercase tracking-wide text-primary">Day {index + 1} · {day(date)}</p>
                  <p className="mt-1 text-[15px] font-semibold text-foreground">{items.length} thing{items.length === 1 ? '' : 's'} shipped</p>
                  <ul className="mt-2 space-y-1 text-[14px] leading-snug text-muted-foreground">
                    {items.slice(0, 4).map((item) => <li key={item.title}>· {item.title}</li>)}
                  </ul>
                  {items.length > 4 && (
                    <details className="mt-1 text-[14px] text-muted-foreground">
                      <summary className="cursor-pointer font-semibold text-foreground/90">{items.length - 4} more</summary>
                      <ul className="mt-1 space-y-1">{items.slice(4).map((item) => <li key={item.title}>· {item.title}</li>)}</ul>
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
