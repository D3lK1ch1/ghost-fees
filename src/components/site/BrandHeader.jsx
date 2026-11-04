import { Link, NavLink } from 'react-router-dom';
import ReceiptGhost from './ReceiptGhost';
import ThemeSwitcher from './ThemeSwitcher';
import AccountMenu from './AccountMenu';
import { cn } from '@/lib/utils';

// A proper nav bar (4 Nov, like Linear, Notion or Monzo): a slim sticky bar with the logo
// left, the page links in the middle (Videos and Privacy too), Log in and Upgrade right.
// The theme picker sits centred under it. Smaller screens: the links are one swipeable row.
const LINKS = [
  { to: '/ghostit', label: 'Ghost It', badge: 'AI' },   // the product first (4 Nov)
  { to: '/upgrade', label: 'Pricing' },
  { to: '/progress', label: 'Our progress' },
  { to: '/media', label: 'Media' },
  { to: '/about', label: 'About us' },
  { to: '/privacy', label: 'Privacy' },
];

function NavLinks({ className = '' }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to.includes('#')}
              className={({ isActive }) => cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-semibold transition-colors',
                isActive && !link.to.includes('#') ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
              {link.badge && <span className="ml-1.5 rounded-full bg-[#5ee6c8]/15 px-1.5 py-px align-[1px] text-[10.5px] font-semibold tracking-wide text-[#5ee6c8]">{link.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function BrandHeader({ right }) {
  return (
    <>
      {/* A slim bar that stays at the top while you scroll, like a pro web app. */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-3 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <ReceiptGhost width={26} className="animate-bob" />
            <span className="whitespace-nowrap text-[21px] font-extrabold leading-none tracking-[-0.01em] text-foreground" style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
              Ghost <span className="text-[#5ee6c8]">Fees</span>
            </span>
          </Link>
          <NavLinks className="hidden flex-1 justify-center lg:flex" />
          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0">
            {right}
            <AccountMenu />
          </div>
        </div>
        <NavLinks className="overflow-x-auto px-3 pb-2 lg:hidden" />
      </header>
      {/* The theme picker sits under the bar, centred. */}
      <div className="mx-auto mt-3 flex w-full max-w-5xl justify-center px-5 sm:px-8">
        <ThemeSwitcher />
      </div>
    </>
  );
}
