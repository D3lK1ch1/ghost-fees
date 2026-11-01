import { Link } from 'react-router-dom';
import ReceiptGhost from './ReceiptGhost';
import ThemeSwitcher from './ThemeSwitcher';

export default function BrandHeader({ right }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center gap-2 px-5 py-5 sm:px-8">
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <ReceiptGhost width={28} className="animate-bob" />
        <span className="whitespace-nowrap text-[23px] font-extrabold leading-none tracking-[-0.01em] text-foreground" style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
          Ghost <span className="text-[#5ee6c8]">Fees</span>
        </span>
      </Link>
      <div className="flex flex-1 justify-center">
        <ThemeSwitcher />
      </div>
      {right ? <div className="flex shrink-0 items-center">{right}</div> : null}
    </header>
  );
}