import { ExternalLink, LogIn } from 'lucide-react';

// ASI:One only delivers messages from signed-in people. Signed out, testers land on
// ASI:One's "Hey There... Get Started" setup screen and Ghost It never gets the message
// (found in testing, 3 Nov). So this comes first, before any Ghost It step.
export default function AsiSignInFirst({ className = '' }) {
  return (
    <div className={`rounded-2xl border-2 border-[#8FB8FF] bg-[#8FB8FF]/10 px-4 py-3.5 ${className}`}>
      <p className="flex items-center gap-2 text-[15.5px] font-bold text-foreground">
        <LogIn className="h-5 w-5 shrink-0 text-[#8FB8FF]" aria-hidden="true" /> First: sign in to ASI:One (free)
      </p>
      <p className="mt-1 text-[14px] leading-snug text-muted-foreground">
        Ghost It lives on ASI:One. It can only reply once you&apos;re signed in. See &ldquo;Hey There&rdquo; and &ldquo;Get Started&rdquo;? That&apos;s ASI:One&apos;s setup. Finish it, then open Ghost It again.
      </p>
      <a
        href="https://asi1.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#8FB8FF] px-4 py-2 text-[14px] font-bold text-[#0f1730]"
      >
        Sign in to ASI:One <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}
