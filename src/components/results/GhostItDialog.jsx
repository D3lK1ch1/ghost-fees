import { Calculator, Copy, ListChecks, MailCheck, MessageCircle, Scissors, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { GHOST_IT_MASCOT, GHOST_IT_PRICE, GHOST_IT_PROFILE, GHOST_IT_THUMBS } from '@/lib/ghostFees/ghostItAgent';

// "Meet Ghost It": what makes our chat agent special, what it does, and the free
// try, in one pop-up. Opened from "What is Ghost It?" on the Ghost It card and strips.
const FEATURES = [
  { Icon: MessageCircle, title: 'Lives in your chat', line: 'Message it any time in ASI:One. No app to open, nothing to upload.' },
  { Icon: Calculator, title: 'Shows the maths', line: 'Every line worked out: $8.99/mo x 12 = $107.88/yr, then the total.' },
  { Icon: Copy, title: 'Spots double-ups', line: '3 streaming apps or 2 cloud plans? It says which, and what to do.' },
  { Icon: Scissors, title: 'Official cancel steps', line: 'The real cancel page and steps. It never guesses a link.' },
  { Icon: MailCheck, title: 'A ready cancel email', line: 'Copy, paste, send.' },
  { Icon: ListChecks, title: 'Checks it stopped', line: 'Keeps your Ghost List and asks after 7 days if the charge really stopped.' },
];

export default function GhostItDialog({ open, onClose, onMessage }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl border-2 border-[#8FB8FF]/50 bg-popover p-5 sm:p-6">
        <div className="text-center">
          <img src={GHOST_IT_MASCOT} alt="Ghost It, a friendly ghost waving with a chat bubble" width={150} height={150} className="motion-safe:animate-float mx-auto h-[150px] w-[150px] object-contain drop-shadow-[0_0_24px_rgba(143,184,255,0.35)]" />
          <DialogTitle className="mt-3 font-heading text-[26px] font-bold text-foreground">Meet Ghost It</DialogTitle>
          <p className="mt-1 text-[15px] leading-snug text-muted-foreground">Our AI agent on Fetch.ai&apos;s ASI:One. Ghost Fees reads your statement; Ghost It keeps going with you in chat.</p>
        </div>
        <ul className="mt-4 grid gap-2">
          {FEATURES.map(({ Icon, title, line }) => (
            <li key={title} className="flex gap-3 rounded-2xl border border-border bg-background/40 px-3.5 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8FB8FF]/20 text-[#8FB8FF]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
              <span className="min-w-0"><b className="block text-[15px] text-foreground">{title}</b><span className="block text-[14px] leading-snug text-muted-foreground">{line}</span></span>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-2xl border-2 border-primary/60 bg-primary/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={GHOST_IT_THUMBS} alt="" className="h-14 w-14 shrink-0 object-contain" />
            <div>
              <p className="flex items-center gap-1.5 text-[15px] font-bold text-foreground"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Free trial: 1 try</p>
              <p className="mt-0.5 text-[14px] leading-snug text-muted-foreground">{GHOST_IT_PRICE}</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => { onMessage?.(); onClose(); }} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#8FB8FF] text-[16px] font-bold text-[#0f1730]">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> Message Ghost It
        </button>
        <a href={GHOST_IT_PROFILE} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-[13.5px] font-bold text-muted-foreground underline-offset-4 hover:underline">Open Ghost It&apos;s page on Agentverse</a>
      </DialogContent>
    </Dialog>
  );
}
