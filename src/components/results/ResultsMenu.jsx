import { MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Top-right actions, kept in one quiet menu so the page stays calm.
export default function ResultsMenu({ onRestart, onClear }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="More actions"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-foreground transition-colors hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-popover">
        <DropdownMenuItem onClick={onRestart} className="gap-2 text-[13px] font-semibold">
          <RotateCcw className="h-4 w-4" />
          Scan another statement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onClear} className="gap-2 text-[13px] font-semibold">
          <Trash2 className="h-4 w-4" />
          Clear my data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}