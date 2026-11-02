import { Link } from 'react-router-dom';
import ReceiptGhost from './ReceiptGhost';
import ThemeSwitcher from './ThemeSwitcher';
import AccountMenu from './AccountMenu';

// Logo, theme switcher, then Log in / your plan and Upgrade on the right (like a pro app).
// On phones the theme switcher drops to its own row so nothing gets squashed.
export default function BrandHeader({ right }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-5 py-4 sm:flex-nowrap sm:px-8 sm:py-5">
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <ReceiptGhost width={28} className="animate-bob" />
        <span className="whitespace-nowrap text-[23px] font-extrabold leading-none tracking-[-0.01em] text-foreground" style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
          Ghost <span className="text-[#5ee6c8]">Fees</span>
        </span>
      </Link>
      <div className="order-last flex w-full justify-center sm:order-none sm:w-auto sm:flex-1">
        <ThemeSwitcher />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0">
        {right}
        <AccountMenu />
      </div>
    </header>
  );
}
