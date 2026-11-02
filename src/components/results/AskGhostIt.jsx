import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { getSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';

// "Ask Ghost It": hands subscriptions to our chat agent on ASI:One (a separate
// product, judged inside ASI:One). Copies "@ghostit Netflix $16.99/mo, ...",
// opens asi1.ai and counts the click (count only, nothing about the person).
const isLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export function ghostItText(items) {
  const parts = items
    .filter((item) => item?.merchant && Number(item.monthly) > 0)
    .slice(0, 6)
    .map((item) => `${item.merchant} $${Number(item.monthly).toFixed(2)}/mo`);
  return parts.length ? `@ghostit ${parts.join(', ')}` : '';
}

export default function AskGhostIt({ items, label = 'Ask Ghost It', small = false, className }) {
  const text = ghostItText(items || []);
  if (!text) return null;
  const go = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied. Paste it in ASI:One', description: text });
    } catch {
      toast({ title: 'Type this in ASI:One', description: text });
    }
    window.open('https://asi1.ai', '_blank', 'noopener');
    if (!isLocal()) base44.functions.invoke('logEvent', { session_id: getSessionId(), event_type: 'ask_ghostit_click' }).catch(() => {});
  };
  return (
    <button
      type="button"
      onClick={go}
      title="Our chat agent on ASI:One shows the maths and the cancel steps"
      className={cn(small
        ? 'inline-flex items-center gap-1 text-[12px] font-bold text-primary underline-offset-4 hover:underline'
        : 'inline-flex items-center gap-2 rounded-full border border-[#5ee6c8]/60 px-4 py-2 text-[13.5px] font-bold text-foreground hover:bg-[#5ee6c8]/10', className)}
    >
      <span aria-hidden="true">🤖</span> {label}
    </button>
  );
}
