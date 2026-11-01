import { Link } from 'react-router-dom';
import { DISCLAIMER } from '@/data/founders';

export default function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-5 pb-12 pt-12 text-center leading-relaxed text-muted-foreground sm:px-8">
      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px]">
        <Link to="/about" className="font-bold text-primary underline-offset-4 hover:underline">About us</Link>
        <Link to="/progress" className="font-bold text-primary underline-offset-4 hover:underline">Our progress</Link>
        <Link to="/privacy" className="font-bold text-primary underline-offset-4 hover:underline">Privacy</Link>
      </p>
      <p className="mt-3 text-[13px]">{DISCLAIMER} CSV statements never leave your browser.</p>
      <p className="mt-1.5 text-[12px] text-muted-foreground/80">
        Original art and animations. Type: Fredoka, Nunito and VT323 (Google Fonts, open licences).
      </p>
    </footer>
  );
}
