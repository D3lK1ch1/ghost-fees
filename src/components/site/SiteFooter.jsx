import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-10 pt-10 text-[11.5px] leading-relaxed text-muted-foreground/75 sm:px-8">
      <p>Factual information only, not financial advice. CSV statements never leave your browser.</p>
      <p className="mt-1">
        <Link to="/progress" className="font-bold text-primary underline-offset-4 hover:underline">Our progress</Link>
      </p>
      <p className="mt-1">
        Original art and animations. Type: Fredoka, Nunito and VT323 (Google Fonts, open licences).
      </p>
    </footer>
  );
}