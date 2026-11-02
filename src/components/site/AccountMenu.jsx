import { Link, useLocation } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAllowance } from '@/lib/AllowanceContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Top right of every page, like a pro app: Log in (or your account and plan) and Upgrade.
// "Pro" only shows for people who actually paid (or admins), not for the free beta.
export default function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const { status } = useAllowance();
  const { pathname, hash } = useLocation();
  const pro = Boolean(user?.role === 'admin' || status?.paid);
  const returnTo = encodeURIComponent(pathname + hash);
  const name = user?.full_name || user?.email || 'You';

  const upgrade = !pro && pathname !== '/upgrade' && (
    <Link
      to="/upgrade"
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-[14.5px] font-bold text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.35)] transition-transform hover:-translate-y-0.5"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span className="max-sm:sr-only">Upgrade</span>
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <div data-tour="account" className="flex shrink-0 items-center gap-1.5">
        <Link to={`/login?returnTo=${returnTo}`} className="inline-flex h-9 items-center rounded-full border border-border bg-card/60 px-3.5 text-[14.5px] font-bold text-foreground hover:border-primary/60">
          Log in
        </Link>
        {upgrade}
      </div>
    );
  }

  return (
    <div data-tour="account" className="flex shrink-0 items-center gap-1.5">
      {upgrade}
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Your account" className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/60 pl-1 pr-2.5 hover:border-primary/60">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[14px] font-bold uppercase text-primary-foreground">{name.slice(0, 1)}</span>
          <span className={pro ? 'text-[13.5px] font-bold text-primary' : 'text-[13.5px] font-bold text-muted-foreground'}>{pro ? 'Pro' : 'Free'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal">
            <span className="block truncate text-[14px] font-bold">{name}</span>
            <span className="text-[13px] text-muted-foreground">{pro ? 'Pro plan' : 'Free plan'}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!pro && <DropdownMenuItem asChild><Link to="/upgrade"><Sparkles className="mr-2 h-4 w-4" /> Upgrade to Pro</Link></DropdownMenuItem>}
          <DropdownMenuItem asChild><Link to="/progress">Your progress</Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout()}><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
