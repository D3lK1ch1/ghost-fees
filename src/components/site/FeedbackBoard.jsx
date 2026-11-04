import { MessageSquarePlus, Star } from 'lucide-react';
import FeedbackPanel from '@/components/results/FeedbackPanel';
import feedback from '@/data/testerFeedback.json';

// /progress: every Stranger Builds "Trick or Feedback" review, in the tester's own words
// (spelling fixed only), with what we changed because of it (4 Nov). Testers are
// anonymous on Stranger Builds, so each one is just "A tester". Ends with "Please leave a
// review": the same feedback form as home and results, so there is one form, not two.
const fmt = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

function Stars({ n }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Would recommend it: ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={i <= n ? 'h-3.5 w-3.5 fill-primary text-primary' : 'h-3.5 w-3.5 text-white/20'} aria-hidden="true" />)}
    </span>
  );
}

function Line({ label, text }) {
  if (!text) return null;
  return (
    <p className="text-[14px] leading-snug text-foreground/90">
      <span className="mr-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      &ldquo;{text}&rdquo;
    </p>
  );
}

export default function FeedbackBoard() {
  const avg = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  return (
    <section id="feedback" className="mt-8 scroll-mt-24" aria-labelledby="feedback-board">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="feedback-board" className="text-[18px] font-semibold text-foreground">Feedback board</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Every review from Stranger Builds testers, in their words. {feedback.length} testers · {avg.toFixed(1)} of 5 · {feedback.filter((item) => item.did).length} of {feedback.length} acted on.
          </p>
        </div>
        <a href="#leave-review" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[14px] font-semibold text-primary-foreground">
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Leave a review
        </a>
      </div>

      <ul className="mt-3 space-y-3">
        {feedback.map((item, index) => (
          <li key={index} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-2 text-[12.5px] text-muted-foreground">
              <span>{fmt(item.date)} · A tester</span>
              <Stars n={item.rating} />
            </div>
            <div className="mt-2 space-y-1.5">
              <Line label="One change" text={item.change} />
              <Line label="Trick" text={item.trick} />
              <Line label="Treat" text={item.treat} />
            </div>
            {item.did && (
              <p className="mt-3 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-3 py-2 text-[14px] leading-snug text-foreground">
                <span className="font-semibold text-[#5ee6c8]">What we changed: </span>{item.did}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div id="leave-review" className="mt-8 scroll-mt-24 rounded-3xl border border-primary/30 bg-primary/[0.04] p-5">
        <h3 className="text-[18px] font-semibold text-foreground">Please leave a review</h3>
        <p className="mt-1 text-[14px] text-muted-foreground">Tried Ghost Fees? Tell us what worked and what to change. We read every one and it shows up here when we act on it.</p>
        <FeedbackPanel onHome />
      </div>
    </section>
  );
}
