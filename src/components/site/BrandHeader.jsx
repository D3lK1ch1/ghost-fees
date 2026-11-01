import { Link } from 'react-router-dom';
import GhostMark from './GhostMark';
import ThemeSwitcher from './ThemeSwitcher';

export default function BrandHeader({ right }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center gap-2 px-5 py-5 sm:px-8">
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <GhostMark className="h-7 w-7 text-foreground" eyeColor="#150e28" />
        <span className="whitespace-nowrap font-heading text-[19px] font-semibold text-foreground">Ghost Fees</span>
      </Link>
      <div className="flex flex-1 justify-center">
        <ThemeSwitcher />
      </div>
      {right ? <div className="flex shrink-0 items-center">{right}</div> : null}
    </header>
  );
}