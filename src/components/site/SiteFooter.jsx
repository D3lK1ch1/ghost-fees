import { Link } from 'react-router-dom';
import { DISCLAIMER } from '@/data/founders';

export default function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-5 pb-12 pt-12 text-center leading-relaxed text-muted-foreground sm:px-8">
      {/* The page links moved to the nav bar at the top (4 Nov). The footer keeps the legal bits. */}
      <p className="text-[13.5px]">
        <Link to="/privacy" className="font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Privacy</Link>
      </p>
      <p className="mt-3 text-[14px]">{DISCLAIMER} CSV statements never leave your browser.</p>
      <p className="mt-1.5 text-[13px] text-muted-foreground/80">
        Original art and animations. Type: Inter, Baloo 2 and VT323 (Google Fonts, open licences).
      </p>
    </footer>
  );
}
