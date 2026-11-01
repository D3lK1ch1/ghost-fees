import { useGhostName } from '@/hooks/use-ghost-name';
import { cn } from '@/lib/utils';

// "Name your ghost": a small text field. Saved in this browser only.
export default function GhostNameField({ className }) {
  const [, typed, setName] = useGhostName();
  return (
    <label className={cn('flex items-center gap-2 text-[12.5px] font-bold text-muted-foreground', className)}>
      Name your ghost
      <input
        value={typed}
        onChange={(event) => setName(event.target.value)}
        placeholder="Boo"
        maxLength={20}
        aria-describedby="ghost-name-hint"
        className="w-[9.5rem] rounded-lg border border-border bg-background px-2 py-1 text-[13px] font-semibold text-foreground placeholder:text-muted-foreground/70"
      />
      <span id="ghost-name-hint" className="sr-only">Letters, numbers and spaces, up to 20 characters.</span>
    </label>
  );
}
