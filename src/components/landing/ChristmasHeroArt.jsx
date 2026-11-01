import SeasonToggle from '@/components/site/SeasonToggle';
import RoomClock from '@/components/landing/RoomClock';
import { ThoughtBubble } from '@/components/site/Bubbles';
import { XMAS } from '@/lib/ghostFees/christmasArt';

// Ghosts of Christmas hero: the living room at 11:59 on Christmas Eve, the Sleeper
// dozing off, and a Winter / Summer toggle.
export default function ChristmasHeroArt({ season, setSeason }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SeasonToggle season={season} setSeason={setSeason} />
      <div className="relative mt-3 w-full overflow-hidden rounded-[28px] border border-primary/30 shadow-[0_12px_60px_hsl(var(--primary)/0.18)]">
        <img src={XMAS.room(season)} alt="A cosy living room with a Christmas tree late on Christmas Eve" width={560} className="h-[280px] w-full object-cover object-[50%_35%] sm:h-[320px]" />
        <ThoughtBubble className="absolute left-3 top-3 max-w-[190px]">
          Bah, humbug. One more streaming service can&apos;t hurt.
        </ThoughtBubble>
        <RoomClock />
        <img src={XMAS.sleeper(season)} alt="The Sleeper, a ghost asleep in bed" width={320} className="absolute -bottom-2 -right-2 h-auto w-[150px] sm:w-[170px]" />
      </div>
    </div>
  );
}