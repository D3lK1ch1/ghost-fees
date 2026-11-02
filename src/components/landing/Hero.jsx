import { Ghost, Lock, Receipt, TrendingUp, Upload } from 'lucide-react';
import { useAllowance } from '@/lib/AllowanceContext';
import GhostMark from '@/components/site/GhostMark';
import GhostItOffer from '@/components/landing/GhostItOffer';
import ExHero from '@/components/landing/ExHero';
import ChristmasHeroArt from '@/components/landing/ChristmasHeroArt';
import { useTheme } from '@/lib/ThemeContext';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { SEASON_KEY, SEASONS } from '@/lib/ghostFees/christmasArt';

// The three kinds of ghost, as bright tappable chips (testers: "make the buttons pop").
// Each has its own colour and icon, and opens the sample so you can see one.
const TAGS = [
  { label: 'Forgotten subscriptions', Icon: Ghost, colour: '#6EF0C2' },
  { label: 'Sneaky fees', Icon: Receipt, colour: '#FFB86B' },
  { label: 'Price creep', Icon: TrendingUp, colour: '#FF9BC2' },
];

export default function Hero({ onSample, onUpload }) {
  const { charging } = useAllowance();
  const { theme } = useTheme();
  const [season, setSeason] = useSavedChoice(SEASON_KEY, SEASONS, 'winter');
  if (theme.key === 'ex') return <ExHero theme={theme} onSample={onSample} onUpload={onUpload} />;
  return (
    <section className="mx-auto flex w-full max-w-3xl animate-rise flex-col items-center px-5 pb-16 pt-6 text-center sm:px-8">
      <h2 className="mb-4 font-heading text-[1.6rem] font-bold leading-none text-white [text-shadow:2px_0_0_#000,-2px_0_0_#000,0_2px_0_#000,0_-2px_0_#000,2px_2px_0_#000,-2px_2px_0_#000,2px_-2px_0_#000,-2px_-2px_0_#000] sm:text-[1.9rem]">
        Ghost Fees
      </h2>

      {theme.key === 'christmas' ? (
        <ChristmasHeroArt season={season} setSeason={setSeason} />
      ) : (
        <div className="animate-float rounded-full p-6 shadow-[0_0_80px_hsl(var(--primary)/0.22)]">
          <GhostMark className="h-24 w-24 text-foreground sm:h-28 sm:w-28" eyeColor="#150e28" />
        </div>
      )}

      <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] text-foreground sm:text-[4rem]">
        {theme.headline}
      </h1>
      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
        {theme.subhead}
      </p>

      <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSample}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[17px] font-bold text-primary-foreground shadow-[0_8px_40px_hsl(var(--primary)/0.35)] transition-transform hover:-translate-y-0.5"
        >
          <GhostMark className="h-5 w-5 text-primary-foreground" eyeColor="hsl(30 100% 62%)" />
          Try a sample statement
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/70 bg-primary/10 px-6 py-3.5 text-[15px] font-bold text-foreground shadow-[0_0_24px_hsl(var(--primary)/0.18)] transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/20"
        >
          <Upload className="h-4 w-4" strokeWidth={2.4} />
          Upload my CSV or PDF
        </button>
      </div>
      <GhostItOffer className="mx-auto mt-4" />

      <p className="mt-6 flex items-center gap-2 text-[14px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
        CSVs never leave your browser. PDFs are uploaded privately so they can be read. {charging ? 'Sign in for 3 free scans (add all your accounts in one go). The sample needs no sign-in.' : 'Free while we’re in beta, no sign-in.'}
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-2.5">
        {TAGS.map(({ label, Icon, colour }) => (
          <button
            key={label}
            type="button"
            onClick={onSample}
            title={`See ${label.toLowerCase()} on a sample`}
            className="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ borderColor: colour, background: `${colour}26`, boxShadow: `0 0 18px ${colour}55` }}
          >
            <Icon className="h-4 w-4" strokeWidth={2.4} style={{ color: colour }} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}