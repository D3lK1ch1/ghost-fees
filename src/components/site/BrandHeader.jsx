import { Link, NavLink } from 'react-router-dom';
import ReceiptGhost from './ReceiptGhost';
import ThemeSwitcher from './ThemeSwitcher';
import AccountMenu from './AccountMenu';
import { cn } from '@/lib/utils';

// A proper nav bar (4 Nov, like Linear, Notion or Monzo): logo left, a few page links in
// the middle, Log in and Upgrade right. The theme picker sits centred on its own row under
// it. Phones: the links become one swipeable row under the logo.
const LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/progress', label: 'Our progress' },
  { to: '/ghostit', label: 'Ghost It' },
  { to: '/upgrade', label: 'Pricing' },
];

function NavLinks({ className = '' }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-semibold transition-colors',
                isActive ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function BrandHeader({ right }) {
  return (
    <header className="mx-auto w-full max-w-5xl px-5 pt-4 sm:px-8 sm:pt-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <ReceiptGhost width={28} className="animate-bob" />
          <span className="whitespace-nowrap text-[23px] font-extrabold leading-none tracking-[-0.01em] text-foreground" style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
            Ghost <span className="text-[#5ee6c8]">Fees</span>
          </span>
        </Link>
        <NavLinks className="hidden flex-1 justify-center md:flex" />
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          {right}
          <AccountMenu />
        </div>
      </div>
      <NavLinks className="-mx-5 mt-3 overflow-x-auto px-4 md:hidden" />
      <div className="mt-3 flex justify-center border-t border-white/[0.06] pt-3">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
