import SeasonToggle from '@/components/site/SeasonToggle';
import { XMAS } from '@/lib/ghostFees/christmasArt';

// Ghosts of Christmas hero: the living room at 11:59 on Christmas Eve, the Sleeper
// dozing off, and a Winter / Summer toggle.
export default function ChristmasHeroArt({ season, setSeason }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SeasonToggle season={season} setSeason={setSeason} />
      <div className="relative mt-3 w-full overflow-hidden rounded-[28px] border border-primary/30 shadow-[0_12px_60px_hsl(var(--primary)/0.18)]">
        <img src={XMAS.room(season)} alt="A cosy living room with a Christmas tree late on Christmas Eve" width={560} className="h-[280px] w-full object-cover object-[50%_35%] sm:h-[320px]" />
        <p className="absolute left-3 top-3 max-w-[170px] rounded-[20px] bg-white px-3 py-2 text-left text-[12.5px] font-bold leading-tight text-[#14301f] shadow-lg">
          Bah, humbug. One more streaming service can&apos;t hurt.
        </p>
        <div className="absolute bottom-3 left-3 rounded-2xl border border-primary/40 bg-background/85 px-3 py-1.5 text-left">
          <div className="font-heading text-[22px] font-bold leading-none text-primary">11:59</div>
          <div className="text-[10.5px] font-semibold text-muted-foreground">24 December</div>
        </div>
        <img src={XMAS.sleeper(season)} alt="The Sleeper, a ghost asleep in bed" width={320} className="absolute -bottom-2 -right-2 h-auto w-[150px] sm:w-[170px]" />
      </div>
    </div>
  );
}
