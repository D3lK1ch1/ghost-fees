import { ChevronDown, ExternalLink, MessageSquarePlus } from 'lucide-react';
import FeedbackPanel from '@/components/results/FeedbackPanel';
import feedback from '@/data/testerFeedback.json';
import changelog from '@/data/changelog.json';

// Feedback from the Stranger Builds Slack, labelled apart from the platform reviews
// so the platform count above stays exactly what testers left there.
const slack = changelog.filter((item) => item.source === 'Slack');

// /progress: every Stranger Builds "Trick or Feedback" review, in the tester's own words
// (spelling fixed only), with what we changed because of it (4 Nov). Testers are
// anonymous on Stranger Builds, so each one is "A hackathon builder (anonymous)". Slack feedback is listed
// after them under "From Slack". Ends with "Please leave a
// review": the same feedback form as home and results, so there is one form, not two.
const fmt = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

const REPO = 'https://github.com/D3lK1ch1/ghost-fees';

// "Show the evidence": where the feedback was left, and the merged PRs (or agent commits)
// that made the change, each linking to GitHub so a judge can check it.
function Evidence({ where, date, rating, photo, prs = [], commits = [] }) {
  return (
    <details className="group mt-2 rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-foreground/90 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        Show the evidence
      </summary>
      {photo && (
        <a href={photo} target="_blank" rel="noreferrer" className="mx-3 mb-2 block max-w-sm overflow-hidden rounded-lg border border-white/10">
          <img src={photo} alt={`Screenshot of the original feedback, ${where}`} loading="lazy" className="w-full" />
        </a>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 pb-3 text-[13px]">
        <dt className="text-muted-foreground">Where</dt>
        <dd className="text-foreground">{where}</dd>
        <dt className="text-muted-foreground">Date</dt>
        <dd className="text-foreground">{fmt(date)}</dd>
        {rating ? (
          <>
            <dt className="text-muted-foreground">Score</dt>
            <dd className="text-foreground">Would recommend it: {rating} of 5</dd>
          </>
        ) : null}
        <dt className="text-muted-foreground">Proof</dt>
        <dd className="flex flex-wrap gap-x-3 gap-y-1">
          {prs.map((n) => (
            <a key={n} href={`${REPO}/pull/${n}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#5ee6c8] underline-offset-4 hover:underline">
              PR #{n} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ))}
          {commits.map((c) => (
            <a key={c} href={`${REPO}/commit/${c}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#5ee6c8] underline-offset-4 hover:underline">
              Ghost It commit {c} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ))}
        </dd>
      </dl>
    </details>
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
            Every review from Trick or Feedback, where the Stranger Builds Duck assigns another hackathon builder to try our app. The platform keeps reviewers anonymous. Their words, unedited. {feedback.length} reviews · {avg.toFixed(1)} of 5 · {feedback.filter((item) => item.did).length} of {feedback.length} acted on.
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
              <span>{fmt(item.date)} · A hackathon builder (anonymous) · <span className="font-semibold text-foreground/80">Trick or Feedback</span></span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[12px] font-semibold text-foreground">Score {item.rating}/5</span>
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
            <Evidence where="Stranger Builds platform, Trick or Feedback review" date={item.date} rating={item.rating} photo={item.photo} prs={item.prs} />
          </li>
        ))}
      </ul>

      {slack.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[16px] font-semibold text-foreground">From Slack</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">Builders and mentors in the Stranger Builds Slack. Not counted in the {feedback.length} platform reviews above.</p>
          <ul className="mt-3 space-y-3">
            {slack.map((item, index) => (
              <li key={`${item.date}-${index}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="text-[12.5px] text-muted-foreground">
                  {fmt(item.date)} · {item.who} · <span className="font-semibold text-foreground/80">From Slack</span> · {item.product}
                </div>
                <p className="mt-2 text-[14px] leading-snug text-foreground/90">&ldquo;{item.said}&rdquo;</p>
                <p className="mt-3 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-3 py-2 text-[14px] leading-snug text-foreground">
                  <span className="font-semibold text-[#5ee6c8]">What we changed: </span>{item.changed}
                </p>
                <Evidence where={item.where || 'Stranger Builds Slack'} date={item.date} photo={item.photo} prs={item.prs} commits={item.commits} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div id="leave-review" className="mt-8 scroll-mt-24 rounded-3xl border border-primary/30 bg-primary/[0.04] p-5">
        <h3 className="text-[18px] font-semibold text-foreground">Please leave a review</h3>
        <p className="mt-1 text-[14px] text-muted-foreground">Tried Ghost Fees? Tell us what worked and what to change. We read every one and it shows up here when we act on it.</p>
        <FeedbackPanel onHome />
      </div>
    </section>
  );
}
