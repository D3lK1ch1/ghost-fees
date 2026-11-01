import { Link } from 'react-router-dom';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import FounderCard from '@/components/landing/FounderCard';
import { FOUNDERS, MOMENT } from '@/data/founders';

// "Why we built Ghost Fees". All founder copy lives in src/data/founders.js.
export default function About() {
  const placeholder = MOMENT.startsWith('[');
  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-2xl px-5 pb-6 sm:px-8">
        <h1 className="font-heading text-[2rem] font-bold leading-tight text-foreground">Why we built Ghost Fees</h1>

        <p className={`mt-5 text-[16px] leading-relaxed ${placeholder ? 'rounded-xl border border-dashed border-[#ffc27a] bg-[#ffc27a]/10 px-3 py-2 font-bold text-[#ffc27a]' : 'text-foreground'}`}>
          {MOMENT}
        </p>

        <p className="mt-4 text-[16px] leading-relaxed text-foreground">
          Half of Australians pay for subscriptions they don't use, and most don't notice for months.
          <span className="block text-[12px] text-muted-foreground">Compare the Market, 2026</span>
        </p>

        <p className="mt-4 text-[16px] leading-relaxed text-foreground">
          Ghost Fees finds them, helps you cancel, and checks they actually stopped. No bank login.
          CSV statements never leave your browser, and we never sell your data and keep only what we need.
        </p>

        <h2 className="mt-8 font-heading text-[20px] font-semibold text-foreground">The founders</h2>
        <div className="mt-3 space-y-3">
          {FOUNDERS.map((founder) => <FounderCard key={founder.key} founder={founder} full />)}
        </div>

        <div className="mt-8 rounded-3xl border border-primary/40 bg-primary/10 p-4">
          <p className="font-heading text-[17px] font-semibold text-foreground">Talk to us: we read every message</p>
          <p className="mt-1 text-[13.5px] text-muted-foreground">Tried it? Tell us what confused you or what would make you pay.</p>
          <Link to="/#feedback" className="mt-2 inline-block text-[14px] font-bold text-primary underline-offset-4 hover:underline">Give feedback (opens the sample results)</Link>
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
