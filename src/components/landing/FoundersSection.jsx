import { Link } from 'react-router-dom';
import { FOUNDERS, WHY_LINE } from '@/data/founders';
import FounderCard from './FounderCard';

// "Meet the founders" on the landing page, below the hero.
export default function FoundersSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 pb-12 sm:px-8" aria-label="Meet the founders">
      <h2 className="text-center font-heading text-[22px] font-semibold text-foreground">Meet the founders</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FOUNDERS.map((founder) => <FounderCard key={founder.key} founder={founder} />)}
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-[14px] leading-relaxed text-muted-foreground">{WHY_LINE}</p>
      <p className="mt-2 text-center">
        <Link to="/about" className="text-[14px] font-bold text-primary underline-offset-4 hover:underline">Read our story</Link>
      </p>
    </section>
  );
}