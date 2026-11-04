import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import FeedbackPanel from '@/components/results/FeedbackPanel';
import feedback from '@/data/testerFeedback.json';

// Home page, near the end (4 Nov): a link to Our progress (what testers said and what we
// changed), then the same feedback form the results page uses, so anyone can add theirs.
export default function HomeFeedback() {
  const avg = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  return (
    <section id="leave-feedback" className="mx-auto mt-10 w-full max-w-2xl scroll-mt-24 px-5 sm:px-0" aria-labelledby="home-feedback-title">
      <p className="text-center text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary">Built with your feedback</p>
      <h2 id="home-feedback-title" className="mt-1 text-center text-[22px] font-semibold text-foreground">Tell us what to fix next</h2>
      <Link to="/progress#feedback" className="group mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-primary/60">
        <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={i <= Math.round(avg) ? 'h-3.5 w-3.5 fill-primary text-primary' : 'h-3.5 w-3.5 text-white/20'} />)}
        </span>
        <span className="min-w-0 flex-1 text-[14.5px] text-foreground">
          <b className="font-semibold">{feedback.length} testers</b> told us what to change. See what they said and what we changed.
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-primary">Our progress <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </Link>
      <FeedbackPanel onHome />
    </section>
  );
}
