import { ChevronDown, ExternalLink, MessageSquarePlus, Star } from 'lucide-react';
import FeedbackPanel from '@/components/results/FeedbackPanel';
import feedback from '@/data/testerFeedback.json';
import changelog from '@/data/changelog.json';

// Feedback from the Stranger Builds Slack, labelled apart from the platform reviews
// so the platform count above stays exactly what testers left there.
const slack = changelog.filter((item) => item.source === 'Slack');

// /progress: every Stranger Builds "Trick or Feedback" review, in the tester's own words
// (spelling fixed only), with what we changed because of it (4 Nov). Testers are
// anonymous on Stranger Builds, so each one is "A hackathon builder (anonymous)". Slack
// messages follow under "Hackathon Slack messages". Ends with "Please leave a review":
// the same feedback form as home and results, so there is one form, not two.
const fmt = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

const REPO = 'https://github.com/D3lK1ch1/ghost-fees';

// "Show the evidence": where the feedback was left, and the merged PRs (or agent commits)
// that made the change, each linking to GitHub so a judge can check it.
function Evidence({ where, date, rating, prs = [], commits = [] }) {
  return (
    <details className="group mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[15px] font-bold text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        Show the evidence
      </summary>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-4 pb-4 text-[14px] leading-snug">
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
        <dd className="flex flex-wrap gap-x-4 gap-y-1">
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

// Big, outlined labels at the top of each card: where the feedback came from, and
// what part of the app it is about.
function Labels({ source, about, date, who, score }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-primary/70 bg-primary/10 px-2.5 py-1 text-[14px] font-bold text-foreground">
        <span className="text-[11.5px] uppercase tracking-wide text-primary">From</span> {source}
      </span>
      {about && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#5ee6c8]/70 bg-[#5ee6c8]/10 px-2.5 py-1 text-[14px] font-bold text-foreground">
          <span className="text-[11.5px] uppercase tracking-wide text-[#5ee6c8]">About</span> {about}
        </span>
      )}
      {score ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-white/30 px-2.5 py-1 text-[14px] font-bold text-foreground" aria-label={`Would recommend it: ${score} of 5`}>
          <span className="inline-flex gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={i <= score ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4 text-white/25'} />)}
          </span>
          {score}/5
        </span>
      ) : null}
      <span className="mt-1 w-full text-[14px] text-muted-foreground">{fmt(date)} · {who}</span>
    </div>
  );
}

// The original feedback as it was left (portal or Slack), shown on the card itself.
function Photo({ src, where }) {
  if (!src) return null;
  return (
    <figure className="mt-4">
      <figcaption className="mb-2 text-[12.5px] font-bold uppercase tracking-wider text-primary">📸 The original, as left in the {where}</figcaption>
      <a href={src} target="_blank" rel="noreferrer" className="block max-w-md overflow-hidden rounded-xl border-2 border-white/15">
        <img src={src} alt={`Screenshot of the original feedback in the ${where}`} loading="lazy" className="w-full" />
      </a>
    </figure>
  );
}

function Line({ label, text }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15.5px] leading-relaxed text-foreground">&ldquo;{text}&rdquo;</p>
    </div>
  );
}

export default function FeedbackBoard() {
  const avg = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  return (
    <section id="feedback" className="mt-8 scroll-mt-24" aria-labelledby="feedback-board">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="feedback-board" className="font-heading text-[24px] font-bold text-foreground">Feedback board</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Every review from Trick or Feedback, where the Stranger Builds Duck sends another hackathon builder to try our app. Reviewers are anonymous there. Their words, unedited.
          </p>
          <p className="mt-2 text-[15px] font-semibold text-foreground">
            {feedback.length} reviews · {avg.toFixed(1)} of 5 · {feedback.filter((item) => item.did).length} of {feedback.length} acted on
          </p>
        </div>
        <a href="#leave-review" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[15px] font-semibold text-primary-foreground">
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Leave a review
        </a>
      </div>

      <ul className="mt-5 space-y-5">
        {feedback.map((item, index) => (
          <li key={index} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <Labels source="Hackathon portal review" about={item.about} date={item.date} who="A hackathon builder (anonymous)" score={item.rating} />
            <div className="mt-4 space-y-3">
              <Line label="One change" text={item.change} />
              <Line label="Trick" text={item.trick} />
              <Line label="Treat" text={item.treat} />
            </div>
            <Photo src={item.photo} where="hackathon portal" />
            {item.did && (
              <p className="mt-4 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-4 py-3 text-[15px] leading-relaxed text-foreground">
                <span className="font-semibold text-[#5ee6c8]">What we changed: </span>{item.did}
              </p>
            )}
            <Evidence where="Stranger Builds platform, Trick or Feedback review" date={item.date} rating={item.rating} prs={item.prs} />
          </li>
        ))}
      </ul>

      {slack.length > 0 && (
        <div className="mt-12">
          <h3 className="font-heading text-[22px] font-bold text-foreground">Hackathon Slack messages</h3>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">Builders and mentors in the Stranger Builds Slack. Not counted in the {feedback.length} platform reviews above.</p>
          <ul className="mt-5 space-y-5">
            {slack.map((item, index) => (
              <li key={`${item.date}-${index}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                <Labels source="Hackathon Slack message" about={item.about} date={item.date} who={item.who} />
                <p className="mt-4 text-[15.5px] leading-relaxed text-foreground">&ldquo;{item.said}&rdquo;</p>
                <Photo src={item.photo} where="hackathon Slack" />
                <p className="mt-4 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-4 py-3 text-[15px] leading-relaxed text-foreground">
                  <span className="font-semibold text-[#5ee6c8]">What we changed: </span>{item.changed}
                </p>
                <Evidence where={item.where || 'Stranger Builds Slack'} date={item.date} prs={item.prs} commits={item.commits} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div id="leave-review" className="mt-12 scroll-mt-24 rounded-3xl border border-primary/30 bg-primary/[0.04] p-5 sm:p-6">
        <h3 className="font-heading text-[22px] font-bold text-foreground">Please leave a review</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Tried Ghost Fees? Tell us what worked and what to change. We read every one and it shows up here when we act on it.</p>
        <FeedbackPanel onHome />
      </div>
    </section>
  );
}
