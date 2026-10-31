import { Link } from 'react-router-dom';
import GhostMark from './GhostMark';

export default function BrandHeader({ right }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
          <GhostMark className="h-5 w-5 text-white" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">Ghost Fees</span>
      </Link>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}